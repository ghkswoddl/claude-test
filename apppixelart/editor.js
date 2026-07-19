// editor.js — 픽셀 아트 에디터 UI 컨트롤러
//
// grid.js(순수 데이터 모델)를 import해서 상태를 관리하고, canvas 렌더링/포인터 입력/
// 팔레트·툴바 이벤트/PNG 내보내기를 전담한다. spec.md 4장의 설계를 그대로 따른다.

import { GRID_SIZE, createGrid, setCell, getCell, clearGrid } from './grid.js';

// spec.md 4.5절: 칸당 32px, 16칸 → 512x512 내부 해상도. 이 canvas 자체가 최종
// 내보내기 해상도이므로 별도 확대(scale-up) 단계가 필요 없다.
const CELL_PX = 32;
const CANVAS_PX = GRID_SIZE * CELL_PX; // 512

// spec.md 4.3절 표의 HEX 값을 그대로 사용한다(PICO-8 계열 16색 팔레트).
const PALETTE = [
  '#000000', '#FF004D', '#1D2B53', '#FFA300',
  '#7E2553', '#FFEC27', '#008751', '#00E436',
  '#AB5236', '#29ADFF', '#5F574F', '#83769C',
  '#C2C3C7', '#FF77A8', '#FFF1E8', '#FFCCAA',
];

// 격자선 색은 그리기 도구 관례상 라이트/다크 어느 체크무늬 위에서도 보이는
// 중성 회색 반투명으로 고정한다(spec.md 6절 — 캔버스 작업 공간은 톤 제약에서 자유).
const GRID_LINE_COLOR = 'rgba(128, 132, 140, 0.55)';

/** @type {(string|null)[]} */
let grid = createGrid(GRID_SIZE);
let currentColor = PALETTE[0];
let isErasing = false;
let isPointerDown = false;
/** @type {{row:number, col:number}|null} 드래그 중 마지막으로 칠한 칸(중복 재호출 방지) */
let lastPaintedCell = null;
/** @type {HTMLElement|null} 현재 선택 표시가 되어 있는 스와치 요소 */
let selectedSwatchEl = null;

const pixelCanvas = document.getElementById('pixel-canvas');
const overlayCanvas = document.getElementById('grid-overlay');
const pixelCtx = pixelCanvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');

const paletteSwatchesEl = document.getElementById('palette-swatches');
const customColorInput = document.getElementById('custom-color-input');
const customSwatchLabel = document.getElementById('custom-swatch-label');

const eraserToggleBtn = document.getElementById('eraser-toggle');
const clearAllBtn = document.getElementById('clear-all');
const savePngBtn = document.getElementById('save-png');

// ---------------------------------------------------------------------------
// 렌더링
// ---------------------------------------------------------------------------

/** 격자선만 그리는 오버레이. 편집 중 다시 계산될 필요가 없어 초기 1회만 그린다. */
function drawGridOverlay() {
  overlayCtx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
  overlayCtx.strokeStyle = GRID_LINE_COLOR;
  overlayCtx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * CELL_PX + 0.5; // 0.5 오프셋으로 1px 선이 흐려지지 않게 함
    overlayCtx.beginPath();
    overlayCtx.moveTo(pos, 0);
    overlayCtx.lineTo(pos, CANVAS_PX);
    overlayCtx.stroke();
    overlayCtx.beginPath();
    overlayCtx.moveTo(0, pos);
    overlayCtx.lineTo(CANVAS_PX, pos);
    overlayCtx.stroke();
  }
}

/** 칸 하나만 다시 그린다(드래그 페인팅 중 전체 재렌더링을 피하기 위함). */
function renderCell(row, col) {
  const x = col * CELL_PX;
  const y = row * CELL_PX;
  const color = getCell(grid, row, col);
  pixelCtx.clearRect(x, y, CELL_PX, CELL_PX);
  if (color) {
    pixelCtx.fillStyle = color;
    pixelCtx.fillRect(x, y, CELL_PX, CELL_PX);
  }
}

/** grid 데이터 전체를 pixel-canvas에 다시 그린다(초기 로드·전체 지우기 후 사용). */
function renderAll() {
  pixelCtx.clearRect(0, 0, CANVAS_PX, CANVAS_PX);
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const color = getCell(grid, row, col);
      if (color) {
        pixelCtx.fillStyle = color;
        pixelCtx.fillRect(col * CELL_PX, row * CELL_PX, CELL_PX, CELL_PX);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 좌표 → 칸 변환 + 포인터 입력 (spec.md 4.2절)
// ---------------------------------------------------------------------------

function getCellFromPointerEvent(evt) {
  const rect = pixelCanvas.getBoundingClientRect();
  const scaleX = pixelCanvas.width / rect.width;
  const scaleY = pixelCanvas.height / rect.height;
  const x = (evt.clientX - rect.left) * scaleX;
  const y = (evt.clientY - rect.top) * scaleY;
  const col = Math.floor(x / CELL_PX);
  const row = Math.floor(y / CELL_PX);
  return { row, col };
}

function paintAt(row, col) {
  if (!Number.isInteger(row) || !Number.isInteger(col)) return;
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return; // 격자 밖은 무시
  if (lastPaintedCell && lastPaintedCell.row === row && lastPaintedCell.col === col) {
    return; // 같은 칸이면 재호출하지 않는다
  }
  lastPaintedCell = { row, col };
  const color = isErasing ? null : currentColor;
  setCell(grid, row, col, color);
  renderCell(row, col);
}

function handlePointerDown(evt) {
  isPointerDown = true;
  lastPaintedCell = null;
  try {
    // 드물게(오래된 브라우저/특이 입력 장치 등) 활성 포인터로 인식되지 않아
    // NotFoundError를 던지는 경우가 있다. 이때도 첫 칸 칠하기 자체는 계속 진행해야
    // 하므로 방어적으로 감싼다(캡처 실패는 이후 드래그 추적만 못 하게 될 뿐).
    pixelCanvas.setPointerCapture(evt.pointerId);
  } catch (err) {
    /* no-op: setPointerCapture 실패는 무시하고 아래 칠하기는 계속 진행한다 */
  }
  const { row, col } = getCellFromPointerEvent(evt);
  paintAt(row, col);
  evt.preventDefault();
}

function handlePointerMove(evt) {
  if (!isPointerDown) return;
  const { row, col } = getCellFromPointerEvent(evt);
  paintAt(row, col);
}

function handlePointerEnd() {
  isPointerDown = false;
  lastPaintedCell = null;
}

pixelCanvas.addEventListener('pointerdown', handlePointerDown);
pixelCanvas.addEventListener('pointermove', handlePointerMove);
pixelCanvas.addEventListener('pointerup', handlePointerEnd);
pixelCanvas.addEventListener('pointercancel', handlePointerEnd);

// ---------------------------------------------------------------------------
// 팔레트 (spec.md 4.3절)
// ---------------------------------------------------------------------------

function setSelectedSwatch(el) {
  if (selectedSwatchEl) selectedSwatchEl.classList.remove('is-selected');
  selectedSwatchEl = el;
  if (selectedSwatchEl) selectedSwatchEl.classList.add('is-selected');
}

/** 스와치 클릭(또는 커스텀 컬러 변경) 공통 처리: 현재 색 변경 + 자동으로 펜 모드로 전환. */
function selectColor(color, swatchEl) {
  currentColor = color;
  if (isErasing) {
    isErasing = false;
    updateEraserButtonState();
  }
  setSelectedSwatch(swatchEl);
}

function buildPaletteSwatches() {
  PALETTE.forEach((color, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'swatch';
    btn.style.setProperty('--swatch-color', color);
    btn.dataset.color = color;
    btn.setAttribute('aria-label', `색상 ${color} 선택`);
    btn.addEventListener('click', () => selectColor(color, btn));
    paletteSwatchesEl.appendChild(btn);
    if (i === 0) {
      // 기본 선택 색상
      selectColor(color, btn);
    }
  });
}

customColorInput.addEventListener('input', (evt) => {
  const color = evt.target.value;
  customSwatchLabel.style.setProperty('--swatch-color', color);
  selectColor(color, customSwatchLabel);
});

// ---------------------------------------------------------------------------
// 툴바: 지우개 토글 / 전체 지우기 / PNG 저장 (spec.md 4.4, 4.5절)
// ---------------------------------------------------------------------------

function updateEraserButtonState() {
  eraserToggleBtn.setAttribute('aria-pressed', String(isErasing));
  eraserToggleBtn.classList.toggle('is-active', isErasing);
}

eraserToggleBtn.addEventListener('click', () => {
  isErasing = !isErasing;
  updateEraserButtonState();
});

clearAllBtn.addEventListener('click', () => {
  const confirmed = window.confirm('정말 전체 그림을 지울까요? 이 작업은 되돌릴 수 없습니다.');
  if (!confirmed) return;
  clearGrid(grid);
  lastPaintedCell = null;
  renderAll();
});

savePngBtn.addEventListener('click', () => {
  // pixel-canvas 하나만 내보낸다: 체크무늬 배경과 격자선은 별도 레이어라 섞이지 않는다.
  const dataUrl = pixelCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'pixel-art.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// ---------------------------------------------------------------------------
// 초기화
// ---------------------------------------------------------------------------

function init() {
  buildPaletteSwatches();
  drawGridOverlay();
  renderAll();
  updateEraserButtonState();
}

init();
