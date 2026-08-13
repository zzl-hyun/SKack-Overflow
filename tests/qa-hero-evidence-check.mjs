import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const evidence = page.locator(".hero-evidence button").first();
  await check(await evidence.count() === 1, "히어로에 최근 힌트 관찰 기록이 표시된다");
  const title = (await evidence.locator("strong").innerText()).trim();
  await evidence.click();
  await check(await page.locator(".detail-modal").isVisible(), "히어로 관찰 기록에서 해당 막힘 상세를 연다");
  await page.locator(".question-body").getByRole("button", { name: "차단" }).click();
  await page.waitForFunction((questionTitle) => ![...document.querySelectorAll(".hero-evidence button")].some((button) => button.textContent?.includes(questionTitle)), title);
  await check((await page.locator(".hero-evidence button").filter({ hasText: title }).count()) === 0, "차단한 작성자의 힌트 관찰 기록을 즉시 숨긴다");
} finally {
  await browser.close();
}
