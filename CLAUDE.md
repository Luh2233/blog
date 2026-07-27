# 个人技术博客 — Tech Blog

## 项目概要

从第一性原理构建的个人技术博客系统。轻量静态站点生成器 + Express 开发服务器。

- **核心思想**：写 Markdown → 生成 HTML → 部署静态文件
- **一句话**：用自己写的工具写博客，完全可控，教育意义最大化

## 技术栈

| 层 | 技术 | 说明 |
|---|------|------|
| 内容 | Markdown + YAML frontmatter | 文章存储格式 |
| 解析 | gray-matter + marked + highlight.js | frontmatter 解析 + Markdown → HTML + 代码高亮 |
| 模板 | EJS | 服务端模板渲染 |
| 开发 | Express + chokidar | 本地开发服务器 + 热重载 |
| 样式 | 纯 CSS（CSS Variables） | 无框架依赖，~350 行 |
| 部署 | GitHub Pages / Netlify / Vercel | 静态文件托管 |
| CI/CD | GitHub Actions | push 自动构建部署 |

## 项目结构

```
tech-blog/
├── content/posts/       ← 唯一需要手动编辑的地方
│   ├── hello-world.md
│   └── *.md
├── src/
│   ├── build.js         ← 静态站点生成器（核心）
│   ├── server.js        ← Express 开发服务器 + 热重载
│   ├── parser.js        ← Markdown 解析 + 文章索引
│   ├── new-post.js      ← 新文章脚手架
│   └── templates/
│       ├── base.ejs     ← 公共布局
│       ├── home.ejs     ← 首页 + 分类页
│       ├── post.ejs     ← 文章详情
│       ├── tags.ejs     ← 标签云 + 标签文章列表
│       └── archive.ejs  ← 按年归档
├── public/
│   └── style.css        ← 全站样式
├── dist/                ← 构建输出（.gitignore）
├── .github/workflows/
│   └── deploy.yml       ← CI/CD：push → build → GitHub Pages
└── package.json
```

## 命令参考

```bash
npm install              # 安装依赖
npm run dev              # 启动开发服务器 (http://localhost:3000) + 热重载
npm run build            # 构建静态站点到 dist/
npm run new -- "标题"    # 创建新文章
npm run new -- "标题" --tag=标签1,标签2 --category=分类
```

## Frontmatter 字段

```yaml
---
title: "文章标题"         # 必填
date: 2026-07-06          # 必填，YYYY-MM-DD
tags: [标签1, 标签2]      # 可选，支持中英文
category: "分类名"         # 可选，默认"未分类"
summary: "摘要"           # 可选，显示在文章卡片
pinned: true              # 可选，置顶
draft: true               # 可选，草稿（构建时跳过）
updated: 2026-07-07       # 可选，更新时间
---
```

## 架构决策记录 (ADR)

### ADR-001: 为什么自己写而不是用 Hexo/Hugo/Next.js

- **教育价值**：理解 SSG 原理（~300 行核心代码）
- **完全可控**：每个字节都知道是干什么的
- **渐进式**：从纯静态开始，逐步加功能
- **零黑盒**：出问题不需要翻框架源码

代价：功能需要自己实现（分页、RSS、标签系统等）。

### ADR-002: 为什么用 EJS 而不是 React/Vue

- 静态站点不需要客户端框架
- EJS 语法接近 HTML，学习成本为零
- 服务端渲染，SEO 天然友好
- 构建产物是纯 HTML，部署零成本

### ADR-003: 为什么用 gray-matter + marked 而不是 unified/remark

- gray-matter 是 Node.js 生态最流行的 frontmatter 解析器
- marked 是最快的 Markdown 解析器之一
- 组合简单，调试容易
- 如果后续需要更复杂的 Markdown 处理，可以迁移到 remark

## 当前进度

- [x] 项目骨架搭建
- [x] Markdown 解析器（frontmatter + 正文渲染 + 代码高亮）
- [x] 5 个 EJS 模板（首页 / 文章 / 标签 / 归档 / 404）
- [x] 静态站点生成器（build.js）
- [x] Express 开发服务器 + 热重载
- [x] 纯 CSS 样式（响应式 / 代码块 / 打印样式）
- [x] 3 篇示例文章（博客搭建记 / ACM模板 / Spring Boot实践）
- [x] 新文章脚手架（new-post.js）
- [x] RSS 生成
- [x] CI/CD 配置（GitHub Actions → GitHub Pages）
- [x] 分类 / 标签 / 归档 / 置顶 / 草稿 功能
- [x] 前后文章导航
- [x] 分页功能
- [x] 构建验证通过（npm run build）
- [x] 对抗性审查 + 修复：tagSlug 函数（中文/特殊字符URL友好）、重复slug检测、mtime替代birthtime、自动摘要提取
- [x] 开发服务器热重载验证
- [x] 中文文件名 URL 可用（现代浏览器自动编码）

## 下一步

- [ ] 创建 GitHub 仓库，push 代码
- [ ] 配置 GitHub Pages（Settings → Pages → GitHub Actions，或直接用 Actions deploy）
- [ ] 按需添加功能：
  - 评论系统（Giscus — 基于 GitHub Discussions，零成本）
  - 全文搜索（Pagefind — 纯静态搜索，构建时生成索引）
  - 暗色模式（prefers-color-scheme + CSS 变量切换）
  - 访问统计（Umami / Plausible — 自托管或免费层）
  - 图片懒加载（loading="lazy" + 模糊占位）
  - 自定义域名

## 部署方式

### GitHub Pages（默认，免费）
1. Push 到 GitHub 仓库的 main 分支
2. GitHub Actions 自动构建并部署
3. 访问 `https://<username>.github.io/<repo>/`

### 本地预览构建产物
```bash
npm run build
npx serve dist/
```

### Netlify / Vercel
在对应平台连接 GitHub 仓库，构建命令设为 `npm run build`，发布目录设为 `dist`。

## 最后更新

2026-07-06
