//#region Firebase Initalization
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, onValue, child, push, set } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCkhBqKXXHQcgk9QYS7TTCY9I1kjx_bowk",
  authDomain: "cana-launchpad.firebaseapp.com",
  projectId: "cana-launchpad",
  storageBucket: "cana-launchpad.appspot.com",
  messagingSenderId: "47186518351",
  appId: "1:47186518351:web:d40c2d357ead5636b8653a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

const isUsableRef = ref(database, 'UserApp/isUsable');
const projectOwnerRef = ref(database, 'UserApp/CurrentProject');
const sponsorNameRef = ref(database, 'UserApp/CurrentSponsor');
const prayerBoardRef = ref(database, 'UserApp/isPrayerBoardOn');
const donorBoardRef = ref(database, 'UserApp/isDonorBoardOn');
const teamBoardRef = ref(database, 'UserApp/isTeamBoardOn');
//#endregion Firebase Initialization

//#region Main Functions
window.addEventListener('load', (event) => {
  //Ensure that the browser supports the service worker API then register it
  var registration = null;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('../service-worker.js').then(reg => {
      registration = reg;
      console.log('Service Worker Registered');
    }).catch(swErr => console.log(`Service Worker Installation Error: ${swErr}}`));
  }

  //Detect users prefered color scheme
  const darkModeToggle = document.getElementById("dark-mode-toggle");
  const localTheme = localStorage.getItem("theme");
  const darkTheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currTheme = GetThemeString(localTheme, darkTheme);
  document.querySelector("html").setAttribute("data-theme", currTheme);
  currTheme === "dark" ? darkModeToggle.className = "fa-solid fa-lightbulb" : darkModeToggle.className = "fa-regular fa-lightbulb";
  document.querySelector('meta[name="theme-color"]').setAttribute("content", currTheme === "dark" ? "#242424" : "#fff");

  function GetThemeString(localTheme, darkTheme) {
    if (localTheme !== null) return localTheme;
    if (darkTheme.matches) return "dark";
    return "light";
  }

  darkModeToggle.addEventListener('click', function () {
    const newTheme = darkModeToggle.classList.contains("fa-solid") ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    document.querySelector("html").setAttribute("data-theme", newTheme);
    newTheme === "dark" ? darkModeToggle.className = "fa-solid fa-lightbulb" : darkModeToggle.className = "fa-regular fa-lightbulb";
    document.querySelector('meta[name="theme-color"]').setAttribute("content", newTheme === "dark" ? "#242424" : "#fff");
  });

  //#region Variables
  //Overlay Elems
  const loadingAnim = document.getElementById("loader");
  const loadingOverlay = document.getElementById("loading-overlay");
  const notTimeBox = document.getElementById("not-time-box");
  const mainOverlay = document.getElementById("main-overlay");
  const overlayMainBox = document.getElementById("overlay-mainbox");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayTextBox = document.getElementById("overlay-textbox");
  const btnOverlayCancel = document.getElementById("btnOverlayCancel");
  const btnOverlaySubmit = document.getElementById("btnOverlaySubmit");

  //Overlay Messages - Option Not Selected, Amount Is Empty, Submission Successful, Error With Submission
  const submitOptionText = "It looks like you didn't select from one of the available options to be part of for this project. Before you submit, please make sure to select any option(s).";
  const submitAmountText = "Please enter your donation amount to update the leaderboard. We'll contact you after LaunchPad to finalize your donation. Press submit after entering the amount.";
  const submitSuccessText = "Your name and options for the project are submitted successfully and should show on the Leaderboard! If you chose to be a Donor/Pledger, no payment today; we'll reach out post LaunchPad for the contribution.";
  const submitErrorText = "Oops! Something went wrong with your submission. Please submit again or reload the page and submit.";
  const submitQuestionText = "Your question has been submitted. The host will do their best to ask your question in a timely manner!";

  //Main page Elems
  const projectOwnerName = document.getElementById("project-owner-name");
  const sponsorName = document.getElementById("sponsor-name");
  const prayerBoard = document.getElementById("prayer");
  const donorBoard = document.getElementById("donor");
  const teamBoard = document.getElementById("team");

  const btnQuestion = document.getElementById("btnQuestion");
  const usersName = document.getElementById("usersName");
  const btnSubmit = document.getElementById("btnSubmit");

  const inputCurrency = document.getElementById("currency-field");
  inputCurrency.addEventListener("keyup", function () { CheckForNumber(inputCurrency) });
  //#endregion Variables

  //#region Firebase Listeners
  onAuthStateChanged(auth, (user) => {
    if (user) {
      //Signed in Anonymously
      onValue(isUsableRef, (snapshot) => {
        if (snapshot.val() === true) {
          FadeElems(loadingOverlay, false);
          FadeElems(notTimeBox, false);
          FadeElems(loadingAnim, false);
        }
        else {
          FadeElems(loadingOverlay, true, true);
          FadeElems(notTimeBox, true, true);
          FadeElems(loadingAnim, false);
        }
      });
    } else {
      //Signed out
      signInAnonymously(auth)
        .then(() => {
          console.log("Signed in Anonymously");
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  });

  //Determine the Current Project Owner
  onValue(projectOwnerRef, (snapshot) => {
    const project = snapshot.val();
    projectOwnerName.textContent = project;

    inputCurrency.value = "";
    document.getElementById("prayerNo").checked = true;
    document.getElementById("donorNo").checked = true;
    document.getElementById("teamNo").checked = true;
  });

  //Determine the Current Sponsor
  onValue(sponsorNameRef, (snapshot) => {
    const sponsor = snapshot.val();
    sponsorName.textContent = sponsor;
  });

  //Prayer Board
  onValue(prayerBoardRef, (snapshot) => {
    const prayer = snapshot.val();

    if (String(prayer) === "true") {
      FadeElems(prayerBoard, true);
    }
    else if (String(prayer) === "false") {
      FadeElems(prayerBoard, false);
    }
  });

  //Donor Board
  onValue(donorBoardRef, (snapshot) => {
    const donor = snapshot.val();

    if (String(donor) === "true") {
      inputCurrency.disabled = false;
      FadeElems(donorBoard, true);
    }
    else if (String(donor) === "false") {
      inputCurrency.disabled = true;
      FadeElems(donorBoard, false);
    }
  });

  //Team Board
  onValue(teamBoardRef, (snapshot) => {
    const team = snapshot.val();

    if (String(team) === "true") {
      FadeElems(teamBoard, true);
    }
    else if (String(team) === "false") {
      FadeElems(teamBoard, false);
    }
  });
  //#endregion Firebase Listeners

  //#region Event Listeners
  usersName.addEventListener('input', function () {
    this.value = this.value.replace(/[0123456789,./\\/-=+/';"\]\[{}/()!@#$%^&*`~_<>?:|/]/g, "");
    if (usersName.value.trim().length >= 1) {
      FadeElems(btnSubmit, true)
    }
    else {
      FadeElems(btnSubmit, false);
    }
  });

  btnQuestion.addEventListener('click', function () {
    FadeElems(mainOverlay, true);
    UpdatePopup("question", "What's on your mind?", "true", "");
  });

  btnOverlayCancel.addEventListener('click', function () {
    FadeElems(mainOverlay, false);
    UpdatePopup("popup", "Title", "false", "");
  });

  btnOverlaySubmit.addEventListener('click', function () {
    if (overlayMainBox.getAttribute("data-type") == "question") {
      if (overlayTextBox.value != "" && overlayTextBox.value != " ") {
        //Submit the question to the DB under UserApp/Questions
        push(child(ref(database), 'UserApp/Questions'), overlayTextBox.value);
        UpdatePopup("popup", "Question Submitted", "false", submitQuestionText);
        return;
      }
    }

    FadeElems(mainOverlay, false);
    UpdatePopup("popup", "Title", "false", "");
  });

  btnSubmit.addEventListener('click', function () {
    var donorPath = projectOwnerName.textContent + "/Board:Donors/Names";
    var prayerPath = projectOwnerName.textContent + "/Board:PrayerPartners/Names";
    var teamPath = projectOwnerName.textContent + "/Board:TeamMembers/Names";

    var prayerValue = document.querySelector('input[name="prayerRadio"]:checked').value;
    var donorValue = document.querySelector('input[name="donorRadio"]:checked').value;
    var teamValue = document.querySelector('input[name="teamRadio"]:checked').value;

    try {
      FadeElems(mainOverlay, true);

      //Determine which submit overlay to show
      if (prayerValue == "no" && donorValue == "no" && teamValue == "no") {
        UpdatePopup("popup", "Option Not Selected", "false", submitOptionText);
      }
      else {
        if (donorValue == "yes") {
          var editedAmount = String(inputCurrency.value).replace(/[$,]/g, "");

          if (editedAmount > 0) {
            //Submit to donor location in DB        
            var donorKey = push(child(ref(database), 'Projects/' + donorPath)).key;
            set(child(ref(database), 'Projects/' + donorPath + "/" + donorKey), {
              Name: usersName.value.trim(),
              Pledge: Number(editedAmount)
            });

            //Submit to prayer location in DB if yes
            if (prayerValue == "yes") {
              push(child(ref(database), 'Projects/' + prayerPath), usersName.value.trim());
            }

            //Submit to team location in DB if yes
            if (teamValue == "yes") {
              push(child(ref(database), 'Projects/' + teamPath), usersName.value.trim());
            }

            UpdatePopup("popup", "Submission Successful", "false", submitSuccessText);
          }
          else {
            UpdatePopup("popup", "Amount Is Empty", "false", submitAmountText);
          }
        }
        else {
          //Submit to prayer location in DB if yes
          if (prayerValue == "yes") {
            push(child(ref(database), 'Projects/' + prayerPath), usersName.value.trim());
          }

          //Submit to team location in DB if yes
          if (teamValue == "yes") {
            push(child(ref(database), 'Projects/' + teamPath), usersName.value.trim());
          }

          UpdatePopup("popup", "Submission Successful", "false", submitSuccessText);
        }
      }
    } catch (error) {
      UpdatePopup("popup", "Error With Submission", "false", submitErrorText);
      console.log(error);
    }
  });
  //#endregion Event Listeners

  //#region Helper Functions
  var goodValue = null;
  function CheckForNumber(input) {
    var inputValue = input.value.replace(/\$|,/g, "");

    if (inputValue == "0" || inputValue == "") {
      goodValue = "";
      input.value = goodValue;
      return;
    }

    if (inputValue.match(/^[0-9]+$/) || inputValue.length == 0) {
      goodValue = inputValue;
      FormatCurrency(inputValue);
    } else {
      FormatCurrency(goodValue);
    }
  }

  function FormatCurrency(inputValue) {
    inputCurrency.value = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(inputValue);
  }

  function FadeElems(elem, show, isLoader) {
    if (show == true) {
      if (isLoader) {
        if (elem.classList.contains("fadeOut")) {
          elem.classList.remove("fadeOut");
          elem.classList.add("fadeIn");
        }
      } else {
        elem.classList.remove("fadeOut");
        elem.classList.add("fadeIn");
      }
    } else {
      elem.classList.remove("fadeIn");
      elem.classList.add("fadeOut");
    }
  }

  function UpdatePopup(type, title, editable, content) {
    overlayMainBox.setAttribute("data-type", type);
    overlayTitle.textContent = title;
    overlayTextBox.value = content;

    if (editable == "true") {
      overlayTextBox.removeAttribute("disabled");
    } else {
      overlayTextBox.setAttribute("disabled", "true");
    }

    if (type == "question") {
      btnOverlayCancel.style = "";
      btnOverlaySubmit.textContent = "Submit";
    } else {
      btnOverlayCancel.style.display = "none";
      btnOverlaySubmit.textContent = "Got It";
    }
  }
  //#endregion Helper Functions
});
//#endregion Main Functions