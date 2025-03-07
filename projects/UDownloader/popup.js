document.addEventListener('DOMContentLoaded', function () {
    const iconTab = document.getElementById('iconTab');
    const imageTab = document.getElementById('imageTab');
    const iconContent = document.getElementById('iconContent');
    const imageContent = document.getElementById('imageContent');
    const imageList = document.getElementById('imageList');

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

    // Load images from storage when the popup opens
    chrome.storage.local.get('imageUrls', (data) => {
        if (data.imageUrls) {
            displayImages(data.imageUrls);
        }
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
});



document.addEventListener("DOMContentLoaded", function () {
    const sizeInput = document.getElementById("svgSize");
    // ✅ Load stored size when popup opens
    chrome.storage.sync.get("svgSize", function (data) {
        sizeInput.value = data.svgSize || 128;  // Default size = 128
    });

    // ✅ Save size automatically when the user types
    sizeInput.addEventListener("input", function () {
        const svgSize = sizeInput.value || 128;
        chrome.storage.sync.set({ svgSize });
        console.log("svgSize: " + svgSize);
    });
});

