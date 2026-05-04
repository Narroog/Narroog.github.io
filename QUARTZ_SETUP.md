# Quartz v4 接入清单

> 当前项目已经合入 Quartz v4.5.2 源码，依赖已安装，本地构建已通过。

## 已完成

- Quartz v4.5.2 项目文件已合入当前目录。
- Obsidian 内容保留在 `content/`。
- GitHub Pages workflow 已创建：`.github/workflows/deploy.yml`。
- 本地构建命令已验证：

```bash
npm run quartz -- build
```

## 还需要你完成或确认

### 1. 登录 GitHub CLI

当前 `gh auth status` 显示账号 `Narroog` 的 token 已失效。重新登录：

```bash
gh auth login -h github.com
```

### 2. 创建或确认 GitHub 仓库

推荐仓库名：

- 用户站点：`Narroog.github.io`
- 项目站点：任意仓库名，例如 `research-blog`

### 3. 设置远端

把下面的地址替换成你的真实仓库：

```bash
git remote add origin git@github.com:Narroog/Narroog.github.io.git
```

### 4. 配置 Git 身份

当前本地仓库还没有 `user.name` 和 `user.email`。只给这个仓库配置即可：

```bash
git config user.name "Your Name"
git config user.email "you@example.com"
```

### 5. 首次提交并推送

```bash
git add .
git commit -m "Initial Quartz setup"
git push -u origin v4
```

### 6. 开启 GitHub Pages

进入 GitHub 仓库：

- Settings -> Pages
- Source 选择 `GitHub Actions`

### 7. 可选：设置 baseUrl

如果使用用户站点，在 `quartz.config.ts` 中加入：

```ts
baseUrl: "Narroog.github.io",
```

如果使用项目站点，例如 `research-blog`，加入：

```ts
baseUrl: "Narroog.github.io/research-blog",
```
