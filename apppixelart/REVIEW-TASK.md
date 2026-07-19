# 지침 파일 — Review 단계 (apppixelart)

너는 my-blog 프로젝트의 미니 웹앱 "픽셀 아트 에디터"의 **Review 서브에이전트**다. Build 서브에이전트와는 별개의 독립적인 검증 담당이며, 이 파일이 네게 주어진 전용 지침 파일이다. Build의 자체 점검 보고를 신뢰하지 말고, 독립적으로 다시 검증해라.

## 먼저 읽을 것
1. `C:\Users\tagi7\Desktop\claude_exam\my-blog\CLAUDE.md`
2. `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\spec.md` — 검증 기준(요구사항 원본)
3. `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\BUILD.md` — Build에게 준 완료 기준 체크리스트
4. 구현 파일 전부: `apppixelart/index.html`, `apppixelart/styles.css`, `apppixelart/grid.js`, `apppixelart/editor.js`

## 네가 할 일
1. 정적 서버가 `http://localhost:8080`에서 이미 실행 중이다 (my-blog 루트를 서빙). `http://localhost:8080/apppixelart/index.html`을 브라우저 도구로 열어서 **실제로 동작하는지** 검증해라.
2. 최소 다음을 실제로 확인한다:
   - 캔버스를 클릭하면 정확히 그 칸이 칠해지는가 (좌표 매핑이 정확한가 — 특히 캔버스가 CSS로 축소 표시될 때도)
   - 드래그(포인터를 누른 채 이동)로 연속해서 칠해지는가
   - 팔레트 16색 전부 클릭 가능하고 현재 색이 바뀌는가, 선택된 스와치가 시각적으로 구분되는가 (모든 색상에서 — 특히 검정처럼 UI 잉크 색과 비슷한 색일 때도 선택 표시가 보이는지 반드시 확인)
   - 커스텀 컬러피커 동작
   - 지우개 토글로 칸이 투명해지는가
   - 전체 지우기 버튼 — confirm 다이얼로그가 뜨고, 취소/확인 양쪽 경로가 의도대로 동작하는가
   - "PNG로 저장" 클릭 시 실제로 다운로드가 트리거되는가, 그 PNG의 크기(512×512)와 투명 배경이 맞는가, 격자선이 섞여 있지 않은가 (가능하면 `toDataURL` 결과를 직접 디코드해서 픽셀 단위로 확인)
   - **`hidden`/조건부 표시 요소가 있다면 DOM 속성뿐 아니라 실제 계산된 CSS `display` 값까지 확인해라** — app2048에서 이 부분을 속성값만 확인하고 넘어갔다가 실제로는 CSS가 `[hidden]`을 무시하는 버그를 놓친 전례가 있다. 이 앱에 그런 요소가 있는지 코드에서 찾아보고, 있다면 반드시 computed style로 재확인해라.
   - 콘솔에 JS 에러가 없는가, 네트워크 요청에 외부 CDN이 없는가
   - 모바일 폭(375px)에서 레이아웃이 깨지지 않고, 캔버스 위에서 드래그할 때 페이지가 스크롤되지 않는가 (터치 시뮬레이션으로 확인)
   - 다크모드에서 텍스트/버튼 대비가 괜찮은가
3. 문제를 발견하면 **네가 직접 고쳐라** (`apppixelart/` 안의 4개 파일만 수정 가능). 고친 뒤 다시 브라우저에서 재검증해라.
4. 검증이 끝나면 `C:\Users\tagi7\Desktop\claude_exam\my-blog\apppixelart\review.md`를 작성한다. 내용: 검증한 항목과 결과(통과/실패), 발견한 문제와 수정 내역, 최종 결론(배포 가능 여부).

## 범위 제한
- 오직 `/apppixelart/` 폴더 안의 `index.html`, `styles.css`, `grid.js`, `editor.js`(문제 수정 시), `review.md`(신규 작성)만 만들거나 고친다.
- `spec.md`, `BUILD.md`, `PLAN.md`, `REVIEW-TASK.md`는 수정하지 않는다.
- 블로그 루트의 `index.html`, `post.html`, `js/`, `styles/`, `posts/`, `scripts/`, `CLAUDE.md`, `DESIGN-airtable.md`, `README.md`, `package.json`, `.gitignore`, `.claude/`, `app2048/`는 절대 건드리지 않는다.
