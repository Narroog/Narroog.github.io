import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"

const ArticleTitle: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => {
  let title = fileData.frontmatter?.title
  const date = fileData.frontmatter?.date
  if (/^gallery\/scenery\/[^/]+\/index$/.test(fileData.slug ?? "") && typeof date === "string") {
    title = `${date.replaceAll("-", ".")} · ${title}`
  }
  if (title) {
    return <h1 class={classNames(displayClass, "article-title")}>{title}</h1>
  } else {
    return null
  }
}

ArticleTitle.css = `
.article-title {
  margin: 2rem 0 0 0;
}
`

export default (() => ArticleTitle) satisfies QuartzComponentConstructor
