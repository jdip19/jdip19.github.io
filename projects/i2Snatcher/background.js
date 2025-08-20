import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB00lLnYNjAI_TqdvlDniEK9wgaFQ0143I",
  authDomain: "imager-678f0.firebaseapp.com",
  databaseURL: "https://imager-678f0-default-rtdb.firebaseio.com",
  projectId: "imager-678f0",
  storageBucket: "imager-678f0.firebasestorage.app",
  messagingSenderId: "453061054446",
  appId: "1:453061054446:web:7069245e2df8434bba48ff",
  measurementId: "G-BY5SXCLK6L",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const versionRef = ref(database, "ueVersion");
const localVersion = chrome.runtime.getManifest().version;

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

// Create context menus when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
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
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "copySvg") {
    processSvg(info.linkUrl, "copy");
  } else if (info.menuItemId === "downloadSvg") {
    processSvg(info.linkUrl, "download");
  }
});

// Handle keyboard shortcut commands
chrome.commands.onCommand.addListener((command) => {
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
    const dbRef = ref(database, `svgStats/${action}`);

    // Step 1: Optimistically update local storage
    chrome.storage.local.get(["svgStats"], (result) => {
      let localData = result.svgStats || { copied: 0, downloaded: 0 };
      localData[action] = (localData[action] || 0) + 1;

      // Save updated local count
      chrome.storage.local.set({ svgStats: localData });

      // Send quick update to popup
      chrome.runtime.sendMessage({
        type: "svgCountUpdated",
        payload: { ...localData },
      });

      // Step 2: Update in Firebase
      get(dbRef)
        .then((snapshot) => {
          const currentValue = snapshot.exists() ? snapshot.val() : 0;
          return set(dbRef, currentValue + 1);
        })
        .then(() => {
          // Fetch final confirmed counts from Firebase
          const copiedRef = ref(database, "svgStats/copied");
          const downloadedRef = ref(database, "svgStats/downloaded");

          return Promise.all([get(copiedRef), get(downloadedRef)]);
        })
        .then(([copiedSnap, downloadedSnap]) => {
          const copied = copiedSnap.exists() ? copiedSnap.val() : 0;
          const downloaded = downloadedSnap.exists() ? downloadedSnap.val() : 0;

          const finalCounts = { copied, downloaded };

          // Update local storage again with true Firebase values
          chrome.storage.local.set({ svgStats: finalCounts });

          // Optional: re-send to popup
          chrome.runtime.sendMessage({
            type: "svgCountUpdated",
            payload: finalCounts,
          });
        })
        .catch((error) => {
          console.error("Firebase update error:", error);
        });
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
