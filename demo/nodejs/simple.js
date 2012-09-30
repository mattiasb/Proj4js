var P = require('../../dist/proj4js.commonjs');

var WGS84 = new P.Proj("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs ");
var RT90  = new P.Proj("EPSG:2400", "+proj=tmerc +lat_0=0 +lon_0=15.80827777777778 +k=1 +x_0=1500000 +y_0=0 +ellps=bessel +units=m +no_defs ");

var point = new P.Point(57.7044945757868, 11.965281029948926);

console.log("WGS84: " + point);
P.transform(WGS84, RT90, point);
console.log(" RT90: " + point);
