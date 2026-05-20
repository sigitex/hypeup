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

HTML elements are available as global functions and render to HTML.

```ts
div(
  span("Password: "),
  input({ type: "password" }),
)
```

Strings, numbers, arrays, etc. are supported as children. `null`, `undefined`, and `false` render as empty. Attributes are defined with plain `{}` objects and are strongly typed.

```ts
div({ id: "profile", class: "card" })
input({ type: "password", placeholder: "Password", readonly: true, maxlength: 40 })
label({ for: "email" }, "Email")
```

Attribute names use HTML spelling, not DOM property aliases. For example, use `readonly`, `maxlength`, and `for` instead of `readOnly`, `maxLength`, and `htmlFor`.

Common attribute values are typed for autocomplete and validation, while open-ended values such as custom link targets are still allowed.

```ts
input({ type: "email" })
a({ target: "preview-window" })
```

Boolean attributes render naturally: `true` includes the attribute and `false` omits it.

```ts
input({ disabled: true }) // <input disabled>
input({ disabled: false }) // <input>
```

For custom attributes or custom tags, use `attr()` and `elem()`:

```ts
div(attr("data-state", state))
elem("my-widget", attr("custom-attr", "value"))
```

You can pass multiple attribute objects wherever it reads best.

```ts
a.someClass(
  "My Link",
  { href: "/my_link" },
  { class: "another-class" },
  className("a-third-class"),
)
```

Use `raw()` for content that should not be escaped:

```ts
raw("<span>hello!</span>")
```

`raw()` can also be used inside rules and at-rules.

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

Use `rule()` for CSS rules and `prop()` for custom properties.

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

Use `&` to combine a nested selector with its parent:

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

Prefix a nested selector with `/` to keep it nested in the output:

```ts
rule(".parent",
  color.red,
  rule("/.child",
    color.blue,
  ),
)
```

The `/` is removed when rendering. This also works with selectors such as `/&:hover`, `/.className`, and `/ > li`.

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

Components are just functions. They can accept any arguments and return any valid content. Capitalize component names so build tools can optimize them.

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

Call `redraw()` after mutating state to update the page.

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

Config files can be TypeScript, JavaScript, ESM, or JSON.

CLI flags override config file values:

```sh
hypeup generate --out build
```

Use the `vite` key to customize Vite during generation and watch mode.

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

hypeup provides build plugins for using the global DSL in your app. Available for Vite, esbuild, Rollup, webpack, and Rspack:

```ts
// vite.config.ts
import hypeup from "@hypeup/plugin/vite"

export default {
  plugins: [hypeup()],
}
```

## License

MIT
