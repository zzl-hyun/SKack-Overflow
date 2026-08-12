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

  const actionHeading = await page.getByRole("heading", { name: "방금 들었는데, 이제 뭘 먼저 해보지?" }).boundingBox();
  const helpHeading = await page.getByRole("heading", { name: /지금 도움이/ }).boundingBox();
  await check(Boolean(actionHeading && helpHeading && Math.abs(actionHeading.y - helpHeading.y) < 20), "메인 최상단에서 다음 행동과 도움 요청을 동등하게 우선 배치");

  await page.getByRole("button", { name: "과제 중" }).click();
  await check(await page.getByText("제출은 해야 하는데, 이게 맞나 싶어.").isVisible(), "과제 중 모드 전환");
  await page.locator(".main-action-list button").first().click();
  await check(await page.getByText("좋아요. 다음 한 번도 정해볼까요?").isVisible(), "다음 행동 완료 토글");

  await page.getByRole("button", { name: /도움 요청/ }).click();
  await page.getByRole("button", { name: "요청 남기기" }).click();
  await check(await page.getByText("막힌 장면을 한 줄로만 적어주세요.").isVisible(), "빈 도움 요청 방어");
  await page.locator(".request-modal input").fill("검증용: 목록 조회까진 됐는데 다음 범위를 못 정하겠어요.");
  await page.locator(".request-modal textarea").fill("목록 조회 화면을 먼저 만들어뒀어요.");
  await page.getByRole("button", { name: "요청 남기기" }).click();
  await check(await page.getByText("요청을 남겼어요. 이 브라우저에서는 요청자로 계속 보여요.").isVisible(), "익명 도움 요청 작성");

  await page.getByRole("button", { name: /검증용: 목록 조회까진/ }).click();
  await check(await page.getByText("요청자 나").isVisible(), "글 단위 요청자 UID 식별");
  await page.locator(".thread-modal textarea").fill("댓글 검증: 목록 조회 범위부터 먼저 마무리해볼게요.");
  await page.getByRole("button", { name: "댓글 남기기" }).click();
  await check(await page.getByText("댓글 검증: 목록 조회 범위부터 먼저 마무리해볼게요.").isVisible(), "댓글 작성");

  await page.getByRole("button", { name: "답글" }).click();
  await check(await page.getByText(/님에게 답글/).isVisible(), "댓글 답글 작성 상태 진입");
  await page.locator(".thread-modal textarea").fill("답글 검증: 그 순서로 해보고 다시 남길게요.");
  await page.getByRole("button", { name: "답글 남기기" }).click();
  await check(await page.getByText("답글 검증: 그 순서로 해보고 다시 남길게요.").isVisible(), "댓글의 답글 작성");

  await page.reload({ waitUntil: "networkidle" });
  const uidAfterReload = await page.evaluate(() => localStorage.getItem("skala-ops-anon-uid"));
  await check(uid === uidAfterReload, "새로고침 후 익명 UID 유지");
  await page.getByRole("button", { name: "과제 중" }).click();
  await page.getByRole("button", { name: /검증용: 목록 조회까진/ }).click();
  await check(await page.getByText("댓글 검증: 목록 조회 범위부터 먼저 마무리해볼게요.").isVisible(), "새로고침 후 댓글 복원");
  await check(await page.getByText("답글 검증: 그 순서로 해보고 다시 남길게요.").isVisible(), "새로고침 후 답글 복원");
  await page.getByRole("button", { name: "다시 해볼게요" }).click();
  await check(await page.getByText("좋아요. 한 번 더 해보고, 같은 글에서 다시 이어가면 돼요.").isVisible(), "다시 시도 상태 전환");
  await check(errors.length === 0, `브라우저 런타임 오류 없음 (${errors.join(" | ")})`);
} finally { await browser.close(); }
