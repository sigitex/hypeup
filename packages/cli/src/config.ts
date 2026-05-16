import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import type { UserConfig } from "vite"

export type HypeupConfig = {
  dir?: string
  out?: string
  clean?: boolean
  port?: number
  vite?: UserConfig
}

export type HypeupConfigExport = HypeupConfig | (() => HypeupConfig)

export type ResolvedHypeupConfig = {
  dir: string
  out: string
  clean: boolean
  port?: number
  vite?: UserConfig
}

const configFiles = [
  "hypeup.config.ts",
  "hypeup.config.js",
  "hypeup.config.mjs",
  "hypeup.config.json",
] as const

export function defineConfig<T extends HypeupConfigExport>(config: T): T {
  return config
}

export async function loadConfig(root = process.cwd()): Promise<HypeupConfig> {
  const configPath = configFiles
    .map((file) => resolve(root, file))
    .find((file) => existsSync(file))

  if (!configPath) {
    return {}
  }

  try {
    if (configPath.endsWith(".json")) {
      return stripStaticConfig(JSON.parse(readFileSync(configPath, "utf-8")))
    }

    const mod = await import(pathToFileURL(configPath).href)
    const exported = mod.default
    const config = typeof exported === "function" ? exported() : exported

    if (!isConfigObject(config)) {
      throw new Error("Config default export must be an object or a function returning an object")
    }

    return config
  } catch (error) {
    console.error(`Failed to load config ${configPath}:`)
    console.error(error)
    process.exit(1)
  }
}

export function mergeConfig(
  defaults: ResolvedHypeupConfig,
  config: HypeupConfig,
  flags: Record<string, string | boolean>,
): ResolvedHypeupConfig {
  return {
    dir: getStringFlag(flags.dir) ?? config.dir ?? defaults.dir,
    out: getStringFlag(flags.out) ?? config.out ?? defaults.out,
    clean: flags.clean === true ? true : config.clean ?? defaults.clean,
    port: getNumberFlag(flags.port) ?? config.port ?? defaults.port,
    vite: config.vite ?? defaults.vite,
  }
}

function stripStaticConfig(value: unknown): HypeupConfig {
  if (!isConfigObject(value)) {
    throw new Error("Config file must contain an object")
  }

  const { vite: _vite, ...config } = value
  return config
}

function isConfigObject(value: unknown): value is HypeupConfig {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getStringFlag(value: string | boolean | undefined) {
  return typeof value === "string" ? value : undefined
}

function getNumberFlag(value: string | boolean | undefined) {
  if (typeof value !== "string") {
    return undefined
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}
