---
title: Gallery 发布说明
draft: true
---

Gallery 在同一页直接展示 Coffee、Scenery、Song 三个分区，无需点击分类。

把图片（JPG、PNG、WebP、AVIF、GIF、SVG）、音频（MP3、M4A、OGG、WAV、FLAC）或视频（MP4、WebM、MOV）放入对应文件夹，重新构建后自动显示。媒体能否播放取决于浏览器支持的编码，音频优先使用 MP3，视频优先使用 MP4。
媒体按文件名排序，文件名用作说明；点击图片可查看原图，音视频直接在页面播放。

也可以编辑各文件夹的 index.md，或创建 draft: false 的 Markdown 文件，正文会直接展示在对应分区。正文中引用的媒体建议存放于 content/98-Attachments/，避免与自动展示的媒体重复。
本地预览中新增或删除媒体后，如果页面未刷新，请重新启动构建预览。
