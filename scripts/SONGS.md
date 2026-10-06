# Song recordings and synchronized lyrics

Published songs live in `content/gallery/song/<english-name>/`. Each folder has
`recording.mp3` and `index.md`. The Markdown frontmatter contains the title,
performer, duration, card order, and `{ start, end, text }` lyric lines in seconds.
The same recording powers both the Gallery card and its lyric player.

The original WAV recordings and Pages documents stay in `content/05-Gallery/Song`.
Quartz ignores this source directory; only the compressed English-named MP3s are
published. Do not commit the temporary tools or model files from `.quartz-cache`.

`scripts/prepare-songs.py` extracts the document text without changing the originals
and uses ffmpeg to encode 192 kbps MP3s. With `--align`, local stable-ts/Whisper
aligns the provided text to each recording. `START_CORRECTIONS` preserves five
intro/interlude onset corrections checked with independent full/local alignment
passes. Inspect the resulting intervals before `--write-pages`;
singing and accompaniment can still require manual timing corrections.

The current three songs were aligned with the multilingual `small` model. A local
isolated Python environment is at `.quartz-cache/song-tools`. To regenerate:

```powershell
& .quartz-cache/song-tools/Scripts/python.exe scripts/prepare-songs.py --align --force --model small
& .quartz-cache/song-tools/Scripts/python.exe scripts/prepare-songs.py --write-pages
```

To adjust a single line, edit its `start`/`end` directly in `index.md`. Keep the
intervals ordered, non-overlapping, and shorter than the audio duration. Preserve
instrumental gaps between lines. Run `npm run quartz -- build`,
`npm run check:routes`, and `npx tsx --test quartz/util/song.test.ts` after changes.
