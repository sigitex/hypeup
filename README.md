# hypeup

> Pure TypeScript UI Framework.

hypeup is a beyond-hyperscript style UI framework where all HTML elements and CSS properties are available globally — no imports needed. It supports server-side rendering, client-side mounting, and static site generation.

- Readable markup in TypeScript, no TSX necessary
- Class shorthand on elements and rules
- Inline styles
- Static site generation via `hypeup generate`
- Fast client-side framework inspired by [Mithril](https://mithril.js.org/)
- Build plugins for Vite, esbuild, Rollup, webpack, and Rspack

## Markup

All HTML elements are global functions which create virtual DOM nodes. At render time, these are converted to HTML.

```ts
div(
  span("Password: "),
  input({ type: "password" }),
)
```

Strings, numbers, arrays, etc. are supported as children. `null`, `undefined`, and `false` render as empty. Attributes are defined with plain `{}` objects.

Multiple objects can be defined for convenient composition, and these can appear *after* child elements, text nodes, etc.

```ts
a.someClass(
  "My Link",
  { href: "/my_link" },
  { class: "another-class" },
  className("a-third-class"),
)
```

The `raw` function will skip HTML escaping for its contents:

```ts
raw("<span>hello!</span>")

`raw` can also be used to inject custom CSS inside rules & at-rules.

```

### Element Class Shorthand

You can apply classes directly to element functions:

```ts
div(
  div.redBold("this is bold and red!"),
  div.redBold.alsoItalic("this has two classes!"),
)
```

Class names are automatically converted to `kebab-case`.

## Styles

All standard and known vendor-specific CSS properties are global functions:

```ts
color("#ff0000"),
border("solid 1px red"),
webkitBorderImageWidth("4px"),
```

Standard values are also available as properties on these functions:

```ts
color.red,
borderStyle.dashed,
```

### Inline Styles

You can add CSS properties directly to elements:

```ts
div(
  color.red,
  fontWeight.bold,
  "this is bold and red!",
)
```

### Rules

The `rule` function defines CSS rules within `style` elements. Custom properties may use the `prop` function.

```ts
style(
  rule(".red-bold",
    color.red,
    fontWeight.bold,
    prop("--some-custom", "value"),
  ),
)
```

#### Rule Class Shorthand

Class names may be used as selectors via dot syntax (converted to `kebab-case`):

```ts
rule.container(
  width("1200px"),
)
```

Element functions may be used as selectors:

```ts
rule(textarea,
  borderColor.black,
)
```

### Nested Rules

Rules may be nested:

```ts
rule(".danger",
  color.red,
  rule(".icon",
    float.right,
  ),
)
```

Child selectors can be combined with the parent selector, similar to Sass and Less.js. This example produces two rules, the second with the selector `.danger.large`:

```ts
rule(".danger",
  color.red,
  rule("&.large",
    fontSize("40px"),
  ),
)
```

Nested selectors with pseudo-classes:

```ts
rule(a,
  color.red,
  textDecorationLine.none,
  rule(":hover",
    textDecorationLine.underline,
  ),
)
```

Multiple selectors in a rule generate the necessary CSS:

```ts
rule("input, textarea",
  border("solid 1px gray"),
  rule(":hover, :focus",
    borderColor.black,
  ),
)
```

#### Native CSS Nesting

Use the `/` prefix to render child rules inline inside the parent block (native CSS nesting) instead of flattening:

```ts
rule(".parent",
  color.red,
  rule("/.child",
    color.blue,
  ),
)
```

This produces `.parent{color:red.child{color:blue}}` -- the child rule is nested inside the parent's braces. The `/` is stripped from the output.

The `/` works with any selector: `/&:hover`, `/.className`, `/ > li`, etc. Non-slash child rules continue to flatten as before.

### At-rules

Media queries and other at-rules are supported with the `$` prefix:

```ts
$media("(prefers-color-scheme: dark)",
  rule(":root",
    prop("--fg", "white"),
    prop("--bg", "black"),
  ),
)
```

```ts
$layer(
  rule("p",
    color.red,
  ),
)
```

## Components

Components are plain functions that return markup:

```ts
function Greeting(name: string) {
  return div(
    h1("Hello, ", name, "!"),
    p("Welcome to the site."),
  )
}
```

Used as regular function calls:

```ts
div(
  Greeting("world"),
  Greeting("hypeup"),
)
```

Components can accept any arguments and return elements, arrays, or any valid content. There is no special component protocol — just functions returning content. You *should* capitalize their names though — the transformer will produce optimized output.

## Client Runtime

The client runtime provides mounting and event handling for interactive applications.

### Mounting

```ts
import "@hypeup/lexicon"
import { mount } from "@hypeup/client"

function App() {
  return div(
    h1("Hello, world!"),
  )
}

mount(document.getElementById("app")!, () => App())
```

### Events

Use `on` to bind event handlers:

```ts
button(
  "Click me",
  on("click", () => {
    console.log("clicked!")
  }),
)
```

### Redraw

Call `redraw()` after mutating state to re-render the mounted component tree. The runtime patches the DOM in place.

### Refs

Use `ref` to get a reference to a DOM element:

```ts
const myInput = ref<HTMLInputElement>()

input(myInput, { type: "text" })

// later...
myInput.current?.focus()
```

### Lists

Use `each` to render lists with efficient reconciliation:

```ts
each(items, (item) => li(item.name))
```

With a key function for stable identity:

```ts
each(items, (item) => item.id, (item) => li(item.name))
```

## Static Site Generation

The `hypeup` CLI generates static output from files using a double-extension convention. The first extension is the target format and the second is the source language:

- `.html.ts` / `.html.js` -- generates an HTML file
- `.css.ts` / `.css.js` -- generates a CSS file
- `.md.ts` / `.md.js` -- generates a Markdown file

If the build tool supports other languages, those work too (e.g. `.html.civet`).

```sh
hypeup generate --dir src --out dist
```

### Configuration File

Project defaults can live in `hypeup.config.ts` at the project root:

```ts
import { defineConfig } from "hypeup"

export default defineConfig({
  dir: "src",
  out: "dist",
  clean: true,
  port: 5173,
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
      },
    },
  },
})
```

Supported config files are checked in this order: `hypeup.config.ts`, `hypeup.config.js`, `hypeup.config.mjs`, `hypeup.config.json`. Script configs can default-export either an object or a function returning an object. JSON config supports `dir`, `out`, `clean`, and `port`; any `vite` key in JSON is ignored.

CLI flags override config file values:

```sh
hypeup generate --out build
```

The `vite` key is merged into the internal Vite config used for both one-shot generation and `--watch` mode. hypeup's required plugin and SSR settings are applied after user config so they cannot be overridden.

### File Convention

Each file's default export should be a function returning content. For HTML files, return elements:

```ts
// index.html.ts
import "@hypeup/lexicon"

export default function Index() {
  return [
    doctype.html5,
    html(
      head(title("My Site")),
      body(
        h1("Hello!"),
      ),
    ),
  ]
}
```

### Layouts

Layouts are plain functions:

```ts
// shared/layout.ts
import "@hypeup/lexicon"

export default function layout(...content: Content[]) {
  return [
    doctype.html5,
    html(
      head(
        meta({ charset: "UTF-8" }),
        title("My Site"),
      ),
      body(content),
    ),
  ]
}
```

Used in page files:

```ts
// about.html.ts
import layout from "./shared/layout"

export default function About() {
  return layout(
    h1("About"),
    p("This is the about page."),
  )
}
```

### Dynamic Routes

Parameterized routes use square brackets in the filename. Export a `getStaticPaths` function to provide the values at build time:

```ts
// [slug].html.ts
import layout from "./shared/layout"

export default function Post({ slug }: { slug: string }) {
  const post = getPost(slug)
  return layout(
    h1(post.title),
    p(post.body),
  )
}

export async function getStaticPaths() {
  return getAllPosts() // [{ slug: "hello" }, { slug: "world" }]
}
```

### Dev Server

Use `--watch` to start a dev server with live reload:

```sh
hypeup generate --dir src --watch --port 5173
```

### Options

```
hypeup generate [options]

  --dir <dir>    Directory to scan (default: ".")
  --out <dir>    Output directory (default: "dist")
  --clean        Remove output directory before generating
  --watch        Start dev server with live reload
  --port <port>  Dev server port (default: 5173)
```

## Build Plugin

hypeup provides a build plugin (via [unplugin](https://github.com/unjs/unplugin)) that transforms your source files so the global DSL functions resolve to the runtime. Available for Vite, esbuild, Rollup, webpack, and Rspack:

```ts
// vite.config.ts
import hypeup from "@hypeup/plugin/vite"

export default {
  plugins: [hypeup()],
}
```

## License

MIT
