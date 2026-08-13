import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000/#q-120", { waitUntil: "networkidle" });
  finding("상세 화면에 공유 링크 복사 제어가 없다", (await page.getByRole("button", { name: "링크 복사" }).count()) === 0);
  finding("해시 링크가 상세 화면을 연다", !(await page.locator(".detail-modal").isVisible()));
  await page.getByRole("button", { name: "링크 복사" }).click();
  finding("링크 복사 동작에 피드백이 없다", !(await page.getByText("질문 링크를 복사했어요.").isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
