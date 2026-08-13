export interface Env {
  ASSETS: Fetcher;
  SKACK_KV: KVNamespace;
}

type UserState = {
  blockedUids: string[];
  readAnswerCounts: Record<string, number>;
};

const jsonHeaders = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const MAX_IMAGES_PER_POST = 3;
const MAX_IMAGE_DATA_LENGTH = 680_000;
const MAX_STATE_BYTES = 24 * 1024 * 1024;

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: jsonHeaders });
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const validUid = (value: string) => /^[a-zA-Z0-9-]{3,120}$/.test(value);
const isStringArray = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === "string");
function validImages(value: unknown): boolean {
  return value === undefined || (Array.isArray(value) && value.length <= MAX_IMAGES_PER_POST && value.every((image) => isRecord(image) && typeof image.id === "string" && image.id.length <= 120 && typeof image.src === "string" && image.src.length <= MAX_IMAGE_DATA_LENGTH && /^data:image\/(?:webp|jpeg|png);base64,/i.test(image.src) && typeof image.width === "number" && Number.isInteger(image.width) && image.width > 0 && image.width <= 1600 && typeof image.height === "number" && Number.isInteger(image.height) && image.height > 0 && image.height <= 1600 && typeof image.alt === "string" && image.alt.length <= 200));
}

function validComment(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.uid === "string" && typeof value.body === "string" && typeof value.createdAt === "string" && (value.parentId === undefined || typeof value.parentId === "string") && validImages(value.images);
}

function validAnswer(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "string" && typeof value.uid === "string" && typeof value.body === "string" && typeof value.createdAt === "string" && typeof value.votes === "number" && isStringArray(value.voters) && Array.isArray(value.comments) && value.comments.every(validComment) && validImages(value.images);
}

function validQuestion(value: unknown): boolean {
  return isRecord(value) && typeof value.id === "number" && typeof value.ownerUid === "string" && typeof value.title === "string" && typeof value.body === "string" && isStringArray(value.tags) && typeof value.course === "string" && typeof value.mode === "string" && typeof value.createdAt === "string" && typeof value.views === "number" && (value.votes === undefined || typeof value.votes === "number") && (value.voters === undefined || isStringArray(value.voters)) && (value.acceptedAnswerId === undefined || typeof value.acceptedAnswerId === "string") && Array.isArray(value.answers) && value.answers.every(validAnswer) && validImages(value.images);
}

function parseUserState(value: unknown): UserState | null {
  if (!isRecord(value) || !Array.isArray(value.blockedUids) || !isRecord(value.readAnswerCounts)) return null;
  if (!value.blockedUids.every((item) => typeof item === "string")) return null;
  const readAnswerCounts = Object.entries(value.readAnswerCounts).reduce<Record<string, number>>((items, [key, count]) => {
    if (typeof count === "number" && Number.isFinite(count) && count >= 0) items[key] = count;
    return items;
  }, {});
  return { blockedUids: value.blockedUids, readAnswerCounts };
}

async function body(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/state") {
      if (request.method === "GET") return json({ questions: await env.SKACK_KV.get("state:questions", "json") });
      if (request.method === "PUT") {
        const payload = await body(request);
        if (!isRecord(payload) || !Array.isArray(payload.questions) || payload.questions.length > 1000 || !payload.questions.every(validQuestion)) return json({ error: "유효한 질문 배열이 필요합니다." }, 400);
        const serialized = JSON.stringify(payload.questions);
        if (new TextEncoder().encode(serialized).byteLength > MAX_STATE_BYTES) return json({ error: "이미지를 포함한 전체 기록이 너무 커요. 이미지 수나 크기를 줄여주세요." }, 413);
        await env.SKACK_KV.put("state:questions", serialized);
        return json({ ok: true });
      }
      return json({ error: "지원하지 않는 메서드입니다." }, 405);
    }

    const userMatch = url.pathname.match(/^\/api\/users\/([^/]+)$/);
    if (userMatch) {
      const uid = decodeURIComponent(userMatch[1]);
      if (!validUid(uid)) return json({ error: "유효하지 않은 익명 UID입니다." }, 400);
      const key = `user:${uid}`;
      if (request.method === "GET") return json((await env.SKACK_KV.get<UserState>(key, "json")) ?? { blockedUids: [], readAnswerCounts: {} });
      if (request.method === "PUT") {
        const userState = parseUserState(await body(request));
        if (!userState) return json({ error: "유효하지 않은 사용자 상태입니다." }, 400);
        await env.SKACK_KV.put(key, JSON.stringify(userState));
        return json({ ok: true });
      }
      return json({ error: "지원하지 않는 메서드입니다." }, 405);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
