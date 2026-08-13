import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };

try {
  let confirmation = "";
  page.on("dialog", async (dialog) => { confirmation = dialog.message(); await dialog.accept(); });
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const payload = { uid: "sk-import", questions: [{ id: 997, ownerUid: "sk-import", title: "가져온 교체 질문", body: "기록 교체 경고 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, answers: [] }] };
  await page.locator('input[type="file"]').setInputFiles({ name: "replace.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
  await page.locator(".question-row").filter({ hasText: "가져온 교체 질문" }).waitFor();
  finding("기록 가져오기 전에 기존 기록 교체 확인을 요청하지 않는다", confirmation.length === 0);
  finding("가져오기 확인 뒤 유효한 기록을 반영하지 못한다", !(await page.locator(".question-row").filter({ hasText: "가져온 교체 질문" }).isVisible()));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
