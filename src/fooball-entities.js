/*jslint browser: true */
var FOOBALL = FOOBALL || {};

FOOBALL.entities= {
	Ball : {},
	Player : {}
};
FOOBALL.entities.Ball.prototype = {
	posVector : null,
	lastPos : null,
	speedVector : null,
	mainColor : 'orange',
	clear : function(view) {
		if(this.lastPos == null) {
			this.lastPos= this.posVector.getXy();
		};
		var xym= view.transformPoint(this.lastPos);
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
	},
	move : function(modifier) {
		if(this.speedVector.magnitude > 0) {
			this.lastPos = this.posVector.getXy();
			//update
			this.posVector.add( FOOBALL.physics2d.mul(this.speedVector, modifier) );
			//account for friction and collisions with rocks
			if(!FOOBALL.game.ball.posVector.inside([0,0],[1,1])) {
				//TODO only if pointing away from midpoint
				var angle = FOOBALL.physics2d.angle(this.posVector.getXy(),[0.5,0.5])    - this.speedVector.angle;
				if(angle > 90 || angle < -90) {
					this.speedVector.bounce();
				}

			} else {
				this.speedVector.mul(FOOBALL.behaviourTypes.ball.friction);
			}
			return true;
		} else {
			return false;
		}
	}
};
FOOBALL.entities.Player.prototype = {
	base : { xindex : 0, xcount : 0, yoffs : 0 },
	posVector : null,
	lastPos : null,
	speedVector : null,
	positionName : '',
	mainColor : 'blue',
	active : false,
	human : false,
	clear : function(view) {
		if(this.lastPos == null) {
			this.lastPos= this.posVector.getXy();
		};
		var xy= view.transformPoint(this.lastPos);
		view.context.clearRect(xy[0]-1,xy[1]-1,2,2);
		//FOOBALL.draw.drawDisc(view.context, [xym[0]-0.2, xym[1]-0.2], 0.9, FOOBALL.bg.color, FOOBALL.bg.color);
	},
	draw : function(view) {
		var xy= view.transformPoint(this.posVector.getXy());
		FOOBALL.draw.drawDisc(
			view.context,
			xy,
			0.6,
			this.mainColor
			);
	},
	move : function(modifier) {
		var posXy= this.posVector.getXy();
		this.lastPos= posXy;
		if (this.human && this.active) {
			if (Object.keys(FOOBALL.game.keysDown).length>0) {
				//moving. Undraw before moving
				var angleCalced=false;
				if (FOOBALL.keyCodes.UP in FOOBALL.game.keysDown) { // Player holding up
					posXy[1] -= this.speedVector.magnitude * modifier;
					this.speedVector.angle = 270;
					if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
						this.speedVector.angle -= 45;
					} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
						this.speedVector.angle += 45;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.DOWN in FOOBALL.game.keysDown) { // Player holding down
					posXy[1] += this.speedVector.magnitude * modifier;
					this.speedVector.angle = 90;
					if(FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) {
						this.speedVector.angle += 45;
					} else if(FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) {
						this.speedVector.angle -= 45;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.LEFT in FOOBALL.game.keysDown) { // Player holding left
					posXy[0] -= this.speedVector.magnitude * modifier;
					if(!angleCalced) {
						this.speedVector.angle = 180;
					}
					angleCalced=true;
				}
				if (FOOBALL.keyCodes.RIGHT in FOOBALL.game.keysDown) { // Player holding right
					posXy[0] += this.speedVector.magnitude * modifier;
					if(!angleCalced) {
						this.speedVector.angle = 0;
					}
					angleCalced=true;
				}
				//this.posVector.setXy(posXy);
				//TODO gradual
				this.speedVector.magnitude=0.2;
			} else {

				//TODO gradual
				this.speedVector.magnitude=0;
			}
		} else if (this.active) {
			var angToBall = FOOBALL.physics2d.angle(this.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
			var disToBall = FOOBALL.physics2d.distance(this.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
			if(disToBall > 0.001) {
				this.speedVector.magnitude= 0.1;
				this.speedVector.angle = angToBall;
			} else {
				this.speedVector.magnitude= 0;
			}

		} else {
			var angToBase = FOOBALL.physics2d.angle(this.posVector.getXy(), this.basePoint);
			var disToBase = FOOBALL.physics2d.distance(this.posVector.getXy(), this.basePoint);
			if(disToBase > 0.05) {
				this.speedVector.magnitude= 0.1;
				this.speedVector.angle = angToBase;
			} else {
				this.speedVector.magnitude= 0;
			}
		}

		this.posVector.add( FOOBALL.physics2d.mul(this.speedVector, modifier) );
		// collision detection
		var dist= FOOBALL.physics2d.distance(this.posVector.getXy(), FOOBALL.game.ball.posVector.getXy());
		if(dist < 0.02) {
			//FOOBALL.console.log("HIT "+dist+" "+FOOBALL.game.ball.speedVector.angle);
			FOOBALL.game.ball.speedVector.become(this.speedVector);
		}

		if (this.speedVector.magnitude > 0) {
			return true;
		}
		return false;

	}
};

