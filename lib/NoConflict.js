/*
Author:       Mattias Bengtsson mattias.bengtsson@kartena.se
License:      MIT as per: ../LICENSE
*/

/**
 * NoConflict pattern for the browser global version
 *
 */

var originalP = window.P;

Proj4js.noConflict = function () {
	window.P = originalP;
	return this;
};

window.P = Proj4js;
