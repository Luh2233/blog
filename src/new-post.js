/**
 * Helper to scaffold a new blog post.
 *
 * Usage: node src/new-post.js "My Post Title" [--tag tag1,tag2] [--category cat]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");

// Parse args
const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith("--"));
const tagArg = args.find((a) => a.startsWith("--tag="));
const categoryArg = args.find((a) => a.startsWith("--category="));

if (!title) {
  console.log("Usage: node src/new-post.js \"文章标题\" [--tag=标签1,标签2] [--category=分类]");
  console.log("Example: node src/new-post.js \"Dijkstra 算法笔记\" --tag=ACM,图论 --category=算法");
  process.exit(1);
}

const tags = tagArg ? tagArg.split("=")[1].split(",").map((t) => t.trim()).filter(Boolean) : [];
const category = categoryArg ? categoryArg.split("=")[1].trim() : "未分类";
const today = new Date().toISOString().slice(0, 10);
const slug = title
  .toLowerCase()
  .replace(/[\s]+/g, "-")
  .replace(/[^\w一-鿿\-]/g, "")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "") || "untitled";

const fileName = `${today}-${slug}.md`;
const filePath = path.join(POSTS_DIR, fileName);

if (fs.existsSync(filePath)) {
  console.error(`File already exists: ${fileName}`);
  process.exit(1);
}

const frontmatter = `---
title: "${title}"
date: ${today}
tags: [${tags.join(", ")}]
category: "${category}"
summary: ""
draft: true
---

开始写作...
`;

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filePath, frontmatter, "utf-8");

console.log(`✅ Created: content/posts/${fileName}`);
console.log(`   标题: ${title}`);
console.log(`   分类: ${category}`);
console.log(`   标签: ${tags.length > 0 ? tags.join(", ") : "(无)"}`);
console.log(`   状态: draft (编辑完成后将 draft 改为 false 即可发布)`);
