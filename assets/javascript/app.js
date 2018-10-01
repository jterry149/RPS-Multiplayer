// Initialize Firebase
var config = {
    apiKey: "AIzaSyCOfFPjQyDBs4F3rpyaLoX2W6TzbWa_7qU",
    authDomain: "rps-multiplayer-e7c2f.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-e7c2f.firebaseio.com",
    projectId: "rps-multiplayer-e7c2f",
    storageBucket: "",
    messagingSenderId: "800713197043"
};

firebase.initializeApp(config);

// Global Variables
var database = firebase.database(); // Variable to reference the firebase database
var connected;                      // Hold connected to database

// player game object stored data
var playerOne = {
    number: "0",
    name: "",
    wins: 0,
    losses: 0,
    turns: 0,
    choice: null
};

// opponent game object stored data
var playerTwo ={
    number: "0",
    name: "",
    wins: 0,
    losses: 0,
    turns: 0,
    choice: null
};

// Variable for the assigned choices 
var choices = ["rock", "paper", "scissors"];
  
// Functions to Display players choices
var displayChoiceBtns = function() 
{
   
    $("#playerOneChoices").html("<button id='rock'>Rock</button>"+"<br>"+ "<button id='paper'>Paper</button>"+"<br>"+ "<button id='scissors'>Scissors</button>")
    
    $("#playerTwoChoices").html("<button id='rock2'>Rock</button>"+"<br>"+ "<button id='paper2'>Paper</button>"+"<br>"+ "<button id='scissors2'>Scissors</button>")
}

// Call the functions
displayChoiceBtns();
  