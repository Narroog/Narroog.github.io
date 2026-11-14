type VisitorIdentity = { version: 1; id: string; label: string }
type VisitorTracker = { track: (event: string, data: Record<string, string>) => Promise<unknown> }

const storageKey = "narog.visitor-identity.v1"
let identity: VisitorIdentity | null = null
let lastTrackedKey = ""
let storageCleared = false
let trackerFailed = false

function tracker(): VisitorTracker | undefined {
  return (window as Window & { umami?: VisitorTracker }).umami
}

function trackingAllowed(): boolean {
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") return false
  try {
    return !localStorage.getItem("umami.disabled")
  } catch {
    return true
  }
}

function restoreIdentity(): VisitorIdentity | null {
  if (storageCleared) return identity
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null")
    if (
      stored?.version === 1 &&
      typeof stored.id === "string" &&
      /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(stored.id) &&
      typeof stored.label === "string" &&
      stored.label.trim().length > 0 &&
      stored.label.length <= 80
    )
      return stored
  } catch {
    // A restricted browser or damaged local value must not interrupt reading.
  }
  return identity
}

function setStatus(message: string) {
  const status = document.querySelector<HTMLElement>(".visitor-status")
  if (status) status.textContent = message
}

function recordIdentifiedPage() {
  const api = tracker()
  if (!api || !identity || !trackingAllowed()) return
  const key = `${identity.id}:${location.pathname}`
  if (lastTrackedKey === key) return
  lastTrackedKey = key
  // Identity is attached only to these opt-in events. Do not identify the
  // underlying anonymous session, which would also label visits after withdrawal.
  void api
    .track("identified-pageview", {
      visitor_id: identity.id,
      visitor_label: identity.label,
      identity_source: "self-reported",
      page: location.pathname,
    })
    .catch(() => {
      setStatus("称呼已保存在此浏览器，但此次访问记录发送失败；后续页面会再次尝试。")
    })
}

function updateControls() {
  const form = document.querySelector<HTMLFormElement>(".visitor-identity-form")
  if (!form) return
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]')!
  const forget = form.querySelector<HTMLButtonElement>(".visitor-forget")!
  submit.disabled = !tracker() || !trackingAllowed()
  forget.hidden = !identity
  if (!trackingAllowed()) {
    setStatus("此浏览器已停用访问统计，不会发送身份记录；你可继续浏览。")
  } else if (trackerFailed) {
    setStatus("访问统计未能连接，身份信息不会发送；你可继续匿名浏览。")
  } else if (!tracker()) {
    setStatus("正在连接访问统计；未连接时不会提交身份信息。")
  } else if (identity) {
    setStatus(`此浏览器已保存称呼「${identity.label}」。后续访问将尝试关联此称呼。`)
  } else {
    setStatus("你正在匿名浏览。填写称呼并勾选同意后，才会关联后续访问。")
  }
}

function setupIdentity() {
  const form = document.querySelector<HTMLFormElement>(".visitor-identity-form")
  if (!form) return
  identity = restoreIdentity()
  const input = form.querySelector<HTMLInputElement>('input[name="visitor-label"]')!
  const consent = form.querySelector<HTMLInputElement>('input[name="visitor-consent"]')!
  const forget = form.querySelector<HTMLButtonElement>(".visitor-forget")!
  input.value = identity?.label ?? ""
  // Require a fresh explicit choice for each submission, including name changes.
  consent.checked = false

  form.onsubmit = (event) => {
    event.preventDefault()
    if (!form.reportValidity() || !consent.checked || !tracker() || !trackingAllowed()) return
    const label = input.value.trim()
    if (!label || label.length > 80) {
      setStatus("请填写 1–80 个字符的称呼。")
      return
    }
    identity = { version: 1, id: crypto.randomUUID(), label }
    storageCleared = false
    let persisted = true
    try {
      localStorage.setItem(storageKey, JSON.stringify(identity))
    } catch {
      persisted = false
    }
    consent.checked = false
    updateControls()
    recordIdentifiedPage()
    if (!persisted) setStatus("浏览器无法保存称呼，仅当前页面会尝试关联；刷新后恢复匿名浏览。")
  }

  forget.onclick = () => {
    identity = null
    storageCleared = true
    lastTrackedKey = ""
    let removed = true
    try {
      localStorage.removeItem(storageKey)
    } catch {
      removed = false
    }
    input.value = ""
    consent.checked = false
    updateControls()
    setStatus(
      removed
        ? "已停止后续身份记录。你仍可匿名浏览；已发送的记录不会因此删除。"
        : "当前页面已停止身份记录，但浏览器无法清除保存值；请清除此站点的浏览器数据。",
    )
  }
  updateControls()
  recordIdentifiedPage()
}

window.addEventListener("quartz-analytics-ready", () => {
  trackerFailed = false
  updateControls()
  recordIdentifiedPage()
})
window.addEventListener("quartz-analytics-error", () => {
  trackerFailed = true
  updateControls()
})
window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    identity = null
    storageCleared = false
    setupIdentity()
  } else if (event.key === "umami.disabled") {
    updateControls()
  }
})
document.addEventListener("nav", setupIdentity)
