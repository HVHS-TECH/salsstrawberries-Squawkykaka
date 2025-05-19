import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { FB_GAMEDB } from "./main.mjs";

/*****************************************/
// This variable holds the current authenticated user.
let authenticated_user = "unauthorised";
/*****************************************/

// Code toauthenicate the user.
function fb_authenticate() {
  const AUTH = getAuth();
  const PROVIDER = new GoogleAuthProvider();

  // The following makes Google ask the user to select the account

  PROVIDER.setCustomParameters({
    prompt: "select_account",
  });

  signInWithPopup(AUTH, PROVIDER)
    .then((result) => {
      write_status_message("Login Successful");
      console.info("authentication success, result: " + result);
      document.getElementById("login-button").setAttribute("disabled", true);
      authenticated_user = result.user;
      console.info(result.user);
    })

    .catch((error) => {
      console.info("authentication fail, error: " + error);
    });
}

// This function gets the inputs into the html form.
function setupFormListener() {
  const form = document.getElementById("fruitForm");
  console.log(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {};

    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });

    fb_write_form(formData);
  });
}

// Code to write the form, taking in a object and wiritng it to the users data store.
function fb_write_form(form_data) {
  if (authenticated_user == "unauthorised") {
    write_status_message("You have not logged in");
    console.log("You have not logged in");
    return;
  }

  // let input = setupFormListener();
  let userPath = `/users/${authenticated_user.uid}`;

  const userDbRef = ref(FB_GAMEDB, userPath);
  set(userDbRef, form_data)
    .then(() => {
      console.log("Thank you for purchasing!");
      document.getElementById("submit-button").setAttribute("disabled", true);
      document.getElementById("submit-button").innerHTML = "Submitted";
    })
    .catch((error) => {
      console.log("Sorry an error occured, please contact support: " + error);
    });
}

function write_status_message(message) {
  document.getElementById("statusMessage").innerHTML = message;
}
/*****************************************/
setupFormListener();

// Functions to export
export { fb_authenticate };
