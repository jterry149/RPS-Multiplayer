// Initialize Firebase
var config = {
    apiKey: "AIzaSyCOfFPjQyDBs4F3rpyaLoX2W6TzbWa_7qU",
    authDomain: "rps-multiplayer-e7c2f.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-e7c2f.firebaseio.com",
    projectId: "rps-multiplayer-e7c2f",
    storageBucket: "rps-multiplayer-e7c2f.appspot.com",
    messagingSenderId: "800713197043"
};

firebase.initializeApp(config);

//====== Global Variables ========//

// Database variable for the firebase database
var database = firebase.database();
var playerRef = database.ref('players');
var playerOneRef = database.ref('players/playerOne');
var playerOneChoiceRef = database.ref('players/playerOne/choice');
var playerTwoRef = database.ref('players/playerTwo');
var playerTwoChoiceRef = database.ref('players/playerTwo/choice');
var turnRef = database.ref('turn');
var chatRef = database.ref('chat');

// game play varibales
var existingPlayers, currentPlayer;
var playerOneChoice = ''; 
var playerTwoChoice = '';
var playerOneWinName = '';
var playerTwoWinName = '';
var localUser = {id: [], name: ''};
var score1 = 0;
var score2 = 0;
var turn = 1;

//============ FUNCTIONS ================//

// insert the photos for the chosen weapons for RPS
var setWeapon = function () 
{
	var rock = '<img title="Rock" src="assets/images/rock.jpg"/>';
	var paper = '<img title="Paper" src="assets/images/paper.jpg"/>';
	var scissors = '<img title="Scissors" src="assets/images/scissors.jpeg"/>';

    if (localUser.id === 1) 
    {
		$('.rock1').html(rock);
		$('.paper1').html(paper);
		$('.scissors1').html(scissors);
	}
	else {
		$('.rock2').html(rock);
		$('.paper2').html(paper);
		$('.scissors2').html(scissors);
	}
}

// create new players and attach there information into the respective player attributes
var createNewUser = function () 
{
    var newPlayer = $('#newPlayer').val().trim();

    if (newPlayer) 
    {
		if ((existingPlayers === 0) || ((existingPlayers === 1) && (currentPlayer.hasOwnProperty('2')))) {
			playerOneRef.set({
				name: newPlayer,
				win: 0,
				loss: 0
			});

			$('.playerInfo').html('<p>Hi ' + newPlayer + '! You\'re Player One</p>');
			
			localUser.id = 1;
			localUser.name = newPlayer;

			setWeapon();
			playerOneRef.onDisconnect().remove();
		}
        else if((existingPlayers === 1) && (currentPlayer.hasOwnProperty('1'))) 
		{
			playerTwoRef.set({
				name: newPlayer,
				win: 0,
				loss: 0
			});
			$('.playerInfo').html('<p>Hi ' + newPlayer + '! You\'re Player Two</p>');

			localUser.id = 2;
			localUser.name = newPlayer;

			setWeapon();
			playerTwoRef.onDisconnect().remove();
		}
        else if (existingPlayers >= 2) 
        {
			$('.playerInfo').html('<p>Hi ' + newPlayer + '</p>');
			$('.notification').html('There are already two players playing!');
		}
	}
    else 
    {
		return;
	}
}

playerRef.on("value", function(snapshot) 
{
	// start player one turn when player two enters
    if (snapshot.numChildren() === 2) 
    {
		turnRef.set(turn);
	}

	// check if existing player
	existingPlayers = snapshot.numChildren();

	// check player with the firebase database
	currentPlayer = snapshot.val();
});

playerRef.on('child_added', function(snapshot) 
{
	// reset score if a different player joins the game
    if (existingPlayers >= 1) 
    {
		score1 = 0;
		score2 = 0;

		playerOneRef.update({win: 0, loss: 0});
		playerTwoRef.update({win: 0, loss: 0});
	}
});

// remove players information once disconnected from the app.
playerRef.on('child_removed', function(snapshot) 
{
	chatRef.remove();
	turnRef.remove();

	$('.notification').html('');
});

turnRef.on('value', function(snapshot) 
{
	var turns = snapshot.val();

	// display notifications
    if (turns === 1) 
    {

        if (localUser.id === 1) 
        {
			$('.notification').html('It\'s your turn');
		}
        else 
        {
			$('.notification').html('Waiting for player 1');
		}
	}

    if (turns === 2) 
    {
        if (localUser.id === 2) 
        {
			$('.notification').html('It\'s your turn');
		}
		else {
			$('.notification').html('Waiting for player 2');
		}
	}

    if (turns === 3) 
    {
		// show the results and choices of the player
		$('.oneChoice').html('<h1>' + playerOneChoice + '</h1>');
		$('.twoChoice').html('<h1>' + playerTwoChoice + '</h1>');
	}
});

// show player one info when connected
playerOneRef.once('value', function(snapshot) 
{
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	playerOneWinName = name;

	if (name !== null) {
		$('.playerOneName').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('.playerOneStats').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

// show player two info when connected
playerTwoRef.once('value', function(snapshot) 
{
    // variable references to the database
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	playerTwoWinName = name;

    if (name !== null) 
    {
		$('.playerTwoName').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('.playerTwoStats').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

// clear player one reference when disconnected
playerOneRef.on('child_removed', function(snapshot) 
{
	$('.playerOneName').html('Waiting for Player 1');
	$('.playerOneStats').html('');
});

// clear player two reference when disconnected
playerTwoRef.on('child_removed', function(snapshot) 
{
	$('.playerTwoName').html('Waiting for Player 2');
	$('.playerTwoStats').html('');
});

// function to store chosen weapon rock, paper, or scissors from players one and two.
var chosenWeapon = function () 
{
	var chosenWeapon = $(this).data().weapon;

	if (existingPlayers === 2) {
		if ((localUser.id === 1) && (turn === 1)) {
			playerOneChoiceRef.set(chosenWeapon);

			$('.playerOneChoices').hide();
			$('.oneChoice').html('<h1>' + chosenWeapon + '</h1>');
		}
        else if ((localUser.id === 2) && (turn === 2)) 
        {
			playerTwoChoiceRef.set(chosenWeapon);

			$('.playerTwoChoices').hide();
			$('.twoChoice').html('<h1>' + chosenWeapon + '</h1>');
		}
        else 
        {
			return;
		}
	}
    else 
    {
		return;
	}
}

// get player one choice
playerOneChoiceRef.on('value', function(snapshot) 
{
	playerOneChoice = snapshot.val();

    if (playerOneChoice) 
    {
		turn++;
	}

    // call the function to compare choices send player one choice
	compareChoice();
});

// get choice from player two
playerTwoChoiceRef.on('value', function(snapshot) 
{
	playerTwoChoice = snapshot.val();

    if (playerTwoChoice) 
    {
		turn++;
	}
    // call the function to compare choice send player two choice
	compareChoice();
});

// Function to compare choices from players and determine the winner of that match
var compareChoice = function () 
{

    if ((playerOneChoice !== null) && (playerTwoChoice !== null)) 
    {

        if (playerOneChoice === playerTwoChoice) 
        {
			$('.results').html('<h1>It\'s a tie!</h1>');

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
        else if (((playerOneChoice === 'Rock') && (playerTwoChoice === 'Scissors')) || ((playerOneChoice === 'Paper') && (playerTwoChoice === 'Rock')) || ((playerOneChoice === 'Scissors') && (playerTwoChoice === 'Paper'))) 
        {
			// Display results
			$('.results').html('<h1>' + playerOneWinName + ' wins!</h1>');
			
			score1++;

			playerOneRef.update({win: score1});
			playerTwoRef.update({loss: score1});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
        else if (((playerTwoChoice === 'Rock') && (playerOneChoice === 'Scissors')) || ((playerTwoChoice === 'Paper') && (playerOneChoice === 'Rock')) || ((playerTwoChoice === 'Scissors') && (playerOneChoice === 'Paper'))) 
        {
			// Dislay result
			$('.results').html('<h1>' + playerTwoWinName + ' wins!</h1>');

			score2++;

			playerTwoRef.update({win: score2});
			playerOneRef.update({loss: score2});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
	}
}

var newRound = function ()
{
	// remove the data from the firebase
	playerOneChoiceRef.remove();
	playerTwoChoiceRef.remove();

	// clear player choices
	playerOneChoice = '';
	playerTwoChoice = '';
	$('.results').html('');
	
	// reset the turn to start game over
	turn = 1;
	turnRef.set(turn);

	// show the players options again for both players
    if (localUser.id === 1) 
    {
		$('.playerOneChoices').show();
	}
	else {
		$('.playerTwoChoices').show();
	}

	// clear the weapons for each player
	$('.oneChoice').html('');
	$('.twoChoice').html('');
}

// A function to send chats back and forth between players
var sendMessage = function()
{
	var text = $('.messageBox').val().trim();
	var message = localUser.name + ': ' + text;

    if (localUser.id === 1) 
    {
		chatRef.push(message);
	}
	
    if (localUser.id === 2) 
    {
		chatRef.push(message);
	}

	$('.messageBox').val('');
}

// show message from the firbase database
chatRef.on('child_added', function(snapshot) 
{
	var currentMessage = snapshot.val();
	
	$('.chatArea').html('<p>' + currentMessage + '</p>');
});

// clear the chat after the players disconnected
chatRef.on('child_removed', function() 
{
	$('.chatArea').html('');
});

// Operations for the game play to start the buttons and call the respective methods
$('.weapon').on('click', chosenWeapon);
$('#startButton').on('click', createNewUser);
$('#chatButton').on('click', sendMessage);