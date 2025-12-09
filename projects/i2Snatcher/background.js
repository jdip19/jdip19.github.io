import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";
import {
  firebaseConfig,
  ALLOWED_DB_PATHS,
  RATE_LIMIT,
} from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const versionRef = ref(database, ALLOWED_DB_PATHS.VERSION);
const localVersion = chrome.runtime.getManifest().version;

// Per-user licensing / access control
let clientId = null;
let userStatus = "unknown"; // "approved" | "pending" | "blocked" | "unknown"

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
        console.warn("Failed to update lastSeen:", e);
      }
    }

    chrome.storage.local.set({ clientId: id, userStatus });
    console.log("User status:", userStatus, "clientId:", id);
  } catch (error) {
    console.error("Error refreshing user status:", error);
    userStatus = "unknown";
    chrome.storage.local.set({ userStatus });
  }
}

function isUserAllowed() {
  return userStatus === "approved";
}

// Rate limiting: Track requests per user
let requestHistory = [];
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

// Validate database path to prevent unauthorized access
function validateDbPath(path) {
  const allowedPaths = Object.values(ALLOWED_DB_PATHS);
  return allowedPaths.some((allowed) => path.startsWith(allowed));
}

// Rate limiting check
function checkRateLimit() {
  const now = Date.now();
  // Remove requests older than 1 minute
  requestHistory = requestHistory.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (requestHistory.length >= RATE_LIMIT.MAX_UPDATES_PER_MINUTE) {
    console.warn(
      "Rate limit exceeded. Please wait before making more requests."
    );
    return false;
  }

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
  if (!checkRateLimit()) {
    console.warn("Rate limit exceeded. Deferring sync.");
    return;
  }

  // Validate batch size to prevent abuse
  const totalPending = pendingUpdates.copied + pendingUpdates.downloaded;
  if (totalPending > RATE_LIMIT.MAX_BATCH_SIZE) {
    console.error("Batch size exceeds limit. Truncating to prevent abuse.");
    pendingUpdates.copied = Math.min(
      pendingUpdates.copied,
      RATE_LIMIT.MAX_BATCH_SIZE
    );
    pendingUpdates.downloaded = Math.min(
      pendingUpdates.downloaded,
      RATE_LIMIT.MAX_BATCH_SIZE
    );
  }

  isSyncing = true;
  const updatesToSync = { ...pendingUpdates };
  pendingUpdates = { copied: 0, downloaded: 0 }; // Reset pending updates

  try {
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

    console.log(
      `Synced ${updatesToSync.copied} copied, ${updatesToSync.downloaded} downloaded to Firebase`
    );
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
  if (!isUserAllowed()) {
    console.warn("User not approved. Action blocked.");
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

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
  if (!isUserAllowed()) {
    console.warn("User not approved. Shortcut blocked.");
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
      console.log("taken" + action);

      chrome.scripting.executeScript({
        target: { tabId },
        function: extractSvg,
        args: [action],
      });
    }
  });
});

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
          console.log("Unique colors:", uniqueColors);

          chrome.runtime.sendMessage({
            action: "detected_colors",
            colors: uniqueColors,
          });

          svgElement.setAttribute("width", size);
          svgElement.setAttribute("height", size);
          svgElement.setAttribute("id", iconName);
          if (action === "copy") {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);

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
              const autoCloseEnabled = data.autoClosePopup !== false; // Default to true

              if (autoCloseEnabled) {
                setTimeout(() => {
                  const closeButton = document.querySelector("#detail-close");
                  if (closeButton) {
                    closeButton.click();
                    console.log("Popup closed after copying SVG.");
                  } else {
                    console.warn("Close button not found.");
                  }
                }, 500); // Small delay to ensure copy completes
              } else {
                console.log(
                  "Auto-close disabled. User will close popup manually."
                );
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
            console.log("SVG downloaded successfully.");
            chrome.runtime.sendMessage({
              type: "incrementSvgCounter",
              action: "downloaded",
            });

            chrome.storage.sync.get("autoClosePopup", function (data) {
              const autoCloseEnabled = data.autoClosePopup !== false; // Default to true

              if (autoCloseEnabled) {
                setTimeout(() => {
                  const closeButton = document.querySelector("#detail-close");
                  if (closeButton) {
                    closeButton.click();
                    console.log("Popup closed after copying SVG.");
                  } else {
                    console.warn("Close button not found.");
                  }
                }, 500); // Small delay to ensure copy completes
              } else {
                console.log(
                  "Auto-close disabled. User will close popup manually."
                );
              }
            });
          }
        } else {
          console.error("SVG element not found.");
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
