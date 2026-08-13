import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const first = await context.newPage();
const second = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  await Promise.all([first.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" }), second.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" })]);
  await first.evaluate(() => localStorage.setItem("skack-overflow-blocked-uids", JSON.stringify(["demo-b91"])));
  await second.waitForTimeout(150);
  await second.locator(".question-row").filter({ hasText: "API 응답은 오는데" }).click();
  finding("다른 탭에서 차단한 사용자 답변이 현재 탭에 남는다", await second.getByText("응답 자체보다 setState가 실제로 호출되는지부터 보세요.").isVisible());
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
