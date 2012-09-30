/*
  Simple example of projecting coordinates in Gothenburg from
  WGS84 (EPSG:4328) to RT90 (EPSG:2400)
*/

var P = require('../../dist/proj4js.commonjs');

var RT90  = new P.Proj("EPSG:2400", "+lon_0=15.808277777799999 +lat_0=0.0 +k=1.0 +x_0=1500000.0 +y_0=0.0 +proj=tmerc +ellps=bessel +units=m +towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +no_defs");

var point = new P.Point(11.965281029948926, 57.7044945757868);

console.log("WGS84: lat=" + point.y + ", lon=" + point.x);
P.transform(P.WGS84, RT90, point);
console.log(" RT90: x=" + Math.round(point.y) + ", y=" + Math.round(point.x));
