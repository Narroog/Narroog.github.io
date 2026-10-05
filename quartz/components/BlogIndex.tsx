import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { htmlToJsx } from "../util/jsx"
import { visit } from "unist-util-visit"
import { getDate, formatDate } from "./Date"
import { CoffeeCards, coffeeStyle } from "./Coffee"
import { getTagColor } from "../util/tagColor"
import { toString } from "hast-util-to-string"

const blogSections = {
  research: {
    title: "Research",
    label: "研究",
    folder: "02-Posts/",
    description: "对科研的方法与思考",
    empty: "暂无已发布文章。",
  },
  meditations: {
    title: "Meditations",
    label: "沉思",
    folder: "04-Meditations/",
    description: "一些抽象的胡思乱想",
    empty: "暂无已发布文章。",
  },
  review: {
    title: "Review",
    label: "评论",
    folder: "06-Review/",
    description: "对他人作品的评述",
    empty: "暂无已发布文章。",
  },
}

const BlogIndex: QuartzComponent = (props: QuartzComponentProps) => {
  const { allFiles, cfg, fileData, ctx } = props
  const publishedPosts = (folder: string) =>
    allFiles
      .filter(
        (page) =>
          page.slug?.startsWith(folder) &&
          !page.slug.endsWith("/README") &&
          !page.slug.endsWith("/index") &&
          page.frontmatter?.draft !== true,
      )
      .sort((a, b) => (getDate(cfg, b)?.getTime() ?? 0) - (getDate(cfg, a)?.getTime() ?? 0))
  if (fileData.slug === "blog") {
    return (
      <section class="blog-home" aria-labelledby="blog-title">
        <div class="blog-hero">
          <h1 id="blog-title">Blog</h1>
          <p>研究、思考与回顾，从三个方向记录探索。</p>
        </div>
        <div class="blog-section-grid">
          {Object.entries(blogSections).map(([slug, section]) => {
            const posts = publishedPosts(section.folder)
            return (
              <section class="blog-overview-card" aria-labelledby={`blog-${slug}`}>
                <div class="blog-overview-label">
                  <span>{section.label}</span>
                  <span>{posts.length} 篇文章</span>
                </div>
                <h2 id={`blog-${slug}`}>{section.title}</h2>
                <p class="blog-overview-description">{section.description}</p>
                <div class="blog-overview-preview">
                  <h3>近期文章</h3>
                  {posts.length === 0 ? (
                    <p class="blog-overview-empty">{section.empty}</p>
                  ) : (
                    <ul class="blog-preview-list">
                      {posts.slice(0, 3).map((post) => {
                        const date = getDate(cfg, post)
                        const paragraph = post.htmlAst?.children.find(
                          (child) => child.type === "element" && child.tagName === "p",
                        )
                        const excerpt =
                          post.frontmatter?.description?.trim() ||
                          (paragraph ? toString(paragraph) : "")
                        return (
                          <li>
                            <a
                              class="blog-preview-link internal"
                              href={resolveRelative(fileData.slug!, post.slug!)}
                            >
                              <h4>{post.frontmatter?.title ?? post.slug}</h4>
                              {excerpt && (
                                <p>{excerpt.length > 90 ? excerpt.slice(0, 90) + "…" : excerpt}</p>
                              )}
                              {date && (
                                <time datetime={date.toISOString()}>
                                  {formatDate(date, cfg.locale)}
                                </time>
                              )}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
                <a
                  class="blog-section-button internal"
                  href={resolveRelative(fileData.slug!, slug as FullSlug)}
                >
                  进入 {section.title} <span aria-hidden="true">→</span>
                </a>
              </section>
            )
          })}
        </div>
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
            const sceneryAlbums =
              category === "Scenery"
                ? Array.from(new Set(media.map((slug) => slug.slice(0, slug.lastIndexOf("/")))))
                    .sort((a, b) => b.localeCompare(a, cfg.locale, { numeric: true }))
                    .map((folder) => {
                      const page = allFiles.find((page) => page.slug === `${folder}/index`)
                      const name = folder.split("/").pop()!
                      const date = /^(\d{2})(\d{2})(\d{2})-/.exec(name)
                      return {
                        folder,
                        page,
                        title: page?.frontmatter?.title ?? name.replace(/^\d{6}-/, ""),
                        date: date ? `20${date[1]}-${date[2]}-${date[3]}` : undefined,
                        photos: media.filter(
                          (slug) => slug.slice(0, slug.lastIndexOf("/")) === folder,
                        ),
                      }
                    })
                : []
            return (
              <section
                class="gallery-section"
                aria-labelledby={`gallery-${category.toLowerCase()}`}
              >
                <h2 id={`gallery-${category.toLowerCase()}`}>{category}</h2>
                {sceneryAlbums.length > 0 && (
                  <div class="scenery-albums">
                    <p class="scenery-summary">
                      {sceneryAlbums.length} 组风景 · {media.length} 张照片
                    </p>
                    {sceneryAlbums.map((album) => (
                      <article class="scenery-album" aria-label={album.title}>
                        <div class="scenery-album-header">
                          <h3>
                            {album.page ? (
                              <a href={resolveRelative(fileData.slug!, album.page.slug!)}>
                                {album.title}
                              </a>
                            ) : (
                              album.title
                            )}
                          </h3>
                          {album.date && (
                            <time datetime={album.date}>
                              <span>拍摄日期</span> {album.date.replaceAll("-", ".")}
                            </time>
                          )}
                        </div>
                        <div class="gallery-media-grid scenery-photo-grid">
                          {album.photos.map((slug, index) => {
                            const src = resolveRelative(fileData.slug!, slug)
                            const title = `${album.title} · ${index + 1}`
                            return (
                              <figure class="gallery-media">
                                <a
                                  href={src}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={`查看大图：${title}`}
                                >
                                  <img src={src} alt={title} loading="lazy" decoding="async" />
                                </a>
                              </figure>
                            )
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
                {media.length === 0 && notes.length === 0 && <p class="gallery-empty">暂无内容</p>}
                <div class="gallery-media-grid">
                  {(category === "Scenery" ? [] : media).map((slug) => {
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
                {notes
                  .filter((page) => category !== "Scenery" || !page.slug!.endsWith("/index"))
                  .map((page) => {
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

  const sectionSlug = (
    fileData.slug && fileData.slug in blogSections ? fileData.slug : "research"
  ) as keyof typeof blogSections
  const section = blogSections[sectionSlug]
  const posts = publishedPosts(section.folder)

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
