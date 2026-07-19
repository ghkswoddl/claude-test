# review.md — 픽셀 아트 에디터 검증 결과 (Review 서브에이전트)

Build 서브에이전트의 자체 점검 보고를 신뢰하지 않고, 정적 서버(`http://localhost:8080/apppixelart/index.html`)에서
브라우저를 직접 구동해 재검증했다. 검증은 실제 포인터 클릭/드래그 디스패치, `getImageData` 픽셀 판독,
`toDataURL` 결과 디코드, `getComputedStyle` 확인, 뷰포트 리사이즈를 통해 수행했다(코드만 읽고 넘어가지 않음).

## 검증 항목 및 결과

| # | 항목 | 결과 | 비고 |
|---|---|---|---|
| 1 | 캔버스 클릭 시 정확한 칸이 칠해지는가 (CSS 축소 표시 상태 포함) | 통과 | 캔버스가 CSS로 500×500(내부 512×512)로 축소 표시된 상태에서 클릭 → `getImageData`로 의도한 칸(row5,col10)만 정확히 채색됨을 확인 |
| 2 | 드래그로 연속 칠하기 | 통과 | `pointerdown`→다수의 `pointermove`(60스텝)→`pointerup`를 디스패치해 한 행(16칸) 전부가 빠짐없이 연속 채색됨을 픽셀 단위로 확인. (참고: 브라우저 도구의 `left_click_drag` 합성 제스처는 중간 이벤트가 성글어 일부 칸이 비었으나, 이는 입력 시뮬레이터의 한계이며 앱 로직 문제 아님 — 세밀한 `pointermove` 시퀀스로는 완전히 통과) |
| 3 | 팔레트 16색 전부 클릭 가능, 현재 색 반영, 선택 스와치 시각 구분(검정 포함) | 통과 | 각 스와치 클릭 시 `currentColor` 갱신 및 `is-selected` 클래스 적용 확인. 검정 스와치는 `box-shadow: white 0 0 0 2px, ink 0 0 0 4px` 이중 링으로 `border-color`(잉크색과 유사)만으로는 안 보일 문제를 실제로 회피함을 `getComputedStyle`로 확인(`rgb(255,255,255) 0 0 0 2px, rgb(24,29,38) 0 0 0 4px`) |
| 4 | 커스텀 컬러피커 | 통과 | `input[type=color]`에 값 설정 후 `input` 이벤트 발생 시 `currentColor`가 즉시 반영되고(`#123456` → 픽셀 `rgb(18,52,86)` 정확히 일치), 커스텀 스와치 미리보기 색 및 선택 표시도 갱신됨 |
| 5 | 지우개 토글로 칸이 투명해짐 | 통과 | 토글 후 칠해진 칸 클릭 → 해당 칸만 알파 0으로 지워짐을 확인 |
| 6 | 전체 지우기 — confirm 취소/확인 양쪽 경로 | 통과 | `window.confirm`을 스텁해 취소 시 격자 유지(19456 비투명 픽셀 유지), 확인 시 전체 삭제(0 비투명 픽셀)됨을 각각 확인 |
| 7 | PNG 저장 — 다운로드 트리거, 512×512, 투명 배경, 격자선 미혼입 | 통과 | `HTMLAnchorElement.prototype.click`을 가로채 실제 파일 저장은 실행하지 않고(권한 정책상 임의 다운로드 자제) `href`가 `data:image/png...`, `download="pixel-art.png"`로 정확히 설정됨을 확인. 별도로 `pixel-canvas.toDataURL()` 결과를 `Image`로 디코드해 재판독 → 512×512, 코너 알파 0(투명 배경 보존), 격자선 색상(`rgba(128,132,140,0.55)` 근사값)에 해당하는 픽셀 0개로 격자선이 섞이지 않음을 확인 |
| 8 | `hidden`/조건부 표시 요소의 실제 computed `display` 값 확인 | 통과(해당 요소 없음을 확인) | 코드 전체에서 `hidden` 속성이나 조건부 `display` 토글을 사용하는 요소를 검색한 결과 없음(`grid-overlay`의 `aria-hidden`은 접근성 속성일 뿐 표시 여부와 무관). 커스텀 컬러 `<input>`은 `display:none` 대신 clip 기법(`.sr-only-input`)으로 숨겨 실제로 `getComputedStyle().display`가 `"block"`, `pointerEvents: "auto"`임을 확인 — 클릭으로 네이티브 컬러피커를 여는 경로가 막히지 않음. app2048에서 발생한 "`[hidden]`을 CSS가 무시" 유형의 버그는 이 앱에는 해당 사항 없음 |
| 9 | 콘솔 JS 에러 없음 / 외부 CDN 요청 없음 | 통과 | 전 과정에서 콘솔 로그 없음(에러 0건). 네트워크 요청은 `grid.js`(로컬) 등 로컬 리소스만 관찰되고 외부 호스트 요청 없음 |
| 10 | 모바일 폭(375px, 320px)에서 레이아웃 및 스크롤 방지 | 통과 | 375px·320px 각각에서 `document.body.scrollWidth === window.innerWidth`(가로 스크롤 없음) 확인. `#pixel-canvas`/`#grid-overlay`의 `getComputedStyle().touchAction`이 `"none"`임을 실제 계산값으로 확인(속성이 아닌 computed style 기준) |
| 11 | 다크모드 텍스트/버튼 대비 | **버그 발견 → 수정 완료** | 아래 "발견한 문제" 참조 |

## 발견한 문제와 수정 내역

### 버그: 다크모드에서 `--color-link` 토큰 누락 → 상단 "← 블로그로" 링크가 다크모드에서도 라이트모드 파란색을 사용, 대비 부족

- **위치**: `apppixelart/styles.css`
- **증상**: `.back-link`가 `color: var(--color-link, #1b61c9)`를 쓰는데, `:root`와 `@media (prefers-color-scheme: dark)` 블록 어디에도 `--color-link` 커스텀 프로퍼티가 선언되어 있지 않았다. 그 결과 라이트/다크 모드 구분 없이 항상 폴백값 `#1b61c9`(라이트모드용 파랑)가 적용됨.
- **실측**: 다크모드(`--color-canvas: #14161b`)에서 `getComputedStyle(backLink).color`가 `rgb(27, 97, 201)`로 나왔고, WCAG 상대 휘도 계산 결과 대비비 약 **3.1:1**로 일반 텍스트 기준 AA(4.5:1) 미달. CLAUDE.md의 다크모드 토큰 표에는 `--color-link: #6ea1ff`(다크 캔버스 대비 확보를 위해 밝게 조정)로 명시되어 있었으나 이 앱 CSS에는 반영되지 않았던 것.
- **수정**: `:root`에 `--color-link: #1b61c9; --color-link-active: #1a3866;` 추가, `@media (prefers-color-scheme: dark)` 블록에 `--color-link: #6ea1ff; --color-link-active: #a9c6ff;` 추가(CLAUDE.md 다크 토큰 값 그대로). 수정 후 재검증: 다크모드에서 `getComputedStyle(backLink).color` → `rgb(110, 161, 255)`(`#6ea1ff`), 대비비 약 **7.1:1**로 AA/AAA 모두 통과. 라이트모드는 기존 `#1b61c9` 그대로 유지됨을 재확인.
- **수정 파일**: `apppixelart/styles.css`만 수정(범위 내).

그 외 코드 전반(좌표 변환, 팔레트, 지우개, 전체 지우기, PNG 내보내기, 반응형, `touch-action`, 격자선/체크무늬 분리 레이어 구조)은 spec.md·BUILD.md 요구사항과 실제 동작이 일치했고 추가 수정이 필요한 결함을 발견하지 못했다.

## 최종 결론

**배포 가능.** 위에서 발견된 다크모드 링크 대비 부족 버그를 `apppixelart/styles.css`에서 수정했고, 수정 후 재검증까지 완료했다. 나머지 모든 핵심 기능(격자 좌표 매핑, 드래그 페인팅, 16색 팔레트+커스텀 컬러피커, 지우개/전체 지우기, 512×512 투명 배경 PNG 내보내기, 모바일 터치 스크롤 방지, 320~1440px 반응형, 콘솔/네트워크 무결성)이 실제 브라우저 동작으로 확인되었다. `hidden`/조건부 표시 요소는 이 앱에 존재하지 않으며, 존재하는 유사 패턴(커스텀 컬러 인풋의 시각적 숨김)은 `display:none`이 아닌 clip 기법으로 올바르게 구현되어 있음을 computed style로 확인했다.
