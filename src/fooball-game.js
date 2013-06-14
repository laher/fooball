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
	FOOBALL.game.ball = Object.create(FOOBALL.entities.Ball.prototype);
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
			team.players[playernum]= Object.create(FOOBALL.entities.Player.prototype);
			team.players[playernum].base = { xindex : j, xcount : row.yoffs.length, yoffs : row.yoffs[j] };

			team.players[playernum].human = team.human;
			team.players[playernum].active = playernum == team.activePlayer;
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

/*
		if (human && i == team.currentPlayer) {
			var posXy= currentPlayer.posVector.getXy();
			if (Object.keys(FOOBALL.game.keysDown).length>0) {
				//moving. Undraw before moving
				//undraw current player - TODO should be 'clear'
				currentPlayer.clear(FOOBALL.mainview);
				currentPlayer.clear(FOOBALL.radarview);
				var angleCalced=false;
				if (FOOBALL.keyCodes.UP in FOOBALL.game.keysDown) { // Player holding up
					posXy[1] -= currentPlayer.speedVector.magnitude * modifier;
					currentPlayer.speedVector.angle = 270;
					if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
						currentPlayer.speedVector.angle -= 45;
					} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
						currentPlayer.speedVector.angle += 45;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.DOWN in FOOBALL.game.keysDown) { // Player holding down
					posXy[1] += currentPlayer.speedVector.magnitude * modifier;
					currentPlayer.speedVector.angle = 90;
					if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
						currentPlayer.speedVector.angle += 45;
					} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
						currentPlayer.speedVector.angle -= 45;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) { // Player holding left
					posXy[0] -= currentPlayer.speedVector.magnitude * modifier;
					if(!angleCalced) {
						currentPlayer.speedVector.angle = 180;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) { // Player holding right
					posXy[0] += currentPlayer.speedVector.magnitude * modifier;
					if(!angleCalced) {
						currentPlayer.speedVector.angle = 0;
					}
					angleCalced=true;
				}
				//currentPlayer.posVector.setXy(posXy);
				//TODO gradual
				currentPlayer.speedVector.magnitude=1;
			} else {

				//TODO gradual
				currentPlayer.speedVector.magnitude=0;
			}
		} else if (i == team.currentPlayer) {
			var angToBall = FOOBALL.physics2d.angle(currentPlayer.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
			var disToBall = FOOBALL.physics2d.distance(currentPlayer.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
			if(disToBall > 0.001) {
				currentPlayer.clear(FOOBALL.mainview);
				currentPlayer.clear(FOOBALL.radarview);
				currentPlayer.speedVector.magnitude= 0.1;
				currentPlayer.speedVector.angle = angToBall;
			} else {
				currentPlayer.speedVector.magnitude= 0;
			}

		} else {
			var angToBase = FOOBALL.physics2d.angle(currentPlayer.posVector.getXy(), currentPlayer.basePoint);
			var disToBase = FOOBALL.physics2d.distance(currentPlayer.posVector.getXy(), currentPlayer.basePoint);
			if(disToBase > 0.05) {
				currentPlayer.clear(FOOBALL.mainview);
				currentPlayer.clear(FOOBALL.radarview);
				currentPlayer.speedVector.magnitude= 0.1;
				currentPlayer.speedVector.angle = angToBase;
			} else {
				currentPlayer.speedVector.magnitude= 0;
			}
		}

		var spv = currentPlayer.speedVector;
		currentPlayer.posVector.add( FOOBALL.physics2d.mul(spv, modifier) );
		// collision detection
		var dist= FOOBALL.physics2d.distance(currentPlayer.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
		if(dist < 0.02) {
			//FOOBALL.console.log("HIT "+dist+" "+FOOBALL.game.ball.speedVector.angle);
			FOOBALL.game.ball.speedVector.become(currentPlayer.speedVector);
		}


	}
};
/*
FOOBALL.game.updateBall = function(modifier) {

	//update ball
	if(FOOBALL.game.ball.speedVector.magnitude > 0) {
		//unblit
		FOOBALL.game.ball.clear(FOOBALL.mainview);
		FOOBALL.game.ball.clear(FOOBALL.radarview);
		var bposXy = FOOBALL.game.ball.posVector.getXy();
		var spv = FOOBALL.game.ball.speedVector;
		//update
		FOOBALL.game.ball.posVector.add( FOOBALL.physics2d.mul(spv, modifier) );
		//account for friction and collisions with rocks
		if(!FOOBALL.game.ball.posVector.inside([0,0],[1,1])) {
			//TODO only if pointing away from midpoint
			var angle = FOOBALL.physics2d.angle(bposXy,[0.5,0.5])
				       - FOOBALL.game.ball.speedVector.angle;
			if(angle > 90 || angle < -90) {
				FOOBALL.game.ball.speedVector.bounce();
			}

		} else {
			FOOBALL.game.ball.speedVector.mul(FOOBALL.behaviourTypes.ball.friction);
		}

	}

	//TODO update AI players


};
*/
/*
update = function(modifier) {
	// Update game objects

	//update current player
	var currentPlayer = FOOBALL.game.team1.players[FOOBALL.game.team1.currentPlayer];
	if (currentPlayer != null) {
		var posXy= currentPlayer.posVector.getXy();
		if (FOOBALL.game.keysDown) {
			//moving. Undraw before moving
			//undraw current player - TODO should be 'clear'
			currentPlayer.clear(FOOBALL.mainview);
			currentPlayer.clear(FOOBALL.radarview);
			//var xym= FOOBALL.mainview.transformPoint(posXy);
			//FOOBALL.draw.drawDisc(FOOBALL.mainview.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color);
			//var xyr= FOOBALL.radarview.transformPoint(posXy);
			//FOOBALL.draw.drawDisc(FOOBALL.radarview.context, [xyr[0]-0.1, xyr[1]-0.1], 0.7, FOOBALL.bg.color);
			//FOOBALL.radarview.context.strokeStyle = 'white';
		//currentPlayer.angle = 0;
			var angleCalced=false;
			if (FOOBALL.keyCodes.UP in FOOBALL.game.keysDown) { // Player holding up
				posXy[1] -= currentPlayer.speedVector.magnitude * modifier;
				currentPlayer.speedVector.angle = 270;
				if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
					currentPlayer.speedVector.angle -= 45;
				} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
					currentPlayer.speedVector.angle += 45;
				}
				angleCalced=true;
			}
			if (FOOBALL.keyCodes.DOWN in FOOBALL.game.keysDown) { // Player holding down
				posXy[1] += currentPlayer.speedVector.magnitude * modifier;
				currentPlayer.angle = 0;
				currentPlayer.speedVector.angle = 90;
				if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
					currentPlayer.speedVector.angle += 45;
				} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
					currentPlayer.speedVector.angle -= 45;
				}
				angleCalced=true;
			}
			if (FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) { // Player holding left
				posXy[0] -= currentPlayer.speedVector.magnitude * modifier;
				if(!angleCalced) {
					currentPlayer.speedVector.angle = 180;
				}
				angleCalced=true;
			}
			if (FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) { // Player holding right
				posXy[0] += currentPlayer.speedVector.magnitude * modifier;
				if(!angleCalced) {
					currentPlayer.speedVector.angle = 0;
				}
				angleCalced=true;
			}
			currentPlayer.posVector.setXy(posXy);
			currentPlayer.speedVector.magnitude=1;
		} else {
			currentPlayer.speedVector.magnitude=0;
		}
	}

	//update ball
	if(FOOBALL.game.ball.speedVector.magnitude > 0) {
		//unblit
		FOOBALL.game.ball.clear(FOOBALL.mainview);
		FOOBALL.game.ball.clear(FOOBALL.radarview);
		var bposXy = FOOBALL.game.ball.posVector.getXy();
		var spv = FOOBALL.game.ball.speedVector;
		//update
		FOOBALL.game.ball.posVector.add( FOOBALL.physics2d.mul(spv, modifier) );
		//account for friction and collisions with rocks
		if(!FOOBALL.game.ball.posVector.inside([0,0],[1,1])) {
			//TODO only if pointing away from midpoint
			var angle = FOOBALL.physics2d.angle(bposXy,[0.5,0.5])
				       - FOOBALL.game.ball.speedVector.angle;
			if(angle > 90 || angle < -90) {
				FOOBALL.game.ball.speedVector.bounce();
			}

		} else {
			FOOBALL.game.ball.speedVector.mul(FOOBALL.behaviourTypes.ball.friction);
		}

	}

	//TODO update AI players


	//TODO collision detection
	var dist= FOOBALL.physics2d.distance(currentPlayer.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
	if(dist < 0.03) {
		FOOBALL.console.log("HIT "+dist+" "+FOOBALL.game.ball.speedVector.angle);
		FOOBALL.game.ball.speedVector.become(currentPlayer.speedVector);
	}

};


*/
