import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const standardContext = await browser.newContext();
const standardPage = await standardContext.newPage();
const reducedContext = await browser.newContext({ reducedMotion: "reduce" });
const reducedPage = await reducedContext.newPage();
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await standardPage.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const phrase = standardPage.locator(".hero-phrase");
  await check((await phrase.innerText()).includes("막히면") && (await phrase.innerText()).includes("SKack."), "첫 번째 SKack 캐치프레이즈를 표시한다");
  await standardPage.waitForFunction(() => document.querySelector(".hero-phrase")?.textContent?.includes("혼자 끙끙 말고") === true, undefined, { timeout: 5000 });
  await check((await phrase.innerText()).includes("혼자 끙끙 말고"), "두 번째 SKack 캐치프레이즈로 순환한다");
  await standardPage.waitForFunction(() => document.querySelector(".hero-phrase")?.textContent?.includes("아는 건 나누고") === true, undefined, { timeout: 5000 });
  await check((await phrase.innerText()).includes("아는 건 나누고") && (await phrase.innerText()).includes("모르는 건"), "세 번째 SKack 캐치프레이즈로 순환한다");

  await reducedPage.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const reducedPhrase = reducedPage.locator(".hero-phrase");
  const firstPhrase = await reducedPhrase.innerText();
  await reducedPage.waitForTimeout(3900);
  await check((await reducedPhrase.innerText()) === firstPhrase && firstPhrase.includes("막히면"), "모션 감소 환경에서는 첫 캐치프레이즈를 고정한다");
} finally {
  await browser.close();
}
