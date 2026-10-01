declare type Content = any

declare module "cssesc" {
  function cssesc(string: string, options?: { wrap?: boolean }): string
  export default cssesc
}
