import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { findings.push({ label, present }); console.log(`${present ? "GAP" : "PASS"} · ${label}`); };

try {
  const owner = "sk-qaowner";
  const peer = "sk-qapeer";
  const title = "읽음 상태 QA 질문";
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(({ owner }) => { localStorage.clear(); localStorage.setItem("skack-overflow-anon-uid", owner); }, { owner });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".top-actions button").last().click();
  await page.locator(".ask-modal input").first().fill(title);
  await page.locator(".ask-modal textarea").fill("읽음 상태 검증용 질문입니다.");
  await page.getByRole("button", { name: "질문 올리기" }).click();
  await page.evaluate(({ peer }) => localStorage.setItem("skack-overflow-anon-uid", peer), { peer });
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".question-row").filter({ hasText: title }).click();
  await page.locator(".answer-form textarea").fill("읽음 상태 QA 답변");
  await page.getByRole("button", { name: "답변 남기기" }).click();
  await page.locator(".modal-close").click();
  await page.evaluate(({ owner }) => localStorage.setItem("skack-overflow-anon-uid", owner), { owner });
  await page.reload({ waitUntil: "networkidle" });
  const alertBeforeOpen = await page.locator(".incoming-chip").count() > 0;
  await page.locator(".question-row").filter({ hasText: title }).click();
  await page.locator(".modal-close").click();
  const alertAfterOpen = await page.locator(".incoming-chip").count() > 0;
  finding("내 질문을 열어도 새 답변 알림이 읽음 처리되지 않는다", alertBeforeOpen && alertAfterOpen);
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
