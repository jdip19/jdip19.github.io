document.addEventListener("DOMContentLoaded", function () {
  const accessGate = document.getElementById("accessGate");
  const accessForm = document.getElementById("accessRequestForm");
  const accessNameInput = document.getElementById("accessName");
  const accessMessage = document.getElementById("accessMessage");
  const accessDescription = document.getElementById("accessDescription");
  const requestAccessButton = document.getElementById("requestAccessButton");
  const checkAccessButton = document.getElementById("checkAccessButton");
  const mainContainer = document.getElementById("container");

  function showAccessState(result) {
    chrome.storage.sync.get("clientId", (data) => {
      if (data.clientId) {
        document.getElementById("accessClientId").textContent =
          `Extension ID: ${data.clientId}`;
      }
    });
    const state = result?.status || "unknown";
    if (state === "approved") {
      accessGate.hidden = true;
      mainContainer.style.display = "block";
      return;
    }

    accessGate.hidden = false;
    mainContainer.style.display = "none";
    if (state === "pending") {
      accessDescription.textContent =
        "Your request has been sent. i2Snatcher will be available after an admin approves it.";
      accessForm.hidden = true;
      accessMessage.textContent = "Access request pending approval.";
    } else {
      accessDescription.textContent =
        "Enter your name to request access to i2Snatcher. You can use the extension after your request is approved.";
      accessForm.hidden = false;
      accessMessage.textContent =
        result?.error || "Could not check access. Please try again.";
    }
  }

  function checkAccess() {
    accessMessage.textContent = "Checking access...";
    chrome.runtime.sendMessage({ action: "getAccessStatus" }, (result) => {
      if (chrome.runtime.lastError) {
        showAccessState({
          status: "unknown",
          error: "Could not contact the extension service. Try again.",
        });
        return;
      }
      showAccessState(result);
    });
  }

  chrome.storage.sync.get(["accessRequestName", "clientId"], (data) => {
    if (data.accessRequestName) accessNameInput.value = data.accessRequestName;
    const clientId = document.getElementById("accessClientId");
    if (data.clientId) clientId.textContent = `Extension ID: ${data.clientId}`;
  });

  accessForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const displayName = accessNameInput.value.trim();
    if (!displayName || displayName.length > 80) {
      accessMessage.textContent = "Enter a name between 1 and 80 characters.";
      return;
    }
    requestAccessButton.disabled = true;
    accessMessage.textContent = "Sending access request...";
    chrome.storage.sync.set({ accessRequestName: displayName }, () => {
      chrome.runtime.sendMessage(
        { action: "requestAccess", displayName },
        (result) => {
          requestAccessButton.disabled = false;
          if (chrome.runtime.lastError) {
            showAccessState({
              status: "unknown",
              error: "Could not send request. Please try again.",
            });
            return;
          }
          showAccessState(result);
        }
      );
    });
  });

  checkAccessButton.addEventListener("click", checkAccess);
  checkAccess();

  const iconTab = document.getElementById("iconTab");
  const imageTab = document.getElementById("imageTab");
  const settingsTab = document.getElementById("settingsTab");
  const iconContent = document.getElementById("iconContent");
  const imageContent = document.getElementById("imageContent");
  const settingsContent = document.getElementById("settingsContent");
  const imageList = document.getElementById("imageList");
  const svgSizeInput = document.getElementById("svgSize");
  const autoCloseToggle = document.getElementById("autoCloseToggle");
  const clientIdDisplay = document.getElementById("clientIdDisplay");
  const userStatusDisplay = document.getElementById("userStatusDisplay");
  const colorMappingRows = document.getElementById("colorMappingRows");
  const colorPackHeading = document.getElementById("colorPackHeading");
  const clearPackMappingsButton = document.getElementById("clearPackMappings");
  const clearAllColorRowsButton = document.getElementById("clearAllColorRows");
  const toggleAllColorLocksButton = document.getElementById(
    "toggleAllColorLocks"
  );
  let lastCopiedIcon = null;
  let colorMappingsByPack = {};
  let colorMappingLocksByPack = {};
  let colorPackNames = {};
  let colorsLoaded = false;
  let mappingsLoaded = false;

  // Add click event listeners for tabs
  iconTab.addEventListener("click", function () {
    iconTab.classList.add("active");
    imageTab.classList.remove("active");
    settingsTab.classList.remove("active");
    iconContent.classList.add("active");
    imageContent.classList.remove("active");
    settingsContent.classList.remove("active");
  });

  imageTab.addEventListener("click", function () {
    imageTab.classList.add("active");
    iconTab.classList.remove("active");
    settingsTab.classList.remove("active");
    imageContent.classList.add("active");
    iconContent.classList.remove("active");
    settingsContent.classList.remove("active");
  });

  settingsTab.addEventListener("click", function () {
    settingsTab.classList.add("active");
    iconTab.classList.remove("active");
    imageTab.classList.remove("active");
    settingsContent.classList.add("active");
    iconContent.classList.remove("active");
    imageContent.classList.remove("active");
  });

  // Function to display images based on the selected filter
  function displayImages(images) {
    imageList.innerHTML = ""; // Clear previous images

    const selectedFilter = document.querySelector(
      'input[name="imageFilter"]:checked'
    ).value;
    const message = document.getElementById("message");
    message.style.display = "none";

    let hasImages = false;

    images.forEach((imageSrc) => {
      if (
        (selectedFilter === "jpeg" &&
          (imageSrc.endsWith(".jpg") || imageSrc.endsWith(".jpeg"))) ||
        (selectedFilter === "png" && imageSrc.endsWith(".png")) ||
        (selectedFilter === "webp" && imageSrc.endsWith(".webp"))
      ) {
        hasImages = true;
        const li = document.createElement("li");
        const img = document.createElement("img");
        img.src = imageSrc;
        li.appendChild(img);
        imageList.appendChild(li);
      }
    });

    if (!hasImages) {
      message.style.display = "flex";
    } else {
      message.style.display = "none";
    }
  }

  document.querySelectorAll('input[name="imageFilter"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      chrome.storage.local.get("imageUrls", (data) => {
        if (data.imageUrls) {
          displayImages(data.imageUrls);
        }
      });
    });
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];

    // Prevent script injection on restricted URLs
    if (
      !tab ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("https://chrome.google.com/webstore")
    ) {
      console.warn("Cannot inject content script into this tab:", tab.url);
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ["contentScript.js"],
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          const images = results[0].result;
          if (images.length > 0) {
            chrome.storage.local.set({ imageUrls: images }, () => {
              displayImages(images);
            });
          }
        }
      }
    );
  });
  function resizeInput(input) {
    input.style.width = input.value.length ? input.value.length + "ch" : "2ch";
  }

  function getPackColors(colorCollection, packId) {
    const colors = colorCollection[packId];
    return colors && typeof colors === "object" && !Array.isArray(colors)
      ? colors
      : {};
  }

  function renderColorRow(packId, sourceColor, parent) {
    const mappings = getPackColors(colorMappingsByPack, packId);
    const locks = getPackColors(colorMappingLocksByPack, packId);
    const isLocked = locks[sourceColor] === true;
    const row = document.createElement("div");
    row.className = "color-mapping-row";

    const source = document.createElement("span");
    source.className = "color-mapping-source";

    const swatch = document.createElement("span");
    swatch.className = "color-mapping-swatch";
    swatch.style.backgroundColor = sourceColor;
    swatch.setAttribute("aria-hidden", "true");

    const colorLabel = document.createElement("span");
    colorLabel.textContent = sourceColor.slice(1).toUpperCase();
    source.append(swatch, colorLabel);

    const target = document.createElement("span");
    target.className = "color-mapping-target";

    const replacementColor = mappings[sourceColor] || sourceColor;
    const replacementPicker = document.createElement("input");
    replacementPicker.type = "color";
    replacementPicker.value = replacementColor;
    replacementPicker.setAttribute(
      "aria-label",
      `Choose replacement for ${sourceColor}`
    );

    const replacementHex = document.createElement("input");
    replacementHex.type = "text";
    replacementHex.className = "color-mapping-hex";
    replacementHex.value = replacementColor.slice(1).toUpperCase();
    replacementHex.maxLength = 7;
    replacementHex.spellcheck = false;
    replacementHex.setAttribute(
      "aria-label",
      `Hex replacement for ${sourceColor}`
    );

    function saveReplacement(value) {
      const updatedMappings = { ...colorMappingsByPack };
      const packMappings = { ...mappings };
      if (value === sourceColor) {
        delete packMappings[sourceColor];
      } else {
        packMappings[sourceColor] = value;
      }

      if (Object.keys(packMappings).length) {
        updatedMappings[packId] = packMappings;
      } else {
        delete updatedMappings[packId];
      }
      chrome.storage.sync.set(
        { colorMappingsByPack: updatedMappings },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Could not save color mappings:",
              chrome.runtime.lastError.message
            );
            return;
          }
          colorMappingsByPack = updatedMappings;
          renderColorMappings();
        }
      );
    }

    replacementPicker.addEventListener("input", () => {
      replacementHex.value = replacementPicker.value.slice(1).toUpperCase();
    });
    replacementPicker.addEventListener("change", () => {
      saveReplacement(replacementPicker.value.toLowerCase());
    });
    replacementHex.addEventListener("change", () => {
      const hex = replacementHex.value.trim().replace(/^#/, "");
      if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
        replacementHex.setCustomValidity("Enter a 3- or 6-digit hex color.");
        replacementHex.reportValidity();
        replacementHex.value = replacementPicker.value.slice(1).toUpperCase();
        replacementHex.setCustomValidity("");
        return;
      }

      const normalizedHex =
        hex.length === 3
          ? `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`
          : `#${hex}`;
      replacementPicker.value = normalizedHex;
      saveReplacement(normalizedHex.toLowerCase());
    });

    const lockButton = document.createElement("button");
    lockButton.type = "button";
    lockButton.className = "color-mapping-lock";
    lockButton.setAttribute("aria-pressed", String(isLocked));
    lockButton.setAttribute(
      "aria-label",
      `${isLocked ? "Unpin" : "Pin"} color row ${sourceColor}`
    );
    lockButton.title = isLocked
      ? "Keep this row visible between icons; click to unpin"
      : "Keep this row visible between icons";
    lockButton.innerHTML = isLocked
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path><path d="M12 14v3"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2"></rect><path d="M8 10V7a4 4 0 0 1 7.5-2.7"></path><path d="M12 14v3"></path></svg>';
    lockButton.addEventListener("click", () => {
      const updatedLocks = { ...colorMappingLocksByPack };
      const packLocks = { ...locks };
      if (isLocked) {
        delete packLocks[sourceColor];
      } else {
        packLocks[sourceColor] = true;
      }
      if (Object.keys(packLocks).length) {
        updatedLocks[packId] = packLocks;
      } else {
        delete updatedLocks[packId];
      }

      const updatedNames = {
        ...colorPackNames,
        [packId]: packId === lastCopiedIcon?.packId
          ? lastCopiedIcon.packName
          : colorPackNames[packId] || "Pinned icon pack",
      };
      chrome.storage.sync.set(
        {
          colorMappingLocksByPack: updatedLocks,
          colorPackNames: updatedNames,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Could not save color mapping lock:",
              chrome.runtime.lastError.message
            );
            return;
          }
          colorMappingLocksByPack = updatedLocks;
          colorPackNames = updatedNames;
          renderColorMappings();
        }
      );
    });

    target.append(replacementPicker, replacementHex);
    row.append(source, target, lockButton);
    parent.appendChild(row);
  }

  function getDisplayedColorGroups() {
    const activePackId = lastCopiedIcon?.packId;
    const groups = new Map();
    if (activePackId) {
      const activeColors = new Set([
        ...(lastCopiedIcon.colors || []),
        ...Object.keys(getPackColors(colorMappingsByPack, activePackId)),
        ...Object.keys(getPackColors(colorMappingLocksByPack, activePackId)),
      ]);
      groups.set(activePackId, [...activeColors]);
    }

    Object.entries(colorMappingLocksByPack).forEach(([packId, packLocks]) => {
      const pinnedColors = Object.keys(packLocks || {}).filter(
        (color) => packLocks[color] === true
      );
      if (!pinnedColors.length || packId === activePackId) return;
      groups.set(packId, pinnedColors);
    });
    return groups;
  }

  function renderColorMappings() {
    if (!colorsLoaded || !mappingsLoaded) return;

    colorMappingRows.replaceChildren();
    const activePackId = lastCopiedIcon?.packId;
    colorPackHeading.textContent = lastCopiedIcon?.packName
      ? `${lastCopiedIcon.packName}`
      : "Copy an icon to detect its pack colors";
    const groups = getDisplayedColorGroups();
    const visibleRowCount = [...groups.values()].reduce(
      (count, colors) => count + colors.length,
      0
    );
    clearPackMappingsButton.disabled = !activePackId;
    clearAllColorRowsButton.disabled =
      visibleRowCount === 0 &&
      Object.keys(colorMappingsByPack).length === 0 &&
      Object.keys(colorMappingLocksByPack).length === 0;
    const allVisibleRowsLocked =
      visibleRowCount > 0 &&
      [...groups.entries()].every(([packId, colors]) => {
        const locks = getPackColors(colorMappingLocksByPack, packId);
        return colors.every((color) => locks[color] === true);
      });
    toggleAllColorLocksButton.textContent = allVisibleRowsLocked
      ? "Unlock all"
      : "Lock all";
    toggleAllColorLocksButton.disabled = visibleRowCount === 0;

    if (!groups.size) {
      const emptyState = document.createElement("p");
      emptyState.className = "color-mapping-empty";
      emptyState.textContent =
        "Copy an SVG with Alt+Shift+C to detect its colors.";
      colorMappingRows.appendChild(emptyState);
      return;
    }

    groups.forEach((colors, packId) => {
      const group = document.createElement("div");
      if (packId !== activePackId) {
        const heading = document.createElement("h4");
        heading.className = "color-pack-pinned-heading";
        heading.textContent = `Pinned: ${colorPackNames[packId] || "Icon pack"}`;
        group.appendChild(heading);
      }
      colors.forEach((color) => renderColorRow(packId, color, group));
      colorMappingRows.appendChild(group);
    });
  }

  clearPackMappingsButton.addEventListener("click", () => {
    const activePackId = lastCopiedIcon?.packId;
    if (!activePackId) return;
    const updatedMappings = { ...colorMappingsByPack };
    delete updatedMappings[activePackId];
    chrome.storage.sync.set(
      { colorMappingsByPack: updatedMappings },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Could not clear this pack's color mappings:",
            chrome.runtime.lastError.message
          );
          return;
        }
        colorMappingsByPack = updatedMappings;
        renderColorMappings();
      }
    );
  });

  clearAllColorRowsButton.addEventListener("click", () => {
    chrome.storage.sync.set(
      { colorMappingsByPack: {}, colorMappingLocksByPack: {}, colorPackNames: {} },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Could not clear color mappings:",
            chrome.runtime.lastError.message
          );
          return;
        }
        colorMappingsByPack = {};
        colorMappingLocksByPack = {};
        colorPackNames = {};
        chrome.storage.sync.remove(
          ["colorMappings", "colorMappingLocks"],
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Could not remove legacy color mappings:",
                chrome.runtime.lastError.message
              );
              return;
            }
            chrome.storage.local.remove(
              ["lastCopiedIcon", "lastCopiedColors"],
              () => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Could not clear detected color rows:",
                    chrome.runtime.lastError.message
                  );
                  return;
                }
                lastCopiedIcon = null;
                colorsLoaded = true;
                renderColorMappings();
              }
            );
          }
        );
      }
    );
  });

  toggleAllColorLocksButton.addEventListener("click", () => {
    const groups = getDisplayedColorGroups();
    const colors = [...groups.entries()];
    const allLocked =
      colors.length > 0 &&
      colors.every(([packId, packColors]) => {
        const locks = getPackColors(colorMappingLocksByPack, packId);
        return packColors.every((color) => locks[color] === true);
      });
    const updatedLocks = { ...colorMappingLocksByPack };
    const updatedNames = { ...colorPackNames };

    colors.forEach(([packId, packColors]) => {
      const packLocks = { ...getPackColors(updatedLocks, packId) };
      packColors.forEach((color) => {
        if (allLocked) {
          delete packLocks[color];
        } else {
          packLocks[color] = true;
        }
      });
      if (Object.keys(packLocks).length) {
        updatedLocks[packId] = packLocks;
        updatedNames[packId] =
          packId === lastCopiedIcon?.packId
            ? lastCopiedIcon.packName
            : colorPackNames[packId] || "Pinned icon pack";
      } else {
        delete updatedLocks[packId];
        delete updatedNames[packId];
      }
    });

    chrome.storage.sync.set(
      {
        colorMappingLocksByPack: updatedLocks,
        colorPackNames: updatedNames,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(
            "Could not update color row locks:",
            chrome.runtime.lastError.message
          );
          return;
        }
        colorMappingLocksByPack = updatedLocks;
        colorPackNames = updatedNames;
        renderColorMappings();
      }
    );
  });

  chrome.storage.local.get(["lastCopiedIcon", "lastCopiedColors"], (data) => {
    if (chrome.runtime.lastError) {
      console.error(
        "Could not load colors from the last copied SVG:",
        chrome.runtime.lastError.message
      );
      return;
    }
    lastCopiedIcon =
      data.lastCopiedIcon && typeof data.lastCopiedIcon === "object"
        ? data.lastCopiedIcon
        : data.lastCopiedColors
        ? {
            packId: "legacy-pack",
            packName: "Previously copied icon pack",
            colors: data.lastCopiedColors,
          }
        : null;
    colorsLoaded = true;
    renderColorMappings();
  });

  chrome.storage.sync.get(
    [
      "colorMappingsByPack",
      "colorMappingLocksByPack",
      "colorPackNames",
      "colorMappings",
      "colorMappingLocks",
    ],
    (data) => {
      if (chrome.runtime.lastError) {
        console.error(
          "Could not load color mappings:",
          chrome.runtime.lastError.message
        );
        return;
      }
      colorMappingsByPack =
        data.colorMappingsByPack &&
        typeof data.colorMappingsByPack === "object" &&
        !Array.isArray(data.colorMappingsByPack)
          ? data.colorMappingsByPack
          : {};
      colorMappingLocksByPack =
        data.colorMappingLocksByPack &&
        typeof data.colorMappingLocksByPack === "object" &&
        !Array.isArray(data.colorMappingLocksByPack)
          ? data.colorMappingLocksByPack
          : {};
      colorPackNames =
        data.colorPackNames &&
        typeof data.colorPackNames === "object" &&
        !Array.isArray(data.colorPackNames)
          ? data.colorPackNames
          : {};

      const previousPackId = lastCopiedIcon?.packId || "legacy-pack";
      if (
        data.colorMappings &&
        typeof data.colorMappings === "object" &&
        !Array.isArray(data.colorMappings) &&
        Object.keys(data.colorMappings).every((color) =>
          /^#[0-9a-f]{3,8}$/i.test(color)
        )
      ) {
        colorMappingsByPack[previousPackId] = {
          ...data.colorMappings,
          ...getPackColors(colorMappingsByPack, previousPackId),
        };
        colorPackNames[previousPackId] =
          colorPackNames[previousPackId] ||
          lastCopiedIcon?.packName ||
          "Previously copied icon pack";
      }
      if (
        data.colorMappingLocks &&
        typeof data.colorMappingLocks === "object" &&
        !Array.isArray(data.colorMappingLocks) &&
        Object.keys(data.colorMappingLocks).every((color) =>
          /^#[0-9a-f]{3,8}$/i.test(color)
        )
      ) {
        colorMappingLocksByPack[previousPackId] = {
          ...data.colorMappingLocks,
          ...getPackColors(colorMappingLocksByPack, previousPackId),
        };
      }
      mappingsLoaded = true;
      renderColorMappings();
    }
  );

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "local" && changes.lastCopiedIcon) {
      lastCopiedIcon = changes.lastCopiedIcon.newValue || null;
      colorsLoaded = true;
      renderColorMappings();
    }
    if (areaName !== "sync") return;
    if (changes.colorMappingsByPack) {
      colorMappingsByPack = changes.colorMappingsByPack.newValue || {};
      mappingsLoaded = true;
    }
    if (changes.colorMappingLocksByPack) {
      colorMappingLocksByPack =
        changes.colorMappingLocksByPack.newValue || {};
      mappingsLoaded = true;
    }
    if (changes.colorPackNames) {
      colorPackNames = changes.colorPackNames.newValue || {};
    }
    renderColorMappings();
  });

  svgSizeInput.addEventListener("input", function () {
    resizeInput(svgSizeInput);
    const svgSize = svgSizeInput.value || 128;
    chrome.storage.sync.set({ svgSize });
  });

  resizeInput(svgSizeInput);

  chrome.storage.local.get("imageUrls", (data) => {
    if (data.imageUrls) displayImages(data.imageUrls);
  });

  chrome.storage.sync.get("svgSize", function (data) {
    svgSizeInput.value = data.svgSize || 128;
    resizeInput(svgSizeInput);
  });

  chrome.storage.local.get("svgCount", (data) => {
    document.getElementById("svgCount").innerText = data.svgCount || 0;
  });

  chrome.storage.local.get(["remoteVersion", "updateAvailable"], (data) => {
    const versionElement = document.getElementById("version");
    versionElement.textContent = `v${data.remoteVersion}`;
    if (data.updateAvailable) {
      versionElement.classList.add("blink");
    } else {
      versionElement.classList.remove("blink");
    }
  });

  chrome.storage.sync.get("autoClosePopup", function (data) {
    const autoCloseEnabled = data.autoClosePopup !== false;
    autoCloseToggle.checked = autoCloseEnabled;
  });

  autoCloseToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ autoClosePopup: autoCloseToggle.checked });
  });

  chrome.storage.local.get(["clientId", "userStatus"], (data) => {
    if (clientIdDisplay && data.clientId) {
      clientIdDisplay.textContent = data.clientId;
    }

    if (userStatusDisplay) {
      const status = data.userStatus || "unknown";
      let label = "";
      if (status === "approved") label = "Status: Approved";
      else if (status === "pending") label = "Status: Pending approval";
      else label = "Status: Unknown";

      userStatusDisplay.textContent = label;
    }
  });

  // Check and show shortcut nudge if needed
  async function checkShortcutsAndShowNudge() {
    try {
      const commands = await chrome.commands.getAll();
      const shortcutNames = {
        _execute_action: "Alt+Shift+P",
        copy_svg: "Alt+Shift+C",
        download_svg: "Alt+Shift+D",
      };
      const missingShortcuts = commands
        .filter((command) => shortcutNames[command.name] && !command.shortcut)
        .map((command) => shortcutNames[command.name]);

      const shortcutNudge = document.getElementById("shortcutNudge");
      const setupShortcutsBtn = document.getElementById("setupShortcutsBtn");
      const shortcutNudgeText = document.getElementById("shortcutNudgeText");

      if (missingShortcuts.length > 0 && shortcutNudge) {
        shortcutNudgeText.textContent = `Set up missing shortcuts: ${missingShortcuts.join(
          ", "
        )}`;
        shortcutNudge.style.display = "block";
        setupShortcutsBtn.addEventListener("click", () => {
          chrome.tabs.create({ url: "chrome://extensions/shortcuts" });
        });
      } else if (shortcutNudge) {
        shortcutNudge.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking shortcuts:", error);
    }
  }

  checkShortcutsAndShowNudge();
});

chrome.runtime.sendMessage({ action: "getSVGCount" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "svgCountUpdated" || message.action === "updateSVGCount") {
    const { copied = 0, downloaded = 0 } = message.payload || {};
    chrome.storage.local.set({ svgCount: copied + downloaded });
  }
});
