const tagColors = ["blue", "green", "amber", "violet", "teal", "slate"] as const
type TagColor = (typeof tagColors)[number]

// Explicit assignments keep the site's main topics visually distinct.
const topicColors: Record<string, TagColor> = {
  ai4research: "blue",
  science: "green",
  transistor: "amber",
}

export function getTagColor(tag: string): TagColor {
  const normalized = tag.trim().toLowerCase()
  const topicColor = Object.hasOwn(topicColors, normalized) ? topicColors[normalized] : undefined
  if (topicColor) return topicColor

  // New tags retain their color regardless of article order or filtering.
  let hash = 0
  for (const character of normalized) {
    hash = (Math.imul(hash, 31) + character.codePointAt(0)!) >>> 0
  }
  return tagColors[hash % tagColors.length]
}
