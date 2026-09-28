# hypeup

> Pure TypeScript UI Framework.

hypeup is a beyond-hyperscript style UI framework where all HTML elements and CSS properties are available globally — no imports needed. It supports server-side rendering, client-side mounting, and static site generation.

- Readable markup in TypeScript, no TSX necessary
- Static site generation via `hypeup generate`
- Experimental fast client-side framework inspired by [Mithril](https://mithril.js.org/)
- Build plugins for Vite, esbuild, Rollup, Rolldown, Farm, Bun, webpack, and Rspack

## Markup

HTML elements are available as global functions and render to HTML.

```ts
div(
  span("Password: "),
  input({ type: "password" }),
)
```

Strings, numbers, arrays, etc. are supported as children. In Content position, `false`, `null`, `undefined`, and `""` are **Empty**: they contribute nothing. Numeric zero remains rendered text. Attributes are defined with plain `{}` objects and are strongly typed.

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

Every attribute uses the same value convention, regardless of its HTML name:

- `true` requests presence, serialized without a value on the server.
- `false`, `null`, and `undefined` explicitly remove earlier values.
- Strings are literal: `"false"` is not a removal control.
- Zero becomes `"0"`; an empty ordinary-attribute string remains `name=""`.
- An absent object key contributes nothing; a present nullish key removes the attribute.

Generated attribute types accept these controls while retaining numeric and enumerated-value constraints.

```ts
input({ disabled: true }) // <input disabled>
input({ disabled: false }) // <input>
```

For custom attributes or custom tags, use `attr()` and `elem()`:

```ts
div(attr("data-state", state))
elem("my-widget", attr("custom-attr", "value"))
```

You can pass multiple attribute objects wherever it reads best. Ordinary attributes use **last-value-wins** across object and `attr()` forms, including list-shaped attributes such as `rel`, `aria-labelledby`, `headers`, and `part`. Raw string-valued `style` also replaces earlier raw values; it is not parsed or concatenated with sibling CSS-property helpers.

```ts
a({ rel: "noopener" }, attr("rel", "noreferrer"))
input({ value: "Default" }, { value: "" })
div({ tabindex: 0 }, attr("title", ""))
div({ style: "color: red" }, attr("style", "background: black"))
```

Only `class` accumulates tokens. Dotted classes, `className()`, object `class`, and `attr("class", ...)` all participate, preserving encounter order, duplicates, and supplied spelling. Empty class strings add nothing; explicit false/nullish class values clear earlier tokens.

```ts
a.someClass(
  "My Link",
  { href: "/my_link" },
  { class: "another-class" },
  className("a-third-class"),
)
```

### Conditional Content and Attributes

Place a condition in Content position when false should omit a contribution rather than remove an earlier attribute:

```ts
div({ class: "base" }, isActive && { class: "active" })
div({ class: "base" }, { class: isActive && "active" })
div(attr("title", "Default"), showOverride && attr("title", "Override"))
div(false, null, undefined, "", 0)
```

With `isActive` false, the first element keeps `class="base"`; the second has no class attribute because its explicit attribute value is false. With `showOverride` false, the title remains `Default`. The last element contains the text `0`.

Server rendering, fresh client mounting, and client redraw use the same attribute and class rules. Redraw resolves current contributions in Content order: changing an earlier slot cannot displace an unchanged later value, and removing a later contribution restores an earlier value. Unchanged resolved fields do not trigger DOM writes. Repeated CSS-property helpers follow the same current-order precedence for each property.

Attribute values remain unescaped in VDOM and client DOM APIs. Server serialization escapes quoted values, including classes and generated inline styles; parsing the HTML recovers the original data, including literal entity-like text such as `&amp;`.

**Migration:** Replace reliance on concatenated non-class attributes with a complete final value. Replace attribute-value conditions that previously skipped false/nullish values with Content-position conditions when omission is intended. Use explicit false/nullish attribute values only when removal is intended. These rules do not add object-valued style support or define composition between raw style strings and structured CSS properties.

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

The experimental client runtime provides mounting and event handling for interactive applications.

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

hypeup provides build plugins for using the global DSL in your app. Available for Vite, esbuild, Rollup, Rolldown, Bun, Farm, webpack, and Rspack:

```ts
// vite.config.ts
import { hypeup } from "@hypeup/plugin/vite"

export default {
  plugins: [hypeup()],
}
```

### Syntax Extensions

Pass an `extensions` array to the build plugin to register additional global DSL symbols. The consuming project must declare `@hypeup/lexicon` as a dependency for the build plugin to activate.

```ts
import { hypeup } from "@hypeup/plugin/vite"
import type { HypeupExtension } from "@hypeup/babel"

const utilities = {
  fs: { type: "alias", target: "fontSize" },
  cc: { type: "alias", target: "className" },
  divAlias: { type: "alias", target: "div" },
  m4: { type: "prop", css: "margin", value: "4px" },
  "m4.x": { type: "prop", css: "margin-inline", value: "4px" },
  active: { type: "className", value: "active" },
  box: { type: "alias", target: "panel" },
  panel: {
    type: "element",
    tag: "div",
    className: "container",
    props: { display: "flex" },
    attrs: { role: "region", class: "preset" },
  },
  "panel.sm": { type: "element", tag: "div", className: "container-sm" },
  logo: { type: "element", tag: "img", attrs: { src: "/logo.png" } },
} satisfies HypeupExtension

export default {
  plugins: [hypeup({ extensions: [utilities] })],
}
```

`HypeupExtension` is a flat `Record<string, ExtensionSymbol>`. Both types are exported from `@hypeup/babel`. Each entry has one of four shapes:

| Type | Fields | Behavior |
| --- | --- | --- |
| `alias` | `target: string` | Reuses one built-in or extension entry's syntax. |
| `prop` | `css: string`, `value: string` | A reference emits `prop(css, value)`; not callable. |
| `className` | `value: string` | A reference emits `className(value)`; not callable. |
| `element` | `tag: string`, optional `className`, `props`, `attrs` | Emits an element with predefined content, optionally followed by caller content. |

Element `className` is a string, `props` is a `Record<string, string>` using CSS property names, and `attrs` is a `Record<string, string | boolean>` using HTML attribute names. The tag determines whether to emit `elem` or `elemVoid`.

```ts
panel.activeItem(fs("14px"), m4.x, active, "Hello")
panel
logo({ src: "/brand.png", alt: "Brand" }, className("icon"))
```

Aliases resolve after all definitions are collected. They may refer to later entries, later extensions, dotted entries, or other aliases. Reordering extensions or object entries does not change resolution. Missing targets and direct or indirect alias cycles fail initialization.

An alias names exactly one entry, not its dotted family. In this example, `box.sm` uses `panel` plus the class `sm`; it does not select `panel.sm`. Registering `"box.sm"` explicitly gives that path its own meaning. Built-in aliases retain supported target syntax, such as `fs("14px")`, `fs.inherit`, and `divAlias.activeItem("Hello")`.

#### Dotted Paths and Diagnostics

Dotted keys have no depth limit. Lookup tries the longest registered path first. For example, `panel.sm.activeItem("Hello")` selects `panel.sm`, then adds `active-item` as a class. Unmatched class segments are allowed for element symbols; prop and class-name constants cannot consume trailing segments.

A root entry is optional: registering only `"tokens.small"` leaves bare `tokens` unchanged, while `tokens.small` is transformed. An unresolved plain-dot path such as `tokens.typo` fails compilation rather than leaving an unbound runtime reference. Local bindings of the root suppress both rewriting and extension diagnostics.

Extension paths use plain, noncomputed, non-optional dot access. Bracket access, dynamic keys, and optional chains such as `tokens["small"]`, `tokens[key]`, and `tokens?.small` are not recognized as extension paths.

Calling a prop or class-name constant, including a dotted constant or an alias of one, is a compile-time error: `m4()`, `m4.x()`, and `active()` are invalid unless their root has a local binding.

Duplicate full keys across extensions fail initialization. All built-in roots are reserved, including unused dotted paths beneath them: `div`, `div.card`, and `display.flex` cannot be extension keys. This also excludes CSS names such as `container` and `d`; use custom roots such as `panel` and `divAlias`. Custom-root aliases may still target built-ins.

#### Element Defaults and Caller Content

Element symbols emit content in this order:

1. Predefined `className`.
2. Predefined `props`.
3. Predefined `attrs`.
4. Unmatched dotted class segments, converted to kebab-case.
5. Caller arguments, passed directly without generated thunks.

Bare element references emit only predefined content (and any class suffixes). Void elements retain caller attribute, property, and class contributions even though they cannot contain child content.

Predefined content uses the shared attribute and class semantics described under [Markup](#markup), supplied by `consistent-syntax`; extensions do not introduce a separate runtime policy. Caller attributes replace predefined non-class values in both object and explicit `attr()` form. Caller `false`, `null`, or `undefined` removes an earlier attribute. Class contributions accumulate in order; explicit false/nullish class values clear earlier tokens.

For example, the configured `logo({ src: "/brand.png" })` replaces the predefined source. A button symbol with `attrs: { disabled: true }` can be enabled with `{ disabled: false }`. The configured `panel({ class: "caller" })` retains `container preset caller` in that order.

#### Babel and TypeScript

For direct Babel usage, pass the same definitions to the plugin factory:

```ts
import { transformAsync } from "@babel/core"
import { hypeupBabelPlugin } from "@hypeup/babel"

const result = await transformAsync(source, {
  plugins: [hypeupBabelPlugin({ extensions: [utilities] })],
})
```

Without `extensions`, only built-in primitives are recognized. Extension roots are included in the build plugin's pre-scan, including roots contributed only by dotted keys.

Extension TypeScript declarations remain user-managed: provide ambient declarations matching the configured global names, dotted members, and callable element or alias forms. Configuration alone does not make those names known to TypeScript. Automatic declaration generation belongs to the separate `extension-type-gen` change and is not included here.

## License

MIT
