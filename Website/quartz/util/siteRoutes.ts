// Content directories define the public URLs. Keep navigation and layouts in sync.
export const blogSections = {
  research: {
    title: "Research",
    label: "研究",
    slug: "blog/research/index",
    folder: "blog/research/",
    description: "对科研的方法与思考",
    empty: "暂无已发布文章。",
  },
  meditations: {
    title: "Meditations",
    label: "沉思",
    slug: "blog/meditations/index",
    folder: "blog/meditations/",
    description: "一些抽象的胡思乱想",
    empty: "暂无已发布文章。",
  },
  review: {
    title: "Review",
    label: "评论",
    slug: "blog/review/index",
    folder: "blog/review/",
    description: "对他人作品的评述",
    empty: "暂无已发布文章。",
  },
} as const

export function isBlogIndex(slug?: string) {
  return (
    slug === "blog/index" || Object.values(blogSections).some((section) => section.slug === slug)
  )
}

export function isCollectionIndex(slug?: string) {
  return isBlogIndex(slug) || slug === "gallery/index" || slug === "gallery/song/index"
}

export function isLandingPage(slug?: string) {
  return isCollectionIndex(slug) || ["index", "about"].includes(slug ?? "")
}
