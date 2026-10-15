import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"
import { coffeeSyntaxThemes } from "./quartz/util/coffeeTheme"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Narog's Blog",
    pageTitleSuffix: "",
    enableSPA: false,
    enablePopovers: true,
    analytics: null,
    locale: "zh-CN",
    baseUrl: "narroog.github.io",
    ignorePatterns: [
      "private",
      "templates",
      "99-Templates",
      ".obsidian",
      "gallery/scenery/**/*.heic",
      "gallery/scenery/**/*.HEIC",
      "gallery/scenery/**/描述.txt",
      "**/*.log",
      "05-Gallery/Song/**",
    ],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "system-ui",
        body: "system-ui",
        code: "ui-monospace",
      },
      colors: {
        lightMode: {
          light: "#fafafa",
          lightgray: "#e4e4e4",
          gray: "#a0a0a0",
          darkgray: "#4c4c4c",
          dark: "#1d1d1d",
          secondary: "#573b2c",
          tertiary: "#6f503b",
          highlight: "rgba(87, 59, 44, 0.12)",
          textHighlight: "#bdbdbd88",
        },
        darkMode: {
          light: "#181818",
          lightgray: "#363636",
          gray: "#747474",
          darkgray: "#d8d8d8",
          dark: "#f2f2f2",
          secondary: "#bda083",
          tertiary: "#ab896b",
          highlight: "rgba(189, 160, 131, 0.15)",
          textHighlight: "#74747488",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: coffeeSyntaxThemes,
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.CNAME(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
