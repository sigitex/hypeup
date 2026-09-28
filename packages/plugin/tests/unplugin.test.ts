import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { unplugin, type HypeupPluginOptions } from "../src/unplugin"

let project: string
let inactiveProject: string

beforeAll(() => {
  project = mkdtempSync(path.join(tmpdir(), "hypeup-plugin-"))
  inactiveProject = mkdtempSync(path.join(tmpdir(), "hypeup-inactive-"))
  writeFileSync(path.join(project, "package.json"), JSON.stringify({ dependencies: { "@hypeup/lexicon": "*" } }))
  writeFileSync(path.join(inactiveProject, "package.json"), "{}")
})

afterAll(() => {
  rmSync(project, { recursive: true, force: true })
  rmSync(inactiveProject, { recursive: true, force: true })
})

function createPlugin(options?: HypeupPluginOptions, cwd = project) {
  const originalCwd = process.cwd()
  process.chdir(cwd)
  try {
    const plugin = unplugin.raw(options, { framework: "vite" })
    if (Array.isArray(plugin)) {
      throw new Error("Expected one plugin")
    }
    return plugin
  } finally {
    process.chdir(originalCwd)
  }
}

async function transform(plugin: ReturnType<typeof createPlugin>, code: string) {
  const hook = plugin.transform
  if (!hook) {
    throw new Error("Missing transform hook")
  }
  const handler = typeof hook === "function" ? hook : hook.handler
  const result = await Reflect.apply(handler, {}, [code, path.join(project, "view.ts")])
  return typeof result === "string" ? { code: result } : result
}

describe("extension plumbing", () => {
  test("pre-scan recognizes dotted-only roots across whitespace", async () => {
    const source = "zzzz\n.\nzzzz"
    expect(await transform(createPlugin(), source)).toBeNull()
    const plugin = createPlugin({
      extensions: [{ "zzzz.zzzz": { type: "className", value: "active" } }],
    })
    const result = await transform(plugin, source)
    expect(result?.code).toContain('_className("active")')
    expect(result?.code).toContain("import.meta.hot")
    expect(result?.map).toBeDefined()
  })

  test("passes aliases and constants through to Babel", async () => {
    const plugin = createPlugin({
      extensions: [
        { fs: { type: "alias", target: "fontSize" } },
        { m4: { type: "prop", css: "margin", value: "4px" } },
        { panel: { type: "element", tag: "div", className: "container" } },
      ],
    })
    const result = await transform(plugin, 'panel(fs("12px"), m4)')
    expect(result?.code).toContain('_prop("font-size", "12px")')
    expect(result?.code).toContain('_prop("margin", "4px")')
    expect(result?.code).toContain('_elem("div", [_className("container"),')
  })

  test("surfaces unresolved extension paths", async () => {
    const plugin = createPlugin({
      extensions: [{ "zzzz.zzzz": { type: "className", value: "active" } }],
    })
    await expect(transform(plugin, "zzzz.typo")).rejects.toThrow("Unresolved extension path")
  })

  test("preserves scope shadowing", async () => {
    const plugin = createPlugin({
      extensions: [{ "tokens.small": { type: "className", value: "active" } }],
    })
    const result = await transform(plugin, "const tokens = { typo: 1 }; tokens.typo")
    expect(result?.code).not.toContain("@hypeup/runtime")
    expect(result?.code).toContain("tokens.typo")
  })

  test("invalid extensions fail at active plugin initialization", () => {
    expect(() => createPlugin({
      extensions: [{ "div.card": { type: "className", value: "card" } }],
    })).toThrow("reserved built-in root")
    expect(() => createPlugin({
      extensions: [{ token: { type: "alias", target: "missing" } }],
    })).toThrow("Missing extension alias target")
  })

  test("default file filters remain unchanged", () => {
    const plugin = createPlugin()
    expect(plugin.transformInclude?.(path.join(project, "view.ts"))).toBe(true)
    expect(plugin.transformInclude?.(path.join(project, "view.jsx"))).toBe(true)
    expect(plugin.transformInclude?.(path.join(project, "view.css"))).toBe(false)
    expect(plugin.transformInclude?.(path.join(project, "node_modules", "view.ts"))).toBe(false)
  })

  test("allows workspace include and exclude overrides", () => {
    const plugin = createPlugin({ include: /\.ts$/, exclude: /vendor/ })
    expect(plugin.transformInclude?.(path.join(project, "node_modules", "workspace", "view.ts"))).toBe(true)
    expect(plugin.transformInclude?.(path.join(project, "vendor", "view.ts"))).toBe(false)
  })

  test("lexicon dependency still gates activation", async () => {
    const plugin = createPlugin({
      extensions: [{ token: { type: "className", value: "active" } }],
    }, inactiveProject)
    expect(plugin.transformInclude?.(path.join(inactiveProject, "view.ts"))).toBe(false)
    expect(await transform(plugin, "token")).toBeNull()
  })
})
