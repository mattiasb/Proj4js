/*
Author:       Mattias Bengtsson   mattias.bengtsson@kartena.se
              Vladimir Agafonkin  agafonkin@gmail.com
              Oleg Smith
License:      MIT as per: ../LICENSE
*/

Proj4js.Store = Proj4js.Class({

	_sources: [],
	
	_projs: {},

	/**
     * Constructor: Proj4js.Store
     *
     * Parameters:
     * - sources {Array} A prioritized array of url templates for 
	 *   fetching Proj4-code.
     */
	initialize: function (sources) {
		this._sources = sources
			? sources
			: Proj4js.Store.defaultSources;
	},

	/**
	 * APIMethod: add
	 * Add a projection to this store
	 * 
	 * Parameters:
	 * - code {string} the code name of the projection
	 * - def  {string} or {Proj4js.Proj} the Proj4- or WKT definition of the 
	 *         projection or a Proj object, optional
	 * 
	 * Return:
	 * {Proj4js.Proj} the initialized projection
	 */
	add: function (code, def) {
		if (typeof def === "string") {
			return this._projs[code] = new Proj4js.Proj(code, def);;
		} else if (def instanceof Proj4js.Proj) {
			return this._projs[code] = def;
		}
		return undefined;
	},
	
	/**
	 * APIMethod: load
	 * Load a projection from one of the provided external sources
	 * 
	 * Parameters:
	 * - code {string} the code name of the projection
	 * - cb   {function} a callback that acts on the projection
	 *                   once it's loaded.
	 */
	load: function (code, cb) {
		var that = this;
		Proj4js.Store.getDef(code, this._sources.slice(0), function (err, def) {
			if(err) {
				Proj4js.reportError("Failed to load definition for " + code 
									+ ". Error: " + err);
			} else {
				var p = that.add(code, def);
				cb && cb(p);
			}
		});
	},
	
	/**
	 * APIMethod: addMany
	 * Add a bunch of projections to this store
	 * 
	 * Parameters:
	 * - defs {object} a map of code {string} => def {string || Proj4js.Proj} 
	 *        that should be added.
	 */
	addMany: function (defs) {
		for (var code in defs) {
			if (defs.hasOwnProperty(code)) {
				this.add(code, defs[code]);
			}
		}
	},
	/**
	 * APIMethod: get
	 * 
	 * Parameters:
	 * - code {string} the code identifying the projection
	 * 
	 * Return:
	 * {Proj4js.Proj} the selected projection if it exists
	 */
	get: function (code) {
		return this._projs[code];
	},
	
	/**
	 * APIMethod: with
	 * 
	 * Do something with a projection, load it from external
	 * source if it isn't available
	 * 
	 * Parameters:
	 * - code {string}   the code identifying the projection
	 * - cb   {function} a callback that acts on the projection
	 *                   identified by the code parameter
	 */
	with: function (code, cb) {
		var p = this._projs[code]; 
		if (p) {
			cb && cb(p);
		} else {
			this.load(code, cb);
		}
	}
});

/**
 * APIMethod: getDef
 * 
 * Try to load Proj4 or WKT from all the {sources} in order
 * until one succeeds using http get requests.
 * 
 * Parameters:
 * - code    {string}   the code identifying the projection ("AUTH:NUMBER")
 * - sources {array}    an array of url templates to check from
 * - cb      {function} the callback to call on success or 
 *                       when all sources failed. 
 */
Proj4js.Store.getDef = function (code, sources, cb) {
	var split, url;
	
	if(sources.length == 0) {
		cb && cb("Failed to download definition from any of the provided sources");
	} else {
		split = code.split(':');
		url = Proj4js.Store.template(sources.pop(), {
			authority: split[0],
			number: split[1]
		});
		Proj4js.get(url, function (err, result) {
			if (err) {
				Proj4js.Store.getDef(code, sources, cb);
			} else {
				cb && cb(undefined, result);
			}
		});
	}
};

/**
 * APIMethod: template
 * 
 * Template function shamelessly stolen from Leaflet. 
 *
 * Parameters:
 * - str  {string}   the template string, containing placeholders for values
 * - data {object}   a dictionary containing the values to fill in to str
 */

Proj4js.Store.template = function (str, data) {
	return str.replace(/\{ *([\w_]+) *\}/g, function (str, key) {
		var value = data[key];
		if (!data.hasOwnProperty(key)) {
			throw new Error('No value provided for variable ' + str);
		} else if (typeof value === 'function') {
			value = value(data);
		}
		return value;
	});
};

Proj4js.Store.defaultSources = [
	"/proj/{authority}{number}.proj4",
	// TODO: authority needs to be lower case here, fix that. :(
	"http://www.corsproxy.com/www.spatialreference.org/ref/epsg/{number}/proj4/"
];