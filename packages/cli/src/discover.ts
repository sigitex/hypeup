import { resolve } from "node:path"

/** Allowlisted target output formats. */
export const TARGET_FORMATS = ["html", "css", "md"] as const

export type Page = {
  /** Absolute path to the source file */
  filePath: string
  /** Output path relative to output dir (e.g. "blog/post.html", "styles.css") */
  route: string
  /** Dynamic param segments (e.g. ["slug"] for "[slug].html.ts") */
  params: string[]
}

/** Extract dynamic param names from a route (e.g. "[slug]" -> ["slug"]). */
export function extractParams(relativePath: string): string[] {
  const matches = relativePath.match(/\[(\w+)\]/g)
  if (!matches) {
    return []
  }
  return matches.map((m) => m.slice(1, -1))
}

/** Map a file path (relative to pages dir) to an output path by stripping the final (source) extension. */
export function mapRoute(relativePath: string): string {
  const lastDot = relativePath.lastIndexOf(".")
  if (lastDot === -1) return relativePath
  return relativePath.slice(0, lastDot)
}

/** Resolve a dynamic route template with params (e.g. "blog/[slug].html" + {slug:"hi"} -> "blog/hi.html"). */
export function resolveRoute(
  routeTemplate: string,
  params: Record<string, string>,
): string {
  return routeTemplate.replace(/\[(\w+)\]/g, (_, key) => {
    if (!(key in params)) {
      throw new Error(`Missing param "${key}" for route "${routeTemplate}"`)
    }
    return params[key]
  })
}

/** Discover page files in the given directory. */
export async function discoverPages(dir: string): Promise<Page[]> {
  const resolved = resolve(dir)

  // Validate directory exists and is a directory
  const { stat: fsStat } = await import("node:fs/promises")

  let stats: Awaited<ReturnType<typeof fsStat>>
  try {
    stats = await fsStat(resolved)
  } catch {
    throw new Error(`Directory not found: ${resolved}`)
  }

  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${resolved}`)
  }

  // Glob for files with allowlisted target format as middle extension
  const glob = new Bun.Glob(`**/*.{${TARGET_FORMATS.join(",")}}.*`)
  const entries: Page[] = []

  for await (const path of glob.scan({ cwd: resolved })) {
    // Exclude node_modules and .git directories
    if (path.includes("node_modules/") || path.includes(".git/")) {
      continue
    }

    entries.push({
      filePath: resolve(resolved, path),
      route: mapRoute(path),
      params: extractParams(path),
    })
  }

  // Sort for deterministic output
  entries.sort((a, b) => a.route.localeCompare(b.route))

  return entries
}
