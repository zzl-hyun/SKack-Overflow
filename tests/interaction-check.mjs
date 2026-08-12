import { chromium } from "playwright";

const baseURL = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()} @ ${message.location().url}`); });

const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  const uid = await page.evaluate(() => localStorage.getItem("skala-ops-anon-uid"));
  await check(Boolean(uid?.startsWith("sk-")), "브라우저별 임시 익명 UID 생성");

  await page.getByRole("button", { name: "과제 중" }).click();
  await check(await page.getByText("제출은 해야 하는데, 이게 맞나 싶어.").isVisible(), "과제 중 모드 전환");

  await page.locator(".action-list button").first().click();
  await check(await page.getByText("1/3 오늘 해둔 것").isVisible(), "다음 행동 완료 토글");

  await page.getByRole("button", { name: /도움 요청/ }).click();
  await page.locator(".request-modal input").fill("검증용: 목록 조회까진 되는데 다음 범위를 못 정하겠어요.");
  await page.locator(".request-modal textarea").fill("목록 조회 화면을 먼저 만들어뒀어요.");
  await page.getByRole("button", { name: "이거 좀 봐줄래요" }).click();
  await check(await page.getByText("요청을 남겼어요. 이 브라우저에서는 요청자로 계속 표시돼요.").isVisible(), "익명 도움 요청 작성");

  await page.getByRole("button", { name: /검증용: 목록 조회까진/ }).click();
  await check(await page.getByText("요청자 나").isVisible(), "글 단위 요청자 UID 식별");
  await page.locator(".detail-modal textarea").fill("진행 상황: 목록 조회까지만 먼저 마무리해볼게요.");
  await page.getByRole("button", { name: "진행 상황 남기기" }).click();
  await check(await page.getByText("진행 상황: 목록 조회까지만 먼저 마무리해볼게요.").isVisible(), "글 단위 대화 메시지 작성");

  await page.reload({ waitUntil: "networkidle" });
  const persistedUid = await page.evaluate(() => localStorage.getItem("skala-ops-anon-uid"));
  await check(uid === persistedUid, "새로고침 후 익명 UID 유지");
  await page.getByRole("button", { name: "과제 중" }).click();
  await page.getByRole("button", { name: /검증용: 목록 조회까진/ }).click();
  await check(await page.getByText("진행 상황: 목록 조회까지만 먼저 마무리해볼게요.").isVisible(), "새로고침 후 글 단위 대화 복원");

  await page.getByRole("button", { name: /오케이, 다시 해볼게요/ }).click();
  await check(await page.getByText("좋아요. 다음 한 번 해보고, 안 되면 같은 글에서 다시 이어가면 돼요.").isVisible(), "다시 시도 상태 전환");
  await check(errors.length === 0, `브라우저 런타임 오류 없음 (${errors.join(" | ")})`);
} finally {
  await browser.close();
}
