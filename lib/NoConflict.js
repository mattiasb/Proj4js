/**
 * NoConflict pattern for the browser global version
 *
 */

var original = window.Proj4js;

Proj4js.noConflict = function () {
	window.Proj4js = original;
	return this;
};

window.Proj4js = Proj4js;
