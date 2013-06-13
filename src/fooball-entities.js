/*jslint browser: true */

FOOBALL.Player= {};
FOOBALL.Player.prototype = {
		base : { xindex : 0, xcount : 0, yoffs : 0 },
		posVector : null,
		speedVector : null,
		positionName : '',
		clear : function(view) {
			var xym= view.transformPoint(this.posVector.getXy());
			FOOBALL.draw.drawDisc(view.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color);
		}
};

