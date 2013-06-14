/*jslint browser: true */
var FOOBALL = FOOBALL || {};

FOOBALL.entities= {
	Ball : {},
	Player : {}
};
FOOBALL.entities.Ball.prototype = {
	posVector : null,
	speedVector : null,
	mainColor : 'orange',
	clear : function(view) {
		var xym= view.transformPoint(this.posVector.getXy());
		FOOBALL.draw.drawDisc(view.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color, FOOBALL.bg.color);
	},
	draw : function(view) {
		var xy = this.posVector.getXy();
		xy= view.transformPoint(xy);
		FOOBALL.draw.drawDisc(
			view.context,
			xy,
			0.5,
			this.mainColor
			);
	}
};
FOOBALL.entities.Player.prototype = {
	base : { xindex : 0, xcount : 0, yoffs : 0 },
	posVector : null,
	speedVector : null,
	positionName : '',
	mainColor : 'blue',
	clear : function(view) {
		var xym= view.transformPoint(this.posVector.getXy());
		FOOBALL.draw.drawDisc(view.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color, FOOBALL.bg.color);
	},
	draw : function(view) {
		var ctx = view.context;
		var xy= view.transformPoint(this.posVector.getXy());
		FOOBALL.draw.drawDisc(
			ctx,
			xy,
			0.6,
			this.mainColor
			);
	}
};

