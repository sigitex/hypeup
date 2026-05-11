## 1. Renderer — Slash-Prefix Nested Rules

- [ ] 1.1 In `renderRule`, when iterating child rules, check if the child rule's selector starts with `/`
- [ ] 1.2 For `/`-prefixed rules: strip the `/`, emit the child rule inline inside the parent's braces (recursive `renderRule` call without `prefix`)
- [ ] 1.3 Restructure `renderRule` to separate inline nested rules from flattened rules — inline rules emit inside the braces block, flattened rules emit after
- [ ] 1.4 Ensure the parent rule emits braces even when it has no properties but has inline nested children

## 2. Tests

- [ ] 2.1 Add test: `rule("/.child", ...)` inside parent renders inline as native CSS nesting
- [ ] 2.2 Add test: `rule("/&:hover", ...)` renders inline with `&` preserved
- [ ] 2.3 Add test: `rule("/> li", ...)` renders inline with child combinator
- [ ] 2.4 Add test: non-slash child rules still flatten (existing behavior)
- [ ] 2.5 Add test: mixed slash and non-slash children in same parent
- [ ] 2.6 Add test: deeply nested slash rules (`/.a` > `/.b` > `/.c`)
