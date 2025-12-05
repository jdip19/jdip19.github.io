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

  // Add event listener to update width dynamically as the user types
  svgSizeInput.addEventListener("input", function () {
    resizeInput(svgSizeInput);
  });

  // Initial resize in case there's a default value
  resizeInput(svgSizeInput);

  // Load images from storage when the popup opens
  chrome.storage.local.get("imageUrls", (data) => {
    if (data.imageUrls) {
      displayImages(data.imageUrls);
    }
  });

  // ✅ Load stored size when popup opens
  chrome.storage.sync.get("svgSize", function (data) {
    svgSizeInput.value = data.svgSize || 128;
    resizeInput(svgSizeInput); // Default size = 128
  });

  // ✅ Save size automatically when the user types
  svgSizeInput.addEventListener("input", function () {
    const svgSize = svgSizeInput.value || 128;
    chrome.storage.sync.set({ svgSize });
  });

  chrome.storage.local.get("svgCount", (data) => {
    document.getElementById("svgCount").innerText = data.svgCount || 0;
  });

  chrome.storage.local.get(["remoteVersion", "updateAvailable"], (data) => {
    const versionElement = document.getElementById("version");

    console.log(data.remoteVersion, data.updateAvailable);

    if (data.updateAvailable) {
      versionElement.textContent = `v${data.remoteVersion}`;
      versionElement.classList.add("blink");
    } else {
      versionElement.textContent = `v${data.remoteVersion}`;
      versionElement.classList.remove("blink");
    }
  });

  // Load and handle auto-close toggle setting (default: true)
  chrome.storage.sync.get("autoClosePopup", function (data) {
    const autoCloseEnabled = data.autoClosePopup !== false; // Default to true
    autoCloseToggle.checked = autoCloseEnabled;
  });

  // Save auto-close preference when toggle changes
  autoCloseToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ autoClosePopup: autoCloseToggle.checked });
    console.log("Auto-close popup:", autoCloseToggle.checked ? "enabled" : "disabled");
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
        
        // Add click handler to open shortcuts page
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

  // Check shortcuts when popup opens
  checkShortcutsAndShowNudge();

  svgSizeInput.focus();
});

chrome.runtime.sendMessage({ action: "getSVGCount" });

chrome.runtime.onMessage.addListener((message) => {
  if (
    message.type === "svgCountUpdated" ||
    message.action === "updateSVGCount"
  ) {
    const { copied = 0, downloaded = 0 } = message.payload || {};
    // document.getElementById("copiedCount").innerText = copied;
    // document.getElementById("downloadedCount").innerText = downloaded;
    chrome.storage.local.set({ svgCount: copied + downloaded });
  }
});
