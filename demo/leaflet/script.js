var res = [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5];

var proj = new Proj4js.Proj('EPSG:2400'
					  , '+lon_0=15.808277777799999 +lat_0=0.0 +k=1.0 +x_0=1500000.0 '
					  + '+y_0=0.0 +proj=tmerc +ellps=bessel +units=m '
					  + '+towgs84=414.1,41.3,603.1,-0.855,2.141,-7.023,0 +no_defs');

var  crs = L.CRS.proj4js(proj);
crs.scale = function(zoom) {
    return 1 / res[zoom];
};

var map = L.map('map', { crs: crs , continuousWorld: true })
	.setView( new L.LatLng(57.704503026010514, 11.965263344824994), 13);

L.tileLayer( 'http://api.geosition.com/tile/lmv/{z}/{x}/{y}.png', {
	  scheme: 'xyz'
	, maxZoom: 14
	, minZoom: 0
	, continuousWorld: true
	, attribution: 'Map data &copy; 2011 Lantmäteriet, Imagery &copy; 2011 Kartena'
}).addTo(map);

var b = new Billing.Leaflet(map, "github-demo", "lmv", parseInt(Math.random() * 10000000), window.location.hostname, window.location.href);