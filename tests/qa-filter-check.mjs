import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  const nav = page.locator(".topbar nav");
  finding("상단 탐색에 답변 달린 글·내 질문 필터가 없다", (await nav.getByRole("button").count()) !== 4);

  const helpButton = page.locator(".filter-tabs").getByRole("button", { name: /답변 기다리는 글/ });
  await helpButton.click();
  const helpRows = page.locator(".question-row");
  const helpCount = await helpRows.count();
  const helpBadge = Number((await helpButton.locator("small").textContent()) || "0");
  finding("답변 기다리는 글 카운트와 실제 목록 수가 다르다", helpCount !== helpBadge);
  finding("답변 기다리는 글 목록에 답변이 있는 질문이 섞인다", await helpRows.evaluateAll((rows) => rows.some((row) => !row.textContent?.includes("답변 기다리는 중"))));

  await page.locator(".filter-tabs").getByRole("button", { name: "답변 달린 글" }).click();
  finding("답변 달린 글 목록에 답변 없는 질문이 섞인다", await page.locator(".question-row").evaluateAll((rows) => rows.some((row) => !row.textContent?.includes("답변 달림") && !row.textContent?.includes("해결됨"))));

  await page.locator(".top-actions button").last().click();
  await page.locator(".ask-modal input").first().fill("필터 내 질문 QA 질문");
  await page.locator(".ask-modal textarea").fill("내 질문 필터 검증");
  await page.locator(".ask-modal").getByRole("button", { name: "질문 올리기" }).click();
  await nav.getByRole("button", { name: "내 질문" }).click();
  finding("내 질문 필터가 작성한 질문을 표시하지 못한다", !(await page.locator(".question-row").filter({ hasText: "필터 내 질문 QA 질문" }).isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
