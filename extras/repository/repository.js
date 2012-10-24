var P = require("proj4js");

module.exports = P.Class({

	/**
	 * Property: autoFetch
	 * Should we try to fetch Proj4-definitions from 
	 * http://www.spatialreference.org/ when we don't have them in the store
	 */
	autoFetch: true,
	
	_projs: {},
	
	initialize: function(defs, options){
		if(typeof(options) === "object"){
			if(typeof(options.autoFetch) !== 'undefined'){
				this.autoFetch = options.autoFetch;
			}
		}
		if(typeof(defs) === "object"){
			this.add(defs);
		}
	},

	add: function(code, def){
		if(typeof(code) === 'object'){
			var defs = code;
			for(var key in defs){
				this.addDef(key, defs[key]);
			}
		} else {
			this._projs[code] = def;
		}
	},

	create: function(code){
		// Proj-instance or Proj4 code string
		var p = this._projs[code]; 
		if(p){
			if(typeof(p) === "string"){
				this._projs[code] = p = new P.Proj(code, p);
			}
			return p;
		} else if(this.autoFetch) {
			throw new Error("Auto fetching not yet supported");
		} 
		return undefined;
	}
});
