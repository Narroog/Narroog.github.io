import type { ThemeRegistrationRaw } from "shiki"

function coffeeTheme(dark: boolean): ThemeRegistrationRaw {
  const foreground = dark ? "#d8d8d8" : "#4c4c4c"
  const accent = dark ? "#bda083" : "#573b2c"
  return {
    name: dark ? "coffee-dark" : "coffee-light",
    type: dark ? "dark" : "light",
    colors: {
      "editor.background": dark ? "#202020" : "#ffffff",
      "editor.foreground": foreground,
    },
    settings: [
      { settings: { foreground, background: dark ? "#202020" : "#ffffff" } },
      {
        scope: ["comment", "punctuation.definition.comment"],
        settings: { foreground: dark ? "#a0a0a0" : "#747474" },
      },
      {
        scope: ["keyword", "storage", "entity.name", "entity.other", "constant", "support"],
        settings: { foreground: accent },
      },
      {
        scope: ["string", "markup.heading", "markup.bold"],
        settings: { foreground: dark ? "#ab896b" : "#6f503b" },
      },
      { scope: ["variable", "punctuation", "meta"], settings: { foreground } },
      {
        scope: ["invalid", "markup.deleted", "markup.inserted", "markup.changed"],
        settings: { foreground: accent },
      },
    ],
  }
}

export const coffeeSyntaxThemes = { light: coffeeTheme(false), dark: coffeeTheme(true) }
