// oxlint-disable complexity
import type { InlineConfig, UserConfig, ViteDevServer } from "vite"
import type { Page } from "./discover"
import { TARGET_FORMATS } from "./discover"

/** Match a URL route against a dynamic route template. Returns params or null. */
function matchDynamicRoute(
  template: string,
  route: string,
): Record<string, string> | null {
  // Convert "blog/[slug].html" to regex "^blog/([^/]+)\\.html$"
  const paramNames: string[] = []
  const pattern = template
    .replace(/\[(\w+)\]/g, (_, name) => {
      paramNames.push(name)
      return "([^/]+)"
    })
    .replace(/\./g, "\\.")

  const match = route.match(new RegExp(`^${pattern}$`))
  if (!match) {
    return null
  }

  const params: Record<string, string> = {}
  for (let i = 0; i < paramNames.length; i++) {
    params[paramNames[i]] = match[i + 1]
  }
  return params
}

/** Lazily load the hypeup vite plugin — avoids top-level import. */
async function loadHypeupPlugin() {
  const { hypeup } = await import("@hypeup/plugin/vite")
  return hypeup()
}

/** Shared Vite config fragments. */
function sharedConfig(root: string) {
  return {
    root,
    resolve: {
      tsconfigPaths: true,
    },
    ssr: {
      external: [
        "@hypeup/runtime",
        "@hypeup/vdom",
        "@hypeup/render",
        "@hypeup/lexicon",
        "@hypeup/escape-html",
      ],
    },
  } satisfies Partial<InlineConfig>
}

/**
 * Build pages using vite.build() in SSR mode.
 * Returns the path to the compiled output directory.
 */
export async function buildPages(
  root: string,
  pages: Page[],
  outDir: string,
  userConfig?: UserConfig,
): Promise<string> {
  const { build, mergeConfig } = await import("vite")
  const plugin = await loadHypeupPlugin()

  const formatPattern = new RegExp(`\\.(${TARGET_FORMATS.join("|")})$`)
  const input: Record<string, string> = {}
  for (const page of pages) {
    const name = page.route.replace(formatPattern, "")
    input[name] = page.filePath
  }

  const ssrOutDir = outDir + "/.ssr"

  const config = mergeConfig(userConfig ?? {}, {
    ...sharedConfig(root),
    logLevel: "silent",
    plugins: [plugin],
    build: {
      ssr: true,
      ssrEmitAssets: true,
      outDir: ssrOutDir,
      rollupOptions: {
        input,
        external: [/^@hypeup\//],
      },
      emptyOutDir: false,
    },
  })

  await build(config)

  return ssrOutDir
}

/**
 * Create a Vite dev server with SSR middleware for watch mode.
 * Serves rendered pages over HTTP with live reload.
 */
export async function createDevServer(
  root: string,
  pagesDir: string,
  renderPage: (
    server: ViteDevServer,
    page: Page,
    params?: Record<string, string>,
  ) => Promise<string>,
  discoverPages: (pagesDir: string) => Promise<Page[]>,
  options?: { port?: number; vite?: UserConfig },
): Promise<ViteDevServer> {
  const { createServer, mergeConfig } = await import("vite")
  const plugin = await loadHypeupPlugin()

  const config = mergeConfig(options?.vite ?? {}, {
    ...sharedConfig(root),
    appType: "custom",
    logLevel: "info",
    server: {
      port: options?.port,
    },
    plugins: [
      plugin,
      {
        name: "hypeup-ssr",
        handleHotUpdate({ server }) {
          // SSR pages have no client modules — force a full page reload
          server.ws.send({ type: "full-reload" })
          return []
        },
        configureServer(server) {
          // SSR middleware — catch all HTML requests and render the matching page
          return () => {
            server.middlewares.use(async (req, res, next) => {
              const url = req.url ?? "/"

              // Only handle GET requests
              if (req.method !== "GET") {
                next()
                return
              }

              // Content-type map for target formats
              const contentTypes: Record<string, string> = {
                html: "text/html",
                css: "text/css",
                md: "text/markdown",
              }

              // Map URL to a page route
              let route: string
              if (url === "/" || url.endsWith("/")) {
                route = (url === "/" ? "" : url.slice(1)) + "index.html"
              } else if (url.endsWith(".html")) {
                route = url.slice(1)
              } else if (url.endsWith(".css") || url.endsWith(".md")) {
                // Check if this matches a discovered page route
                route = url.slice(1)
              } else if (!url.includes(".")) {
                // Clean URL without extension — try as a page route
                route = url.slice(1) + ".html"
              } else {
                // Has a non-target extension (e.g. .js, .png) — let Vite handle it
                next()
                return
              }

              try {
                const pages = await discoverPages(pagesDir)

                // Try exact match first (static pages)
                let page = pages.find((p) => p.route === route)
                let params: Record<string, string> | undefined

                // Try dynamic route matching
                if (!page) {
                  for (const p of pages) {
                    if (p.params.length === 0) {
                      continue
                    }
                    const match = matchDynamicRoute(p.route, route)
                    if (match) {
                      page = p
                      params = match
                      break
                    }
                  }
                }

                // Try /index.html variant (e.g. /src/projects -> src/projects/index.html)
                if (!page) {
                  const indexRoute = route.replace(/\.html$/, "/index.html")
                  page = pages.find((p) => p.route === indexRoute)
                  if (page) {
                    route = indexRoute
                  }
                }

                if (!page) {
                  next()
                  return
                }

                const rawOutput = await renderPage(server, page, params)

                // Determine target format from route extension
                const ext = page.route.split(".").pop() ?? "html"
                const contentType = contentTypes[ext] ?? "text/html"

                // Only apply Vite's HTML transforms for HTML responses
                const output = ext === "html"
                  ? await server.transformIndexHtml(url, rawOutput)
                  : rawOutput

                res.statusCode = 200
                res.setHeader("Content-Type", contentType)
                res.end(output)
              } catch (error) {
                console.error(`Error rendering ${route}:`, error)
                next(error)
              }
            })
          }
        },
      },
    ],
  })

  const server = await createServer(config)

  await server.listen()
  server.printUrls()

  return server
}
