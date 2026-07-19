# 지침 파일 — Review 단계 (app2048)

너는 my-blog 프로젝트의 미니 웹앱 "2048 게임"의 **Review 서브에이전트**다. Build 서브에이전트와는 별개의 독립적인 검증 담당이며, 이 파일이 네게 주어진 전용 지침 파일이다. Build가 스스로 한 자체 점검을 신뢰하지 말고, 독립적으로 다시 검증해라.

## 먼저 읽을 것
1. `C:\Users\tagi7\Desktop\claude_exam\my-blog\CLAUDE.md`
2. `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\spec.md` — 검증 기준(요구사항 원본)
3. `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\BUILD.md` — Build에게 준 완료 기준 체크리스트
4. 구현 파일 전부: `app2048/index.html`, `app2048/styles.css`, `app2048/game.js`, `app2048/app.js`

## 네가 할 일
1. 정적 서버가 `http://localhost:8080`에서 이미 실행 중이다 (my-blog 루트를 서빙). `http://localhost:8080/app2048/index.html`을 브라우저 도구로 열어서 **실제로 동작하는지** 검증해라. 코드만 읽고 "맞겠지"라고 넘어가지 말고 반드시 브라우저에서 상호작용(키보드 입력 시뮬레이션, 클릭 등)으로 확인해라.
2. 최소 다음을 실제로 확인한다:
   - 키보드 방향키 4방향으로 타일이 이동/병합되는가 (콘솔에서 keydown 이벤트 디스패치 또는 실제 컴퓨터 키 입력)
   - 점수가 올라가는가, SCORE/BEST 표시가 정상인가
   - "새 게임" 버튼이 보드를 초기화하는가 (best는 유지되는가)
   - 콘솔에 JS 에러가 없는가 (`read_console_messages`)
   - 네트워크 요청이 전부 200인가 (`read_network_requests`) — 외부 CDN 요청이 하나도 없어야 한다(spec.md의 "외부 라이브러리 없음" 요건)
   - 모바일 폭(375px)으로 리사이즈했을 때 레이아웃이 깨지지 않는가, 가로 스크롤이 생기지 않는가
   - 다크모드(`prefers-color-scheme: dark`)에서 텍스트 대비가 괜찮은가
   - 승리 조건과 게임오버 조건을 억지로 만들어서(보드 상태를 직접 조작하거나 여러 번 이동을 반복해서) 오버레이가 실제로 뜨는지, 버튼이 동작하는지
   - localStorage에 best 점수가 저장되고 새로고침 후에도 유지되는지
3. 문제를 발견하면 **네가 직접 고쳐라** (`app2048/` 안의 4개 파일만 수정 가능). 고친 뒤 다시 브라우저에서 재검증해라.
4. 검증이 끝나면 `C:\Users\tagi7\Desktop\claude_exam\my-blog\app2048\review.md`를 작성한다. 내용: 검증한 항목과 결과(통과/실패), 발견한 문제와 수정 내역, 최종 결론(배포 가능 여부).

## 범위 제한
- 오직 `/app2048/` 폴더 안의 `index.html`, `styles.css`, `game.js`, `app.js`(문제 수정 시), `review.md`(신규 작성)만 만들거나 고친다.
- `spec.md`, `BUILD.md`, `PLAN.md`, `REVIEW-TASK.md`는 수정하지 않는다.
- 블로그 루트의 `index.html`, `post.html`, `js/`, `styles/`, `posts/`, `scripts/`, `CLAUDE.md`, `DESIGN-airtable.md`, `README.md`, `package.json`, `.gitignore`, `.claude/`는 절대 건드리지 않는다.
