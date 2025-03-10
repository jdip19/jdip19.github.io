// Create context menus when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "copySvg",
        title: "Copy SVG Content",
        contexts: ["link"]
    });

    chrome.contextMenus.create({
        id: "downloadSvg",
        title: "Download SVG File",
        contexts: ["link"]
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

            chrome.scripting.executeScript({
                target: { tabId },
                function: extractSvg,
                args: [action]
            });
        }
    });
});

// Open the link in a background tab and extract the SVG
function processSvg(detailLink, action) {
    chrome.tabs.create({ url: detailLink, active: false }, (tab) => {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractSvg,
            args: [action]
        });
    });
}

// Extract SVG and handle copy/download
function extractSvg(action) {
    const editButton = document.querySelector('#detail_edit_icon');

    if (editButton) {
        editButton.click(); // Simulate click to load the SVG

        chrome.storage.sync.get("svgSize", function (data) {

            const size = data.svgSize || 128;  // Default size if not set

            const editButton = document.querySelector('#detail_edit_icon');
            if (editButton) editButton.click();


            setTimeout(() => {
                const svgElement = document.querySelector('.detail__editor__icon-holder svg');
                const titleElement = document.querySelector('aside.detail__sidebar.col--stretch div h1');
                const categoryElement = document.querySelector('a.link--normal.mg-right-lv1');


                let iconName = titleElement && categoryElement
                    ? `${titleElement.textContent.trim()}_${categoryElement.textContent.trim()}`
                    : "icon";

                if (svgElement) {
                    svgElement.setAttribute('width', size);
                    svgElement.setAttribute('height', size);
                    svgElement.setAttribute('id', iconName);
                    if (action === "copy") {

                        const serializer = new XMLSerializer();
                        const svgString = serializer.serializeToString(svgElement);

                        const textarea = document.createElement('textarea');
                        textarea.value = svgString;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                        navigator.clipboard.writeText(svgElement.outerHTML).then(() => {
                            console.log("SVG copied to clipboard.");
                        }).catch(err => console.error("Failed to copy:", err));
                    } else if (action === "download") {
                        const blob = new Blob([svgElement.outerHTML], { type: "image/svg+xml" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${iconName}.svg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        console.log("SVG downloaded successfully.");
                    }
                } else {
                    console.error("SVG element not found.");
                }
            }, 2500);
        });
    } else {
        console.error("Edit button not found.");
    }
}


