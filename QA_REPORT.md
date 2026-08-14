# SKack Overflow QA 보고서

> 이 보고서는 현재 프로젝트 상태를 기준으로, 사용자 문구와 익명 Q&A 기능을 함께 검증한 결과를 기록합니다.

## 2026-08-14 병합 후 실행 결과

아래 결과가 이 문서의 이전 실행 요약보다 우선합니다. 이번 요청의 범위는 병합 해소와 QA, 개선점 도출이며, QA 이후 P0/P1 제품 코드는 수정하지 않고 개선 항목으로만 기록했습니다.

| 구분 | 결과 | 근거 |
|---|---|---|
| Home 병합 충돌 | 통과 | `client/src/pages/Home.tsx`의 충돌 마커 제거 후 질문·답변·댓글·답글·익명 UID·localStorage/Worker 동기화 흐름 유지 확인 |
| React 타입 검사 | 통과 | `./node_modules/.bin/tsc --noEmit` |
| Worker 타입 검사 | 통과 | `./node_modules/.bin/tsc --project tsconfig.worker.json --noEmit` |
| React 정적 빌드 | 통과 | `./node_modules/.bin/vite build` |
| 서버 번들 빌드 | 통과 | `./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist` |
| 의존성 설치 | 통과 | `pnpm install --frozen-lockfile` 성공, lockfile 변경 없음 |
| pnpm 품질 스크립트 | 실행 차단 | 현재 환경에서 pnpm 10.4.1 registry signature 검증 실패로 `pnpm check`, `pnpm cf:check`, `pnpm build` lifecycle 실행 불가; 동일 작업을 직접 바이너리로 대체 검증 |
| Worker API 로컬 smoke | 통과 | 메모리 KV로 상태·사용자 저장/조회, 잘못된 UID·메서드·이미지 형식 거부 확인 |
| 배포 read-only smoke | 통과 | 배포 루트, `/api/state`, 사용자 기본값, `skack-symbol.png` GET 모두 200; 배포 브라우저 초기 렌더링·목록·로고·console/page error 확인 |

### 브라우저 QA 결과

기존 시나리오 중 다음 흐름은 Chrome 실행 복사본으로 통과했습니다: 추가 cycle 1~3, brand check, cycle 1~3, follow-up cycle 2, hero evidence, hero phrase, new cycle 1·3. 현재 UI에 맞춘 별도 흐름에서도 Markdown 질문·답변·댓글·답글, 이미지 붙여넣기·저장·상세 렌더링을 통과했습니다.

기존 일부 스크립트는 Milkdown 도입 뒤에도 `.ask-modal textarea`를 찾아 실패했습니다. 대상은 interaction-check, edge-check, filter-check, follow-up cycle 1·3, image-paste, new cycle 2입니다. 이는 현재 본문 입력창이 `.ProseMirror`인 UI와 테스트 셀렉터가 어긋난 문제이며, `.ProseMirror` 입력 후 Markdown 이벤트 디바운스가 끝난 뒤 제출하도록 테스트 헬퍼를 갱신해야 합니다.

### 개선점 및 우선순위

- P1 · QA 자동화: 작성·답변 시나리오의 `textarea` 셀렉터를 Milkdown `.ProseMirror` 기준으로 교체하고, 입력 후 200ms 이상 이벤트 반영을 기다리는 공통 helper를 도입합니다. 현재 기능 흐름 자체는 안정화 대기 후 통과했지만, 회귀 테스트가 새 입력 컴포넌트를 검증하지 못합니다.
- P1 · 개발 환경: `packageManager`의 pnpm 10.4.1 서명 검증 실패 원인을 CI와 로컬에서 정리해 `pnpm check`, `pnpm cf:check`, `pnpm build`를 공식 게이트로 다시 실행할 수 있게 합니다. 이번 실행에서는 직접 바이너리 결과로 보완했으므로 pnpm lifecycle 통과로 간주하지 않습니다.
- P2 · 번들 성능: Vite 빌드에서 큰 JavaScript 청크(약 1.35MB, 536KB)와 큰 폰트 자산이 생성됐습니다. Milkdown/Markdown 의존성 분할, 지연 로딩, 폰트 subset 또는 preload 전략을 검토합니다.
- P2 · 포맷·문서 위생: Prettier check에서 14개 파일이 경고됐고, staged README에 trailing whitespace 4건이 남았습니다. 기능 수정과 분리해 포맷 전용 변경으로 정리합니다.

이번 실행에서는 위 개선 항목을 보고서에만 반영했으며, 제품 동작·테스트·포맷 파일에 추가 수정은 하지 않았습니다.

## 이전 실행 기록: 검증 범위

익명 UID, 질문·답변·댓글·답글, 공감·답변 선택 권한, 필터·검색, 링크 복사, 데이터 가져오기·내보내기, 탭 동기화, 접근성 피드백, 워드마크와 색상 역할을 확인합니다.

| 구분 | 결과 | 확인 내용 |
|---|---|---|
| Workers 타입 검사 | 통과 | KV 상태·사용자 기록 API 타입 확인 |
| React 타입 검사 | 통과 | 화면·상태·이벤트 타입 확인 |
| 브라우저 자동 검증 | 통과 | 78개 시나리오로 질문·답변·권한·필터·데이터 흐름 확인 |
| Workers 정적 자산 빌드 | 통과 | Cloudflare 배포용 React 자산 생성 확인 |
| 데스크톱 화면 확인 | 통과 | 상단 탐색, 히어로 집계, 질문 목록, 상태 패널 가독성 확인 |

## 한국어 카피 전수 동기화

사용자에게 보이는 화면, CSS 생성 문구, 보조 화면 구성요소, 자동 검증 로그, QA·TODO·운영·참고 문서를 질문과 답변 중심 용어로 정리합니다. 상단과 본문 필터는 ‘전체’, ‘답변 기다리는 글’, ‘답변 달린 글’, ‘내 질문’, ‘내 답변’을 사용합니다. 모든 작성 행동은 ‘질문 올리기’ 또는 ‘답변 남기기’로 통일합니다.

상세 화면에서는 답변 수, 답변 수정·삭제, 예시 답변 작성자, 답변 선택, 확인 토스트, 접근 가능한 이름까지 같은 기준을 적용합니다. 이 기준으로 화면과 자동 검증의 선택자가 일치하도록 유지합니다.

## 데이터·배포 구성

Cloudflare Workers는 정적 React 자산과 `/api/*` 요청을 함께 처리합니다. `SKACK_OVERFLOW_KV`에는 서비스 전체 질문 상태와 익명 UID별 차단·새 답변 읽음 상태를 분리해 저장합니다. 로컬 브라우저에서는 동일한 정보를 `localStorage`로 유지하며, JSON 가져오기·내보내기와 탭 동기화도 검증 범위에 포함합니다.

## 이전 실행 결론

이전 실행 시점에는 익명 질문·답변 흐름과 자연스러운 한국어 카피가 같은 용어 체계를 사용한다고 결론 내렸습니다. 현재 실행 결과와 미해결 개선점은 문서 상단의 2026-08-14 섹션을 기준으로 봅니다.

## 친화적 UI 재설계 확인

‘막히면 SKack.’을 히어로의 중심 문구로 적용하고, 질문 카드·필터·상태 표시·오른쪽 패널을 부드러운 모서리와 밝은 살구·민트 색면으로 정리했습니다. 작성 흐름에는 ‘사소한 질문도 괜찮아요’, ‘한 줄만 남겨도 도움이 돼요’ 같은 부담을 낮추는 안내를 추가했습니다.

데스크톱과 390px 모바일 화면에서 히어로, 필터, 질문 카드, 사이드 패널을 확인했습니다. 두 화면 모두 가로 넘침 없이 표시되며, 모바일에서도 질문 작성 행동과 질문 상태가 먼저 보입니다.

## 히어로 순환 캐치프레이즈

히어로는 ‘막히면 SKack.’, ‘혼자 끙끙 말고 SKack.’, ‘아는 건 나누고, 모르는 건 SKack.’을 3.6초 간격으로 순환해 보여줍니다. 문구가 바뀔 때는 짧은 페이드와 수직 이동만 사용하며, 모션 감소 설정에서는 첫 문구를 고정합니다. 전용 브라우저 QA는 세 문구의 순환과 모션 감소 환경을 함께 확인합니다.

## SKack 브랜드 표기

사용자에게 보이는 서비스명, 히어로, 브라우저 제목, JSON 가져오기 안내, 자동 검증과 프로젝트 문서를 `SKack`으로 통일했습니다. Cloudflare에 이미 연결된 `SKACK_KV` 바인딩과 `SKACK_OVERFLOW_KV` 네임스페이스 식별자는 배포 연속성을 위해 그대로 유지합니다.
