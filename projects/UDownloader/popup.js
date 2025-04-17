



document.addEventListener('DOMContentLoaded', function () {
    const iconTab = document.getElementById('iconTab');
    const imageTab = document.getElementById('imageTab');
    const iconContent = document.getElementById('iconContent');
    const imageContent = document.getElementById('imageContent');
    const imageList = document.getElementById('imageList');
    const svgSizeInput = document.getElementById("svgSize");

    // Add click event listeners for tabs
    iconTab.addEventListener('click', function () {
        iconTab.classList.add('active');
        imageTab.classList.remove('active');
        iconContent.classList.add('active');
        imageContent.classList.remove('active');
    });

    imageTab.addEventListener('click', function () {
        imageTab.classList.add('active');
        iconTab.classList.remove('active');
        imageContent.classList.add('active');
        iconContent.classList.remove('active');
    });

    

    // Function to display images based on the selected filter
    function displayImages(images) {
        imageList.innerHTML = ''; // Clear previous images

        const selectedFilter = document.querySelector('input[name="imageFilter"]:checked').value;
        const message = document.getElementById('message');
        message.style.display = 'none';

        let hasImages = false;

        images.forEach((imageSrc) => {
            if ((selectedFilter === 'jpeg' && (imageSrc.endsWith('.jpg') || imageSrc.endsWith('.jpeg'))) ||
                (selectedFilter === 'png' && imageSrc.endsWith('.png')) ||
                (selectedFilter === 'webp' && imageSrc.endsWith('.webp'))) {

                hasImages = true;
                const li = document.createElement('li');
                const img = document.createElement('img');
                img.src = imageSrc;
                li.appendChild(img);
                imageList.appendChild(li);
            }
        });

        if (!hasImages) {
            message.style.display = 'flex';
        } else {
            message.style.display = 'none';
        }
    }

    document.querySelectorAll('input[name="imageFilter"]').forEach(radio => {
        radio.addEventListener('change', function () {
            chrome.storage.local.get('imageUrls', (data) => {
                if (data.imageUrls) {
                    displayImages(data.imageUrls);
                }
            });
        });
    });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
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
    chrome.storage.local.get('imageUrls', (data) => {
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

});

chrome.runtime.sendMessage({ action: "getSVGCount" });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "svgCountUpdated" || message.action === "updateSVGCount") {
    const { copied = 0, downloaded = 0 } = message.payload || {};
    // document.getElementById("copiedCount").innerText = copied;
    // document.getElementById("downloadedCount").innerText = downloaded;
    document.getElementById("svgCount").innerText = copied + downloaded;
  }
});