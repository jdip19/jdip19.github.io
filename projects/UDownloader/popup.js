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

document.getElementById('downloadBtn').addEventListener('click', downloadImages);
document.getElementById('svgDownloadBtn').addEventListener('click', () => {
    executeScriptOnActiveTab(downloadSvgWithAutoDetection);
});
document.getElementById('svgCopyBtn').addEventListener('click', () => {
    executeScriptOnActiveTab(copySvgWithAutoDetection);
});

// Keyboard shortcuts for copy and download
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key === 'c') {
        executeScriptOnActiveTab(copySvgWithAutoDetection);
    } else if (e.ctrlKey && e.altKey && e.key === 'd') {
        executeScriptOnActiveTab(downloadSvgWithAutoDetection);
    }
});

function executeScriptOnActiveTab(callbackFunction) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: callbackFunction
        });
    });
}

function downloadImages() {
    const imageUrls = document.getElementById('imageUrls').value.split('\n').map(url => url.trim()).filter(url => url);
    const folderNameInput = document.getElementById('folderName').value.trim();

    if (imageUrls.length > 0) {
        const folderName = folderNameInput !== '' ? folderNameInput : '';

        imageUrls.forEach(url => {
            const fileName = url.split('/').pop();
            chrome.downloads.download({
                url: url,
                filename: folderName ? `${folderName}/${fileName}` : fileName,
                saveAs: false
            });
        });

        if (folderName) {
            alert(`Downloading ${imageUrls.length} images into folder: ${folderName}`);
        } else {
            alert(`Downloading ${imageUrls.length} images to default location without folder`);
        }
    } else {
        alert("Please enter at least one valid image URL.");
    }
}
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
  
        if (command === "copy_svg") {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: copySvgWithAutoDetection
          });
        } else if (command === "download_svg") {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: downloadSvgWithAutoDetection
          });
        }
      } else {
        console.error("No active tab found.");
      }
    });
  });
  
function downloadSvgWithAutoDetection() {
    const editButton = document.querySelector('#detail_edit_icon');
    if (editButton) {
        editButton.click();
    }

    setTimeout(() => {
        const svgElement = document.querySelector('.detail__editor__icon-holder svg');
        if (svgElement) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'downloaded-icon.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('SVG element not found. Please ensure it is present on the page.');
        }
    }, 2000);
}

function copySvgWithAutoDetection() {
    const editButton = document.querySelector('#detail_edit_icon');
    if (editButton) {
        editButton.click();
    }

    setTimeout(() => {
        const svgElement = document.querySelector('.detail__editor__icon-holder svg');
        if (svgElement) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);

            const textarea = document.createElement('textarea');
            textarea.value = svgString;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        } else {
            alert('SVG element not found. Please ensure it is present on the page.');
        }
    }, 2000);
}
