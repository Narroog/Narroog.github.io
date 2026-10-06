import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"

const output = path.resolve("public")
const indexFile = path.join(output, "static/contentIndex.json")
assert.ok(fs.existsSync(indexFile), "Run npm run quartz -- build before checking routes")
const index = JSON.parse(fs.readFileSync(indexFile, "utf8"))
const failures = []
const origin = "https://routes.invalid"
const legacy = /^(?:02-Posts|04-Meditations|05-Gallery|06-Review|98-Attachments)(?:\/|$)/
const landingSlugs = [
  "blog/index",
  "blog/research/index",
  "blog/meditations/index",
  "blog/review/index",
  "gallery/index",
]
const report = (condition, message) => {
  if (!condition) failures.push(message)
}
const readPage = (slug) => fs.readFileSync(path.join(output, `${slug}.html`), "utf8")
const publicPath = (slug) => `/${slug.replace(/(?:^|\/)index$/, "/").replace(/\/+/g, "/")}`
function resolveTarget(value, slug) {
  return new URL(value.replaceAll("&amp;", "&"), `${origin}/${slug}.html`)
}
function exists(target) {
  const filename = path.join(output, decodeURIComponent(target.pathname))
  return [filename, `${filename}.html`, path.join(filename, "index.html")].some(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
  )
}

for (const slug of landingSlugs) {
  report(slug in index, `Missing collection index: ${slug}`)
  const html = readPage(slug)
  report(
    (html.match(/id="(?:blog|gallery)-title"/g) ?? []).length === 1,
    `Missing or duplicated collection layout: ${slug}`,
  )
  report(
    !html.includes('class="page-listing"'),
    `Default folder listing overwrote collection: ${slug}`,
  )
}

let references = 0
let redirects = 0
for (const [slug, page] of Object.entries(index)) {
  report(/^[a-z0-9/-]+$/.test(slug), `Published page needs a simple English filename: ${slug}`)
  report(!legacy.test(slug), `Legacy directory in published index: ${slug}`)
  report(
    ["index", "about"].includes(slug) || /^(?:blog|gallery)\//.test(slug),
    `Published page is outside its site directory: ${slug}`,
  )
  const html = readPage(slug)
  // Check all generated page links and media, including links created by UI components.
  for (const match of html.matchAll(/<(a|img|script|link|audio|video|source)\b[^>]*>/g)) {
    const tag = match[0]
    for (const attr of tag.matchAll(/\b(?:href|src|poster)="([^"]*)"/g)) {
      const target = resolveTarget(attr[1], slug)
      if (target.origin !== origin) continue
      const pathname = decodeURIComponent(target.pathname).slice(1)
      report(exists(target), `Broken local reference in ${slug}: ${attr[1]}`)
      report(!legacy.test(pathname), `Link still uses old directory in ${slug}: ${attr[1]}`)
      references++
    }
  }

  const source = path.join("content", page.filePath)
  const { data } = matter(fs.readFileSync(source, "utf8"))
  for (const alias of data.aliases ?? []) {
    const aliasSlug = alias.replace(/\.md$/, "").replace(/\s/g, "-").replaceAll("&", "-and-")
    const redirect = readPage(aliasSlug)
    const destination = /http-equiv="refresh" content="0; url=([^"]+)"/.exec(redirect)?.[1]
    report(!!destination, `Missing redirect for ${alias}`)
    if (destination) {
      report(
        resolveTarget(destination, aliasSlug).pathname === publicPath(slug),
        `Wrong redirect destination: ${alias}`,
      )
    }
    report(redirect.includes('content="noindex"'), `Legacy URL must not be indexed: ${alias}`)
    redirects++
  }
}

for (const section of ["research", "meditations", "review"]) {
  const slug = `blog/${section}/index`
  const html = readPage(slug)
  const posts = Object.keys(index).filter(
    (key) => key.startsWith(`blog/${section}/`) && key !== slug,
  )
  report(
    (html.match(/class="blog-card"/g) ?? []).length === posts.length,
    `Incorrect article count in ${section}`,
  )
  for (const post of posts) {
    const backLink = /class="back-home-card internal" href="([^"]+)"/.exec(readPage(post))?.[1]
    report(
      !!backLink && resolveTarget(backLink, post).pathname === publicPath(slug),
      `Article does not return to its section: ${post}`,
    )
  }
}

for (const filename of ["sitemap.xml", "index.xml"]) {
  const xml = fs.readFileSync(path.join(output, filename), "utf8")
  for (const match of xml.matchAll(/<(?:loc|link|guid)>(https:[^<]+)<\//g)) {
    const pathname = decodeURIComponent(new URL(match[1]).pathname).slice(1)
    report(
      !legacy.test(pathname) && /^[a-z0-9/-]*$/.test(pathname),
      `Noncanonical URL in ${filename}: ${pathname}`,
    )
  }
}

if (failures.length) {
  console.error(failures.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    `Validated ${Object.keys(index).length} published pages, ${redirects} redirects, and ${references} local references.`,
  )
}
