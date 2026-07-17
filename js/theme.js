// Dark-mode toggle logic. The initial FOUC-avoiding attribute set happens
// via an inline <script> in <head> (see index.html / post.html) — this
// module only wires up the toggle button's click behavior afterward.

const STORAGE_KEY = "theme";

function getEffectiveTheme() {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark" || attr === "light") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
  syncButtonState(theme);
}

let toggleButton = null;

function syncButtonState(theme) {
  if (!toggleButton) return;
  toggleButton.setAttribute("aria-pressed", String(theme === "dark"));
  toggleButton.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
}

/** @param {HTMLButtonElement} buttonEl */
export function initThemeToggle(buttonEl) {
  toggleButton = buttonEl;
  syncButtonState(getEffectiveTheme());

  buttonEl.addEventListener("click", () => {
    const next = getEffectiveTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}
