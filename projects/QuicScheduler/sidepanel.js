// sidepanel.js

let posts = [];
let currentIndex = 0;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  $("tab-posts").addEventListener("click", () => switchTab("posts"));
  $("tab-settings").addEventListener("click", () => switchTab("settings"));
  $("load-btn").addEventListener("click", loadSheet);
  $("reload-btn").addEventListener("click", loadSheet);
  $("fill-btn").addEventListener("click", fillCurrentPost);
  $("prev-btn").addEventListener("click", () => navigate(-1));
  $("next-btn").addEventListener("click", () => navigate(1));

  chrome.storage.local.get(["sheetTabUrl", "posts", "currentIndex"], (data) => {
    if (data.sheetTabUrl) $("sheetTabUrl").value = data.sheetTabUrl;

    if (data.posts?.length) {
      posts = data.posts;
      currentIndex = data.currentIndex || 0;
      showPostsView();
      renderPost();
      setStatus("ok", `${posts.length} posts loaded`);
    }
  });
});

function switchTab(tab) {
  $("panel-settings").classList.toggle("hidden", tab !== "settings");
  $("panel-posts").classList.toggle("hidden", tab !== "posts");
  $("tab-settings").classList.toggle("active", tab === "settings");
  $("tab-posts").classList.toggle("active", tab === "posts");
}

// ── Extract gid from a Google Sheets tab URL ──────────────────────────────────
function extractGid(url) {
  const m = url.match(/[#?&]gid=(\d+)/);
  return m ? m[1] : null;
}

function loadSheet() {
  const sheetTabUrl = $("sheetTabUrl").value.trim();
  if (!sheetTabUrl) {
    showError("Please paste the tab URL");
    return;
  }

  const gid = extractGid(sheetTabUrl);
  if (!gid) {
    showError(
      "Could not find gid in tab URL. Make sure you copy the full URL from the browser address bar after clicking the tab.",
    );
    return;
  }

  setStatus("loading", "Loading…");
  $("load-btn").disabled = true;
  hideError();

  chrome.runtime.sendMessage(
    { action: "getSheetData", sheetUrl: sheetTabUrl, gid },
    (response) => {
      $("load-btn").disabled = false;

      if (!response?.success) {
        setStatus("error", "Failed");
        showError(response?.error || "Could not load sheet.");
        return;
      }

      // Filter out already-scheduled posts
      const allPosts = response.data;
      posts = allPosts.filter((post) => {
        const flag = (
          post["scheduled"] ||
          post["schedule"] ||
          post["done"] ||
          post["posted"] ||
          ""
        )
          .toString()
          .trim()
          .toLowerCase();
        return !["true", "yes", "1", "done"].includes(flag);
      });

      currentIndex = 0;

      if (!posts.length) {
        setStatus("error", "No pending posts");
        showError("All posts are marked scheduled, or sheet is empty.");
        return;
      }

      const skipped = allPosts.length - posts.length;
      chrome.storage.local.set({ sheetTabUrl, posts, currentIndex });
      setStatus(
        "ok",
        `${posts.length} pending${skipped > 0 ? ` (${skipped} skipped)` : ""}`,
      );
      showPostsView();
      renderPost();
      switchTab("posts");
    },
  );
}

function navigate(dir) {
  currentIndex = Math.max(0, Math.min(posts.length - 1, currentIndex + dir));
  chrome.storage.local.set({ currentIndex });
  renderPost();
}

function renderPost() {
  if (!posts.length) return;
  const post = posts[currentIndex];

  $("counter").textContent = `Post ${currentIndex + 1} of ${posts.length}`;
  $("progress-bar").style.width =
    `${((currentIndex + 1) / posts.length) * 100}%`;

  const get = (...keys) => {
    for (const k of keys) {
      const val = post[k.toLowerCase()];
      if (val) return val;
    }
    return "";
  };

  const brand = get("brand", "account", "brand name");
  const mode = get("post mode", "mode", "radio", "auto");
  const image = get("image path", "filename", "image", "photo");

  const brandEl = $("prev-brand");
  brandEl.innerHTML = brand
    ? `<span class="badge badge-brand">🏷 ${brand}</span>`
    : "—";

  const modeEl = $("prev-mode");
  if (mode) {
    const isAuto = mode.trim().toLowerCase() === "auto";
    modeEl.innerHTML = isAuto
      ? `<span class="badge badge-auto">⚡ Post automatically</span>`
      : `<span class="badge badge-reminder">🔔 Get a reminder</span>`;
  } else {
    modeEl.textContent = "—";
  }

  $("prev-caption").textContent = get("caption", "text", "content") || "—";
  $("prev-link").textContent = get("link", "url", "website", "cta link") || "—";
  $("prev-hashtags").textContent = get("hashtags", "tags", "hashtag") || "—";
  $("prev-image").textContent = image ? image.split(/[\\\/]/).pop() : "—";
  $("prev-date").textContent = formatGvizDate(
    get("schedule date", "date", "scheduled date"),
  );
  $("prev-time").textContent = formatGvizTime(
    get("time", "schedule time", "post time"),
  );
  console.log("date gviz",get("schedule date", "date", "scheduled date"));
  $("prev-btn").disabled = currentIndex === 0;
  $("next-btn").disabled = currentIndex === posts.length - 1;
  $("fill-btn").disabled = false;
}

async function fillCurrentPost() {
  const post = posts[currentIndex];
  if (!post) return;

  $("fill-btn").disabled = true;
  $("fill-btn").textContent = "⏳ Filling…";

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    showError("No active tab. Open your scheduling tool first.");
    resetFillBtn();
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });
  } catch (e) {}

  const normalizedPost = {};
  Object.keys(post).forEach((k) => {
    normalizedPost[k.toLowerCase()] = post[k];
  });

  chrome.tabs.sendMessage(
    tab.id,
    { action: "fillPost", post: normalizedPost },
    (resp) => {
      if (resp?.success) {
        $("fill-btn").textContent = "✅ Filled!";
        $("fill-btn").style.background =
          "linear-gradient(135deg, #22c55e, #16a34a)";
        setTimeout(() => resetFillBtn(), 2000);
      } else {
        showError(
          resp?.error ||
            "Fill failed. Make sure you are on the scheduler page.",
        );
        resetFillBtn();
      }
    },
  );
}

function showPostsView() {
  $("empty-state").classList.add("hidden");
  $("posts-view").classList.remove("hidden");
  $("fill-btn").disabled = false;
}

function setStatus(type, msg) {
  $("status-bar").className = `status ${type}`;
  $("status-text").textContent = msg;
}

function showError(msg) {
  $("error-box").textContent = msg;
  $("error-box").style.display = "block";
  switchTab("settings");
}

function hideError() {
  $("error-box").style.display = "none";
}

function resetFillBtn() {
  $("fill-btn").disabled = false;
  $("fill-btn").textContent = "⚡ Fill This Post";
  $("fill-btn").style.background = "";
}
function formatGvizDate(val) {
  if (!val) return '—';
  // Parse Date(2026,3,1) — month is 0-indexed in gviz
  const m = val.match(/Date\((\d+),(\d+),(\d+)\)/);
  if (!m) return val;
  const d = new Date(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
  const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatGvizTime(val) {
  if (!val) return '—';
  // Parse Date(1899,11,30,7,0,0) — only HH,MM,SS matter
  const m = val.match(/Date\(\d+,\d+,\d+,(\d+),(\d+),(\d+)\)/);
  if (!m) return val;
  let h = parseInt(m[1]), min = parseInt(m[2]);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')} ${ampm}`;
}
