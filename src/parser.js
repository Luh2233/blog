/**
 * Markdown parser with YAML frontmatter.
 * Reads all posts from content/posts/, parses frontmatter + body,
 * and returns sorted, enriched post objects.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");

// Configure marked with syntax highlighting
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (_) {
          // fall through to auto-detection
        }
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch (_) {
        return code;
      }
    },
  })
);

marked.setOptions({
  gfm: true,
  breaks: false,
});

/**
 * Generate a URL-friendly slug from a title.
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w一-鿿\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";
}

/**
 * Generate a filesystem/URL-safe slug for a tag or category.
 * Keeps Chinese characters, alphanumerics, and hyphens.
 * Replaces problematic URL characters.
 */
export function tagSlug(text) {
  return text
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[#?&/\\%]+/g, "-")
    .replace(/[^\w一-鿿\-+]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "untagged";
}

/**
 * Format a date string to display format.
 */
export function formatDate(dateStr, locale = "zh-CN") {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date as ISO string (YYYY-MM-DD).
 */
export function isoDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toISOString().slice(0, 10);
}

/**
 * Read a single post from a markdown file.
 * Returns null if the file can't be read or has no required frontmatter.
 */
function readPost(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (!data.title) {
      console.warn(`Skipping ${filePath}: missing title in frontmatter`);
      return null;
    }

    const fileName = path.basename(filePath, ".md");
    const slug = data.slug || slugify(data.title);
    const stat = fs.statSync(filePath);
    // Use mtime (last modified) rather than birthtime (creation time),
    // because birthtime is unreliable after git clone / file copy.
    const date = data.date
      ? isoDate(data.date)
      : isoDate(stat.mtime);
    const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
    const category = data.category || "未分类";
    // Auto-generate summary from first paragraph if not provided
    let summary = data.summary || "";
    if (!summary) {
      const firstParagraph = content
        .trim()
        .split("\n\n")
        .find((p) => p.trim() && !p.startsWith("#") && !p.startsWith("---"));
      if (firstParagraph) {
        summary = firstParagraph.replace(/^#+\s*/, "").trim().slice(0, 200);
      }
    }
    const draft = data.draft === true;
    const pinned = data.pinned === true;
    const updated = data.updated ? isoDate(data.updated) : null;

    return {
      slug,
      title: data.title,
      date,
      updated,
      tags,
      category,
      summary,
      draft,
      pinned,
      content: marked.parse(content),
      rawContent: content,
      fileName,
    };
  } catch (err) {
    console.warn(`Error reading ${filePath}: ${err.message}`);
    return null;
  }
}

/**
 * Load all posts from the content directory.
 * @param {Object} options
 * @param {boolean} options.includeDrafts - include draft posts (default false for build)
 * @returns {Array} sorted post objects (pinned first, then by date desc)
 */
export function loadAllPosts({ includeDrafts = false } = {}) {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`Posts directory not found: ${POSTS_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"));

  const rawPosts = files
    .map((f) => readPost(path.join(POSTS_DIR, f)))
    .filter(Boolean);

  const posts = rawPosts
    .filter((p) => includeDrafts || !p.draft);

  // Detect duplicate slugs
  const seenSlugs = new Set();
  const duplicates = [];
  for (const post of posts) {
    if (seenSlugs.has(post.slug)) {
      duplicates.push(post.slug);
    } else {
      seenSlugs.add(post.slug);
    }
  }
  if (duplicates.length > 0) {
    console.warn(
      `⚠ Duplicate slugs detected: ${duplicates.join(", ")}. ` +
      `Only the first occurrence will be generated. ` +
      `Set a unique 'slug' in each post's frontmatter to resolve.`
    );
  }

  // Sort: pinned first, then by date descending
  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.date.localeCompare(a.date);
  });

  return posts;
}

/**
 * Get all unique tags across posts.
 */
export function getAllTags(posts) {
  const tagMap = new Map();
  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }
  // Sort by count desc, then alphabetically
  return [...tagMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * Get all unique categories across posts.
 */
export function getAllCategories(posts) {
  const catMap = new Map();
  for (const post of posts) {
    catMap.set(post.category, (catMap.get(post.category) || 0) + 1);
  }
  return [...catMap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => ({ category, count }));
}

/**
 * Get posts by tag.
 */
export function getPostsByTag(posts, tag) {
  return posts.filter((p) => p.tags.includes(tag));
}

/**
 * Get posts by category.
 */
export function getPostsByCategory(posts, category) {
  return posts.filter((p) => p.category === category);
}

/**
 * Get a single post by slug.
 */
export function getPostBySlug(posts, slug) {
  return posts.find((p) => p.slug === slug) || null;
}
