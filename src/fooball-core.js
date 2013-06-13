/*jslint browser: true */

var FOOBALL = {
	bg : { color : '#559944' },
	lines : { color : 'white' },

	keyCodes : { 'LEFT' : 37, 'UP' : 38, 'RIGHT': 39, 'DOWN': 40 },
        formations : {
		FourFourTwo : [
			{ pos : 'gk', yoffs : [0.05] },
			{ pos : 'df', yoffs : [0.3,0.2,0.2,0.3] },
			{ pos : 'mf', yoffs : [0.6,0.45,0.45,0.6] },
			{ pos : 'st', yoffs : [0.7,0.78] }
		]
	},
	newView : function (elementid, scale, xoff, yoff) {
		return {
			elementid : elementid,
			scale : scale,
			xoff : xoff,
			yoff : yoff,
			reset : function() {
				this.context.setTransform(this.scale,0,0,this.scale,0,0);
				this.context.strokeStyle= FOOBALL.lines.color;
				this.context.fillStyle= FOOBALL.bg.color;
			},
			transformPoint : function(xy) {
				return [
				this.xoff + (xy[0] * FOOBALL.measurements.pitch.width),
				this.yoff + (xy[1] * FOOBALL.measurements.pitch.length)
				];
			}
		};
	},
	mainview : null,
	radarview : null,
	behaviourTypes : {
		ball : {
			mass : 3,
			maxAcceleration : 0,
			maxSpeed : 1.1,
			//friction : 0.0006
			friction : 0.9
		},
		human : {
			mass : 12,
			maxSpeed : 0.4,
			friction : 0.0014
		},
		aiEasy : {
			mass : 10,
			maxSpeed : 0.15,
			friction : 0.0008
		},
		aiMedium : {
			mass : 10,
			maxSpeed : 0.18,
			friction : 0.0008
		},
		aiHard : {
			mass : 10,
			maxSpeed : 0.25,
			friction : 0.0008
		},
		aiInsane : {
			mass : 10,
			maxSpeed : 0.4,
			friction : 0.0008
		}
	},
	console : {
		log : function(arg) {
			var br = document.createElement('br');
			var tn = document.createTextNode(arg);
			//lm.appendChild(tn + '\n');
			var not = document.getElementById('notifications');
			not.insertBefore(br, not.firstChild);
			not.insertBefore(tn, not.firstChild);
		}
	}

};

FOOBALL.measurements = {
	pitch : {
		width : 68,
		length : 105
	},
	goal : {
		width: 7.3,
		height : 2,
	},
	sixyard : {
		width : 18.3,
		length : 5.5
	},
	area : {
		width : 40.3,
		length : 16.5
	},
	circle : {
		radius : 9.15
	},
	penalty : {
		length : 11
	},
	penarc	: {
		radius : 9.15
	}
};

FOOBALL.init = function(isocanvas, radarcanvas) {
//set up contexts
	FOOBALL.mainview= this.newView('isopitch', 7, 77, -30);
	FOOBALL.mainview.context = isocanvas.getContext('2d');
	FOOBALL.mainview.context.lineWidth = 0.5;
	FOOBALL.mainview.reset();
	FOOBALL.draw.isofy(FOOBALL.mainview.context);

	FOOBALL.radarview= this.newView('radarpitch', 1.5, 5, 5);
	FOOBALL.radarview.context = radarcanvas.getContext('2d');
	FOOBALL.radarview.context.lineWidth = 0.3;
	FOOBALL.radarview.reset();

//set up event listeners
	document.addEventListener("keydown", function (e) {
			FOOBALL.game.keysDown[e.keyCode] = true;
	}, false);

	document.addEventListener("keyup", function (e) {
			delete FOOBALL.game.keysDown[e.keyCode];
	}, false);

//set up game entities
	FOOBALL.game.init();
};
FOOBALL.main = function () {
	var now = Date.now();
	var delta = now - FOOBALL.then;

	FOOBALL.update(delta / 1000);
	FOOBALL.draw.drawAll();

	FOOBALL.then = now;
};


FOOBALL.update = function(modifier) {
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
		var bposXy = FOOBALL.game.ball.posVector.getXy();
		var bxym= FOOBALL.mainview.transformPoint(bposXy);
		FOOBALL.draw.drawDisc(FOOBALL.mainview.context, [bxym[0]-0.2, bxym[1]-0.2], 0.9, FOOBALL.bg.color);
		var bxyr= FOOBALL.radarview.transformPoint(bposXy);
		FOOBALL.draw.drawDisc(FOOBALL.radarview.context, [bxyr[0]-0.1, bxyr[1]-0.1], 0.7, FOOBALL.bg.color);
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
	if(dist < 0.02) {
		FOOBALL.console.log("HIT "+dist+" "+FOOBALL.game.ball.speedVector.angle);
		FOOBALL.game.ball.speedVector.copy(currentPlayer.speedVector);
	}

};



