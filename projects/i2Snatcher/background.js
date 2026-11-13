const localVersion = chrome.runtime.getManifest().version;
const SUPABASE_API_URL =
  "https://jfxwmldeikfmiwhjnsgg.supabase.co/functions/v1/i2snatcher-api";
const SUPABASE_ANON_KEY =
  "sb_publishable_65G3T7wUY1zz0Cm5z4dMNQ_j4neKB85";

class SupabaseRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "SupabaseRequestError";
    this.status = status;
  }
}

async function i2SnatcherApiRequest(payload) {
  const response = await fetch(SUPABASE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(payload),
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new SupabaseRequestError(
      "Supabase returned an invalid response.",
      response.status
    );
  }
  if (!response.ok) {
    throw new SupabaseRequestError(
      data.error || `Supabase request failed (${response.status}).`,
      response.status
    );
  }
  return data;
}

function compareVersions(left, right) {
  const leftParts = String(left).split(".").map(Number);
  const rightParts = String(right).split(".").map(Number);
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const difference =
      (leftParts[index] || 0) - (rightParts[index] || 0);
    if (difference !== 0) return Math.sign(difference);
  }
  return 0;
}

async function checkRemoteVersion() {
  try {
    const response = await fetch(
      "https://jdip19.github.io/projects/i2Snatcher/manifest.json",
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Version check failed (${response.status}).`);
    }
    const manifest = await response.json();
    if (typeof manifest.version !== "string") {
      throw new Error("Published extension manifest has no version.");
    }
    chrome.storage.local.set({
      remoteVersion: manifest.version,
      updateAvailable: compareVersions(manifest.version, localVersion) > 0,
    });
  } catch (error) {
    console.error("Could not check the remote extension version:", error);
  }
}

checkRemoteVersion();

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => {
    console.error("Could not enable the extension side panel:", error);
  });

// Per-user licensing / access control
let clientId = null;
let userStatus = "unknown"; // "approved" | "pending" | "unknown"
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

// Fetch user status and current usage totals from Supabase.
async function refreshUserStatus(displayName) {
  try {
    const id = await getOrCreateClientId();
    const data = await i2SnatcherApiRequest({
      action: "status",
      clientId: id,
      ...(displayName ? { displayName } : {}),
    });
    const approvalFlag = Number(data.approved);
    if (approvalFlag !== 0 && approvalFlag !== 1) {
      throw new Error("Supabase returned an invalid approval value.");
    }

    userStatus = approvalFlag === 1 ? "approved" : "pending";
    statusCheckedAt = Date.now();
    const totals = {
      copied: Number(data.copied) || 0,
      downloaded: Number(data.downloaded) || 0,
    };
    chrome.storage.local.set({
      clientId: id,
      userStatus,
      statusCheckedAt,
      svgStats: totals,
    });
    chrome.runtime.sendMessage({
      type: "svgCountUpdated",
      payload: totals,
    }, () => void chrome.runtime.lastError);
    if (userStatus === "approved") syncPendingUsageEvents();
    return { status: userStatus };
  } catch (error) {
    console.error("Error refreshing user status:", error);
    userStatus = "unknown";
    statusCheckedAt = 0;
    chrome.storage.local.set({ userStatus, statusCheckedAt });
    return {
      status: userStatus,
      error: error instanceof Error ? error.message : "Could not check access.",
    };
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
        if (age >= 0 && age < STATUS_CACHE_TTL && stored !== "unknown") {
          // cached non-approved decision is recent enough to use
          userStatus = stored;
          statusCheckedAt = checkedAt;
          return resolve(stored === "approved");
        }

        // Otherwise, perform a remote refresh but don't block too long.
        // If refresh doesn't finish within TIMEOUT, fall back to stored value (if any)
        const REFRESH_TIMEOUT = 5000;

        let timedOut = false;
        const timeout = setTimeout(() => {
          timedOut = true;
          resolve(false);
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

let isSyncingUsageEvents = false;
let usageSyncRequested = false;
let usageQueueWrite = Promise.resolve();

function getLocalStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

function setLocalStorage(values) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

async function syncPendingUsageEvents() {
  if (isSyncingUsageEvents) {
    usageSyncRequested = true;
    return;
  }
  isSyncingUsageEvents = true;
  try {
    while (true) {
      const stored = await getLocalStorage(["pendingUsageEvents"]);
      const pending = Array.isArray(stored.pendingUsageEvents)
        ? stored.pendingUsageEvents
        : [];
      if (pending.length === 0) break;

      const event = pending[0];
      try {
        const result = await i2SnatcherApiRequest({
          action: "increment",
          clientId: await getOrCreateClientId(),
          eventId: event.eventId,
          actionType: event.actionType,
        });
        const latest = await getLocalStorage(["pendingUsageEvents"]);
        const remaining = Array.isArray(latest.pendingUsageEvents)
          ? latest.pendingUsageEvents.filter(
              (item) => item.eventId !== event.eventId
            )
          : [];
        const totals = {
          copied: Number(result.copied) || 0,
          downloaded: Number(result.downloaded) || 0,
        };
        await setLocalStorage({ pendingUsageEvents: remaining, svgStats: totals });
        chrome.runtime.sendMessage({
          type: "svgCountUpdated",
          payload: totals,
        }, () => void chrome.runtime.lastError);
      } catch (error) {
        if (error instanceof SupabaseRequestError && error.status === 403) {
          console.error("Pending usage events rejected because extension access is not approved.");
          await setLocalStorage({ pendingUsageEvents: [] });
        } else {
          console.error("Could not sync pending i2Snatcher usage:", error);
        }
        break;
      }
    }
  } catch (error) {
    console.error("Could not load pending i2Snatcher usage:", error);
  } finally {
    isSyncingUsageEvents = false;
    if (usageSyncRequested) {
      usageSyncRequested = false;
      syncPendingUsageEvents();
    }
  }
}

function queueUsageEvent(action) {
  usageQueueWrite = usageQueueWrite
    .then(async () => {
      const stored = await getLocalStorage(["svgStats", "pendingUsageEvents"]);
      const stats = stored.svgStats || { copied: 0, downloaded: 0 };
      const pending = Array.isArray(stored.pendingUsageEvents)
        ? stored.pendingUsageEvents
        : [];
      const totals = {
        copied: Number(stats.copied) || 0,
        downloaded: Number(stats.downloaded) || 0,
      };
      totals[action] += 1;
      pending.push({ eventId: crypto.randomUUID(), actionType: action });
      await setLocalStorage({ svgStats: totals, pendingUsageEvents: pending });
      chrome.runtime.sendMessage({
        type: "svgCountUpdated",
        payload: totals,
      }, () => void chrome.runtime.lastError);
      syncPendingUsageEvents();
    })
    .catch((error) => {
      console.error("Could not queue i2Snatcher usage event:", error);
    });
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

  syncPendingUsageEvents();
});

// Check shortcuts on startup
chrome.runtime.onStartup.addListener(() => {
  setTimeout(() => {
    checkAndNudgeShortcuts();
  }, 1000);

  // Refresh user status on startup
  refreshUserStatus();

  syncPendingUsageEvents();
});

// Check shortcuts on initial load
setTimeout(() => {
  checkAndNudgeShortcuts();
  refreshUserStatus();
}, 2000);

// Retry persisted usage events while the extension service worker is active.
setInterval(() => {
  syncPendingUsageEvents();
}, 30000);

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
  if (message.action === "getAccessStatus") {
    refreshUserStatus().then(sendResponse);
    return true;
  }
  if (message.action === "requestAccess") {
    const displayName =
      typeof message.displayName === "string" ? message.displayName.trim() : "";
    if (!displayName || displayName.length > 80) {
      sendResponse({ status: "unknown", error: "Enter a name up to 80 characters." });
      return;
    }
    refreshUserStatus(displayName).then(sendResponse);
    return true;
  }

  if (message.type === "incrementSvgCounter") {
    if (message.action === "copied" || message.action === "downloaded") {
      queueUsageEvent(message.action);
    } else {
      console.error("Ignoring invalid i2Snatcher usage action:", message.action);
    }
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
