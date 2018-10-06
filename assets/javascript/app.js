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
//================================================ GLOBAL VARS ================================================

var database = firebase.database();
var playerRef = database.ref('players');
var playerOneRef = database.ref('players/playerOne');
var playerOneChoiceRef = database.ref('players/playerOne/choice');
var playerTwoRef = database.ref('players/playerTwo');
var playerTwoChoiceRef = database.ref('players/playerTwo/choice');
var turnRef = database.ref('turn');
var chatRef = database.ref('chat');

var existingPlayers, currentPlayer;
var playerOneChoice = ''; 
var playerTwoChoice = '';
var playerOneWinName = '';
var playerTwoWinName = '';
var localUser = {id: [], name: ''};
var score1 = 0;
var score2 = 0;
var turn = 1;

//================================================ FUNCTIONS ================================================

/*insert photos for RPS*/
function setRPS() {
	var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
	var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
	var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';

    if (localUser.id === 1) 
    {
		$('.rock1').html(rockPNG);
		$('.paper1').html(paperPNG);
		$('.scissors1').html(scissorsPNG);
	}
	else {
		$('.rock2').html(rockPNG);
		$('.paper2').html(paperPNG);
		$('.scissors2').html(scissorsPNG);
	}
}

// create new players and attach there information into the respective player attributes
function createNewUser() {
    var newPlayer = $('#newPlayer').val().trim();

	if (newPlayer) {
		if ((existingPlayers === 0) || ((existingPlayers === 1) && (currentPlayer.hasOwnProperty('2')))) {
			playerOneRef.set({
				name: newPlayer,
				win: 0,
				loss: 0
			});

			$('.playerInfo').html('<p>Hi ' + newPlayer + '! You\'re Player One</p>');
			
			localUser.id = 1;
			localUser.name = newUser;

			setRPS();
			playerOneRef.onDisconnect().remove();
		}
		else if ((existingPlayers === 1) && (currentPlayer.hasOwnProperty('1'))) {
			playerTwoRef.set({
				name: newPlayer,
				win: 0,
				loss: 0
			});
			$('.playerInfo').html('<p>Hi ' + newPlayer + '! You\'re Player Two</p>');

			localUser.id = 2;
			localUser.name = newPlayer;

			setRPS();
			playerTwoRef.onDisconnect().remove();
		}
		else if (existingPlayers >= 2) {
			$('.playerInfo').html('<p>Hi ' + newPlayer + '</p>');
			$('.notification').html('There are already two players playing!');
		}
	}
	else {
		return;
	}
}

playerRef.on("value", function(snapshot) {
	/*start 1st turn when 2 users in*/
	if (snapshot.numChildren() === 2) {
		turnRef.set(turn);
	}

	/*check no of existing users*/
	existingPlayers = snapshot.numChildren();

	/*check current user id on firebase*/
	currentPlayer = snapshot.val();
});

playerRef.on('child_added', function(snapshot) {
	/*reset score if 3rd user joins*/
	if (existingPlayers >= 1) {
		score1 = 0;
		score2 = 0;

		playerOneRef.update({win: 0, loss: 0});
		playerTwoRef.update({win: 0, loss: 0});
	}
});

/*remove player's info if disconnected*/
playerRef.on('child_removed', function(snapshot) {
	chatRef.remove();
	turnRef.remove();

	$('.box').css('border-color', '#cccccc');
	$('.notification').html('');
});

turnRef.on('value', function(snapshot) {
	var t = snapshot.val();

	/*switch colours of user boxes*/
	if (t === 1) {
		$('#playerOne').css('border-color', 'red');
		$('#playerTwo').css('border-color', '#cccccc');

		if (localUser.id === 1) {
			$('.notification').html('It\'s your turn');
		}
		else {
			$('.notification').html('Waiting for player 1');
		}
	}

	if (t === 2) {
		$('#playerTwo').css('border-color', 'red');
		$('#playerOne').css('border-color', '#cccccc');

		if (localUser.id === 2) {
			$('.notification').html('It\'s your turn');
		}
		else {
			$('.notification').html('Waiting for player 2');
		}
	}

	if (t === 3) {
		/*show results and choices*/
		$('#oneChoice').html('<h1>' + playerOneChoice + '</h1>');
		$('#twoChoice').html('<h1>' + playerTwoChoice + '</h1>');
	}
});

/*print user 1 info when joined*/
playerOneRef.on('value', function(snapshot) {
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	playerOneWinName = name;

	if (name !== null) {
		$('#playerOneName').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('#playerOneStats').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

/*print user 2 info when joined*/
playerTwoRef.on('value', function(snapshot) {
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	playerTwoWinName = name;

	if (name !== null) {
		$('#playerTwoName').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('#playerTwoStats').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

/*clear user 1 info when left*/
playerOneRef.on('child_removed', function(snapshot) {
	$('#playerOneName').html('Waiting for Player 1');
	$('#playerOneStats').html('');
});

/*clear user 2 info when left*/
playerTwoRef.on('child_removed', function(snapshot) {
	$('#playerTwoName').html('Waiting for Player 2');
	$('#playerTwoStats').html('');
});

function chosenWeapon() {
	var chosenWeapon = $(this).data().weapon;

	if (existingPlayers === 2) {
		if ((localUser.id === 1) && (turn === 1)) {
			playerOneChoiceRef.set(chosenWeapon);

			$('#playerOneChoices').hide();
			$('#oneChoice').html('<h1>' + chosenWeapon + '</h1>');
		}
		else if ((localUser.id === 2) && (turn === 2)) {
			playerTwoChoiceRef.set(chosenWeapon);

			$('#playerTwoChoices').hide();
			$('#twoChoice').html('<h1>' + chosenWeapon + '</h1>');
		}
		else {
			return;
		}
	}
	else {
		return;
	}
}

/*get choice from user 1*/
playerOneChoiceRef.on('value', function(snapshot) {
	playerOneChoice = snapshot.val();

	if (playerOneChoice) {
		turn++;
	}

	compareChoice();
});

/*get choice from user 2*/
playerTwoChoiceRef.on('value', function(snapshot) {
	playerTwoChoice = snapshot.val();

	if (playerTwoChoice) {
		turn++;
	}

	compareChoice();
});

function compareChoice() {

	if ((playerOneChoice !== null) && (playerTwoChoice !== null)) {

		if (playerOneChoice === playerTwoChoice) {
			$('#results').html('<h1>It\'s a tie!</h1>');

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((playerOneChoice === 'Rock') && (playerTwoChoice === 'Scissors')) || ((playerOneChoice === 'Paper') && (playerTwoChoice === 'Rock')) || ((playerOneChoice === 'Scissors') && (playerTwoChoice === 'Paper'))) {
			$('#results').html('<h1>' + playerOneWinName + ' wins!</h1>');
			
			score1++;

			playerOneRef.update({win: score1});
			playerTwoRef.update({loss: score1});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((playerTwoChoice === 'Rock') && (playerOneChoice === 'Scissors')) || ((playerTwoChoice === 'Paper') && (playerOneChoice === 'Rock')) || ((playerTwoChoice === 'Scissors') && (playerOneChoice === 'Paper'))) {
			$('#results').html('<h1>' + playerTwoWinName + ' wins!</h1>');

			score2++;

			playerTwoRef.update({win: score2});
			playerOneRef.update({loss: score2});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
	}
}

function newRound() {
	/*remove data on firsebase*/
	playerOneChoiceRef.remove();
	playerTwoChoiceRef.remove();

	/*clear choices*/
	playerOneChoice = '';
	playerTwoChoice = '';
	$('#results').html('');
	
	/*reset turn and push to firebase*/
	turn = 1;
	turnRef.set(turn);

	/*show the right user RPS options again*/
	if (localUser.id === 1) {
		$('#playerOneChoices').show();
	}
	else {
		$('#playerTwoChoices').show();
	}

	/*clear shown chosen tools*/
	$('#oneChoice').html('');
	$('#twoChoice').html('');
}

/*send message*/
function sendMessage() {
	var text = $('#messageBox').val();
	var message = localUser.name + ': ' + text;

	if (localUser.id === 1) {
		chatRef.push('<span class="green">' + message + '</span>');
	}
	
	if (localUser.id === 2) {
		chatRef.push('<span class="blue">' + message + '</span>');
	}

	$('#messageBox').val('');
}

/*print message from firebase*/
chatRef.on('child_added', function(snapshot) {
	var currentMessage = snapshot.val();
	
	$('#chatArea').append('<p>' + currentMessage + '</p>');
});

/*clear chat on firebase if disconnected*/
chatRef.on('child_removed', function() {
	$('#chatArea').html('');
});

//================================================ OPERATIONS ================================================

$('.weapon').on('click', chosenWeapon);
$('#startButton').on('click', createNewUser);
$('#chatButton').on('click', sendMessage);