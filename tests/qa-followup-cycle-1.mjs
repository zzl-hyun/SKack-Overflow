import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".top-actions button").last().click();
  await page.locator(".ask-modal input").first().fill("삭제 해시 QA 질문");
  await page.locator(".ask-modal textarea").fill("삭제 뒤 주소 상태를 검증합니다.");
  await page.locator(".ask-modal").getByRole("button", { name: "막힘 남기기" }).click();
  await page.locator(".question-row").filter({ hasText: "삭제 해시 QA 질문" }).click();
  await page.locator(".detail-modal").getByRole("button", { name: "삭제" }).click();
  finding("질문 삭제 뒤 상세 해시 주소가 남는다", await page.evaluate(() => window.location.hash.startsWith("#q-")));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
