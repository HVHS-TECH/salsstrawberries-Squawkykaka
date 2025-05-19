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

function fb_authenticate() {
  const AUTH = getAuth();
  const PROVIDER = new GoogleAuthProvider();

  // The following makes Google ask the user to select the account

  PROVIDER.setCustomParameters({
    prompt: "select_account",
  });

  signInWithPopup(AUTH, PROVIDER)
    .then((result) => {
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
function retrive_form() {
  const nameInput = document.getElementById("name");
  const favoriteFruitInput = document.getElementById("favoriteFruit");
  const fruitQuantityInput = document.getElementById("fruitQuantity");

  return {
    name: nameInput.value,
    favoriteFruit: favoriteFruitInput.value,
    fruitQuantity: fruitQuantityInput.value,
  };
}

function fb_write() {
  if (authenticated_user == "unauthorised") {
    console.log("You have not logged in");
    return;
  }

  let input = retrive_form();
  let path = `/users/${authenticated_user.uid}`;

  console.log(input);

  const userDbRef = ref(FB_GAMEDB, path);
  set(userDbRef, input)
    .then(() => {
      console.log("Thank you for purchasing!");
      document.getElementById("submit-button").setAttribute("disabled", true);
      document.getElementById("submit-button").innerHTML = "Submitted";
    })
    .catch((error) => {
      console.log("Sorry an error occured, please contact support: " + error);
    });
}

// Functions to export
export { fb_authenticate, fb_write };
