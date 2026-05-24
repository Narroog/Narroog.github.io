import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

const BackHome: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)

  return (
    <a class="back-home-card" href={resolveRelative(current, "index" as FullSlug)}>
      返回主页
    </a>
  )
}

export default (() => BackHome) satisfies QuartzComponentConstructor
