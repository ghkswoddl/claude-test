# 지침 파일 — Build 단계 (app2048)

너는 my-blog 프로젝트의 새 미니 웹앱 "2048 게임"의 **Build 서브에이전트**다. 이 파일이 네게 주어진 전용 지침 파일이며, 여기 명시된 범위만 수정한다. 화면이 1개(단일 화면)이므로 화면별 서브에이전트 분리는 없다 — 네가 전체를 구현한다.

## 먼저 읽을 것
1. `C:\Users\tagi7\Desktop\claude_exam\my-blog\CLAUDE.md` — 워크플로/서브에이전트 규칙/Build 금지 파일 목록.
2. `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\spec.md` — 사용자 승인된 계획. 이 파일의 4장(게임 로직), 5장(조작), 6장(디자인 톤)을 그대로 구현 스펙으로 삼는다.
3. (참고용, 읽기만) `C:\Users\tagi7\Desktop\claude_exam\my-blog\styles\tokens.css` — 색상/spacing/radius 값을 참고해 app2048 자체 CSS 변수로 복제할 때 사용.

## 네가 만들 파일 (전부 `/app2048/` 안에만)
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\index.html`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\styles.css`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\game.js`
- `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\app.js`

## 구현 요구사항 (spec.md 요약 — 상세는 spec.md 원문 참조)
- **게임 엔진 (`game.js`)**: DOM에 의존하지 않는 순수 로직 모듈. 4x4 board 배열, 4방향 이동+병합(압축→병합→역변환), 병합 시 새 값만큼 점수 가산, 이동 후 실제로 보드가 바뀐 경우에만 빈칸에 새 타일(2 확률 90%, 4 확률 10%) 생성, 승리(2048 타일 최초 생성) 판정, 게임오버(빈칸 없고 인접 병합 불가) 판정. ES module로 작성해 `export`.
- **UI 컨트롤러 (`app.js`)**: `game.js`를 import해 상태를 렌더링. 헤더, SCORE/BEST 점수판, 새 게임 버튼, 4x4 보드, 승리/게임오버 오버레이. 키보드 방향키(`ArrowUp/Down/Left/Right`, `preventDefault()`로 스크롤 방지) + 모바일 터치 스와이프(`touchstart`/`touchend` 좌표차, 임계값 약 30px) 둘 다 지원. `localStorage` 키 `app2048-best-score`로 최고점수 저장(새 게임해도 유지, 새로고침해도 유지). 승리 시 "계속하기"/"새 게임", 게임오버 시 "다시 시작" 버튼 제공. 오버레이가 떠 있는 동안 이동 입력 무시.
- **HTML (`index.html`)**: 완전히 독립적인 정적 페이지. `<title>2048</title>` 등 자체 `<head>`를 가지며, 블로그 루트의 `index.html`/`post.html`을 참조하거나 import하지 않는다. `styles.css`, `app.js`(`type="module"`)만 로드. 블로그로 돌아가는 링크(`<a href="../index.html">← 블로그로</a>` 등)를 헤더 근처에 하나 넣어 도움이 되게 한다.
- **CSS (`styles.css`)**: `styles/tokens.css`의 값(색상 hex, spacing, radius)을 이 파일 안에 `:root` 커스텀 프로퍼티로 복제(직접 import 금지, 자체 완결). UI 크롬(헤더/점수판/버튼/오버레이)은 블로그 톤(near-black 프라이머리 버튼, hover 없음—`:active`만, radius 위계) 유지. 보드/타일은 2048 고유 팔레트(보드 `#bbada0` 계열, 타일 값별 전통 색상 계단) 사용. `prefers-color-scheme: dark`로 UI 크롬만 다크 대응(별도 토글 버튼 없음, 타일 팔레트는 다크에서도 유지). 반응형: 320px(모바일)~1440px에서 보드/카드가 뷰포트 폭에 맞게 스케일되고 레이아웃이 깨지지 않아야 한다(`max-width` 컨테이너 + 보드는 정사각형 유지, `aspect-ratio: 1` 등 활용).
- 외부 라이브러리/CDN/웹폰트 사용 금지 — 순수 HTML/CSS/JS, 시스템 폰트 스택만 사용.
- 접근성: 버튼 최소 44×44px, 포커스 아웃라인 유지(제거 금지).

## 완료 기준 (구현 후 스스로 점검할 체크리스트)
- [ ] 키보드 4방향(상하좌우)으로 타일이 올바르게 이동/병합됨
- [ ] 모바일 터치 스와이프 4방향 모두 동작
- [ ] 병합 규칙이 정확함 (한 이동에 타일당 최대 1회 병합, 연쇄 병합 없음)
- [ ] 점수가 병합된 새 값만큼 정확히 가산됨
- [ ] 이동으로 보드가 실제로 바뀐 경우에만 새 타일 생성 (2:4 = 90:10 비율)
- [ ] 2048 타일 생성 시 승리 오버레이, "계속하기"로 이어서 플레이 가능
- [ ] 더 이상 움직일 수 없으면 게임오버 오버레이
- [ ] "새 게임" 버튼으로 완전 초기화 (단, best 점수는 유지)
- [ ] localStorage에 best 점수가 저장되고 새로고침 후에도 유지됨
- [ ] 320px 폭(모바일)에서 레이아웃이 깨지지 않음
- [ ] 라이트/다크(OS 설정) 양쪽에서 읽기 가능한 대비

## 범위 제한 (중요)
- **오직 `/app2048/` 폴더 안의 `index.html`, `styles.css`, `game.js`, `app.js` 4개 파일만 생성/수정한다.**
- `spec.md`, `BUILD.md`, `PLAN.md`는 참고만 하고 수정하지 않는다. `review.md`는 네가 만들지 않는다(Review 서브에이전트가 별도로 작성).
- 다음은 절대 만들거나 고치거나 지우지 않는다: 블로그 루트의 `index.html`, `post.html`, `js/`, `styles/`, `posts/`, `scripts/`, `CLAUDE.md`, `DESIGN-airtable.md`, `README.md`, `package.json`, `.gitignore`, `.claude/`.
- 막히는 부분이 있으면(예: spec.md 내용이 모호함) 임의로 크게 벗어나지 말고, 합리적으로 판단해 구현하되 그 판단 근거를 코드 주석이나 최종 보고에 남겨라.
