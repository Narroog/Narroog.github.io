# Narog's Blog

工作区按用途分成三个区：`Writing/` 写作，`Published/` 发布，`Website/` 网站工程。

```text
Writing/
  research/       研究想法与文章草稿，保留主题子目录
  meditations/    沉思草稿
  review/         评论草稿
  templates/      通用 Markdown 写作模板
  gallery/        展览筹备与原始照片、录音、歌词
Published/
  index.md        网站首页入口
  about.md        关于页面
  blog/           research、meditations、review 的正式文章
  gallery/        coffee、scenery、song 的正式页面及网页媒体
  assets/         文章使用的图片和附件
Website/
  quartz/         Quartz 框架、组件、样式、静态资源与测试
  quartz.config.ts
  quartz.layout.ts
  visitor-analytics.config.ts
  scripts/        网址检查与媒体准备脚本
  docs/           项目说明、发布说明及 Quartz 框架参考文档
  archive/        已停用的 Profile 页面及其配套代码、附件
  public/         自动生成的网站，不手动编辑、不提交
  .quartz-cache/  本地工具、媒体处理与构建缓存，不提交
```

根目录保留 `package.json`、锁文件、TypeScript 配置、许可证和工具配置。
`.github/workflows/` 保留在 GitHub Actions 要求的位置；`node_modules/` 是本地依赖。

## 写作与发布

1. 在 `Writing/` 对应栏目中新建草稿，可以复制 `Writing/templates/` 中的模板。Writing 不参与默认网站构建，不依赖 `draft` 字段隐藏内容。
2. 整理完成后，将文章移到 `Published/blog/<栏目>/`，设置 `draft: false`，补全标题、摘要、日期和标签。
3. 文件名使用简短英文、小写字母和连字符，例如 `agent-assisted-writing.md`；`title` 可以用中文。推荐使用标准 Markdown 链接。
4. 图片放在 `Published/assets/`；Gallery 的每个作品或相册使用独立文件夹，包含 `index.md` 和网页媒体。
5. 构建并检查网址，通过后提交、推送到 `v4` 分支，由 GitHub Actions 部署。

Published 内的路径直接对应网址，例如 `Published/blog/research/engineering-knowledge.md` 对应 `/blog/research/engineering-knowledge`。
`index.md` 是目录入口，`aliases` 保留旧网址的跳转。`Published/` 自身不会出现在网址里。
移到 Writing 的草稿与 Published 内已有同主题文章不会自动同步，整理时需明确要维护的版本。

整个 `Writing/` 已加入 Git 忽略规则，仅保留在本地，不上传到 GitHub，也不参与网站构建。草稿、模板与原始媒体需要自行备份。
原始媒体保存在 `Writing/gallery/**/originals/`；网页只使用 Published 中的压缩媒体。

## 常用命令

在仓库根目录执行，要求 Node.js 22+、npm 10.9.2+：

```sh
npm ci
npm run dev
npm run build
npm run check:routes
npx tsc --noEmit
npm test
```

`npm run dev` 在本地预览，`npm run build` 将 Published 构建到 `Website/public/`。
原命令 `npm run quartz -- build` 仍可使用。

发布工作流位于 `.github/workflows/deploy.yml`。访问统计见 `Website/docs/visitor-analytics.md`，歌曲处理见 `Website/scripts/SONGS.md`。
本工作区不再包含 Obsidian 配置或 Kanban 看板；文章可以用任意 Markdown 编辑器维护。
