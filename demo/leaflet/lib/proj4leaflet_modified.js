L.CRS.proj4js = (function () {
	var createProjection = function (proj) {
		return {
			project: function (latlng) {
				var point = new L.Point(latlng.lng, latlng.lat);
				return Proj4js.transform(Proj4js.WGS84, proj, point);
			},

			unproject: function (point, unbounded) {
				var point2 = Proj4js.transform(proj, Proj4js.WGS84, point.clone());
				return new L.LatLng(point2.y, point2.x, unbounded);
			}
		};
	};

	return function (proj, transformation) {
		return L.Util.extend({}, L.CRS, {
			code: proj.srsCode,
			transformation: transformation ? transformation: new L.Transformation(1, 0, -1, 0),
			projection: createProjection(proj)
		});
	};
}());
