## 1. Babel Plugin — Element Selector in rule()

- [x] 1.1 In the `rule()` call form handler in `handleEscapeHatch`, check if `args[0]` is a `t.isIdentifier` and look it up in the primitive table
- [x] 1.2 If the table entry has `kind: "htmlElement"`, replace `args[0]` with `t.stringLiteral(primitive.tag)`
- [x] 1.3 Check that the identifier is not locally bound (scope binding check) before replacing

## 2. Tests

- [x] 2.1 Add test: `rule(pre, ...)` compiles to `rule("pre", [...])`
- [x] 2.2 Add test: `rule(hr, ...)` (void element) compiles to `rule("hr", [...])`
- [x] 2.3 Add test: `rule(_var, ...)` compiles to `rule("var", [...])` using tag field
- [x] 2.4 Add test: `rule(".foo", ...)` string selector unchanged
- [x] 2.5 Add test: locally-bound `div` identifier not replaced
- [x] 2.6 Add test: non-element identifier left as-is
