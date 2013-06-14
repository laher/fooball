var FOOBALL = FOOBALL || {};

FOOBALL.game = {
		paused : true,
		ball : {
			posVector : null, // xy : [0.5,0.5]
			speedVector : null,
			dynamics : null
		},
		team1 : {
			name : 'Red Rackams',
			color : '#990000',
			controls : {}, //TODO
			players : [],
			human : true,
			activePlayer : 10
		},
		team2 : {
			name : 'Blue Meanies',
			color : '#000099',
			controls : {}, //TODO
			players : [],
			human : false,
			activePlayer : 10
		},
		timer : { },
		score : [0,0],
		keysDown : {}
};
FOOBALL.game.init = function () {
	FOOBALL.game.initBall();
	FOOBALL.game.initTeam(FOOBALL.game.team1, true);
	FOOBALL.game.initTeam(FOOBALL.game.team2, false);
};

FOOBALL.game.initBall = function () {
	FOOBALL.game.ball = Object.create(FOOBALL.entities.Ball);
	FOOBALL.game.ball.posVector = FOOBALL.physics2d.newVector(45, 0.705);
	FOOBALL.game.ball.speedVector = FOOBALL.physics2d.newVector(0, 0);
};

FOOBALL.game.initTeam = function(team, isUp) {
	team.players = [];
	var formation = FOOBALL.formations.FourFourTwo;
	var playernum=0;
	for(var i=0; i<formation.length; i++) {
		var row= formation[i];
		//console.log(row);
		for(var j=0; j<row.yoffs.length; j++) {
			team.players[playernum]= Object.create(FOOBALL.entities.Player);
			team.players[playernum].base = { xindex : j, xcount : row.yoffs.length, yoffs : row.yoffs[j] };

			team.players[playernum].human = team.human;
			team.players[playernum].active = playernum === team.activePlayer;
			var xys = FOOBALL.draw.calcStartpoint(isUp, row.yoffs[j], j, row.yoffs.length);
			team.players[playernum].startPoint= xys;
			var xyb = FOOBALL.draw.calcBasepoint(isUp, row.yoffs[j], j, row.yoffs.length);
			team.players[playernum].basePoint= xyb;
			team.players[playernum].mainColor = team.color;
			team.players[playernum].positionName = row.pos;
			team.players[playernum].posVector= FOOBALL.physics2d.newVector(0,0);
			team.players[playernum].posVector.setXy(xys);
			team.players[playernum].speedVector= FOOBALL.physics2d.newVector(0,0);
			playernum++;
		}
	}
};


FOOBALL.game.update = function(modifier) {
	// Update game objects

	//update current player
	FOOBALL.game.updateTeam(FOOBALL.game.team1, modifier, true);
	FOOBALL.game.updateTeam(FOOBALL.game.team2, modifier, false);
	//var bposXy = FOOBALL.game.updateBall(modifier);
	if (FOOBALL.game.ball.move(modifier)) {
		FOOBALL.game.ball.clear(FOOBALL.mainview);
		FOOBALL.game.ball.clear(FOOBALL.radarview);
	}
};

FOOBALL.game.updateTeam = function(team, modifier, human) {
	for(var i=0; i<team.players.length;i++) {
		var currentPlayer = team.players[i];
		var moved = currentPlayer.move(modifier);
		if(moved) {
			currentPlayer.clear(FOOBALL.mainview);
			currentPlayer.clear(FOOBALL.radarview);
		}
	}
};

