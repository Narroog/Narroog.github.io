import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

const BackHome: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)
  const section = [
    ["02-Posts/", "research"],
    ["04-Meditations/", "meditations"],
    ["05-Gallery/", "gallery"],
    ["06-Review/", "review"],
  ].find(([prefix]) => current.startsWith(prefix))
  const target = (section?.[1] ?? "index") as FullSlug
  const category = current.startsWith("05-Gallery/") ? current.split("/")[1] : undefined
  const anchor = category ? `#gallery-${category.toLowerCase()}` : ""

  return (
    <a class="back-home-card internal" href={resolveRelative(current, target) + anchor}>
      <span aria-hidden="true">←</span>
      返回
    </a>
  )
}

export default (() => BackHome) satisfies QuartzComponentConstructor
