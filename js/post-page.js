import { parseFrontmatter } from "./frontmatter.js";
import { renderMarkdown, escapeHtml } from "./markdown.js";
import { initThemeToggle } from "./theme.js";

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function renderNotFound() {
  document.getElementById("hero-title").textContent = "Post not found";
  document.getElementById("hero-meta").innerHTML = "";
  document.getElementById("post-body").innerHTML = `
    <p>We couldn't find that post. <a class="text-link" href="index.html">Back to all posts</a>.</p>
  `;
  document.title = "Post not found — my-blog";
}

async function init() {
  const themeButton = document.getElementById("theme-toggle");
  if (themeButton) initThemeToggle(themeButton);

  const hamburger = document.getElementById("nav-hamburger");
  const mobileSheet = document.getElementById("nav-mobile-sheet");
  if (hamburger && mobileSheet) {
    hamburger.addEventListener("click", () => {
      mobileSheet.classList.toggle("is-open");
    });
  }

  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    renderNotFound();
    return;
  }

  let raw;
  try {
    const res = await fetch(`posts/${encodeURIComponent(slug)}.md`);
    if (!res.ok) throw new Error(`404`);
    raw = await res.text();
  } catch (err) {
    renderNotFound();
    return;
  }

  const { data, content } = parseFrontmatter(raw);
  const title = data.title || "Untitled";
  const tags = Array.isArray(data.tags) ? data.tags : [];

  document.getElementById("hero-title").textContent = title;
  document.getElementById("hero-meta").innerHTML = `
    <span class="text-caption">${data.date ? formatDate(data.date) : ""}</span>
    ${tags.map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`).join("")}
  `;
  document.getElementById("post-body").innerHTML = renderMarkdown(content);
  document.title = `${title} — my-blog`;
}

init();
