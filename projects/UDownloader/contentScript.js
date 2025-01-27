//Get all image elements in the current webpage
const images = Array.from(document.querySelectorAll('img'));

// Filter for PNG and JPEG images and return their URLs
const imageUrls = images
  .map(img => img.src)
  .filter(src => src.endsWith('.png') || src.endsWith('.jpg') || src.endsWith('.jpeg'));

// Save the image URLs in chrome.storage
chrome.storage.local.set({ imageUrls });

