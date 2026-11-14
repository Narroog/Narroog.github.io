#!/usr/bin/env node
import workerpool from "workerpool"
const cacheFile = new URL("./.quartz-cache/transpiled-worker.mjs", import.meta.url)
const { parseMarkdown, processHtml } = await import(cacheFile.href)
workerpool.worker({
  parseMarkdown,
  processHtml,
})
