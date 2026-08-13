# Cloudflare Workers + KV 배포

SKACK Overflow는 Cloudflare Workers가 정적 React 자산과 `/api/*` 요청을 함께 처리하도록 구성돼 있습니다. `SKACK_KV` 바인딩은 전용 `SKACK_OVERFLOW_KV` 네임스페이스를 가리킵니다.

| KV 키 | 저장 내용 |
|---|---|
| `state:questions` | 서비스 전체 질문·힌트·댓글·답글 상태 |
| `user:{익명 UID}` | 브라우저별 차단 목록과 힌트 읽음 상태 |

## 명령

```bash
pnpm cf:build
pnpm cf:check
pnpm cf:dev
pnpm cf:deploy
```

`cf:dev`는 기본적으로 로컬 KV를 사용합니다. 운영 KV에 직접 연결해 확인할 때만 Wrangler의 원격 바인딩 옵션을 사용하세요. 익명 UID는 인증 수단이 아니므로, 민감한 개인정보를 이 KV 구조에 저장하지 마세요.

## 공식 참고

- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/) — SPA 폴백과 `/api/*` Worker 우선 라우팅 구성
- [Cloudflare KV bindings](https://developers.cloudflare.com/kv/concepts/kv-bindings/) — Wrangler KV 바인딩과 로컬 개발 동작
