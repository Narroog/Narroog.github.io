"""Extract Pages lyrics and prepare web audio; source recordings stay untouched.

Run with Python and ffmpeg available. --align also requires stable-ts and torch.
Tools/models and diagnostic alignment files live in ignored .quartz-cache.
"""

import argparse
import json
import pathlib
import re
import subprocess
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "content/05-Gallery/Song"
CACHE = ROOT / ".quartz-cache/song-import"
SONGS = [("01-回留", "return", "回留"), ("02-同类", "kindred", "同类"), ("03-红豆", "red-bean", "红豆")]
ORIGINAL_ARTISTS = {"return": "方大同", "kindred": "孙燕姿", "red-bean": "方大同"}
# Onsets checked against independent full/local alignment passes. The full pass
# preserves chorus order; these corrections remove intro/interlude absorption.
START_CORRECTIONS = {
    "return": {0: 3.74, 14: 93.78},
    "kindred": {0: 21.46, 24: 139.38},
    "red-bean": {0: 3.76},
}


def varint(data, offset):
    value, shift = 0, 0
    while True:
        byte = data[offset]
        offset += 1
        value |= (byte & 127) << shift
        if byte < 128:
            return value, offset
        shift += 7


def snappy(data):
    size, pos = varint(data, 0)
    out = bytearray()
    while pos < len(data):
        tag = data[pos]
        pos += 1
        kind = tag & 3
        if kind == 0:
            length = tag >> 2
            if length >= 60:
                count = length - 59
                length = int.from_bytes(data[pos:pos + count], "little")
                pos += count
            length += 1
            out.extend(data[pos:pos + length])
            pos += length
        else:
            if kind == 1:
                length = 4 + ((tag >> 2) & 7)
                distance = ((tag & 224) << 3) | data[pos]
                pos += 1
            else:
                length = 1 + (tag >> 2)
                count = 2 if kind == 2 else 4
                distance = int.from_bytes(data[pos:pos + count], "little")
                pos += count
            for _ in range(length):
                out.append(out[-distance])
    assert len(out) == size
    return bytes(out)


def text_fields(data, depth=0):
    if depth > 15:
        return []
    values, pos = [], 0
    try:
        while pos < len(data):
            tag, pos = varint(data, pos)
            wire = tag & 7
            if wire == 0:
                _, pos = varint(data, pos)
            elif wire == 1:
                pos += 8
            elif wire == 5:
                pos += 4
            elif wire == 2:
                size, pos = varint(data, pos)
                value = data[pos:pos + size]
                pos += size
                try:
                    text = value.decode("utf-8")
                    if text.count("\n") > 5 and re.search("[\u4e00-\u9fff]", text):
                        values.append(text)
                except UnicodeDecodeError:
                    pass
                values.extend(text_fields(value, depth + 1))
            else:
                break
    except (IndexError, ValueError):
        pass
    return values


def pages_lyrics(path):
    with zipfile.ZipFile(path) as archive:
        data = archive.read("Index/Document.iwa")
    raw, pos = bytearray(), 0
    while pos < len(data):
        kind = data[pos]
        size = int.from_bytes(data[pos + 1:pos + 4], "little")
        pos += 4
        assert kind == 0
        raw.extend(snappy(data[pos:pos + size]))
        pos += size
    # IWA stores a length-prefixed archive header followed by protobuf messages.
    strings, pos = [], 0
    while pos < len(raw):
        size, pos = varint(raw, pos)
        header = bytes(raw[pos:pos + size])
        pos += size
        lengths = []
        hpos = 0
        while hpos < len(header):
            tag, hpos = varint(header, hpos)
            if (tag & 7) == 0:
                _, hpos = varint(header, hpos)
            elif (tag & 7) == 2:
                length, hpos = varint(header, hpos)
                info = header[hpos:hpos + length]
                hpos += length
                if tag >> 3 != 2:
                    continue
                ipos = 0
                while ipos < len(info):
                    field, ipos = varint(info, ipos)
                    if (field & 7) == 0:
                        value, ipos = varint(info, ipos)
                        if field >> 3 == 3:
                            lengths.append(value)
                    elif (field & 7) == 2:
                        length, ipos = varint(info, ipos)
                        ipos += length
                    else:
                        break
            else:
                break
        for length in lengths:
            strings.extend(text_fields(bytes(raw[pos:pos + length])))
            pos += length
    assert strings, f"No lyric text in {path}"
    return max(strings, key=len).strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--align", action="store_true")
    parser.add_argument("--force", action="store_true", help="Regenerate cached alignments")
    parser.add_argument("--write-pages", action="store_true", help="Write pages from reviewed cached alignments")
    parser.add_argument("--model", default="small")
    args = parser.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    metadata = []
    for source, slug, title in SONGS:
        lyrics = pages_lyrics(SOURCE / f"{title}歌词.pages")
        (CACHE / f"{slug}.txt").write_text(lyrics, encoding="utf-8")
        folder = ROOT / "content/gallery/song" / slug
        folder.mkdir(parents=True, exist_ok=True)
        audio = SOURCE / f"{source}.wav"
        # PCM and IEEE-float WAV both store their byte rate in the fmt chunk.
        with audio.open("rb") as recording:
            assert recording.read(4) == b"RIFF"
            recording.seek(12)
            byte_rate, data_size = 0, 0
            while header := recording.read(8):
                size = int.from_bytes(header[4:], "little")
                if header[:4] == b"fmt ":
                    fmt = recording.read(size)
                    byte_rate = int.from_bytes(fmt[8:12], "little")
                else:
                    if header[:4] == b"data":
                        data_size = size
                    recording.seek(size, 1)
                if size % 2:
                    recording.seek(1, 1)
            assert byte_rate and data_size
            duration = data_size / byte_rate
        output = folder / "recording.mp3"
        if not output.exists():
            subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(audio),
                            "-codec:a", "libmp3lame", "-b:a", "192k", "-map_metadata", "-1",
                            str(output)], check=True)
        metadata.append(dict(slug=slug, title=title, duration=duration, lines=len(lyrics.splitlines())))
    (CACHE / "metadata.json").write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(metadata, ensure_ascii=True), flush=True)
    if args.align:
        import stable_whisper
        import torch
        torch.set_num_threads(4)
        model = stable_whisper.load_model(args.model, device="cpu", download_root=str(CACHE / "models"))
        for _, slug, title in SONGS:
            result_path = CACHE / f"{slug}-alignment.json"
            if result_path.exists() and not args.force:
                continue
            print(f"Aligning {slug}", flush=True)
            result = model.align(str(ROOT / "content/gallery/song" / slug / "recording.mp3"),
                                 (CACHE / f"{slug}.txt").read_text(encoding="utf-8"), language="zh",
                                 original_split=True, regroup=False, nonspeech_skip=None, fast_mode=True)
            assert result is not None
            for index, start in START_CORRECTIONS[slug].items():
                segment = result.segments[index]
                assert segment.start <= start < segment.words[0].end
                segment.words[0].start = start
            result.reassign_ids()
            result.save_as_json(str(result_path))
    if args.write_pages:
        for order, info in enumerate(metadata, 1):
            slug = info["slug"]
            original = [line.strip() for line in (CACHE / f"{slug}.txt").read_text(encoding="utf-8").splitlines() if line.strip()]
            segments = json.loads((CACHE / f"{slug}-alignment.json").read_text(encoding="utf-8"))["segments"]
            assert [s["text"].strip() for s in segments] == original, f"Lyric mismatch: {slug}"
            previous_end = 0
            for text, segment in zip(original, segments):
                start, end = round(segment["start"], 2), round(segment["end"], 2)
                assert previous_end <= start < end <= info["duration"], f"Invalid timing: {slug} {start}-{end}"
                previous_end = end
            artist = ORIGINAL_ARTISTS[slug]
            page = ["---", f"title: {info['title']}", f"description: {artist}《{info['title']}》的翻唱与同步歌词。",
                    "draft: false", f"originalArtist: {artist}", f"order: {order}", f"duration: {info['duration']:.3f}", "lyrics:"]
            for text, segment in zip(original, segments):
                page.extend([f"  - start: {round(segment['start'], 2)}", f"    end: {round(segment['end'], 2)}",
                             f"    text: {json.dumps(text, ensure_ascii=False)}"])
            page.extend(["---", ""])
            (ROOT / "content/gallery/song" / slug / "index.md").write_text("\n".join(page), encoding="utf-8")


if __name__ == "__main__":
    main()
