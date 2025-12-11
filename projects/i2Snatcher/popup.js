document.addEventListener("DOMContentLoaded", function () {
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
      if (status === "approved") label = "Status: Approvedd";
      else if (status === "pending") label = "Status: Pending approval";
      else if (status === "blocked") label = "Status: Access blocked";
      else label = "Status: Unknown";

      userStatusDisplay.textContent = label;
    }
  });

  // Check and show shortcut nudge if needed
  async function checkShortcutsAndShowNudge() {
    try {
      const commands = await chrome.commands.getAll();
      const copyCommand = commands.find(cmd => cmd.name === "copy_svg");
      const downloadCommand = commands.find(cmd => cmd.name === "download_svg");
      
      const shortcutsRegistered = 
        (copyCommand && copyCommand.shortcut) && 
        (downloadCommand && downloadCommand.shortcut);
      
      const shortcutNudge = document.getElementById("shortcutNudge");
      const setupShortcutsBtn = document.getElementById("setupShortcutsBtn");
      
      if (!shortcutsRegistered && shortcutNudge) {
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
  svgSizeInput.focus();
});

chrome.runtime.sendMessage({ action: "getSVGCount" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "svgCountUpdated" || message.action === "updateSVGCount") {
    const { copied = 0, downloaded = 0 } = message.payload || {};
    chrome.storage.local.set({ svgCount: copied + downloaded });
  }
});
