import { resolve, dirname } from "node:path"
import { discoverPages, resolveRoute, TARGET_FORMATS, type Page } from "./discover"
import { buildPages, createDevServer } from "./vite"
import { loadConfig, mergeConfig } from "./config"
import { render } from "@hypeup/render"
import { rmSync, mkdirSync, cpSync, existsSync } from "node:fs"
import type { UserConfig, ViteDevServer } from "vite"

const formatPattern = new RegExp(`\\.(${TARGET_FORMATS.join("|")})$`)

export async function generate(flags: Record<string, string | boolean>) {
  const startTime = performance.now()
  const root = process.cwd()
  const config = mergeConfig(
    { dir: ".", out: "dist", clean: false },
    await loadConfig(root),
    flags,
  )
  const pagesDir = resolve(root, config.dir)
  const outDir = resolve(root, config.out)
  const clean = config.clean
  const watch = flags.watch === true

  // Clean output directory if requested
  if (clean) {
    rmSync(outDir, { recursive: true, force: true })
  }

  // Discover pages
  const pages = await discoverPages(pagesDir)

  if (pages.length === 0) {
    console.warn("No pages found in", pagesDir)
    process.exit(0)
  }

  if (watch) {
    await runWatchMode(root, pagesDir, config.port, config.vite)
    return
  }

  // One-shot build mode
  await runBuild(root, pagesDir, outDir, startTime, config.vite)
}

/** One-shot generate: vite.build() SSR, import modules, render, write. */
async function runBuild(
  root: string,
  pagesDir: string,
  outDir: string,
  startTime: number,
  viteConfig?: UserConfig,
) {
  const pages = await discoverPages(pagesDir)

  if (pages.length === 0) {
    console.warn("No pages found in", pagesDir)
    process.exit(0)
  }

  // Build with Vite SSR
  const ssrOutDir = await buildPages(root, pages, outDir, viteConfig)

  // Render each page
  let rendered = 0
  for (const page of pages) {
    // Vite sanitizes brackets in filenames: [slug] -> _slug_
    const moduleName = page.route
      .replace(formatPattern, "")
      .replace(/\[(\w+)\]/g, "_$1_")
    const modulePath = resolve(ssrOutDir, moduleName + ".js")

    try {
      const mod = await import(modulePath)
      const pageFn = mod.default
      if (typeof pageFn !== "function") {
        throw new Error(`Default export is not a function`)
      }

      if (page.params.length > 0 && typeof mod.getStaticPaths === "function") {
        // Dynamic page — expand into multiple outputs
        const paths = (await mod.getStaticPaths()) as Record<string, string>[]
        for (const params of paths) {
          const route = resolveRoute(page.route, params)
          const vdom = pageFn(params)
          const html = render(vdom)
          const outputPath = resolve(outDir, route)
          mkdirSync(dirname(outputPath), { recursive: true })
          await Bun.write(outputPath, html)
          rendered++
        }
      } else {
        // Static page
        const vdom = pageFn()
        const html = render(vdom)
        const outputPath = resolve(outDir, page.route)
        mkdirSync(dirname(outputPath), { recursive: true })
        await Bun.write(outputPath, html)
        rendered++
      }
    } catch (error) {
      console.error(`Error rendering ${page.filePath}:`, error)
      process.exit(1)
    }
  }

  // Copy public/ directory if it exists
  const publicDir = resolve(root, "public")
  if (existsSync(publicDir)) {
    cpSync(publicDir, outDir, { recursive: true })
  }

  // Copy emitted assets (images, fonts, etc.) from SSR build to output
  const ssrAssetsDir = resolve(ssrOutDir, "assets")
  if (existsSync(ssrAssetsDir)) {
    cpSync(ssrAssetsDir, resolve(outDir, "assets"), { recursive: true })
  }

  // Clean up SSR build artifacts
  rmSync(ssrOutDir, { recursive: true, force: true })

  // Summary
  const duration = (performance.now() - startTime).toFixed(0)
  console.log(
    `Generated ${rendered} page${rendered !== 1 ? "s" : ""} to ${outDir} in ${duration}ms`,
  )
}

/** Render a single page via ssrLoadModule. Accepts optional params for dynamic pages. */
async function renderPage(
  server: ViteDevServer,
  page: Page,
  params?: Record<string, string>,
): Promise<string> {
  const mod = await server.ssrLoadModule(page.filePath)
  const pageFn = mod.default
  if (typeof pageFn !== "function") {
    throw new Error(`${page.filePath}: default export is not a function`)
  }
  const vdom = params ? pageFn(params) : pageFn()
  return render(vdom)
}

/** Watch mode: Vite dev server with SSR middleware serving pages over HTTP. */
async function runWatchMode(
  root: string,
  pagesDir: string,
  port?: number,
  viteConfig?: UserConfig,
) {
  const server = await createDevServer(
    root,
    pagesDir,
    renderPage,
    discoverPages,
    { port, vite: viteConfig },
  )

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down...")
    await server.close()
    process.exit(0)
  }

  process.on("SIGINT", shutdown)
  process.on("SIGTERM", shutdown)
}
