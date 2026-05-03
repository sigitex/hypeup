## 1. HMR Runtime

- [ ] 1.1 Create `src/hmr-runtime.ts` in `@hypeup/plugin` with `register()` (proxy registry) and `triggerRedraw()` (dynamic import of `@hypeup/client` redraw)
- [ ] 1.2 Add `"./hmr-runtime": "./src/hmr-runtime.ts"` export to `@hypeup/plugin/package.json`

## 2. HMR Babel Plugin

- [ ] 2.1 Create `src/hmr-babel-plugin.ts` in `@hypeup/plugin` — a Babel visitor that rewrites `export function Foo()` declarations into plain declarations + `register()` calls + `export { ... as Foo }` re-exports
- [ ] 2.2 The plugin receives `moduleId` via plugin options and uses it to construct unique registry keys per export

## 3. Unplugin Transform Integration

- [ ] 3.1 Add dev mode detection to the unplugin (`process.env.NODE_ENV !== "production"`)
- [ ] 3.2 Add project file gating (`id.startsWith(cwd)`) to limit HMR injection to consumer files
- [ ] 3.3 In dev mode for project files, add the HMR Babel plugin to the `transformAsync` plugins array alongside `hypeupBabelPlugin`
- [ ] 3.4 In dev mode for project files, append `import.meta.hot.accept(() => { triggerRedraw() })` snippet after the Babel transform output
- [ ] 3.5 Revert the existing HMR snippet injection that was added directly in unplugin.ts (the naive approach that didn't work)

## 4. Verification

- [ ] 4.1 Run the sigitex.com dev server and confirm editing App.ts triggers HMR update (no full page reload)
- [ ] 4.2 Confirm production build (`vite build`) produces no HMR code in output
