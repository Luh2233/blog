/**
 * Static Site Builder
 *
 * Reads all posts from content/posts/, renders EJS templates,
 * and writes the complete static site to dist/.
 *
 * Usage: node src/build.js [--drafts]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ejs from "ejs";

import {
  loadAllPosts,
  getAllTags,
  getAllCategories,
  getPostsByTag,
  getPostsByCategory,
  getPostBySlug,
  formatDate,
  isoDate,
  slugify,
  tagSlug,
} from "./parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const TEMPLATES = path.join(__dirname, "templates");
const PUBLIC = path.join(ROOT, "public");
const CONTENT = path.join(ROOT, "content");

const POSTS_PER_PAGE = 10;

// Parse CLI args
const args = process.argv.slice(2);
const includeDrafts = args.includes("--drafts");

// ── Render helpers ──────────────────────────────────────────────

function render(templateName, data) {
  const filePath = path.join(TEMPLATES, templateName);
  const template = fs.readFileSync(filePath, "utf-8");
  const body = ejs.render(template, {
    ...data,
    formatDate,
    isoDate,
    slugify,
    tagSlug,
  });
  return ejs.render(
    fs.readFileSync(path.join(TEMPLATES, "base.ejs"), "utf-8"),
    { ...data, body, formatDate, isoDate, slugify, tagSlug }
  );
}

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`  Wrote: ${path.relative(DIST, filePath)}`);
}

// ── Main build ──────────────────────────────────────────────────

console.log("🔨 Building static site...\n");

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}
fs.mkdirSync(DIST, { recursive: true });

// Load all posts
const allPosts = loadAllPosts({ includeDrafts });
console.log(`  Found ${allPosts.length} posts (${includeDrafts ? "including" : "excluding"} drafts)\n`);

const tags = getAllTags(allPosts);
const categories = getAllCategories(allPosts);

// ── 1. Copy public assets ──────────────────────────────────────
if (fs.existsSync(PUBLIC)) {
  copyDir(PUBLIC, DIST);
  console.log("  Copied public assets\n");
}

// ── 2. Home page ───────────────────────────────────────────────
const publishedPosts = allPosts.filter((p) => !p.draft);
const totalPages = Math.ceil(publishedPosts.length / POSTS_PER_PAGE) || 1;

for (let page = 1; page <= totalPages; page++) {
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = publishedPosts.slice(start, start + POSTS_PER_PAGE);
  const html = render("home.ejs", {
    title: page > 1 ? `第 ${page} 页` : "首页",
    description: "啥都记录一下的小站",
    posts: pagePosts,
    tags,
    categories,
    page,
    totalPages,
  });
  const outPath =
    page === 1
      ? path.join(DIST, "index.html")
      : path.join(DIST, "page", `${page}.html`);
  writeFile(outPath, html);
}

// ── 3. Individual post pages ───────────────────────────────────
for (let i = 0; i < publishedPosts.length; i++) {
  const post = publishedPosts[i];
  const prevPost = i > 0 ? publishedPosts[i - 1] : null;
  const nextPost = i < publishedPosts.length - 1 ? publishedPosts[i + 1] : null;

  const html = render("post.ejs", {
    title: post.title,
    description: post.summary || post.title,
    post,
    prevPost,
    nextPost,
  });
  writeFile(path.join(DIST, "post", `${post.slug}.html`), html);
}

// ── 4. Tags index page ─────────────────────────────────────────
{
  const html = render("tags.ejs", {
    title: "标签",
    description: "所有文章标签",
    tags,
    posts: publishedPosts,
  });
  writeFile(path.join(DIST, "tags.html"), html);
}

// ── 5. Tag detail pages ────────────────────────────────────────
for (const { tag } of tags) {
  const tagPosts = getPostsByTag(publishedPosts, tag);
  const html = render("tags.ejs", {
    title: `标签：${tag}`,
    description: `标签"${tag}"下的所有文章`,
    tags,
    posts: tagPosts,
    tag,
  });
  writeFile(path.join(DIST, "tag", `${tagSlug(tag)}.html`), html);
}

// ── 6. Category detail pages ───────────────────────────────────
for (const { category } of categories) {
  const catPosts = getPostsByCategory(publishedPosts, category);
  // Reuse home template with category filter
  const html = render("home.ejs", {
    title: `分类：${category}`,
    description: `分类"${category}"下的所有文章`,
    posts: catPosts,
    tags,
    categories,
    currentCategory: category,
    page: 1,
    totalPages: 1,
  });
  writeFile(
    path.join(DIST, "category", `${tagSlug(category)}.html`),
    html
  );
}

// ── 7. Archive page ────────────────────────────────────────────
{
  const postsByYear = new Map();
  for (const post of publishedPosts) {
    const year = post.date.slice(0, 4);
    if (!postsByYear.has(year)) postsByYear.set(year, []);
    postsByYear.get(year).push(post);
  }

  const html = render("archive.ejs", {
    title: "归档",
    description: "文章按年份归档",
    posts: publishedPosts,
    postsByYear,
  });
  writeFile(path.join(DIST, "archive.html"), html);
}

// ── 8. 404 page ────────────────────────────────────────────────
{
  writeFile(
    path.join(DIST, "404.html"),
    render("post.ejs", {
      title: "404 — 页面未找到",
      description: "页面不存在",
      post: {
        slug: "",
        title: "404 — 页面未找到",
        date: "",
        updated: null,
        tags: [],
        category: "",
        summary: "",
        content: "<p>你访问的页面不存在。<a href='/'>返回首页</a></p>",
        pinned: false,
      },
      prevPost: null,
      nextPost: null,
    })
  );
}

console.log(`\n✅ Build complete! Site generated in ${path.relative(ROOT, DIST)}/`);
console.log(`   Run: npx serve dist/   or deploy the dist/ directory\n`);

// ── Helpers ─────────────────────────────────────────────────────

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
