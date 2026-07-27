# Tech Blog

个人技术博客系统，轻量静态站点生成器 + Express 开发服务器，写 Markdown，一键生成纯 HTML 静态站点，零运行时依赖部署。

## 快速开始

```bash
git clone <repo-url>
cd tech-blog
npm install

# 创建第一篇新文章
npm run new -- "我的第一篇文章"

# 编辑 content/posts/<日期>-我的第一篇文章.md
# 将 draft: true 改为 draft: false

# 本地预览
npm run dev
# 浏览器打开 http://localhost:3000

# 构建静态站点
npm run build
# 产物在 dist/ 目录，可直接部署到任何静态托管
```

## 特性

- **纯 Markdown 写作** — YAML frontmatter + Markdown 正文，代码语法高亮
- **零运行时依赖部署** — 构建产物是纯 HTML/CSS，可部署到 GitHub Pages / Netlify / Vercel / 任何静态服务器
- **热重载开发** — `npm run dev` 启动开发服务器，修改内容自动重建
- **分类与标签** — 自动生成分类页、标签云、标签文章列表
- **归档** — 按年归档所有文章
- **RSS** — 自动生成 RSS 2.0 订阅源
- **草稿与置顶** — `draft: true` 隐藏文章，`pinned: true` 置顶
- **CI/CD 就绪** — GitHub Actions 配置：push 即自动构建部署
- **响应式设计** — 适配桌面和移动端
- **中文友好** — 原生中文排版，URL 可读

## 写一篇文章

在 `content/posts/` 下创建 `.md` 文件：

```markdown
---
title: "Dijkstra 算法笔记"
date: 2026-07-06
tags: [ACM, 图论, 算法]
category: "ACM题解"
summary: "Dijkstra 最短路径算法的原理、实现与复杂度分析。"
draft: false
---

## 算法思想

Dijkstra 算法用于求解**单源最短路径**...
```

或使用脚手架：

```bash
npm run new -- "Dijkstra 算法笔记" --tag=ACM,图论 --category=ACM题解
```

## 部署

### GitHub Pages（免费）

1. Push 到 GitHub 仓库
2. GitHub Actions 自动构建并部署到 GitHub Pages
3. 在仓库 Settings → Pages 中选择 "GitHub Actions"

### Netlify / Vercel

连接 GitHub 仓库，构建设置：
- Build command: `npm run build`
- Publish directory: `dist`

### 任意静态服务器

```bash
npm run build
# 将 dist/ 目录内容上传到任意静态服务器
```

## 项目结构

```
tech-blog/
├── content/posts/       ← 写文章的地方（Markdown）
├── src/
│   ├── build.js         ← 静态站点生成器
│   ├── server.js        ← 开发服务器 + 热重载
│   ├── parser.js        ← Markdown 解析与索引
│   ├── new-post.js      ← 新文章脚手架
│   └── templates/       ← EJS 模板
├── public/style.css     ← 全站样式
├── dist/                ← 构建输出（部署此目录）
└── .github/workflows/   ← CI/CD
```

## 技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 内容 | Markdown + YAML frontmatter | 文章存储格式 |
| 解析 | gray-matter + marked + highlight.js | Markdown 渲染 |
| 模板 | EJS | 服务端模板引擎 |
| 开发 | Express + chokidar | 开发服务器 + 热重载 |
| 样式 | 纯 CSS | 无框架，响应式 |

## 设计哲学

这个项目不是"又一个博客框架"——它是从第一性原理出发构建的教学级 SSG。核心代码约 300 行，每个字节都透明可控。适合想要理解静态站点工作原理、或需要一个完全可控的博客系统的开发者。
