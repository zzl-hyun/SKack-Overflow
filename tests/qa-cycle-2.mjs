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
  await page.locator(".question-row").first().click();
  finding("상세 모달이 열릴 때 포커스가 모달 내부로 이동하지 않는다", !(await page.evaluate(() => Boolean(document.activeElement?.closest(".detail-modal")))));
  await page.goBack({ waitUntil: "networkidle" });
  finding("브라우저 뒤로가기가 상세 모달 상태를 닫지 않는다", await page.locator(".detail-modal").isVisible());
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
