import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const mark = await page.locator(".skack-logo").evaluate((logo) => {
    const wordmark = logo.querySelector(".sk-wordmark");
    const overflow = logo.querySelector("strong");
    if (!wordmark || !overflow) throw new Error("워드마크 요소를 찾을 수 없습니다.");
    const skack = getComputedStyle(wordmark);
    const overflowStyle = getComputedStyle(overflow);
    return {
      wordmarkColor: skack.color,
      overflowColor: overflowStyle.color,
      wordmarkFontFamily: skack.fontFamily,
      overflowFontFamily: overflowStyle.fontFamily,
      wordmarkFontWeight: skack.fontWeight,
      overflowFontWeight: overflowStyle.fontWeight,
      wordmarkLetterSpacing: skack.letterSpacing,
      overflowLetterSpacing: overflowStyle.letterSpacing,
    };
  });

  await check(mark.wordmarkColor === "rgb(230, 56, 77)" && mark.overflowColor === mark.wordmarkColor, "SKACK과 Overflow 워드마크가 동일한 SK 레드를 사용한다");
  await check(mark.wordmarkFontFamily.includes("IBM Plex Mono") && mark.overflowFontFamily === mark.wordmarkFontFamily, "SKACK과 Overflow 워드마크가 동일한 IBM Plex Mono 글꼴을 사용한다");
  await check(mark.wordmarkFontWeight === "700" && mark.overflowFontWeight === mark.wordmarkFontWeight, "SKACK과 Overflow 워드마크의 굵기가 동일하다");
  await check(mark.wordmarkLetterSpacing === mark.overflowLetterSpacing, "SKACK과 Overflow 워드마크의 자간이 동일하다");
  const colorRoles = await page.evaluate(() => ({
    nextPerspective: getComputedStyle(document.querySelector(".hero-copy h1 em")).color,
    primaryAction: getComputedStyle(document.querySelector(".top-actions > button:last-child")).backgroundColor,
  }));
  await check(colorRoles.nextPerspective === "rgb(46, 118, 116)", "‘다음 관점’은 teal 연결 신호를 사용한다");
  await check(colorRoles.primaryAction === "rgb(232, 102, 61)", "‘막힘 남기기’ 행동은 Signal Orange를 사용한다");
} finally {
  await browser.close();
}
