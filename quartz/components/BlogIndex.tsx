import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { htmlToJsx } from "../util/jsx"
import { visit } from "unist-util-visit"
import { getDate, formatDate } from "./Date"
import { CoffeeCards, coffeeStyle } from "./Coffee"
import { getTagColor } from "../util/tagColor"

const BlogIndex: QuartzComponent = (props: QuartzComponentProps) => {
  const { allFiles, cfg, fileData, ctx } = props
  if (fileData.slug === "blog") {
    return (
      <section class="blog-home" aria-labelledby="blog-title">
        <div class="blog-hero">
          <h1 id="blog-title">Blog</h1>
        </div>
        <nav class="gallery-categories" aria-label="Blog sections">
          {["Research", "Meditations", "Gallery", "Review"].map((section) => (
            <a
              class="gallery-category"
              href={resolveRelative(fileData.slug!, section.toLowerCase() as FullSlug)}
            >
              <span>{section}</span>
              <span class="blog-section-arrow" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  focusable="false"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </span>
            </a>
          ))}
        </nav>
      </section>
    )
  }
  if (fileData.slug === "gallery") {
    return (
      <section class="blog-home" aria-labelledby="gallery-title">
        <div class="blog-hero">
          <h1 id="gallery-title">Gallery</h1>
        </div>
        <div class="gallery-exhibition">
          {["Coffee", "Scenery", "Song"].map((category) => {
            const prefix = `05-Gallery/${category}/`
            if (category === "Coffee")
              return (
                <section class="gallery-section" aria-labelledby="gallery-coffee">
                  <h2 id="gallery-coffee">Coffee</h2>
                  <CoffeeCards {...props} />
                </section>
              )
            const media = ctx.allSlugs
              .filter(
                (slug) =>
                  slug.startsWith(prefix) &&
                  /\.(avif|webp|png|jpe?g|gif|svg|mp3|m4a|ogg|wav|flac|mp4|webm|mov)$/i.test(slug),
              )
              .sort((a, b) => a.localeCompare(b, cfg.locale, { numeric: true }))
            const notes = allFiles.filter(
              (page) =>
                page.slug?.startsWith(prefix) &&
                !page.slug.endsWith("/README") &&
                page.frontmatter?.draft !== true &&
                page.htmlAst?.children.some((child) => child.type === "element"),
            )
            return (
              <section
                class="gallery-section"
                aria-labelledby={`gallery-${category.toLowerCase()}`}
              >
                <h2 id={`gallery-${category.toLowerCase()}`}>{category}</h2>
                {media.length === 0 && notes.length === 0 && <p class="gallery-empty">暂无内容</p>}
                <div class="gallery-media-grid">
                  {media.map((slug) => {
                    const src = resolveRelative(fileData.slug!, slug)
                    const title = slug
                      .split("/")
                      .pop()!
                      .replace(/\.[^.]+$/, "")
                      .replace(/[-_]/g, " ")
                    return (
                      <figure class="gallery-media">
                        {/\.(mp3|m4a|ogg|wav|flac)$/i.test(slug) ? (
                          <audio controls preload="none" src={src} aria-label={title} />
                        ) : /\.(mp4|webm|mov)$/i.test(slug) ? (
                          <video
                            controls
                            playsInline
                            preload="metadata"
                            src={src}
                            aria-label={title}
                          />
                        ) : (
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`查看原图：${title}`}
                          >
                            <img src={src} alt={title} loading="lazy" decoding="async" />
                          </a>
                        )}
                        <figcaption>{title}</figcaption>
                      </figure>
                    )
                  })}
                </div>
                {notes.map((page) => {
                  const rebasedTree = structuredClone(page.htmlAst!)
                  const base = new URL(`${page.slug}.html`, "https://gallery.invalid/")
                  visit(rebasedTree, "element", (node) => {
                    for (const attr of ["src", "href", "poster"]) {
                      const value = node.properties[attr]
                      if (typeof value !== "string" || !/^\.{1,2}\//.test(value)) continue
                      const target = new URL(value, base)
                      node.properties[attr] =
                        resolveRelative(fileData.slug!, target.pathname.slice(1) as FullSlug) +
                        target.search +
                        target.hash
                    }
                  })
                  return (
                    <div class="gallery-note">
                      {!page.slug!.endsWith("/index") && <h3>{page.frontmatter?.title}</h3>}
                      {htmlToJsx(page.filePath!, rebasedTree)}
                    </div>
                  )
                })}
              </section>
            )
          })}
        </div>
      </section>
    )
  }

  const sections: Record<string, { title: string; label: string; folder: string; empty: string }> =
    {
      research: { title: "Research", label: "Research", folder: "02-Posts/", empty: "" },
      meditations: {
        title: "Meditations",
        label: "Meditations",
        folder: "04-Meditations/",
        empty: "思考正在酝酿，敬请期待。",
      },
      gallery: {
        title: "Gallery",
        label: "Gallery",
        folder: "05-Gallery/",
        empty: "作品正在整理，敬请期待。",
      },
      review: {
        title: "Review",
        label: "Review",
        folder: "06-Review/",
        empty: "评论正在整理，敬请期待。",
      },
    }
  const sectionSlug = fileData.slug && sections[fileData.slug] ? fileData.slug : "research"
  const section = sections[sectionSlug]
  const posts = allFiles
    .filter((page) => {
      const slug = page.slug ?? ""
      return (
        slug.startsWith(section.folder) &&
        !slug.endsWith("/README") &&
        !slug.endsWith("/index") &&
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
        <h1 id="blog-title">{section.title}</h1>
      </div>

      <div class="blog-filter" aria-label={`${section.label} tag filter`}>
        <span class="filter-label">标签筛选</span>
        <a
          class="filter-button active"
          href={resolveRelative(fileData.slug!, sectionSlug as FullSlug)}
          data-tag="all"
        >
          全部
        </a>
        {tags.map((tag) => (
          <a
            class="filter-button"
            href={resolveRelative(fileData.slug!, `tags/${tag}` as FullSlug)}
            data-tag={tag}
            data-tag-color={getTagColor(tag)}
          >
            #{tag}
          </a>
        ))}
      </div>

      <div class="blog-grid">
        {section.empty && posts.length === 0 && <p>{section.empty}</p>}
        {posts.map((post) => {
          const postTags = post.frontmatter?.tags ?? []
          const date = getDate(cfg, post)

          return (
            <article class="blog-card" data-tags={postTags.join(" ")}>
              <a class="blog-card-link" href={resolveRelative(fileData.slug!, post.slug!)}>
                {postTags.length > 0 && (
                  <div class="blog-card-tags">
                    {postTags.map((tag) => (
                      <span data-tag-color={getTagColor(tag)}>#{tag}</span>
                    ))}
                  </div>
                )}
                <h2>{post.frontmatter?.title ?? post.slug}</h2>
                <p class="blog-card-description">{post.frontmatter?.description ?? ""}</p>
                <div class="blog-card-meta">
                  {date && (
                    <time datetime={date.toISOString()}>{formatDate(date, cfg.locale)}</time>
                  )}
                </div>
              </a>
            </article>
          )
        })}
      </div>
    </section>
  )
}

BlogIndex.css = coffeeStyle

BlogIndex.afterDOMLoaded = `
function setupBlogFilters() {
  const filters = document.querySelectorAll(".filter-button")
  const cards = document.querySelectorAll(".blog-card")
  if (filters.length === 0 || cards.length === 0) return

  filters.forEach((filter) => {
    if (filter.dataset.blogFilterReady === "true") return
    filter.dataset.blogFilterReady = "true"
    filter.addEventListener("click", (event) => {
      event.preventDefault()
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

setupBlogFilters()
document.addEventListener("nav", setupBlogFilters)
`

export default (() => BlogIndex) satisfies QuartzComponentConstructor
