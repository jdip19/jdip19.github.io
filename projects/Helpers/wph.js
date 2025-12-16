const puppeteer = require("puppeteer-core");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: "C:/Program Files/Zoho/Ulaa/Application/ulaa.exe",

    // 👇 USE REAL PROFILE
    userDataDir: "C:/Users/user/AppData/Local/Zoho/Ulaa/User Data",
    args: ["--profile-directory=Default"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com");

  console.log("Waiting for WhatsApp to be ready...");

  await page.waitForSelector(
    '[aria-label="Chat list"], [data-testid="chat-list"], canvas',
    { timeout: 0 }
  );

  console.log("WhatsApp ready ✅");

  const GROUP_NAME = "Jay Khodiyar Genaral Store";
  const MESSAGE = "Aa ben ne gami";
  const VIDEO_PATH = "C:/Users/user/Downloads/bday.mp4";

  await page.waitForSelector('[contenteditable="true"]');
  await page.type('[contenteditable="true"]', GROUP_NAME);

  await delay(3000);
  await page.keyboard.press("Enter");

  const attachBtnSelector =
    'button[aria-label="Attach"], span[data-testid="clip"]';

  await page.waitForSelector(attachBtnSelector, { visible: true });
  await page.click(attachBtnSelector);

  // Upload video
  const input = await page.waitForSelector('input[type="file"]');
  await input.uploadFile(VIDEO_PATH);

  // Wait for upload preview to appear
  await delay(4000);

  // Type message safely
  const captionBoxSelector =
    'div[contenteditable="true"][role="textbox"][aria-label="Type a message"]';

  // Focus and type caption
  await page.waitForSelector(captionBoxSelector, { visible: true });
  await page.click(captionBoxSelector);
  await page.keyboard.type(MESSAGE, { delay: 50 });

  // Wait for video processing
  await delay(5000);

  // Media send button
  const mediaSendBtnSelector =
    'span[data-testid="send"], button[aria-label="Send"]';

  await page.waitForSelector(mediaSendBtnSelector, { visible: true });
  await page.click(mediaSendBtnSelector);

  console.log("Message sent ✅");
})();
