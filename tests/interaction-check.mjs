import { chromium } from "playwright";

const baseURL = "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()} @ ${message.location().url}`); });
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };
const openTestRequest = async () => { await page.getByRole("button", { name: "과제 중" }).click(); await page.getByRole("button", { name: /권한 검증용: 목록 조회까진/ }).click(); };

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const ownerUid = await page.evaluate(() => localStorage.getItem("skala-ops-anon-uid"));
  await check(Boolean(ownerUid?.startsWith("sk-")), "요청자 임시 UID 생성");

  await page.getByRole("button", { name: "과제 중" }).click();
  await page.getByRole("button", { name: /도움 요청/ }).click();
  await page.locator(".request-modal input").fill("권한 검증용: 목록 조회까진 됐는데 다음 범위를 못 정하겠어요.");
  await page.locator(".request-modal textarea").fill("목록 조회 화면을 먼저 만들어뒀어요.");
  await page.getByRole("button", { name: "요청 남기기" }).click();
  await page.getByRole("button", { name: /권한 검증용: 목록 조회까진/ }).click();
  await check(await page.getByText("요청자 나").isVisible(), "글쓴이를 요청자 UID로 식별");
  await check(await page.getByRole("button", { name: "다시 해볼게요" }).isVisible(), "요청자에게 다시 해볼게요 버튼 표시");
  await check(await page.getByRole("button", { name: "해결 완료" }).isVisible(), "요청자에게 해결 완료 버튼 표시");

  await page.locator(".thread-modal textarea").fill("요청자 댓글: 목록 조회 범위부터 해볼게요.");
  await page.getByRole("button", { name: "댓글 남기기" }).click();
  await check(await page.getByText("요청자 댓글: 목록 조회 범위부터 해볼게요.").isVisible(), "요청자 댓글 작성");

  await page.evaluate(() => localStorage.setItem("skala-ops-anon-uid", "sk-peer-e2e"));
  await page.reload({ waitUntil: "networkidle" });
  await openTestRequest();
  await check(await page.getByText("동료는 댓글과 답글로만 도울 수 있어요. 상태 전환은 글쓴이에게만 보여요.").isVisible(), "동료 권한 안내 표시");
  await check(await page.getByRole("button", { name: "다시 해볼게요" }).count() === 0, "동료에게 다시 해볼게요 버튼 미노출");
  await check(await page.getByRole("button", { name: "해결 완료" }).count() === 0, "동료에게 해결 완료 버튼 미노출");
  await page.locator(".thread-modal textarea").fill("동료 댓글: 목록 조회만 먼저 마무리해보는 건 어때요?");
  await page.getByRole("button", { name: "댓글 남기기" }).click();
  await check(await page.getByText("동료 댓글: 목록 조회만 먼저 마무리해보는 건 어때요?").isVisible(), "동료는 댓글 작성 가능");

  await page.evaluate((uid) => localStorage.setItem("skala-ops-anon-uid", uid), ownerUid);
  await page.reload({ waitUntil: "networkidle" });
  await openTestRequest();
  await check(await page.getByRole("button", { name: "해결 완료" }).isVisible(), "원래 요청자 UID로 복귀 시 해결 완료 권한 복원");
  await page.getByRole("button", { name: "해결 완료" }).click();
  await check(await page.getByText("해결 완료로 남겼어요. 고생했어요.").isVisible(), "요청자의 해결 완료 상태 전환");
  await page.reload({ waitUntil: "networkidle" });
  await openTestRequest();
  await check(await page.getByText("동료 댓글: 목록 조회만 먼저 마무리해보는 건 어때요?").isVisible(), "다른 UID의 댓글도 새로고침 뒤 유지");
  await check(await page.getByText("해결 완료").count() > 0, "해결 완료 상태 저장 복원");
  await check(errors.length === 0, `브라우저 런타임 오류 없음 (${errors.join(" | ")})`);
} finally { await browser.close(); }
