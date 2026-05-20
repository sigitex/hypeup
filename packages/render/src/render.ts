// oxlint-disable complexity
// oxlint-disable typescript/no-explicit-any
import { escapeHtml } from "@hypeup/escape-html"
import { AtRule, Each, Element, Lazy, Raw, Rule } from "@hypeup/vdom"
import { classifyAtRule, classifyElement, classifyRule } from "@hypeup/runtime"

// TODO: .toHTML()
// TODO: Comment

type Content = any

/** State for `render`. */
type Renderer = {
  write(text: string): void
}

/** Render HTML content. */
export function render(x: Content) {
  let text = ""
  const renderer = {
    write(s: string) {
      text += s
    },
  }
  renderNode(x, renderer)
  return text
}

/** Render an object */
function renderNode(x: Content, r: Renderer) {
  const type = typeof x
  switch (true) {
    case x === undefined || x === null || x === "" || x === false:
      break
    case type === "string":
    case type === "number":
    case type === "boolean":
    case type === "bigint":
      r.write(escapeHtml(x))
      break
    case x instanceof Raw:
      r.write(x.text)
      break
    case Array.isArray(x):
      for (const e of x) {
        renderNode(e, r)
      }
      break
    case x instanceof Lazy: {
      const element = x.fn(...x.args)
      renderNode(element, r)
      break
    }
    case x instanceof Each: {
      const items: any[] = x.items
      for (let i = 0; i < items.length; i++) {
        const element = x.mapFn(items[i], i)
        renderNode(element, r)
      }
      break
    }
    case x instanceof Element: {
      const { attributes, properties, classes, children } = classifyElement(
        x.contents,
        x.isVoid,
      )
      r.write(`<${x.tag}`)
      if (classes.length > 0) {
        attributes.class = classes.join(" ")
      }
      const attrKeys = Object.keys(attributes)
      if (attrKeys.length > 0) {
        const attrStr = attrKeys
          .map((key) => attributes[key] === true ? key : `${key}="${attributes[key]}"`)
          .join(" ")
        r.write(" " + attrStr)
      }
      const propKeys = Object.keys(properties)
      if (propKeys.length > 0) {
        const styleStr = propKeys
          .map((key) => `${key}: ${properties[key]}`)
          .join(";")
        r.write(` style="${styleStr}"`)
      }
      r.write(`>`)
      if (x.isVoid) {
        break
      }
      for (const child of children) {
        renderNode(child, r)
      }
      r.write(`</${x.tag}>`)
      break
    }
    case x instanceof Rule: {
      renderRule(x, r)
      break
    }
    case x instanceof AtRule: {
      const { properties, children } = classifyAtRule(x.contents)
      r.write(`${x.keyword}`)
      if (x.rule !== null) {
        r.write(` ${x.rule}`)
      }
      if (children.length === 0 && Object.keys(properties).length === 0) {
        r.write(";")
        break
      }
      r.write("{")
      r.write(
        Object.keys(properties)
          .map((key) => `${key}:${properties[key]}`)
          .join(";"),
      )
      for (const content of children) {
        renderNode(content, r)
      }
      r.write("}")
      break
    }
  }
}

/** Render a CSS rule (and any nested rules). */
function renderRule(ruleNode: Rule, r: Renderer, prefix?: string) {
  const { properties, rules, atRules, children } = classifyRule(ruleNode.contents)
  let selectors = ruleNode.selector.split(",").map((s: string) => s.trim())
  if (prefix) {
    selectors = selectors.map((selector: string) => {
      if (selector.startsWith("&")) {
        return prefix + selector.substring(1)
      } else if (selector.startsWith(":")) {
        return prefix + selector
      } else {
        return prefix + " " + selector
      }
    })
  }

  // Separate inline (slash-prefixed) rules from flattened rules
  const inlineRules: Rule[] = []
  const flattenedRules: Rule[] = []
  for (const sub of rules) {
    if (sub.selector.startsWith("/")) {
      inlineRules.push(new Rule(sub.selector.substring(1), sub.contents))
    } else {
      flattenedRules.push(sub)
    }
  }

  const keys = Object.keys(properties)
  if (keys.length > 0 || children.length > 0 || inlineRules.length > 0) {
    r.write(`${selectors.join(",")}{`)
    r.write(keys.map((key) => `${key}:${properties[key]}`).join(";"))
    if (keys.length > 0 && children.length > 0) {
      r.write(";")
    }
    for (const child of children) {
      renderNode(child, r)
    }
    // Emit inline nested rules inside the braces
    for (const inlineRule of inlineRules) {
      renderRule(inlineRule, r)
    }
    r.write(`}`)
  }

  if (flattenedRules.length > 0) {
    for (const selector of selectors) {
      for (const sub of flattenedRules) {
        renderRule(sub, r, selector)
      }
    }
  }

  for (const atRule of atRules) {
    const composedSelector = selectors.join(",")
    r.write(`@${atRule.keyword}`)
    if (atRule.rule !== null) {
      r.write(` ${atRule.rule}`)
    }
    r.write("{")
    renderRule(new Rule(composedSelector, atRule.contents), r)
    r.write("}")
  }
}
