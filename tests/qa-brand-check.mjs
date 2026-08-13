import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium" });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const mark = await page.locator(".skack-logo").evaluate((logo) => {
    const image = logo.querySelector(".brand-logo-image");
    if (!(image instanceof HTMLImageElement)) throw new Error("손그림 로고 이미지를 찾을 수 없습니다.");
    const imageStyle = getComputedStyle(image);
    return {
      src: image.getAttribute("src"),
      alt: image.alt,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      width: imageStyle.width,
      height: imageStyle.height,
    };
  });

  await check(mark.src === "/skack-symbol.png" && mark.alt === "SKack Overflow", "헤더가 손그림 로고 이미지를 사용한다");
  await check(mark.naturalWidth > 0 && mark.naturalHeight > 0 && mark.naturalWidth / mark.naturalHeight > 3, "손그림 로고 이미지가 정상적으로 로드된다");
  await check(Number.parseFloat(mark.width) >= 120 && Number.parseFloat(mark.height) >= 30, "손그림 로고가 헤더에서 충분한 크기로 표시된다");
  const colorRoles = await page.evaluate(() => ({
    heroCatchphrase: getComputedStyle(document.querySelector(".hero-copy h1 em")).color,
    primaryAction: getComputedStyle(document.querySelector(".top-actions > button:last-child")).backgroundColor,
  }));
  await check(colorRoles.heroCatchphrase === "rgb(230, 56, 77)", "‘SKACK’ 캐치프레이즈는 SK 그룹 레드를 사용한다");
  await check(colorRoles.primaryAction === "rgb(230, 56, 77)", "‘질문 올리기’ 행동은 SK 그룹 레드를 사용한다");
} finally {
  await browser.close();
}
