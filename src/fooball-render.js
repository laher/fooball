/*jslint browser: true */
var FOOBALL = FOOBALL || {};

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
		var xy= view.transformPoint(player.posVector.getXy());
		//FOOBALL.console.log(player.posVector.getXy() + ' ' + xy);
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


