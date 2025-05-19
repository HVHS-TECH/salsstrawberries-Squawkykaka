// Import functions from firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

// Variables
export let FB_GAMEAPP, FB_GAMEDB;

// Config and api keys
const FB_GAMECONFIG = {
  apiKey: "AIzaSyAKJ4yC-PXdQfaWMQRMWumS85GaGPpvbLE",
  authDomain: "comp-2025-george-leask.firebaseapp.com",
  projectId: "comp-2025-george-leask",
  storageBucket: "comp-2025-george-leask.firebasestorage.app",
  messagingSenderId: "727231405255",
  appId: "1:727231405255:web:9f4f51e64681939067b2e2",
  measurementId: "G-3LTSMW0XGY",
  databaseURL:
    "https://comp-2025-george-leask-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

/*****************************************/
function fb_initialise() {
  FB_GAMEAPP = initializeApp(FB_GAMECONFIG);
  FB_GAMEDB = getDatabase(FB_GAMEAPP);

  console.log("Database loaded!");
}

fb_initialise();

/*****************************************/
import { fb_authenticate } from "./script.mjs";
window.fb_authenticate = fb_authenticate;
