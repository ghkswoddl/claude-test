// grid.js — 픽셀 아트 데이터 모델
//
// DOM/canvas에 전혀 의존하지 않는 순수 모듈이다. 16x16 셀을 1차원 배열로 표현하며
// 각 칸의 값은 색상 문자열(예: "#FF004D") 또는 비어있음을 뜻하는 null이다.
// editor.js가 이 모듈을 import해 상태를 갱신하고, 그 결과를 canvas에 그린다.

export const GRID_SIZE = 16;

/** row, col을 1차원 배열 인덱스로 변환한다. */
function toIndex(row, col, size) {
  return row * size + col;
}

/** row, col이 격자 범위 안에 있는지 확인한다. */
export function isInBounds(row, col, size = GRID_SIZE) {
  return row >= 0 && row < size && col >= 0 && col < size;
}

/** size x size 크기의 빈 격자(전부 null = 투명)를 생성한다. */
export function createGrid(size = GRID_SIZE) {
  return new Array(size * size).fill(null);
}

/** 특정 칸의 색을 읽는다. 범위 밖이면 null을 반환한다. */
export function getCell(grid, row, col, size = GRID_SIZE) {
  if (!isInBounds(row, col, size)) return null;
  return grid[toIndex(row, col, size)];
}

/**
 * 특정 칸의 색을 설정한다. color가 null이면 그 칸을 투명(지움)으로 만든다.
 * 범위 밖 좌표는 조용히 무시한다(호출부에서 경계 클램프를 이미 하지만 방어적으로 둔다).
 */
export function setCell(grid, row, col, color, size = GRID_SIZE) {
  if (!isInBounds(row, col, size)) return grid;
  grid[toIndex(row, col, size)] = color;
  return grid;
}

/** 격자 전체를 투명(null)으로 되돌린다. */
export function clearGrid(grid) {
  grid.fill(null);
  return grid;
}
