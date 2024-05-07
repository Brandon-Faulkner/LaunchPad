// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, set, child } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Realtime Database
const database = getDatabase(app);

window.addEventListener('load', function () {
    //Get reference to questions path from db
    const questionsRef = ref(database, "UserApp/Questions/");
    const mainBox = document.getElementById('main-box');

    //Get the updated questions and add them to screen
    onValue(questionsRef, (snapshot) => {

        removeOldQuestions();

        snapshot.forEach((childSnapshot) => {
            const questionsBox = document.createElement("button");
            questionsBox.setAttribute('type', 'button');
            questionsBox.setAttribute('id', 'questions');
            questionsBox.className = "light-box";
            questionsBox.setAttribute('name', childSnapshot.key);
            questionsBox.innerHTML = childSnapshot.val();
            mainBox.appendChild(questionsBox);
        });
    });

    function removeOldQuestions() {
        while (mainBox.children.length !== 0) {
            document.getElementById("questions").remove();
        }
    }

    const mainOverlay = document.getElementById('main-overlay');
    const questionsBox = document.getElementById('questions-box');
    const questionText = document.getElementById('question-text');
    const questionCancel = document.getElementById('btnQuestionCancel');
    const questionDelete = document.getElementById('btnQuestionDelete');
    var targetName = null

    //Open the main overlay to show the selected question
    mainBox.addEventListener('click', function (event) {
        if (event.target && event.target.id == 'questions') {
            mainOverlay.classList.toggle('fade');
            questionsBox.classList.toggle('fade');
            questionText.textContent = event.target.textContent 
            targetName = event.target.name;          
        }
    });

    //Cancel the removal of the question
    questionCancel.addEventListener('click', function () {
        if (mainOverlay.classList.contains('fade')) {
            mainOverlay.classList.toggle('fade');
            questionsBox.classList.toggle('fade');
        }
    });

    //Remove the question from db
    questionDelete.addEventListener('click', function () {
        set(child(questionsRef, targetName), null);
        if (mainOverlay.classList.contains('fade')) {
            mainOverlay.classList.toggle('fade');
            questionsBox.classList.toggle('fade');
        }
    });
});
