Proj4js
=======

A proj4js (http://trac.osgeo.org/proj4js/) fork for experimenting with some potential API cleanups.

Proj4js is in many ways an excellent library, it is very powerful, but the API is a bit quirky 
and contains quite a few surprises.

The goal of this project is to try to construct a more friendly API than what is available today.

These are the main issues that I see with proj4js today:

  * To get proper error handling in place you need to override Proj4js.reportError, otherwise
  	Proj4js will either silently fail or chose some arbitrary default value (like wgs84 for a 
	failed Proj4js.Proj construction or the point itself in case of a failed transform).
  * The Proj4js.Proj constructor is full of surprising side effects.
  	* You can't construct a Proj from proj4-def, the constructor only takes an srsCode. This
	  makes it impossible to construct an anonymous Proj.
	* To construct a Proj you need to first add the proj4-def to the Proj4.defs dictionary 
	  with its srs code as key
	* However if the proj4-def isn't available in the dictionary the constructor will silently
	  turn itself into an asynchronous call to try to load the proj4-def from the web (first from
	  a subdir from where proj4js.js lives and then from http://www.spatialreference.org/). 
	  Fortunately the constructor takes a callback. 

The asynchronous loading of proj4-defs can be handy at times, but I want to be able to decide
for myself when I want this behaviour and not. 

So the main goals currently is: 
  * Strip away all asynchronous downloading of proj4-defs and instead let Proj4js.Proj take a
  	proj4-string as part of its arguments.
  * Create a library or function, taking inspiration from the removed code above, for loading
  	proj4-defs from remote locations. 

Other possible goals:
  * Support building npm- and AMD packages

Compile & Install
-------
You need node 0.8.x and npm installed. 
To compile is then as easy as
```
npm install
```
and then just copy the wanted version from dist/