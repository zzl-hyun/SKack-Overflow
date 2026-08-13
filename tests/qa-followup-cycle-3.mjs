import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const first = await context.newPage();
const second = await context.newPage();
const findings = [];
const finding = (label, present) => { findings.push({ label, present }); console.log(`${present ? "GAP" : "PASS"} · ${label}`); };

try {
  first.on("dialog", (dialog) => dialog.accept());
  await Promise.all([first.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" }), second.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" })]);
  const importedUid = "sk-followup-import";
  const payload = { uid: importedUid, questions: [{ id: 995, ownerUid: importedUid, title: "UID 동기화 질문", body: "탭 간 UID 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, answers: [] }] };
  await first.locator('input[type="file"]').setInputFiles({ name: "uid.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
  await second.waitForTimeout(150);
  await second.locator(".top-actions button").last().click();
  await second.locator(".ask-modal input").first().fill("다른 탭 새 질문");
  await second.locator(".ask-modal textarea").fill("UID 동기화 뒤 작성 검증");
  await second.getByRole("button", { name: "질문 올리기" }).click();
  const ownerUid = await second.evaluate(() => JSON.parse(localStorage.getItem("skack-overflow-questions") || "[]").find((item) => item.title === "다른 탭 새 질문")?.ownerUid);
  finding("다른 탭에서 바뀐 익명 UID가 현재 탭 작성자에 반영되지 않는다", ownerUid !== importedUid);
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
