# Gallery 发布

Gallery 总览目前展示 Coffee 和 Scenery；Song 保留独立页面 `/gallery/song/`，暂不出现在总览中。

每个作品或相册放在 `Published/gallery/<类别>/<英文名称>/`，包含 `index.md` 和所需网页媒体。
原始材料放在 `Writing/gallery/` 下的 `originals/` 目录，不参与发布。

- Coffee：页面、`cover.webp` 和 `thumbnail.webp`。
- Scenery：页面及 WebP 照片；原始 HEIC 放在对应 Writing 相册中。
- Song：页面及 `recording.mp3`，歌词时间轴在页面 frontmatter 中维护；处理方法见 `Website/scripts/SONGS.md`。

共用附件放在 `Published/assets/`。发布前构建并运行网址检查。
