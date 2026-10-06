import { toString } from "hast-util-to-string"
import { visit } from "unist-util-visit"
import type { Root } from "hast"
import type { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"
import type { QuartzComponentProps } from "./types"
import coffeeStyle from "./styles/coffee.scss"

export { coffeeStyle }

export function isCoffeePage(slug?: string) {
  return /^gallery\/coffee\/[^/]+\/index$/.test(slug ?? "")
}

// Read the rendered Markdown so edits to the source remain the single source of truth.
export function coffeeRecord(page: QuartzPluginData) {
  const fields: Record<string, string> = {}
  const impressions: { label: string; text: string }[] = []
  if (page.htmlAst) {
    visit(page.htmlAst as Root, "element", (node) => {
      if (node.tagName === "tr") {
        const cells = node.children.filter(
          (child) => child.type === "element" && child.tagName === "td",
        )
        if (cells.length === 2) fields[toString(cells[0]).trim()] = toString(cells[1]).trim()
      }
      if (node.tagName === "li") {
        const text = toString(node)
        const separator = text.indexOf("：")
        if (separator >= 0)
          impressions.push({
            label: text.slice(0, separator).replace(/（.*?）/g, ""),
            text: text.slice(separator + 1),
          })
      }
    })
  }
  const folder = page.slug!.slice(0, -"/index".length)
  const product = fields["产品名称"] ?? page.frontmatter?.title ?? "咖啡记录"
  const name = product.replace(/（.*?）/g, "").trim()
  const price = fields["价格"] ?? "待填写"
  const numericPrice = /[0-9]+(?:\.[0-9]+)?/.exec(price)?.[0]
  const flavor = fields["风味描述（包装）"] ?? "待补充"
  const flavors = flavor
    .split("；")[0]
    .split(/[、，]/)
    .filter(Boolean)
  return {
    page,
    fields,
    impressions,
    name,
    product,
    flavors,
    brand: fields["品牌 / 烘焙商"] ?? "",
    roast: fields["烘焙度"]?.split("；")[0] ?? "",
    price: numericPrice ? `¥${numericPrice} / g` : price,
    rating: fields["口味评分"] ?? "待评分",
    image: `${folder}/cover.webp` as FullSlug,
    thumbnail: `${folder}/thumbnail.webp` as FullSlug,
  }
}

export function CoffeeCards({ allFiles, fileData }: QuartzComponentProps) {
  const records = allFiles
    .filter((page) => isCoffeePage(page.slug) && page.frontmatter?.draft !== true)
    .sort((a, b) => a.slug!.localeCompare(b.slug!, "zh-CN", { numeric: true }))
    .map(coffeeRecord)
  return (
    <div class="coffee-collection">
      <div class="coffee-grid">
        {records.map((record) => (
          <a
            class="coffee-card internal"
            href={resolveRelative(fileData.slug!, record.page.slug!)}
            aria-label={`查看${record.name}的品饮记录`}
          >
            <div class="coffee-card-image">
              <img
                src={resolveRelative(fileData.slug!, record.thumbnail)}
                alt={`${record.name}咖啡豆包装`}
                width="420"
                height="630"
                loading="lazy"
                decoding="async"
              />
              <span class="coffee-roast">{record.roast}</span>
            </div>
            <div class="coffee-card-copy">
              <p class="coffee-brand">{record.brand}</p>
              <h3>{record.name}</h3>
              <div class="coffee-flavors">
                {record.flavors.map((flavor) => (
                  <span>{flavor}</span>
                ))}
              </div>
              <div class="coffee-card-footer">
                <span>{record.price}</span>
                <span class="coffee-card-rating">★ {record.rating}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export function CoffeeDetail({ fileData }: QuartzComponentProps) {
  const record = coffeeRecord(fileData)
  return (
    <article class="coffee-detail popover-hint">
      <div class="coffee-detail-hero">
        <div class="coffee-detail-image">
          <img
            src={resolveRelative(fileData.slug!, record.image)}
            alt={`${record.name}咖啡豆包装`}
            width="1000"
            height="1400"
            decoding="async"
          />
        </div>
        <div class="coffee-detail-heading">
          <p class="coffee-brand">{record.brand}</p>
          <h1>{record.name}</h1>
          <p class="coffee-product">{record.product}</p>
          <div class="coffee-flavors">
            {record.flavors.map((flavor) => (
              <span>{flavor}</span>
            ))}
          </div>
          <div class="coffee-rating-grid">
            {[
              ["口味评分", record.rating],
              ["性价比", record.fields["性价比"] ?? "待评分"],
            ].map(([label, value]) => (
              <div class="coffee-score">
                <span>{label}</span>
                <strong>
                  {value.split(" / ")[0]}
                  <small> / 5</small>
                </strong>
              </div>
            ))}
          </div>
          <p class="coffee-scale">5 分制 · 1 分不喜欢，3 分不错，5 分愿意常备</p>
        </div>
      </div>
      <section class="coffee-facts">
        <h2>
          <span>01</span> 豆子档案
        </h2>
        <dl>
          {Object.entries(record.fields)
            .filter(
              ([key]) =>
                !["品牌 / 烘焙商", "产品名称", "风味描述（包装）", "口味评分", "性价比"].includes(
                  key,
                ),
            )
            .map(([label, value]) => (
              <div>
                <dt>{label}</dt>
                <dd>{label === "价格" ? record.price : value}</dd>
              </div>
            ))}
        </dl>
        <div class="coffee-packaging-flavor">
          <span>包装风味</span>
          <p>{record.fields["风味描述（包装）"]}</p>
        </div>
      </section>
      <section class="coffee-tasting">
        <h2>
          <span>02</span> 我的品饮感受
        </h2>
        <div class="coffee-tasting-grid">
          {record.impressions.map(({ label, text }) => (
            <div>
              <h3>{label}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
