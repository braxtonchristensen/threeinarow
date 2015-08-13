var ticTacToe = angular.module('ticTacToe', ['firebase']);

ticTacToe

	.controller('TicTacToeController', function ($scope, $firebase) {

		$scope.remoteGameContainer = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remoteGameContainer"));
		$scope.remoteTurn = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remoteTurn"));
		$scope.remotePastGamesContainer = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remotePastGamesContainer"));
		$scope.remoteGameOver = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remoteGameOver"));
		$scope.remotePlayers = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remotePlayers"));
		$scope.remotePlayer1Name = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remotePlayer1Name"));
		$scope.remotePlayer2Name = $firebase(new Firebase("https://braxton-tic-tac-toe.firebaseio.com/remotePlayer2Name"));

		// -------- View Different Screens -------- //

		$scope.welcomeView = true;
		$scope.gameView = false;
		$scope.pastView = false;
		$scope.infoBoxView = false;

		$scope.triggerInfoBox = function(){
			$scope.infoBoxView = true;
		};


		// -------- Game Container Data -------- //

		//Contains data on the board and data on the players.

		$scope.board = { 
			boxes: [
				{id: 0, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 1, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 2, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 3, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 4, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 5, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 6, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 7, player:2, clicked:false, colorMe: false, symbol: ""},
				{id: 8, player:2, clicked:false, colorMe: false, symbol: ""}
			],
			winner: ""
		};

		$scope.gameContainer = {

			board: $scope.board,
			players: $scope.players

		};

		// -------- Storing Past Games -------- //

		$scope.pastGamesContainer = {
				pastGames: []
			};


		// -------- Turns and Other  -------- //

		$scope.turn = 0; //will change every turn

		$scope.gameOver = false;

		$scope.tie = false;

		$scope.totalGames = 0;



		// In order to start the game over with a clean board and player data, 
		// we make a copy of the first dataset.

		$scope.newBoard = angular.copy($scope.gameContainer);


		// -------- Enter the game -------- //

		$scope.gameEnter = function(){

			$scope.player1Name = "Player 1";
			$scope.player2Name = "Player 2";

			$scope.players = [
				{ name: $scope.player1Name, symbol: "X", row0: 0, row1: 0, row2: 0, column0: 0, column1: 0, column2: 0, diagonal0: 0, diagonal1: 0},
				{ name: $scope.player2Name, symbol: "O", row0: 0, row1: 0, row2: 0, column0: 0, column1: 0, column2: 0, diagonal0: 0, diagonal1: 0}
			];

			$scope.currentPlayer = $scope.players[0];
			
			$scope.welcomeView = false;
			$scope.gameView = true;
			$scope.gameOver = false;
			$scope.newPlayers = angular.copy($scope.players);
			$scope.turn = 0;
			$scope.pastGamesContainer = {
				pastGames: []
			};
		};

		// Watch player names and update if changed

		$scope.$watch( 'player1Name', function(){
			if ($scope.gameView && ($scope.totalGames % 2 === 0)) {
				$scope.players[0].name = $scope.player1Name;
			}
			else if ($scope.gameView && ($scope.totalGames % 2 === 1)){
				$scope.players[1].name = $scope.player1Name;
			}
		} );

		$scope.$watch( 'player2Name', function(){
			if ($scope.gameView && ($scope.totalGames % 2 === 0)) {
				$scope.players[1].name = $scope.player2Name;
			}
			else if ($scope.gameView && ($scope.totalGames % 2 === 1)){
				$scope.players[0].name = $scope.player2Name;
			}
		} );


		// -------- Game Logic ---------- //

		//Executes upon clicking any box in Tic Tac Toe board

		$scope.box = function(cellIndex){
				var cellId = cellIndex.id;
				var playTurn = $scope.turn %2 ;
				var playerName = $scope.players[playTurn].name;
				var player = $scope.players[playTurn];
				$scope.currentPlayer = $scope.players[($scope.turn + 1) %2];
				var playerString = "players[" + playTurn + "]";
				eval("$scope."+ playerString +".row"+(Math.floor(cellId / 3))+"++");
				eval("$scope."+playerString+".column"+(cellId % 3)+"++");

				if (cellId % (4) === 0){
					eval("$scope."+playerString+".diagonal0++");
				}
				if (cellId % (2) === 0 && cellId > 0 && cellId < 8){
					eval("$scope."+playerString+".diagonal1++");
				}
				cellIndex.clicked = true;
				cellIndex.player = playTurn;
				cellIndex.symbol = player.symbol;

				for (props in $scope.players[playTurn]){
						if($scope.players[playTurn][props] == 3){
							$scope.winFunc(props, player); //Call the win function, which is created below
						}
				}

				if($scope.turn === 8 && $scope.gameOver === false){
						$scope.tieFunc();
				}

				$scope.turn++;
		};


		// -------- Win Function -------- //

		//This function will run every time a player wins.

		$scope.winFunc = function(props, player){
			$scope.currentPlayer = player;
			$scope.gameOver = true;
			$scope.winningPlay = props;
			$scope.colorCombo(props, player.symbol);
			$scope.gameContainer.board.winner = player.name; //set a property for player winner to be viewed in stats
			$scope.pastGamesContainer.pastGames.push($scope.gameContainer); //store past games
			$scope.totalGames+=1; //add one to total games
		};

		// -------- Tie Function -------- //

		$scope.tieFunc = function(){
			$scope.gameOver = true;
			$scope.gameContainer.board.winner = "Nobody Wins";
			$scope.pastGamesContainer.pastGames.push($scope.gameContainer); //store past games
			$scope.tie = true;
			$scope.totalGames+=1; //add one to total games
			if ($scope.player1Name === 'Pentagon' && $scope.tie === true) {
				alert('nuked');
				console.log('wargames');
			}
		};

		// -------- Start New Game -------- //

		$scope.startOver = function(){
			$scope.players = $scope.newPlayers.reverse();
			if ($scope.totalGames%2 === 0){
				$scope.players[0].name = $scope.player1Name;
				$scope.players[1].name = $scope.player2Name;
			}
			if ($scope.totalGames%2 === 1){
				$scope.players[0].name = $scope.player2Name;
				$scope.players[1].name = $scope.player1Name;
			}
			$scope.players.reverse;
			$scope.gameContainer = $scope.newBoard;
			$scope.gameOver = false;
			$scope.newPlayers = angular.copy($scope.players);
			$scope.newBoard = angular.copy($scope.gameContainer);
			$scope.turn = 0;
			$scope.tie = false;
			$scope.pastView = false;
			$scope.gameView = true;
			$scope.currentPlayer = $scope.players[0];
		};

		// -------- View Past Games -------- //

		$scope.viewPastGames = function(){
			$scope.gameView = false;
			$scope.pastView = true;
		};

		// -------- Color the Winning Combinations -------- //

		//Create an array of possible winning combos, which wll be checked against
		//the winning combo identified in the box function's win logic

		$scope.combos = {
			row0: [0,1,2],
			row1: [3,4,5],
			row2: [6,7,8],
			column0: [0,3,6],
			column1: [1,4,7],
			column2: [2,5,8],
			diagonal0: [0,4,8],
			diagonal1: [2,4,6]
		};


		//Create a for loop that sets a property (colorMe) in winning combo boxes.
		//When true, these boxes will get the class winColor, which will color the letters.

		$scope.colorCombo = function(prop, symbol){
			for (c in $scope.combos) {
				if ($scope.winningPlay === c) {
					$scope.winCombo = $scope.combos[c];
					for (d in $scope.winCombo) {
						$scope.gameContainer.board.boxes[$scope.winCombo[d]].colorMe = symbol;
					}
				}
			}
		};

		$scope.remoteGameContainer.$bind($scope, "gameContainer");
		$scope.remoteTurn.$bind($scope, "turn");
		$scope.remotePastGamesContainer.$bind($scope, "pastGamesContainer");
		$scope.remoteGameOver.$bind($scope, "gameOver");
		$scope.remotePlayers.$bind($scope, "players");
		$scope.remotePlayer1Name.$bind($scope, "player1Name");
		$scope.remotePlayer2Name.$bind($scope, "player2Name");

		// $scope.$watch("gameContainer", function() {
		// 	console.log("Model changed!")
		// });
		// $scope.$watch("players", function() {
		// 	console.log("Model changed!")
		// });

});
