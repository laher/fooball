var FOOBALL = FOOBALL || {};


FOOBALL.physics2d = {
	distance : function(a, b) {
		return Math.sqrt( Math.pow(b[0]-a[0], 2) + Math.pow(b[1]-a[1], 2) );
	},
	angle : function(a, b) {
		return this.normalizeAngle((Math.atan2(b[1]-a[1],b[0]-a[0])*180)/Math.PI);
	},
	distanceFrom0 : function(a) {
		return this.distance([0,0], a);
	},
	angleFrom0 : function(a) {
		return this.angle([0,0], a);
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
	},
	add : function(v1, v2) {
		var s1 = v1.getXy();
		var s2 = v2.getXy();
		var s3 = [s1[0]+s2[0], s1[1]+s2[1]];
		return FOOBALL.physics2d.newVector(FOOBALL.physics2d.angleFrom0(s3),
				FOOBALL.physics2d.distanceFrom0(s3));
	},
	sub : function(v1, v2) {
		var s1 = v1.getXy();
		var s2 = v2.getXy();
		var s3 = [s1[0]-s2[0], s1[1]-s2[1]];
		return FOOBALL.physics2d.newVector(FOOBALL.physics2d.angleFrom0(s3),
				FOOBALL.physics2d.distanceFrom0(s3));
	},
	mul : function(v, dt) {
		return FOOBALL.physics2d.newVector(v.angle,v.magnitude * dt);
	},
	mulSingle : function(v1,v2) {
		return v1.magnitude*v2.magnitude*Math.cos(FOOBALL.physics2d.normalizeAngle(v1.angle-v2.angle)*Math.PI/180.0);
	},
	copy : function(v) {
		return FOOBALL.physics2d.newVector(v.angle,v.magnitude);
	}
};
FOOBALL.physics2d.Vector = {};
FOOBALL.physics2d.Vector.prototype = {
	angle : 0,
	magnitude : 0,
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
		this.angle = FOOBALL.physics2d.angleFrom0(s3);
		this.magnitude = FOOBALL.physics2d.distanceFrom0(s3);
	},
	sub : function(v) {
		var s1 = this.getXy();
		var s2 = v.getXy();
		var s3 = [s1[0]-s2[0], s1[1]-s2[1]];
		this.angle = FOOBALL.physics2d.angleFrom0(s3);
		this.magnitude = FOOBALL.physics2d.distanceFrom0(s3);
	},
	mul : function(dt) {
		this.magnitude *= dt;
	},
	mulSingle : function(v) {
		this.magnitude*=v.magnitude*Math.cos(FOOBALL.physics2d.normalizeAngle(this.angle-v.angle)*Math.PI/180.0);
	},
	bounce : function() {
		this.angle = FOOBALL.physics2d.normalizeAngle(this.angle+180);
	},
	copy : function() {
		return FOOBALL.physics2d.newVector(this.angle,this.magnitude);
	},
	become : function(v) {
		this.angle= v.angle;
		this.magnitude= v.magnitude;
	},
	normalize : function() {
		if (this.magnitude !== 0) {
			this.magnitude = 1;
		}
	},
	inside : function(minXy, maxXy) {
		var xy= this.getXy();
		//console.log(xy);
		//console.log(minXy);
		//console.log(maxXy);
		return xy[0] > minXy[0] &&
			xy[1] > minXy[1] &&
			xy[0] < maxXy[0] &&
			xy[1] < maxXy[1];
	}
};

FOOBALL.physics2d.newVector = function(angle, magnitude) {
	var ret = Object.create(FOOBALL.physics2d.Vector.prototype);
	ret.angle = angle;
	ret.magnitude = magnitude;
	return ret;
};
