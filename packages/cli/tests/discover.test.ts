import { describe, expect, test, afterEach } from "bun:test"
import { discoverPages, mapRoute, extractParams, resolveRoute } from "../src/discover"
import { mkdirSync, writeFileSync, rmSync } from "node:fs"
import { resolve } from "node:path"

const FIXTURE_DIR = resolve(import.meta.dir, "../.test-fixtures/pages")

function setup(files: string[]) {
  rmSync(resolve(import.meta.dir, "../.test-fixtures"), { recursive: true, force: true })
  for (const file of files) {
    const fullPath = resolve(FIXTURE_DIR, file)
    mkdirSync(resolve(fullPath, ".."), { recursive: true })
    writeFileSync(fullPath, "export default () => null")
  }
}

function cleanup() {
  rmSync(resolve(import.meta.dir, "../.test-fixtures"), { recursive: true, force: true })
}

describe("mapRoute", () => {
  test("maps top-level page to .html", () => {
    expect(mapRoute("about.page.ts")).toBe("about.html")
  })

  test("maps index page to index.html", () => {
    expect(mapRoute("index.page.ts")).toBe("index.html")
  })

  test("maps nested page", () => {
    expect(mapRoute("blog/post.page.ts")).toBe("blog/post.html")
  })

  test("maps nested index", () => {
    expect(mapRoute("blog/index.page.ts")).toBe("blog/index.html")
  })
})

describe("extractParams", () => {
  test("returns empty for static routes", () => {
    expect(extractParams("about.page.ts")).toEqual([])
  })

  test("extracts single param", () => {
    expect(extractParams("blog/[slug].page.ts")).toEqual(["slug"])
  })

  test("extracts multiple params", () => {
    expect(extractParams("[category]/[slug].page.ts")).toEqual(["category", "slug"])
  })
})

describe("resolveRoute", () => {
  test("replaces single param", () => {
    expect(resolveRoute("blog/[slug].html", { slug: "hello" })).toBe("blog/hello.html")
  })

  test("replaces multiple params", () => {
    expect(resolveRoute("[category]/[slug].html", { category: "tech", slug: "post" })).toBe("tech/post.html")
  })

  test("throws on missing param", () => {
    expect(() => resolveRoute("blog/[slug].html", {})).toThrow('Missing param "slug"')
  })
})

describe("discoverPages", () => {
  afterEach(cleanup)

  test("discovers flat pages", async () => {
    setup(["index.page.ts", "about.page.ts", "contact.page.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(3)
    const routes = pages.map((p) => p.route)
    expect(routes).toContain("index.html")
    expect(routes).toContain("about.html")
    expect(routes).toContain("contact.html")
  })

  test("discovers nested pages", async () => {
    setup(["index.page.ts", "blog/index.page.ts", "blog/post.page.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(3)
    const routes = pages.map((p) => p.route)
    expect(routes).toContain("blog/post.html")
    expect(routes).toContain("blog/index.html")
  })

  test("ignores non-page .ts files", async () => {
    setup(["index.page.ts", "helpers.ts", "types.d.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
  })

  test("discovers dynamic pages with params", async () => {
    setup(["index.page.ts", "blog/[slug].page.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(2)
    const dynamic = pages.find((p) => p.params.length > 0)
    expect(dynamic).toBeDefined()
    expect(dynamic!.route).toBe("blog/[slug].html")
    expect(dynamic!.params).toEqual(["slug"])
  })

  test("throws on missing directory", async () => {
    expect(discoverPages("/nonexistent/path/pages")).rejects.toThrow("Directory not found")
  })

  test("throws on file instead of directory", async () => {
    const filePath = resolve(import.meta.dir, "../.test-fixtures/not-a-dir")
    rmSync(resolve(import.meta.dir, "../.test-fixtures"), { recursive: true, force: true })
    mkdirSync(resolve(import.meta.dir, "../.test-fixtures"), { recursive: true })
    writeFileSync(filePath, "not a dir")
    expect(discoverPages(filePath)).rejects.toThrow("not a directory")
    cleanup()
  })
})
