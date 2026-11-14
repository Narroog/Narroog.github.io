# 本地构建与部署

项目基于 Quartz v4.5.2。所有命令在仓库根目录运行。

```sh
npm ci
npm run dev
```

默认读取 `Published/`，生成 `Website/public/`。Writing 中的草稿、原件以及 Website 中的文档和归档不会进入默认网站构建。

发布前运行：

```sh
npm run build
npm run check:routes
npx tsc --noEmit
npm test
```

网站配置为 `Website/quartz.config.ts`，布局为 `Website/quartz.layout.ts`，组件和样式为 `Website/quartz/components/`、`Website/quartz/styles/`。

GitHub Actions 工作流位于 `.github/workflows/deploy.yml`，推送到 `v4` 分支或手动触发时安装依赖、构建、检查网址，并将 `Website/public/` 部署到 GitHub Pages。
GitHub 仓库的 Pages Source 应设置为 GitHub Actions。

使用 Docker 时，在根目录运行 `docker build -f Website/Dockerfile -t narog-blog .`。
Quartz 框架参考文档保存在 `Website/docs/quartz/`；其中默认目录与命令以根 README 的本项目配置为准。
