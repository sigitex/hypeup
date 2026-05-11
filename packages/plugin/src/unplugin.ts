import { createUnplugin } from "unplugin"
import { transformAsync } from "@babel/core"
import presetTypescript from "@babel/preset-typescript"
import { hypeupBabelPlugin, buildDslPrimitives } from "@hypeup/babel"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

/** Build a Set of all primitive identifier names for cheap pre-scan. */
function buildIdentifierSet(): Set<string> {
  const table = buildDslPrimitives()
  return new Set(table.keys())
}

/** Check if consumer project has @hypeup/lexicon as a dependency. */
function hasLexiconDependency(cwd: string): boolean {
  const pkgPath = resolve(cwd, "package.json")
  if (!existsSync(pkgPath)) {
    return false
  }

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"))
    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
      ...pkg.optionalDependencies,
    }
    return "@hypeup/lexicon" in allDeps
  } catch {
    return false
  }
}

/** Check if file content contains any DSL primitive identifiers. */
function containsPrimitives(code: string, identifiers: Set<string>): boolean {
  for (const id of identifiers) {
    if (code.includes(id)) {
      return true
    }
  }
  return false
}

const FILE_FILTER = /\.[jt]sx?$/

export type HypeupPluginOptions = {
  /** Override file include filter. Defaults to /\.[jt]sx?$/ */
  include?: RegExp
  /** Override file exclude filter. Defaults to /node_modules/ */
  exclude?: RegExp
}

export const unplugin = createUnplugin((options?: HypeupPluginOptions) => {
  const include = options?.include ?? FILE_FILTER
  const exclude = options?.exclude ?? /node_modules/

  const cwd = process.cwd()
  const isActive = hasLexiconDependency(cwd)
  const identifiers = isActive ? buildIdentifierSet() : new Set<string>()

  return {
    name: "hypeup",
    transformInclude(id: string) {
      if (!isActive) {
        return false
      }
      if (exclude.test(id)) {
        return false
      }
      return include.test(id)
    },
    async transform(code: string, id: string) {
      // Cheap string pre-scan — skip files with no DSL references
      if (!containsPrimitives(code, identifiers)) {
        return null
      }

      const result = await transformAsync(code, {
        filename: id,
        sourceMaps: true,
        plugins: [hypeupBabelPlugin],
        presets: [[presetTypescript, { isTSX: true, allExtensions: true }]],
      })

      if (!result?.code) {
        return null
      }

      // Only inject HMR into consumer project files, not framework packages
      const isProjectFile = id.startsWith(cwd)
      const hmr = isProjectFile
        ? `\nif (import.meta.hot) {\n  import.meta.hot.accept(() => {\n    import("@hypeup/client").then(({ redraw }) => redraw())\n  })\n}\n`
        : ""

      return {
        code: result.code + hmr,
        map: result.map,
      }
    },
  }
})
