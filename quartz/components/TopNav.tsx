import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

const TopNav: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)
  const blogLinks = [
    { label: "Research", slug: "research" as FullSlug, folder: "02-Posts/" },
    { label: "Meditations", slug: "meditations" as FullSlug, folder: "04-Meditations/" },
    { label: "Gallery", slug: "gallery" as FullSlug, folder: "05-Gallery/" },
    { label: "Review", slug: "review" as FullSlug, folder: "06-Review/" },
  ]
  const blogActive =
    current === "blog" ||
    blogLinks.some((link) => current === link.slug || current.startsWith(link.folder))
  const links = [
    { label: "About", slug: "about" as FullSlug },
    { label: "Profile", slug: "profile" as FullSlug },
  ]

  return (
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="site-brand" href={resolveRelative(current, "index" as FullSlug)}>
        Narog
      </a>
      <div class="site-nav-links">
        <details class="site-blog-dropdown">
          <summary class={blogActive ? "site-nav-link active" : "site-nav-link"}>
            Blog{" "}
            <svg
              class="site-dropdown-chevron"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M5 9l7 6 7-6" />
            </svg>
          </summary>
          <div class="site-blog-menu">
            {blogLinks.map((link) => (
              <a
                class={
                  current === link.slug || current.startsWith(link.folder)
                    ? "site-blog-link active"
                    : "site-blog-link"
                }
                href={resolveRelative(current, link.slug)}
                aria-current={current === link.slug ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </details>
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

TopNav.afterDOMLoaded = `
document.addEventListener("click", (event) => {
  document.querySelectorAll(".site-blog-dropdown[open]").forEach((menu) => {
    if (!menu.contains(event.target) || event.target.closest("a")) menu.removeAttribute("open")
  })
})
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return
  document.querySelectorAll(".site-blog-dropdown[open]").forEach((menu) => {
    if (menu.contains(document.activeElement)) menu.querySelector("summary").focus()
    menu.removeAttribute("open")
  })
})
`

export default (() => TopNav) satisfies QuartzComponentConstructor
