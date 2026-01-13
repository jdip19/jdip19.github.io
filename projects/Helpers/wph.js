const puppeteer = require("puppeteer-core");

const delay = (ms) => new Promise(res => setTimeout(res, ms));
const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
    userDataDir:
      "C:/Users/jaydi/AppData/Local/BraveSoftware/Brave-Browser/User Data",
    args: ["--profile-directory=Profile 1"],
    defaultViewport: null,
  });

  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com");

  log("Waiting for WhatsApp...");
  await page.waitForSelector(
    '[aria-label="Chat list"], [data-testid="chat-list"]',
    { timeout: 0 }
  );

  // ==============================
  // CONFIG
  // ==============================
  const SOURCE_CHAT = "You"; // or your own number / chat name
  const TARGET_CHAT = "Mount";
  //const TARGET_CHAT = "Sista";

  // ==============================
  // STEP 1: Open source chat
  // ==============================
  log("Opening source chat...");
  await page.waitForSelector('[contenteditable="true"]');
  await page.type('[contenteditable="true"]', SOURCE_CHAT);
  await delay(2000);
  await page.keyboard.press("Enter");
  await delay(3000);

  log("Locating last outgoing message and forward button...");

  console.log("Opening last sent media...");

  const mediaOpened = await page.evaluate(() => {
    const msgs = document.querySelectorAll(".message-out");
    if (!msgs.length) return false;

    const lastMsg = msgs[msgs.length - 1];

    // Click media container inside message
    const media = lastMsg.querySelector('[role="button"]');
    if (media) {
      media.click();
      return true;
    }
    return false;
  });

  if (!mediaOpened) {
    console.log("❌ Could not open media");
    return;
  }

  await delay(1500);
  console.log("📂 Media viewer opened");


  console.log("Clicking top Forward button...");

  await page.waitForSelector('button[aria-label="Forward"]', {
    visible: true,
    timeout: 5000
  });

  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label="Forward"]');
    btn.click();
  });

  console.log("➡️ Forward button clicked");


  // ==============================
  // STEP 4: Select target chat
  // ==============================

  await delay(1200);

  // Search target chat
  const searchSelector =
    'div[contenteditable="true"][aria-label="Search name or number"]';

  await page.waitForSelector(searchSelector, { visible: true });
  await page.click(searchSelector);
  await delay(300);

  await page.evaluate(() => {
    const el = document.querySelector(
      'div[contenteditable="true"][aria-label="Search name or number"]'
    );
    el.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("delete", false, null);
  });


  await page.evaluate((text) => {
    const el = document.querySelector(
      'div[contenteditable="true"][aria-label="Search name or number"]'
    );
    el.focus();

    const event = new InputEvent("input", {
      inputType: "insertText",
      data: text,
      bubbles: true,
      cancelable: true
    });

    el.textContent = text;
    el.dispatchEvent(event);
  }, TARGET_CHAT);

  // Confirm forward
  await delay(1000);
  await page.keyboard.press("Enter");

  await page.waitForSelector('span[aria-label="Send"]', { visible: true });

  await page.evaluate(() => {
    document
      .querySelector('span[aria-label="Send"]')
      .closest('div[role="button"]')
      .click();
  });
  log("✅ Media forwarded successfully");

  await delay(10000);
  await browser.close();  
  process.exit(0);

})();
