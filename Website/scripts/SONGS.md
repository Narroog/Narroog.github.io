# Song recordings and synchronized lyrics

Published songs live in `Published/gallery/song/<english-name>/`. Each folder has
`recording.mp3` and `index.md`. The Markdown frontmatter contains the title,
original artist (`originalArtist`), duration, card order, and `{ start, end, text }` lyric lines in seconds.
The same recording powers both the Gallery card and its lyric player.

The original WAV recordings and Pages documents stay in `Writing/gallery/song/originals`.
This local-only source directory is ignored by Git and is outside the website input;
only the compressed English-named MP3s are published. Do not commit the temporary
tools or model files from `Website/.quartz-cache`.

`Website/scripts/prepare-songs.py` extracts the document text without changing the originals
and uses ffmpeg to encode 192 kbps MP3s. With `--align`, local stable-ts/Whisper
aligns the provided text to each recording. `START_CORRECTIONS` preserves five
intro/interlude onset corrections checked with independent full/local alignment
passes. Inspect the resulting intervals before `--write-pages`;
singing and accompaniment can still require manual timing corrections.

The current three songs were aligned with the multilingual `small` model. A local
isolated Python environment is at `Website/.quartz-cache/song-tools`. To regenerate
from the repository root (recreate the environment if its launcher has an old path):

```powershell
& Website/.quartz-cache/song-tools/Scripts/python.exe Website/scripts/prepare-songs.py --align --force --model small
& Website/.quartz-cache/song-tools/Scripts/python.exe Website/scripts/prepare-songs.py --write-pages
```

To adjust a single line, edit its `start`/`end` directly in `index.md`. Keep the
intervals ordered, non-overlapping, and shorter than the audio duration. Preserve
instrumental gaps between lines. Run `npm run quartz -- build`,
`npm run check:routes`, and `npx tsx --test Website/quartz/util/song.test.ts` after changes.
