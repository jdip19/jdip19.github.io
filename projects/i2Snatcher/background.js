let firebaseConfig = {};
let ALLOWED_DB_PATHS = {};
let RATE_LIMIT = {}; // from firebase-setup.json
let databaseUrl = null;
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
    databaseUrl = firebaseConfig.databaseURL;
    if (!databaseUrl) {
      throw new Error("Remote Firebase configuration has no databaseURL");
    }
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

  firebaseReady = true;
  runPostFirebaseInit();
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
  firebaseRequest(ALLOWED_DB_PATHS.VERSION)
    .then((remoteVersion) => {
      if (remoteVersion !== null) {
      // Store remote version and comparison result
      chrome.storage.local.set({
        remoteVersion,
        updateAvailable: remoteVersion > localVersion,
      });
      }
    })
    .catch((error) => {
      console.error("Could not check the remote extension version:", error);
    });
}

const localVersion = chrome.runtime.getManifest().version;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => {
    console.error("Could not enable the extension side panel:", error);
  });

async function firebaseRequest(path, { method = "GET", body } = {}) {
  const ready = await ensureFirebaseReady();
  if (!ready) {
    throw new Error("Firebase configuration is not available");
  }
  if (!validateDbPath(path)) {
    throw new Error("Invalid database path");
  }

  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const baseUrl = databaseUrl.endsWith("/")
    ? databaseUrl
    : `${databaseUrl}/`;
  const response = await fetch(`${baseUrl}${encodedPath}.json`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(
      `Firebase request failed (${response.status} ${response.statusText})`
    );
  }
  return response.json();
}

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

    const userPath = `${usersPath}/${id}`;
    const data = await firebaseRequest(userPath);

    if (data === null) {
      // First time we see this user → create pending entry
      const now = Date.now();
      await firebaseRequest(userPath, {
        method: "PUT",
        body: {
        status: "pending",
        createdAt: now,
        lastSeen: now,
        },
      });
      userStatus = "pending";
    } else {
      const userData = data || {};
      userStatus = userData.status || "pending";

      // Update lastSeen for analytics
      try {
        await firebaseRequest(userPath, {
          method: "PUT",
          body: { ...userData, lastSeen: Date.now() },
        });
      } catch (e) {
        console.error("Could not update Firebase lastSeen:", e);
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
    const [copiedSnap, downloadedSnap] = await Promise.all([
      firebaseRequest(`${statsPath}/copied`),
      firebaseRequest(`${statsPath}/downloaded`),
    ]);

    const currentCopied = copiedSnap ?? 0;
    const currentDownloaded = downloadedSnap ?? 0;

    // Update Firebase with batched increments (only 2 writes instead of multiple)
    const newCopied = currentCopied + updatesToSync.copied;
    const newDownloaded = currentDownloaded + updatesToSync.downloaded;

    await Promise.all([
      firebaseRequest(`${statsPath}/copied`, {
        method: "PUT",
        body: newCopied,
      }),
      firebaseRequest(`${statsPath}/downloaded`, {
        method: "PUT",
        body: newDownloaded,
      }),
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
    const sidePanelCommand = commands.find(
      (cmd) => cmd.name === "_execute_action"
    );
    const copyCommand = commands.find((cmd) => cmd.name === "copy_svg");
    const downloadCommand = commands.find((cmd) => cmd.name === "download_svg");

    const shortcutsRegistered =
      sidePanelCommand &&
      sidePanelCommand.shortcut &&
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
            message: "Click to assign available i2Snatcher keyboard shortcuts",
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
  if (command !== "copy_svg" && command !== "download_svg") {
    console.error("Received an unknown keyboard command:", command);
    return;
  }

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
      const tabId = tabs[0]?.id;
      if (!tabId) {
        console.error("Could not run SVG command: no active tab found.");
        return;
      }

      const action = command === "copy_svg" ? "copy" : "download";
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: extractSvg,
          args: [action],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Could not ${action} SVG in the active tab:`,
              chrome.runtime.lastError.message
            );
          }
        }
      );
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
    if (chrome.runtime.lastError || !tab || !tab.id) {
      console.error(
        "Could not open the SVG detail tab:",
        chrome.runtime.lastError?.message || "No tab was created."
      );
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: extractSvg,
        args: [action],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            `Could not ${action} SVG from the detail tab:`,
            chrome.runtime.lastError.message
          );
        }
      }
    );
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
        const packName =
          categoryElement && categoryElement.textContent.trim()
            ? categoryElement.textContent.trim()
            : "Unknown icon pack";
        const packId = categoryElement && categoryElement.href
          ? new URL(categoryElement.href).pathname.toLowerCase()
          : packName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        let iconName =
          titleElement && categoryElement
            ? `${titleElement.textContent.trim()}_${categoryElement.textContent.trim()}`
            : titleElement
            ? `${titleElement.textContent.trim()}`
            : "icon";

        function normalizeColor(value) {
          const color = value.trim().toLowerCase();
          const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
          if (hexMatch) {
            const hex = hexMatch[1];
            return hex.length === 3
              ? `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
              : `#${hex}`;
          }

          const rgbMatch = color.match(
            /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/
          );
          if (
            !rgbMatch ||
            (rgbMatch[4] !== undefined && Number(rgbMatch[4]) === 0)
          ) {
            return null;
          }

          return `#${rgbMatch
            .slice(1, 4)
            .map((channel) =>
              Math.min(255, Number(channel)).toString(16).padStart(2, "0")
            )
            .join("")}`;
        }

        function getSvgElements(svg) {
          return [svg, ...svg.querySelectorAll("*")];
        }

        const paintedElements = new Set([
          "circle",
          "ellipse",
          "line",
          "path",
          "polygon",
          "polyline",
          "rect",
          "text",
          "tspan",
          "use",
        ]);

        function getElementColorStyles(element) {
          const computedStyle = window.getComputedStyle(element);
          const colorStyles = [];
          if (paintedElements.has(element.localName)) {
            colorStyles.push(
              ["fill", computedStyle.fill],
              ["stroke", computedStyle.stroke]
            );
          }
          if (element.localName === "stop") {
            colorStyles.push(["stop-color", computedStyle.stopColor]);
          }
          return colorStyles;
        }

        function extractUniqueColorsFromSVG(svg) {
          const colors = new Set();
          getSvgElements(svg).forEach((element) => {
            getElementColorStyles(element).forEach(([, value]) => {
              const normalized = normalizeColor(value);
              if (normalized) colors.add(normalized);
            });
          });
          return [...colors];
        }

        function applyColorMappings(svg, mappings) {
          const colorAttributes = new Set([
            "color",
            "fill",
            "flood-color",
            "lighting-color",
            "solid-color",
            "stop-color",
            "stroke",
          ]);
          const colorTokenPattern =
            /#[0-9a-f]{3,8}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/gi;

          function replaceColorTokens(value) {
            return value.replace(colorTokenPattern, (token) => {
              const normalized = normalizeColor(token);
              const replacement = normalized && mappings[normalized];
              return replacement && /^#[0-9a-f]{6}$/i.test(replacement)
                ? replacement
                : token;
            });
          }

          function replaceStyleDeclarations(value) {
            return value.replace(
              /(^|[;{]\s*)(color|fill|flood-color|lighting-color|solid-color|stop-color|stroke)(\s*:\s*)([^;}]+)/gi,
              (declaration, prefix, property, separator, colorValue) =>
                `${prefix}${property}${separator}${replaceColorTokens(colorValue)}`
            );
          }

          getSvgElements(svg).forEach((element) => {
            Array.from(element.attributes).forEach((attribute) => {
              const name = attribute.name.toLowerCase();
              if (colorAttributes.has(name) || name === "data-original") {
                element.setAttribute(
                  attribute.name,
                  replaceColorTokens(attribute.value)
                );
              } else if (name === "style") {
                element.setAttribute(
                  attribute.name,
                  replaceStyleDeclarations(attribute.value)
                );
              }
            });

            if (element.localName === "style") {
              element.textContent = replaceStyleDeclarations(element.textContent);
            }
          });
        }

        function loadPackMappings(previousPackId, callback) {
          chrome.storage.sync.get(
            [
              "colorMappings",
              "colorMappingLocks",
              "colorMappingsByPack",
              "colorMappingLocksByPack",
            ],
            (data) => {
              if (chrome.runtime.lastError) {
                console.error(
                  "Could not load pack color mappings:",
                  chrome.runtime.lastError.message
                );
                callback({});
                return;
              }

              const mappingsByPack = { ...(data.colorMappingsByPack || {}) };
              const locksByPack = {
                ...(data.colorMappingLocksByPack || {}),
              };
              const isLegacyMappings =
                data.colorMappings &&
                typeof data.colorMappings === "object" &&
                !Array.isArray(data.colorMappings) &&
                Object.keys(data.colorMappings).every((color) =>
                  /^#[0-9a-f]{3,8}$/i.test(color)
                );
              const isLegacyLocks =
                data.colorMappingLocks &&
                typeof data.colorMappingLocks === "object" &&
                !Array.isArray(data.colorMappingLocks) &&
                Object.keys(data.colorMappingLocks).every((color) =>
                  /^#[0-9a-f]{3,8}$/i.test(color)
                );

              if (previousPackId && isLegacyMappings) {
                mappingsByPack[previousPackId] = {
                  ...data.colorMappings,
                  ...(mappingsByPack[previousPackId] || {}),
                };
              }
              if (previousPackId && isLegacyLocks) {
                locksByPack[previousPackId] = {
                  ...data.colorMappingLocks,
                  ...(locksByPack[previousPackId] || {}),
                };
              }

              const migrated =
                previousPackId && (isLegacyMappings || isLegacyLocks);
              const finish = () => {
                callback(
                  mappingsByPack[packId] &&
                    typeof mappingsByPack[packId] === "object"
                    ? mappingsByPack[packId]
                    : {}
                );
              };

              if (!migrated) {
                finish();
                return;
              }

              chrome.storage.sync.set(
                {
                  colorMappingsByPack: mappingsByPack,
                  colorMappingLocksByPack: locksByPack,
                },
                () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Could not migrate existing color mappings:",
                      chrome.runtime.lastError.message
                    );
                    finish();
                    return;
                  }
                  chrome.storage.sync.remove(
                    ["colorMappings", "colorMappingLocks"],
                    () => {
                      if (chrome.runtime.lastError) {
                        console.error(
                          "Could not remove migrated global color mappings:",
                          chrome.runtime.lastError.message
                        );
                      }
                      finish();
                    }
                  );
                }
              );
            }
          );
        }

        if (svgElement) {
          const uniqueColors = extractUniqueColorsFromSVG(svgElement);
          svgElement.setAttribute("width", size);
          svgElement.setAttribute("height", size);
          svgElement.setAttribute("id", iconName);

          const processWithMappings = (mappings) => {
            const svgClone = svgElement.cloneNode(true);
            applyColorMappings(svgClone, mappings);

            if (action === "copy") {
              normalizeForFigma(svgClone);

              const svgString = new XMLSerializer().serializeToString(svgClone);

              const textarea = document.createElement("textarea");
              textarea.value = svgString;
              document.body.appendChild(textarea);
              textarea.select();
              const copied = document.execCommand("copy");
              document.body.removeChild(textarea);

              if (!copied) {
                console.error("The browser could not copy the SVG to clipboard.");
                return;
              }

              chrome.runtime.sendMessage({
                type: "incrementSvgCounter",
                action: "copied",
              });

              chrome.storage.sync.get("autoClosePopup", function (settings) {
                const autoCloseEnabled = settings.autoClosePopup !== false;
                if (autoCloseEnabled) {
                  setTimeout(() => {
                    const closeButton = document.querySelector("#detail-close");
                    if (closeButton) closeButton.click();
                  }, 500);
                }
              });
            } else if (action === "download") {
              const blob = new Blob([svgClone.outerHTML], {
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

              chrome.storage.sync.get("autoClosePopup", function (settings) {
                const autoCloseEnabled = settings.autoClosePopup !== false;
                if (autoCloseEnabled) {
                  setTimeout(() => {
                    const closeButton = document.querySelector("#detail-close");
                    if (closeButton) closeButton.click();
                  }, 500);
                }
              });
            }
          };

          chrome.storage.local.get("lastCopiedIcon", (localData) => {
            const previousPackId =
              localData.lastCopiedIcon?.packId ||
              (Array.isArray(localData.lastCopiedColors)
                ? "legacy-pack"
                : null);
            if (action === "copy") {
              const copiedColors =
                localData.lastCopiedIcon?.packId === packId
                  ? [
                      ...new Set([
                        ...(localData.lastCopiedIcon.colors || []),
                        ...uniqueColors,
                      ]),
                    ]
                  : uniqueColors;
              const copiedIcon = {
                packId,
                packName,
                colors: copiedColors,
              };
              chrome.storage.local.set(
                {
                  lastCopiedIcon: copiedIcon,
                  lastCopiedColors: copiedColors,
                },
                () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Could not save detected icon pack colors:",
                      chrome.runtime.lastError.message
                    );
                  }
                }
              );
              chrome.storage.sync.get("colorPackNames", (syncData) => {
                const colorPackNames = {
                  ...(syncData.colorPackNames || {}),
                  [packId]: packName,
                };
                chrome.storage.sync.set({ colorPackNames }, () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Could not save icon pack name:",
                      chrome.runtime.lastError.message
                    );
                  }
                });
              });
            }
            loadPackMappings(previousPackId, processWithMappings);
          });
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
