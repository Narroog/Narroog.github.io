import assert from "node:assert/strict"
import test from "node:test"
import { getTagColor } from "./tagColor"

test("main article topics have distinct, stable colors", () => {
  assert.equal(getTagColor("Ai4Research"), "blue")
  assert.equal(getTagColor("Science"), "green")
  assert.equal(getTagColor("Transistor"), "amber")
  assert.equal(getTagColor(" Science "), getTagColor("science"))
})

test("new and unusual tags produce stable palette colors", () => {
  const palette = new Set(["blue", "green", "amber", "violet", "teal", "slate"])
  for (const tag of ["新标签", "Engineering", "__proto__", "constructor", ""]) {
    assert.ok(palette.has(getTagColor(tag)))
    assert.equal(getTagColor(tag), getTagColor(tag))
  }
})
