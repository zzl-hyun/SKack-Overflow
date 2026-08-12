import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()} @ ${message.location().url}`); });
const check = async (condition, label) => { if (!condition) throw new Error(`검증 실패: ${label}`); console.log(`PASS · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  const uid = await page.evaluate(() => localStorage.getItem("skala-ops-anon-uid"));
  await check(Boolean(uid?.startsWith("sk-")), "브라우저별 임시 익명 UID 생성");
  await check(await page.getByText("12개의 막힘").isVisible(), "메인에 충분한 요청 밀도 표시");
  await check(await page.locator(".relay-card").count() === 12, "초기 요청 피드 12개 표시");

  await page.locator(".filter-row button").filter({ hasText: "도움 필요" }).click();
  await check(await page.locator(".relay-card.도움-필요").count() === 6, "도움 필요 필터");
  await page.locator(".filter-row button").filter({ hasText: "힌트 도착" }).click();
  await check(await page.locator(".relay-card.힌트-도착").count() === 3, "힌트 도착 필터");
  await page.getByRole("button", { name: "전체" }).click();
  await page.getByPlaceholder("기술, 과목, 막힌 장면 검색").fill("RAG");
  await check(await page.getByText("검색 결과는 있는데 답변이 왜 문서 밖으로 나갈까요?").isVisible(), "기술·문장 검색");
  await check(await page.locator(".relay-card").count() === 1, "검색 결과 수 축소");
  await page.getByPlaceholder("기술, 과목, 막힌 장면 검색").fill("");
  await page.getByRole("button", { name: "전체" }).click();

  await page.getByRole("button", { name: /요청 올리기/ }).click();
  await page.locator(".request-modal input").fill("피드 검증용: 목록 조회까진 됐는데 다음 범위를 못 정하겠어요.");
  await page.locator(".request-modal textarea").fill("목록 조회 화면을 먼저 만들어뒀어요.");
  await page.getByRole("button", { name: "요청 올리기" }).last().click();
  await check(await page.getByText("요청을 올렸어요. 내 요청 필터에서 바로 다시 볼 수 있어요.").isVisible(), "새 요청 작성과 내 요청 이동");
  await check(await page.locator(".relay-card").count() === 1, "내 요청 필터 결과");
  await page.locator(".request-feed .relay-card").filter({ hasText: "피드 검증용" }).click();
  await page.locator(".thread-modal textarea").fill("댓글 검증: 목록 조회 범위부터 먼저 마무리해볼게요.");
  await page.getByRole("button", { name: "댓글 남기기" }).click();
  await page.getByRole("button", { name: "답글" }).click();
  await page.locator(".thread-modal textarea").fill("답글 검증: 그 순서로 해보고 다시 남길게요.");
  await page.getByRole("button", { name: "답글 남기기" }).click();
  await check(await page.getByText("답글 검증: 그 순서로 해보고 다시 남길게요.").isVisible(), "글 단위 댓글과 답글 작성");
  await page.getByRole("button", { name: "해결 완료" }).click();
  await check(await page.getByText("해결 완료로 남겼어요. 고생했어요.").isVisible(), "요청자 해결 완료 권한");
  await page.locator(".thread-modal .close").click();

  await page.getByRole("button", { name: "전체" }).click();
  await page.getByRole("button", { name: "댓글 많은 순" }).click();
  const firstRequest = await page.locator(".relay-card h2").first().textContent();
  await check(firstRequest?.includes("피드 검증용"), "댓글 많은 순 정렬");
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".filter-row button").filter({ hasText: "내 요청" }).click();
  await page.locator(".request-feed .relay-card").filter({ hasText: "피드 검증용" }).click();
  await check(await page.getByText("답글 검증: 그 순서로 해보고 다시 남길게요.").isVisible(), "요청·댓글·답글 새로고침 복원");
  await check(errors.length === 0, `브라우저 런타임 오류 없음 (${errors.join(" | ")})`);
} finally { await browser.close(); }
