// game.js — 2048 pure game engine (no DOM dependency)
// State shape: { board: number[4][4], score, best, won, over }

export const SIZE = 4;

export function createEmptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

export function createInitialState(best = 0) {
  const state = {
    board: createEmptyBoard(),
    score: 0,
    best,
    won: false,
    over: false,
  };
  addRandomTile(state.board);
  addRandomTile(state.board);
  return state;
}

/** Adds a random tile (2 with 90% probability, 4 with 10%) to a random empty cell.
 * Returns true if a tile was added, false if the board was full. */
export function addRandomTile(board) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

/**
 * Slides and merges a single line "toward index 0" (i.e. line is already
 * oriented so the target direction is the front of the array).
 * Returns { line: number[4], gained: number } — gained is score added by merges.
 * A tile merges at most once per move (merged results are not re-compared).
 */
function slideLine(line) {
  const compact = line.filter((v) => v !== 0);
  const result = [];
  let gained = 0;
  for (let i = 0; i < compact.length; i++) {
    if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
      const merged = compact[i] * 2;
      result.push(merged);
      gained += merged;
      i++; // skip the next value — it has been consumed by this merge
    } else {
      result.push(compact[i]);
    }
  }
  while (result.length < SIZE) result.push(0);
  return { line: result, gained };
}

function getLine(board, dir, index) {
  const line = [];
  for (let i = 0; i < SIZE; i++) {
    if (dir === "left" || dir === "right") {
      line.push(board[index][i]);
    } else {
      line.push(board[i][index]);
    }
  }
  if (dir === "right" || dir === "down") line.reverse();
  return line;
}

function setLine(board, dir, index, line) {
  const oriented = dir === "right" || dir === "down" ? [...line].reverse() : line;
  for (let i = 0; i < SIZE; i++) {
    if (dir === "left" || dir === "right") {
      board[index][i] = oriented[i];
    } else {
      board[i][index] = oriented[i];
    }
  }
}

/**
 * Applies a move in the given direction ("up" | "down" | "left" | "right")
 * to state.board in place, updates state.score/best/won.
 * Returns true if the board actually changed (and thus a new tile should spawn).
 */
export function move(state, dir) {
  const before = state.board.map((row) => [...row]);
  let gained = 0;

  for (let index = 0; index < SIZE; index++) {
    const line = getLine(state.board, dir, index);
    const { line: newLine, gained: lineGained } = slideLine(line);
    gained += lineGained;
    setLine(state.board, dir, index, newLine);
  }

  const moved = !boardsEqual(before, state.board);

  if (moved) {
    state.score += gained;
    if (state.score > state.best) state.best = state.score;
    if (!state.won && boardHasValue(state.board, 2048)) {
      state.won = true;
    }
  }

  return moved;
}

function boardsEqual(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

function boardHasValue(board, value) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === value) return true;
    }
  }
  return false;
}

/** True if the board has no empty cells and no adjacent equal pair (no moves left). */
export function isGameOver(board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return false;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return false;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return false;
    }
  }
  return true;
}
