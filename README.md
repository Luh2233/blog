> [中文文档](README.zh-CN.md)
# Tech Blog

A personal tech blog system. Lightweight static site generator + Express dev server. Write Markdown, generate pure HTML with one command, deploy with zero runtime dependencies.

## Quick Start

```bash
git clone <repo-url>
cd tech-blog
npm install

# Scaffold your first post
npm run new -- "My First Post"

# Edit content/posts/<date>-my-first-post.md
# Change draft: true to draft: false

# Local preview
npm run dev
# Open http://localhost:3000

# Build static site
npm run build
# Output in dist/ — deploy to any static host
```

## Features

- **Pure Markdown** — YAML frontmatter + Markdown body with syntax highlighting
- **Zero runtime dependencies** — Output is static HTML/CSS, deployable to GitHub Pages / Netlify / Vercel / any static server
- **Hot reload dev server** — `npm run dev` starts Express with live rebuild on file changes
- **Categories & tags** — Auto-generated category pages, tag cloud, tag-filtered post lists
- **Archive** — Year-grouped archive of all posts
- **RSS** — Auto-generated RSS 2.0 feed
- **Drafts & pinning** — `draft: true` hides posts, `pinned: true` pins to top
- **CI/CD ready** — GitHub Actions: push to deploy
- **Responsive design** — Works on desktop and mobile
- **Chinese-friendly** — Native CJK typography, readable URL slugs

## Writing a Post

Create a `.md` file under `content/posts/`:

```markdown
---
title: "Dijkstra's Algorithm"
date: 2026-07-06
tags: [ACM, Graph Theory, Algorithm]
category: "ACM Solutions"
summary: "Principle, implementation and complexity analysis of Dijkstra's shortest path algorithm."
draft: false
---

## Algorithm Overview

Dijkstra's algorithm solves the **single-source shortest path** problem...
```

Or use the scaffold:

```bash
npm run new -- "Dijkstra's Algorithm" --tag=ACM,Graph --category=Algorithms
```

## Deployment

### GitHub Pages (free)

1. Push to a GitHub repository
2. GitHub Actions auto-builds and deploys to GitHub Pages
3. Go to repo Settings → Pages → select "GitHub Actions"

### Netlify / Vercel

Connect your GitHub repo with these settings:
- Build command: `npm run build`
- Publish directory: `dist`

### Any static server

```bash
npm run build
# Upload the dist/ directory to any static file server
```

## Project Structure

```
tech-blog/
├── content/posts/       ← Where you write (Markdown)
├── src/
│   ├── build.js         ← Static site generator
│   ├── server.js        ← Dev server + hot reload
│   ├── parser.js        ← Markdown parser & indexer
│   ├── new-post.js      ← Post scaffold helper
│   └── templates/       ← EJS templates
├── public/style.css     ← Site-wide styles
├── dist/                ← Build output (deploy this)
└── .github/workflows/   ← CI/CD
```

## Tech Stack

| Piece | Tech | Notes |
|-------|------|-------|
| Content | Markdown + YAML frontmatter | Post storage format |
| Parsing | gray-matter + marked + highlight.js | Markdown rendering |
| Templating | EJS | Server-side template engine |
| Dev server | Express + chokidar | Live reload on changes |
| Styling | Vanilla CSS | No framework, responsive |

## Design Philosophy

This is not "yet another blog framework" — it's a teaching-grade SSG built from first principles. ~300 lines of core code, every byte transparent and controllable. Ideal for developers who want to understand how static sites work, or who need a fully hackable blog system.


