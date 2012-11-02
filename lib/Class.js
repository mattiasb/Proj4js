/**
 * This is a minimal implementation of JavaScript inheritance methods so that
 * Proj4js can be used as a stand-alone library.
 * These are copies of the equivalent OpenLayers methods at v2.7
 */

/**
 * Function: extend
 * Copy all properties of a source object to a destination object.  Modifies
 *     the passed in destination object.  Any properties on the source object
 *     that are set to undefined will not be (re)set on the destination object.
 *
 * Parameters:
 * destination - {Object} The object that will be modified
 * source - {Object} The object with properties to be set on the destination
 *
 * Returns:
 * {Object} The destination object.
 */
Proj4js.extend = function(destination, source) {
    destination = destination || {};
    if(source) {
        for(var property in source) {
            var value = source[property];
            if(value !== undefined) {
                destination[property] = value;
            }
        }
    }
    return destination;
};

/**
 * Constructor: Class
 * Base class used to construct all other classes. Includes support for
 *     multiple inheritance.
 *
 */
Proj4js.Class = function() {
    var Class = function() {
        this.initialize.apply(this, arguments);
    };

    var extended = {};
    var parent;
    for(var i=0; i<arguments.length; ++i) {
        if(typeof arguments[i] == "function") {
            // get the prototype of the superclass
            parent = arguments[i].prototype;
        } else {
            // in this case we're extending with the prototype
            parent = arguments[i];
        }
        Proj4js.extend(extended, parent);
    }
    Class.prototype = extended;

    return Class;
};