define("crs", ['proj4js'], function(P) {
    return {
        load: function(name, require, callback, config) {
            config || (config = {});
            config.crs || (config.crs = {});
            config.crs.directory || (config.crs.directory = '');

			var dir = config.crs.directory;
			var sep = dir.length > 0 && dir.charAt(dir.length-1) !== '/'
					? '/' : '';
			var filename = name.replace(':','') + '.proj4';

            require(['text!' + dir + sep + filename], function(proj4) {
                callback(new P.Proj(name, proj4));
            });
        }
    };
});