import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()} @ ${message.location().url}`); });
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };
const title = "검증용 SKACK 질문: 답변 채택 권한을 확인하고 싶어요.";

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const ownerUid = await page.evaluate(() => localStorage.getItem("skack-overflow-anon-uid"));
  await check(Boolean(ownerUid?.startsWith("sk-")), "브라우저별 SKACK 익명 UID 생성");
  await check(await page.locator(".question-row").count() === 12, "초기 질문 12개 표시");

  await page.locator(".filter-tabs button").filter({ hasText: "힌트 닿음" }).click();
  await check(await page.locator(".question-row").count() === 5, "힌트가 닿은 막힘 필터");
  await page.locator(".filter-tabs button").filter({ hasText: "막힘 전부" }).click();
  await page.getByPlaceholder("태그나 기억나는 말로 찾기").fill("rag");
  await check(await page.locator(".question-row").count() === 1, "태그·기술 검색");
  await page.getByPlaceholder("태그나 기억나는 말로 찾기").fill("");

  await page.locator(".top-actions button").click();
  await page.locator(".ask-modal input").nth(0).fill(title);
  await page.locator(".ask-modal textarea").fill("채택은 질문 작성자만 해야 하는지와, 답변 투표가 중복되지 않는지 확인하고 싶어요.");
  await page.locator(".ask-modal input").nth(1).fill("auth, answer, vote");
  await page.locator(".ask-bottom button").click();
  await check(await page.getByText("질문을 올렸어요. 답변이 오면 이 브라우저에서 이어볼 수 있어요.").isVisible(), "익명 막힘 기록 작성");
  await check(await page.locator(".question-row").count() === 1, "내가 쓴 글 필터 자동 전환");

  await page.evaluate((peer) => localStorage.setItem("skack-overflow-anon-uid", peer), "sk-peer-test");
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".filter-tabs button").filter({ hasText: "막힘 전부" }).click();
  await page.locator(".question-row").filter({ hasText: title }).click();
  await check(await page.getByText("질문 작성자만 답변을 채택할 수 있어요.").count() === 0, "동료에게 채택 버튼 미노출");
  await page.locator(".answer-form textarea").fill("채택 검증 힌트: 질문 작성자의 UID와 현재 UID를 비교해서 채택 버튼을 보여주세요.");
  await page.getByRole("button", { name: "힌트 남기기" }).click();
  await check(await page.getByText("채택 검증 힌트: 질문 작성자의 UID와 현재 UID를 비교해서 채택 버튼을 보여주세요.").isVisible(), "동료 익명 힌트 작성");
  await page.getByRole("button", { name: "유용 신호 보내기" }).click();
  await check(await page.getByText("내 답변에는 투표할 수 없어요.").isVisible(), "내 힌트 중복·자기 투표 차단");
  await page.getByRole("button", { name: "댓글 남기기" }).click();
  await page.locator(".comment-box textarea").fill("댓글 검증: 이 흐름으로 질문 작성자만 채택할 수 있겠네요.");
  await page.getByRole("button", { name: "댓글 전송" }).click();
  await page.getByRole("button", { name: "답글" }).click();
  await page.locator(".comment-box textarea").fill("답글 검증: 맞아요. UID가 같은지 확인해야 해요.");
  await page.getByRole("button", { name: "댓글 전송" }).click();
  await check(await page.getByText("답글 검증: 맞아요. UID가 같은지 확인해야 해요.").isVisible(), "답변 댓글과 답글 작성");
  await page.locator(".detail-modal .modal-close").click();

  await page.evaluate((owner) => localStorage.setItem("skack-overflow-anon-uid", owner), ownerUid);
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".filter-tabs button").filter({ hasText: "내 막힘" }).click();
  await page.locator(".question-row").filter({ hasText: title }).click();
  await check(await page.locator(".detail-modal .accepted-btn").isVisible(), "질문 작성자에게만 채택 버튼 표시");
  await page.locator(".detail-modal .accepted-btn").click();
  await check(await page.getByText("채택된 답변으로 표시했어요.").isVisible(), "기록자 힌트 채택");
  await page.getByRole("button", { name: "유용 신호 보내기" }).click();
  await check(await page.getByText("유용한 답변으로 표시했어요.").isVisible(), "동료 힌트 도움 신호");
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".filter-tabs button").filter({ hasText: "내 막힘" }).click();
  await page.locator(".question-row").filter({ hasText: title }).click();
  await check(await page.locator(".detail-modal .accepted-btn.active").isVisible(), "채택·투표·댓글 새로고침 복원");
  await check(errors.length === 0, `브라우저 런타임 오류 없음 (${errors.join(" | ")})`);
} finally { await browser.close(); }
