import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { resolveRelative } from "../util/path"
import { getDate, formatDate } from "./Date"

const BlogIndex: QuartzComponent = ({ allFiles, cfg, fileData }: QuartzComponentProps) => {
  const posts = allFiles
    .filter((page) => {
      const slug = page.slug ?? ""
      return (
        slug.startsWith("02-Posts/") &&
        !slug.endsWith("/README") &&
        page.frontmatter?.draft !== true
      )
    })
    .sort((a, b) => {
      const dateA = getDate(cfg, a)?.getTime() ?? 0
      const dateB = getDate(cfg, b)?.getTime() ?? 0
      return dateB - dateA
    })

  const tags = Array.from(
    new Set(posts.flatMap((post) => post.frontmatter?.tags ?? []).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

  return (
    <section class="blog-home" aria-labelledby="blog-title">
      <div class="blog-hero">
        <p class="blog-kicker">Notes and Research</p>
        <h1 id="blog-title">博客文章</h1>
        <p>记录技术探索、研究笔记与生活思考。</p>
      </div>

      <div class="blog-filter" aria-label="Blog tag filter">
        <span class="filter-label">标签筛选</span>
        <button class="filter-button active" type="button" data-tag="all">
          全部
        </button>
        {tags.map((tag) => (
          <button class="filter-button" type="button" data-tag={tag}>
            #{tag}
          </button>
        ))}
      </div>

      <div class="blog-grid">
        {posts.map((post) => {
          const postTags = post.frontmatter?.tags ?? []
          const date = getDate(cfg, post)

          return (
            <article class="blog-card" data-tags={postTags.join(" ")}>
              <a class="blog-card-link" href={resolveRelative(fileData.slug!, post.slug!)}>
                <h2>{post.frontmatter?.title ?? post.slug}</h2>
                <p class="blog-card-description">{post.frontmatter?.description ?? ""}</p>
                <div class="blog-card-meta">
                  {date && (
                    <time datetime={date.toISOString()}>{formatDate(date, cfg.locale)}</time>
                  )}
                </div>
                <div class="blog-card-tags">
                  {postTags.map((tag) => (
                    <span>#{tag}</span>
                  ))}
                </div>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

BlogIndex.afterDOMLoaded = `
function setupBlogFilters() {
  const filters = document.querySelectorAll(".filter-button")
  const cards = document.querySelectorAll(".blog-card")
  if (filters.length === 0 || cards.length === 0) return

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const tag = filter.getAttribute("data-tag")
      filters.forEach((button) => button.classList.remove("active"))
      filter.classList.add("active")

      cards.forEach((card) => {
        const tags = (card.getAttribute("data-tags") ?? "").split(" ")
        const visible = tag === "all" || tags.includes(tag ?? "")
        card.classList.toggle("hidden", !visible)
      })
    })
  })
}

document.addEventListener("nav", setupBlogFilters)
`

export default (() => BlogIndex) satisfies QuartzComponentConstructor
