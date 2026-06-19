import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"

const HomePage: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const current = fileData.slug ?? ("index" as FullSlug)

  return (
    <section class="home-page" aria-labelledby="home-title">
      <div class="home-hero">
        <h1 id="home-title">Hi，I'm Narog</h1>
        <div class="home-actions" aria-label="Primary links">
          <a class="home-button primary" href={resolveRelative(current, "blog" as FullSlug)}>
            Blog
          </a>
          <a class="home-button secondary" href={resolveRelative(current, "about" as FullSlug)}>
            About
          </a>
        </div>
      </div>
    </section>
  )
}

export default (() => HomePage) satisfies QuartzComponentConstructor
