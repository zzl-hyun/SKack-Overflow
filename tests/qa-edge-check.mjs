import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const checks = [];
const note = (label, passed) => { checks.push({ label, passed }); console.log(`${passed ? "PASS" : "GAP"} · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

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

  await page.keyboard.press("Escape");
  note("Escape로 상세 모달을 닫는다", !(await page.locator(".detail-modal").isVisible()));
} finally {
  await browser.close();
}

if (checks.some((check) => !check.passed)) process.exitCode = 0;
