/* SKALA Room: a time-aware, anonymous request desk built around real learning moments. */
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, Check, ChevronRight, CircleDot, Clock3, CornerDownRight, Flame, MessageCircle, Plus, Send, Sparkles, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Moment = "강의 끝난 직후" | "혼자 다시 해보는 중" | "마감 전" | "팀이 멈춘 날";
type Signal = { id: number; moment: Moment; course: string; line: string; tried: string; echoes: number; status: "지금 도움 필요" | "힌트 도착" | "다음 시도 중"; saved?: boolean; example?: boolean };
type View = "room" | "shelf";

const moments: { name: Moment; caption: string; course: string }[] = [
  { name: "강의 끝난 직후", caption: "방금 들었는데, 손이 멈췄어요", course: "Java, SpringBoot, Rest API 구현" },
  { name: "혼자 다시 해보는 중", caption: "자료 안 보고 한 번 더 해보는 중", course: "RAG Pipeline 설계 및 구축" },
  { name: "마감 전", caption: "제출은 해야 하는데, 이게 맞나 싶어요", course: "웹 서비스 개발 mini-Project" },
  { name: "팀이 멈춘 날", caption: "코드보다 합의가 더 어려운 날", course: "팀프로젝트" },
];

const exampleSignals: Signal[] = [
  { id: 1, moment: "강의 끝난 직후", course: "Java, SpringBoot, Rest API 구현", line: "응답은 오는데 화면에는 왜 아무것도 안 나올까요?", tried: "컨트롤러까지는 들어오는 걸 확인했어요.", echoes: 2, status: "지금 도움 필요", example: true },
  { id: 2, moment: "혼자 다시 해보는 중", course: "RAG Pipeline 설계 및 구축", line: "검색 결과는 있는데, 답변이 자꾸 엉뚱한 데로 가요.", tried: "chunk 크기랑 top-k만 바꿔봤어요.", echoes: 4, status: "힌트 도착", example: true },
  { id: 3, moment: "팀이 멈춘 날", course: "팀프로젝트", line: "폴더 구조를 지금 정해도 될까요, 아니면 기능부터 갈까요?", tried: "기능 기준이랑 도메인 기준을 둘 다 적어봤어요.", echoes: 3, status: "다음 시도 중", example: true },
];

function statusCopy(status: Signal["status"]) { return status === "지금 도움 필요" ? "여기, 먼저 지나가 본 사람 있나요?" : status === "힌트 도착" ? "힌트가 와 있어요. 다시 해보는 중." : "한 번 더 해보기로 했어요."; }

export default function Home() {
  const [view, setView] = useState<View>("room"); const [moment, setMoment] = useState<Moment>("강의 끝난 직후"); const [signals, setSignals] = useState<Signal[]>(exampleSignals);
  const [composer, setComposer] = useState(false); const [detail, setDetail] = useState<Signal | null>(null); const [title, setTitle] = useState(""); const [tried, setTried] = useState(""); const [saved, setSaved] = useState<number[]>([]); const [note, setNote] = useState(""); const [hint, setHint] = useState("");
  const active = moments.find((item) => item.name === moment) ?? moments[0];
  useEffect(() => { try { setSaved(JSON.parse(localStorage.getItem("skala-room-shelf") || "[]")); } catch { setSaved([]); } }, []);
  useEffect(() => { localStorage.setItem("skala-room-shelf", JSON.stringify(saved)); }, [saved]);
  const roomSignals = useMemo(() => signals.filter((signal) => signal.moment === moment), [signals, moment]);
  const shelf = signals.filter((signal) => saved.includes(signal.id));
  const say = (text: string) => { setNote(text); window.setTimeout(() => setNote(""), 2600); };
  function sendRequest() { if (!title.trim()) return say("막힌 장면을 한 줄로만 적어주세요."); const item: Signal = { id: Date.now(), moment, course: active.course, line: title, tried: tried || "아직 손도 못 댔어요. 어디부터 봐야 할지 모르겠어요.", echoes: 0, status: "지금 도움 필요" }; setSignals((current) => [item, ...current]); setComposer(false); setTitle(""); setTried(""); say("좋아요. 같은 시간대를 지나고 있는 사람들에게 먼저 보여줄게요."); }
  function saveSignal(id: number) { setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); say(saved.includes(id) ? "다시 보기에서 뺐어요." : "나중에 다시 볼 힌트로 챙겨뒀어요."); }
  function addHint() { if (!hint.trim() || !detail) return say("정답 말고, 딱 한 줄 힌트만 남겨주세요."); const updated = { ...detail, echoes: detail.echoes + 1, status: "힌트 도착" as const }; setSignals((current) => current.map((item) => item.id === detail.id ? updated : item)); setDetail(updated); setHint(""); say("좋아요. 누군가 다시 해볼 이유가 생겼어요."); }
  function closeLoop(id: number) { setSignals((current) => current.map((item) => item.id === id ? { ...item, status: "다음 시도 중" } : item)); setDetail(null); say("잘했어요. 답을 몰라도 다음 한 번을 정했으면 충분해요."); }

  return <div className="room-app">
    <aside className="room-rail"><button className="room-mark" onClick={() => setView("room")} aria-label="막힘 교환소 홈"><i /><i /><b /></button><p>SKALA<br />ROOM<br />00–24</p><span>익명이어도,<br />혼자는 아님</span></aside>
    <main><header className="room-header"><button className="room-wordmark" onClick={() => setView("room")}>막힘<span>↔</span>교환소</button><nav><button className={view === "room" ? "active" : ""} onClick={() => setView("room")}>지금</button><button className={view === "shelf" ? "active" : ""} onClick={() => setView("shelf")}>다시 보기 <small>{saved.length}</small></button></nav><p><CircleDot size={13} /> 계정 없이, 그냥 들어와도 돼요</p></header>
      {view === "room" ? <><section className="room-intro"><div className="intro-index"><span>오늘의 시간</span><strong>00<br />24</strong><i /></div><div className="intro-copy"><p>SKALA 안에서 제일 자주 나오는 말</p><h1>“이거…<br /><em>나만 막힌 건가?”</em></h1><h2>아니요. 보통은 누군가도 같은 데서 한 번 멈췄어요.</h2><button onClick={() => setComposer(true)}><Plus size={17} /> 나도 한 줄 남기기</button></div><div className="intro-proof"><img src="/manus-storage/quiet-signal-archive-evidence_91b27012.png" alt="일정과 주석이 남은 학습 노트" /><div><span>오늘의 기록 조각</span><b>막힌 순간도<br />다음 사람한테는 힌트가 됩니다.</b></div></div></section>
        <section className="moment-strip"><div className="strip-title"><p>지금 어떤 시간이야?</p><strong>질문의 말투도, 필요한 도움도 달라져요.</strong></div><div className="moment-buttons">{moments.map((item, index) => <button key={item.name} onClick={() => setMoment(item.name)} className={moment === item.name ? "active" : ""}><span>0{index + 1}</span><b>{item.name}</b><small>{item.caption}</small></button>)}</div></section>
        <section className="desk"><div className="desk-head"><div><p>{active.course}</p><h2>{active.caption}</h2></div><div className="desk-note"><Flame size={15} /><span>정답 말고<br />다음 한 번</span></div></div><div className="signal-stack">{roomSignals.length ? roomSignals.map((signal, index) => <article key={signal.id} className={`signal-note ${signal.status.replaceAll(" ", "-")}`} onClick={() => setDetail(signal)}><div className="note-index">0{index + 1}</div><div className="note-main"><div className="note-meta"><span>{signal.course}</span><span>{signal.example ? "연습 신호" : "방금 들어옴"}</span></div><h3>{signal.line}</h3><p><CornerDownRight size={14} /> {signal.tried}</p><div className="note-foot"><b>{statusCopy(signal.status)}</b><span><MessageCircle size={14} /> {signal.echoes}명이 말 얹었어요</span></div></div><ArrowUpRight size={19} /></article>) : <div className="silent-state"><Sparkles size={24} /><h3>여긴 아직 조용하네요.</h3><p>그럼 첫 번째로 막힌 장면을 남겨주세요.<br />다음에 같은 데서 멈춘 사람이 덜 외로워질 거예요.</p><button onClick={() => setComposer(true)}>내가 먼저 말하기</button></div>}</div></section></> : <section className="shelf-page"><div className="shelf-title"><p>개인 브라우저 안에만 남는 책갈피</p><h1>나중에 다시<br /><em>꺼내볼 힌트들.</em></h1><span>로그인도 기록도 없어요. 이 브라우저에서만 다시 볼 수 있어요.</span></div><div className="shelf-list">{shelf.length ? shelf.map((signal) => <button key={signal.id} onClick={() => setDetail(signal)}><span>{signal.course}</span><strong>{signal.line}</strong><small>{statusCopy(signal.status)} <ArrowUpRight size={14} /></small></button>) : <div className="shelf-empty"><Bookmark size={25} /><p>아직 챙겨둔 힌트가 없어요.</p><button onClick={() => setView("room")}>교환소 가보기 <ChevronRight size={15} /></button></div>}</div></section>}
      <footer>“아는 거 있으면 좀 풀어주세요.” 대신, <strong>“여기서 뭘 먼저 봤어요?”</strong>라고 물어보는 곳.</footer>
    </main>
    {composer && <div className="layer"><div className="request-sheet"><button className="close" onClick={() => setComposer(false)}><X size={18} /></button><p>지금은 <strong>{moment}</strong></p><h2>어디서 손이 멈췄어요?</h2><span>잘 정리 안 해도 돼요. 막힌 장면 하나, 해본 거 하나면 충분해요.</span><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="예: 요청은 성공하는데 화면이 그대로예요" /><Textarea value={tried} onChange={(event) => setTried(event.target.value)} placeholder="여기까지는 해봤어요. (없으면 비워둬도 돼요)" /><div className="request-footer"><small>이름도, 반도, 닉네임도 안 물어봐요.</small><button onClick={sendRequest}>여기 좀 봐주세요 <Send size={15} /></button></div></div></div>}
    {detail && <div className="layer"><div className="detail-sheet"><button className="close" onClick={() => setDetail(null)}><X size={18} /></button><div className="detail-label"><span>{detail.moment}</span><button onClick={() => saveSignal(detail.id)}><Bookmark size={16} fill={saved.includes(detail.id) ? "currentColor" : "none"} /> {saved.includes(detail.id) ? "챙겨뒀어요" : "나중에 볼래요"}</button></div><h2>{detail.line}</h2><div className="did-try"><p>여기까지는 해봤어요</p><strong>{detail.tried}</strong></div><div className="echo-head"><div><p>{statusCopy(detail.status)}</p><h3>지나가다 한마디만 해줄래요?</h3></div><span>{detail.echoes}개의 힌트</span></div><div className="hint-presets"><button onClick={() => setHint("저는 여기부터 확인해봤어요: ")}>저는 여기부터 봤어요</button><button onClick={() => setHint("이건 한 번 확인해봤어요? ")}>이건 확인해봤어요?</button><button onClick={() => setHint("저는 여기서 이렇게 삽질했어요: ")}>저는 여기서 삽질했어요</button></div><Textarea value={hint} onChange={(event) => setHint(event.target.value)} placeholder="정답 말고, 다음 한 번만 알려주세요." /><div className="hint-footer"><button onClick={() => closeLoop(detail.id)}><Check size={15} /> 오케이, 다시 해볼게요</button><button className="send-hint" onClick={addHint}>힌트만 던지기 <ArrowUpRight size={15} /></button></div></div></div>}
    {note && <div className="room-toast"><Check size={15} /> {note}</div>}
  </div>;
}
