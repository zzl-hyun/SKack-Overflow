import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.setItem("skack-overflow-blocked-uids", JSON.stringify(["peer-old"])));
  await page.reload({ waitUntil: "networkidle" });
  const legacyPayload = { uid: "sk-import", questions: [{ id: 996, ownerUid: "sk-import", title: "차단 상태 이관 질문", body: "차단 상태 이관 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, answers: [{ id: "answer-legacy", uid: "peer-old", body: "가져온 답변", createdAt: "방금", votes: 0, voters: [], comments: [] }] }] };
  await page.locator('input[type="file"]').setInputFiles({ name: "legacy.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(legacyPayload)) });
  await page.locator(".question-row").filter({ hasText: "차단 상태 이관 질문" }).click();
  await page.waitForTimeout(100);
  finding("가져온 기록에 차단 목록이 없을 때 이전 차단 상태가 남는다", !(await page.getByText("가져온 답변").isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
