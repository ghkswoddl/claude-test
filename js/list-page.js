import { escapeHtml } from "./markdown.js";
import { initThemeToggle } from "./theme.js";

let allPosts = [];
let activeTag = null;
let searchQuery = "";

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function matchesFilters(post) {
  const q = searchQuery.trim().toLowerCase();
  const matchesQuery =
    !q ||
    post.title.toLowerCase().includes(q) ||
    post.tags.some((tag) => tag.toLowerCase().includes(q));
  const matchesTag = !activeTag || post.tags.includes(activeTag);
  return matchesQuery && matchesTag;
}

function renderGrid() {
  const grid = document.getElementById("article-grid");
  const visible = allPosts.filter(matchesFilters);

  if (visible.length === 0) {
    grid.innerHTML = `<p class="empty-state text-body-md">No posts match your search.</p>`;
    return;
  }

  grid.innerHTML = visible
    .map((post) => {
      const tagsHtml = post.tags
        .map((tag) => `<span class="tag-chip">${escapeHtml(tag)}</span>`)
        .join("");
      return `
        <a class="article-card" href="post.html?slug=${encodeURIComponent(post.slug)}">
          <span class="article-card-tag">${escapeHtml(post.tags[0] || "post")}</span>
          <h3 class="article-card-title">${escapeHtml(post.title)}</h3>
          <p class="article-card-excerpt">${escapeHtml(post.excerpt)}</p>
          <span class="article-card-meta">${formatDate(post.date)}</span>
          <div class="article-card-tags">${tagsHtml}</div>
        </a>
      `;
    })
    .join("");
}

function renderFilterRail() {
  const rail = document.getElementById("filter-rail");
  const counts = new Map();
  for (const post of allPosts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    }
  }

  const tags = [...counts.keys()].sort();

  const allItem = `
    <li>
      <button class="filter-item${activeTag === null ? " is-active" : ""}" data-tag="">
        <span>All posts</span>
        <span class="filter-count">${allPosts.length}</span>
      </button>
    </li>
  `;

  const tagItems = tags
    .map(
      (tag) => `
      <li>
        <button class="filter-item${activeTag === tag ? " is-active" : ""}" data-tag="${escapeHtml(tag)}">
          <span>${escapeHtml(tag)}</span>
          <span class="filter-count">${counts.get(tag)}</span>
        </button>
      </li>
    `
    )
    .join("");

  rail.innerHTML = `
    <p class="filter-heading">Topics</p>
    <ul class="filter-list">${allItem}${tagItems}</ul>
  `;

  rail.querySelectorAll(".filter-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTag = btn.dataset.tag || null;
      renderFilterRail();
      renderGrid();
    });
  });
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

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderGrid();
  });

  try {
    const res = await fetch("posts/index.json");
    if (!res.ok) throw new Error(`Failed to load posts/index.json (${res.status})`);
    allPosts = await res.json();
  } catch (err) {
    document.getElementById("article-grid").innerHTML = `
      <p class="empty-state text-body-md">
        Couldn't load posts. Run <code>node scripts/build-index.js</code> and serve this
        site over HTTP (not file://).
      </p>
    `;
    console.error(err);
    return;
  }

  renderFilterRail();
  renderGrid();
}

init();
