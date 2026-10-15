import assert from "node:assert/strict"
import test from "node:test"
import { getTagColor } from "./tagColor"

test("all article topics use the coffee palette", () => {
  for (const tag of ["Ai4Research", "Science", "Transistor", " Science ", "science"]) {
    assert.equal(getTagColor(tag), "coffee")
  }
})

test("new and unusual tags also use the coffee palette", () => {
  for (const tag of ["新标签", "Engineering", "__proto__", "constructor", ""]) {
    assert.equal(getTagColor(tag), "coffee")
  }
})
