import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

let firebaseConfig = {};
let ALLOWED_DB_PATHS = {};
let RATE_LIMIT = {}; // from firebase-setup.json
let database = null;
let firebaseReady = false;

// Remote config loader
async function loadRemoteConfig() {
  try {
    const response = await fetch(
      "https://jdip19.github.io/js/firebase-setup.json"
    );
    const config = await response.json();

    firebaseConfig = config.firebaseConfig;
    ALLOWED_DB_PATHS = config.ALLOWED_DB_PATHS;
    RATE_LIMIT = config.RATE_LIMIT;
    return true;
  } catch (err) {
    console.error("Failed to load remote config:", err);
    return false;
  }
}

// Wait for Firebase before allowing references
async function init() {
  const configLoaded = await loadRemoteConfig();
  if (!configLoaded) {
    console.error("Cannot initialize Firebase: config loading failed");
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    firebaseReady = true;

    // Database is ready
    runPostFirebaseInit();
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
}

init();

// Helper to ensure Firebase is ready before operations
function ensureFirebaseReady() {
  return new Promise((resolve) => {
    const maxWait = 5000; // 5 second timeout
    const startTime = Date.now();
    const checkReady = () => {
      if (firebaseReady) {
        resolve(true);
        return;
      }
      if (Date.now() - startTime > maxWait) {
        console.error("Firebase initialization timeout");
        resolve(false);
        return;
      }
      setTimeout(checkReady, 100);
    };
    checkReady();
  });
}

function runPostFirebaseInit() {
  const versionRef = ref(database, ALLOWED_DB_PATHS.VERSION);

  get(versionRef).then((snapshot) => {
    if (snapshot.exists()) {
      const remoteVersion = snapshot.val();

      // Store remote version and comparison result
      chrome.storage.local.set({
        remoteVersion,
        updateAvailable: remoteVersion > localVersion,
      });
    }
  });
}

const localVersion = chrome.runtime.getManifest().version;

// Per-user licensing / access control
let clientId = null;
let userStatus = "unknown"; // "approved" | "pending" | "blocked" | "unknown"
// Timestamp (ms) of last remote status check stored in chrome.storage.local
let statusCheckedAt = 0;

// Cache TTL for stored status to avoid frequent remote checks (2 minutes)
const STATUS_CACHE_TTL = 2 * 60 * 1000;

async function getOrCreateClientId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["clientId"], async (result) => {
      if (result.clientId) {
        clientId = result.clientId;
        resolve(clientId);
        return;
      }

      // Generate a new clientId (use crypto.randomUUID when available)
      let newId = "";
      if (crypto && typeof crypto.randomUUID === "function") {
        newId = crypto.randomUUID();
      } else {
        newId = `user_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
      }

      clientId = newId;
      chrome.storage.sync.set({ clientId: newId }, () => {
        resolve(newId);
      });
    });
  });
}

// Fetch user status from Firebase (approved / pending / blocked)
async function refreshUserStatus() {
  try {
    // Ensure Firebase is ready before attempting to access database
    const ready = await ensureFirebaseReady();
    if (!ready) {
      throw new Error("Firebase not ready");
    }

    const id = await getOrCreateClientId();

    const usersPath = `${ALLOWED_DB_PATHS.USERS}`;
    if (!validateDbPath(usersPath)) {
      throw new Error("Invalid users path");
    }

    const userRef = ref(database, `${usersPath}/${id}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // First time we see this user → create pending entry
      const now = Date.now();
      await set(userRef, {
        status: "pending",
        createdAt: now,
        lastSeen: now,
      });
      userStatus = "pending";
    } else {
      const data = snapshot.val() || {};
      userStatus = data.status || "pending";

      // Update lastSeen for analytics
      try {
        await set(userRef, { ...data, lastSeen: Date.now() });
      } catch (e) {
        // Non-fatal
      }
    }

    chrome.storage.local.set({ clientId: id, userStatus });
    // record when we checked the status
    statusCheckedAt = Date.now();
    chrome.storage.local.set({ statusCheckedAt });
  } catch (error) {
    console.error("Error refreshing user status:", error);
    userStatus = "unknown";
    chrome.storage.local.set({ userStatus });
  }
}

// Async helper that prefers stored status (survives worker unloads).
// If status is unknown it will attempt a fresh refresh before deciding.
function isUserAllowedAsync() {
  return new Promise((resolve) => {
    // Read cached status + timestamp first to avoid remote calls when recent
    chrome.storage.local.get(
      ["userStatus", "statusCheckedAt"],
      async (result) => {
        const stored = result.userStatus || userStatus || "unknown";
        const checkedAt = result.statusCheckedAt || statusCheckedAt || 0;

        // If we have a recent successful check, use it immediately
        const age = Date.now() - checkedAt;
        if (stored === "approved") {
          // hydrate runtime vars
          userStatus = stored;
          statusCheckedAt = checkedAt;
          return resolve(true);
        }

        if (age < STATUS_CACHE_TTL && stored !== "unknown") {
          // cached non-approved decision is recent enough to use
          userStatus = stored;
          statusCheckedAt = checkedAt;
          return resolve(stored === "approved");
        }

        // Otherwise, perform a remote refresh but don't block too long.
        // If refresh doesn't finish within TIMEOUT, fall back to stored value (if any)
        const REFRESH_TIMEOUT = 1500; // ms

        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          // If we have a cached value, use it; otherwise deny (safe default)
          if (stored) return resolve(stored === "approved");
          return resolve(false);
        }, REFRESH_TIMEOUT);

        try {
          await refreshUserStatus();
          clearTimeout(timeout);
          if (timedOut) return; // already resolved via timeout
          // read stored status after refresh
          chrome.storage.local.get(["userStatus", "statusCheckedAt"], (r2) => {
            userStatus = r2.userStatus || userStatus;
            statusCheckedAt = r2.statusCheckedAt || statusCheckedAt;
            resolve(userStatus === "approved");
          });
        } catch (e) {
          clearTimeout(timeout);
          if (timedOut) return;
          // On error, fallback to stored value if present
          resolve(stored === "approved");
        }
      }
    );
  });
}

// Rate limiting: Track requests per user
let requestHistory = [];

// Validate database path to prevent unauthorized access
function validateDbPath(path) {
  const allowedPaths = Object.values(ALLOWED_DB_PATHS);
  return allowedPaths.some((allowed) => path.startsWith(allowed));
}

// Rate limiting check
function checkRateLimit() {
  const now = Date.now();
  const maxPerMinute = RATE_LIMIT?.MAX_UPDATES_PER_MINUTE || 60;
  requestHistory = requestHistory.filter(
    (timestamp) => now - timestamp < 60000
  );
  if (requestHistory.length >= maxPerMinute) return false;
  requestHistory.push(now);
  return true;
}

// Firebase sync optimization: Batch updates to reduce API calls
let pendingUpdates = { copied: 0, downloaded: 0 };
let syncTimer = null;
let isSyncing = false;
const SYNC_DELAY = 5000; // Wait 5 seconds before syncing to batch multiple actions
const BATCH_SIZE_THRESHOLD = 5; // Sync immediately if batch reaches this size

// Function to sync pending updates to Firebase
async function syncPendingUpdatesToFirebase() {
  if (
    isSyncing ||
    (pendingUpdates.copied === 0 && pendingUpdates.downloaded === 0)
  ) {
    return;
  }

  // Rate limiting check
  if (!checkRateLimit()) return;

  // Validate batch size to prevent abuse
  const totalPending = pendingUpdates.copied + pendingUpdates.downloaded;
  const maxBatchSize = RATE_LIMIT?.MAX_BATCH_SIZE || 100;
  if (totalPending > maxBatchSize) {
    console.error("Batch size exceeds limit. Truncating to prevent abuse.");
    pendingUpdates.copied = Math.min(pendingUpdates.copied, maxBatchSize);
    pendingUpdates.downloaded = Math.min(
      pendingUpdates.downloaded,
      maxBatchSize
    );
  }

  isSyncing = true;
  const updatesToSync = { ...pendingUpdates };
  pendingUpdates = { copied: 0, downloaded: 0 }; // Reset pending updates

  try {
    // Ensure Firebase is ready before attempting to access database
    const ready = await ensureFirebaseReady();
    if (!ready) {
      throw new Error("Firebase not ready");
    }

    // Validate paths before accessing
    const statsPath = `${ALLOWED_DB_PATHS.SVG_STATS}`;
    if (!validateDbPath(statsPath)) {
      throw new Error("Invalid database path");
    }

    // Get current values from Firebase
    const copiedRef = ref(database, `${statsPath}/copied`);
    const downloadedRef = ref(database, `${statsPath}/downloaded`);

    const [copiedSnap, downloadedSnap] = await Promise.all([
      get(copiedRef),
      get(downloadedRef),
    ]);

    const currentCopied = copiedSnap.exists() ? copiedSnap.val() : 0;
    const currentDownloaded = downloadedSnap.exists()
      ? downloadedSnap.val()
      : 0;

    // Update Firebase with batched increments (only 2 writes instead of multiple)
    const newCopied = currentCopied + updatesToSync.copied;
    const newDownloaded = currentDownloaded + updatesToSync.downloaded;

    await Promise.all([
      set(copiedRef, newCopied),
      set(downloadedRef, newDownloaded),
    ]);

    // Update local storage with synced values
    const finalCounts = { copied: newCopied, downloaded: newDownloaded };
    chrome.storage.local.set({ svgStats: finalCounts });

    // Notify popup of updated counts
    chrome.runtime.sendMessage({
      type: "svgCountUpdated",
      payload: finalCounts,
    });
  } catch (error) {
    console.error("Firebase sync error:", error);
    // Re-add failed updates back to pending
    pendingUpdates.copied += updatesToSync.copied;
    pendingUpdates.downloaded += updatesToSync.downloaded;
  } finally {
    isSyncing = false;
  }
}

// Schedule sync with debouncing
function scheduleSync() {
  // Clear existing timer
  if (syncTimer) {
    clearTimeout(syncTimer);
  }

  // Check if we should sync immediately (batch size threshold)
  const totalPending = pendingUpdates.copied + pendingUpdates.downloaded;
  if (totalPending >= BATCH_SIZE_THRESHOLD) {
    syncPendingUpdatesToFirebase();
    return;
  }

  // Otherwise, schedule sync after delay
  syncTimer = setTimeout(() => {
    syncPendingUpdatesToFirebase();
    syncTimer = null;
  }, SYNC_DELAY);
}

// Hydrate runtime status from storage on worker start so checks are fast
chrome.storage.local.get(
  ["userStatus", "clientId", "statusCheckedAt"],
  (result) => {
    if (result.userStatus) userStatus = result.userStatus;
    if (result.clientId) clientId = result.clientId;
    if (result.statusCheckedAt) statusCheckedAt = result.statusCheckedAt;
  }
);

// Check if keyboard shortcuts are registered and nudge user if needed
async function checkAndNudgeShortcuts() {
  try {
    const commands = await chrome.commands.getAll();
    const copyCommand = commands.find((cmd) => cmd.name === "copy_svg");
    const downloadCommand = commands.find((cmd) => cmd.name === "download_svg");

    const shortcutsRegistered =
      copyCommand &&
      copyCommand.shortcut &&
      downloadCommand &&
      downloadCommand.shortcut;

    // Check if we've already shown the nudge
    chrome.storage.local.get(["shortcutNudgeShown"], (result) => {
      if (!shortcutsRegistered && !result.shortcutNudgeShown) {
        // Show notification to nudge user
        chrome.notifications.create(
          {
            type: "basic",
            iconUrl: chrome.runtime.getURL("i2snatcher128.png"),
            title: "i2Snatcher - Keyboard Shortcuts",
            message:
              "Click to set up keyboard shortcuts (Alt+Shift+C and Alt+Shift+D)",
            buttons: [{ title: "Set Up Shortcuts" }],
          },
          (notificationId) => {
            // Store notification ID for click handling
            chrome.storage.local.set({
              shortcutNotificationId: notificationId,
            });
          }
        );
      }
    });
  } catch (error) {
    console.error("Error checking shortcuts:", error);
  }
}

// Handle notification button click
chrome.notifications.onButtonClicked.addListener(
  (notificationId, buttonIndex) => {
    chrome.storage.local.get(["shortcutNotificationId"], (result) => {
      if (
        result.shortcutNotificationId === notificationId &&
        buttonIndex === 0
      ) {
        // Open shortcuts page
        chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
        // Mark nudge as shown
        chrome.storage.local.set({ shortcutNudgeShown: true });
        // Close notification
        chrome.notifications.clear(notificationId);
      }
    });
  }
);

// Handle notification click
chrome.notifications.onClicked.addListener((notificationId) => {
  chrome.storage.local.get(["shortcutNotificationId"], (result) => {
    if (result.shortcutNotificationId === notificationId) {
      chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
      chrome.storage.local.set({ shortcutNudgeShown: true });
      chrome.notifications.clear(notificationId);
    }
  });
});

// Create context menus when the extension is installed
chrome.runtime.onInstalled.addListener(async (details) => {
  // Create context menus
  chrome.contextMenus.create({
    id: "copySvg",
    title: "Copy SVG Content",
    contexts: ["link"],
  });

  chrome.contextMenus.create({
    id: "downloadSvg",
    title: "Download SVG File",
    contexts: ["link"],
  });

  // Check and nudge for shortcuts on install
  if (details.reason === "install") {
    // Small delay to ensure Chrome is ready
    setTimeout(() => {
      checkAndNudgeShortcuts();
    }, 1000);
  }

  // Initialize / refresh user status on install
  refreshUserStatus();

  // Sync any pending updates on install/update
  syncPendingUpdatesToFirebase();
});

// Check shortcuts on startup
chrome.runtime.onStartup.addListener(() => {
  setTimeout(() => {
    checkAndNudgeShortcuts();
  }, 1000);

  // Refresh user status on startup
  refreshUserStatus();

  syncPendingUpdatesToFirebase();
});

// Check shortcuts on initial load
setTimeout(() => {
  checkAndNudgeShortcuts();
  refreshUserStatus();
}, 2000);

// Periodic sync every 30 seconds to ensure nothing is missed
setInterval(() => {
  if (pendingUpdates.copied > 0 || pendingUpdates.downloaded > 0) {
    syncPendingUpdatesToFirebase();
  }
}, 30000); // Sync every 30 seconds

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  isUserAllowedAsync().then((allowed) => {
    if (!allowed) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("i2snatcher128.png"),
        title: "i2Snatcher",
        message:
          "Your access is not approved yet. Please contact the extension owner.",
      });
      return;
    }

    if (info.menuItemId === "copySvg") {
      processSvg(info.linkUrl, "copy");
    } else if (info.menuItemId === "downloadSvg") {
      processSvg(info.linkUrl, "download");
    }
  });
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  isUserAllowedAsync().then((allowed) => {
    if (!allowed) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL("i2snatcher128.png"),
        title: "i2Snatcher",
        message:
          "Your access is not approved yet. Please contact the extension owner.",
      });
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id;
        const action = command === "copy_svg" ? "copy" : "download";

        chrome.scripting.executeScript({
          target: { tabId },
          function: extractSvg,
          args: [action],
        });
      }
    });
  });
});

// Periodically refresh user status while active to avoid stale 'unknown' state
// This helps when the service worker is active for a while; storage keeps the
// last-known status across worker restarts.
setInterval(() => {
  try {
    refreshUserStatus();
  } catch (e) {
    // Silent failure on periodic refresh
  }
}, 5 * 60 * 1000);

// Open the link in a background tab and extract the SVG
function processSvg(detailLink, action) {
  chrome.tabs.create({ url: detailLink, active: true }, (tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractSvg,
      args: [action],
    });
  });
}

// Extract SVG and handle copy/download
function extractSvg(action) {
  function normalizeForFigma(svg) {
    // Remove clipPaths
    svg.querySelectorAll("clipPath").forEach((el) => el.remove());

    // Remove masks
    svg.querySelectorAll("mask").forEach((el) => el.remove());

    // Remove clip-path references
    svg
      .querySelectorAll("[clip-path]")
      .forEach((el) => el.removeAttribute("clip-path"));

    // Remove mask references
    svg.querySelectorAll("[mask]").forEach((el) => el.removeAttribute("mask"));

    return svg;
  }

  const editButton = document.querySelector("#detail_edit_icon");

  if (editButton) {
    editButton.click(); // Simulate click to load the SVG

    chrome.storage.sync.get("svgSize", function (data) {
      const size = data.svgSize || 128; // Default size if not set

      const editButton = document.querySelector("#detail_edit_icon");
      if (editButton) editButton.click();

      setTimeout(() => {
        const svgElement = document.querySelector(
          ".detail__editor__icon-holder svg"
        );
        const titleElement = document.querySelector(
          "aside.detail__sidebar.col--stretch div h1"
        );
        const categoryElement = document.querySelector(
          "a.link--normal.mg-right-lv1"
        );

        let iconName =
          titleElement && categoryElement
            ? `${titleElement.textContent.trim()}_${categoryElement.textContent.trim()}`
            : titleElement
            ? `${titleElement.textContent.trim()}`
            : "icon";

        function extractUniqueColorsFromSVG(svgElement) {
          const html = svgElement.outerHTML;

          // Match both 3-digit and 6-digit hex codes
          const hexMatches = html.match(/#[0-9a-fA-F]{3,6}/g) || [];

          // Convert 3-digit hex codes to 6-digit format
          const normalizeHex = (hex) => {
            if (hex.length === 4) {
              return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
            }
            return hex.toLowerCase();
          };

          // Normalize and deduplicate
          const uniqueHexColors = [...new Set(hexMatches.map(normalizeHex))];

          return uniqueHexColors;
        }

        if (svgElement) {
          const uniqueColors = extractUniqueColorsFromSVG(svgElement);
          chrome.runtime.sendMessage({
            action: "detected_colors",
            colors: uniqueColors,
          });

          svgElement.setAttribute("width", size);
          svgElement.setAttribute("height", size);
          svgElement.setAttribute("id", iconName);

          if (action === "copy") {
            const svgClone = svgElement.cloneNode(true);
            normalizeForFigma(svgClone);

            const svgString = new XMLSerializer().serializeToString(svgClone);

            const textarea = document.createElement("textarea");
            textarea.value = svgString;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);

            // Increment counter for copy action
            chrome.runtime.sendMessage({
              type: "incrementSvgCounter",
              action: "copied",
            });

            // Close the popup after copying (if enabled in settings)
            chrome.storage.sync.get("autoClosePopup", function (data) {
              const autoCloseEnabled = data.autoClosePopup !== false;
              if (autoCloseEnabled) {
                setTimeout(() => {
                  const closeButton = document.querySelector("#detail-close");
                  if (closeButton) closeButton.click();
                }, 500);
              }
            });
          } else if (action === "download") {
            const blob = new Blob([svgElement.outerHTML], {
              type: "image/svg+xml",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${iconName}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            chrome.runtime.sendMessage({
              type: "incrementSvgCounter",
              action: "downloaded",
            });

            chrome.storage.sync.get("autoClosePopup", function (data) {
              const autoCloseEnabled = data.autoClosePopup !== false;
              if (autoCloseEnabled) {
                setTimeout(() => {
                  const closeButton = document.querySelector("#detail-close");
                  if (closeButton) closeButton.click();
                }, 500);
              }
            });
          }
        }
      }, 2000);
    });
  } else {
    console.error("Edit button not found.");
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "incrementSvgCounter") {
    const action = message.action; // "copied" or "downloaded"

    // Step 1: Optimistically update local storage immediately
    chrome.storage.local.get(["svgStats"], (result) => {
      let localData = result.svgStats || { copied: 0, downloaded: 0 };
      localData[action] = (localData[action] || 0) + 1;

      // Save updated local count
      chrome.storage.local.set({ svgStats: localData });

      // Send quick update to popup (instant feedback)
      chrome.runtime.sendMessage({
        type: "svgCountUpdated",
        payload: { ...localData },
      });

      // Step 2: Add to pending batch (will sync to Firebase later)
      pendingUpdates[action] = (pendingUpdates[action] || 0) + 1;
      scheduleSync(); // Schedule sync with debouncing
    });
  }

  // Handle direct request from popup to fetch counts
  if (message.action === "getSVGCount") {
    chrome.storage.local.get(["svgStats"], (result) => {
      const localData = result.svgStats || { copied: 0, downloaded: 0 };
      const total = (localData.copied || 0) + (localData.downloaded || 0);

      chrome.runtime.sendMessage({
        action: "updateSVGCount",
        count: total,
        payload: localData,
      });
    });
  }
});
