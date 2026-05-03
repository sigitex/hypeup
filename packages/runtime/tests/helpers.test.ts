import { describe, expect, test } from "bun:test"
import { CssClass } from "@hypeup/vdom"
import { className } from "../src/helpers"

describe("className", () => {
  test("single argument returns one-element CssClass array", () => {
    const result = className("active")
    expect(result).toHaveLength(1)
    expect(result[0]).toBeInstanceOf(CssClass)
    expect(result[0].name).toBe("active")
  })

  test("multiple arguments return correctly ordered CssClass array", () => {
    const result = className("foo", "bar", "baz")
    expect(result).toHaveLength(3)
    expect(result[0]).toBeInstanceOf(CssClass)
    expect(result[0].name).toBe("foo")
    expect(result[1]).toBeInstanceOf(CssClass)
    expect(result[1].name).toBe("bar")
    expect(result[2]).toBeInstanceOf(CssClass)
    expect(result[2].name).toBe("baz")
  })
})
