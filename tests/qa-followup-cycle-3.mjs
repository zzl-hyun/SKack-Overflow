import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const first = await context.newPage();
const second = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  await Promise.all([first.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" }), second.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" })]);
  const importedUid = "sk-followup-import";
  const payload = { uid: importedUid, questions: [{ id: 995, ownerUid: importedUid, title: "UID 동기화 질문", body: "탭 간 UID 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, answers: [] }] };
  await first.locator('input[type="file"]').setInputFiles({ name: "uid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
  await first.locator(".confirmation-toast").getByRole("button", { name: "가져오기" }).click();
  await second.waitForTimeout(150);
  await second.locator(".top-actions button").last().click();
  await second.locator(".ask-modal input").first().fill("다른 탭 새 질문");
  await second.locator(".ask-modal textarea").fill("UID 동기화 뒤 작성 검증");
  await second.locator(".ask-modal").getByRole("button", { name: "막힘 남기기" }).click();
  const ownerUid = await second.evaluate(() => JSON.parse(localStorage.getItem("skack-overflow-questions") || "[]").find((item) => item.title === "다른 탭 새 질문")?.ownerUid);
  finding("다른 탭에서 바뀐 익명 UID가 현재 탭 작성자에 반영되지 않는다", ownerUid !== importedUid);
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
