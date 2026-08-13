import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const checks = [];
const note = (label, passed) => { checks.push({ label, passed }); console.log(`${passed ? "PASS" : "GAP"} · ${label}`); };

try {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await page.locator(".top-actions button").last().click();
  await page.locator(".modal-layer").click({ position: { x: 2, y: 2 } });
  note("오버레이 클릭으로 질문 모달을 닫는다", !(await page.locator(".ask-modal").isVisible()));
  await page.locator(".top-actions button").last().click();
  await page.getByRole("button", { name: "질문 올리기" }).click();
  note("빈 질문 입력을 차단한다", await page.getByText("제목과 내용을 적어주세요.").isVisible());

  await page.locator(".ask-modal input").nth(0).fill("QA 경계 질문");
  await page.locator(".ask-modal textarea").fill("빈 답변과 댓글 검증용 질문입니다.");
  await page.getByRole("button", { name: "질문 올리기" }).click();
  await page.locator(".question-row").filter({ hasText: "QA 경계 질문" }).click();

  await page.getByRole("button", { name: "답변 남기기" }).click();
  note("빈 답변 입력을 차단한다", await page.getByText("답변 내용을 적어주세요.").isVisible());

  await page.locator(".answer-form textarea").fill("QA 답변");
  await page.getByRole("button", { name: "답변 남기기" }).click();
  await page.getByRole("button", { name: "댓글 쓰기" }).click();
  await page.getByRole("button", { name: "댓글 등록" }).click();
  note("빈 댓글 입력을 차단한다", await page.getByText("댓글 내용을 적어주세요.").isVisible());
  await page.locator(".comment-box textarea").fill("QA 댓글");
  await page.getByRole("button", { name: "댓글 등록" }).click();
  await page.locator(".skack-comment").getByRole("button", { name: "수정" }).click();
  await page.locator(".skack-comment textarea").fill("QA 수정 댓글");
  await page.locator(".skack-comment").getByRole("button", { name: "저장" }).click();
  note("댓글 작성자가 댓글을 수정한다", await page.getByText("QA 수정 댓글").isVisible());
  await page.locator(".skack-comment").getByRole("button", { name: "삭제" }).click();
  note("댓글 작성자가 댓글을 삭제한다", !(await page.getByText("QA 수정 댓글").isVisible()));

  await page.keyboard.press("Escape");
  note("Escape로 댓글 입력을 먼저 닫는다", !(await page.locator(".comment-box").isVisible()));
  await page.keyboard.press("Escape");
  note("Escape로 상세 모달을 닫는다", !(await page.locator(".detail-modal").isVisible()));

  await page.locator(".filter-tabs button").filter({ hasText: "내 막힘" }).click();
  await page.locator(".question-row").filter({ hasText: "QA 경계 질문" }).click();
  await page.locator(".question-body").getByRole("button", { name: "수정" }).click();
  await page.locator(".detail-title input").fill("QA 수정 질문");
  await page.locator(".detail-title").getByRole("button", { name: "저장" }).click();
  note("질문 작성자가 질문을 수정한다", await page.locator(".detail-modal h1").getByText("QA 수정 질문", { exact: true }).isVisible());

  const ownAnswer = page.locator(".answer-card").first();
  await ownAnswer.getByRole("button", { name: "수정" }).click();
  await ownAnswer.locator("textarea").fill("QA 수정 답변");
  await ownAnswer.getByRole("button", { name: "저장" }).click();
  note("답변 작성자가 답변을 수정한다", await ownAnswer.getByText("QA 수정 답변").isVisible());
  await ownAnswer.getByRole("button", { name: "삭제" }).click();
  note("답변 작성자가 답변을 삭제한다", !(await page.getByText("QA 수정 답변").isVisible()));
  await page.locator(".question-body").getByRole("button", { name: "삭제" }).click();
  note("질문 작성자가 질문을 삭제한다", !(await page.locator(".detail-modal").isVisible()));

  await page.locator(".filter-tabs button").filter({ hasText: "모든 막힘" }).click();
  await page.locator(".question-row").filter({ hasText: "API 응답은 오는데" }).click();
  const sampleAnswer = page.locator(".answer-card").first();
  await sampleAnswer.getByRole("button", { name: "신고" }).click();
  const reports = await page.evaluate(() => JSON.parse(localStorage.getItem("skack-overflow-reports") || "[]"));
  note("신고 기록을 로컬에 남긴다", Array.isArray(reports) && reports.length === 1);
  await sampleAnswer.getByRole("button", { name: "차단" }).click();
  note("차단한 사용자 답변을 즉시 숨긴다", (await page.locator(".answer-card").count()) === 0);
  await page.locator(".modal-close").click();
  const downloadPromise = page.waitForEvent("download");
  await page.locator(".data-tools").getByRole("button", { name: "내보내기" }).click();
  const download = await downloadPromise;
  note("로컬 기록을 JSON으로 내보낸다", download.suggestedFilename() === "skack-overflow-local-data.json");
  const previousUid = await page.evaluate(() => localStorage.getItem("skack-overflow-anon-uid"));
  await page.locator(".data-tools").getByRole("button", { name: "초기화" }).click();
  note("로컬 기록 초기화가 새 익명 UID를 만든다", previousUid !== await page.evaluate(() => localStorage.getItem("skack-overflow-anon-uid")));
  note("로컬 기록 초기화가 작성 질문을 제거한다", (await page.locator(".question-row").filter({ hasText: "QA 수정 질문" }).count()) === 0);
} finally {
  await browser.close();
}

if (checks.some((check) => !check.passed)) process.exitCode = 1;
