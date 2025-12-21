// Initialize Firebase (ADD YOUR OWN DATA)
const firebaseConfig = {
    apiKey: "AIzaSyD5SBrei2U0Qro-gm77tY1iOk8w7v0SwcE",
    authDomain: "tiffin-project-6d03d.firebaseapp.com",
    databaseURL: "https://tiffin-project-6d03d-default-rtdb.firebaseio.com",
    projectId: "tiffin-project-6d03d",
    storageBucket: "tiffin-project-6d03d.appspot.com",
    messagingSenderId: "711473057567",
    appId: "1:711473057567:web:22f9c3e614748d290fea2a",
};

//date
var options = { weekday: "short", day: "numeric", month: "short", year: "numeric" };
// var today = new Date().toLocaleDateString("en-US", options);
var today = "Today";
var users = [];

document.getElementById("date").textContent = today;
document.getElementById("brand").textContent = "BHOJAN AAMANTRAN SANGATHAN";
document.title = "BHOJAN AAMANTRAN SANGATHAN";



const tiffin_type_options = [
    {
        price: 60,
        detail: "Without Dalbhat"
    },
    {
        price: 70,
        detail: "Without Dalbhat + 3 Roti"
    },
    {
        price: 80,
        detail: "With Dalbhat"
    }

]
let selected_choise = localStorage.getItem("tiffin_choice") ? localStorage.getItem("tiffin_choice") : 0
var tiffin_types = document.getElementById("tiffin_types");

if (tiffin_types) {
    tiffin_type_options.forEach((type) => {
        if (+selected_choise == type.price) {
            tiffin_types.innerHTML += `<label for=""><input type="radio" name="tiffin" id="tiffin60" value="` + type.price + `" style="width:auto !important" checked required> ` + type.price + ` (` + type.detail + `)</label>`
        } else {
            tiffin_types.innerHTML += `<label for=""><input type="radio" name="tiffin" id="tiffin60" value="` + type.price + `" style="width:auto !important" required> ` + type.price + ` (` + type.detail + `)</label>`

        }
    });
}



firebase.initializeApp(firebaseConfig);
// Reference messages collection
var messagesRef = firebase.database().ref("messages");
var usersRef = firebase.database().ref("users");
const tStatusRef = firebase.database().ref("status");

// usersRef.on("value").then(function (snapshot) {
usersRef.once("value")
    .then(function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            var item = childSnapshot.val();
            item.key = childSnapshot.key;
            users.push(item);
        });
    })
    .then(function () {
        var table = document.getElementById("manageUsers");
        setTimeout(() => {
            const numRows = table.rows.length;
            if (numRows > 1) {
                for (let k = 1; k <= numRows; k++) {
                    var row = table.deleteRow(1);
                }
            }
            listUsers();
        }, 2000);
    })
    .catch(function (error) {
        console.error("Error fetching users:", error);
    });

function listUsers() {

    var table = document.getElementById("manageUsers");

    if (table) {
        for (let i in users) {
            var row = table.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            cell1.innerHTML = users[i];
            cell2.innerHTML = `<button name='' onClick="removeUser(` + i + `)">` + "<i class='fa-solid fa-circle-minus'></i></button>";
        }
    }

    messagesRef.once("value")
        .then(function (snapshot) {
            var numRows = snapshot.numChildren();
            document.getElementById("rowCount").innerHTML = + numRows;
        })
        .catch(function (error) {
            console.error("Error getting row count:", error);
        });
}

function removeUser(user) {
    var userName;
    for (var i = 0; i < users.length; i++) {
        if (users[i].key === user) {
            userName = users[i].name;
            break;
        }
    }
    var confirmed = confirm("Do you want to delete " + userName + "?");
    if (confirmed) {
        usersRef.child(user).remove();
        location.reload();
    }
}

function clearData() {

    var result = confirm("Are you sure you want to delete all data?");

    // If the user clicks "OK" in the confirmation dialog box
    if (result) {
        // Remove all data in the table
        messagesRef.remove()
            .then(function () {
                alert("Data removed successfully.");
                location.reload();
            })
            .catch(function (error) {
                console.error("Error removing data: ", error);
            });
    }
}

// Listen for form submit
document.getElementById("contactForm").addEventListener("submit", submitForm);

// Submit form
async function submitForm(e) {
    e.preventDefault();
    // Get values
    var name = document.getElementById("name").value;
    var tiffin = document.querySelector('input[name="tiffin"]:checked').value;
    if (name === null || name == "" || name === undefined || name == "Select Name") {
        alert("Please select name");
        return;
    }
    if (tiffin === null || tiffin == "" || tiffin === undefined || tiffin == "Select") {
        alert("Please select tiffin");
        return;
    }
    //take confirmation
    if (!confirm("Are you sure you want to submit?")) {
        return;
    }

    // Save message
    await saveMessage(name, tiffin);

    // Show alert
    document.querySelector(".alert").style.display = "block";

    // Hide alert after 3 seconds
    setTimeout(function () {
        document.querySelector(".alert").style.display = "none";
    }, 3000);

    // Clear form
    document.getElementById("contactForm").reset();
}

// Function to get get form values
function getInputVal(id) {
    return document.getElementById(id).value;
}

// Save message to firebase
async function saveMessage(name, tiffin) {
    var newMessageRef = messagesRef.push();
    newMessageRef.set({
        name: name,
        tiffin: tiffin,
        date: new Date().toISOString().slice(0, 10),
    });
    localStorage.setItem("selected_user", name)
    localStorage.setItem("tiffin_choice", tiffin)

    if (document.getElementById("sT").textContent == "Yes") {
        alert("Your Order is recoded successfully")
        window.location.href = "ordergiven.html";
    } else {
        window.location.href = "view.html";
    }
}

function currentDate() {
    var currentDate = new Date();

    // Format the date as "Day, Date Month Year"
    var options = {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    var formattedDate = currentDate.toLocaleDateString('en-US', options);

    // Set the formatted date as the content of the "current-date" span
    document.getElementById('date').textContent = formattedDate;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        timeZone: 'Asia/Kolkata'
    };
    const formattedDate = date.toLocaleString('en-US', options);
    return formattedDate.replace(',', '');
}

function statusSelect(val) {

    var now = new Date();
    // Add the value and timestamp to the Firebase database
    tStatusRef.set({
        value: val,
        timestamp: now.getTime()
    });
}

function loadStatusValue() {

    tStatusRef.on('value', function (snapshot) {
        var value = snapshot.val().value;
        var timestamp = snapshot.val().timestamp;
        //current time
        var now = new Date();

        let statusVal = document.getElementById('statusselect');
        statusVal.value = value;

    });

}


function loadStatusValueInIndex() {

    var stSpan = document.getElementById('sT');
    var timeSpan = document.getElementById('tSt');
    var iSpan = document.getElementById('sTIcn');

    tStatusRef.on('value', function (snapshot) {
        var value = snapshot.val().value;
        var timestamp = snapshot.val().timestamp;

        // Convert timestamp to readable date
        var date = new Date(timestamp);
        var timestampDate = date.toLocaleDateString();

        // Get current date
        var now = new Date();
        var currentDate = now.toLocaleDateString();

        // Check if timestamp date is not the same as current date
        if (timestampDate !== currentDate) {

            // Set value to "No" and current timestamp
            tStatusRef.set({
                value: "No",
                timestamp: now.getTime()
            });

            // Update value and timestamp
            value = "No";
            timestamp = now.getTime();
        }

        let timeOfOrder = formatDate(timestamp)
       
        stSpan.textContent = "" + value;

        timeSpan.textContent = " - " + timeOfOrder;
        if (stSpan.textContent === "No") {
            stSpan.style.backgroundColor = 'red';
            iSpan.style.backgroundColor = 'red';
            iSpan.innerHTML = "&nbsp&#10006";
            timeSpan.style.display = 'none';
        }
        else {
            iSpan.innerHTML = "&nbsp&#10004";
        }

    });
}



function allTiffin() {

    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();

        let total = 0;
        let total60 = 0;
        let total70 = 0;
        let total80 = 0;
        var table = document.querySelector("#tiffinTable");

        let array = []
        for (let i in data) {
            array.push({
                date: data[i].date,
                name: data[i].name,
                tiffin: data[i].tiffin
            })
        }
        const result = array.reduce((acc, { date, tiffin }) => {
            const index = acc.findIndex(item => item.date === date && item.tiffin === tiffin);
            if (index === -1) {
                acc.push({ date, tiffin, count: 1 }); // add count property to object
            } else {
                acc[index].count++; // increment count property
            }
            return acc;
        }, []);

        const groupedData = result.reduce((result, current) => {
            // Check if the current date already exists in the result object
            if (result[current.date]) {
                // Check if the tiffin already exists for this date
                if (result[current.date][current.tiffin]) {
                    // Add the count to the existing tiffin key
                    result[current.date][current.tiffin] += current.count;
                } else {
                    // Create a new tiffin key with the count
                    result[current.date][current.tiffin] = current.count;
                }
            } else {
                // Create a new date key with a new tiffin key and its count
                result[current.date] = { [current.tiffin]: current.count };
            }
            return result;
        }, {});

        const today = new Date();
        const lastSunday = new Date(today.setDate(today.getDate() - today.getDay() - 1));


        for (let i in groupedData) {
            if (new Date(i) >= lastSunday) {
                let tiffinCount = groupedData[i];

                let t1 = tiffinCount['60'] ? tiffinCount['60'] : 0
                let t2 = tiffinCount['70'] ? tiffinCount['70'] : 0
                let t3 = tiffinCount['80'] ? tiffinCount['80'] : 0
                var row = table.insertRow(1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                cell1.innerHTML = new Date(i).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                cell2.innerHTML = t1;
                cell3.innerHTML = t2;
                cell4.innerHTML = t3;
                cell5.innerHTML = parseInt(t1) + parseInt(t2) + parseInt(t3);
                total = parseInt(total) + t1 + t2 + t3;
                total60 = total60 + t1
                total70 = total70 + t2
                total80 = total80 + t3
            }
        }

        // tifinTotal = tifinTotal + withDalbhat + withoutDalbhatExtra + withoutDalbhat;

        document.getElementById("total60").innerHTML = total60;
        document.getElementById("total70").innerHTML = total70;
        document.getElementById("total80").innerHTML = total80;
        document.getElementById("grandTotal").innerHTML = total;
    });
}


function readMessage(DateRange = "Today") {
    var currentDate = "2000-01-01";
    if (DateRange === "Today") {
        currentDate = new Date().toISOString().slice(0, 10);
    } else if (DateRange === "Yesterday") {
        currentDate = new Date();
        currentDate = new Date(currentDate.setDate(currentDate.getDate() - 1)).toISOString().slice(0, 10);
    } else if (DateRange === "LastWeek") {
        currentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    }
    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        let withDalbhat = 0;
        let withoutDalbhat = 0;
        let withoutDalbhatExtra = 0;
        let tifinTotal = 0;

        let total = 0;
        var table = document.getElementById("myTable");
        const numRows = table.rows.length;
        for (let k = 1; k <= numRows - 2; k++) {
            var row = table.deleteRow(1);
        }
        for (let i in data) {
            if (DateRange == "All") {
                var row = table.insertRow(1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = new Date(data[i].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                cell2.innerHTML = data[i].name;
                cell3.innerHTML = data[i].tiffin;
                total = parseInt(total) + parseInt(data[i].tiffin);
            }
            else if (DateRange != "LastWeek") {
                if (currentDate == data[i].date) {
                    var row = table.insertRow(1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = new Date(data[i].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                    cell2.innerHTML = data[i].name;
                    cell3.innerHTML = data[i].tiffin;
                    total = parseInt(total) + parseInt(data[i].tiffin);
                }
            }
            else {
                if (new Date(currentDate) <= new Date(data[i].date)) {
                    var row = table.insertRow(1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = new Date(data[i].date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' });
                    cell2.innerHTML = data[i].name;
                    cell3.innerHTML = data[i].tiffin;
                    total = parseInt(total) + parseInt(data[i].tiffin);
                }
            }

            //Count daily's tiffin
            if (new Date().toISOString().slice(0, 10) == data[i].date && data[i].tiffin == 80) {
                withDalbhat = withDalbhat + 1;
            }
            if (new Date().toISOString().slice(0, 10) == data[i].date && data[i].tiffin == 70) {
                withoutDalbhatExtra = withoutDalbhatExtra + 1;
            }
            if (new Date().toISOString().slice(0, 10) == data[i].date && data[i].tiffin == 60) {
                withoutDalbhat = withoutDalbhat + 1;
            }
        }

        tifinTotal = tifinTotal + withDalbhat + withoutDalbhatExtra + withoutDalbhat;

        document.getElementById("WithDalbhat").innerHTML = withDalbhat;
        document.getElementById("WithoutDalbhat").innerHTML = withoutDalbhat;
        document.getElementById("WithoutDalbhatExtra").innerHTML = withoutDalbhatExtra;
        document.getElementById("TifinTotal").innerHTML = tifinTotal;
        document.getElementById("total").innerHTML = total;
    });
}

function loadUsers() {
    let selected_user = localStorage.getItem("selected_user") ? localStorage.getItem("selected_user") : null;
    var orders = [];
    messagesRef.on('value', (snapshot) => {
        snapshot.forEach(function (childSnapshot) {
            var item = childSnapshot.val();
            orders.push(item);
        });

        // usersRef.once("value").then(function (snapshot) {
        //     users = snapshot.val() || [];

        orders.forEach(order => {
            if (users.indexOf(order.name) !== -1 && new Date().toISOString().slice(0, 10) == order.date) {
                const index = users.indexOf(order.name);
                if (index > -1) { // only splice array when item is found
                    users.splice(index, 1); // 2nd parameter means remove one item only
                }
            }
        });

        users.forEach(element => {
            var option = document.createElement("option");
            option.text = element;
            option.value = element;
            if (selected_user == element) {
                option.selected = true;
            }
            var select = document.getElementById("name");
            select.appendChild(option);
        });
        // });
    })
}



function getTotal(value) {
    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        let total = 0;
        let count = 0;
        for (let i in data) {
            //Count daily's tiffin
            if (data[i].name == value) {
                total = parseInt(total) + parseInt(data[i].tiffin);
                count = count + 1;
            }
        }
        document.getElementById("indeTotal").innerHTML = "₹ " + total;
        document.getElementById("indeCount").innerHTML = count + " T.";
    });
}
function getAllTotal(fromDate, toDate) {
    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        let total = 0;
        let count = 0;
        for (let i in data) {
            let checkDate = new Date(data[i].date);
            let startDate = new Date(fromDate);
            let endDate = new Date(toDate);
            //Count daily's tiffin
            if (checkDate.getTime() >= startDate.getTime() && checkDate.getTime() <= endDate.getTime()) {
                total = parseInt(total) + parseInt(data[i].tiffin);
                count = count + 1;
            }
        }
        document.getElementById("indeTotal").innerHTML = "₹ " + total;
        document.getElementById("indeCount").innerHTML = count + " T.";
    });
}
function storeInLocal() {
    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        localStorage.setItem("data", JSON.stringify(data));
    });
}

function getTotalInde(value) {
    const data = JSON.parse(localStorage.getItem("data"));
    let total = 0;
    let count = 0;
    for (let i in data) {
        //Count daily's tiffin

        if (data[i].name == value) {
            total = parseInt(total) + parseInt(data[i].tiffin);
            count = count + 1;
        }
    }
    return { total: total, count: count };
}

function getTotalIndeWithDate(value, fromDate, toDate) {
    const data = JSON.parse(localStorage.getItem("data"));
    let total = 0;
    let count = 0;
    for (let i in data) {
        //Count daily's tiffin
        let checkDate = new Date(data[i].date);
        let startDate = new Date(fromDate);
        let endDate = new Date(toDate);
        if (checkDate.getTime() >= startDate.getTime() && checkDate.getTime() <= endDate.getTime()) {
            if (data[i].name == value) {

                total = parseInt(total) + parseInt(data[i].tiffin);
                count = count + 1;
            }
        }
    }
    return { total: total, count: count };
}

// function loadReport() {
//     const tableData = {};

//     // Fetch data from Firebase and process it
//     messagesRef.on('value', function(snapshot) {
//       snapshot.forEach(function(childSnapshot) {
//         const childData = childSnapshot.val();
//         const name = childData.name;
//         const tiffinCost = parseInt(childData.tiffin);

//         // Update the tableData object with the current name and tiffinCost
//         if (!tableData[name]) {
//           tableData[name] = {
//             count: 0,
//             total: 0
//           };
//         }
//         tableData[name].count += 1;
//         tableData[name].total += tiffinCost;
//       });

//       // Update the HTML table with the processed data
//       const tableBody = document.querySelector('#myTable2 tbody');
//       tableBody.innerHTML = '';

//       let totalCount = 0;
//       let totalCost = 0;

//       Object.keys(tableData).forEach(function(name) {
//         const count = tableData[name].count;
//         const total = tableData[name].total;
//         const row = `<tr><td>${name}</td><td>${count}</td><td>${total}</td></tr>`;
//         tableBody.innerHTML += row;
//         totalCount += count;
//         totalCost += total;
//       });

//       // Update the total row
//       const indeCount = document.querySelector('#indeCount');
//       const indeTotal = document.querySelector('#indeTotal');
//       indeCount.textContent = totalCount;
//       indeTotal.textContent = totalCost;
//     });
// }
function loadReport() {
    const data = [];

    usersRef.once("value").then(function (snapshot) {
        users = snapshot.val() || [];
        for (let i = 0; i < users.length; i++) {
            data.push({
                name: users[i],
                total: getTotalInde(users[i]).total,
                count: getTotalInde(users[i]).count,
            });
        }
        var table = document.getElementById("myTable2");
        data.forEach(order => {
            if (order.total > 0) {
                var row = table.insertRow(1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = order.name;
                cell2.innerHTML = order.count;
                cell3.innerHTML = order.total;
            }
        });
    });
}
function filter() {
    fromDate = document.getElementById("fromDate").value;
    toDate = document.getElementById("toDate").value;

    messagesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        localStorage.setItem("data", JSON.stringify(data));
    });
    getAllTotal(fromDate, toDate);
    const data = [];
    usersRef.once("value").then(function (snapshot) {
        users = snapshot.val() || [];
        const userData = users.filter(Boolean)
        for (let i = 0; i < users.filter(Boolean).length; i++) {
            data.push({
                name: userData[i],
                total: getTotalIndeWithDate(userData[i], fromDate, toDate).total,
                count: getTotalIndeWithDate(userData[i], fromDate, toDate).count,
            });
        }

        var table = document.getElementById("myTable2");
        // Delete all rows except header row
        for (let k = 1; k < users.filter(Boolean).length; k++) {
            var row = table.deleteRow(1);
        }

        // Add new rows for users with total > 0
        for (let i in data) {
            if (data[i].total > 0) {
                var table = document.getElementById("myTable2");
                var row = table.insertRow(1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = data[i].name;
                cell2.innerHTML = data[i].total;
                cell3.innerHTML = data[i].count;
            }
        }
    });
}

function redirect() {
    window.location.href = "./index.html";
}

function addUser() {
    var name = document.getElementById("user-name").value;
    if (name) {
        // Check if the user is already added
        if (users.indexOf(name) === -1) {
            users.push(name);
            // Add the user to the Firebase database
            firebase.database().ref("users").set(users);
        }
        document.getElementById("user-name").value = "";
        location.reload();
    }
}

var clickCount = 0;
var clickTimeout;

document.getElementById("brand").addEventListener("click", function (event) {
    clickCount++;

    if (clickCount === 3) {
        // Triple click detected
        window.location.href = "manage_users.html";
    }

    if (clickCount === 1) {
        clickTimeout = setTimeout(function () {
            clickCount = 0;
        }, 300); // Timeout for double click detection
    }
});

document.getElementById("brand").addEventListener("dblclick", function (event) {
    clearTimeout(clickTimeout);
});







