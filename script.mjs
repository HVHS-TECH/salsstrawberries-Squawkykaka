import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  ref,
  set,
  get,
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

      fillInfoFromLogin();
    })

    .catch((error) => {
      console.info("authentication fail, error: " + error);
    });
}

function fillInfoFromLogin() {
  var nameField = document.getElementById("nameField");
  var emailField = document.getElementById("emailField");

  nameField.value = authenticated_user.displayName;
  emailField.value = authenticated_user.email;
}

// This function gets the inputs into the html form.
function setupSubmitListener() {
  const form = document.getElementById("fruitForm");
  console.log(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = {};

    new FormData(form).forEach((value, key) => {
      formData[key] = value;
    });

    fb_writeForm(formData);
    write_status_message("Thank you for purchasing!");
  });
}

// Code to write the form, taking in a object and wiritng it to the users data store.
function fb_writeForm(form_data) {
  if (authenticated_user == "unauthorised") {
    write_status_message("You have not logged in");
    console.log("You have not logged in");
    return;
  }

  if (authenticated_user.displayName == "Ben Britton") {
    write_status_message("Hello  mr britton");
  }

  let userPath = `/users/${authenticated_user.uid}`;

  const userDbRef = ref(FB_GAMEDB, userPath);

  fb_write(userDbRef, form_data, () => {
    console.log("Thank you for purchasing!");
    document.getElementById("submit-button").setAttribute("disabled", true);
    document.getElementById("submit-button").innerHTML = "Submitted";
  });

  fb_write(
    ref(FB_GAMEDB, `/public/${authenticated_user.uid}/favoriteFruit`),
    form_data.favoriteFruit,
    () => {}
  );

  console.log("wowowowowowo");
}

function fb_write(db_ref, data, then) {
  set(db_ref, data)
    .then(then())
    .catch((error) => {
      console.log("Sorry an error occured, please contact support: " + error);
    });
}

function write_status_message(message) {
  document.getElementById("statusMessage").innerHTML = message;
}

function showEmailFromUser() {
  if (authenticated_user == "unauthorised") {
    write_status_message("You have not logged in, cannot show email.");
    console.log("You have not logged in.");
    return;
  }

  let userPath = `/users/${authenticated_user.uid}`;

  get(ref(FB_GAMEDB, userPath))
    .then((snapshot) => {
      var fb_data = snapshot.val();

      if (fb_data == null) {
        write_status_message("You have not submitted a form.");
        return;
      }

      console.log(fb_data);

      write_status_message(
        `
       <div style="background: linear-gradient(135deg, rgba(255, 182, 193, 0.3), #fff0f5); border: 2px solid #ff4757; padding: 1.5rem;
      border-radius: 16px; font-family: 'Comic Sans MS', cursive, sans-serif; color: #8b004b; box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);">
  <h2 style="color: #ff2d55;">ᚠᚢᚱᚢᚾ ᚨᛞᛖᛗ, ${fb_data.name} — Harvester of the Blighted Fruit!</h2>
  <p>Sal’s Strawberry Saloon welcomes you to the orchard of damnation, where every bite drips with the blood of <em style="color:#d14775;">Thal’zor</em> and probably high-fructose corn syrup.</p>
  <p>Your hunger for <strong style="color:#ff699d;">${fb_data.favoriteFruit}</strong> has bound you with a curse: <strong style="color:#ff699d;">${fb_data.fruitQuantity}</strong> times each moon. <em>“Ghor’zal thun’gar, vek’al thul.”</em> Translation: no refunds.</p>
  <p>Your first smoothie, a gift from <strong style="color:#f06292;">Sal’zaroth</strong>, the Abyssal Blender, carries the curse of eternal decay. Also a splash of oat milk. Sip wisely, for the Seed Spirits await your digestive choices.</p>
  <p style="color:#c74c71; font-weight: bold;">Changed your mind? It’s okay, these things happen. You can leave the orchard (and this email thread) anytime. No banishment, no blood pacts. Just click
    <a href="https://www.theuselessweb.com" target="_blank" style="color:#ff8cb3; text-decoration: underline;">here</a> to opt out of your fruity fate (or be launched into the absurd void — who really knows?).</p>
  <p style="margin-top: 2rem; font-style: italic; color:#a73f5e;">Forever cursed and fruit-bound,<br /> <em>— The Cult of Sal’s Strawberry Saloon 🍓</em></p>
</div>
        `
      );
    })
    .catch((error) => {
      console.log("An error occured, the error is\n" + error);
    });
}

// TODO switch to a check if its loaded.
function displayFiveMostPopularFruits() {
  get(ref(FB_GAMEDB, `/public`)).then((snapshot) => {
    var fb_data = snapshot.val();

    // Count how many times each fruit appears
    const fruitCount = {};
    for (const key in fb_data) {
      const fruit = fb_data[key].favoriteFruit;
      fruitCount[fruit] = (fruitCount[fruit] || 0) + 1;
    }

    // Convert counts object to sorted array
    const sortedFruits = Object.entries(fruitCount)
      .sort((a, b) => b[1] - a[1]) // sort descending by amount
      .map(([fruit_name, amount]) => ({ fruit_name, amount }));

    console.log(sortedFruits);
  });
}

/*****************************************/
setupSubmitListener();

setTimeout(displayFiveMostPopularFruits, 2000);

// Functions to export
export { fb_authenticate, showEmailFromUser };
