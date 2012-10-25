/*
  Simple example of projecting coordinates in Gothenburg from
  RT90 (EPSG:2400) to SWEREF99 (EPSG:3006)
*/
var P = require('proj4js');
var Repository = new require('../repository.js');
var repo = new Repository({
	"EPSG:2400" : "+lon_0=15.808277777799999 +lat_0=0.0 +k=1.0 +x_0=1500000.0 "
				  + "+y_0=0.0 +proj=tmerc +ellps=bessel +units=m "
				  + "+towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +no_defs",
	"EPSG:3006" : "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 "
				  + "+units=m +no_defs "
});

var RT90  = repo.proj("EPSG:2400");
var SWEREF99  = repo.proj("EPSG:3006");

var point = new P.Point(6404229, 1271138);

console.log("RT90: x=" + point.x + ", y=" + point.y);
P.transform(RT90, SWEREF99, point);
console.log(" SWEREF99: x=" + Math.round(point.y) + ", y=" + Math.round(point.x));
