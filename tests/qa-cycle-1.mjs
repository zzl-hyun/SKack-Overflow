import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { findings.push({ label, present }); console.log(`${present ? "GAP" : "PASS"} · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await page.locator(".question-row").filter({ hasText: "API 응답은 오는데" }).click();
  const beforeQuestionVote = await page.locator(".vote-stack strong").textContent();
  await page.locator(".vote-stack button").first().click();
  const afterQuestionVote = await page.locator(".vote-stack strong").textContent();
  finding("질문 공감 버튼이 상태를 변경하지 않는다", beforeQuestionVote === afterQuestionVote);

  await page.locator(".modal-close").click();
  const savedViews = await page.evaluate(() => { const saved = JSON.parse(localStorage.getItem("skack-overflow-questions") || "[]"); return saved.find((question) => question.id === 120)?.views; });
  finding("질문 조회 수가 목록 저장 상태에 반영되지 않는다", savedViews === 14);

  await page.goto("http://127.0.0.1:3000/#q-120", { waitUntil: "networkidle" });
  finding("질문 해시 링크로 상세 화면을 직접 열 수 없다", !(await page.locator(".detail-modal").isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
