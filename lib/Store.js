/*
Author:       Mattias Bengtsson mattias.bengtsson@kartena.se
License:      MIT as per: ../LICENSE
*/

Proj4js.Store = Proj4js.Class({

	/**
	 * Property: sources
     * A prioritized array of url templates for fetching Proj4-code.
	 */
	_sources: [],
	
	_projs: {},

	/**
     * Constructor: Proj4js.Store
     *
     * Parameters:
     * - sources {Array} A prioritized array of base urls for 
	 *   fetching Proj4-code.
     */
	initialize: function(sources){
		if(typeof(sources) === 'object'){
			this._sources = sources;
		}
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
	add: function(code, def){
		if(typeof def === "string"){
			return this._projs[code] = new Proj4js.Proj(code, def);;
		} else if(def instanceof Proj4js.Proj){
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
	 *                   identified by the code parameter
	 */
	load: function(code, cb){
		Proj4js.Store.load(code, this.sources, function(err, def){
			if(!err) {
				var p = this.add(code, def);
				cb && cb(p);
			} else {
				// Handle error
			}
		}, this);
	},
	/**
	 * APIMethod: addMany
	 * Add a bunch of projections to this store
	 * 
	 * Parameters:
	 * - defs {object} a map of code {string} => def {string || Proj4js.Proj} 
	 *        that should be added.
	 */
	addMany: function(defs){
		for(var code in defs){
			this.add(code, defs[code]);
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
	get: function(code){
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
	with: function(code, cb){
		var p = this._projs[code]; 
		if(p){
			cb && cb(p);
		} else {
			this.load(code, cb);
		}
	}
});

/**
 * APIMethod: load
 * 
 * Try to load Proj4 or WKT from all the sources in order
 * until one succeeds.
 * 
 * Parameters:
 * - code    {string}   the code identifying the projection
 * - sources {object}   an array of sources to check from
 * - cb      {function} the callback to call on success or 
 *                      when all sources failed. 
 */
Proj4js.Store.load = function(code, sources, cb){
	cb && cb("No load function defined");
};