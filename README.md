<div align="center">

<img src="./client/public/skack-symbol.png" width="240" alt="SKack 로고" />


### 막히면 SKACK!

혼자 끙끙 말고 **SKACK**  
아는 건 나누고, 모르는 건 **SKACK**

<p>
  <strong>SKALA 교육생을 위한 작고 귀여운 지식 놀이터</strong><br />
  질문하고,  답하고,  같이 성장해요 🌱
</p>

<a href="https://skack-overflow.cioud.workers.dev">바로 놀러가기 →</a>

</div>

<br />

## SKack은 뭐예요?

SKack은 Stack Overflow를 닮은 **SKALA 교육생 전용 질문·답변 커뮤니티**예요.

혼자 해결하기 어려운 문제를 올리면, 어딘가에 숨어 있던 고수님의 지식이 답변으로 나타납니다. 작은 질문 하나가 다음 사람의 큰 힌트가 될 수 있어요.

> 오늘의 막힘이 내일의 지식이 되도록.

## 지금 할 수 있는 일

- 질문을 올리고 답변을 받을 수 있어요.
- Markdown 에디터로 제목, 코드, 목록, 인용, 표를 예쁘게 작성할 수 있어요.
- 질문과 답변에 이미지를 붙여넣을 수 있어요. 업로드 전 브라우저에서 해상도를 줄여요.
- 좋은 질문과 답변에 투표하고 포인트를 쌓을 수 있어요.
- 태그와 검색으로 필요한 지식을 찾아볼 수 있어요.
- 댓글로 짧은 힌트와 따뜻한 피드백을 남길 수 있어요.

## 이런 분께 추천해요

```text
"분명 배웠는데 왜 안 되지...?"
"에러 메시지는 나를 싫어하나...?"
"이거 물어봐도 되나...?"
```

괜찮아요. 질문하는 순간 이미 잘하고 있는 거예요.  
일단 한 번 **SKACK** 해보세요!

## 우리들의 약속

질문은 부끄러운 게 아니고, 답변은 뽐내기만을 위한 게 아니에요.

```text
막히면 SKACK
혼자 끙끙말고 SKACK
아는건 나누고 모르는 건 SKACK
```

당신의 질문과 답변이 누군가의 오늘을 구해줄 거예요.  
같이 배우고, 같이 나누고, 같이 성장합시다 ✍️

--- 

## Tech Stack

| 영역 | 기술 |
| --- | --- |
| Frontend | React · TypeScript · Vite |
| Editor | Milkdown Crepe · Markdown · GFM |
| UI | Radix UI · Lucide · system UI typography |
| Backend | Cloudflare Workers |
| Storage | Cloudflare KV |
| Deploy | Wrangler |

## 로컬에서 시작하기

### 1. 설치

```bash
pnpm install
```

### 2. 프론트엔드 개발 서버

```bash
pnpm dev
```

### 3. Cloudflare Worker까지 함께 실행

```bash
pnpm cf:dev
```

### 4. 검사와 빌드

```bash
pnpm check
pnpm cf:check
pnpm build
```

## Cloudflare에 배포하기

처음 한 번만 로그인하고, 이후에는 아래 명령어 하나면 됩니다.

```bash
pnpm wrangler login
pnpm cf:deploy
```

`cf:deploy`는 프론트엔드를 빌드한 뒤 `skack-overflow` Worker와 연결된 `SKACK_KV`를 함께 배포합니다.

## 프로젝트 구조

```text
SKack-Overflow/
├─ client/              # React 화면과 스타일
│  ├─ public/           # 로고와 정적 파일
│  └─ src/
├─ worker/              # Cloudflare Worker API
├─ server/              # 로컬/서버 번들 진입점
├─ wrangler.jsonc       # Worker와 KV 설정
└─ package.json         # 실행·검사·배포 명령어
```

<div align="center">

### Made for SKALA learners

</div>
