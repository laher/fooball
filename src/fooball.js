/*jslint browser: true */

var FOOBALL = {
	bg : { color : '#559944' },
	lines : { color : 'white' },
	game : {
		paused : true,
		ball : {
			pos : null, // xy : [0.5,0.5]
			speed : null,
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
	},

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
			yoff : -50,
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
	mainview : null 
	/*
		{
		elementid : 'isopitch',
		scale : 10,
		xoff : 48,
		yoff : -50,
		reset : function() {
			this.context.setTransform(this.scale,0,0,this.scale,0,0);
			this.context.strokeStyle='#FFFFFF';
			this.context.fillStyle='#FFFFFF';
		},
		transformPoint : function(xy) {
			return [	
			this.xoff + (xy[0] * FOOBALL.measurements.pitch.width),
			this.yoff + (xy[1] * FOOBALL.measurements.pitch.length)
			];
		}
	}*/
	,
	radarview : null 
	/*{
		elementid : 'radar',
		scale : 1.5,
		xoff : 5,
		yoff : 5,
		reset: function() {
			this.context.setTransform(this.scale,0,0,this.scale,0,0);
			this.context.strokeStyle='#FFFFFF';
			this.context.fillStyle='#FFFFFF';
		}
	}*/,
	behaviourTypes : {
		ball : {
			mass : 3,
			max_acceleration : 0,
			max_speed : 1.1,
			friction : 0.0006
		},
		human : {
			mass : 12,
			max_speed : 0.4,
			friction : 0.0014
		},
		ai_easy : {
			mass : 10,
			max_speed : 0.15,
			friction : 0.0008
		},
		ai_medium : {
			mass : 10,
			max_speed : 0.18,
			friction : 0.0008
		},
		ai_hard : {
			mass : 10,
			max_speed : 0.25,
			friction : 0.0008
		},
		ai_insane : {
			mass : 10,
			max_speed : 0.4,
			friction : 0.0008
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
	FOOBALL.mainview= this.newView('isopitch', 10, 48, -50);
	FOOBALL.mainview.context = isocanvas.getContext('2d');
	FOOBALL.mainview.context.lineWidth = 0.5;
	FOOBALL.mainview.reset();
	FOOBALL.draw.isofy(FOOBALL.mainview.context);

	FOOBALL.radarview= this.newView('isopitch', 1.5, 5, 5);
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

FOOBALL.game.init = function () {
	FOOBALL.game.ball.init();
	FOOBALL.game.initTeam(FOOBALL.game.team1, true);
	FOOBALL.game.initTeam(FOOBALL.game.team2, false);
};

FOOBALL.game.ball.init = function () {
	FOOBALL.game.ball.posVector = FOOBALL.newVector(45, 0.705);
	FOOBALL.game.ball.speedVector = FOOBALL.newVector(0, 0.5);
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
			team.players[playernum]= {
				base : { xindex : j, xcount : row.yoffs.length, yoffs : row.yoffs[j] },
				pos : row.pos,
				xy : [0,0],
				speed : 1

			};
			team.players[playernum].xy = FOOBALL.draw.calcStartpoint(isUp, row.yoffs[j], j, row.yoffs.length);
			//console.log(team.players[playernum]);
			playernum++;
		}
	}
};

FOOBALL.main = function () {
	var now = Date.now();
	var delta = now - FOOBALL.then;

	FOOBALL.update(delta / 1000);
	FOOBALL.draw.drawAll();

	FOOBALL.then = now;
};

FOOBALL.physics2d = {
	distance : function(a, b) {
  		return Math.sqrt( Math.pow(b[0]-a[0], 2) + Math.pow(b[1]-a[1], 2) );        
	},
	angle : function(a, b) {
    		return this.normalizeAngle((Math.atan2(b[1]-a[1],b[0]-a[0])*180)/Math.PI);
	},
	distanceFrom0 : function(a) {
		return distance([0,0], a);
	},
	angleFrom0 : function(a) {
		return angle([0,0], a);
	},
	normalizeAngle : function(a) {
    		return (a+360)%360;
	},
	angleIsForward : function(a, isUp) {
    		var b = this.normalizeAngle(a);
    		if (b<=90 || b>270) {
    		        return isUp;
    		} else {
            		return !isUp;
		}
	}
};

FOOBALL.newVector = function(angle, magnitude) {
	return {
		angle : angle,
		magnitude : magnitude,
		getXy : function() {
			return [
				Math.cos(this.angle * Math.PI / 180) * this.magnitude,
				Math.sin(this.angle * Math.PI / 180) * this.magnitude,
				];
		},
		setXy : function(a) {
			this.angle = FOOBALL.physics2d.angleFrom0(a);
			this.magnitude = FOOBALL.physics2d.distanceFrom0(a);
		},
		add : function(v) {
			var s1 = this.getXy();
			var s2 = v.getXy();
			var s3 = [s1[0]+s2[0], s1[1]+s2[1]];
			return FOOBALL.newVector(FOOBALL.physics2d.angleFrom0(s3),
					FOOBALL.physics2d.distanceFrom0(s3));
		},
		sub : function(v) {
			var s1 = this.getXy();
			var s2 = v.getXy();
			var s3 = [s1[0]-s2[0], s1[1]-s2[1]];
			return FOOBALL.newVector(FOOBALL.physics2d.angleFrom0(s3),
					FOOBALL.physics2d.distanceFrom0(s3));
		},
		//TODO mul, rmul
		copy : function() {
			return FOOBALL.newVector(this.angle,
						this.magnitude);
		},
		normalize : function() {
			if (this.magnitude != 0) {
				this.magnitude = 1;
			}
		}
	};
};

FOOBALL.update = function(modifier) {
	// Update game objects

	//update current player
	var currentPlayer = FOOBALL.game.team1.players[FOOBALL.game.team1.currentPlayer];
	if (currentPlayer != null) {
		if (FOOBALL.game.keysDown) { 
			//moving. Undraw before moving
			//undraw current player
			var xym= FOOBALL.mainview.transformPoint(currentPlayer.xy);
			FOOBALL.draw.drawDisc(FOOBALL.mainview.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color);
			var xyr= FOOBALL.radarview.transformPoint(currentPlayer.xy);
			FOOBALL.draw.drawDisc(FOOBALL.radarview.context, [xyr[0]-0.1, xyr[1]-0.1], 0.7, FOOBALL.bg.color);
			//FOOBALL.radarview.context.strokeStyle = 'white';
		}
		//currentPlayer.angle = 0;
		if (38 in FOOBALL.game.keysDown) { // Player holding up
			currentPlayer.xy[1] -= currentPlayer.speed * modifier;
		}
		if (40 in FOOBALL.game.keysDown) { // Player holding down
			currentPlayer.xy[1] += currentPlayer.speed * modifier;
			currentPlayer.angle = 0;
		}
		if (37 in FOOBALL.game.keysDown) { // Player holding left
			currentPlayer.xy[0] -= currentPlayer.speed * modifier;
		}
		if (39 in FOOBALL.game.keysDown) { // Player holding right
			currentPlayer.xy[0] += currentPlayer.speed * modifier;
		}
	}

	//update ball
	if(FOOBALL.game.ball.speed > 0) {
		//FOOBALL.
	}

	//TODO update AI players


	//TODO collision detection
	//console.log(FOOBALL.game.ball.posVector.getXy());	
	var dist= FOOBALL.physics2d.distance(currentPlayer.xy, FOOBALL.game.ball.posVector.getXy());
	if(dist < 0.02) {
		//console.log("HIT "+dist);
		FOOBALL.game.ball.speedVector = currentPlayer.speedVector;
	}
/*
	// Are they touching?
	if (
		currentPlayer.x <= (monster.x + 32)
		&& monster.x <= (currentPlayer.x + 32)
		&& currentPlayer.y <= (monster.y + 32)
		&& monster.y <= (currentPlayer.y + 32)
	) {
		++monstersCaught;
		reset();
	}
	*/
};




FOOBALL.draw = {
	reset : function(ctx, scale) {
		ctx.setTransform(scale,0,0,scale,0,0);
		ctx.strokeStyle='#FFFFFF';
		ctx.fillStyle='#FFFFFF';
	},
	isofy : function(ctx) {
		ctx.scale(1, 1/2);
		var angle= Math.PI / 4;
		ctx.rotate(angle);
	},
	unisofy : function(ctx) {
	ctx.scale(1, 2);
	var angle= Math.PI / 4;
	ctx.rotate(-angle);
	},
	calcStartpoint : function(up, ypos, xindex, xcount) {
		return [(xindex+1)/(xcount+1), (up ? ypos / 2 : 1 - ypos / 2)];
	},
	calcBasepoint : function(up, ypos, xindex, xcount) {
		return [(xindex+1)/(xcount+1), (up ? ypos : 1 - ypos )];
	},
	calcBasepointX : function(xoff, yoff, up, ypos, xindex, xcount) {
		var y;
		if (up) {
			y= yoff + (ypos*FOOBALL.measurements.pitch.length);
		} else {
			y= yoff + FOOBALL.measurements.pitch.length - (ypos*FOOBALL.measurements.pitch.length);
		}
		var x = xoff + ((xindex+1)/(xcount+1)*FOOBALL.measurements.pitch.width);
		//console.log(x,y);
		return [x,y];
	},
	dot : function(ctx, x, y) {
		//penalty arc
		ctx.beginPath();
		ctx.arc(
				x,
				y,
				0.1,
				0,
				Math.PI * 2,
				false);
		ctx.stroke();

	},
	drawBall : function(view) {
		//var ctx= view.context;
		//basepoint
		//var orig= ctx.strokeStyle;
		//ctx.strokeStyle = 'yellow';
		var xy = FOOBALL.game.ball.posVector.getXy();
		xy= view.transformPoint(xy);
		FOOBALL.draw.drawDisc(
			view.context,
			xy,
			0.5,
			'yellow'
			);
		//ctx.strokeStyle= orig;
	},
	drawPlayer : function(view, player, isUp, colour) {
		//console.log(player.xy);
		var ctx = view.context;
		var xy= view.transformPoint(player.xy);
		FOOBALL.draw.drawDisc(
			ctx,
			xy,
			0.6,
			colour
			);
	},
	drawDisc : function(ctx, xy, radius, colour) {
		var orig= ctx.fillStyle;
		ctx.fillStyle= colour;
		ctx.beginPath();
		ctx.arc(
			xy[0],
			xy[1],
			radius,
			0,
			Math.PI * 2,
			false);
		ctx.fill();
		ctx.fillStyle= orig;
	},
	drawRing : function(ctx, x, y, radius) {
		ctx.beginPath();
		ctx.arc(
			x,
			y,
			radius,
			0,
			Math.PI * 2,
			false);
		ctx.stroke();
	},
	/*
	drawPlayerRow : function(view, pos, isUp) {
		var ctx = view.context;
		for (var i=0; i < pos.length; i++) {
			var xy = this.calcBasepoint(view.xoff, view.yoff, isUp, pos[i], i, pos.length);
			//dot(ctx, xy[0], xy[1]);
			var player = { xy : xy };
			this.drawPlayer(view, player, isUp);
		}
	},*/
	drawPlayers : function(view) {
		//var formation = FOOBALL.formations.FourFourTwo;
		var orig= view.context.strokeStyle;
		view.context.strokeStyle = FOOBALL.game.team1.color;
		for(var i=0; i<FOOBALL.game.team1.players.length; i++) {
			this.drawPlayer(view, FOOBALL.game.team1.players[i], true, FOOBALL.game.team1.color);
		}
		view.context.strokeStyle = FOOBALL.game.team2.color;
		for(var j=0; j<FOOBALL.game.team2.players.length; j++) {
			this.drawPlayer(view, FOOBALL.game.team2.players[j], false, FOOBALL.game.team2.color);
		}
		view.context.strokeStyle= orig;
	},
	drawPitch : function (view) {
		//isofy(ctx);
		var ctx = view.context;
		var xoff= view.xoff;
		var yoff= view.yoff;
		//half
		ctx.strokeRect(
			xoff,
			yoff,
			FOOBALL.measurements.pitch.width,
			FOOBALL.measurements.pitch.length/2);
		//area
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.area.width/2,
			yoff,
			FOOBALL.measurements.area.width,
			FOOBALL.measurements.area.length);
		//sixyard
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.sixyard.width/2,
			yoff,
			FOOBALL.measurements.sixyard.width,
			FOOBALL.measurements.sixyard.length);

		//penalty spot
		ctx.beginPath();
		ctx.arc(
				xoff + FOOBALL.measurements.pitch.width/2,
				yoff + FOOBALL.measurements.penalty.length,
				0.2,
				2 * Math.PI,
				false);
		ctx.fill();
		ctx.stroke();

		//penalty arc
		ctx.beginPath();
		ctx.arc(
				xoff + FOOBALL.measurements.pitch.width/2,
				yoff + FOOBALL.measurements.penalty.length,
				FOOBALL.measurements.circle.radius,
				Math.PI / 5,
				Math.PI * 0.8,
				false);
		ctx.stroke();


		//centre circle
		ctx.beginPath();
		ctx.arc(
				xoff + FOOBALL.measurements.pitch.width/2,
				yoff + FOOBALL.measurements.pitch.length/2,
				FOOBALL.measurements.circle.radius,
				0,
				2 * Math.PI,
				false);
		ctx.stroke();
		//half2
		ctx.strokeRect(
			xoff,
			yoff + FOOBALL.measurements.pitch.length/2,
			FOOBALL.measurements.pitch.width,
			FOOBALL.measurements.pitch.length/2);
		//area2
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.area.width/2,
			yoff + FOOBALL.measurements.pitch.length - FOOBALL.measurements.area.length,
			FOOBALL.measurements.area.width,
			FOOBALL.measurements.area.length);
		//sixyard2
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.sixyard.width/2,
			yoff + FOOBALL.measurements.pitch.length - FOOBALL.measurements.sixyard.length,
			FOOBALL.measurements.sixyard.width,
			FOOBALL.measurements.sixyard.length);

		//penalty spot2
		ctx.beginPath();
		ctx.arc(
				xoff + FOOBALL.measurements.pitch.width/2,
				yoff + FOOBALL.measurements.pitch.length - FOOBALL.measurements.penalty.length,
				0.2,
				2 * Math.PI,
				false);
		ctx.fill();
		ctx.stroke();
		this.dot(ctx, xoff+10, yoff+5);

		//penalty arc
		ctx.beginPath();
		ctx.arc(
				xoff + FOOBALL.measurements.pitch.width/2,
				yoff + FOOBALL.measurements.pitch.length - FOOBALL.measurements.penalty.length,
				FOOBALL.measurements.circle.radius,
				- (Math.PI * 0.8),
				- (Math.PI / 5),
				false);
		ctx.stroke();
		this.dot(ctx, xoff+5, yoff+5);
		//doUprights(ctx);
		//reset(ctx);
	////ctx.transform(1/scalex, -skewx, -skewy, 1/scaley, -movex, -movey);
		//ctx.rotate( Math.PI / 4 );
	//	ctx.translate( 0, FOOBALL.measurements.pitch.length );
		//ctx.rotate( - Math.PI / 4 );
		//ctx.transform(1, skewx, skewy, 1, movex, movey);
	/*
	ctx.transform(1, -1,0,1,0,0);
		ctx.rotate( Math.PI / 4 );
		ctx.translate( 0, FOOBALL.measurements.pitch.length );
		ctx.rotate( - Math.PI / 4 );
		ctx.transform(1, 1,0,1,0,0);
		ctx.strokeRect(0, 0, FOOBALL.measurements.goal.width, FOOBALL.measurements.goal.height);
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/5 - FOOBALL.measurements.goal.width*2/3,
			yoff - FOOBALL.measurements.goal.height*5,
			//yoff + FOOBALL.measurement.pitch.length/5 - FOOBALL.measurements.goal.height*5,
			FOOBALL.measurements.goal.width,
			FOOBALL.measurements.goal.height);
	*/
		//reset to isofied
	//ctx.transform(1, -1,0,1,0,0);
		//ctx.rotate( Math.PI / 4 );
	//ctx.translate( 0, -FOOBALL.measurements.pitch.length );
	/*
		ctx.strokeRect(
			xoff	+ FOOBALL.measurements.pitch.width/2
				- FOOBALL.measurements.goal.width/2,
			yoff	+ FOOBALL.measurements.goal.height,
			FOOBALL.measurements.goal.width,
			FOOBALL.measurements.goal.height);
		ctx.strokeRect(
			xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.goal.width/2,
			yoff + FOOBALL.measurements.pitch.length - FOOBALL.measurements.goal.height,
			FOOBALL.measurements.goal.width,
			FOOBALL.measurements.goal.height);
	*/
	},
	//not working!
	doUprights : function(ctx, xoff, yoff) {
		var skewx= 0;
		var skewy= 1;
		var movex= 0;
		var movey= 0;
		var scalex=2;
		var scaley=1;
		//unisofy(ctx);
	//	ctx.translate(
		//	xoff + FOOBALL.measurements.pitch.width/2 - FOOBALL.measurements.goal.width,
			//yoff - FOOBALL.measurements.goal.height);
		//ctx.rotate( - Math.PI / 4 );
		ctx.transform(scalex, skewx, skewy, scaley, movex, movey);
		ctx.strokeStyle='#990000';
		this.dot(ctx, xoff+1, yoff+1);
	//	dot(ctx, xoff+5, yoff+5);

		this.dot(ctx, xoff+10, yoff+10);
		ctx.strokeRect(xoff - (FOOBALL.measurements.pitch.width/4) - (FOOBALL.measurements.goal.width/3),
				yoff - FOOBALL.measurements.goal.height,
				FOOBALL.measurements.goal.width*2/3,
				FOOBALL.measurements.goal.height);

		ctx.strokeStyle='#000099';
		ctx.strokeRect(xoff -(FOOBALL.measurements.pitch.width) - (FOOBALL.measurements.goal.width/2),
				yoff + (FOOBALL.measurements.pitch.length) - FOOBALL.measurements.goal.height,
				FOOBALL.measurements.goal.width*2/3,
				FOOBALL.measurements.goal.height);
		this.reset(ctx);

	},
	drawAll : function() {
		FOOBALL.draw.drawPitch(FOOBALL.radarview);
		FOOBALL.draw.drawPlayers(FOOBALL.radarview);
		FOOBALL.draw.drawBall(FOOBALL.radarview);

	//	FOOBALL.draw.isofy(FOOBALL.mainview.context);
		FOOBALL.draw.drawPitch(FOOBALL.mainview);
		FOOBALL.draw.drawPlayers(FOOBALL.mainview);
		FOOBALL.draw.drawBall(FOOBALL.mainview);
	}
};


