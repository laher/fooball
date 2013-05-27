var FOOBALL = {
	game : {
		paused : true,
		team1 : {
			name : 'Red Rackams',
			color : '#990000',
			controls : {}
		},
		team2 : {
			name : 'Blue Meanies',
			color : '#000099',
			controls : {}
		},
		timer : { },
		score : [0,0],
	},
        formations : {
		FourFourTwo : {
			gk : [0.05],
			df : [0.3,0.2,0.2,0.3],
			mf : [0.6,0.45,0.45,0.6],
			st : [0.7,0.78]
		}
	},
	mainview : {
		elementid : 'isopitch',
		scale : 10,
		xoff : 48,
		yoff : -50,
		reset : function() {
			this.context.setTransform(this.scale,0,0,this.scale,0,0);
			this.context.strokeStyle='#FFFFFF';
			this.context.fillStyle='#FFFFFF';
		}
	},
	radarview : {
		elementid : 'radar',
		scale : 1.5,
		xoff : 5,
		yoff : 5,
		reset: function() {
			this.context.setTransform(this.scale,0,0,this.scale,0,0);
			this.context.strokeStyle='#FFFFFF';
			this.context.fillStyle='#FFFFFF';
		}
	},
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

	//var isocanvas = document.getElementById('isopitch');
	var isoctx = isocanvas.getContext('2d');
	isoctx.lineWidth= 0.5;
	FOOBALL.mainview.context = isoctx;
	FOOBALL.mainview.reset();

	//var radarcanvas = document.getElementById('radar');
	var radarctx = radarcanvas.getContext('2d');
	radarctx.lineWidth= 0.3;
	FOOBALL.radarview.context = radarctx;
	FOOBALL.radarview.reset();


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
	calcBasepoint : function(xoff, yoff, up, ypos, xindex, xcount) {
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
	var ctx= view.context;
	//basepoint
	ctx.strokeStyle = 'yellow';
	var xy = this.calcBasepoint(view.xoff, view.yoff, false, 0.5, 0, 1);
	ctx.beginPath();
	ctx.arc(
			xy[0],
			xy[1],
			0.5,
			0,
			Math.PI * 2,
			false);
	ctx.stroke();


},
	drawPlayerRow : function(view, pos, isUp) {
	var ctx = view.context;
	for (var i=0; i < pos.length; i++) {
		var xy = this.calcBasepoint(view.xoff, view.yoff, isUp, pos[i], i, pos.length);
		//dot(ctx, xy[0], xy[1]);
		ctx.beginPath();
		ctx.arc(
			xy[0],
			xy[1],
			0.5,
			0,
			Math.PI * 2,
			false);
		ctx.stroke();


	//	dot(ctx, xoff+10, yoff+10);
	}
},
	drawPlayers : function(view) {
	var formation = FOOBALL.formations.FourFourTwo;
	view.context.strokeStyle = FOOBALL.game.team1.color;
	this.drawPlayerRow(view, formation.gk, true);
	this.drawPlayerRow(view, formation.df, true);
	this.drawPlayerRow(view, formation.mf, true);
	this.drawPlayerRow(view, formation.st, true);
	view.context.strokeStyle = FOOBALL.game.team2.color;
	this.drawPlayerRow(view, formation.gk, false);
	this.drawPlayerRow(view, formation.df, false);
	this.drawPlayerRow(view, formation.mf, false);
	this.drawPlayerRow(view, formation.st, false);
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

}
};


