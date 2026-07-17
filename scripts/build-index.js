// Scans posts/*.md and writes posts/index.json.
// Run manually whenever posts are added or changed: `node scripts/build-index.js`
// This is a content indexer, not a build/bundle step for the site.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFrontmatter } from "../js/frontmatter.js";
import { stripMarkdown } from "../js/markdown.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const postsDir = path.join(__dirname, "..", "posts");

function makeExcerpt(content, maxLength = 160) {
  const withoutLeadingHeading = content.replace(/^\s*#{1,6}\s+.*(\r?\n)?/, "");
  const plain = stripMarkdown(withoutLeadingHeading);
  if (plain.length <= maxLength) return plain;
  const truncated = plain.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength)}…`;
}

function validate(data, filename) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    return "missing title";
  }
  if (typeof data.date !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(data.date)) {
    return "missing or malformed date (expected YYYY-MM-DD)";
  }
  if (!Array.isArray(data.tags)) {
    return "missing tags (expected an array)";
  }
  return null;
}

function main() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));

  const entries = [];
  let skipped = 0;

  for (const filename of files) {
    const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
    const { data, content } = parseFrontmatter(raw);

    const error = validate(data, filename);
    if (error) {
      console.warn(`[build-index] skipping ${filename}: ${error}`);
      skipped++;
      continue;
    }

    const slug = filename.replace(/\.md$/, "");
    entries.push({
      slug,
      title: data.title,
      date: data.date,
      tags: data.tags,
      excerpt: makeExcerpt(content),
    });
  }

  entries.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  fs.writeFileSync(path.join(postsDir, "index.json"), JSON.stringify(entries, null, 2) + "\n");

  console.log(`[build-index] Indexed ${entries.length} posts, skipped ${skipped}.`);
}

main();
