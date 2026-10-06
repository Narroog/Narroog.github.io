# Profile 暂存

此目录在 `content/` 之外，暂存内容不会进入网站构建、搜索、RSS 或站点地图。

- `profile.md`：原页面入口。
- `ProfilePage.tsx.txt`：原页面组件的完整源码，以文本格式保存，避免参与 TypeScript 编译。
- `profile.scss`：原页面样式，包含移动端布局。
- `published-paper.pdf`：原 Profile 中的论文附件。

需要恢复时，将入口移回 `content/profile.md`，将组件移回 `quartz/components/ProfilePage.tsx`，恢复组件导出、布局和导航，并将样式加回 `quartz/styles/custom.scss`。附件移回 `content/assets/published-paper.pdf`，在网址检查脚本中重新允许 `profile` 入口。恢复后运行构建和网址检查。
