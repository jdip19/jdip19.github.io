import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  get,
  set,
  update,
  child,
  remove,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYF1MoFUCozgh6PfsH-nM1avUTbxSM_rY",
  authDomain: "my-store-11-6b8f5.firebaseapp.com",
  databaseURL: "https://my-store-11-6b8f5-default-rtdb.firebaseio.com",
  projectId: "my-store-11-6b8f5",
  storageBucket: "my-store-11-6b8f5.appspot.com",
  messagingSenderId: "719774944841",
  appId: "1:719774944841:web:9ac216f8ffb2e49bcc7998",
};

// Initialize Firebase
let items = {};
const existingIds = [];
const app = initializeApp(firebaseConfig);
const database = getDatabase();
const itemsRef = ref(database, "Items");
//.database().enablePersistence();

document.addEventListener("DOMContentLoaded", function () {
  const cardsContainer = document.querySelector(".list");
  const searchInput = document.getElementById("searchInput");
  let currentTime = new Date().getTime() / 1000;

  const modeldiv = document.getElementById("modal-body");

  // Function to create a card element
  function createCard(data, itemId) {
    const card = document.createElement("div");
    card.classList.add("card");

    // Check if the data object is not null or undefined
    if (data) {
      card.innerHTML = `
            <div class="row align-items-center">
                <div class="col-md-8">
                    <div id="clickable" class="card-body">
                        <h6 class="card-id">#<span id="itmid">${itemId}</span></h6>
                        <h5 class="card-title"><span id="itmNmGuj">${
                          data.itmnmguj
                        }</span><span id="itmNmEng">${data.itmnm}</span></h5>
                        <p class="card-text"><i class="bi bi-clock"></i> ${formatCustomDateTime(
                          data.edtime
                        )}</p>
                        </div>
                        </div>
                <div class="col-md-4">
                    <img src="${
                      data.itmimg
                    }" class="rounded-start card-img" alt="Card Image">
                </div>
            </div>
            <div class="container card-footer">
                <div class="p-w-box">
                    <div class="cusPriceDiv">₹<input id="cusPrice" class="cusPrice form-control" type="number" placeholder="₹" value="10"></div>
                    <div class="weight" id="weight">${data.cdppkg === 1 ? Math.round((1000 / (parseFloat(data.ppkg) + data.ppkg * 0.12)) * 10) : Math.round((1000 / data.ppkg) * 10)}gm</div>
                </div>
                <div class="p-w-box">
                    <div class="price">₹<span id="price2">${
                      data.ppkg / 4
                    }</span></div>
                    <div class="weight" id="weight250">250gm</div>
                </div>
                <div class="p-w-box">
                    <div class="price">₹<span id="price3">${
                      data.ppkg / 2
                    }</span></div>
                    <div class="weight" id="weight500">500gm</div>
                </div>
                <div class="p-w-box">
                    <div class="price">₹<span id="price4">${
                      data.ppkg
                    }</span></div>
                    <div class="weight" id="weight1">1kg</div>
                </div>
            </div>
               `;
      // Event listener for the .cusPrice input within the dynamically created card
      card.querySelector("#cusPrice").addEventListener("input", function () {
        handleCustomPriceInput(this, data);
      });
    }

    return card;
  }

  searchInput.addEventListener("input", function () {
    const searchText = this.value.trim().toLowerCase();
    filterCards(searchText);
  });

  $(document).on("dblclick", "#clickable", function () {
    const ModelcardId = $(this).find("#itmid").text();
    console.log("this" + ModelcardId);

    $("#modalCardId").text(ModelcardId);
    $("#modal-title").text("Editing");
    $("#editCardModal").modal("show");

    const itemRef = child(itemsRef, "/" + ModelcardId);
    fetchDataForCard(itemRef);

    // Store the current card ID in a variable
    let currentCardId = ModelcardId;

    // Unbind previous event listeners for saveAndClose and removeItm
    $(document).off("click", "#saveAndClose");
    $(document).off("click", "#removeItm");

    // Bind new event listeners for saveAndClose and removeItm
    $(document).on("click", "#saveAndClose", function () {
      handleSaveAndClose(itemRef, currentCardId); // Pass the current card ID to the function
      console.log("" + currentCardId);
    });

    $(document).on("click", "#removeItm", function () {
      removeItm(itemRef, currentCardId);
    });
  });

  let icdppkg = document.getElementById("cdppkg");

  function updateModalElements(data) {
    $("#edTime").text(formatCustomDateTime(data.edtime));
    $("#itmImg").attr("src", data.itmimg);
    $("#itmNmguj").val(data.itmnmguj);
    $("#itmNm").val(data.itmnm);
    $("#ippKg").val(data.ppkg);
    if (data.cdppkg === 1) {
      icdppkg.checked = true;
    } else {
      icdppkg.checked = false;
    }
  }
  // Function to handle custom price input
  function handleCustomPriceInput(inputElement, data) {
    const customPrice = parseFloat(inputElement.value);
    let ppkg = parseFloat(data.ppkg);
    let checkBox = data.cdppkg;
    let pWeight250 = ppkg / 4;
    let dPrice = ppkg * 0.12;
    console.log("ppkg: " + ppkg + "\n" + checkBox + "\n" + pWeight250);
    const weightElement = inputElement
        .closest(".card")
        .querySelector(".weight");

    if (!isNaN(customPrice)) {
        if (checkBox === 1 && customPrice < pWeight250) {
            ppkg = ppkg + dPrice;
            console.log("new ppkg after increase: " + ppkg);
        }
        const weightValue = Math.round((1000 / ppkg) * customPrice);
        weightElement.textContent = weightValue + "gm";
    } else {
        console.log("Invalid input for customPrice");
    }
}

  fetchDataFromFirebase();

  function fetchDataForCard(itemRef) {
    get(itemRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          updateModalElements(data);
        } else {
          console.warn("No data found for card " + cardId);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
  // Function to update modal elements with fetched data

  let copiedContent; // Define the variable globally

  $("#itmImg").on("dblclick", function () {
    navigator.clipboard
      .readText()
      .then(function (content) {
        copiedContent = content; // Set the global variable
        $("#itmImg").attr("src", copiedContent);
      })
      .catch(function (err) {
        console.error("Failed to read clipboard content: ", err);
      });
  });
  $(document).ready(function () {});

  $(document).on("click", "#addItem", function () {
    // Assuming itemRef is the reference to the 'Items' collectio
    const wantToAddItem = window.confirm("Want to add an item?");
    footerData();

    if (wantToAddItem) {
      let uniqID = 1;
      while (existingIds.includes(uniqID)) {
        uniqID++;
      }
      $("#editCardModal").modal("show");
      $("#modal-title").text("Adding");
      $("#modalCardId").text(uniqID);
      $("#edTime").text(formatCustomDateTime(currentTime));
      $("#itmImg").attr(
        "src",
        "https://th.bing.com/th?id=OLC.R2v+CiwcE2AjwQ480x360&rs=1&pid=ImgDetMain"
      );
      $("#itmNmguj").val("વસ્તુ નુ નામ");
      $("#itmNm").val("Item Name");
      $("#ippKg").val(100);

      $(document).on("click", "#saveAndClose", function () {
        set(child(itemsRef, uniqID.toString()), {
          // Use child() to create a reference to the specific child
          itmimg: $("#itmImg").attr("src"),
          itmnm: $("#itmNm").val(),
          itmnmguj: $("#itmNmguj").val(),
          ppkg: $("#ippKg").val(),
          edtime: currentTime,
        })
          .then(() => {
            location.reload();
          })
          .catch((error) => {
            alert("Error updating data: " + error);
          });
      });
    } else {
      console.log("Not Want to...");
    }
  });

  // Function to handle save and close button click
  function handleSaveAndClose(itemRef, ModelcardId) {
    const itmimgValue = $("#itmImg").attr("src");
    let cDppKg;
    if (icdppkg.checked === true) {
      cDppKg = 1;
    } else {
      cDppKg = 0;
    }
    if (typeof itmimgValue !== "undefined") {
      update(itemRef, {
        itmimg: itmimgValue,
        itmnmguj: $("#itmNmguj").val(),
        itmnm: $("#itmNm").val(),
        ppkg: $("#ippKg").val(),
        edtime: currentTime,
        cdppkg: cDppKg,
      })
        .then(() => {
          //location.reload();
          showToast(
            "#" + ModelcardId + " Updated Successfully",
            "success",
            "no"
          );
        })
        .catch((error) => {
          alert("Error updating data: " + error);
        });
    } else {
      alert("itmimg value is undefined. Cannot perform update.");
    }
  }

  function removeItm(itemRef, cardId) {
    remove(itemRef)
      .then(() => {
        location.reload();
      })
      .then(() => {
        showToast("Card #" + cardId + " Deleted", "danger");
      })
      .catch((error) => {
        alert("Error updating data: " + error);
      });
  }

  // Initialize items as an empty object

  function fetchDataFromFirebase() {
    if (navigator.onLine) {
      onValue(itemsRef, (snapshot) => {
        items = snapshot.val() || {}; // Update the global 'items' with fetched data
        cardsContainer.innerHTML = ""; // Clear existing cards
        existingIds.length = 0; // Clear existingIds array

        if (Object.keys(items).length > 0) {
          // Sort items by edtime in descending order
          const sortedItems = Object.entries(items).sort(
            (a, b) => b[1].edtime - a[1].edtime
          );

          sortedItems.forEach(([itemId, cardData]) => {
            existingIds.push(parseInt(itemId));
            const card = createCard(cardData, itemId);
            cardsContainer.appendChild(card); // Append the card to the container
          });

          // Store data in local storage
          localStorage.setItem("items", JSON.stringify(items));

          showToast(
            "Total " + existingIds.length + " items available (from Firebase)",
            "primary"
          );
        } else {
          showToast(
            "No data available. Please check your network connection.",
            "warning"
          );
        }
      });
    } else {
      // Fetch data from local storage
      const localItems = JSON.parse(localStorage.getItem("items"));
      if (localItems) {
        items = localItems; // Update the global 'items' with data from local storage
        cardsContainer.innerHTML = ""; // Clear existing cards
        existingIds.length = 0; // Clear existingIds array

        // Sort items by edtime in descending order
        const sortedItems = Object.entries(items).sort(
          (a, b) => b[1].edtime - a[1].edtime
        );

        sortedItems.forEach(([itemId, cardData]) => {
          existingIds.push(parseInt(itemId));
          const card = createCard(cardData, itemId);
          cardsContainer.appendChild(card); // Append the card to the container
        });

        showToast(
          "Total " +
            existingIds.length +
            " items available (from local storage)",
          "primary"
        );
      } else {
        showToast(
          "No data available in local storage. Please check your network connection.",
          "warning"
        );
      }
    }
  }

  function filterCards(searchText) {
    const cards = document.querySelectorAll(".card");

    cards.forEach((card) => {
      const cardId = card.querySelector(".card-id").textContent.toLowerCase();
      const cardItemNameEng = card
        .querySelector("#itmNmEng")
        .textContent.toLowerCase();
      const cardItemNameGuj = card
        .querySelector("#itmNmGuj")
        .textContent.toLowerCase();

      // Check if the English or Gujarati item name contains the search text
      const englishMatch = cardItemNameEng.includes(searchText);
      const gujaratiMatch = cardItemNameGuj.includes(searchText);

      card.style.display =
        searchText === "" ||
        englishMatch ||
        gujaratiMatch ||
        cardId.includes(searchText)
          ? "block"
          : "none";
    });
  }

  // Get the input element
  const itmNmInput = document.getElementById("ippKg");

  itmNmInput.addEventListener("input", function () {
    // Call the footerData function whenever the input value changes
    footerData();
  });

  // Define the footerData function
  function footerData() {
    // Get the input value from itmNm element
    const inputValue = itmNmInput.value;

    const weight250 = parseFloat((inputValue / 4).toFixed(2));
    const weight500 = parseFloat((inputValue / 2).toFixed(2));
    const price10 = Math.round((1000 / inputValue) * 10);

    // Generate the modal footer HTML with dynamic weight values
    const modalFooterData = `
        <div class="p-w-box">
            <div class="price">₹<span id="price10">10</span></div>
            <div class="weight" id="weight10">${price10}gm</div>
        </div>
        <div class="p-w-box">
            <div class="price">₹<span id="price250">${weight250}</span></div>
            <div class="weight" id="weight250">250gm</div>
        </div>
        <div class="p-w-box">
            <div class="price">₹<span id="price500">${weight500}</span></div>
            <div class="weight" id="weight500">500gm</div>
        </div>
    `;

    // Update the modal footer HTML
    $("#modalFooter").html(modalFooterData);
  }

  function formatCustomDateTime(timestamp) {
    const options = {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const dateObject = new Date(timestamp * 1000);
    return dateObject.toLocaleString("en-GB", options);
  }

  function showToast(message, color, autoClose = "yes") {
    // Select the toast container
    const toastContainer = document.getElementById("toastPlacement");

    // Create a new toast element
    const toast = document.createElement("div");
    toast.classList.add(
      "toast",
      "d-flex",
      "p-2",
      "justify-content-between",
      `bg-${color}`
    );
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");
    toast.setAttribute("data-bs-dismiss", "toast");

    if (autoClose === "no") {
      toast.setAttribute("data-bs-autohide", "false");
    }

    // Create a div for the toast body and add the message
    const toastBody = document.createElement("div");
    toastBody.classList.add("toast-body", "p-0");
    toastBody.textContent = message;

    // Create a button to dismiss the toast
    const closeButton = document.createElement("button");
    closeButton.setAttribute("type", "button");
    closeButton.classList.add("btn-close");
    closeButton.setAttribute("aria-label", "Close");
    closeButton.setAttribute("data-bs-dismiss", "toast");

    // Append the toast body and close button to the toast element
    toast.appendChild(toastBody);
    toast.appendChild(closeButton);

    // Append the toast element to the toast container
    toastContainer.appendChild(toast);

    // Show the toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
  }
});
