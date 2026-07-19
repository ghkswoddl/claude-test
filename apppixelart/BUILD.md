# 지침 파일 — Build 단계 (apppixelart)

너는 my-blog 프로젝트의 새 미니 웹앱 "픽셀 아트 에디터"의 **Build 서브에이전트**다. 이 파일이 네게 주어진 전용 지침 파일이며, 여기 명시된 범위만 수정한다. 화면이 1개(단일 화면)이므로 화면별 서브에이전트 분리는 없다 — 네가 전체를 구현한다.

## 먼저 읽을 것
1. `C:\Users\tagi7\Desktop\claude_exam\my-blog\CLAUDE.md` — 워크플로/서브에이전트 규칙/Build 금지 파일 목록.
2. `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\spec.md` — 사용자 승인된 계획. 4장(핵심 기능 설계)과 6장(디자인 톤)을 그대로 구현 스펙으로 삼는다.
3. (참고용, 읽기만) `C:\Users\tagi7\Desktop\claude_exam\my-blog\styles\tokens.css` — 색상/spacing/radius 값 복제용.

## 네가 만들 파일 (전부 `/apppixelart/` 안에만)
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\index.html`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\styles.css`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\grid.js`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\editor.js`

## 구현 요구사항 (spec.md 요약 — 상세는 spec.md 원문 참조)
- **데이터 모델 (`grid.js`)**: DOM/canvas에 의존하지 않는 순수 모듈. 16x16 셀 배열(색상 문자열 또는 null=투명), `createGrid()`, `setCell(grid, row, col, color)`, `clearGrid(grid)` 등 export.
- **UI 컨트롤러 (`editor.js`)**: `grid.js`를 import. spec.md 4.1절의 3-레이어 canvas 구조(체크무늬 CSS 배경 / `pixel-canvas`(그림, 저장 대상) / `grid-overlay`(격자선, `pointer-events:none`)) 그대로 구현. `pixel-canvas` 내부 해상도는 512×512(칸당 32px, spec.md 4.5절). Pointer Events(`pointerdown/move/up/cancel` + `setPointerCapture`)로 클릭+드래그 연속 칠하기, `getBoundingClientRect()` 기반 좌표→칸 변환(spec.md 4.2절). 16색 팔레트(spec.md 4.3절 표의 HEX 값 그대로) + 커스텀 `<input type="color">`. 지우개 토글, 전체 지우기(`confirm()` 확인 포함). "PNG로 저장" 클릭 시 `pixel-canvas.toDataURL('image/png')` → `<a download="pixel-art.png">`로 다운로드.
- **HTML (`index.html`)**: 완전히 독립적인 정적 페이지. 자체 `<head>`(`<title>픽셀 아트 에디터</title>` 등), 블로그 루트 페이지를 참조/import하지 않음. `styles.css`, `editor.js`(`type="module"`)만 로드. `<a href="../index.html">← 블로그로</a>` 링크 포함.
- **CSS (`styles.css`)**: `styles/tokens.css` 값을 이 파일 `:root`에 복제(직접 import 금지). UI 크롬은 블로그 톤(near-black 프라이머리 버튼, hover 없음—`:active`만, radius 위계), 캔버스 영역은 실용적 회색 체크무늬/격자선. `prefers-color-scheme: dark`로 UI 크롬 다크 대응. 캔버스 CSS: `max-width: 512px; width: 100%; image-rendering: pixelated;`, `touch-action: none`(캔버스에만, 나머지 영역은 일반 스크롤 허용). 320px~1440px 반응형.
- 외부 라이브러리/CDN/웹폰트 금지 — `<canvas>`와 `<input type="color">`는 네이티브라 허용. 시스템 폰트 스택만 사용.
- 접근성: 모든 버튼/스와치 최소 44×44px, 포커스 아웃라인 유지(제거 금지), 스와치는 `<button>` 요소로 키보드 접근 가능하게.

## 완료 기준 (구현 후 스스로 점검할 체크리스트)
- [ ] 16×16 격자가 canvas에 정확히 렌더링됨 (칸 경계가 화면 표시 크기와 무관하게 항상 정확히 매핑됨)
- [ ] 팔레트 16색 클릭으로 현재 색이 바뀌고 선택 스와치가 시각적으로 강조됨
- [ ] 커스텀 컬러피커로 색을 고르면 즉시 현재 색이 됨
- [ ] 마우스 클릭 한 번으로 1칸 칠해짐
- [ ] 마우스 드래그(누른 채 이동)로 지나가는 칸들이 연속으로 칠해짐, 같은 칸 중복 재호출 없음
- [ ] 지우개 토글 활성화 시 클릭/드래그가 칸을 투명하게 지움
- [ ] 전체 지우기 버튼 — confirm 다이얼로그 후 승인하면 격자 전체가 투명해짐
- [ ] "PNG로 저장" 클릭 시 512×512 크기, 투명 배경, 격자선 없는 PNG가 다운로드됨
- [ ] 모바일 터치로 드래그 그리기가 가능하고, 그리는 동안 페이지가 스크롤되지 않음
- [ ] 320px 폭에서 레이아웃이 깨지지 않음
- [ ] 라이트/다크(OS 설정) 양쪽에서 UI 크롬 텍스트 대비가 충분함

## 중요 — 이전 앱(app2048)에서 발견된 실수 재발 방지
app2048 빌드에서 `.overlay { display: flex; ... }`처럼 `display`를 무조건 지정한 CSS 규칙이 `[hidden]` 속성을 완전히 무시해버리는 버그가 있었다(작성자 CSS가 항상 브라우저 기본 `[hidden]{display:none}`을 이긴다). 이 앱에서 `hidden` 속성이나 조건부 표시/숨김을 쓰는 요소(예: 컬러피커 관련 UI, 안내 메시지 등)가 있다면, 반드시 `.요소[hidden] { display: none; }` 같은 명시적 규칙을 함께 넣어서 같은 실수를 반복하지 마라.

## 범위 제한 (중요)
- **오직 `/apppixelart/` 폴더 안의 `index.html`, `styles.css`, `grid.js`, `editor.js` 4개 파일만 생성/수정한다.**
- `spec.md`, `BUILD.md`, `PLAN.md`는 참고만 하고 수정하지 않는다. `review.md`는 네가 만들지 않는다(Review 서브에이전트가 별도로 작성).
- 다음은 절대 만들거나 고치거나 지우지 않는다: 블로그 루트의 `index.html`, `post.html`, `js/`, `styles/`, `posts/`, `scripts/`, `CLAUDE.md`, `DESIGN-airtable.md`, `README.md`, `package.json`, `.gitignore`, `.claude/`, 그리고 `app2048/` 등 다른 앱 폴더.
- 막히는 부분이 있으면 임의로 크게 벗어나지 말고 합리적으로 판단해 구현하되, 판단 근거를 코드 주석이나 최종 보고에 남겨라.
