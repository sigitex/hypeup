#!/usr/bin/env bun
import { parseArgs } from "./args"
import { version as VERSION } from "../package.json"

const USAGE = `
hypeup - static site generator for hypeup components

Usage: hypeup <command> [options]

Commands:
  generate    Generate static output from .html.ts, .css.ts, .md.ts files

Options:
  --version   Print version and exit

Generate options:
  --dir <dir>    Directory to scan for page files (default: ".")
  --out <dir>    Output directory (default: "dist")
  --clean        Remove output directory before generating
  --watch        Start dev server with live reload
  --port <port>  Dev server port (default: 5173)
`.trim()

const commands: Record<string, (flags: Record<string, string | boolean>) => Promise<void>> = {
  generate: async (flags) => {
    const { generate } = await import("./generate")
    await generate(flags)
  },
}

async function main() {
  const { subcommand, flags } = parseArgs(Bun.argv)

  if (flags.version) {
    console.log(VERSION)
    process.exit(0)
  }

  if (subcommand === null) {
    console.log(USAGE)
    process.exit(0)
  }

  const handler = commands[subcommand]
  if (!handler) {
    console.error(`Unknown command: ${subcommand}\n`)
    console.error(USAGE)
    process.exit(1)
  }

  await handler(flags)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
