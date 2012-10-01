define("proj", ['proj4js'], function(P) {
    return {
        load: function(name, require, callback, config) {
            require(['text!' + name.replace(':','') + '.proj4'], function(proj4) {
                callback(new P.Proj(name, proj4));
            });
        }
    };
});