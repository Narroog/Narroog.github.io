import type { QuartzComponentProps } from "./types"
import type { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative } from "../util/path"
import { formatSongTime, type LyricLine } from "../util/song"
import songStyle from "./styles/song.scss"
// @ts-ignore: Quartz bundles .inline files as browser script strings.
import songScript from "./scripts/song.inline"

export { songStyle, songScript }

export function isSongPage(slug?: string) {
  return /^gallery\/song\/[^/]+\/index$/.test(slug ?? "")
}

function songRecord(page: QuartzPluginData) {
  const metadata = page.frontmatter!
  const folder = page.slug!.slice(0, -"/index".length)
  return {
    page,
    title: metadata.title,
    originalArtist: String(metadata.originalArtist ?? ""),
    order: Number(metadata.order ?? 0),
    duration: Number(metadata.duration ?? 0),
    audio: `${folder}/recording.mp3` as FullSlug,
    lines: (metadata.lyrics ?? []) as LyricLine[],
  }
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path class="song-play-icon" d="M8 5v14l11-7z" />
      <path class="song-pause-icon" d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  )
}

function Transport({ song, slug }: { song: ReturnType<typeof songRecord>; slug: FullSlug }) {
  return (
    <div class="song-player" data-duration={song.duration} data-title={song.title}>
      <audio
        class="song-native"
        controls
        preload="none"
        src={resolveRelative(slug, song.audio)}
        aria-label={`播放《${song.title}》`}
      />
      <div class="song-transport">
        <button class="song-toggle" type="button" aria-label={`播放《${song.title}》`}>
          <PlayIcon />
          <span class="song-toggle-label">播放</span>
        </button>
        <div class="song-progress">
          <input
            class="song-seek"
            type="range"
            min="0"
            max={song.duration}
            step="0.1"
            value="0"
            aria-label={`《${song.title}》播放进度`}
            aria-valuetext={`0:00 / ${formatSongTime(song.duration)}`}
          />
          <div class="song-time" aria-hidden="true">
            <span class="song-elapsed">0:00</span>
            <span class="song-duration">{formatSongTime(song.duration)}</span>
          </div>
        </div>
      </div>
      <p class="song-status" role="status" aria-live="polite"></p>
    </div>
  )
}

export function SongCards(props: QuartzComponentProps) {
  const songs = props.allFiles
    .filter((page) => isSongPage(page.slug) && page.frontmatter?.draft !== true)
    .map(songRecord)
    .sort((a, b) => a.order - b.order)
  return (
    <div class="song-grid">
      {songs.map((song) => (
        <article class="song-card">
          <div class="song-card-top">
            <span class="song-number">{String(song.order).padStart(2, "0")}</span>
            <span class="song-cover-label">翻唱</span>
          </div>
          <h3>
            <a
              class="song-card-link internal"
              href={resolveRelative(props.fileData.slug!, song.page.slug!)}
            >
              {song.title}
            </a>
          </h3>
          <p class="song-original">原唱 · {song.originalArtist}</p>
          <Transport song={song} slug={props.fileData.slug!} />
        </article>
      ))}
    </div>
  )
}

export function SongDetail(props: QuartzComponentProps) {
  const song = songRecord(props.fileData)
  return (
    <article class="song-detail popover-hint">
      <div class="song-heading">
        <p class="song-cover-label">翻唱</p>
        <h1>{song.title}</h1>
        <p class="song-original">原唱 · {song.originalArtist}</p>
      </div>
      <Transport song={song} slug={props.fileData.slug!} />
      <section class="song-lyrics" aria-label={`《${song.title}》同步歌词`}>
        <div class="song-lyrics-heading">
          <h2>歌词</h2>
          <label class="song-follow-label">
            <input class="song-follow" type="checkbox" checked />
            跟随播放
          </label>
        </div>
        <p class="song-lyrics-hint">点击任意一句，从这里播放。</p>
        <div class="song-lyric-scroll" tabindex={0} aria-label="歌词列表">
          {song.lines.map((line) => (
            <button
              class="song-lyric-line"
              type="button"
              data-start={line.start}
              data-end={line.end}
              aria-label={`${formatSongTime(line.start)}，${line.text}`}
            >
              <span class="song-line-time" aria-hidden="true">
                {formatSongTime(line.start)}
              </span>
              <span>{line.text}</span>
            </button>
          ))}
        </div>
      </section>
    </article>
  )
}
