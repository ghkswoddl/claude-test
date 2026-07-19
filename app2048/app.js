// app.js — UI controller: renders game.js state to the DOM and wires up input.
import { SIZE, createInitialState, move, addRandomTile, isGameOver } from "./game.js";

const BEST_SCORE_KEY = "app2048-best-score";
const SWIPE_THRESHOLD = 30; // px

const els = {
  board: document.getElementById("board"),
  boardGrid: document.getElementById("board-grid"),
  tileLayer: document.getElementById("tile-layer"),
  scoreValue: document.getElementById("score-value"),
  bestValue: document.getElementById("best-value"),
  newGameBtn: document.getElementById("new-game-btn"),
  overlay: document.getElementById("overlay"),
  overlayCard: document.getElementById("overlay-card"),
  overlayTitle: document.getElementById("overlay-title"),
  overlayMessage: document.getElementById("overlay-message"),
  overlayPrimaryBtn: document.getElementById("overlay-primary-btn"),
  overlaySecondaryBtn: document.getElementById("overlay-secondary-btn"),
};

function loadBest() {
  const raw = localStorage.getItem(BEST_SCORE_KEY);
  const parsed = raw === null ? 0 : parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function saveBest(value) {
  localStorage.setItem(BEST_SCORE_KEY, String(value));
}

let state = createInitialState(loadBest());
// Tracks whether the win overlay has already been dismissed via "계속하기"
// for the current game, so it doesn't pop back up after continuing.
let winAcknowledged = false;
// Element focused right before the overlay opened, so focus can return there
// (rather than getting lost on <body>) once the overlay closes.
let elementFocusedBeforeOverlay = null;

function buildBoardGridCells() {
  els.boardGrid.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell-bg";
    els.boardGrid.appendChild(cell);
  }
}

function render() {
  els.scoreValue.textContent = String(state.score);
  els.bestValue.textContent = String(state.best);

  els.tileLayer.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = state.board[r][c];
      if (value === 0) continue;
      const tile = document.createElement("div");
      tile.className = `tile tile-${value > 2048 ? "super" : value}`;
      tile.style.gridRowStart = String(r + 1);
      tile.style.gridColumnStart = String(c + 1);
      tile.textContent = String(value);
      els.tileLayer.appendChild(tile);
    }
  }

  const isOverlayVisible = !els.overlay.hidden;

  // Win takes priority the moment it first happens (even if the board also
  // happens to be full at the same time); game-over is re-checked again
  // after "계속하기" via the continue handler below.
  if (state.won && !winAcknowledged && !isOverlayVisible) {
    showOverlay("win");
  } else if (state.over && !isOverlayVisible) {
    showOverlay("gameover");
  }
}

// --- Overlay focus trapping ---
// A keyboard user tabbing through the page shouldn't be able to reach
// controls behind the modal (the board, the nav) while it's open.
function getOverlayFocusable() {
  return [els.overlayPrimaryBtn, els.overlaySecondaryBtn].filter(
    (btn) => !btn.hidden
  );
}

function trapOverlayFocus(e) {
  if (e.key !== "Tab") return;
  const focusable = getOverlayFocusable();
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && (document.activeElement === first || !els.overlay.contains(document.activeElement))) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && (document.activeElement === last || !els.overlay.contains(document.activeElement))) {
    e.preventDefault();
    first.focus();
  }
}

function showOverlay(kind) {
  elementFocusedBeforeOverlay = document.activeElement;
  els.overlay.hidden = false;
  els.overlayCard.classList.toggle("overlay-card-dark", kind === "gameover");
  els.overlayCard.classList.toggle("overlay-card-light", kind === "win");

  if (kind === "win") {
    els.overlayTitle.textContent = "승리!";
    els.overlayMessage.textContent = "2048 타일을 만들었습니다!";
    els.overlayPrimaryBtn.textContent = "계속하기";
    els.overlayPrimaryBtn.onclick = () => {
      winAcknowledged = true;
      hideOverlay();
      render(); // re-check: board may already be full (game-over) after continuing
    };
    els.overlaySecondaryBtn.textContent = "새 게임";
    els.overlaySecondaryBtn.onclick = () => startNewGame();
  } else {
    els.overlayTitle.textContent = "게임 오버";
    els.overlayMessage.textContent = "더 이상 움직일 수 없습니다.";
    els.overlayPrimaryBtn.textContent = "다시 시작";
    els.overlayPrimaryBtn.onclick = () => startNewGame();
    els.overlaySecondaryBtn.hidden = true;
    els.overlayPrimaryBtn.hidden = false;
  }

  if (kind === "win") {
    els.overlaySecondaryBtn.hidden = false;
  }

  els.overlayPrimaryBtn.focus();
  document.addEventListener("keydown", trapOverlayFocus);
}

function hideOverlay() {
  els.overlay.hidden = true;
  document.removeEventListener("keydown", trapOverlayFocus);
  if (elementFocusedBeforeOverlay && document.body.contains(elementFocusedBeforeOverlay)) {
    elementFocusedBeforeOverlay.focus();
  }
  elementFocusedBeforeOverlay = null;
}

function startNewGame() {
  state = createInitialState(state.best);
  winAcknowledged = false;
  hideOverlay();
  render();
}

function handleMove(dir) {
  // Ignore input while an overlay (win or game-over) is showing.
  if (!els.overlay.hidden) return;

  const moved = move(state, dir);
  if (!moved) return;

  addRandomTile(state.board);
  saveBest(state.best);

  if (isGameOver(state.board)) {
    state.over = true;
  }

  render();
}

// --- Keyboard controls ---
const KEY_TO_DIR = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

window.addEventListener("keydown", (e) => {
  const dir = KEY_TO_DIR[e.key];
  if (!dir) return;
  e.preventDefault();
  handleMove(dir);
});

// --- Touch swipe controls (board only) ---
let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;

els.board.addEventListener(
  "touchstart",
  (e) => {
    if (e.touches.length !== 1) return;
    touchActive = true;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);

els.board.addEventListener(
  "touchmove",
  (e) => {
    if (touchActive) e.preventDefault();
  },
  { passive: false }
);

els.board.addEventListener("touchend", (e) => {
  if (!touchActive) return;
  touchActive = false;
  const touch = e.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

  if (absX > absY) {
    handleMove(dx > 0 ? "right" : "left");
  } else {
    handleMove(dy > 0 ? "down" : "up");
  }
});

els.newGameBtn.addEventListener("click", () => startNewGame());

// --- Init ---
buildBoardGridCells();
render();
