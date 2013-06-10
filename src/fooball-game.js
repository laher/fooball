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
			currentPlayer : 10
		},
		team2 : {
			name : 'Blue Meanies',
			color : '#000099',
			controls : {}, //TODO
			players : [],
			currentPlayer : -1
		},
		timer : { },
		score : [0,0],
		keysDown : {}
};

FOOBALL.game.init = function () {
	FOOBALL.game.ball.init();
	FOOBALL.game.initTeam(FOOBALL.game.team1, true);
	FOOBALL.game.initTeam(FOOBALL.game.team2, false);
};

FOOBALL.game.ball.init = function () {
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
			//console.log(row.yoffs[j]);
			var xy = FOOBALL.draw.calcStartpoint(isUp, row.yoffs[j], j, row.yoffs.length);
			team.players[playernum]= {
				base : { xindex : j, xcount : row.yoffs.length, yoffs : row.yoffs[j] },
				posVector : FOOBALL.physics2d.newVector(xy[0],xy[1]),
				speedVector : FOOBALL.physics2d.newVector(0,0),
				positionName : row.pos
			//	xy : [0,0],
				//speed : 1

			};
			//FOOBALL.console.log(xy);
			team.players[playernum].posVector.setXy(xy);
			//console.log(team.players[playernum]);
			playernum++;
		}
	}
};


