/* Quiet Signal extension: private browser-side reflection and pattern discovery, never identity tracking. */
import { ArrowUpRight, Bookmark, CheckCircle2, Compass, Eye, Layers3, LockKeyhole, Radar, Sparkles, TrendingUp } from "lucide-react";

export type SignalPost = { id: number; title: string; excerpt: string; tags: string[]; stage: string; age: string; replies: number; tone: "orange" | "teal" | "ink"; course: string; week: string; attempts: string; empathy: number };
type IntelligenceProps = { mode: "signals" | "insights"; posts: SignalPost[]; savedIds: number[]; empathizedIds: number[]; resolvedIds: number[]; onOpen: (post: SignalPost) => void; onResolve: (id: number) => void; onNavigate: () => void };

function Kpi({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return <div className="signal-kpi"><span>{icon}</span><strong>{value}</strong><small>{label}</small></div>;
}

export function SignalIntelligence({ mode, posts, savedIds, empathizedIds, resolvedIds, onOpen, onResolve, onNavigate }: IntelligenceProps) {
  const savedPosts = posts.filter((post) => savedIds.includes(post.id));
  const unresolved = posts.filter((post) => !resolvedIds.includes(post.id));
  const courseCounts = ["프론트엔드", "백엔드", "프로젝트"].map((course) => ({ course, count: posts.filter((post) => post.course === course).length }));
  const responseTotal = posts.reduce((sum, post) => sum + post.replies, 0);
  if (mode === "signals") return <section className="intelligence-page">
    <div className="intelligence-heading"><div><p className="section-kicker">PRIVATE BROWSER SPACE</p><h1>이 브라우저 안에만 남는,<br /><em>나의 다음 시도</em>입니다.</h1><p>계정과 프로필 없이도 저장한 신호, 공감한 막힘, 닫은 루프는 지금 사용하는 브라우저에만 보관됩니다.</p></div><div className="privacy-stamp"><LockKeyhole size={18} /><span>NO ACCOUNT<br />LOCAL ONLY</span></div></div>
    <div className="signal-kpi-grid"><Kpi icon={<Bookmark size={17} />} value={savedPosts.length} label="다시 볼 신호" /><Kpi icon={<Compass size={17} />} value={empathizedIds.length} label="같은 곳에서 멈춘 기록" /><Kpi icon={<CheckCircle2 size={17} />} value={resolvedIds.length} label="다음 시도로 닫은 루프" /></div>
    <div className="reflection-grid"><section className="return-queue"><div className="panel-heading"><div><p>RETURN QUEUE / {String(savedPosts.length).padStart(2, "0")}</p><h2>다시 읽을 관점</h2></div><Bookmark size={18} /></div>{savedPosts.length ? <div className="saved-list">{savedPosts.map((post, index) => <article key={post.id} className="saved-signal"><span>0{index + 1}</span><div><small>{post.course} · {post.week}</small><h3>{post.title}</h3><p>{post.replies}개의 관점 · {post.stage}</p></div><button onClick={() => onOpen(post)} aria-label="원문 열기"><ArrowUpRight size={18} /></button></article>)}</div> : <div className="empty-panel"><Eye size={23} /><strong>아직 저장한 신호가 없어요.</strong><p>나중에 다시 보고 싶은 질문을 저장하면, 여기에 개인적인 학습 큐가 만들어집니다.</p><button onClick={onNavigate}>교환소 둘러보기 <ArrowUpRight size={15} /></button></div>}</section>
      <aside className="closure-card"><p>LOOP CLOSURE</p><h2>지금의 막힘은<br />어떤 상태인가요?</h2><div className="closure-track"><span className="done" /><span className="done" /><span /><span /></div><p className="closure-caption">문제를 ‘해결’이 아니라 <strong>다음 시도 가능</strong> 상태로 닫아도 됩니다.</p><div className="closure-list">{unresolved.slice(0, 2).map((post) => <button key={post.id} onClick={() => onResolve(post.id)}><span>{post.title}</span><CheckCircle2 size={16} /></button>)}</div></aside></div>
    <section className="reflection-prompt"><Sparkles size={18} /><div><p>THIS WEEK’S PROMPT</p><h3>답을 얻은 순간보다, 질문의 범위가 좁아진 순간을 한 번 기록해보세요.</h3></div><button onClick={onNavigate}>새 신호로 돌아가기 <ArrowUpRight size={16} /></button></section>
  </section>;

  return <section className="intelligence-page insight-page">
    <div className="intelligence-heading"><div><p className="section-kicker">SIGNAL ATLAS / PUBLIC CONTEXT</p><h1>막힘은 흩어지지 않고,<br /><em>하나의 지형</em>이 됩니다.</h1><p>교환소에 남은 공개 맥락을 바탕으로, 지금 어떤 기술과 학습 단계에 도움이 더 필요한지 읽습니다.</p></div><div className="atlas-mark"><Radar size={38} /><span>ANONYMOUS<br />PATTERN MAP</span></div></div>
    <div className="signal-kpi-grid insight-kpis"><Kpi icon={<Layers3 size={17} />} value={posts.length} label="관찰 가능한 신호" /><Kpi icon={<TrendingUp size={17} />} value={responseTotal} label="도착한 다음 관점" /><Kpi icon={<CheckCircle2 size={17} />} value={`${resolvedIds.length}/${posts.length}`} label="이 브라우저에서 닫은 루프" /></div>
    <div className="atlas-grid"><section className="terrain-panel"><div className="panel-heading"><div><p>COURSE TERRAIN</p><h2>어디에서 신호가 많은가</h2></div><span>최근 흐름</span></div><div className="terrain-bars">{courseCounts.map((item) => <div className="terrain-row" key={item.course}><div><span>{item.course}</span><strong>{item.count} 신호</strong></div><div className="terrain-meter"><i style={{ width: `${Math.max(18, (item.count / Math.max(posts.length, 1)) * 100)}%` }} /></div></div>)}</div><div className="terrain-caption"><span className="dot orange" /> 관점이 적은 신호는 ‘도움 필요’ 정렬에서 먼저 만나볼 수 있어요.</div></section>
      <section className="pattern-panel"><div className="panel-heading"><div><p>CONNECTION RADAR</p><h2>비슷한 막힘의 결</h2></div><Radar size={18} /></div><div className="pattern-orbit"><div className="orbit-ring one" /><div className="orbit-ring two" /><span className="orbit-node node-a">상태</span><span className="orbit-node node-b">React</span><span className="orbit-node node-c">설계</span><span className="orbit-center">막힘<br />교환소</span></div><p>기술 태그 하나만이 아니라, <strong>막힘 단계와 시도한 방법</strong>도 함께 보고 다음 질문을 찾습니다.</p></section></div>
    <section className="pattern-notes"><article><span>01</span><div><p>관찰</p><h3>“원인 찾는 중” 신호에는 바로 답을 주기보다 확인 지점을 남겨보세요.</h3></div></article><article><span>02</span><div><p>연결</p><h3>유사한 실패 경로는 저장해 두면, 다음 프로젝트에서 다시 꺼내볼 수 있어요.</h3></div></article><article><span>03</span><div><p>전환</p><h3>막힘을 닫을 때는 해결 여부보다 ‘다음 시도가 생겼는지’를 체크하세요.</h3></div></article></section>
  </section>;
}
