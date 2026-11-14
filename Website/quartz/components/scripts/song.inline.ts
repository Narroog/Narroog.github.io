import { activeLyricAt, formatSongTime } from "../../util/song"

function setupSongs() {
  document.querySelectorAll<HTMLElement>(".song-player").forEach((player) => {
    if (player.dataset.ready) return
    const audio = player.querySelector<HTMLAudioElement>("audio")!
    const toggle = player.querySelector<HTMLButtonElement>(".song-toggle")!
    const label = player.querySelector<HTMLElement>(".song-toggle-label")!
    const seek = player.querySelector<HTMLInputElement>(".song-seek")!
    const elapsed = player.querySelector<HTMLElement>(".song-elapsed")!
    const durationLabel = player.querySelector<HTMLElement>(".song-duration")!
    const status = player.querySelector<HTMLElement>(".song-status")!
    const detail = player.closest(".song-detail")
    const lines = Array.from(detail?.querySelectorAll<HTMLButtonElement>(".song-lyric-line") ?? [])
    const cues = lines.map((line) => ({
      start: Number(line.dataset.start),
      end: Number(line.dataset.end),
      text: line.textContent ?? "",
    }))
    const scroll = detail?.querySelector<HTMLElement>(".song-lyric-scroll")
    const follow = detail?.querySelector<HTMLInputElement>(".song-follow")
    let active = -1
    let frame = 0
    let pendingSeek: number | null = null
    let followAfter = 0
    const listeners: (() => void)[] = []
    const listen = (target: EventTarget, type: string, callback: EventListener) => {
      target.addEventListener(type, callback)
      listeners.push(() => target.removeEventListener(type, callback))
    }
    const duration = () =>
      Number.isFinite(audio.duration) ? audio.duration : Number(player.dataset.duration)
    function update() {
      const time = pendingSeek ?? audio.currentTime
      seek.max = String(duration())
      seek.value = String(time)
      seek.style.setProperty(
        "--song-progress",
        `${Math.min(100, Math.max(0, (time / duration()) * 100))}%`,
      )
      elapsed.textContent = formatSongTime(time)
      durationLabel.textContent = formatSongTime(duration())
      seek.setAttribute("aria-valuetext", `${formatSongTime(time)} / ${formatSongTime(duration())}`)
      const index = activeLyricAt(cues, time)
      if (index === active) return
      if (active >= 0) {
        lines[active].classList.remove("is-active")
        lines[active].removeAttribute("aria-current")
      }
      active = index
      if (active >= 0) {
        const line = lines[active]
        line.classList.add("is-active")
        line.setAttribute("aria-current", "true")
        if (scroll && follow?.checked && performance.now() >= followAfter) {
          scroll.scrollTo({
            top: line.offsetTop - (scroll.clientHeight - line.clientHeight) / 2,
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          })
        }
      }
    }
    function tick() {
      update()
      if (!audio.paused) frame = requestAnimationFrame(tick)
    }
    function reflectPlayback() {
      const playing = !audio.paused && !audio.ended
      player.toggleAttribute("data-playing", playing)
      label.textContent = playing ? "暂停" : "播放"
      toggle.setAttribute("aria-label", `${playing ? "暂停" : "播放"}《${player.dataset.title}》`)
      cancelAnimationFrame(frame)
      if (playing) frame = requestAnimationFrame(tick)
      update()
    }
    async function play() {
      document.querySelectorAll<HTMLAudioElement>(".song-player audio").forEach((other) => {
        if (other !== audio) other.pause()
      })
      status.textContent = ""
      try {
        await audio.play()
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        status.textContent = "播放未能开始，请再次点击播放。"
        reflectPlayback()
      }
    }
    function jump(time: number) {
      const target = Math.max(0, Math.min(time, duration()))
      if (audio.readyState === 0) {
        const needsLoad = pendingSeek === null
        pendingSeek = target
        if (needsLoad) audio.load()
      } else {
        audio.currentTime = target
      }
      update()
    }
    listen(toggle, "click", () => {
      if (audio.paused) void play()
      else audio.pause()
    })
    listen(seek, "input", () => jump(Number(seek.value)))
    listen(audio, "loadedmetadata", () => {
      if (pendingSeek !== null) {
        audio.currentTime = pendingSeek
        pendingSeek = null
      }
      update()
    })
    listen(audio, "play", reflectPlayback)
    listen(audio, "pause", reflectPlayback)
    listen(audio, "ended", reflectPlayback)
    listen(audio, "timeupdate", update)
    listen(audio, "seeked", update)
    listen(audio, "waiting", () => {
      status.textContent = "音频加载中…"
    })
    listen(audio, "playing", () => {
      status.textContent = ""
    })
    listen(audio, "error", () => {
      status.textContent = "音频加载失败，请刷新页面后重试。"
    })
    lines.forEach((line) =>
      listen(line, "click", () => {
        followAfter = 0
        jump(Number(line.dataset.start))
        void play()
      }),
    )
    if (scroll) {
      const manualScroll = () => {
        followAfter = performance.now() + 5000
      }
      listen(scroll, "wheel", manualScroll)
      listen(scroll, "touchstart", manualScroll)
      listen(scroll, "keydown", manualScroll)
    }
    if (follow)
      listen(follow, "change", () => {
        followAfter = 0
        active = -1
        lines.forEach((line) => {
          line.classList.remove("is-active")
          line.removeAttribute("aria-current")
        })
        update()
      })
    player.dataset.ready = "true"
    update()
    window.addCleanup(() => {
      listeners.forEach((remove) => remove())
      audio.pause()
      cancelAnimationFrame(frame)
      delete player.dataset.ready
    })
  })
}

document.addEventListener("nav", setupSongs)
