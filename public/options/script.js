// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, onValue, get, child, update } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

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
const projectsRef = ref(database, 'Projects/');
const userAppRef = ref(database, 'UserApp/');

function FadeElems(elem, show) {
  if (show == true) {
    elem.classList.remove("fadeOut");
    elem.classList.add("fadeIn");
  } else {
    elem.classList.remove("fadeIn");
    elem.classList.add("fadeOut");
    elem.style = "";
  }
}

function ShowNotifToast(title, message, statusColor, isTimed, seconds) {
  const toastElem = document.querySelector('.toast');
  const toastMessage = document.querySelector('.toast-message');
  const toastProgress = document.querySelector('.toast-progress');
  const toastClose = document.querySelector('.toast .close');

  //Check if toast is active, wait if it is
  if (toastElem.classList.contains('active')) {
    setTimeout(() => {
      ShowNotifToast(title, message, statusColor, isTimed, seconds);
    }, 1000);
  } else {
    //Change --toast-status css var to statusColor
    toastElem.style.setProperty('--toast-status', statusColor);

    //Update toast title
    toastMessage.children[0].textContent = title;
    toastMessage.children[1].textContent = message;

    //Now show the toast
    toastElem.classList.add('active');

    //Show the progress bar if isTimed is true
    if (isTimed === true) {
      toastProgress.style.setProperty('--toast-duration', seconds + 's');
      toastProgress.classList.add('active');

      toastProgress.addEventListener("animationend", function () {
        toastElem.classList.remove('active');
        toastProgress.classList.remove('active');
      });
    }
  }

  toastClose.addEventListener('click', function () {
    toastProgress.classList.remove('active');
    toastElem.classList.remove('active');
  });
}

window.addEventListener('load', (event) => {
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

  var loginPage = document.getElementById("login-page");
  var loginButton = document.getElementById("login-button");
  var loginEmail = document.getElementById("login-email");
  var loginPassword = document.getElementById("login-password");
  var loginPeek = loginPassword.nextElementSibling;
  var signOutBtn = document.querySelector('[title="Sign Out"]');

  //Detect login status
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.isAnonymous === false) {
        //Signed in admin
        loginPage.remove();
        ContinueWithApp();
      } else {
        //No one is signed in, prompt login
        loginPage.classList.add("pop-up");
      }
    } else {
      //No one is signed in, prompt login
      loginPage.classList.add("pop-up");
    }
  });

  loginButton.addEventListener('click', function () {
    loginEmail.classList.remove("login-error");
    loginPassword.classList.remove("login-error");
    loginButton.classList.add("login-click");

    if (loginEmail.value.trim().length > 0 && loginPassword.value.trim().length > 0) {
      signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value).catch((error) => {
        console.log(error.message);
        loginEmail.classList.add('login-error');
        loginPassword.classList.add('login-error');
        loginButton.classList.remove('login-click');
      });
    } else {
      loginEmail.classList.add('login-error');
      loginPassword.classList.add('login-error');
      loginButton.classList.remove("login-click");
      ShowNotifToast("Invalid Login", "Only Admins have access to this page. If you are an admin, please try to login again.", "var(--color-red)", true, 5);
    }
  });

  loginPeek.addEventListener('click', function () {
    if (loginPeek.classList.contains('fa-eye')) {
      loginPeek.className = "fa-solid fa-eye-slash eye-icon";
      loginPassword.setAttribute('type', 'text');
    } else {
      loginPeek.className = "fa-solid fa-eye eye-icon";
      loginPassword.setAttribute('type', 'password');
    }
  });

  signOutBtn.addEventListener('click', function () {
    if (auth?.currentUser?.isAnonymous === false) {
      signOut(auth).then(() => {
        location.reload();
      }).catch((error) => {
        console.log(error.code + ": " + error.message);
        ShowNotifToast("Sign Out Error", "There was an issue with signing you out. Please try again.", "var(--red)", true, 5);
      });
    }
  });

  document.body.addEventListener('click', function (event) {
    const menuCheckbox = document.getElementById('menu').children[0];
      if (menuCheckbox.checked) {
        if(event.target.parentElement.getAttribute('id') !== 'menu') {
          menuCheckbox.checked = false;
        }
      }
  });
});

function ContinueWithApp() {
  //Get all project names from db then add to dropdown box
  var allProjectsArray = [];
  var currentProject = null;
  const projectDropdown = document.getElementById('project-dropdown');

  get(projectsRef).then((snapshot) => {
    if (snapshot.exists()) {
      snapshot.forEach((projects) => {
        allProjectsArray.push(projects.key);
      });

      for (let i = 0; i < allProjectsArray.length; i++) {
        var project = document.createElement('option');
        project.value = allProjectsArray[i].trim();
        project.innerHTML = allProjectsArray[i].trim();
        projectDropdown.appendChild(project);
      }

      allProjectsArray = null;
      loadCurrentProject();
    }
  });

  //Get the current project & sponsor name as well as current board values
  function loadCurrentProject() {
    onValue(userAppRef, (snapshot) => {
      currentProject = snapshot.child('CurrentProject').val().trim();
      projectDropdown.value = snapshot.child('CurrentProject').val().trim();
      document.getElementById('name').value = snapshot.child('CurrentSponsor').val();

      //Donor board on or off
      if (snapshot.child('isDonorBoardOn').val() === true) {
        document.getElementById("donorOn").checked = true;
      }
      else {
        document.getElementById("donorOff").checked = true;
      }

      //Prayer board on or off
      if (snapshot.child('isPrayerBoardOn').val() === true) {
        document.getElementById("prayerOn").checked = true;
      }
      else {
        document.getElementById("prayerOff").checked = true;
      }

      //Team board on or off
      if (snapshot.child('isTeamBoardOn').val() === true) {
        document.getElementById("teamOn").checked = true;
      }
      else {
        document.getElementById("teamOff").checked = true;
      }

      //User app toggle on or off
      if (snapshot.child('isUsable').val() === true) {
        document.getElementById('userOn').checked = true;
      }
      else {
        document.getElementById('userOff').checked = true;
      }
    });
  }

  projectDropdown.addEventListener("change", (event) => {
    if (projectDropdown.value != "Default") {
      //Update project isSelected values in db
      const updateProjects = {};
      updateProjects[currentProject + "/isSelected"] = false;
      updateProjects[projectDropdown.value + "/isSelected"] = true;
      update(ref(database, 'Projects/'), updateProjects);

      //Get sponsor and board values from new project in db
      var donorBoardValue, prayerBoardValue, teamBoardValue, sponsorValue = null;
      const updateUserApp = {};

      get(child(projectsRef, projectDropdown.value)).then((snapshot) => {
        donorBoardValue = snapshot.child("Board:Donors").child("isBoardOn").val();
        prayerBoardValue = snapshot.child("Board:PrayerPartners").child("isBoardOn").val();
        teamBoardValue = snapshot.child("Board:TeamMembers").child("isBoardOn").val();
        sponsorValue = snapshot.child("Sponsor").val();

        //Update user app value in db   
        updateUserApp["CurrentProject"] = projectDropdown.value;
        updateUserApp["CurrentSponsor"] = sponsorValue;
        updateUserApp["isDonorBoardOn"] = donorBoardValue;
        updateUserApp["isPrayerBoardOn"] = prayerBoardValue;
        updateUserApp["isTeamBoardOn"] = teamBoardValue;
        update(userAppRef, updateUserApp);
      });
    }
  });

  //Add Event listeners for each overlay button
  const userAppCancel = document.getElementById("btnUserCancel");
  const userAppSubmit = document.getElementById("btnUserSubmit");
  const leaderboardDone = document.getElementById("btnLeaderboardOk");
  const mainOverlay = document.getElementById("main-overlay");
  const userAppOverlay = document.getElementById("user-app");
  const leaderboardOverlay = document.getElementById("leaderboard");

  userAppCancel.addEventListener("click", () => {
    FadeElems(userAppOverlay, false);
    FadeElems(mainOverlay, false);
  });

  userAppSubmit.addEventListener("click", () => {
    var isUserAppUsable = (document.querySelector('input[name="userRadio"]:checked').value === "true");

    const updateUserApp = {};
    updateUserApp['isUsable'] = isUserAppUsable;
    update(userAppRef, updateUserApp);

    FadeElems(userAppOverlay, false);
    FadeElems(mainOverlay, false);
    ShowNotifToast("User App Changed", isUserAppUsable === true ? "User app has been turned on." : "User app has been turned off.", "var(--color-green)", true, 5);
  });

  leaderboardDone.addEventListener("click", () => {
    FadeElems(leaderboardOverlay, false);
    FadeElems(mainOverlay, false);
  });

  //Add Event listeners for each button on main page
  const userAppBtn = document.getElementById('btnUserApp');
  const leaderboardBtn = document.getElementById('btnLeaderboard');
  const submitSponsorBtn = document.getElementById('btnSponsorName');
  const submitBoardsBtn = document.getElementById('btnBoardChanges');

  userAppBtn.addEventListener("click", () => {
    FadeElems(mainOverlay, true);
    FadeElems(userAppOverlay, true);
    userAppOverlay.style.display = 'grid';
  });

  //Add Event listeners for each of the cancel and delete btns on the leaderboard page
  (function addBtnListeners() {
    for (let i = 0; i < 3; i++) {
      document.getElementById("btnCancel" + i).addEventListener("click", cancelCheckboxes);
      document.getElementById("btnDelete" + i).addEventListener("click", deleteCheckboxes)

    }
  })();

  //Cancel event listener
  function cancelCheckboxes() {
    var currentBoard = this.getAttribute("name");

    switch (currentBoard) {
      case "prayer":
        var prayerPartners = document.getElementById("prayerPartners");
        var checkboxes = prayerPartners.children;
        for (let i = 0; i < prayerPartners.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
      case "donor":
        var donorsPledgers = document.getElementById("donorsPledgers");
        var checkboxes = donorsPledgers.children;
        for (let i = 0; i < donorsPledgers.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
      case "team":
        var teamMembers = document.getElementById("teamMembers");
        var checkboxes = teamMembers.children;
        for (let i = 0; i < teamMembers.children.length; i++) {
          checkboxes[i].firstChild.checked = false;
        }
        break;
    }
  }

  //Delete names event listener
  function deleteCheckboxes() {
    var currentBoard = this.getAttribute("name");

    switch (currentBoard) {
      case "prayer":
        var prayerPartners = document.getElementById("prayerPartners");
        var checkboxes = prayerPartners.children;
        const updatePrayerPartner = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updatePrayerPartner[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:PrayerPartners/Names/"), updatePrayerPartner);
          ShowNotifToast("Names Removed", "The selected names have been removed from the Prayer Partner Board.", "var(--color-green)", true, 5);
        }
        break;
      case "donor":
        var donorsPledgers = document.getElementById("donorsPledgers");
        var checkboxes = donorsPledgers.children;
        const updateDonorsPledgers = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updateDonorsPledgers[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:Donors/Names/"), updateDonorsPledgers);
          ShowNotifToast("Names Removed", "The selected names have been removed from the Donor Board.", "var(--color-green)", true, 5);
        }
        break;
      case "team":
        var teamMembers = document.getElementById("teamMembers");
        var checkboxes = teamMembers.children;
        const updateTeamMembers = {};

        if (checkboxes.length > 0) {
          for (let i = 0; i < checkboxes.length; i++) {
            if (checkboxes[i].firstChild.checked == true) {
              updateTeamMembers[checkboxes[i].firstChild.value] = null;
              checkboxes[i].setAttribute("name", "delete");
            }
          }

          var removeCheckboxes = document.getElementsByName("delete");
          for (let i = removeCheckboxes.length - 1; i >= 0; i--) {
            removeCheckboxes[i].remove();
          }

          update(child(projectsRef, projectDropdown.value + "/Board:TeamMembers/Names/"), updateTeamMembers);
          ShowNotifToast("Names Removed", "The selected names have been removed from the Team Member Board.", "var(--color-green)", true, 5);
        }
        break;
    }
  }

  leaderboardBtn.addEventListener("click", () => {
    FadeElems(mainOverlay, true);
    FadeElems(leaderboardOverlay, true);
    leaderboardOverlay.style.display = 'grid';

    var prayerPartners = document.getElementById("prayerPartners");
    var donorsPledgers = document.getElementById("donorsPledgers");
    var teamMembers = document.getElementById("teamMembers");

    //Clear all boards
    while (prayerPartners.firstChild) {
      prayerPartners.removeChild(prayerPartners.lastChild);
    }
    while (donorsPledgers.firstChild) {
      donorsPledgers.removeChild(donorsPledgers.lastChild);
    }
    while (teamMembers.firstChild) {
      teamMembers.removeChild(teamMembers.lastChild);
    }

    //Load the names from each board from DB
    //Prayer Board
    get(child(projectsRef, projectDropdown.value + "/Board:PrayerPartners/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.val();
        newPerson.appendChild(span);

        prayerPartners.appendChild(newPerson);
      });
    });

    //Donor Board
    get(child(projectsRef, projectDropdown.value + "/Board:Donors/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.child("Name").val() + " $" + childSnap.child("Pledge").val()
        newPerson.appendChild(span);

        donorsPledgers.appendChild(newPerson);
      });
    });

    //Team Board
    get(child(projectsRef, projectDropdown.value + "/Board:TeamMembers/Names")).then((snapshot) => {
      snapshot.forEach((childSnap) => {
        var newPerson = document.createElement("label");
        newPerson.className = "checkbox checkbox-label";

        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("id", childSnap.key);
        checkbox.setAttribute("value", childSnap.key);
        newPerson.appendChild(checkbox);

        var span = document.createElement("span");
        span.innerText = childSnap.val();
        newPerson.appendChild(span);

        teamMembers.appendChild(newPerson);
      });
    });
  });

  submitSponsorBtn.addEventListener("click", (event) => {
    const sponsorName = document.getElementById('name').value;

    //Update value in db under User App
    const updateUserSponsor = {};
    updateUserSponsor["CurrentSponsor"] = sponsorName;
    update(userAppRef, updateUserSponsor).then(() => {
      //Update value in db under Projects
      const updateProjectSponsor = {};
      updateProjectSponsor["Sponsor"] = sponsorName;
      update(child(projectsRef, projectDropdown.value + "/"), updateProjectSponsor).then(() => {
        //Show the success toast
        ShowNotifToast("Sponsor Submitted", "The names of the sponsors you entered were successfully submitted.", "var(--color-green)", true, 5);
      }).catch((projectError) => {
        ShowNotifToast("Error With Submission", projectError.message, "var(--color-red)", true, 5);
      });
    }).catch((userError) => {
      ShowNotifToast("Error With Submission", userError.message, "var(--color-red)", true, 5);
    });
  });

  submitBoardsBtn.addEventListener("click", (event) => {
    var donorBoardValue = (document.querySelector('input[name="donorRadio"]:checked').value === "true");
    var prayerBoardValue = (document.querySelector('input[name="prayerRadio"]:checked').value === "true");
    var teamBoardValue = (document.querySelector('input[name="teamRadio"]:checked').value === "true");

    //Update values in db under User App
    const updateUserBoards = {};
    updateUserBoards["isDonorBoardOn"] = donorBoardValue;
    updateUserBoards["isPrayerBoardOn"] = prayerBoardValue;
    updateUserBoards["isTeamBoardOn"] = teamBoardValue;
    update(userAppRef, updateUserBoards).then(() => {
      //Update values in db under Projects
      const updateProjectBoards = {};
      updateProjectBoards["/Board:Donors/isBoardOn"] = donorBoardValue;
      updateProjectBoards["/Board:PrayerPartners/isBoardOn"] = prayerBoardValue;
      updateProjectBoards["/Board:TeamMembers/isBoardOn"] = teamBoardValue;
      update(child(projectsRef, projectDropdown.value), updateProjectBoards).then(() => {
        //Show the success toast
        ShowNotifToast("Board Changes Submitted", "The options you selected for the boards were submitted successfully.", "var(--color-green)", true, 5);
      }).catch((projectError) => {
        ShowNotifToast("Error With Submission", projectError.message, "var(--color-red)", true, 5);
      });
    }).catch((userError) => {
      ShowNotifToast("Error With Submission", userError.message, "var(--color-red)", true, 5);
    });
  });
}