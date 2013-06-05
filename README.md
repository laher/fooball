Fooball
=======

A football (soccer) game engine for HTML canvas. Experimental. Early doors.

The engine should enable various variants, in terms of physics, etc.

Background
----------

This experiment began a few years ago as a python (pygame) experiment, https://code.google.com/p/didiball/. 
Some aspects will be copied from that game (some AI and other concepts)
I stopped the pygame experiment because the platform didn't feel right for what I wanted to acheive. 
So, to html5 canvas.

Building
--------

If contributing, please make sure your code builds without any lint or test failures.
To lint, test & build, you need 'grunt'.

	1. install latest node.js.
	2. Install and build fooball:
		git clone https://github.com/laher/fooball && cd fooball
		npm install
		./node_modules/grunt-cli/grunt

TODO
----
Lots of stuff to get an actual game going:

 * AI - closest player follows ball. Some randomness (to clear players).
 * collision detection & bouncing.
 * zoom & panning
 * Physics: speed, friction, gravity
 * zoom, panning (tilting ?)
 * camera follows ball
 * Scores, time
 * sprites
