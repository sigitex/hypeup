// oxlint-disable complexity
import type { PluginObj, NodePath } from "@babel/core"
import * as t from "@babel/types"
import { addNamed } from "@babel/helper-module-imports"
import {
  buildDslPrimitives,
  type Primitive,
  type CssPropertyPrimitive,
  type PropConstantPrimitive,
  type ClassNameConstantPrimitive,
  type ElementConstantPrimitive,
} from "./buildDslPrimitives"
import type { HypeupExtension } from "./HypeupExtension"
import { kebab } from "./kebab"

const RUNTIME_MODULE = "@hypeup/runtime"

/** JS built-in constructors that should not be wrapped in lazy(). */
const JS_BUILTINS = new Set([
  "String",
  "Number",
  "Boolean",
  "Object",
  "Array",
  "Date",
  "Map",
  "Set",
  "Promise",
  "Error",
  "RegExp",
])

type ImportCache = Map<string, t.Identifier>
type PrimitivePath = NodePath<t.Identifier | t.MemberExpression>

export type HypeupBabelPluginOptions = {
  extensions?: HypeupExtension[]
}

/** Get or create a cached import for a helper. */
function getImport(
  path: NodePath,
  cache: ImportCache,
  name: string,
  module: string = RUNTIME_MODULE,
): t.Identifier {
  const cacheKey = `${module}:${name}`
  const existing = cache.get(cacheKey)
  if (existing) {
    return t.cloneNode(existing)
  }
  const id = addNamed(path, name, module)
  cache.set(cacheKey, id)
  return t.cloneNode(id)
}

/**
 * Collect member-expression chain segments from innermost object to outermost property.
 * e.g. `div.active.large(...)` with callee `div.active.large`:
 *   returns { root: "div", segments: ["active", "large"] }
 */
function collectChain(
  node: t.MemberExpression,
  root: t.Node,
): { segments: string[] } | null {
  const segments: string[] = []
  let current: t.Node = node

  while (current !== root) {
    if (!t.isMemberExpression(current) || !t.isIdentifier(current.property) || current.computed) {
      return null
    }
    segments.unshift(current.property.name)
    current = current.object
  }

  return { segments }
}

/** Wrap arguments in an ArrayExpression. */
function argsArray(args: t.Expression[]): t.ArrayExpression {
  return t.arrayExpression(args)
}

/** Create: helper(stringArg, arrayOfArgs) */
function helperCall(
  path: NodePath,
  cache: ImportCache,
  helper: string,
  args: t.Expression[],
): t.CallExpression {
  return t.callExpression(getImport(path, cache, helper), args)
}

export function hypeupBabelPlugin(options: HypeupBabelPluginOptions = {}): PluginObj {
  const table = buildDslPrimitives(options.extensions)
  const extensionRoots = new Set(
    (options.extensions ?? []).flatMap(extension => Object.keys(extension).map(name => name.split(".")[0])),
  )

  return {
    name: "hypeup",
    visitor: {
      Identifier(path: NodePath<t.Identifier>) {
        const { name } = path.node
        const primitive = table.get(name)
        if (!primitive && !extensionRoots.has(name)) {
          return
        }

        // Skip if locally bound
        if (path.scope.getBinding(name)) {
          return
        }

        // Skip non-reference positions
        if (!path.isReferencedIdentifier()) {
          return
        }

        // Per-file import cache stored on program state
        const state = path.hub as { _hypeupImports?: ImportCache }
        if (!state._hypeupImports) {
          state._hypeupImports = new Map()
        }
        const cache = state._hypeupImports

        if (extensionRoots.has(name)) {
          handleExtension(path, cache, table)
        } else if (primitive) {
          handlePrimitive(path, cache, primitive)
        }
      },

      CallExpression(path: NodePath<t.CallExpression>) {
        const { callee } = path.node

        // Only bare identifier calls — skip `new` (handled by excluding NewExpression),
        // skip member expressions like `obj.Method()`
        if (!t.isIdentifier(callee)) {
          return
        }

        const { name } = callee

        // Must be PascalCase: first char uppercase
        if (
          !name[0] ||
          name[0] !== name[0].toUpperCase() ||
          name[0] === name[0].toLowerCase()
        ) {
          return
        }

        // Must have at least one argument — zero-arg calls are not wrapped
        if (path.node.arguments.length === 0) {
          return
        }

        // Skip known JS built-ins
        if (JS_BUILTINS.has(name)) {
          return
        }

        // Skip if it's in the primitive table (HTML elements, CSS props, etc.)
        if (table.has(name)) {
          return
        }

        // Per-file import cache
        const state = path.hub as { _hypeupImports?: ImportCache }
        if (!state._hypeupImports) {
          state._hypeupImports = new Map()
        }
        const cache = state._hypeupImports

        // Transform: TodoRow(a, b) → lazy(TodoRow, [a, b])
        const args = path.node.arguments as t.Expression[]
        path.replaceWith(
          t.callExpression(getImport(path, cache, "lazy", RUNTIME_MODULE), [
            callee,
            t.arrayExpression(args),
          ]),
        )
      },
    },
  }
}

function handlePrimitive(
  path: PrimitivePath,
  cache: ImportCache,
  primitive: Primitive,
): void {
  switch (primitive.kind) {
    case "htmlElement":
      handleHtmlElement(path, cache, primitive.tag, primitive.isVoid)
      break
    case "cssProperty":
      handleCssProperty(path, cache, primitive)
      break
    case "atRule":
      handleAtRule(path, cache, primitive.keyword)
      break
    case "builtin":
      handleBuiltin(path, cache, primitive.name, primitive.module)
      break
    case "prop-constant":
      handlePropConstant(path, cache, primitive)
      break
    case "className-constant":
      handleClassNameConstant(path, cache, primitive)
      break
    case "element-constant":
      handleElementConstant(path, cache, primitive)
      break
  }
}

function handleExtension(
  path: NodePath<t.Identifier>,
  cache: ImportCache,
  table: Map<string, Primitive>,
): void {
  const paths: PrimitivePath[] = [path]
  const names = [path.node.name]
  let current: PrimitivePath = path
  while (
    (current.parentPath?.isMemberExpression() || current.parentPath?.isOptionalMemberExpression()) &&
    current.parentPath.node.object === current.node
  ) {
    const parent = current.parentPath
    if (!parent.isMemberExpression() || parent.node.computed || !t.isIdentifier(parent.node.property)) {
      return
    }
    names.push(parent.node.property.name)
    paths.push(parent)
    current = parent
  }
  if (current.parentPath?.isOptionalCallExpression() && current.parentPath.node.callee === current.node) {
    return
  }

  for (let length = names.length; length > 0; length--) {
    const primitive = table.get(names.slice(0, length).join("."))
    if (!primitive) {
      continue
    }
    const suffix = names.slice(length)
    if (!supportsExtensionSuffix(primitive, suffix, current)) {
      throw path.buildCodeFrameError(`Unresolved extension path "${names.join(".")}"`)
    }
    handlePrimitive(paths[length - 1], cache, primitive)
    return
  }
  if (names.length > 1) {
    throw path.buildCodeFrameError(`Unresolved extension path "${names.join(".")}"`)
  }
}

function supportsExtensionSuffix(
  primitive: Primitive,
  suffix: string[],
  path: PrimitivePath,
): boolean {
  if (suffix.length === 0) {
    return true
  }
  const isCall = path.parentPath?.isCallExpression() && path.parentPath.node.callee === path.node
  switch (primitive.kind) {
    case "element-constant":
      return true
    case "htmlElement":
      return isCall
    case "cssProperty":
      return suffix.length === 1 && !isCall && primitive.keywords.includes(kebab(suffix[0]))
    case "builtin":
      return suffix.length === 1 && (
        (primitive.name === "doctype" && suffix[0] === "html5" && !isCall) ||
        (primitive.name === "rule" && isCall)
      )
    default:
      return false
  }
}

function rejectConstantCall(path: PrimitivePath): void {
  const parent = path.parentPath
  if (
    (parent?.isCallExpression() || parent?.isNewExpression()) &&
    parent.node.callee === path.node
  ) {
    throw path.buildCodeFrameError("Extension constants are not callable")
  }
}

function handlePropConstant(
  path: PrimitivePath,
  cache: ImportCache,
  primitive: PropConstantPrimitive,
): void {
  rejectConstantCall(path)
  path.replaceWith(helperCall(path, cache, "prop", [
    t.stringLiteral(primitive.css),
    t.stringLiteral(primitive.value),
  ]))
}

function handleClassNameConstant(
  path: PrimitivePath,
  cache: ImportCache,
  primitive: ClassNameConstantPrimitive,
): void {
  rejectConstantCall(path)
  path.replaceWith(helperCall(path, cache, "className", [t.stringLiteral(primitive.value)]))
}

function handleElementConstant(
  path: PrimitivePath,
  cache: ImportCache,
  primitive: ElementConstantPrimitive,
): void {
  const contents: t.Expression[] = []
  if (primitive.className !== undefined) {
    contents.push(helperCall(path, cache, "className", [t.stringLiteral(primitive.className)]))
  }
  for (const [name, value] of Object.entries(primitive.props ?? {})) {
    contents.push(helperCall(path, cache, "prop", [t.stringLiteral(name), t.stringLiteral(value)]))
  }
  for (const [name, value] of Object.entries(primitive.attrs ?? {})) {
    contents.push(helperCall(path, cache, "attr", [t.stringLiteral(name), t.valueToNode(value)]))
  }

  let reference = path
  while (reference.parentPath?.isMemberExpression() && reference.parentPath.node.object === reference.node) {
    const parent = reference.parentPath
    const property = parent.node.property as t.Identifier
    const className = t.stringLiteral(kebab(property.name))
    contents.push(helperCall(path, cache, "className", [className]))
    reference = parent
  }
  const parent = reference.parentPath
  const call = parent?.isCallExpression() && parent.node.callee === reference.node ? parent : null
  if (call) {
    contents.push(...call.node.arguments as t.Expression[])
  }
  const helper = primitive.isVoid ? "elemVoid" : "elem"
  const target = call ?? reference
  target.replaceWith(helperCall(path, cache, helper, [
    t.stringLiteral(primitive.tag),
    argsArray(contents),
  ]))
}

// HTML Elements

function handleHtmlElement(
  path: PrimitivePath,
  cache: ImportCache,
  tag: string,
  isVoid: boolean,
): void {
  const parent = path.parentPath

  // div.active.large("hello") — class chain on call
  if (parent?.isMemberExpression() && parent.node.object === path.node) {
    // Walk up to find the outermost call expression
    let memberPath = parent
    while (
      memberPath.parentPath?.isMemberExpression() &&
      memberPath.parentPath.node.object === memberPath.node
    ) {
      memberPath = memberPath.parentPath
    }

    if (
      memberPath.parentPath?.isCallExpression() &&
      memberPath.parentPath.node.callee === memberPath.node
    ) {
      const callPath = memberPath.parentPath
      const chain = collectChain(memberPath.node as t.MemberExpression, path.node)
      if (!chain) {
        return
      }

      const classArgs = chain.segments.map((seg) =>
        helperCall(path, cache, "className", [t.stringLiteral(kebab(seg))]),
      )
      const callArgs = (callPath.node as t.CallExpression)
        .arguments as t.Expression[]
      const helper = isVoid ? "elemVoid" : "elem"
      callPath.replaceWith(
        helperCall(path, cache, helper, [
          t.stringLiteral(tag),
          argsArray([...classArgs, ...callArgs]),
        ]),
      )
      return
    }

    // div.active (member access without call — shouldn't normally happen for HTML elements)
    // Let it fall through; the inner identifier won't match again after replacement
    return
  }

  // div("hello") — bare call
  if (parent?.isCallExpression() && parent.node.callee === path.node) {
    const callArgs = parent.node.arguments as t.Expression[]
    const helper = isVoid ? "elemVoid" : "elem"
    parent.replaceWith(
      helperCall(path, cache, helper, [
        t.stringLiteral(tag),
        argsArray(callArgs),
      ]),
    )
    return
  }

  // Bare identifier reference (e.g. rule(div, ...) — element as selector)
  // Replace with string literal of the tag name
  path.replaceWith(t.stringLiteral(tag))
}

// CSS Properties

function handleCssProperty(
  path: PrimitivePath,
  cache: ImportCache,
  primitive: CssPropertyPrimitive,
): void {
  const parent = path.parentPath

  // zIndex.auto — keyword access
  if (
    parent?.isMemberExpression() &&
    parent.node.object === path.node &&
    !parent.node.computed
  ) {
    const prop = parent.node.property
    if (!t.isIdentifier(prop)) {
      return
    }

    const keyword = kebab(prop.name)

    // If this member expression is itself the callee of a call, don't replace
    // (CSS properties don't have callable keywords)
    parent.replaceWith(
      helperCall(path, cache, "prop", [
        t.stringLiteral(primitive.cssName),
        t.stringLiteral(keyword),
      ]),
    )
    return
  }

  // color("red") — call form
  if (parent?.isCallExpression() && parent.node.callee === path.node) {
    const args = parent.node.arguments as t.Expression[]
    if (args.length === 1) {
      parent.replaceWith(
        helperCall(path, cache, "prop", [
          t.stringLiteral(primitive.cssName),
          args[0],
        ]),
      )
    }
    return
  }
}

// At-Rules

function handleAtRule(
  path: PrimitivePath,
  cache: ImportCache,
  keyword: string,
): void {
  const parent = path.parentPath

  // $media("(min-width: 600px)", ...) — call form
  if (parent?.isCallExpression() && parent.node.callee === path.node) {
    const args = parent.node.arguments as t.Expression[]

    // Hoist first string-literal arg as the rule parameter
    let ruleParam: t.Expression = t.nullLiteral()
    let contents = args

    if (args.length > 0 && t.isStringLiteral(args[0])) {
      ruleParam = args[0]
      contents = args.slice(1)
    }

    parent.replaceWith(
      helperCall(path, cache, "atRule", [
        t.stringLiteral(keyword),
        ruleParam,
        argsArray(contents),
      ]),
    )
    return
  }
}

// Builtins

function handleBuiltin(
  path: PrimitivePath,
  cache: ImportCache,
  name: string,
  module?: string,
): void {
  const parent = path.parentPath

  // doctype.html5 -> raw("<!DOCTYPE html>")
  if (name === "doctype") {
    if (
      parent?.isMemberExpression() &&
      parent.node.object === path.node &&
      !parent.node.computed
    ) {
      const prop = parent.node.property
      if (t.isIdentifier(prop) && prop.name === "html5") {
        parent.replaceWith(
          helperCall(path, cache, "raw", [t.stringLiteral("<!DOCTYPE html>")]),
        )
        return
      }
    }
    return
  }

  // rule.active(...) — rule class-access form
  if (name === "rule") {
    if (
      parent?.isMemberExpression() &&
      parent.node.object === path.node &&
      !parent.node.computed
    ) {
      const prop = parent.node.property
      if (!t.isIdentifier(prop)) {
        return
      }

      const className = `.${kebab(prop.name)}`

      if (
        parent.parentPath?.isCallExpression() &&
        parent.parentPath.node.callee === parent.node
      ) {
        const callArgs = parent.parentPath.node.arguments as t.Expression[]
        parent.parentPath.replaceWith(
          helperCall(path, cache, "rule", [
            t.stringLiteral(className),
            argsArray(callArgs),
          ]),
        )
        return
      }
      return
    }

    // rule(".foo", ...) or rule(div, ...) — call form
    if (parent?.isCallExpression() && parent.node.callee === path.node) {
      const args = parent.node.arguments as t.Expression[]
      if (args.length >= 1) {
        const selector = args[0]
        const contents = args.slice(1)
        parent.replaceWith(
          helperCall(path, cache, "rule", [selector, argsArray(contents)]),
        )
      }
      return
    }
  }

  // elem, elemVoid, prop, attr, raw, className, cssString, on, reactive — import from source module
  // Replace the identifier with the imported one
  path.replaceWith(getImport(path, cache, name, module))
}
