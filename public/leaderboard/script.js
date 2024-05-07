// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { getDatabase, ref, onValue, child, update } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-database.js";

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
const userAppRef = ref(database, 'UserApp/');

function FadeInOut(elem, show) {
    if (show == true) {
        elem.classList.remove("fadeOut");
        elem.style = "";
        elem.classList.add("fadeIn");
    } else {
        elem.classList.remove("fadeIn");
        elem.classList.add("fadeOut");
        setTimeout(() => {
            elem.style = "display: none";
        }, 200);
    }
}

function ClearLeaderboard(boardNames) {
    boardNames.forEach((board) => {
        for (let i = 0; i < 5; i++) {
            document.getElementById(board + i).textContent = null;
        }
    });
}

window.addEventListener('load', function () {
    //Firebase listener unsubscribers
    var donorUnsub = null;
    var prayerUnsub = null;
    var teamUnsub = null;

    var currentProject = null;
    var currentSponsor = null;
    var isDonorBoardOn = true;
    var isPrayerBoardOn = true;
    var isTeamBoardOn = true;

    const projectOwnerName = document.getElementById('project-owner-name');
    const sponsorName = document.getElementById('sponsor-name');
    const donorBoard = document.getElementById('donor');
    const donorTotal = document.getElementById('donor-total');
    const prayerBoard = document.getElementById('prayer');
    const prayerTotal = document.getElementById('prayer-total');
    const teamBoard = document.getElementById('team');
    const teamTotal = document.getElementById('team-total');

    const currencyFormatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD', minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    onValue(userAppRef, (snapshot) => {

        //Get and set all the values from db
        if (snapshot.exists()) {
            currentProject = snapshot.child("CurrentProject").val();
            currentSponsor = snapshot.child("CurrentSponsor").val();
            isDonorBoardOn = snapshot.child("isDonorBoardOn").val();
            isPrayerBoardOn = snapshot.child("isPrayerBoardOn").val();
            isTeamBoardOn = snapshot.child("isTeamBoardOn").val();
        }

        //Upate the leaderboard with owner, sponsor and board values
        projectOwnerName.textContent = currentProject;
        sponsorName.textContent = currentSponsor;

        //Fade in/out the boards and corresponding total
        FadeInOut(donorBoard, isDonorBoardOn); FadeInOut(donorTotal, isDonorBoardOn);
        FadeInOut(prayerBoard, isPrayerBoardOn); FadeInOut(prayerTotal, isPrayerBoardOn);
        FadeInOut(teamBoard, isTeamBoardOn); FadeInOut(teamTotal, isTeamBoardOn);

        try {
            //Clear the leaderboard initially before adding new names
            ClearLeaderboard(["donor", "prayer", "team"]);

            //Listeners to get each board's data
            if (isDonorBoardOn) {
                donorUnsub == null ? null : donorUnsub();
                donorUnsub = onValue(ref(database, 'Projects/' + currentProject + "/Board:Donors/Names/"), (snapshot) => {
                    const donorArray = [];
                    var totalPledges = 0;
                    snapshot.forEach((data) => {
                        var pledgeAmount = data.child("Pledge").val();
                        donorArray.push({ name: data.child("Name").val(), pledge: pledgeAmount });
                        totalPledges += pledgeAmount;
                    });
                    donorArray.sort((a, b) => (b.pledge - a.pledge));

                    ClearLeaderboard(["donor"]);
                    for (let i = 0; i < donorArray.slice(0,5).length; i++) {
                        document.getElementById("donor" + i).textContent =
                            donorArray[i].name + " " + currencyFormatter.format(donorArray[i].pledge);
                    }

                    donorTotal.textContent = "Pledges: " + currencyFormatter.format(totalPledges);
                    const updates = {}; updates['Projects/' + currentProject + '/Totals/Pledges'] = currencyFormatter.format(totalPledges);
                    update(ref(database), updates);
                });
            } else {
                donorUnsub == null ? null : donorUnsub();
            }

            if (isPrayerBoardOn) {
                prayerUnsub == null ? null : prayerUnsub();
                prayerUnsub = onValue(ref(database, 'Projects/' + currentProject + "/Board:PrayerPartners/Names/"), (snapshot) => {
                    const prayerArray = [];
                    snapshot.forEach((data) => {
                        prayerArray.unshift(data.val());
                    });
    
                    ClearLeaderboard(["prayer"]);
                    for (let i = 0; i < prayerArray.slice(0,5).length; i++) {
                        document.getElementById("prayer" + i).textContent = prayerArray[i];
                    }
    
                    prayerTotal.textContent = "Partners: " + snapshot.size;
                    const updates = {}; updates['Projects/' + currentProject + '/Totals/Partners'] = snapshot.size;
                    update(ref(database), updates);
                });
            } else {
                prayerUnsub == null ? null : prayerUnsub();
            }
            
            if (isTeamBoardOn) {
                teamUnsub == null ? null : teamUnsub();
                teamUnsub = onValue(ref(database, 'Projects/' + currentProject + "/Board:TeamMembers/Names/"), (snapshot) => {
                    const teamArray = [];
                    snapshot.forEach((data) => {
                        teamArray.unshift(data.val());
                    });
    
                    ClearLeaderboard(["team"]);
                    for (let i = 0; i < teamArray.slice(0,5).length; i++) {
                        document.getElementById("team" + i).textContent = teamArray[i];
                    }
    
                    teamTotal.textContent = "Members: " + snapshot.size;
                    const updates = {}; updates['Projects/' + currentProject + '/Totals/Members'] = snapshot.size;
                    update(ref(database), updates);
                });
            } else {
                teamUnsub == null ? null : teamUnsub();
            }    
        } catch (error) {
            console.log(error);
        }
    });
});