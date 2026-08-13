import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/chromium" });
const context = await browser.newContext();
const page = await context.newPage();
const findings = [];
const finding = (label, present) => { if (present) throw new Error(`QA 결함 재현: ${label}`); findings.push({ label, present }); console.log(`PASS · 결함 재현 없음 — ${label}`); };
try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const seed = { uid: "sk-read", blockedUids: [], readAnswerCounts: { "120": 1 }, questions: [{ id: 120, ownerUid: "sk-read", title: "읽음 상태 이관 질문", body: "읽음 상태 이관 검증", tags: ["qa"], course: "QA", mode: "강의 끝", createdAt: "방금", views: 0, votes: 0, voters: [], answers: [] }] };
  await page.locator('input[type="file"]').setInputFiles({ name: "skack-overflow-local-data.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(seed)) });
  await page.locator(".confirmation-toast").getByRole("button", { name: "가져오기" }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("skack-overflow-read-answers") || "{}")["120"] === 1);

  const downloadPromise = page.waitForEvent("download");
  await page.locator(".data-tools").getByRole("button", { name: "내보내기" }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const exportedBuffer = Buffer.concat(chunks);
  const payload = JSON.parse(exportedBuffer.toString("utf8"));
  finding("내보낸 기록에 읽음 상태가 포함되지 않는다", !(payload.readAnswerCounts?.["120"] === 1));

  await page.evaluate(() => localStorage.removeItem("skack-overflow-read-answers"));
  await page.reload({ waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles({ name: "skack-overflow-local-data.json", mimeType: "application/json", buffer: exportedBuffer });
  await page.locator(".confirmation-toast").getByRole("button", { name: "가져오기" }).click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("skack-overflow-read-answers") || "{}")["120"] === 1);
  finding("가져온 기록이 읽음 상태를 복원하지 못한다", await page.evaluate(() => JSON.parse(localStorage.getItem("skack-overflow-read-answers") || "{}")["120"] !== 1));
} finally {
  await browser.close();
}

console.log(JSON.stringify(findings));
