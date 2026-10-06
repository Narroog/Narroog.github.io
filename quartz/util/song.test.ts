import assert from "node:assert/strict"
import { test } from "node:test"
import { activeLyricAt, formatSongTime } from "./song"

test("lyrics follow seeking, exact boundaries, instrumental gaps, and the outro", () => {
  const lines = [
    { start: 10, end: 15, text: "first" },
    { start: 15, end: 20, text: "second" },
    { start: 30, end: 34, text: "repeated chorus" },
  ]
  for (const [time, expected] of [
    [0, -1],
    [10, 0],
    [14.99, 0],
    [15, 1],
    [20, -1],
    [29, -1],
    [30, 2],
    [34, -1],
    [12, 0],
  ]) {
    assert.equal(activeLyricAt(lines, time), expected)
  }
  assert.equal(activeLyricAt([], 10), -1)
  assert.equal(activeLyricAt(lines, NaN), -1)
})

test("player times stay readable while metadata loads", () => {
  assert.equal(formatSongTime(NaN), "0:00")
  assert.equal(formatSongTime(-1), "0:00")
  assert.equal(formatSongTime(225.779), "3:45")
})
