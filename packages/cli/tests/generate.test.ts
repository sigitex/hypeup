import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { resolve } from "node:path"
import { rmSync, existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs"

const FIXTURE_DIR = resolve(import.meta.dir, "fixtures")
const OUT_DIR = resolve(FIXTURE_DIR, "dist")

function cleanup() {
  rmSync(OUT_DIR, { recursive: true, force: true })
}

describe("generate command (one-shot)", () => {
  beforeEach(cleanup)
  afterEach(cleanup)

  test("generates HTML files from page components", async () => {
    const result = Bun.spawnSync({
      cmd: ["bun", "run", resolve(import.meta.dir, "../src/cli.ts"), "generate", "--dir", "pages", "--out", "dist"],
      cwd: FIXTURE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    })

    const stdout = result.stdout.toString()
    const stderr = result.stderr.toString()

    if (result.exitCode !== 0) {
      console.error("STDERR:", stderr)
      console.error("STDOUT:", stdout)
    }

    expect(result.exitCode).toBe(0)

    // Verify static output files exist
    expect(existsSync(resolve(OUT_DIR, "index.html"))).toBe(true)
    expect(existsSync(resolve(OUT_DIR, "about.html"))).toBe(true)
    expect(existsSync(resolve(OUT_DIR, "blog/post.html"))).toBe(true)

    // Verify static content
    const indexHtml = readFileSync(resolve(OUT_DIR, "index.html"), "utf-8")
    expect(indexHtml).toContain("<h1>Hello World</h1>")
    expect(indexHtml).toContain("<title>Home</title>")

    const aboutHtml = readFileSync(resolve(OUT_DIR, "about.html"), "utf-8")
    expect(aboutHtml).toContain("<h1>About Page</h1>")

    const postHtml = readFileSync(resolve(OUT_DIR, "blog/post.html"), "utf-8")
    expect(postHtml).toContain("<h1>My Blog Post</h1>")

    // Verify dynamic pages from getStaticPaths
    expect(existsSync(resolve(OUT_DIR, "blog/hello-world.html"))).toBe(true)
    expect(existsSync(resolve(OUT_DIR, "blog/second-post.html"))).toBe(true)

    const helloPost = readFileSync(resolve(OUT_DIR, "blog/hello-world.html"), "utf-8")
    expect(helloPost).toContain("Post: hello-world")

    const secondPost = readFileSync(resolve(OUT_DIR, "blog/second-post.html"), "utf-8")
    expect(secondPost).toContain("Post: second-post")

    // Verify CSS output (task 4.9: CSS file output from rule nodes)
    expect(existsSync(resolve(OUT_DIR, "styles.css"))).toBe(true)
    const css = readFileSync(resolve(OUT_DIR, "styles.css"), "utf-8")
    expect(css).toContain("body{margin:0")
    expect(css).toContain("font-family:sans-serif")
    expect(css).toContain(".container{max-width:800px}")

    // Verify summary output (4 static + 2 dynamic = 6, mixed HTML + CSS: task 4.10)
    expect(stdout).toContain("6 page")
  }, 30000)

  test("copies public/ directory to output", async () => {
    const result = Bun.spawnSync({
      cmd: ["bun", "run", resolve(import.meta.dir, "../src/cli.ts"), "generate", "--dir", "pages", "--out", "dist"],
      cwd: FIXTURE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    })

    expect(result.exitCode).toBe(0)
    expect(existsSync(resolve(OUT_DIR, "robots.txt"))).toBe(true)

    const robots = readFileSync(resolve(OUT_DIR, "robots.txt"), "utf-8")
    expect(robots).toContain("User-agent: *")
  }, 30000)

  test("--clean removes output before generating", async () => {
    // Create a stale file
    const { mkdirSync, writeFileSync } = await import("node:fs")
    mkdirSync(OUT_DIR, { recursive: true })
    writeFileSync(resolve(OUT_DIR, "stale.html"), "stale")

    const result = Bun.spawnSync({
      cmd: ["bun", "run", resolve(import.meta.dir, "../src/cli.ts"), "generate", "--dir", "pages", "--out", "dist", "--clean"],
      cwd: FIXTURE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    })

    expect(result.exitCode).toBe(0)
    expect(existsSync(resolve(OUT_DIR, "stale.html"))).toBe(false)
    expect(existsSync(resolve(OUT_DIR, "index.html"))).toBe(true)
  }, 30000)
})

const TEST_PORT = 15173

describe("generate command (watch mode)", () => {
  const WATCH_PAGES = resolve(FIXTURE_DIR, "watch-pages")

  beforeEach(() => {
    cleanup()
    rmSync(WATCH_PAGES, { recursive: true, force: true })
    mkdirSync(WATCH_PAGES, { recursive: true })
    writeFileSync(
      resolve(WATCH_PAGES, "index.html.ts"),
      `import "@hypeup/lexicon"\nexport default function index() { return h1("Original") }\n`,
    )
  })

  afterEach(() => {
    cleanup()
    rmSync(WATCH_PAGES, { recursive: true, force: true })
  })

  test("watch mode serves pages over HTTP and picks up changes", async () => {
    const proc = Bun.spawn({
      cmd: ["bun", "run", resolve(import.meta.dir, "../src/cli.ts"), "generate", "--dir", "watch-pages", "--watch", "--port", String(TEST_PORT)],
      cwd: FIXTURE_DIR,
      stdout: "pipe",
      stderr: "pipe",
    })

    // Wait for server to start
    await new Promise((r) => setTimeout(r, 3000))

    // Fetch the page from the dev server
    const initial = await fetch(`http://localhost:${TEST_PORT}/`).then((r) => r.text())
    expect(initial).toContain("Original")

    // Modify the page file
    writeFileSync(
      resolve(WATCH_PAGES, "index.html.ts"),
      `import "@hypeup/lexicon"\nexport default function index() { return h1("Updated") }\n`,
    )

    // Wait for Vite to pick up the change
    await new Promise((r) => setTimeout(r, 1000))

    // Fetch again — should reflect the update (SSR renders on each request)
    const updated = await fetch(`http://localhost:${TEST_PORT}/`).then((r) => r.text())
    expect(updated).toContain("Updated")

    // Kill the process
    proc.kill()
    await proc.exited
  }, 30000)
})
