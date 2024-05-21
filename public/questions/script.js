// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getDatabase, ref, onValue, set, child } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Your web app's Firebase configuration
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

function FadeInOut(elem, show) {
    if (show == true) {
        elem.classList.remove("fadeOut");
        elem.style = "display: flex";
        elem.classList.add("fadeIn");
    } else {
        elem.classList.remove("fadeIn");
        elem.classList.add("fadeOut");
        setTimeout(() => {
            elem.style = "display: none";
        }, 200);
    }
}

window.addEventListener('load', function () {
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
                loginEmail.classList.add('login-error');
                loginPassword.classList.add('login-error');
                loginButton.classList.remove('login-click');
            });
        } else {
            loginEmail.classList.add('login-error');
            loginPassword.classList.add('login-error');
            loginButton.classList.remove("login-click");
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
        if (auth?.currentUser.isAnonymous === false) {
            signOut(auth).then(() => {
                location.reload();
            }).catch((error) => {
                console.log(error.code + ": " + error.message);
                alert("There was an issue with signing you out. Please try again.");
            });
        }
    });
});

function ContinueWithApp() {
    //Get reference to questions path from db
    const questionsRef = ref(database, "UserApp/Questions/");
    const questionHolder = document.getElementById('question-holder');
    const noQuestionsLabel = document.getElementById('no-questions');

    //Get the updated questions and add them to screen
    onValue(questionsRef, (snapshot) => {
        while (questionHolder.children.length !== 0) {
            document.getElementById("questions").remove();
        }

        snapshot.forEach((childSnapshot) => {
            const question = document.createElement("h3");
            question.setAttribute('id', 'questions');
            question.setAttribute('name', childSnapshot.key);
            question.textContent = childSnapshot.val();
            questionHolder.appendChild(question);
        });

        //Check if there are questions to show/hide the no question label
        if (questionHolder.children.length === 0) {
            FadeInOut(noQuestionsLabel, true);
            FadeInOut(questionHolder, false);
        } else {
            FadeInOut(noQuestionsLabel, false);
            FadeInOut(questionHolder, true);
        }
    });

    const mainOverlay = document.getElementById('main-overlay');
    const overlayText = document.getElementById('overlay-text');
    const overlayCancel = document.getElementById('btnQuestionCancel');
    const overlayDelete = document.getElementById('btnQuestionDelete');
    var targetName = null;

    //Open the main overlay to show the selected question
    questionHolder.addEventListener('click', function (event) {
        if (event.target && event.target.id == 'questions') {
            FadeInOut(mainOverlay, true);
            overlayText.textContent = event.target.textContent;
            targetName = event.target.getAttribute('name');
        }
    });

    //Cancel the removal of the question
    overlayCancel.addEventListener('click', function () {
        FadeInOut(mainOverlay, false);
    });

    //Remove the question from db
    overlayDelete.addEventListener('click', function () {
        set(child(questionsRef, targetName), null);
        FadeInOut(mainOverlay, false);
    });
}
