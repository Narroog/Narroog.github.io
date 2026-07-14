import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

const TopNav: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)
  const links = [
    { label: "Blog", slug: "blog" as FullSlug },
    { label: "About", slug: "about" as FullSlug },
    { label: "留言板", slug: "guestbook" as FullSlug },
    { label: "Profile", slug: "profile" as FullSlug },
  ]

  return (
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="site-brand" href={resolveRelative(current, "index" as FullSlug)}>
        Narog's Blog
      </a>
      <div class="site-nav-links">
        {links.map((link) => {
          const active = current === link.slug
          return (
            <a
              class={active ? "site-nav-link active" : "site-nav-link"}
              href={resolveRelative(current, link.slug)}
              aria-current={active ? "page" : undefined}
            >
              {link.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

export default (() => TopNav) satisfies QuartzComponentConstructor
