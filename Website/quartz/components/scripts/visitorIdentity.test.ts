import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { test } from "node:test"
import { runInNewContext } from "node:vm"
import { transform } from "esbuild"

const { code } = await transform(
  await readFile(new URL("./visitorIdentity.inline.ts", import.meta.url), "utf8"),
  { loader: "ts", format: "iife" },
)
const storageKey = "narog.visitor-identity.v1"

function browser(
  options: {
    blocked?: boolean
    restrictedStorage?: boolean
    connected?: boolean
    stored?: string
  } = {},
) {
  const values = new Map<string, string>()
  if (options.stored) values.set(storageKey, options.stored)
  const events: { name: string; data: Record<string, string> }[] = []
  const listeners = new Map<string, (() => void)[]>()
  const input = { value: "" }
  const consent = { checked: false }
  const submit = { disabled: true }
  const forget = { hidden: true, onclick: () => {} }
  const status = { textContent: "" }
  const form = {
    onsubmit: (_event: { preventDefault(): void }) => {},
    reportValidity: () => !!input.value && consent.checked,
    querySelector: (selector: string) => {
      if (selector.includes("visitor-label")) return input
      if (selector.includes("visitor-consent")) return consent
      if (selector.includes("submit")) return submit
      return forget
    },
  }
  const location = { pathname: "/first", search: "?private=value", hash: "#private" }
  const api = {
    track: async (name: string, data: Record<string, string>) => {
      events.push({ name, data })
    },
  }
  const window = {
    umami: options.connected === false ? undefined : api,
    addEventListener: (name: string, callback: () => void) => {
      listeners.set(name, [...(listeners.get(name) ?? []), callback])
    },
  }
  let sequence = 0
  runInNewContext(code, {
    window,
    document: {
      querySelector: (selector: string) => (selector === ".visitor-status" ? status : form),
      addEventListener: window.addEventListener,
    },
    navigator: { doNotTrack: options.blocked ? "1" : "0" },
    location,
    crypto: { randomUUID: () => `00000000-0000-0000-0000-${String(++sequence).padStart(12, "0")}` },
    localStorage: {
      getItem: (key: string) => {
        if (options.restrictedStorage) throw Error("denied")
        return values.get(key) ?? null
      },
      setItem: (key: string, value: string) => {
        if (options.restrictedStorage) throw Error("denied")
        values.set(key, value)
      },
      removeItem: (key: string) => {
        if (options.restrictedStorage) throw Error("denied")
        values.delete(key)
      },
    },
  })
  const dispatch = (name: string) => listeners.get(name)?.forEach((callback) => callback())
  const save = (label: string, allowed = true) => {
    input.value = label
    consent.checked = allowed
    form.onsubmit({ preventDefault() {} })
  }
  dispatch("nav")
  return {
    events,
    values,
    save,
    dispatch,
    input,
    consent,
    submit,
    forget,
    status,
    location,
    window,
    api,
  }
}

test("anonymous reading and unchecked submissions send no identity", () => {
  const b = browser()
  assert.equal(b.events.length, 0)
  b.save("Alice", false)
  assert.equal(b.values.size, 0)
  assert.equal(b.events.length, 0)
})

test("opt-in records named events for pages without doubling ordinary pageviews", () => {
  const b = browser()
  b.save(" Alice ")
  b.dispatch("quartz-analytics-ready")
  assert.equal(b.events.length, 1)
  assert.equal(b.events[0].name, "identified-pageview")
  assert.equal(b.events[0].data.visitor_label, "Alice")
  assert.equal(b.events[0].data.page, "/first")
  assert.equal(b.events[0].data.identity_source, "self-reported")
  b.location.pathname = "/second"
  b.dispatch("nav")
  assert.equal(b.events.length, 2)
  assert.equal(b.events[1].data.visitor_id, b.events[0].data.visitor_id)
  assert.equal(b.consent.checked, false)
  assert.equal(JSON.stringify(b.events).includes("private=value"), false)
})

test("withdrawal clears local identity and subsequent pages send no identity", () => {
  const b = browser()
  b.save("Alice")
  b.forget.onclick()
  assert.equal(b.values.has(storageKey), false)
  assert.equal(b.forget.hidden, true)
  b.location.pathname = "/after-withdrawal"
  b.dispatch("nav")
  b.dispatch("quartz-analytics-ready")
  assert.equal(b.events.length, 1)
})

test("persisted opt-in resumes on a new page; malformed storage stays anonymous", () => {
  const b = browser()
  b.save("Alice")
  const resumed = browser({ stored: b.values.get(storageKey) })
  assert.equal(resumed.events.length, 1)
  assert.equal(resumed.events[0].data.visitor_id, b.events[0].data.visitor_id)
  assert.equal(browser({ stored: "{bad JSON" }).events.length, 0)
  assert.equal(browser({ stored: '{"version":1,"id":"bad","label":"Alice"}' }).events.length, 0)
})

test("Do Not Track and a failed script prevent identity submission", () => {
  const blocked = browser({ blocked: true })
  blocked.save("Alice")
  assert.equal(blocked.submit.disabled, true)
  assert.equal(blocked.events.length, 0)
  const failed = browser({ connected: false })
  failed.dispatch("quartz-analytics-error")
  failed.save("Alice")
  assert.equal(failed.events.length, 0)
  assert.equal(failed.values.size, 0)
  assert.match(failed.status.textContent, /未能连接/)
  failed.window.umami = failed.api
  failed.dispatch("quartz-analytics-ready")
  assert.equal(failed.submit.disabled, false)
})

test("restricted storage does not block reading and reports temporary identity", () => {
  const b = browser({ restrictedStorage: true })
  b.save("Alice")
  assert.equal(b.events.length, 1)
  assert.equal(b.values.size, 0)
  assert.match(b.status.textContent, /无法保存/)
  b.forget.onclick()
  assert.match(b.status.textContent, /无法清除/)
})
