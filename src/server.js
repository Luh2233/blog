/**
 * Development Server
 *
 * Serves the blog with live reload on file changes.
 * Watches content/posts/ and src/templates/ for changes,
 * rebuilds the static site on the fly.
 *
 * Usage: node src/server.js [--production]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import express from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = process.env.PORT || 3000;
const isProduction = process.argv.includes("--production") || process.env.NODE_ENV === "production";

// ── Build the site first ────────────────────────────────────────
function build() {
  console.log("🔨 Building...");
  try {
    // Use child process to avoid ESM module caching issues
    const result = spawn("node", ["src/build.js"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    return new Promise((resolve, reject) => {
      result.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build exited with code ${code}`));
      });
    });
  } catch (err) {
    console.error("Build error:", err.message);
  }
}

// ── Start server ────────────────────────────────────────────────
async function start() {
  await build();

  const app = express();

  // Serve static files from dist/
  app.use(express.static(DIST, { extensions: ["html"] }));

  // SPA-like fallback for clean URLs
  app.use((req, res, next) => {
    // Skip if it's a static file request with extension
    if (path.extname(req.path)) return next();

    // Try appending .html
    const htmlPath = path.join(DIST, req.path + ".html");
    if (fs.existsSync(htmlPath)) {
      return res.sendFile(htmlPath);
    }

    // Try directory index
    const indexPath = path.join(DIST, req.path, "index.html");
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    // 404
    res.status(404).sendFile(path.join(DIST, "404.html"));
  });

  app.listen(PORT, () => {
    console.log(`\n🚀 Blog server running at http://localhost:${PORT}`);
    console.log(`   Mode: ${isProduction ? "production" : "development"}`);

    if (!isProduction) {
      // Start file watcher for hot rebuild
      startWatcher();
    }
  });
}

// ── File watcher (dev mode only) ────────────────────────────────
async function startWatcher() {
  try {
    const chokidar = (await import("chokidar")).default;
    const contentDir = path.join(ROOT, "content");
    const templateDir = path.join(__dirname, "templates");
    const publicDir = path.join(ROOT, "public");

    const watcher = chokidar.watch([contentDir, templateDir, publicDir], {
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300 },
    });

    let rebuildTimeout;
    watcher.on("all", (event, filePath) => {
      const relPath = path.relative(ROOT, filePath);
      console.log(`  📝 ${event}: ${relPath}`);
      clearTimeout(rebuildTimeout);
      rebuildTimeout = setTimeout(async () => {
        try {
          await build();
          console.log("  ✅ Rebuild complete\n");
        } catch (err) {
          console.error("  ❌ Rebuild failed:", err.message);
        }
      }, 500);
    });

    console.log("  👀 Watching for file changes...\n");
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND") {
      console.log("  ℹ️  chokidar not installed. Run: npm install --save-dev chokidar");
      console.log("  ℹ️  Auto-rebuild on file change disabled.\n");
    } else {
      console.warn("  ⚠️  Could not start file watcher:", err.message, "\n");
    }
  }
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
