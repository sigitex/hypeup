# Ideas

⚠️ After `hypeup-config-file` is merged: Update the `syntax-extensions` proposal.

## Extensible global dsl via packages

- abbreviated dsl
```
cc
m p [lrtbvh] [n]
  m1 m2 m4 ... m8 m10 m12 m14 m16 m18 ...
  mt1 mt2 mx24
  pr10
fs ff fw lh [n]
  fw100 fw200 fw300 ...
fg bg bgi
wi hi
```

- hypewind - automatically generate based on tailwind
  - function abbreviations to support eg `.bg-#f0f0f0`
  - constants for eg `.bg-red-100`

## Comment node

explore special `style` tag handling to support it there (rule is easy)

## Array rule selector
```ts
rule([h1, h2, h3])
```

## SSG: different routing, custom routing
