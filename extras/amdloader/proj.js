define("proj", ['proj4js'], function(P) {
    return {
        load: function(name, require, callback, config) {
            config || (config = {});
            config.proj || (config.proj = {});
            config.proj.directory || (config.proj.directory = '');
			var path = config.proj.directory + '/' 
				+ name.replace(':','') + '.proj4';

            require(['text!' + path], function(proj4) {
                callback(new P.Proj(name, proj4));
            });
        }
    };
});