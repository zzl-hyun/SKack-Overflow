/* Quiet Signal: editorial debugging commons. Ivory paper, ink typography, signal orange for moments of blockage. */
import { useMemo, useState } from "react";
import { ArrowUpRight, ChevronRight, CircleDot, Filter, Lightbulb, MessageCircle, Plus, Search, ShieldCheck, Sparkles, X } from "lucide-react";

type Post = { id: number; title: string; excerpt: string; tags: string[]; stage: string; age: string; replies: number; signal: string; tone: "orange" | "teal" | "ink" };

const seedPosts: Post[] = [
  { id: 1, title: "useEffect가 두 번 실행되는 이유를 아직 못 잡고 있어요", excerpt: "StrictMode를 끄면 사라지는데, 끄는 게 해결은 아닌 것 같아서요. 어디부터 관찰하면 좋을까요?", tags: ["React", "디버깅"], stage: "원인 찾는 중", age: "8분 전", replies: 6, signal: "높음", tone: "orange" },
  { id: 2, title: "API 응답은 오는데 화면에만 안 나타납니다", excerpt: "네트워크 탭에서는 200인데 state가 업데이트되지 않아요. 비슷한 실패 경로가 있었나요?", tags: ["비동기", "상태"], stage: "단서 수집 중", age: "22분 전", replies: 3, signal: "중간", tone: "teal" },
  { id: 3, title: "팀원이랑 폴더 구조 의견이 갈렸어요", excerpt: "정답이 있는 문제는 아닌데, 지금 결정하면 나중에 바꾸기 어려울까 봐 멈춰 있습니다.", tags: ["협업", "설계"], stage: "결정 대기", age: "41분 전", replies: 9, signal: "낮음", tone: "ink" },
  { id: 4, title: "CSS는 맞는데 모바일에서만 레이아웃이 무너져요", excerpt: "데스크톱에서는 괜찮고 375px에서 카드가 밀립니다. 확인 순서에 대한 힌트를 구해요.", tags: ["CSS", "반응형"], stage: "범위 좁히는 중", age: "1시간 전", replies: 4, signal: "중간", tone: "teal" },
];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>(seedPosts);
  const [activeTag, setActiveTag] = useState("전체");
  const [query, setQuery] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [selected, setSelected] = useState<Post | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [hint, setHint] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => posts.filter((post) => {
    const matchesTag = activeTag === "전체" || post.tags.includes(activeTag);
    const matchesQuery = !query || `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    return matchesTag && matchesQuery;
  }), [posts, activeTag, query]);

  function submitPost() {
    if (!newTitle.trim()) return;
    const post: Post = { id: Date.now(), title: newTitle, excerpt: newBody || "아직 문장을 다듬는 중이에요. 먼저 막힌 장면부터 남겨두었습니다.", tags: ["새 신호"], stage: "첫 관점 기다리는 중", age: "방금 전", replies: 0, signal: "새로움", tone: "orange" };
    setPosts((current) => [post, ...current]); setNewTitle(""); setNewBody(""); setShowComposer(false); setNotice("익명 신호가 교환소에 도착했어요.");
    window.setTimeout(() => setNotice(""), 2800);
  }

  function submitHint() {
    if (!hint.trim() || !selected) return;
    setPosts((current) => current.map((post) => post.id === selected.id ? { ...post, replies: post.replies + 1 } : post));
    setHint(""); setNotice("정답이 아닌 다음 관점을 남겼어요."); window.setTimeout(() => setNotice(""), 2800);
  }

  return <div className="quiet-app">
    <aside className="signal-rail">
      <div className="brand-mark"><img src="/manus-storage/quiet-signal-mark_0f110d08.png" alt="막힘 교환소 심볼" /></div>
      <div className="rail-label">SKALA<br />ANONYMOUS<br />DEBUGGING</div>
      <div className="rail-line" />
      <div className="rail-bottom"><span>2026 / 08</span><span className="vertical">QUIET SIGNAL</span></div>
    </aside>
    <main className="app-main">
      <header className="topbar"><div className="wordmark">막힘 <span>/</span> 교환소</div><div className="top-actions"><span className="anonymous-pill"><ShieldCheck size={14} /> 로그인 없이, 익명으로</span><button className="text-button" onClick={() => setNotice("이 공간은 평가하지 않고 다음 시도를 돕습니다.")}>이용 원칙 <ChevronRight size={15} /></button></div></header>
      <section className="hero"><div className="hero-copy"><p className="eyebrow"><CircleDot size={13} /> 지금 교환소에 들어온 신호 <strong>24</strong></p><h1>막힌 장면을 남기면,<br /><em>다음 관점</em>이 도착합니다.</h1><p className="hero-desc">정답을 묻는 게시판이 아니에요. 어디에서 방향을 잃었는지 남기면, 먼저 지나간 사람이 자신의 실패 경로와 힌트를 건넵니다.</p><button className="primary-button" onClick={() => setShowComposer(true)}><Plus size={18} /> 막힌 장면 남기기</button></div><div className="hero-art"><img src="/manus-storage/quiet-signal-studio_314aa134.png" alt="노트 위를 가로지르는 디버깅 신호" /><div className="art-caption">오늘의 신호 / 04 — 질문은 완성될 필요가 없습니다.</div></div></section>
      <section className="workspace"><div className="feed-head"><div><p className="section-kicker">OPEN SIGNALS / 04</p><h2>지금, 누군가 여기서 멈췄어요.</h2></div><button className="filter-button"><Filter size={15} /> 최신순 <ChevronRight size={14} /></button></div>
        <div className="feed-tools"><div className="search-box"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="문제, 기술, 상황으로 찾기" /></div><div className="tag-row">{["전체", "React", "비동기", "협업", "CSS"].map((tag) => <button key={tag} className={`tag-filter ${activeTag === tag ? "active" : ""}`} onClick={() => setActiveTag(tag)}>{tag}</button>)}</div></div>
        <div className="signal-list">{filtered.map((post, index) => <article className="signal-card" key={post.id} onClick={() => setSelected(post)}><div className={`signal-index ${post.tone}`}>0{index + 1}</div><div className="signal-content"><div className="card-meta"><span>{post.stage}</span><span>{post.age}</span></div><h3>{post.title}</h3><p>{post.excerpt}</p><div className="card-foot"><div className="tag-list">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><span className="reply-count"><MessageCircle size={14} /> {post.replies}개의 관점</span></div></div><ArrowUpRight className="card-arrow" size={21} /></article>)}</div>
      </section>
      <footer className="footer"><span>막힘은 개인의 결함이 아니라, 관점이 바뀌기 직전의 상태입니다.</span><span>SKALA / 익명 학습 실험</span></footer>
    </main>
    {showComposer && <div className="modal-backdrop"><div className="composer modal-panel"><button className="close-button" onClick={() => setShowComposer(false)}><X size={18} /></button><p className="section-kicker">NEW SIGNAL / ANONYMOUS</p><h2>어디에서 멈췄나요?</h2><p className="modal-note">이름, 계정, 프로필 없이 지금의 장면만 남겨요.</p><input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="한 문장으로 막힌 장면을 적어주세요" /><textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} placeholder="시도한 것, 확인한 것, 아직 모르는 것을 자유롭게 적어주세요." /><div className="composer-actions"><span><ShieldCheck size={14} /> 완전 익명</span><button className="primary-button" onClick={submitPost}>신호 보내기 <ArrowUpRight size={16} /></button></div></div></div>}
    {selected && <div className="modal-backdrop"><div className="detail-panel modal-panel"><button className="close-button" onClick={() => setSelected(null)}><X size={18} /></button><div className="detail-signal"><CircleDot size={14} /> {selected.stage}</div><h2>{selected.title}</h2><p>{selected.excerpt}</p><div className="hint-divider"><span>관점 {selected.replies}</span><span>이름 없이 이어지는 기록</span></div><div className="hint-list"><div className="hint-card"><Lightbulb size={18} /><div><strong>힌트의 방향</strong><p>문제를 바로 고치기보다, 같은 요청이 몇 번 들어오는지 먼저 기록해보면 어떨까요?</p></div></div><div className="hint-card subtle"><Sparkles size={18} /><div><strong>나도 여기서 막혔어요</strong><p>정답은 아니지만, 콘솔 로그의 위치를 바꾸고 나서 범위가 좁혀졌습니다.</p></div></div></div><div className="hint-composer"><textarea value={hint} onChange={(e) => setHint(e.target.value)} placeholder="정답 말고, 다음 관점을 남겨주세요." /><button className="primary-button" onClick={submitHint}>관점 남기기</button></div></div></div>}
    {notice && <div className="toast"><ShieldCheck size={16} /> {notice}</div>}
  </div>;
}
