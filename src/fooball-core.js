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
	//probably ditch this ...
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
		length : 2
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
	FOOBALL.mainview.context.lineWidth = 0.3;
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

	FOOBALL.game.update(delta / 1000);
	FOOBALL.draw.drawAll();

	FOOBALL.then = now;
};


