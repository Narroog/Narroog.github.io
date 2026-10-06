# Research Blog Vault

这是一个面向 Obsidian + Quartz v4 的数字花园工作区。

写作草稿与网站目录分开管理，发布内容的文件路径直接对应网址：

- `content/01-Ideas/`: 灵感、研究线索、未成形草稿
- `content/blog/index.md`: Blog 首页，网址 `/blog/`
- `content/blog/research/`: Research 栏目与文章，网址 `/blog/research/`
- `content/blog/meditations/`: Meditations 栏目与文章，网址 `/blog/meditations/`
- `content/blog/review/`: Review 栏目与文章，网址 `/blog/review/`
- `content/gallery/`: Gallery 首页及 `coffee/`、`scenery/`、`song/` 分类
- `content/03-Kanban/`: Obsidian Kanban 看板
- `content/assets/`: 图片、PDF、附件
- `content/99-Templates/`: Obsidian 写作模板
- `archive/profile/`: 暂停发布的 Profile 页面、组件、样式和附件

## 日常写作

1. 用 Obsidian 打开当前仓库文件夹。
2. 在 `content/03-Kanban/Publishing Board.md` 管理文章进度。
3. 新文章建议从 `content/99-Templates/Post Template.md` 复制 frontmatter。
4. 将文章放入对应的 `content/blog/` 子栏目，并把 `draft` 改成 `false`。
5. 文件名使用简短英文、小写字母和连字符，例如 `agent-assisted-writing.md`。页面显示标题仍由 `title` 决定，可以保留中文。
6. 每个栏目入口使用 `index.md`；Gallery 详情用英文文件夹名和 `index.md`，媒体放在该详情文件夹下。
7. 旧网址通过 frontmatter 的 `aliases` 跳转到新网址；站内链接使用新路径。

## Quartz 状态

项目已包含 Quartz 源码。安装依赖后运行 `npm run quartz -- build` 构建网站，或运行 `npm run quartz -- build --serve` 本地预览。
运行 `npm run check:routes` 检查构建后的目录、英文网址、旧网址跳转和站内链接。
