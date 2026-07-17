# my-blog

마크다운(.md) 파일을 읽어서 정적 블로그 웹사이트로 변환하는 프로젝트.

## 기술 스택 제약

- **프레임워크 없음.** 순수 HTML, CSS, JavaScript만 사용한다 (React/Vue/Svelte 등 금지, 번들러/빌드 툴도 지양).
- 마크다운 파싱은 의존성을 추가해야 한다면 단일 파일로 벤더링해서 쓰거나 직접 구현한다. 가능하면 외부 런타임 의존성 없이 동작하도록 한다.
- 브라우저에서 바로 열리거나 정적 파일 서버로 서빙 가능한 구조를 유지한다 (`index.html` 진입점).
- 다크모드 지원 필수.
- 반응형(모바일/태블릿/데스크톱) 필수.

## 디자인 시스템

디자인 토큰과 컴포넌트 스펙의 원본은 [`../DESIGN-airtable.md`](../DESIGN-airtable.md) (Airtable 마케팅 사이트 분석 기반). 이 프로젝트에서 CSS를 작성할 때는 그 문서의 토큰을 CSS 커스텀 프로퍼티로 옮겨서 쓴다. 아래는 이 프로젝트에서 바로 참조할 요약이다.

### 톤 & 원칙
- 화이트 캔버스 + 다크 잉크 타입의 에디토리얼 톤. 브랜드 임팩트는 그라디언트가 아니라 **풀블리드 시그니처 카드**(coral/forest/dark navy)에서 나온다.
- 타이포는 굵기를 낮게 유지한다. 디스플레이 헤드라인은 400~500, 본문은 400. 600 이상은 legal/cookie 배너류에만 쓴다.
- 프라이머리 CTA는 항상 near-black 필 버튼. 링크 블루(`--color-link`)를 프라이머리 버튼 색으로 쓰지 않는다.
- hover 상태는 정의하지 않는다(Default/Active만). 새 컴포넌트를 만들 때도 이 원칙을 따른다.
- 라운드 코너는 위계가 있다: 인풋 6px < 콘텐츠 카드 10px < 프라이머리 버튼/시그니처 카드 12px. `pill`(9999px)은 프라이싱 서브시스템 전용이라 이 블로그에서는 원칙적으로 사용하지 않는다.
- 섹션 간 수직 리듬은 96px(`--space-section`)로 통일한다.

### 라이트 모드 토큰 (원본 그대로)

```css
--color-primary: #181d26;
--color-primary-active: #0d1218;
--color-ink: #181d26;
--color-body: #333840;
--color-muted: #41454d;
--color-hairline: #dddddd;
--color-border-strong: #9297a0;
--color-canvas: #ffffff;
--color-surface-soft: #f8fafc;
--color-surface-strong: #e0e2e6;
--color-surface-dark: #181d26;
--color-surface-dark-elevated: #1d1f25;
--color-signature-coral: #aa2d00;
--color-signature-forest: #0a2e0e;
--color-signature-cream: #f5e9d4;
--color-signature-peach: #fcab79;
--color-signature-mint: #a8d8c4;
--color-signature-yellow: #f4d35e;
--color-signature-mustard: #d9a441;
--color-on-primary: #ffffff;
--color-on-dark: #ffffff;
--color-link: #1b61c9;
--color-link-active: #1a3866;
--color-info: #254fad;
--color-info-border: #458fff;
--color-success: #006400;
--color-success-border: #39bf45;
```

### 다크 모드 토큰 (원본 문서에 없어 이 프로젝트에서 확장 — 에디토리얼 톤 유지 원칙으로 파생)

원본 디자인 시스템은 라이트 전용이므로, 다크모드는 "캔버스↔잉크 반전 + 시그니처 컬러는 채도를 유지하되 배경 대비를 위해 밝기만 조정"하는 원칙으로 파생한다. 시그니처 카드 색(coral/forest/cream 등)은 브랜드 정체성이므로 다크모드에서도 색상 자체는 바꾸지 않고, 카드가 이미 자체 배경을 갖고 있으므로 캔버스 반전의 영향을 받지 않는다.

```css
--color-canvas: #14161b;        /* was #ffffff */
--color-surface-soft: #1b1e24;  /* was #f8fafc */
--color-surface-strong: #262a32;/* was #e0e2e6 */
--color-ink: #f2f3f5;           /* was #181d26 */
--color-body: #c7cad1;          /* was #333840 */
--color-muted: #9297a0;         /* was #41454d */
--color-hairline: #33373f;      /* was #dddddd */
--color-border-strong: #4a4f59;
--color-on-primary: #14161b;    /* primary button becomes light-on-dark ink pill */
--color-primary: #f2f3f5;       /* near-white pill replaces near-black in dark mode */
--color-primary-active: #d8dae0;
--color-link: #6ea1ff;          /* lightened for AA contrast on dark canvas */
--color-link-active: #a9c6ff;
--color-info-border: #5c9dff;
--color-success-border: #4fd65b;
/* signature-* 컬러는 라이트모드 값 그대로 사용 (카드 자체가 이미 어두운 배경) */
```

다크모드는 `prefers-color-scheme: dark` 미디어쿼리를 기본으로 하고, `data-theme="dark"` / `data-theme="light"` 속성으로 수동 토글을 오버라이드할 수 있게 구현한다.

### 타이포그래피

블로그 글 렌더링에 실제로 쓰이는 스케일 위주:

| 토큰 | 크기 | 굵기 | line-height | 용도 |
|---|---|---|---|---|
| display-lg | 40px | 400 | 1.2 | 블로그 타이틀(h1) |
| display-md | 32px | 400 | 1.2 | 섹션 헤드라인(h2) |
| title-lg | 24px | 400 | 1.35 | h3 |
| title-md | 20px | 400 | 1.5 | h4 |
| title-sm | 18px | 500 | 1.4 | 아티클 카드 제목 |
| label-md | 16px | 500 | 1.4 | 리스트 라벨 |
| body-md | 14px | 400 | 1.25 | 본문, 네비, 푸터 |
| caption | 14px | 500 | 1.35 | 메타 텍스트(작성일, 태그) |

폰트 스택: `"Haas Groot Disp", "Haas", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`. 라이선스 폰트가 없으므로 실제로는 `Inter` 또는 시스템 폰트로 폴백해서 구현한다 (원본 문서의 "Note on Font Substitutes" 참고).

### 컴포넌트 (블로그 맥락에 필요한 것 위주)

- **top-nav**: 64px 높이, 화이트/다크 캔버스, 로고 + 메뉴 + CTA. 다크모드에서도 nav는 반전하지 않고 캔버스 컬러를 따라간다.
- **button-primary**: `--color-primary` 배경, `rounded-lg`(12px), 패딩 16×24px. 페이지당 하나만 강조 용도로 사용.
- **button-secondary**: 캔버스 배경 + hairline 아웃라인.
- **article-card**: 목록 페이지의 글 카드. `rounded-md`(10px), 16px 패딩, 16:9 썸네일, title-sm 제목, caption 메타.
- **topic-filter-rail**: 240px 좌측 카테고리 필터(태그/카테고리 있는 경우).
- **text-link**: 본문 내 링크는 `--color-link`, 밑줄 없음.
- **hero-band**: 글 상세 페이지 상단 96px 여백의 타이틀 영역. 그라디언트/장식 금지.

### 반응형 브레이크포인트

| 이름 | 너비 | 주요 변화 |
|---|---|---|
| Mobile | < 768px | 단일 컬럼, 네비 햄버거로 축소, 카드 그리드 1열 |
| Tablet | 768–1024px | 카드 그리드 2열, 네비는 유지되지만 축소 |
| Desktop | 1024–1440px | 카드 그리드 3열, 전체 네비 표시 |
| Wide | > 1440px | 최대 콘텐츠 폭 ~1280px, 남는 공간은 여백으로 처리 |

## 프로젝트 구조 원칙

- 순수 정적 사이트: `index.html`(글 목록) + 글 상세 페이지 렌더링용 템플릿 + `posts/*.md` 원본.
- 마크다운 → HTML 변환은 클라이언트 사이드 JS로 처리하거나, 빌드 없이도 동작하도록 fetch 기반으로 구현한다.
- CSS는 디자인 토큰을 `:root` 커스텀 프로퍼티로 선언한 별도 파일(`styles/tokens.css` 등)로 분리하고, 다크모드 오버라이드는 같은 파일 내 `@media (prefers-color-scheme: dark)`와 `[data-theme="dark"]` 셀렉터로 처리한다.
- 새 컴포넌트를 추가할 때는 위 디자인 시스템 표를 우선 참조하고, 없는 값은 [`../DESIGN-airtable.md`](../DESIGN-airtable.md) 원본에서 찾는다.

## Do / Don't

- **Do**: 화이트/다크 캔버스 사이의 여백을 브랜드 무드로 활용한다. 시그니처 카드는 글 목록/상세 페이지의 콜아웃(추천 글, 뉴스레터 구독 등)에 아껴서 사용한다.
- **Don't**: hover 애니메이션이나 그림자를 과하게 추가하지 않는다. `rounded-pill`은 이 프로젝트에서 쓰지 않는다(프라이싱 전용 서브시스템 표시라 블로그 맥락에 안 맞음). 디스플레이 타이틀을 bold(700)로 만들지 않는다.
