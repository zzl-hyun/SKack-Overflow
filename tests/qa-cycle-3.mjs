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
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.resolve() } }); });
  await page.getByRole("button", { name: "링크 복사" }).click();
  finding("링크 복사 동작에 피드백이 없다", !(await page.getByText("질문 링크를 복사했어요.").isVisible()));
  await page.evaluate(() => { document.documentElement.dataset.copyFallback = "pending"; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("clipboard denied")) } }); document.execCommand = () => { document.documentElement.dataset.copyFallback = "called"; return true; }; });
  await page.getByRole("button", { name: "링크 복사" }).click();
  await page.waitForFunction(() => document.documentElement.dataset.copyFallback === "called");
  finding("클립보드 거부 뒤 대체 복사가 실행되지 않는다", await page.locator("html").evaluate((element) => element.dataset.copyFallback !== "called"));
  await page.evaluate(() => { Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("clipboard denied")) } }); document.execCommand = () => { throw new Error("fallback denied"); }; });
  await page.getByRole("button", { name: "링크 복사" }).click();
  finding("모든 복사 경로 실패 뒤 직접 복사 안내가 없다", !(await page.getByText("링크를 직접 복사해주세요.").isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
