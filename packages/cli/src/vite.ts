import type { InlineConfig, ViteDevServer } from "vite"
import type { Page } from "./discover"

/** Match a URL route against a dynamic route template. Returns params or null. */
function matchDynamicRoute(template: string, route: string): Record<string, string> | null {
  // Convert "blog/[slug].html" to regex "^blog/([^/]+)\\.html$"
  const paramNames: string[] = []
  const pattern = template.replace(/\[(\w+)\]/g, (_, name) => {
    paramNames.push(name)
    return "([^/]+)"
  }).replace(/\./g, "\\.")

  const match = route.match(new RegExp(`^${pattern}$`))
  if (!match) return null

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
): Promise<string> {
  const { build } = await import("vite")
  const plugin = await loadHypeupPlugin()

  const input: Record<string, string> = {}
  for (const page of pages) {
    const name = page.route.replace(/\.html$/, "")
    input[name] = page.filePath
  }

  const ssrOutDir = outDir + "/.ssr"

  await build({
    ...sharedConfig(root),
    logLevel: "silent",
    plugins: [plugin],
    build: {
      ssr: true,
      outDir: ssrOutDir,
      rollupOptions: {
        input,
        external: [
          /^@hypeup\//,
        ],
      },
      emptyOutDir: false,
    },
  })

  return ssrOutDir
}

/**
 * Create a Vite dev server with SSR middleware for watch mode.
 * Serves rendered pages over HTTP with live reload.
 */
export async function createDevServer(
  root: string,
  pagesDir: string,
  renderPage: (server: ViteDevServer, page: Page, params?: Record<string, string>) => Promise<string>,
  discoverPages: (pagesDir: string) => Promise<Page[]>,
  options?: { port?: number },
): Promise<ViteDevServer> {
  const { createServer } = await import("vite")
  const plugin = await loadHypeupPlugin()

  const server = await createServer({
    ...sharedConfig(root),
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

              // Only handle GET requests for HTML pages
              if (req.method !== "GET") {
                next()
                return
              }

              // Map URL to a page route
              let route: string
              if (url === "/" || url.endsWith("/")) {
                route = (url === "/" ? "" : url.slice(1)) + "index.html"
              } else if (url.endsWith(".html")) {
                route = url.slice(1)
              } else {
                // Not a page request — let Vite handle static assets etc.
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
                    if (p.params.length === 0) continue
                    const match = matchDynamicRoute(p.route, route)
                    if (match) {
                      page = p
                      params = match
                      break
                    }
                  }
                }

                if (!page) {
                  next()
                  return
                }

                const rawHtml = await renderPage(server, page, params)
                const html = await server.transformIndexHtml(url, rawHtml)

                res.statusCode = 200
                res.setHeader("Content-Type", "text/html")
                res.end(html)
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

  await server.listen()
  server.printUrls()

  return server
}
