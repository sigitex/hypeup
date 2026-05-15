import { afterEach, describe, expect, test } from "bun:test"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { resolve } from "node:path"
import { defineConfig, loadConfig, mergeConfig } from "../src/config"

const tempDirs: string[] = []

function tempRoot() {
  const dir = mkdtempSync(resolve(tmpdir(), "hypeup-config-"))
  tempDirs.push(dir)
  return dir
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

describe("defineConfig", () => {
  test("returns object config unchanged", () => {
    const config = { out: "build" }

    expect(defineConfig(config)).toBe(config)
  })

  test("returns function config unchanged", () => {
    const config = () => ({ out: "build" })

    expect(defineConfig(config)).toBe(config)
  })
})

describe("loadConfig", () => {
  test("loads TypeScript config files", async () => {
    const root = tempRoot()
    writeFileSync(resolve(root, "hypeup.config.ts"), "export default { out: 'build' }")

    await expect(loadConfig(root)).resolves.toEqual({ out: "build" })
  })

  test("loads JavaScript config files", async () => {
    const root = tempRoot()
    writeFileSync(resolve(root, "hypeup.config.js"), "export default { dir: 'src' }")

    await expect(loadConfig(root)).resolves.toEqual({ dir: "src" })
  })

  test("loads JSON config files", async () => {
    const root = tempRoot()
    writeFileSync(resolve(root, "hypeup.config.json"), JSON.stringify({ clean: true }))

    await expect(loadConfig(root)).resolves.toEqual({ clean: true })
  })

  test("calls function default exports", async () => {
    const root = tempRoot()
    writeFileSync(resolve(root, "hypeup.config.mjs"), "export default () => ({ port: 3000 })")

    await expect(loadConfig(root)).resolves.toEqual({ port: 3000 })
  })

  test("returns empty config when no file exists", async () => {
    await expect(loadConfig(tempRoot())).resolves.toEqual({})
  })

  test("ignores vite key in static JSON config", async () => {
    const root = tempRoot()
    writeFileSync(
      resolve(root, "hypeup.config.json"),
      JSON.stringify({ dir: "src", vite: { resolve: {} } }),
    )

    await expect(loadConfig(root)).resolves.toEqual({ dir: "src" })
  })

  test("exits on invalid default export", () => {
    const root = tempRoot()
    writeFileSync(resolve(root, "hypeup.config.ts"), "export default 'nope'")

    const result = Bun.spawnSync({
      cmd: [
        "bun",
        "--eval",
        `import { loadConfig } from ${JSON.stringify(resolve(import.meta.dir, "../src/config.ts"))}; await loadConfig(${JSON.stringify(root)})`,
      ],
      stdout: "pipe",
      stderr: "pipe",
    })

    expect(result.exitCode).toBe(1)
    expect(result.stderr.toString()).toContain("Failed to load config")
  })
})

describe("mergeConfig", () => {
  test("uses CLI flags before config and defaults", () => {
    const result = mergeConfig(
      { dir: ".", out: "dist", clean: false },
      { dir: "src", out: "build", clean: true, port: 3000 },
      { out: "public", port: "4000" },
    )

    expect(result).toEqual({ dir: "src", out: "public", clean: true, port: 4000, vite: undefined })
  })

  test("uses config values when flags are absent", () => {
    const result = mergeConfig(
      { dir: ".", out: "dist", clean: false },
      { dir: "src", out: "build" },
      {},
    )

    expect(result).toEqual({ dir: "src", out: "build", clean: false, port: undefined, vite: undefined })
  })

  test("falls back to defaults", () => {
    const result = mergeConfig({ dir: ".", out: "dist", clean: false }, {}, {})

    expect(result).toEqual({ dir: ".", out: "dist", clean: false, port: undefined, vite: undefined })
  })
})
