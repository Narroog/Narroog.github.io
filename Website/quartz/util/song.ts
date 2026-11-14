export interface LyricLine {
  start: number
  end: number
  text: string
}

// End times matter: an instrumental break must not keep highlighting an old line.
export function activeLyricAt(lines: LyricLine[], time: number): number {
  if (!Number.isFinite(time)) return -1
  let low = 0
  let high = lines.length - 1
  let candidate = -1
  while (low <= high) {
    const middle = (low + high) >>> 1
    if (lines[middle].start <= time) {
      candidate = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }
  return candidate >= 0 && time < lines[candidate].end ? candidate : -1
}

export function formatSongTime(seconds: number): string {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`
}
