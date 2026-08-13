import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
const findings = [];
const finding = (label, present) => { findings.push({ label, present }); console.log(`${present ? "GAP" : "PASS"} · ${label}`); };
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const malformed = { uid: "sk-import", questions: [{ id: 998, ownerUid: "sk-import", title: "중첩 JSON QA 질문", body: "가져오기 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, answers: [{}] }] };
  await page.locator('input[type="file"]').setInputFiles({ name: "malformed.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(malformed)) });
  await page.getByText("SKACK 기록 JSON 파일만 가져올 수 있어요.").waitFor();
  finding("중첩 답변 구조가 깨진 JSON을 거부하지 못한다", (await page.locator(".question-row").filter({ hasText: "중첩 JSON QA 질문" }).count()) > 0 || errors.length > 0);
} finally {
  await browser.close();
}

console.log(JSON.stringify({ findings, errors }));
