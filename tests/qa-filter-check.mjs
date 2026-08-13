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
  finding("상단 탐색에 힌트 도착·내 막힘 필터가 없다", (await nav.getByRole("button").count()) !== 4);

  const helpButton = page.locator(".filter-tabs").getByRole("button", { name: /도움 필요/ });
  await helpButton.click();
  const helpRows = page.locator(".question-row");
  const helpCount = await helpRows.count();
  const helpBadge = Number((await helpButton.locator("small").textContent()) || "0");
  finding("도움 필요 카운트와 실제 목록 수가 다르다", helpCount !== helpBadge);
  finding("도움 필요 목록에 힌트가 있는 질문이 섞인다", await helpRows.evaluateAll((rows) => rows.some((row) => !row.textContent?.includes("도움 신호 대기"))));

  await page.locator(".filter-tabs").getByRole("button", { name: "힌트 도착" }).click();
  finding("힌트 도착 목록에 힌트 없는 질문이 섞인다", await page.locator(".question-row").evaluateAll((rows) => rows.some((row) => !row.textContent?.includes("힌트 도착") && !row.textContent?.includes("다음 관점 선택"))));

  await page.locator(".top-actions button").last().click();
  await page.locator(".ask-modal input").first().fill("필터 내 막힘 QA 질문");
  await page.locator(".ask-modal textarea").fill("내 질문 필터 검증");
  await page.locator(".ask-modal").getByRole("button", { name: "막힘 남기기" }).click();
  await nav.getByRole("button", { name: "내 막힘" }).click();
  finding("내 막힘 필터가 작성한 질문을 표시하지 못한다", !(await page.locator(".question-row").filter({ hasText: "필터 내 막힘 QA 질문" }).isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
