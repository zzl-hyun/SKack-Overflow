import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
});
const context = await browser.newContext();
const page = await context.newPage({ viewport: { width: 1280, height: 900 } });
const check = (condition, label) => {
  if (!condition) throw new Error(`검증 실패: ${label}`);
  console.log(`PASS · ${label}`);
};

try {
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /질문 올리기/ }).first().click();
  await page.locator(".ask-modal input").first().fill("이미지 붙여넣기 검증 질문");

  const source = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2400;
    canvas.height = 1200;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("테스트 캔버스를 만들지 못했어요.");
    context.fillStyle = "#e6384d";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "bold 120px sans-serif";
    context.fillText("SKACK IMAGE", 120, 260);
    return canvas.toDataURL("image/png");
  });

  await page.evaluate(dataUrl => {
    const textarea = document.querySelector(".ask-modal textarea");
    if (!(textarea instanceof HTMLTextAreaElement))
      throw new Error("질문 본문 입력창을 찾지 못했어요.");
    const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), character =>
      character.charCodeAt(0)
    );
    const transfer = new DataTransfer();
    transfer.items.add(
      new File([bytes], "skack-paste.png", { type: "image/png" })
    );
    textarea.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData: transfer })
    );
  }, source);

  await page.waitForFunction(
    () => document.querySelectorAll(".ask-modal .image-attachments img").length === 1,
    undefined,
    { timeout: 10000 }
  );
  const imageInfo = await page
    .locator(".ask-modal .image-attachments img")
    .evaluate(image => ({
      width: image.naturalWidth,
      height: image.naturalHeight,
      srcLength: image.getAttribute("src")?.length || 0,
    }));
  check(
    imageInfo.width <= 1600 && imageInfo.height <= 1600,
    `클라이언트 이미지 해상도 축소 (${imageInfo.width}x${imageInfo.height})`
  );
  check(
    imageInfo.srcLength < 680000,
    `압축된 이미지 데이터 길이 제한 (${imageInfo.srcLength})`
  );

  await page
    .locator(".ask-modal textarea")
    .fill("브라우저에서 이미지를 붙여넣고 자동으로 줄이는지 확인합니다.");
  await page.getByRole("button", { name: "질문 올리기" }).last().click();
  check(
    await page
      .getByText("질문을 올렸어요. 답변이 달리면 여기에서 확인할 수 있어요.")
      .isVisible(),
    "이미지 포함 질문 등록"
  );
  await page
    .locator(".question-row")
    .filter({ hasText: "이미지 붙여넣기 검증 질문" })
    .click();
  check(
    (await page.locator(".detail-modal .question-body .image-attachments img").count()) ===
      1,
    "질문 상세 이미지 표시"
  );
  check(
    await page
      .locator(".detail-modal .question-body img")
      .evaluate(image => image.naturalWidth <= 1600),
    "상세 화면 축소 이미지 복원"
  );

  const pasteInto = async selector => {
    await page.evaluate(
      ({ dataUrl, selector }) => {
        const textarea = document.querySelector(selector);
        if (!(textarea instanceof HTMLTextAreaElement))
          throw new Error(`${selector} 입력창을 찾지 못했어요.`);
        const bytes = Uint8Array.from(atob(dataUrl.split(",")[1]), character =>
          character.charCodeAt(0)
        );
        const transfer = new DataTransfer();
        transfer.items.add(
          new File([bytes], "skack-paste.png", { type: "image/png" })
        );
        textarea.dispatchEvent(
          new ClipboardEvent("paste", {
            bubbles: true,
            clipboardData: transfer,
          })
        );
      },
      { dataUrl: source, selector }
    );
    await page.waitForFunction(
      selector => document.querySelectorAll(`${selector} ~ .image-attachments img`).length === 1,
      selector,
      { timeout: 10000 }
    );
  };

  await pasteInto(".answer-form textarea");
  await page.locator(".answer-form textarea").fill("이미지를 포함한 답변입니다.");
  await page.getByRole("button", { name: "답변 남기기" }).click();
  check(
    (await page.locator(".answer-content .image-attachments img").count()) === 1,
    "답변 이미지 표시"
  );

  await page.getByRole("button", { name: "댓글 쓰기" }).click();
  await pasteInto(".comment-box textarea");
  await page.locator(".comment-box textarea").fill("이미지를 포함한 댓글입니다.");
  await page.getByRole("button", { name: "댓글 등록" }).click();
  check(
    (await page.locator(".answer-comments .image-attachments img").count()) === 1,
    "댓글 이미지 표시"
  );

  await page.getByRole("button", { name: "답글" }).click();
  await pasteInto(".comment-box textarea");
  await page.locator(".comment-box textarea").fill("이미지를 포함한 답글입니다.");
  await page.getByRole("button", { name: "댓글 등록" }).click();
  check(
    (await page.locator(".comment-replies .image-attachments img").count()) === 1,
    "답글 이미지 표시"
  );
  console.log("PASS · 이미지 붙여넣기 전체 흐름");
} finally {
  await browser.close();
}
