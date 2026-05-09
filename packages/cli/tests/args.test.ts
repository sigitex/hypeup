import { describe, expect, test } from "bun:test"
import { parseArgs } from "../src/args"

// Helper: simulate Bun.argv with bun + script prefix
function argv(...args: string[]) {
  return ["bun", "index.ts", ...args]
}

describe("parseArgs", () => {
  test("parses subcommand", () => {
    const result = parseArgs(argv("generate"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags).toEqual({})
  })

  test("returns null subcommand when no args", () => {
    const result = parseArgs(argv())
    expect(result.subcommand).toBeNull()
  })

  test("parses space-separated flag value", () => {
    const result = parseArgs(argv("generate", "--out", "build"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags.out).toBe("build")
  })

  test("parses equals-separated flag value", () => {
    const result = parseArgs(argv("generate", "--out=build"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags.out).toBe("build")
  })

  test("parses boolean flag", () => {
    const result = parseArgs(argv("generate", "--clean"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags.clean).toBe(true)
  })

  test("parses multiple flags", () => {
    const result = parseArgs(argv("generate", "--pages", "src/routes", "--out=build", "--clean"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags.pages).toBe("src/routes")
    expect(result.flags.out).toBe("build")
    expect(result.flags.clean).toBe(true)
  })

  test("ignores unknown flags gracefully", () => {
    const result = parseArgs(argv("generate", "--unknown-thing", "--clean"))
    expect(result.subcommand).toBe("generate")
    expect(result.flags["unknown-thing"]).toBe(true)
    expect(result.flags.clean).toBe(true)
  })

  test("parses --version flag without subcommand", () => {
    const result = parseArgs(argv("--version"))
    expect(result.subcommand).toBeNull()
    expect(result.flags.version).toBe(true)
  })
})
