import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { blogSections } from "../util/siteRoutes"

const BackHome: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)
  const section = Object.values(blogSections).find((section) => current.startsWith(section.folder))
  const target = (section?.slug ??
    (current.startsWith("gallery/") ? "gallery/index" : "index")) as FullSlug
  const category = current.startsWith("gallery/") ? current.split("/")[1] : undefined
  const anchor = category ? `#gallery-${category.toLowerCase()}` : ""

  return (
    <a class="back-home-card internal" href={resolveRelative(current, target) + anchor}>
      <span aria-hidden="true">←</span>
      返回
    </a>
  )
}

export default (() => BackHome) satisfies QuartzComponentConstructor
