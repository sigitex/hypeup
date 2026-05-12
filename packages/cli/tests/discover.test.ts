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
  test("maps HTML page by stripping source extension", () => {
    expect(mapRoute("about.html.ts")).toBe("about.html")
  })

  test("maps index.html.ts to index.html", () => {
    expect(mapRoute("index.html.ts")).toBe("index.html")
  })

  test("maps nested page", () => {
    expect(mapRoute("blog/post.html.ts")).toBe("blog/post.html")
  })

  test("maps nested index", () => {
    expect(mapRoute("blog/index.html.ts")).toBe("blog/index.html")
  })

  test("maps CSS file", () => {
    expect(mapRoute("styles.css.ts")).toBe("styles.css")
  })

  test("maps markdown file", () => {
    expect(mapRoute("readme.md.ts")).toBe("readme.md")
  })

  test("maps non-ts source extension", () => {
    expect(mapRoute("index.html.civet")).toBe("index.html")
  })
})

describe("extractParams", () => {
  test("returns empty for static routes", () => {
    expect(extractParams("about.html.ts")).toEqual([])
  })

  test("extracts single param", () => {
    expect(extractParams("blog/[slug].html.ts")).toEqual(["slug"])
  })

  test("extracts multiple params", () => {
    expect(extractParams("[category]/[slug].html.ts")).toEqual(["category", "slug"])
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

  test("discovers index.html.ts and maps to index.html", async () => {
    setup(["index.html.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
  })

  test("discovers styles.css.ts and maps to styles.css", async () => {
    setup(["styles.css.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("styles.css")
  })

  test("discovers readme.md.ts and maps to readme.md", async () => {
    setup(["readme.md.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("readme.md")
  })

  test("does NOT discover data.json.ts (not in allowlist)", async () => {
    setup(["index.html.ts", "data.json.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
  })

  test("does NOT discover helpers.ts (single extension)", async () => {
    setup(["index.html.ts", "helpers.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
  })

  test("does NOT discover index.page.ts (old convention)", async () => {
    setup(["index.html.ts", "index.page.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
  })

  test("[slug].html.ts param extraction works", async () => {
    setup(["blog/[slug].html.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("blog/[slug].html")
    expect(pages[0].params).toEqual(["slug"])
  })

  test("discovers flat pages", async () => {
    setup(["index.html.ts", "about.html.ts", "contact.html.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(3)
    const routes = pages.map((p) => p.route)
    expect(routes).toContain("index.html")
    expect(routes).toContain("about.html")
    expect(routes).toContain("contact.html")
  })

  test("discovers nested pages", async () => {
    setup(["index.html.ts", "blog/index.html.ts", "blog/post.html.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(3)
    const routes = pages.map((p) => p.route)
    expect(routes).toContain("blog/post.html")
    expect(routes).toContain("blog/index.html")
  })

  test("ignores non-page .ts files", async () => {
    setup(["index.html.ts", "helpers.ts", "types.d.ts"])
    const pages = await discoverPages(FIXTURE_DIR)
    expect(pages.length).toBe(1)
    expect(pages[0].route).toBe("index.html")
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
