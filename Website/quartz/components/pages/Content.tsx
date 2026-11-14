import { ComponentChildren } from "preact"
import { htmlToJsx } from "../../util/jsx"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "../types"
import { SongDetail, isSongPage, songStyle, songScript } from "../Song"

const Content: QuartzComponent = (props: QuartzComponentProps) => {
  const { fileData, tree } = props
  if (isSongPage(fileData.slug)) return <SongDetail {...props} />
  const content = htmlToJsx(fileData.filePath!, tree) as ComponentChildren
  const classes: string[] = fileData.frontmatter?.cssclasses ?? []
  const classString = ["popover-hint", ...classes].join(" ")
  return <article class={classString}>{content}</article>
}
Content.css = songStyle
Content.afterDOMLoaded = songScript

export default (() => Content) satisfies QuartzComponentConstructor
