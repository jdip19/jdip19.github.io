// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    get,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB00lLnYNjAI_TqdvlDniEK9wgaFQ0143I",
    authDomain: "imager-678f0.firebaseapp.com",
    databaseURL: "https://imager-678f0-default-rtdb.firebaseio.com",
    projectId: "imager-678f0",
    storageBucket: "imager-678f0.firebasestorage.app",
    messagingSenderId: "453061054446",
    appId: "1:453061054446:web:7069245e2df8434bba48ff",
    measurementId: "G-BY5SXCLK6L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Reference to the count in the database
const countRef = ref(database, "resizeCount");

// Initialize resized count
let resizedCount = 0;

// Function to update the display count
function updateDisplayCount() {
    document.getElementById("counter").innerText = `${resizedCount}`;
}

// Get the current count from the database
get(countRef).then((snapshot) => {
    if (snapshot.exists()) {
        resizedCount = snapshot.val();
    }
    updateDisplayCount(); // Update display with the retrieved count
});

// for drag and drop
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
var justFileName = '';
const previewContainer = document.getElementById("previewContainer"); // Get the preview container
var purpose='App-Icon-';

// Open file input on click
dropZone.addEventListener("click", () => fileInput.click());

// Highlight drop area on dragover
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

// Remove highlight on dragleave
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// Handle file drop
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    fileInput.files = e.dataTransfer.files;  // Set dropped files to fileInput's files
    updateFileCount();  // Call to update file count
});

// File input change event for selecting files directly
fileInput.addEventListener("change", updateFileCount);

// Function to update the file count display and show previews
function updateFileCount() {
    const files = Array.from(fileInput.files); // Get the currently selected files
    console.log(`${files.length} file(s) selected`); // Log the count

    // Clear previous previews
    previewContainer.innerHTML = '';

    // Update the display message
    if (files.length) {
        dropZone.querySelector("p").innerText = `${files.length} file(s) selected`;
        files.forEach(file => {
            const fileBox = document.createElement("div");
            fileBox.className="fileBox";
            const imgElement = document.createElement("img");
            imgElement.src = URL.createObjectURL(file); // Create a URL for the file
            imgElement.alt = "Image preview";
            const fileNameElement = document.createElement("p");
            fileNameElement.innerText = file.name; // Set the file name
            fileNameElement.style.margin = "0"; // Remove default margin

            // Append the image and file name to the container
            fileBox.appendChild(imgElement);
            fileBox.appendChild(fileNameElement);
            previewContainer.appendChild(fileBox);

            // Append the file container to the preview containe
            //console.log(justFileName); // Append the preview image
        });
    } else {
        dropZone.querySelector("p").innerText = "Drag & drop your images here or click to select files";
    }
}



// for resizing and downloading images
async function resizeAndDownload() {
    if (fileInput.files.length === 0) {  // Corrected: check fileInput.files.length, not fileInput.length
        alert("Please select at least one image.");
        return;
    }

    const zip = new JSZip();
    const sizes = [40,58,80,87,120,180,76,167,128,192,136,152,114, 256, 512,1024];

    for (let file of fileInput.files) {  // Corrected: loop through fileInput.files
        const img = await loadImage(file);
        for (let size of sizes) {
            const resizedBlob = await resizeImage(img, size, size);
            const fileName = `${file.name.split('.')[0]}_${size}x${size}.jpg`;
            justFileName = `${file.name.split('.')[0]}`;
            zip.file(fileName, resizedBlob);
        }
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = purpose+justFileName + "_resized_images.zip";
        link.click();

        resizedCount += fileInput.files.length;  // Increment count by the number of files processed

        // Update Firebase count
        set(countRef, resizedCount).then(() => {
            updateDisplayCount(); // Update counter display
        });

        // Reset message to default only if no files are left
        fileInput.value = ''; // Clear the input
        previewContainer.innerHTML = ''; // Clear previews
        if (fileInput.files.length === 0) {
            dropZone.querySelector("p").innerText = "Drag & drop your images here or click to select files";
        } else {
            // Optionally update the message to reflect the count
            updateFileCount(); // Refresh the count if there are still files
        }
    });
}

// Utility function to load an image file as an HTMLImageElement
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Utility function to resize an image using a canvas
function resizeImage(img, width, height) {
    return new Promise((resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
}
window.resizeAndDownload = resizeAndDownload;

// Add event listener for the button
document.getElementById("resizeButton").addEventListener("click", resizeAndDownload);
