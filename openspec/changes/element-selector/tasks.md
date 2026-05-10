## 1. Babel Plugin — Element Selector in rule()

- [ ] 1.1 In the `rule()` call form handler in `handleEscapeHatch`, check if `args[0]` is a `t.isIdentifier` and look it up in the primitive table
- [ ] 1.2 If the table entry has `kind: "htmlElement"`, replace `args[0]` with `t.stringLiteral(primitive.tag)`
- [ ] 1.3 Check that the identifier is not locally bound (scope binding check) before replacing

## 2. Tests

- [ ] 2.1 Add test: `rule(pre, ...)` compiles to `rule("pre", [...])`
- [ ] 2.2 Add test: `rule(hr, ...)` (void element) compiles to `rule("hr", [...])`
- [ ] 2.3 Add test: `rule(_var, ...)` compiles to `rule("var", [...])` using tag field
- [ ] 2.4 Add test: `rule(".foo", ...)` string selector unchanged
- [ ] 2.5 Add test: locally-bound `div` identifier not replaced
- [ ] 2.6 Add test: non-element identifier left as-is
