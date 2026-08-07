import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [Component.TopNav()],
  afterBody: [
    Component.ConditionalRender({
      component: Component.Comments({
        provider: "giscus",
        options: {
          repo: "Narroog/Narroog.github.io",
          repoId: "R_kgDOSTzMXg",
          category: "Announcements",
          categoryId: "DIC_kwDOSTzMXs4DBMz9",
          mapping: "pathname",
          strict: false,
          reactionsEnabled: true,
          inputPosition: "top",
          lang: "zh-CN",
          lightTheme: "light",
          darkTheme: "dark",
        },
      }),
      condition: (page) =>
        page.fileData.slug === "about" ||
        (page.fileData.slug?.startsWith("02-Posts/") === true &&
          !page.fileData.slug.endsWith("/README") &&
          !page.fileData.slug.endsWith("/index")),
    }),
  ],
  footer: Component.Footer({
    links: {},
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.BackHome(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "blog" &&
        page.fileData.slug !== "about" &&
        page.fileData.slug !== "profile",
    }),
    Component.ConditionalRender({
      component: Component.HomePage(),
      condition: (page) => page.fileData.slug === "index",
    }),
    Component.ConditionalRender({
      component: Component.BlogIndex(),
      condition: (page) => page.fileData.slug === "blog",
    }),
    Component.ConditionalRender({
      component: Component.ProfilePage(),
      condition: (page) => page.fileData.slug === "profile",
    }),
    Component.ConditionalRender({
      component: Component.ArticleTitle(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "blog" &&
        page.fileData.slug !== "profile",
    }),
    Component.ConditionalRender({
      component: Component.ContentMeta(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "blog" &&
        page.fileData.slug !== "about" &&
        page.fileData.slug !== "profile",
    }),
    Component.ConditionalRender({
      component: Component.TagList(),
      condition: (page) =>
        page.fileData.slug !== "index" &&
        page.fileData.slug !== "blog" &&
        page.fileData.slug !== "about" &&
        page.fileData.slug !== "profile",
    }),
  ],
  left: [],
  right: [],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [],
  right: [],
}
