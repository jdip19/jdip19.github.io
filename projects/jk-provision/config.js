import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYF1MoFUCozgh6PfsH-nM1avUTbxSM_rY",
  authDomain: "my-store-11-6b8f5.firebaseapp.com",
  databaseURL:"https://my-store-11-6b8f5-default-rtdb.firebaseio.com",
  projectId: "my-store-11-6b8f5",
  storageBucket: "my-store-11-6b8f5.appspot.com",
  messagingSenderId: "719774944841",
  appId: "1:719774944841:web:9ac216f8ffb2e49bcc7998"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };