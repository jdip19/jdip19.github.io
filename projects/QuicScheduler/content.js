// content.js

// Guard against double-injection
if (!window._spsLoaded) {
  window._spsLoaded = true;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillPost") {
      fillForm(request.post)
        .then(() => sendResponse({ success: true }))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;
    }
    if (request.action === "ping") {
      sendResponse({ alive: true });
      return true;
    }
  });
}

async function fillForm(post) {
  // ── 1. Select brand accounts ─────────────────────────────────────
  const brand = post["brand"] || post["account"] || post["brand name"] || "";
  if (brand) {
    await selectBrandAccounts(brand);
    await sleep(400);
  }

  // ── 2. Caption + Link ────────────────────────────────────────────
  const link =
    post["link"] || post["url"] || post["website"] || post["cta link"] || "";
  let captionText = post.caption || post.text || post.content || "";
  if (link) captionText = captionText.trimEnd() + "\n\nExplore more: " + link;

  const captionEl = findElement([
    'textarea[placeholder*="Write"]',
    'textarea[placeholder*="write"]',
    'textarea[placeholder*="caption"]',
    'div[contenteditable="true"]',
    "textarea",
  ]);

  if (captionEl) {
    captionEl.focus();
    setNativeValue(captionEl, captionText);
    captionEl.dispatchEvent(new Event("input", { bubbles: true }));
    captionEl.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(300);
  }

  // ── 3. Hashtags ───────────────────────────────────────────────────
  const hashtags = post.hashtags || post.tags || post.hashtag || "";
  if (hashtags) {
    await fillHashtags(hashtags);
  }

  // ── 4. Date ──────────────────────────────────────────────────────
  const dateVal =
    post["schedule date"] || post["date"] || post["scheduled date"] || "";
  if (dateVal) {
    const dateEl = findElement([
      'input[type="date"]',
      'input[placeholder*="date" i]',
      '[placeholder*="Schedule date" i]',
    ]);

    if (dateEl) {
      setNativeValue(dateEl, formatDate(dateVal));
      dateEl.dispatchEvent(new Event("input", { bubbles: true }));
      dateEl.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(300);
    }
  }

  // ── 5. Time ──────────────────────────────────────────────────────
  const timeVal = post.time || post["schedule time"] || post["post time"] || "";
  if (timeVal) {
    const timeEl = findElement([
      'input[type="time"]',
      'input[placeholder*="time" i]',
      ".schedule-time input",
    ]);
    if (timeEl) {
      setNativeValue(timeEl, formatTime(timeVal));
      timeEl.dispatchEvent(new Event("input", { bubbles: true }));
      timeEl.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(300);
    }
  }

  // ── 6. Image ─────────────────────────────────────────────────────
  const imagePath =
    post["image path"] ||
    post["filename"] ||
    post["image"] ||
    post["photo"] ||
    "";
  if (imagePath) {
    const filename = imagePath.split(/[\\\/]/).pop();
    showToast(`📎 Select image: "${filename}"`, 6000);
    await sleep(400);
    const uploadLabel = document.querySelector('label[for="fileInput"]');
    if (uploadLabel) uploadLabel.click();
  }

  // ── 7. Radio — auto / reminder ───────────────────────────────────
  const postMode =
    post["post mode"] || post["mode"] || post["radio"] || post["auto"] || "";
  if (postMode) {
    await selectRadio(postMode);
  }

  showToast("✅ Post filled! Click Schedule when ready.");
}

// ── Account selector — uses data-account JSON profile_name ───────────────────
async function selectBrandAccounts(brand) {
  const brandLower = brand.trim().toLowerCase().replace(/\s+/g, "");
  let matched = 0;

  // First: uncheck all currently checked accounts
  document
    .querySelectorAll('input.account-checkbox[type="checkbox"]')
    .forEach((cb) => {
      if (cb.checked) cb.click();
    });
  await sleep(300);

  // ── Collect ALL matching checkbox IDs first (before any clicks cause re-renders) ──
  const matchingIds = [];
  document
    .querySelectorAll('input.account-checkbox[type="checkbox"]')
    .forEach((checkbox) => {
      const container =
        checkbox.closest(".post-list__item") ||
        checkbox.closest(".form--radio");
      if (!container) return;

      const radioInput = container.querySelector(
        "input.account-switch[data-account]",
      );
      if (!radioInput) return;

      try {
        const accountData = JSON.parse(radioInput.getAttribute("data-account"));
        const extra = accountData.extra_data || {};
        const profileName = [
          accountData.profile_name || "",
          typeof extra === "string" ? extra : "",
          extra.username || "",
          extra.organization_name || "",
          extra.name || "",
        ]
          .join(" ")
          .toLowerCase()
          .replace(/\s+/g, "");

        if (profileName.includes(brandLower)) {
          matchingIds.push(checkbox.id); // store ID, not reference
        }
      } catch (e) {}
    });

  // ── Now click each matched checkbox by ID (re-query each time to get fresh reference) ──
  for (const id of matchingIds) {
    await sleep(200); // wait for any re-render from previous click
    const cb = document.getElementById(id);
    if (cb && !cb.checked) {
      cb.click();
      matched++;
    }
  }

  if (matched > 0) {
    showToast(`✅ Selected ${matched} account(s) for "${brand}"`, 3000);
  } else {
    showToast(
      `⚠️ No accounts found for "${brand}" — check brand name in sheet`,
      4000,
    );
  }
}

// ── Hashtag filler ────────────────────────────────────────────────────────────
async function fillHashtags(hashtags) {
  // Step 1: click #Hashtags button to open popup
  const hashBtn = [
    ...document.querySelectorAll("button, span, div, a, label"),
  ].find(
    (el) =>
      el.textContent.trim() === "#Hashtags" ||
      el.textContent.trim() === "Hashtags",
  );

  if (hashBtn) {
    hashBtn.click();
    await sleep(800); // wait for modal to fully open
  }

  // Step 2: fill textarea.hashtag_input — the bottom "Hashtags" textarea in the popup
  const hashField =
    document.querySelector("textarea.hashtag_input") ||
    document.querySelector(".form--group textarea.form--control") ||
    document.querySelector('textarea[placeholder*="facebook"]') ||
    (() => {
      const labels = [...document.querySelectorAll("label")];
      const label = labels.find((l) => l.textContent.trim() === "Hashtags");
      return label?.closest(".form--group")?.querySelector("textarea");
    })();

  if (hashField) {
    hashField.focus();
    setNativeValue(hashField, hashtags);
    hashField.dispatchEvent(new Event("input", { bubbles: true }));
    hashField.dispatchEvent(new Event("change", { bubbles: true }));
    await sleep(400);
  } else {
    showToast("⚠️ Hashtag field not found — paste manually", 3000);
  }

  // Step 3: ALWAYS try to click .hashtagSubmit — runs whether field was found or not
  await sleep(300);
  const submitBtn =
    document.querySelector("a.hashtagSubmit") ||
    document.querySelector(".hashtagSubmit");
  if (submitBtn) {
    submitBtn.click();
    await sleep(500);
  }
}

// ── Radio selector ────────────────────────────────────────────────────────────
async function selectRadio(mode) {
  const isAuto = mode.trim().toLowerCase() === "auto";
  const labelText = isAuto ? "Post automatically" : "Get a reminder";

  const allLabels = document.querySelectorAll("label");
  for (const label of allLabels) {
    if (
      label.textContent.trim().toLowerCase().includes(labelText.toLowerCase())
    ) {
      const radio = label.querySelector('input[type="radio"]');
      if (radio) {
        radio.click();
        return;
      }
      label.click();
      return;
    }
  }

  // Fallback: pick by index
  const radios = document.querySelectorAll('input[type="radio"]');
  if (radios.length >= 2) radios[isAuto ? 0 : 1].click();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function findElement(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) return el;
    } catch (e) {}
  }
  return null;
}

function setNativeValue(el, value) {
  const proto =
    el.tagName === "INPUT"
      ? HTMLInputElement.prototype
      : HTMLTextAreaElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
}

function parseGvizDateTime(gviz) {
  const match = gviz.match(/Date\(([^)]+)\)/);
  if (!match) return gviz;

  const parts = match[1].split(",").map(Number);

  const [year, month, day, hour = 0, min = 0, sec = 0] = parts;

  // ⚠️ gviz month is 0-based → JS Date also expects 0-based → OK
  const d = new Date(year, month, day, hour, min, sec);

  const date = formatLocalDate(d);
  const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;

  return { date, time };
}
function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // +1 because 0-based
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(gviz) {
  const { date } = parseGvizDateTime(gviz);
  return date;
}

function formatTime(gviz) {
  const { time } = parseGvizDateTime(gviz);
  return time;
}

function showToast(msg, duration = 3000) {
  const existing = document.getElementById("sps-toast");
  if (existing) existing.remove();
  const el = document.createElement("div");
  el.id = "sps-toast";
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    background: "#1a1a2e",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: "12px",
    fontSize: "14px",
    fontFamily: "sans-serif",
    zIndex: "999999",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    maxWidth: "320px",
    lineHeight: "1.5",
    borderLeft: "4px solid #6c63ff",
    transition: "opacity 0.3s",
  });
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, duration);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
console.log("Contentscript loaded");
