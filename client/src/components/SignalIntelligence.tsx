/* Quiet Signal extension: browser-local question review and learning-pattern discovery. */
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
    <div className="intelligence-heading"><div><p className="section-kicker">내 브라우저 기록</p><h1>이 브라우저 안에만 남는,<br /><em>나의 학습 기록</em>입니다.</h1><p>계정과 프로필 없이도 저장한 질문, 공감한 글, 해결한 질문은 지금 사용하는 브라우저에만 보관됩니다.</p></div><div className="privacy-stamp"><LockKeyhole size={18} /><span>계정 없이<br />이 브라우저에 저장</span></div></div>
    <div className="signal-kpi-grid"><Kpi icon={<Bookmark size={17} />} value={savedPosts.length} label="다시 볼 질문" /><Kpi icon={<Compass size={17} />} value={empathizedIds.length} label="공감한 질문" /><Kpi icon={<CheckCircle2 size={17} />} value={resolvedIds.length} label="해결한 질문" /></div>
    <div className="reflection-grid"><section className="return-queue"><div className="panel-heading"><div><p>다시 볼 질문 / {String(savedPosts.length).padStart(2, "0")}</p><h2>저장한 질문</h2></div><Bookmark size={18} /></div>{savedPosts.length ? <div className="saved-list">{savedPosts.map((post, index) => <article key={post.id} className="saved-signal"><span>0{index + 1}</span><div><small>{post.course} · {post.week}</small><h3>{post.title}</h3><p>답변 {post.replies}개 · {post.stage}</p></div><button onClick={() => onOpen(post)} aria-label="질문 열기"><ArrowUpRight size={18} /></button></article>)}</div> : <div className="empty-panel"><Eye size={23} /><strong>아직 저장한 질문이 없어요.</strong><p>나중에 다시 보고 싶은 질문을 저장하면 여기에 모아볼 수 있어요.</p><button onClick={onNavigate}>질문 둘러보기 <ArrowUpRight size={15} /></button></div>}</section>
      <aside className="closure-card"><p>질문 진행 상태</p><h2>지금 보고 있는 질문은<br />어디까지 왔나요?</h2><div className="closure-track"><span className="done" /><span className="done" /><span /><span /></div><p className="closure-caption">완전히 해결하지 못했더라도, 다음에 해볼 일을 정했다면 기록해둘 수 있어요.</p><div className="closure-list">{unresolved.slice(0, 2).map((post) => <button key={post.id} onClick={() => onResolve(post.id)}><span>{post.title}</span><CheckCircle2 size={16} /></button>)}</div></aside></div>
    <section className="reflection-prompt"><Sparkles size={18} /><div><p>이번 주 기록</p><h3>답을 찾은 순간보다 질문의 범위가 좁아진 순간을 한 번 적어보세요.</h3></div><button onClick={onNavigate}>질문 목록으로 <ArrowUpRight size={16} /></button></section>
  </section>;

  return <section className="intelligence-page insight-page">
    <div className="intelligence-heading"><div><p className="section-kicker">질문 흐름 / 공개 질문</p><h1>질문은 흩어지지 않고,<br /><em>함께 쌓입니다.</em></h1><p>교환소에 남은 공개 질문을 바탕으로, 지금 어디에 도움이 더 필요한지 살펴볼 수 있어요.</p></div><div className="atlas-mark"><Radar size={38} /><span>익명 질문<br />흐름 보기</span></div></div>
    <div className="signal-kpi-grid insight-kpis"><Kpi icon={<Layers3 size={17} />} value={posts.length} label="전체 질문" /><Kpi icon={<TrendingUp size={17} />} value={responseTotal} label="전체 답변" /><Kpi icon={<CheckCircle2 size={17} />} value={`${resolvedIds.length}/${posts.length}`} label="해결한 질문" /></div>
    <div className="atlas-grid"><section className="terrain-panel"><div className="panel-heading"><div><p>과목별 질문</p><h2>어디에 질문이 많은가</h2></div><span>최근 흐름</span></div><div className="terrain-bars">{courseCounts.map((item) => <div className="terrain-row" key={item.course}><div><span>{item.course}</span><strong>{item.count}개</strong></div><div className="terrain-meter"><i style={{ width: `${Math.max(18, (item.count / Math.max(posts.length, 1)) * 100)}%` }} /></div></div>)}</div><div className="terrain-caption"><span className="dot orange" /> 답변이 없는 질문은 ‘답변 기다리는 글’에서 먼저 볼 수 있어요.</div></section>
      <section className="pattern-panel"><div className="panel-heading"><div><p>비슷한 질문</p><h2>어떤 질문이 이어지는가</h2></div><Radar size={18} /></div><div className="pattern-orbit"><div className="orbit-ring one" /><div className="orbit-ring two" /><span className="orbit-node node-a">상태</span><span className="orbit-node node-b">React</span><span className="orbit-node node-c">설계</span><span className="orbit-center">질문<br />교환소</span></div><p>기술 태그뿐 아니라, 시도한 방법도 함께 보고 다음 질문을 찾습니다.</p></section></div>
    <section className="pattern-notes"><article><span>01</span><div><p>확인</p><h3>“원인 찾는 중”인 질문에는 바로 답을 주기보다 먼저 확인할 곳을 알려주세요.</h3></div></article><article><span>02</span><div><p>저장</p><h3>비슷한 실패 경험은 저장해 두면 다음 프로젝트에서 다시 볼 수 있어요.</h3></div></article><article><span>03</span><div><p>정리</p><h3>질문을 닫기 전에는 다음에 해볼 일을 함께 적어두세요.</h3></div></article></section>
  </section>;
}
