import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { findings.push({ label, present }); console.log(`${present ? "GAP" : "PASS"} · ${label}`); };

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  finding("브라우저 기록을 가져올 파일 제어가 없다", (await page.locator('input[type="file"]').count()) === 0);
  const payload = { uid: "sk-imported", blockedUids: ["demo-b91"], questions: [{ id: 999, ownerUid: "sk-imported", title: "가져온 QA 질문", body: "JSON 가져오기 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, votes: 0, voters: [], answers: [] }] };
  await page.locator('input[type="file"]').setInputFiles({ name: "skack-overflow-local-data.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(payload)) });
  finding("유효한 기록 JSON을 질문 목록에 반영하지 못한다", !(await page.locator(".question-row").filter({ hasText: "가져온 QA 질문" }).isVisible()));
  finding("가져온 익명 UID를 복원하지 못한다", await page.evaluate(() => localStorage.getItem("skack-overflow-anon-uid")) !== "sk-imported");
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
