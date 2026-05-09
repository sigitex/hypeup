export type ParsedArgs = {
  subcommand: string | null
  flags: Record<string, string | boolean>
}

/** Parse Bun.argv into a subcommand and flags. */
export function parseArgs(argv: string[]): ParsedArgs {
  // argv[0] = bun, argv[1] = script path, rest = user args
  const args = argv.slice(2)
  let subcommand: string | null = null
  const flags: Record<string, string | boolean> = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg.startsWith("--")) {
      const eqIndex = arg.indexOf("=")
      if (eqIndex !== -1) {
        // --flag=value
        const key = arg.slice(2, eqIndex)
        flags[key] = arg.slice(eqIndex + 1)
      } else {
        const key = arg.slice(2)
        const next = args[i + 1]
        if (next !== undefined && !next.startsWith("--")) {
          // --flag value
          flags[key] = next
          i++
        } else {
          // boolean flag
          flags[key] = true
        }
      }
    } else if (subcommand === null) {
      subcommand = arg
    }
  }

  return { subcommand, flags }
}
