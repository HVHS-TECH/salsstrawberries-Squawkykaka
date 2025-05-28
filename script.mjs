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

  getSortedFruits();
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
  console.log(message);
}

function showEmailFromUser() {
  if (authenticated_user == "unauthorised") {
    write_status_message("You have not logged in, cannot show email.");
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

      write_status_message(`
  <div style="
    background: linear-gradient(135deg, #ffe4eacc, #fff0f5);
    border: 2px solid #d94f6e;
    padding: 1.8rem;
    border-radius: 20px;
    font-family: 'Comic Sans MS', cursive, sans-serif;
    color: #7b2a42;
    box-shadow: 0 0 18px rgba(219, 72, 119, 0.5);
    max-width: 600px;
  ">
    <h2 style="color: #d94f6e; margin-bottom: 0.4rem;">
      🍓 ${fb_data.name}, Keeper of the Strawberry Paw 🐾
    </h2>
    <p>Welcome to the Glade of Berrys, where the fabled Strawberry
Cats roam and magic tingles in the air.</p>
    <p>Your craving for <strong
style="color:#e67398;">${fb_data.favoriteFruit}</strong> has marked
you, consuming it <strong
style="color:#e67398;">${fb_data.fruitQuantity}</strong> times by
moonlight. The cats watch and wait.</p>
    <p>Your first brew, crafted by the blender-warlock Salzerth, holds
a secret charm — a blend of hairballs and ancient berry magic. Sip
wisely, for the Spirits of lifes whisper riddles to those who drink
too deeply.</p>
    <p style="color:#a94768; font-weight: bold;">
      Feel the call to retreat? No curses here — simply step away from
the glade and your fate by clicking
      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
target="_blank" style="color:#ff8cb3; text-decoration:
underline;">here</a>. The cats will understand (probably).</p>
    <p style="margin-top: 2rem; font-style: italic; color:#864257;">
      Bound by berries and whiskers,<br />
      <em>— The Fellowship of Sal’s Strawberry Cats 🍓🐱</em>
    </p>
  </div>
`);
    })
    .catch((error) => {
      console.log("An error occured, the error is\n" + error);
    });
}

// TODO switch to a check if its loaded.
function getSortedFruits() {
  get(ref(FB_GAMEDB, `/public`)).then((snapshot) => {
    var fb_data = snapshot.val();

    // Count how many times each fruit appears
    const fruitCount = {};
    for (const key in fb_data) {
      // get the current users favorite fruit.
      const fruit = fb_data[key].favoriteFruit;

      // Add 1 to the fruitcount of the current fruit, or 0 so we dont add Null.
      fruitCount[fruit] = (fruitCount[fruit] || 0) + 1;
    }

    // Convert counts object to sorted array
    const sortedFruits = Object.entries(fruitCount)
      .sort((a, b) => b[1] - a[1]) // sort descending by amount
      .map(([fruit_name, amount]) => ({ fruit_name, amount }));

    console.log(sortedFruits);
    displaySortedFruits(sortedFruits);
  });
}

function displaySortedFruits(sortedFruits) {
  var displayMessage = "";
  console.log(sortedFruits);

  for (let i = 0; i < 5; i++) {
    if (i >= sortedFruits.length || i >= 5) {
      break;
    }

    displayMessage += `${sortedFruits[i].fruit_name}: ${sortedFruits[i].amount}<br>`;
  }

  // Assuming you want to display this in an HTML element with id "fruitDisplay"
  document.getElementById("popularFruits").innerHTML = displayMessage;
}

/*****************************************/
setupSubmitListener();

setTimeout(getSortedFruits, 2000);

// Functions to export
export { fb_authenticate, showEmailFromUser };
