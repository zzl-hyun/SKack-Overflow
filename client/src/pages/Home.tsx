/* SKack Overflow: anonymous, browser-local question and answer exchange for SKALA learners. */
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Eye,
  FileDown,
  FileUp,
  Filter,
  Link2,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
  Send,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Mode = "강의 끝" | "과제 중" | "팀 작업";
type SortKey = "최신" | "답변" | "투표";
type FilterKey = "모든 질문" | "미해결" | "답변 있음" | "내 질문" | "내 답변";
type ImageAttachment = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
};
type Comment = {
  id: string;
  uid: string;
  body: string;
  createdAt: string;
  parentId?: string;
  images?: ImageAttachment[];
};
type Answer = {
  id: string;
  uid: string;
  body: string;
  createdAt: string;
  votes: number;
  voters: string[];
  comments: Comment[];
  images?: ImageAttachment[];
  sample?: boolean;
};
type Question = {
  id: number;
  ownerUid: string;
  title: string;
  body: string;
  tags: string[];
  course: string;
  mode: Mode;
  createdAt: string;
  views: number;
  votes?: number;
  voters?: string[];
  acceptedAnswerId?: string;
  answers: Answer[];
  images?: ImageAttachment[];
  sample?: boolean;
};
type PendingConfirmation = {
  message: string;
  confirmLabel: string;
  action: () => void;
};

const sampleQuestions: Question[] = [
  {
    id: 120,
    ownerUid: "demo-ax8",
    title: "API 응답은 오는데 화면이 그대로예요. 어디부터 다시 볼까요?",
    body: "네트워크 탭에서는 200이 보이고, 컨트롤러까지 들어오는 로그도 확인했어요. 화면 state가 안 바뀌는 것 같은데 확인 순서를 잡고 싶어요.",
    tags: ["react", "api", "state"],
    course: "Java, SpringBoot, Rest API 구현",
    mode: "강의 끝",
    createdAt: "방금",
    views: 14,
    answers: [
      {
        id: "a120-1",
        uid: "demo-b91",
        body: "응답 자체보다 setState가 실제로 호출되는지부터 보세요. 1) 응답 객체 구조를 console로 찍고 2) state setter 바로 앞과 뒤를 찍은 뒤 3) 렌더되는 JSX가 같은 state를 보고 있는지 확인하면 범위가 빨리 좁혀집니다.",
        createdAt: "2분 전",
        votes: 3,
        voters: [],
        comments: [],
        sample: true,
      },
    ],
    sample: true,
  },
  {
    id: 119,
    ownerUid: "demo-ax7",
    title:
      "로그인까지 하려다 시간이 다 갈 것 같아요. 기능 범위를 어디서 자를까요?",
    body: "미니 프로젝트인데 회원 기능까지 넣을지, 핵심 목록 기능만 보여줄지 고민입니다. 구현 시간은 반나절 정도 남았어요.",
    tags: ["scope", "mvp", "project"],
    course: "웹 서비스 개발 mini-Project",
    mode: "과제 중",
    createdAt: "4분 전",
    views: 22,
    answers: [
      {
        id: "a119-1",
        uid: "demo-b72",
        body: "데모에서 사용자가 한 번만 경험해도 되는 흐름인지 보세요. 회원 상태가 핵심이 아니라면 임시 사용자 하나로 고정하고, 목록 → 상세 → 생성처럼 서비스 가치를 보여주는 흐름을 먼저 완성하는 쪽이 안전합니다.",
        createdAt: "3분 전",
        votes: 5,
        voters: [],
        comments: [],
        sample: true,
      },
    ],
    sample: true,
  },
  {
    id: 118,
    ownerUid: "demo-ax6",
    title: "팀에서 폴더 구조를 지금 정할지, 기능부터 갈지 의견이 갈렸어요.",
    body: "각자 컴포넌트 기준과 기능 기준으로 나누자는 의견이 있어요. 아직 첫 화면 하나만 있습니다.",
    tags: ["collaboration", "architecture", "react"],
    course: "팀프로젝트",
    mode: "팀 작업",
    createdAt: "9분 전",
    views: 19,
    answers: [],
    sample: true,
  },
  {
    id: 117,
    ownerUid: "demo-ax5",
    title: "JPA 연관관계는 이해한 것 같은데 코드에서 바로 막혀요.",
    body: "ERD에서는 이해가 되는데 엔티티를 만들기 시작하면 어느 쪽에 FK를 둬야 하는지 혼란스럽습니다.",
    tags: ["jpa", "spring", "database"],
    course: "Java, SpringBoot, Rest API 구현",
    mode: "강의 끝",
    createdAt: "15분 전",
    views: 31,
    answers: [
      {
        id: "a117-1",
        uid: "demo-b54",
        body: "객체에서 누가 참조를 꼭 해야 하는지부터 적고 시작해보세요. 자주 조회하는 방향 하나만 먼저 단방향으로 만들고, 실제 조회가 필요해질 때 반대쪽을 추가하는 편이 덜 꼬입니다.",
        createdAt: "11분 전",
        votes: 7,
        voters: [],
        comments: [],
        sample: true,
      },
    ],
    sample: true,
  },
  {
    id: 116,
    ownerUid: "demo-ax4",
    title: "모바일에서만 레이아웃이 깨지는데 어디부터 확인해야 할까요?",
    body: "데스크톱은 괜찮은데 작은 화면에서 카드가 가로로 넘칩니다. width를 줄여봤는데 더 어색해졌어요.",
    tags: ["css", "responsive", "layout"],
    course: "웹 서비스 개발 mini-Project",
    mode: "과제 중",
    createdAt: "23분 전",
    views: 17,
    answers: [],
    sample: true,
  },
  {
    id: 115,
    ownerUid: "demo-ax3",
    title: "RAG 검색 결과는 있는데 답변이 문서 밖으로 나가요.",
    body: "top-k와 chunk 크기는 바꿔봤습니다. 검색된 문서에는 답이 있는데 모델이 다른 말을 섞어서 해요.",
    tags: ["rag", "llm", "prompt"],
    course: "RAG Pipeline 설계 및 구축",
    mode: "강의 끝",
    createdAt: "31분 전",
    views: 38,
    answers: [
      {
        id: "a115-1",
        uid: "demo-b33",
        body: "검색 품질과 생성 제약을 분리해서 보세요. 먼저 실제로 주입된 문서를 로그로 확인하고, 그 다음 프롬프트에 ‘문서에 없으면 모른다고 답하기’와 인용 위치를 명시해보세요.",
        createdAt: "26분 전",
        votes: 9,
        voters: [],
        comments: [],
        sample: true,
      },
    ],
    sample: true,
  },
  {
    id: 114,
    ownerUid: "demo-ax2",
    title: "JOIN 문제를 보면 어떤 테이블부터 봐야 할지 모르겠어요.",
    body: "JOIN 문법은 알겠는데 문제에서 필요한 테이블과 기준 컬럼을 정하는 속도가 느립니다.",
    tags: ["sql", "join", "database"],
    course: "SQL 기초",
    mode: "강의 끝",
    createdAt: "42분 전",
    views: 28,
    answers: [],
    sample: true,
  },
  {
    id: 113,
    ownerUid: "demo-ax1",
    title: "배포 화면에서만 환경변수 값이 비어 있어요.",
    body: "로컬에서는 보이는데 배포 뒤에는 undefined가 나옵니다. 환경변수도 플랫폼에 넣었습니다.",
    tags: ["deploy", "env", "vite"],
    course: "웹 서비스 개발 mini-Project",
    mode: "과제 중",
    createdAt: "1시간 전",
    views: 24,
    answers: [
      {
        id: "a113-1",
        uid: "demo-b12",
        body: "변수 이름이 빌드 시점에 노출되는 규칙부터 확인해보세요. Vite라면 접두사 여부를 보고, 값을 넣은 뒤에는 새 빌드가 실행됐는지도 함께 확인하는 순서가 좋아요.",
        createdAt: "55분 전",
        votes: 4,
        voters: [],
        comments: [],
        sample: true,
      },
    ],
    sample: true,
  },
  {
    id: 112,
    ownerUid: "demo-z91",
    title: "팀 데모에서 보여줄 순서를 기능 목록 순서로 할지 고민이에요.",
    body: "기능은 많은데 시간은 짧아요. 무엇을 먼저 보여야 서비스가 이해될지 정하기 어렵습니다.",
    tags: ["presentation", "project", "ux"],
    course: "팀프로젝트",
    mode: "팀 작업",
    createdAt: "1시간 전",
    views: 12,
    answers: [],
    sample: true,
  },
  {
    id: 111,
    ownerUid: "demo-z82",
    title: "React 컴포넌트를 어디까지 쪼개야 하는지 감이 안 와요.",
    body: "지금은 페이지 한 파일에 다 있는데, 너무 이른 분리도 부담스럽습니다.",
    tags: ["react", "component", "refactor"],
    course: "웹 서비스 개발 mini-Project",
    mode: "과제 중",
    createdAt: "2시간 전",
    views: 18,
    answers: [],
    sample: true,
  },
  {
    id: 110,
    ownerUid: "demo-z73",
    title: "Git 브랜치 이름과 PR 순서를 팀에서 합의하지 못했어요.",
    body: "각자 쓰던 방식이 달라서 작은 작업도 오래 걸립니다. 최소 규칙부터 맞추고 싶어요.",
    tags: ["git", "collaboration", "pr"],
    course: "팀프로젝트",
    mode: "팀 작업",
    createdAt: "2시간 전",
    views: 16,
    answers: [],
    sample: true,
  },
  {
    id: 109,
    ownerUid: "demo-z64",
    title: "엔드포인트 설계에서 동사와 리소스 중 어디를 우선해야 하나요?",
    body: "REST 규칙을 읽었지만 실제 기능을 URL로 옮기면 기준이 흔들립니다.",
    tags: ["rest", "api", "backend"],
    course: "Java, SpringBoot, Rest API 구현",
    mode: "강의 끝",
    createdAt: "3시간 전",
    views: 21,
    answers: [],
    sample: true,
  },
];
const anon = (uid: string) => `익명 ${uid.slice(-4).toUpperCase()}`;
const newUid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? `sk-${crypto.randomUUID().slice(0, 8)}`
    : `sk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const LIMITS = { title: 90, body: 1500, answer: 1500, comment: 500 };
const IMAGE_LIMITS = {
  maxCount: 3,
  maxSide: 1600,
  maxBytes: 480_000,
  maxDataUrlLength: 680_000,
};
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isImageData = (value: unknown): value is ImageAttachment =>
  isRecord(value) &&
  typeof value.id === "string" &&
  value.id.length <= 120 &&
  typeof value.src === "string" &&
  value.src.length <= IMAGE_LIMITS.maxDataUrlLength &&
  /^data:image\/(?:webp|jpeg|png);base64,/i.test(value.src) &&
  typeof value.width === "number" &&
  Number.isInteger(value.width) &&
  value.width > 0 &&
  value.width <= IMAGE_LIMITS.maxSide &&
  typeof value.height === "number" &&
  Number.isInteger(value.height) &&
  value.height > 0 &&
  value.height <= IMAGE_LIMITS.maxSide &&
  typeof value.alt === "string" &&
  value.alt.length <= 200;
const isImageArray = (value: unknown): value is ImageAttachment[] =>
  value === undefined ||
  (Array.isArray(value) &&
    value.length <= IMAGE_LIMITS.maxCount &&
    value.every(isImageData));
const isCommentData = (value: unknown): value is Comment =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.uid === "string" &&
  typeof value.body === "string" &&
  typeof value.createdAt === "string" &&
  (value.parentId === undefined || typeof value.parentId === "string") &&
  isImageArray(value.images);
const isAnswerData = (value: unknown): value is Answer =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.uid === "string" &&
  typeof value.body === "string" &&
  typeof value.createdAt === "string" &&
  typeof value.votes === "number" &&
  Array.isArray(value.voters) &&
  value.voters.every(item => typeof item === "string") &&
  Array.isArray(value.comments) &&
  value.comments.every(isCommentData) &&
  isImageArray(value.images);
const isQuestionData = (value: unknown): value is Question =>
  isRecord(value) &&
  typeof value.id === "number" &&
  typeof value.ownerUid === "string" &&
  typeof value.title === "string" &&
  typeof value.body === "string" &&
  Array.isArray(value.tags) &&
  value.tags.every(item => typeof item === "string") &&
  typeof value.course === "string" &&
  ["강의 끝", "과제 중", "팀 작업"].includes(String(value.mode)) &&
  typeof value.createdAt === "string" &&
  typeof value.views === "number" &&
  (value.votes === undefined || typeof value.votes === "number") &&
  (value.voters === undefined ||
    (Array.isArray(value.voters) &&
      value.voters.every(item => typeof item === "string"))) &&
  (value.acceptedAnswerId === undefined ||
    typeof value.acceptedAnswerId === "string") &&
  Array.isArray(value.answers) &&
  value.answers.every(isAnswerData) &&
  isImageArray(value.images);
type HeroCatchphrase = { lead: string; secondLine?: string };
const heroCatchphrases: readonly HeroCatchphrase[] = [
  { lead: "막히면" },
  { lead: "혼자 끙끙 말고" },
  { lead: "아는건 나누고", secondLine: "모르는 건" },
];

const newImageId = () =>
  `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
) {
  return new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, type, quality)
  );
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("이미지 변환 결과가 비어 있어요."));
    reader.onerror = () =>
      reject(reader.error || new Error("이미지를 읽을 수 없어요."));
    reader.readAsDataURL(blob);
  });
}

async function downscaleImage(file: File): Promise<ImageAttachment> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("이미지를 열 수 없어요."));
      element.src = objectUrl;
    });
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    if (!sourceWidth || !sourceHeight)
      throw new Error("이미지 크기를 확인할 수 없어요.");

    let width = sourceWidth;
    let height = sourceHeight;
    const initialScale = Math.min(
      1,
      IMAGE_LIMITS.maxSide / Math.max(width, height)
    );
    width *= initialScale;
    height *= initialScale;
    const canvas = document.createElement("canvas");
    let output: Blob | null = null;
    let quality = 0.82;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("이미지 캔버스를 만들 수 없어요.");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const webp = await canvasToBlob(canvas, "image/webp", quality);
      output =
        webp?.type === "image/webp"
          ? webp
          : await canvasToBlob(canvas, "image/jpeg", quality);
      if (!output || output.size <= IMAGE_LIMITS.maxBytes || attempt === 7)
        break;
      width *= 0.78;
      height *= 0.78;
      quality = Math.max(0.55, quality - 0.04);
    }

    if (!output) throw new Error("이미지를 압축할 수 없어요.");
    const src = await blobToDataUrl(output);
    if (src.length > IMAGE_LIMITS.maxDataUrlLength)
      throw new Error("이미지 크기가 아직 커요.");
    return {
      id: newImageId(),
      src,
      width: canvas.width,
      height: canvas.height,
      alt: (file.name || "붙여넣은 이미지").slice(0, 200),
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function ImageAttachments({
  images,
  editable = false,
  onRemove,
}: {
  images?: ImageAttachment[];
  editable?: boolean;
  onRemove?: (id: string) => void;
}) {
  if (!images?.length) return null;
  return (
    <div className="image-attachments" aria-label="첨부 이미지">
      {images.map(image => (
        <figure key={image.id}>
          <img src={image.src} alt={image.alt} loading="lazy" />
          {editable && onRemove && (
            <figcaption>
              <span>
                {image.width} × {image.height}
              </span>
              <button type="button" onClick={() => onRemove(image.id)}>
                <X size={12} /> 제거
              </button>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

function PasteImageHint({ processing = false }: { processing?: boolean }) {
  return (
    <p className="image-paste-hint">
      {processing
        ? "이미지를 줄이는 중… 잠시만 기다려주세요."
        : "이미지를 이 입력창에 붙여넣으면 자동으로 줄여서 첨부해요. (최대 3장)"}
    </p>
  );
}

export default function Home() {
  const [uid, setUid] = useState("");
  const [ready, setReady] = useState(false);
  const [cloudSyncReady, setCloudSyncReady] = useState(false);
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [filter, setFilter] = useState<FilterKey>("모든 질문");
  const [sort, setSort] = useState<SortKey>("최신");
  const [search, setSearch] = useState("");
  const [questionModal, setQuestionModal] = useState(false);
  const [detail, setDetail] = useState<Question | null>(null);
  const [notice, setNotice] = useState("");
  const [pendingConfirmation, setPendingConfirmation] =
    useState<PendingConfirmation | null>(null);
  const [heroPhraseIndex, setHeroPhraseIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [mode, setMode] = useState<Mode>("강의 끝");
  const [answerText, setAnswerText] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentTarget, setCommentTarget] = useState<{
    answerId: string;
    comment?: Comment;
  } | null>(null);
  const [questionImages, setQuestionImages] = useState<ImageAttachment[]>([]);
  const [answerImages, setAnswerImages] = useState<ImageAttachment[]>([]);
  const [commentImages, setCommentImages] = useState<ImageAttachment[]>([]);
  const [imageProcessing, setImageProcessing] = useState(0);
  const [blockedUids, setBlockedUids] = useState<string[]>([]);
  const [readAnswerCounts, setReadAnswerCounts] = useState<
    Record<string, number>
  >({});
  const [questionEdit, setQuestionEdit] = useState<{
    title: string;
    body: string;
    images: ImageAttachment[];
  } | null>(null);
  const [answerEdit, setAnswerEdit] = useState<{
    answerId: string;
    body: string;
    images: ImageAttachment[];
  } | null>(null);
  const [commentEdit, setCommentEdit] = useState<{
    answerId: string;
    commentId: string;
    body: string;
    images: ImageAttachment[];
  } | null>(null);
  useEffect(() => {
    const storedUid =
      localStorage.getItem("skack-overflow-anon-uid") || newUid();
    localStorage.setItem("skack-overflow-anon-uid", storedUid);
    setUid(storedUid);
    try {
      const saved = JSON.parse(
        localStorage.getItem("skack-overflow-questions") || "null"
      );
      if (Array.isArray(saved)) {
        const ids = new Set(saved.map((item: Question) => item.id));
        setQuestions([
          ...saved,
          ...sampleQuestions.filter(item => !ids.has(item.id)),
        ]);
      }
      const blocked = JSON.parse(
        localStorage.getItem("skack-overflow-blocked-uids") || "[]"
      );
      if (Array.isArray(blocked))
        setBlockedUids(
          blocked.filter((item): item is string => typeof item === "string")
        );
      const reads = JSON.parse(
        localStorage.getItem("skack-overflow-read-answers") || "{}"
      );
      if (reads && typeof reads === "object" && !Array.isArray(reads)) {
        const nextReads = Object.entries(reads).reduce<Record<string, number>>(
          (items, [key, value]) => {
            if (typeof value === "number") items[key] = value;
            return items;
          },
          {}
        );
        setReadAnswerCounts(nextReads);
      }
    } catch {
      /* preserve initial samples */
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      localStorage.setItem(
        "skack-overflow-questions",
        JSON.stringify(questions)
      );
  }, [questions, ready]);
  useEffect(() => {
    if (ready)
      localStorage.setItem(
        "skack-overflow-blocked-uids",
        JSON.stringify(blockedUids)
      );
  }, [blockedUids, ready]);
  useEffect(() => {
    if (ready)
      localStorage.setItem(
        "skack-overflow-read-answers",
        JSON.stringify(readAnswerCounts)
      );
  }, [readAnswerCounts, ready]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setHeroPhraseIndex(index => (index + 1) % heroCatchphrases.length),
      3600
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);
  useEffect(() => {
    if (!ready || !uid || import.meta.env.DEV) return;
    let active = true;
    void Promise.all([
      fetch("/api/state"),
      fetch(`/api/users/${encodeURIComponent(uid)}`),
    ])
      .then(async ([stateResponse, userResponse]) => {
        if (!stateResponse.ok || !userResponse.ok || !active) return;
        const state = (await stateResponse.json()) as { questions?: unknown };
        const user = (await userResponse.json()) as {
          blockedUids?: unknown;
          readAnswerCounts?: unknown;
        };
        if (
          Array.isArray(state.questions) &&
          state.questions.every(isQuestionData)
        )
          setQuestions(state.questions);
        if (Array.isArray(user.blockedUids))
          setBlockedUids(
            user.blockedUids.filter(
              (item): item is string => typeof item === "string"
            )
          );
        if (isRecord(user.readAnswerCounts))
          setReadAnswerCounts(
            Object.entries(user.readAnswerCounts).reduce<
              Record<string, number>
            >((items, [key, value]) => {
              if (typeof value === "number") items[key] = value;
              return items;
            }, {})
          );
        setCloudSyncReady(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ready, uid]);
  useEffect(() => {
    if (!cloudSyncReady) return;
    void fetch("/api/state", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questions }),
    }).catch(() => undefined);
  }, [cloudSyncReady, questions]);
  useEffect(() => {
    if (!cloudSyncReady || !uid) return;
    void fetch(`/api/users/${encodeURIComponent(uid)}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ blockedUids, readAnswerCounts }),
    }).catch(() => undefined);
  }, [blockedUids, cloudSyncReady, readAnswerCounts, uid]);
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      try {
        if (
          event.key === "skack-overflow-anon-uid" &&
          typeof event.newValue === "string" &&
          event.newValue.startsWith("sk-")
        )
          setUid(event.newValue);
        if (event.key === "skack-overflow-questions" && event.newValue) {
          const next = JSON.parse(event.newValue);
          if (Array.isArray(next)) setQuestions(next);
        }
        if (event.key === "skack-overflow-blocked-uids") {
          const next = JSON.parse(event.newValue || "[]");
          setBlockedUids(
            Array.isArray(next)
              ? next.filter((item): item is string => typeof item === "string")
              : []
          );
        }
        if (event.key === "skack-overflow-read-answers") {
          const next = JSON.parse(event.newValue || "{}");
          if (isRecord(next))
            setReadAnswerCounts(
              Object.entries(next).reduce<Record<string, number>>(
                (items, [key, value]) => {
                  if (typeof value === "number") items[key] = value;
                  return items;
                },
                {}
              )
            );
        }
      } catch {
        /* ignore invalid external storage */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (pendingConfirmation) {
        setPendingConfirmation(null);
        return tell("취소했어요.");
      }
      if (commentTarget) return setCommentTarget(null);
      if (questionModal) return setQuestionModal(false);
      if (detail) closeDetail();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commentTarget, detail, pendingConfirmation, questionModal]);
  useEffect(() => {
    if (!commentTarget) return;
    const frame = window.requestAnimationFrame(() =>
      commentInputRef.current?.focus()
    );
    return () => window.cancelAnimationFrame(frame);
  }, [commentTarget]);
  const tell = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };
  async function pasteImages(
    event: ClipboardEvent<HTMLTextAreaElement>,
    currentImages: ImageAttachment[],
    onImagesAdded: (images: ImageAttachment[]) => void
  ) {
    const files = Array.from(event.clipboardData.items)
      .filter(item => item.kind === "file" && item.type.startsWith("image/"))
      .map(item => item.getAsFile())
      .filter((file): file is File => Boolean(file));
    if (!files.length) return;
    event.preventDefault();
    const remaining = IMAGE_LIMITS.maxCount - currentImages.length;
    if (remaining <= 0)
      return tell(
        `이미지는 한 글에 최대 ${IMAGE_LIMITS.maxCount}장까지 첨부할 수 있어요.`
      );
    setImageProcessing(count => count + 1);
    try {
      const converted: ImageAttachment[] = [];
      for (const file of files.slice(0, remaining)) {
        try {
          converted.push(await downscaleImage(file));
        } catch {
          /* skip an unreadable clipboard item */
        }
      }
      if (!converted.length)
        return tell(
          "이미지를 줄이지 못했어요. 다른 이미지로 다시 붙여넣어 주세요."
        );
      onImagesAdded(converted);
      tell(`${converted.length}장의 이미지를 줄여서 첨부했어요.`);
    } finally {
      setImageProcessing(count => Math.max(0, count - 1));
    }
  }
  const requestConfirmation = (
    message: string,
    confirmLabel: string,
    action: () => void
  ) => setPendingConfirmation({ message, confirmLabel, action });
  const resolveConfirmation = (confirmed: boolean) => {
    const pending = pendingConfirmation;
    setPendingConfirmation(null);
    if (confirmed && pending) pending.action();
    else if (!confirmed) tell("취소했어요.");
  };
  const update = (next: Question) => {
    setQuestions(items =>
      items.map(item => (item.id === next.id ? next : item))
    );
    setDetail(next);
  };
  const clearDetailState = () => {
    setDetail(null);
    setQuestionEdit(null);
    setAnswerEdit(null);
    setCommentEdit(null);
    setCommentTarget(null);
  };
  const closeDetail = () => {
    clearDetailState();
    if (window.location.hash.startsWith("#q-"))
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
  };
  function markAnswersRead(question: Question) {
    if (question.ownerUid !== uid) return;
    setReadAnswerCounts(items => ({
      ...items,
      [String(question.id)]: question.answers.filter(
        answer => answer.uid !== uid
      ).length,
    }));
  }
  function openQuestion(question: Question, incrementView = true) {
    const next = incrementView
      ? { ...question, views: question.views + 1 }
      : question;
    if (incrementView)
      setQuestions(items =>
        items.map(item => (item.id === question.id ? next : item))
      );
    markAnswersRead(next);
    setDetail(next);
    if (window.location.hash !== `#q-${question.id}`)
      window.history.pushState(null, "", `#q-${question.id}`);
  }
  function openQuestionFromHash() {
    const match = window.location.hash.match(/^#q-(\d+)$/);
    if (!match) return clearDetailState();
    const id = Number(match[1]);
    setQuestions(items => {
      const question = items.find(item => item.id === id);
      if (!question) return items;
      const next = { ...question, views: question.views + 1 };
      markAnswersRead(next);
      setDetail(next);
      return items.map(item => (item.id === id ? next : item));
    });
  }
  useEffect(() => {
    if (!ready) return;
    openQuestionFromHash();
    window.addEventListener("popstate", openQuestionFromHash);
    return () => window.removeEventListener("popstate", openQuestionFromHash);
  }, [ready]);
  const answeredCount = (question: Question) =>
    question.answers.filter(answer => !blockedUids.includes(answer.uid)).length;
  const isSolved = (question: Question) =>
    Boolean(question.acceptedAnswerId) &&
    question.answers.some(
      answer =>
        answer.id === question.acceptedAnswerId &&
        !blockedUids.includes(answer.uid)
    );
  const listed = useMemo(() => {
    const q = search.toLowerCase().trim();
    const filtered = questions.filter(item => {
      const matchesSearch =
        !q ||
        [item.title, item.body, item.course, ...item.tags]
          .join(" ")
          .toLowerCase()
          .includes(q);
      const visibleAnswers = answeredCount(item);
      const matchesFilter =
        filter === "모든 질문" ||
        (filter === "미해결" && !isSolved(item) && visibleAnswers === 0) ||
        (filter === "답변 있음" && visibleAnswers > 0) ||
        (filter === "내 질문" && item.ownerUid === uid) ||
        (filter === "내 답변" &&
          item.answers.some(answer => answer.uid === uid));
      return (
        !blockedUids.includes(item.ownerUid) && matchesSearch && matchesFilter
      );
    });
    return [...filtered].sort((a, b) =>
      sort === "답변"
        ? answeredCount(b) - answeredCount(a) || b.id - a.id
        : sort === "투표"
          ? Math.max(
              ...b.answers
                .filter(answer => !blockedUids.includes(answer.uid))
                .map(a => a.votes),
              0
            ) -
              Math.max(
                ...a.answers
                  .filter(answer => !blockedUids.includes(answer.uid))
                  .map(a => a.votes),
                0
              ) || b.id - a.id
          : b.id - a.id
    );
  }, [questions, filter, sort, search, uid, blockedUids]);
  const stats = {
    unanswered: questions.filter(q => !isSolved(q) && answeredCount(q) === 0)
      .length,
    solved: questions.filter(isSolved).length,
    answers: questions.reduce((sum, q) => sum + answeredCount(q), 0),
  };
  const heroEvidence = [...questions]
    .filter(
      question =>
        !blockedUids.includes(question.ownerUid) && answeredCount(question) > 0
    )
    .sort((a, b) => b.id - a.id)
    .slice(0, 2);
  const myActivity = questions
    .filter(q => q.ownerUid === uid || q.answers.some(a => a.uid === uid))
    .slice(0, 5);
  const incomingActivity = questions.filter(
    q =>
      q.ownerUid === uid &&
      q.answers.filter(a => a.uid !== uid).length >
        (readAnswerCounts[String(q.id)] || 0)
  ).length;
  function submitQuestion() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!title.trim() || !body.trim()) return tell("제목과 내용을 적어주세요.");
    if (title.trim().length > LIMITS.title || body.trim().length > LIMITS.body)
      return tell("질문 길이를 확인해주세요.");
    const tags = tagsText
      .split(/[\s,]+/)
      .map(tag => tag.replace(/[^\w가-힣-]/g, "").toLowerCase())
      .filter(Boolean)
      .slice(0, 5);
    const question: Question = {
      id: Date.now(),
      ownerUid: uid,
      title: title.trim(),
      body: body.trim(),
      tags: tags.length ? tags : ["skala"],
      course:
        mode === "팀 작업"
          ? "팀프로젝트"
          : mode === "과제 중"
            ? "웹 서비스 개발 mini-Project"
            : "Java, SpringBoot, Rest API 구현",
      mode,
      createdAt: "방금",
      views: 0,
      votes: 0,
      voters: [],
      answers: [],
      ...(questionImages.length ? { images: questionImages } : {}),
    };
    setQuestions(items => [question, ...items]);
    setQuestionModal(false);
    setTitle("");
    setBody("");
    setQuestionImages([]);
    setTagsText("");
    setFilter("내 질문");
    tell("질문을 올렸어요. 답변이 달리면 여기에서 확인할 수 있어요.");
  }
  function submitAnswer() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!detail || !answerText.trim()) return tell("답변 내용을 적어주세요.");
    if (answerText.trim().length > LIMITS.answer)
      return tell("답변 길이를 확인해주세요.");
    const answer: Answer = {
      id: `answer-${Date.now()}-${uid}`,
      uid,
      body: answerText.trim(),
      createdAt: "방금",
      votes: 0,
      voters: [],
      comments: [],
      ...(answerImages.length ? { images: answerImages } : {}),
    };
    update({ ...detail, answers: [...detail.answers, answer] });
    setAnswerText("");
    setAnswerImages([]);
    tell("답변을 남겼어요.");
  }
  function toggleVote(answer: Answer) {
    if (!detail) return;
    if (answer.uid === uid) return tell("내 답변에는 공감을 남길 수 없어요.");
    const voted = answer.voters.includes(uid);
    const nextAnswer = {
      ...answer,
      voters: voted
        ? answer.voters.filter(id => id !== uid)
        : [...answer.voters, uid],
      votes: answer.votes + (voted ? -1 : 1),
    };
    update({
      ...detail,
      answers: detail.answers.map(item =>
        item.id === answer.id ? nextAnswer : item
      ),
    });
    tell(voted ? "공감을 취소했어요." : "도움이 됐어요.");
  }
  function toggleQuestionVote() {
    if (!detail) return;
    if (detail.ownerUid === uid)
      return tell("내 질문에는 공감을 남길 수 없어요.");
    const voters = detail.voters || [];
    const voted = voters.includes(uid);
    const next = {
      ...detail,
      voters: voted ? voters.filter(id => id !== uid) : [...voters, uid],
      votes: (detail.votes || 0) + (voted ? -1 : 1),
    };
    update(next);
    tell(voted ? "공감을 취소했어요." : "도움이 됐어요.");
  }
  function accept(answer: Answer) {
    if (!detail || detail.ownerUid !== uid)
      return tell("질문 작성자만 해결된 답변을 고를 수 있어요.");
    update({
      ...detail,
      acceptedAnswerId:
        detail.acceptedAnswerId === answer.id ? undefined : answer.id,
    });
    tell(
      detail.acceptedAnswerId === answer.id
        ? "선택한 답변을 해제했어요."
        : "이 답변으로 해결됐어요."
    );
  }
  function addComment() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!detail || !commentTarget || !commentText.trim())
      return tell("댓글 내용을 적어주세요.");
    if (commentText.trim().length > LIMITS.comment)
      return tell("댓글 길이를 확인해주세요.");
    const comment: Comment = {
      id: `comment-${Date.now()}-${uid}`,
      uid,
      body: commentText.trim(),
      createdAt: "방금",
      ...(commentTarget.comment ? { parentId: commentTarget.comment.id } : {}),
      ...(commentImages.length ? { images: commentImages } : {}),
    };
    const answers = detail.answers.map(answer =>
      answer.id === commentTarget.answerId
        ? { ...answer, comments: [...answer.comments, comment] }
        : answer
    );
    update({ ...detail, answers });
    setCommentText("");
    setCommentImages([]);
    setCommentTarget(null);
    tell(comment.parentId ? "답글을 남겼어요." : "댓글을 남겼어요.");
  }
  function saveQuestionEdit() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!detail || !questionEdit?.title.trim() || !questionEdit.body.trim())
      return tell("제목과 내용을 적어주세요.");
    if (
      questionEdit.title.trim().length > LIMITS.title ||
      questionEdit.body.trim().length > LIMITS.body
    )
      return tell("질문 길이를 확인해주세요.");
    update({
      ...detail,
      title: questionEdit.title.trim(),
      body: questionEdit.body.trim(),
      ...(questionEdit.images.length
        ? { images: questionEdit.images }
        : { images: undefined }),
    });
    setQuestionEdit(null);
    tell("질문을 수정했어요.");
  }
  function saveAnswerEdit() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!detail || !answerEdit?.body.trim())
      return tell("답변 내용을 적어주세요.");
    if (answerEdit.body.trim().length > LIMITS.answer)
      return tell("답변 길이를 확인해주세요.");
    update({
      ...detail,
      answers: detail.answers.map(answer =>
        answer.id === answerEdit.answerId
          ? {
              ...answer,
              body: answerEdit.body.trim(),
              ...(answerEdit.images.length
                ? { images: answerEdit.images }
                : { images: undefined }),
            }
          : answer
      ),
    });
    setAnswerEdit(null);
    tell("답변을 수정했어요.");
  }
  function saveCommentEdit() {
    if (imageProcessing > 0)
      return tell("이미지를 줄이는 중이에요. 잠시만 기다려주세요.");
    if (!detail || !commentEdit?.body.trim())
      return tell("댓글 내용을 적어주세요.");
    if (commentEdit.body.trim().length > LIMITS.comment)
      return tell("댓글 길이를 확인해주세요.");
    update({
      ...detail,
      answers: detail.answers.map(answer =>
        answer.id === commentEdit.answerId
          ? {
              ...answer,
              comments: answer.comments.map(comment =>
                comment.id === commentEdit.commentId
                  ? {
                      ...comment,
                      body: commentEdit.body.trim(),
                      ...(commentEdit.images.length
                        ? { images: commentEdit.images }
                        : { images: undefined }),
                    }
                  : comment
              ),
            }
          : answer
      ),
    });
    setCommentEdit(null);
    tell("댓글을 수정했어요.");
  }
  function deleteQuestion() {
    if (!detail) return;
    const questionId = detail.id;
    requestConfirmation(
      "이 질문과 연결된 답변을 모두 삭제할까요?",
      "삭제",
      () => {
        setQuestions(items =>
          items.filter(question => question.id !== questionId)
        );
        closeDetail();
        tell("질문을 삭제했어요.");
      }
    );
  }
  function deleteAnswer(answerId: string) {
    if (!detail) return;
    const question = detail;
    requestConfirmation("이 답변을 삭제할까요?", "삭제", () => {
      update({
        ...question,
        answers: question.answers.filter(answer => answer.id !== answerId),
        acceptedAnswerId:
          question.acceptedAnswerId === answerId
            ? undefined
            : question.acceptedAnswerId,
      });
      tell("답변을 삭제했어요.");
    });
  }
  function deleteComment(answerId: string, commentId: string) {
    if (!detail) return;
    const question = detail;
    requestConfirmation("이 댓글과 답글을 삭제할까요?", "삭제", () => {
      update({
        ...question,
        answers: question.answers.map(answer =>
          answer.id === answerId
            ? {
                ...answer,
                comments: answer.comments.filter(
                  comment =>
                    comment.id !== commentId && comment.parentId !== commentId
                ),
              }
            : answer
        ),
      });
      tell("댓글을 삭제했어요.");
    });
  }
  function report(target: string) {
    try {
      const previous = JSON.parse(
        localStorage.getItem("skack-overflow-reports") || "[]"
      );
      localStorage.setItem(
        "skack-overflow-reports",
        JSON.stringify([
          ...(Array.isArray(previous) ? previous : []),
          { target, at: Date.now() },
        ])
      );
    } catch {
      /* local report is best effort */
    }
    tell("신고를 기록했어요.");
  }
  function blockUser(targetUid: string) {
    if (targetUid === uid || blockedUids.includes(targetUid)) return;
    setBlockedUids(items => [...items, targetUid]);
    if (detail?.ownerUid === targetUid) closeDetail();
    tell(`${anon(targetUid)} 사용자를 숨겼어요.`);
  }
  function copyQuestionLink() {
    if (!detail) return;
    const link = `${window.location.origin}${window.location.pathname}#q-${detail.id}`;
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.setAttribute("readonly", "");
      textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch {
        return false;
      } finally {
        textarea.remove();
      }
    };
    const copied = () => tell("질문 링크를 복사했어요.");
    const failed = () => tell("링크를 직접 복사해주세요.");
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard
        .writeText(link)
        .then(copied)
        .catch(() => (fallbackCopy() ? copied() : failed()));
    } else if (fallbackCopy()) copied();
    else failed();
  }
  function exportLocalData() {
    const payload = {
      exportedAt: new Date().toISOString(),
      uid,
      questions,
      blockedUids,
      readAnswerCounts,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "skack-overflow-local-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
    tell("이 브라우저 기록을 내려받았어요.");
  }
  function importLocalData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload: unknown = JSON.parse(String(reader.result));
        if (!isRecord(payload)) throw new Error("invalid");
        const data = payload as {
          uid?: unknown;
          questions?: unknown;
          blockedUids?: unknown;
          readAnswerCounts?: unknown;
        };
        if (
          !Array.isArray(data.questions) ||
          !data.questions.length ||
          !data.questions.every(isQuestionData)
        )
          throw new Error("invalid");
        const imported = data.questions;
        requestConfirmation(
          `현재 브라우저 기록을 ${imported.length}개 질문 기록으로 바꿀까요?`,
          "가져오기",
          () => {
            const ids = new Set(imported.map(item => item.id));
            setQuestions([
              ...imported,
              ...sampleQuestions.filter(item => !ids.has(item.id)),
            ]);
            if (typeof data.uid === "string" && data.uid.startsWith("sk-")) {
              localStorage.setItem("skack-overflow-anon-uid", data.uid);
              setUid(data.uid);
            }
            setBlockedUids(
              Array.isArray(data.blockedUids)
                ? data.blockedUids.filter(
                    (item): item is string => typeof item === "string"
                  )
                : []
            );
            if (data.readAnswerCounts && isRecord(data.readAnswerCounts)) {
              const importedReads = Object.entries(
                data.readAnswerCounts
              ).reduce<Record<string, number>>((items, [key, value]) => {
                if (typeof value === "number") items[key] = value;
                return items;
              }, {});
              setReadAnswerCounts(importedReads);
            } else setReadAnswerCounts({});
            setFilter("모든 질문");
            tell(`${imported.length}개 질문 기록을 가져왔어요.`);
          }
        );
      } catch {
        tell("SKack 기록 JSON 파일만 가져올 수 있어요.");
      }
    };
    reader.readAsText(file);
  }
  function resetLocalData() {
    requestConfirmation(
      "이 브라우저의 질문·답변·차단 기록을 초기화할까요?",
      "초기화",
      () => {
        const nextUid = newUid();
        localStorage.removeItem("skack-overflow-questions");
        localStorage.removeItem("skack-overflow-blocked-uids");
        localStorage.removeItem("skack-overflow-read-answers");
        localStorage.removeItem("skack-overflow-reports");
        localStorage.setItem("skack-overflow-anon-uid", nextUid);
        setUid(nextUid);
        setQuestions(sampleQuestions);
        setBlockedUids([]);
        setReadAnswerCounts({});
        setDetail(null);
        setFilter("모든 질문");
        tell("이 브라우저 기록을 초기화했어요.");
      }
    );
  }
  function trapModalFocus(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const elements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled]), textarea:not([disabled])"
      )
    );
    if (!elements.length) return;
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const answerAuthor = (answer: Answer) =>
    answer.uid === uid ? "나" : answer.sample ? "예시 답변" : anon(answer.uid);
  const commentAuthor = (comment: Comment) =>
    comment.uid === uid ? "나" : anon(comment.uid);
  function renderComment(answer: Answer, comment: Comment, nested = false) {
    const replies = answer.comments.filter(
      item => item.parentId === comment.id && !blockedUids.includes(item.uid)
    );
    const editing = commentEdit?.commentId === comment.id;
    return (
      <div
        key={comment.id}
        className={`skack-comment ${nested ? "nested" : ""}`}
      >
        <div>
          <b>{commentAuthor(comment)}</b>
          <small>{comment.createdAt}</small>
        </div>
        {editing ? (
          <>
            <Textarea
              value={commentEdit.body}
              maxLength={LIMITS.comment}
              onChange={event =>
                setCommentEdit({ ...commentEdit, body: event.target.value })
              }
              onPaste={event =>
                void pasteImages(event, commentEdit.images, images =>
                  setCommentEdit(current =>
                    current
                      ? {
                          ...current,
                          images: [...current.images, ...images].slice(
                            0,
                            IMAGE_LIMITS.maxCount
                          ),
                        }
                      : current
                  )
                )
              }
            />
            <ImageAttachments
              images={commentEdit.images}
              editable
              onRemove={id =>
                setCommentEdit(current =>
                  current
                    ? {
                        ...current,
                        images: current.images.filter(image => image.id !== id),
                      }
                    : current
                )
              }
            />
            <PasteImageHint processing={imageProcessing > 0} />
            <div className="content-actions">
              <button onClick={saveCommentEdit}>저장</button>
              <button onClick={() => setCommentEdit(null)}>취소</button>
            </div>
          </>
        ) : (
          <>
            <p>{comment.body}</p>
            <ImageAttachments images={comment.images} />
          </>
        )}
        <div className="content-actions">
          <button
            onClick={() => {
              setCommentTarget({ answerId: answer.id, comment });
              setCommentText("");
              setCommentImages([]);
            }}
          >
            답글
          </button>
          {comment.uid === uid ? (
            <>
              <button
                onClick={() =>
                  setCommentEdit({
                    answerId: answer.id,
                    commentId: comment.id,
                    body: comment.body,
                    images: comment.images || [],
                  })
                }
              >
                수정
              </button>
              <button onClick={() => deleteComment(answer.id, comment.id)}>
                삭제
              </button>
            </>
          ) : (
            <>
              <button onClick={() => report(`comment:${comment.id}`)}>
                신고
              </button>
              <button onClick={() => blockUser(comment.uid)}>차단</button>
            </>
          )}
        </div>
        {replies.length > 0 && (
          <div className="comment-replies">
            {replies.map(reply => renderComment(answer, reply, true))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="skack-app">
      <header className="topbar">
        <a className="skack-logo" href="/">
          <img
            className="brand-logo-image"
            src="/skack-symbol.png"
            alt="SKack Overflow"
          />
        </a>
        <nav>
          <button
            className={filter === "모든 질문" ? "active" : ""}
            onClick={() => setFilter("모든 질문")}
          >
            전체
          </button>
          <button
            className={filter === "미해결" ? "active" : ""}
            onClick={() => setFilter("미해결")}
          >
            답변 기다리는 글 {stats.unanswered}
          </button>
          <button
            className={filter === "답변 있음" ? "active" : ""}
            onClick={() => setFilter("답변 있음")}
          >
            답변 달린 글
          </button>
          <button
            className={filter === "내 질문" ? "active" : ""}
            onClick={() => setFilter("내 질문")}
          >
            내 질문
          </button>
        </nav>
        <div className="top-actions">
          {incomingActivity > 0 && (
            <button
              className="incoming-chip"
              onClick={() => setFilter("내 질문")}
            >
              새 답변 {incomingActivity}
            </button>
          )}
          <span>
            <UserRound size={14} /> {uid ? anon(uid) : "익명 준비 중"}
          </span>
          <button onClick={() => setQuestionModal(true)}>
            <Plus size={16} /> 질문 올리기
          </button>
        </div>
      </header>
      <main className="skack-main">
        <section className="skack-hero human-hero">
          <div className="hero-copy">
            <p>SKALA를 위한 Stack Overflow</p>
            <h1>
              <span
                className="hero-phrase"
                key={heroPhraseIndex}
                aria-hidden="true"
              >
                {heroCatchphrases[heroPhraseIndex].lead}
                {heroCatchphrases[heroPhraseIndex].secondLine ? (
                  <>
                    <br />
                    {heroCatchphrases[heroPhraseIndex].secondLine}{" "}
                  </>
                ) : (
                  " "
                )}
                <em>SKACK</em>
              </span>
              <span className="sr-only">막히면 SKACK</span>
            </h1>
            <div className="hero-support">
              초보자의 질문은 고수의 답변을 만나고,
              <br />
              좋은 답변은 다음 사람의 검색 결과가 됩니다.
            </div>
            <div className="hero-ledger" aria-label="오늘의 질문 현황">
              <span>
                답변 기다리는 글 <b>{stats.unanswered}</b>
              </span>
              <span>
                답변 달린 글 <b>{stats.answers}</b>
              </span>
              <span>
                해결된 글 <b>{stats.solved}</b>
              </span>
            </div>
          </div>
          <section className="hero-evidence" aria-label="최근 답변">
            <p>최근 답변이 쌓이는 중</p>
            {heroEvidence.length ? (
              heroEvidence.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => openQuestion(question)}
                >
                  <span>{String(index + 1).padStart(2, "0")} / 답변 도착</span>
                  <strong>{question.title}</strong>
                  <small>
                    {question.createdAt} · 답변 {answeredCount(question)}개
                  </small>
                </button>
              ))
            ) : (
              <div>
                <span>새 답변을 기다리는 중</span>
                <strong>
                  아는 내용을 남기면 다음 사람의 검색 결과가 돼요.
                </strong>
              </div>
            )}
          </section>
        </section>
        <section className="question-toolbar">
          <div className="filter-tabs">
            {(
              [
                "모든 질문",
                "미해결",
                "답변 있음",
                "내 질문",
                "내 답변",
              ] as FilterKey[]
            ).map(item => (
              <button
                key={item}
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
              >
                {
                  (
                    {
                      "모든 질문": "전체",
                      미해결: "답변 기다리는 글",
                      "답변 있음": "답변 달린 글",
                      "내 질문": "내 질문",
                      "내 답변": "내 답변",
                    } as Record<FilterKey, string>
                  )[item]
                }
                {item === "미해결" && <small>{stats.unanswered}</small>}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <label>
              <Search size={15} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="궁금한 내용이나 기술을 찾아보세요"
              />
            </label>
            <div className="sort-tabs">
              {(["최신", "답변", "투표"] as SortKey[]).map(item => (
                <button
                  key={item}
                  className={sort === item ? "active" : ""}
                  onClick={() => setSort(item)}
                >
                  {
                    (
                      {
                        최신: "최근",
                        답변: "답변 많은 순",
                        투표: "도움 많이 받은 순",
                      } as Record<SortKey, string>
                    )[item]
                  }
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="question-layout">
          <div className="question-list">
            <div className="list-head">
              <div>
                <h2>
                  {
                    (
                      {
                        "모든 질문": "전체 질문",
                        미해결: "답변 기다리는 글",
                        "답변 있음": "답변 달린 글",
                        "내 질문": "내 질문",
                        "내 답변": "내 답변",
                      } as Record<FilterKey, string>
                    )[filter]
                  }{" "}
                  <small>{listed.length}개</small>
                </h2>
              </div>
              <button
                onClick={() => setQuestionModal(true)}
                aria-label="질문 올리기"
              >
                <Plus size={14} /> 질문 올리기
              </button>
            </div>
            {listed.length ? (
              listed.map((question, index) => (
                <button
                  className={`question-row ${isSolved(question) ? "is-solved" : answeredCount(question) ? "has-hint" : "needs-help"}`}
                  key={question.id}
                  onClick={() => openQuestion(question)}
                >
                  <div className="signal-stage">
                    <i />
                    <small
                      title={
                        isSolved(question)
                          ? "해결됨"
                          : answeredCount(question)
                            ? "답변 달림"
                            : "답변 기다리는 중"
                      }
                    >
                      {String(index + 1).padStart(2, "0")} ·{" "}
                      {isSolved(question)
                        ? "해결"
                        : answeredCount(question)
                          ? "답변"
                          : "대기"}
                    </small>
                    <span className="answer-total">
                      <span>답변</span>
                      <strong>{answeredCount(question)}</strong>
                      <span>개</span>
                    </span>
                    {isSolved(question) && (
                      <b title="질문자가 고른 답변">
                        <Check size={12} />
                      </b>
                    )}
                  </div>
                  <div className="question-copy">
                    <div className="visibility-flags">
                      {!answeredCount(question) && (
                        <span className="help-flag">답변 기다리는 중</span>
                      )}
                      {answeredCount(question) > 0 && !isSolved(question) && (
                        <span className="hint-flag">답변 달림</span>
                      )}
                      {isSolved(question) && (
                        <span className="solved-flag">해결됨</span>
                      )}
                    </div>
                    <h3>{question.title}</h3>
                    <p>{question.body}</p>
                    <div className="tag-row">
                      {question.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <small>
                      {question.course} · {question.createdAt}
                    </small>
                  </div>
                  <div className="question-meta">
                    <span>
                      <Eye size={13} /> {question.views}
                    </span>
                    <span>{question.votes || 0} 공감</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-question">
                <CircleHelp size={25} />
                <h3>아직 질문이 없어요.</h3>
                <button
                  onClick={() => {
                    setFilter("모든 질문");
                    setSearch("");
                  }}
                >
                  질문 둘러보기
                </button>
              </div>
            )}
          </div>
          <aside className="side-panel">
            <section>
              <h2>
                내가 남긴 <em>글</em>
              </h2>
              {incomingActivity > 0 && (
                <button
                  className="reply-alert"
                  onClick={() => setFilter("내 질문")}
                >
                  <MessageCircle size={16} />
                  <span>
                    새 답변<strong>{incomingActivity}개</strong>
                  </span>
                  <ArrowUp size={14} />
                </button>
              )}
              {myActivity.length ? (
                <div className="activity-list">
                  {myActivity.map(question => (
                    <button
                      key={question.id}
                      onClick={() => openQuestion(question)}
                    >
                      <span>
                        {question.ownerUid === uid ? "내 질문" : "내 답변"}
                      </span>
                      <strong>{question.title}</strong>
                      <small>
                        답변 {answeredCount(question)}개 <ArrowUp size={11} />
                      </small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-activity">
                  <strong>아직 남긴 글이 없어요.</strong>
                  <span>질문을 올리거나, 아는 내용을 답해보세요.</span>
                </div>
              )}
            </section>
            <section className="signal-key">
              <p>글 상태</p>
              <div>
                <span>
                  <i className="wait" />
                  답변 기다리는 중
                </span>
                <span>
                  <i />
                  답변 달림
                </span>
                <span>
                  <i className="picked" />
                  해결됨
                </span>
              </div>
            </section>
            <section className="tag-cloud">
              <p>많이 찾는 태그</p>
              <div>
                {[
                  "react",
                  "spring",
                  "sql",
                  "rag",
                  "css",
                  "git",
                  "team-project",
                  "api",
                ].map(tag => (
                  <button key={tag} onClick={() => setSearch(tag)}>
                    <Tag size={11} /> {tag}
                  </button>
                ))}
              </div>
            </section>
            <section className="data-tools">
              <input
                ref={importInputRef}
                className="data-import-input"
                type="file"
                accept="application/json,.json"
                aria-label="기록 가져오기 파일"
                onChange={importLocalData}
              />
              <button
                onClick={() => importInputRef.current?.click()}
                title="다른 브라우저에서 내보낸 기록 가져오기"
              >
                <FileUp size={12} /> 가져오기
              </button>
              <button
                onClick={exportLocalData}
                title="이 브라우저의 기록 내보내기"
              >
                <FileDown size={12} /> 내보내기
              </button>
              <button
                onClick={resetLocalData}
                title="이 브라우저의 기록 초기화"
              >
                <RotateCcw size={12} /> 초기화
              </button>
            </section>
          </aside>
        </section>
      </main>
      {questionModal && (
        <div
          className="modal-layer"
          onMouseDown={event =>
            event.currentTarget === event.target && setQuestionModal(false)
          }
        >
          <div
            className="ask-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ask-title"
            onKeyDown={trapModalFocus}
          >
            <button
              className="modal-close"
              onClick={() => setQuestionModal(false)}
              aria-label="질문 작성 닫기"
            >
              <X size={19} />
            </button>
            <h2 id="ask-title">질문 올리기</h2>
            <div className="mode-buttons">
              {(["강의 끝", "과제 중", "팀 작업"] as Mode[]).map(item => (
                <button
                  key={item}
                  className={mode === item ? "active" : ""}
                  onClick={() => setMode(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <input
              value={title}
              maxLength={LIMITS.title}
              onChange={event => setTitle(event.target.value)}
              placeholder="예: 화면은 떴는데 버튼이 안 눌려요"
              autoFocus
            />
            <Textarea
              value={body}
              maxLength={LIMITS.body}
              onChange={event => setBody(event.target.value)}
              onPaste={event =>
                void pasteImages(event, questionImages, images =>
                  setQuestionImages(current =>
                    [...current, ...images].slice(0, IMAGE_LIMITS.maxCount)
                  )
                )
              }
              placeholder="어디까지 해봤는지 적어주세요."
            />
            <ImageAttachments
              images={questionImages}
              editable
              onRemove={id =>
                setQuestionImages(images =>
                  images.filter(image => image.id !== id)
                )
              }
            />
            <PasteImageHint processing={imageProcessing > 0} />
            <input
              value={tagsText}
              onChange={event => setTagsText(event.target.value)}
              placeholder="태그 (선택)"
            />
            <div className="ask-bottom">
              <button disabled={imageProcessing > 0} onClick={submitQuestion}>
                질문 올리기 <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
      {detail && (
        <div
          className="modal-layer"
          onMouseDown={event =>
            event.currentTarget === event.target && closeDetail()
          }
        >
          <div
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onKeyDown={trapModalFocus}
          >
            <button
              autoFocus
              className="modal-close"
              onClick={closeDetail}
              aria-label="질문 상세 닫기"
            >
              <X size={19} />
            </button>
            <div className="detail-title">
              <div className="vote-stack">
                <button onClick={toggleQuestionVote} aria-label="질문 공감">
                  <ArrowUp size={18} />
                </button>
                <strong>{detail.votes || 0}</strong>
                <button
                  onClick={toggleQuestionVote}
                  aria-label="질문 공감 취소"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
              <div>
                {questionEdit ? (
                  <>
                    <input
                      value={questionEdit.title}
                      maxLength={LIMITS.title}
                      onChange={event =>
                        setQuestionEdit({
                          ...questionEdit,
                          title: event.target.value,
                        })
                      }
                    />
                    <Textarea
                      value={questionEdit.body}
                      maxLength={LIMITS.body}
                      onChange={event =>
                        setQuestionEdit({
                          ...questionEdit,
                          body: event.target.value,
                        })
                      }
                      onPaste={event =>
                        void pasteImages(event, questionEdit.images, images =>
                          setQuestionEdit(current =>
                            current
                              ? {
                                  ...current,
                                  images: [...current.images, ...images].slice(
                                    0,
                                    IMAGE_LIMITS.maxCount
                                  ),
                                }
                              : current
                          )
                        )
                      }
                    />
                    <ImageAttachments
                      images={questionEdit.images}
                      editable
                      onRemove={id =>
                        setQuestionEdit(current =>
                          current
                            ? {
                                ...current,
                                images: current.images.filter(
                                  image => image.id !== id
                                ),
                              }
                            : current
                        )
                      }
                    />
                    <PasteImageHint processing={imageProcessing > 0} />
                    <div className="content-actions">
                      <button disabled={imageProcessing > 0} onClick={saveQuestionEdit}>
                        저장
                      </button>
                      <button onClick={() => setQuestionEdit(null)}>
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h1 id="detail-title">{detail.title}</h1>
                    <div className="tag-row">
                      {detail.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            {!questionEdit && (
              <article className="question-body">
                <p>{detail.body}</p>
                <ImageAttachments images={detail.images} />
                <small>
                  {detail.createdAt} · <Eye size={12} /> {detail.views}회 조회
                </small>
                <div className="content-actions">
                  <button onClick={copyQuestionLink}>
                    <Link2 size={12} /> 링크 복사
                  </button>
                  {detail.ownerUid === uid ? (
                    <>
                      <button
                        onClick={() =>
                          setQuestionEdit({
                            title: detail.title,
                            body: detail.body,
                            images: detail.images || [],
                          })
                        }
                      >
                        수정
                      </button>
                      <button onClick={deleteQuestion}>삭제</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => report(`question:${detail.id}`)}>
                        신고
                      </button>
                      <button onClick={() => blockUser(detail.ownerUid)}>
                        차단
                      </button>
                    </>
                  )}
                </div>
              </article>
            )}
            <div className="answers-header">
              <h2>
                답변{" "}
                {
                  detail.answers.filter(
                    answer => !blockedUids.includes(answer.uid)
                  ).length
                }
                개
              </h2>
              {detail.acceptedAnswerId && (
                <span>
                  <CheckCircle2 size={14} /> 해결됨
                </span>
              )}
            </div>
            <div className="answers">
              {detail.answers.filter(
                answer => !blockedUids.includes(answer.uid)
              ).length ? (
                [...detail.answers]
                  .filter(answer => !blockedUids.includes(answer.uid))
                  .sort(
                    (a, b) =>
                      Number(b.id === detail.acceptedAnswerId) -
                        Number(a.id === detail.acceptedAnswerId) ||
                      b.votes - a.votes
                  )
                  .map(answer => (
                    <article
                      className={`answer-card ${answer.id === detail.acceptedAnswerId ? "accepted" : ""}`}
                      key={answer.id}
                    >
                      <div className="answer-vote">
                        <button
                          onClick={() => toggleVote(answer)}
                          aria-label="도움 됨"
                        >
                          <ArrowUp size={20} />
                        </button>
                        <b>{answer.votes}</b>
                        <button
                          onClick={() => toggleVote(answer)}
                          aria-label="공감 취소"
                        >
                          <ArrowDown size={20} />
                        </button>
                        {answer.id === detail.acceptedAnswerId && (
                          <i>
                            <Check size={17} />
                          </i>
                        )}
                      </div>
                      <div className="answer-content">
                        {answerEdit?.answerId === answer.id ? (
                          <>
                            <Textarea
                              value={answerEdit.body}
                              maxLength={LIMITS.answer}
                              onChange={event =>
                                setAnswerEdit({
                                  ...answerEdit,
                                  body: event.target.value,
                                })
                              }
                              onPaste={event =>
                                void pasteImages(event, answerEdit.images, images =>
                                  setAnswerEdit(current =>
                                    current
                                      ? {
                                          ...current,
                                          images: [...current.images, ...images].slice(
                                            0,
                                            IMAGE_LIMITS.maxCount
                                          ),
                                        }
                                      : current
                                  )
                                )
                              }
                            />
                            <ImageAttachments
                              images={answerEdit.images}
                              editable
                              onRemove={id =>
                                setAnswerEdit(current =>
                                  current
                                    ? {
                                        ...current,
                                        images: current.images.filter(
                                          image => image.id !== id
                                        ),
                                      }
                                    : current
                                )
                              }
                            />
                            <PasteImageHint processing={imageProcessing > 0} />
                            <div className="content-actions">
                              <button disabled={imageProcessing > 0} onClick={saveAnswerEdit}>
                                저장
                              </button>
                              <button onClick={() => setAnswerEdit(null)}>
                                취소
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p>{answer.body}</p>
                            <ImageAttachments images={answer.images} />
                          </>
                        )}
                        <div className="answer-by">
                          <span>
                            {answerAuthor(answer)} · {answer.createdAt}
                          </span>
                          {detail.ownerUid === uid && (
                            <button
                              className={
                                answer.id === detail.acceptedAnswerId
                                  ? "accepted-btn active"
                                  : "accepted-btn"
                              }
                              onClick={() => accept(answer)}
                            >
                              <CheckCircle2 size={14} />{" "}
                              {answer.id === detail.acceptedAnswerId
                                ? "이 답변으로 해결됨"
                                : "이 답변으로 해결"}
                            </button>
                          )}
                        </div>
                        <div className="content-actions">
                          {answer.uid === uid ? (
                            <>
                              <button
                                onClick={() =>
                                  setAnswerEdit({
                                    answerId: answer.id,
                                    body: answer.body,
                                    images: answer.images || [],
                                  })
                                }
                              >
                                수정
                              </button>
                              <button onClick={() => deleteAnswer(answer.id)}>
                                삭제
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => report(`answer:${answer.id}`)}
                              >
                                신고
                              </button>
                              <button onClick={() => blockUser(answer.uid)}>
                                차단
                              </button>
                            </>
                          )}
                        </div>
                        <div className="answer-comments">
                          {answer.comments
                            .filter(
                              comment =>
                                !comment.parentId &&
                                !blockedUids.includes(comment.uid)
                            )
                            .map(comment => renderComment(answer, comment))}
                        </div>
                        <button
                          className="comment-trigger"
                          onClick={() => {
                            setCommentTarget({ answerId: answer.id });
                            setCommentText("");
                            setCommentImages([]);
                          }}
                        >
                          댓글 쓰기
                        </button>
                      </div>
                    </article>
                  ))
              ) : (
                <div className="no-answer">
                  <CircleHelp size={22} />
                  <p>
                    아직 답변이 없어요. 아는 내용을 한 줄만 남겨도 도움이 돼요.
                  </p>
                </div>
              )}
            </div>
            <section className="answer-form">
              <p className="answer-prompt">
                아는 내용을 한 줄만 남겨도 다음 SKALA 교육생에게 도움이 돼요.
              </p>
              <Textarea
                value={answerText}
                maxLength={LIMITS.answer}
                onChange={event => setAnswerText(event.target.value)}
                onPaste={event =>
                  void pasteImages(event, answerImages, images =>
                    setAnswerImages(current =>
                      [...current, ...images].slice(0, IMAGE_LIMITS.maxCount)
                    )
                  )
                }
                placeholder="답변 내용을 적어주세요."
              />
              <ImageAttachments
                images={answerImages}
                editable
                onRemove={id =>
                  setAnswerImages(images =>
                    images.filter(image => image.id !== id)
                  )
                }
              />
              <PasteImageHint processing={imageProcessing > 0} />
              <div>
                <button disabled={imageProcessing > 0} onClick={submitAnswer}>
                  답변 남기기 <Send size={15} />
                </button>
              </div>
            </section>
            {commentTarget && (
              <div className="comment-box">
                <div>
                  <p>
                    {commentTarget.comment
                      ? `${commentAuthor(commentTarget.comment)}님에게 답글`
                      : "댓글"}
                  </p>
                  <button
                    onClick={() => {
                      setCommentTarget(null);
                      setCommentImages([]);
                    }}
                  >
                    취소
                  </button>
                </div>
                <Textarea
                  ref={commentInputRef}
                  value={commentText}
                  maxLength={LIMITS.comment}
                  onChange={event => setCommentText(event.target.value)}
                  onPaste={event =>
                    void pasteImages(event, commentImages, images =>
                      setCommentImages(current =>
                        [...current, ...images].slice(0, IMAGE_LIMITS.maxCount)
                      )
                    )
                  }
                  placeholder="댓글을 적어주세요"
                />
                <ImageAttachments
                  images={commentImages}
                  editable
                  onRemove={id =>
                    setCommentImages(images =>
                      images.filter(image => image.id !== id)
                    )
                  }
                />
                <PasteImageHint processing={imageProcessing > 0} />
                <button disabled={imageProcessing > 0} onClick={addComment}>
                  댓글 등록 <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {pendingConfirmation && (
        <div
          className="toast confirmation-toast"
          role="alertdialog"
          aria-label="행동 확인"
        >
          <p>{pendingConfirmation.message}</p>
          <div>
            <button onClick={() => resolveConfirmation(false)}>취소</button>
            <button autoFocus onClick={() => resolveConfirmation(true)}>
              {pendingConfirmation.confirmLabel}
            </button>
          </div>
        </div>
      )}
      {notice && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={15} /> {notice}
        </div>
      )}
    </div>
  );
}
