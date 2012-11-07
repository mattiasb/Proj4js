/*
 Author:       Mike Adair madairATdmsolutions.ca
               Richard Greenwood rich@greenwoodmap.com
               Mattias Bengtsson mattias.bengtsson@kartena.se
 License:      MIT as per: ../LICENSE
 */

/**
 * Namespace: Proj4js
 *
 * Proj4js is a JavaScript library to transform point coordinates from one
 * coordinate system to another, including datum transformations.
 *
 * This library is a port of both the Proj.4 and GCTCP C libraries to JavaScript.
 * Enabling these transformations in the browser allows geographic data stored
 * in different projections to be combined in browser-based web mapping
 * applications.
 *
 * Proj4js must have access to coordinate system initialization strings (which
 * are the same as for PROJ.4 command line).  Thes can be included in your
 * application using a <script> tag or Proj4js can load CS initialization
 * strings from a local directory or a web service such as spatialreference.org.
 *
 * Similarly, Proj4js must have access to projection transform code.  These can
 * be included individually using a <script> tag in your page, built into a
 * custom build of Proj4js or loaded dynamically at run-time.  Using the
 * -combined and -compressed versions of Proj4js includes all projection class
 * code by default.
 *
 * Note that dynamic loading of defs and code happens ascynchrously, check the
 * Proj.readyToUse flag before using the Proj object.  If the defs and code
 * required by your application are loaded through script tags, dynamic loading
 * is not required and the Proj object will be readyToUse on return from the
 * constructor.
 *
 * All coordinates are handled as points which have a .x and a .y property
 * which will be modified in place.
 *
 * Override Proj4js.reportError for output of alerts and warnings.
 *
 * See http://trac.osgeo.org/proj4js/wiki/UserGuide for full details.
 */

/**
 * Global namespace object for Proj4js library
 */
var Proj4js = {

    /**
     * Property: defaultDatum
     * The datum to use when no others a specified
     */
    defaultDatum: 'WGS84',                  //default datum

    /**
     * Method: transform(source, dest, point)
     * Transform a point coordinate from one map projection to another.  This is
     * really the only public method you should need to use.
     *
     * Parameters:
     * source - {Proj4js.Proj} source map projection for the transformation
     * dest - {Proj4js.Proj} destination map projection for the transformation
     * point - {Object} point to transform, may be geodetic (long, lat) or
     *     projected Cartesian (x,y), but should always have x,y properties.
     */
    transform: function(source, dest, point) {

        // Workaround for datum shifts towgs84, if either source or destination projection is not wgs84
        if (source.datum && dest.datum && (
            ((source.datum.datum_type == Proj4js.common.PJD_3PARAM || source.datum.datum_type == Proj4js.common.PJD_7PARAM) && dest.datumCode != "WGS84") ||
				((dest.datum.datum_type == Proj4js.common.PJD_3PARAM || dest.datum.datum_type == Proj4js.common.PJD_7PARAM) && source.datumCode != "WGS84"))) {
            var wgs84 = Proj4js.WGS84;
            this.transform(source, wgs84, point);
            source = wgs84;
        }

        // DGR, 2010/11/12
        if (source.axis!="enu") {
            this.adjust_axis(source,false,point);
        }

        // Transform source points to long/lat, if they aren't already.
        if ( source.projName=="longlat") {
            point.x *= Proj4js.common.D2R;  // convert degrees to radians
            point.y *= Proj4js.common.D2R;
        } else {
            if (source.to_meter) {
                point.x *= source.to_meter;
                point.y *= source.to_meter;
            }
            source.inverse(point); // Convert Cartesian to longlat
        }

        // Adjust for the prime meridian if necessary
        if (source.from_greenwich) {
            point.x += source.from_greenwich;
        }

        // Convert datums if needed, and if possible.
        point = this.datum_transform( source.datum, dest.datum, point );

        // Adjust for the prime meridian if necessary
        if (dest.from_greenwich) {
            point.x -= dest.from_greenwich;
        }

        if( dest.projName=="longlat" ) {
            // convert radians to decimal degrees
            point.x *= Proj4js.common.R2D;
            point.y *= Proj4js.common.R2D;
        } else  {               // else project
            dest.forward(point);
            if (dest.to_meter) {
                point.x /= dest.to_meter;
                point.y /= dest.to_meter;
            }
        }

        // DGR, 2010/11/12
        if (dest.axis!="enu") {
            this.adjust_axis(dest,true,point);
        }

        return point;
    }, // transform()

    /** datum_transform()
     source coordinate system definition,
     destination coordinate system definition,
     point to transform in geodetic coordinates (long, lat, height)
     */
    datum_transform : function( source, dest, point ) {

		// Short cut if the datums are identical.
		if( source.compare_datums( dest ) ) {
			return point; // in this case, zero is sucess,
            // whereas cs_compare_datums returns 1 to indicate TRUE
            // confusing, should fix this
		}

		// Explicitly skip datum transform by setting 'datum=none' as parameter for either source or dest
		if( source.datum_type == Proj4js.common.PJD_NODATUM
			|| dest.datum_type == Proj4js.common.PJD_NODATUM) {
			return point;
		}

		// Do we need to go through geocentric coordinates?
		if( source.es != dest.es || source.a != dest.a
			|| source.datum_type == Proj4js.common.PJD_3PARAM
			|| source.datum_type == Proj4js.common.PJD_7PARAM
			|| dest.datum_type == Proj4js.common.PJD_3PARAM
			|| dest.datum_type == Proj4js.common.PJD_7PARAM)
		{

			// Convert to geocentric coordinates.
			source.geodetic_to_geocentric( point );
			// CHECK_RETURN;

			// Convert between datums
			if( source.datum_type == Proj4js.common.PJD_3PARAM || source.datum_type == Proj4js.common.PJD_7PARAM ) {
				source.geocentric_to_wgs84(point);
				// CHECK_RETURN;
			}

			if( dest.datum_type == Proj4js.common.PJD_3PARAM || dest.datum_type == Proj4js.common.PJD_7PARAM ) {
				dest.geocentric_from_wgs84(point);
				// CHECK_RETURN;
			}

			// Convert back to geodetic coordinates
			dest.geocentric_to_geodetic( point );
			// CHECK_RETURN;
		}

		return point;
    }, // cs_datum_transform

    /**
     * Function: adjust_axis
     * Normalize or de-normalized the x/y/z axes.  The normal form is "enu"
     * (easting, northing, up).
     * Parameters:
     * crs {Proj4js.Proj} the coordinate reference system
     * denorm {Boolean} when false, normalize
     * point {Object} the coordinates to adjust
     */
    adjust_axis: function(crs, denorm, point) {
        var xin= point.x, yin= point.y, zin= point.z || 0.0;
        var v, t;
        for (var i= 0; i<3; i++) {
            if (denorm && i==2 && point.z===undefined) { continue; }
            if (i==0) { v= xin; t= 'x'; }
            else if (i==1) { v= yin; t= 'y'; }
            else           { v= zin; t= 'z'; }
            switch(crs.axis[i]) {
            case 'e':
                point[t]= v;
                break;
            case 'w':
                point[t]= -v;
                break;
            case 'n':
                point[t]= v;
                break;
            case 's':
                point[t]= -v;
                break;
            case 'u':
                if (point[t]!==undefined) { point.z= v; }
                break;
            case 'd':
                if (point[t]!==undefined) { point.z= -v; }
                break;
            default :
                alert("ERROR: unknow axis ("+crs.axis[i]+") - check definition of "+crs.projName);
                return null;
            }
        }
        return point;
    },

    /**
     * Function: reportError
     * An internal method to report errors back to user.
     * Override this in applications to report error messages or throw exceptions.
     */
    reportError: function(msg) {
		//console.log(msg);
    },

	PrimeMeridian : {
		"greenwich": 0.0,               //"0dE",
		"lisbon":     -9.131906111111,   //"9d07'54.862\"W",
		"paris":       2.337229166667,   //"2d20'14.025\"E",
		"bogota":    -74.080916666667,  //"74d04'51.3\"W",
		"madrid":     -3.687938888889,  //"3d41'16.58\"W",
		"rome":       12.452333333333,  //"12d27'8.4\"E",
		"bern":        7.439583333333,  //"7d26'22.5\"E",
		"jakarta":   106.807719444444,  //"106d48'27.79\"E",
		"ferro":     -17.666666666667,  //"17d40'W",
		"brussels":    4.367975,        //"4d22'4.71\"E",
		"stockholm":  18.058277777778,  //"18d3'29.8\"E",
		"athens":     23.7163375,       //"23d42'58.815\"E",
		"oslo":       10.722916666667   //"10d43'22.5\"E"
	},
	Ellipsoid : {
		"MERIT": {
			a:6378137.0,
			rf:298.257,
			ellipseName:"MERIT 1983"
		},
		"SGS85": {
			a:6378136.0,
			rf:298.257,
			ellipseName:"Soviet Geodetic System 85"
		},
		"GRS80": {
			a:6378137.0,
			rf:298.257222101,
			ellipseName:"GRS 1980(IUGG, 1980)"
		},
		"IAU76": {
			a:6378140.0,
			rf:298.257,
			ellipseName:"IAU 1976"
		},
		"airy": {
			a:6377563.396,
			b:6356256.910,
			ellipseName:"Airy 1830"
		},
		"APL4.": {
			a:6378137,
			rf:298.25,
			ellipseName:"Appl. Physics. 1965"
		},
		"NWL9D": {
			a:6378145.0,
			rf:298.25,
			ellipseName:"Naval Weapons Lab., 1965"
		},
		"mod_airy": {
			a:6377340.189,
			b:6356034.446,
			ellipseName:"Modified Airy"
		},
		"andrae": {
			a:6377104.43,
			rf:300.0,
			ellipseName:"Andrae 1876 (Den., Iclnd.)"
		},
		"aust_SA": {
			a:6378160.0,
			rf:298.25,
			ellipseName:"Australian Natl & S. Amer. 1969"
		},
		"GRS67": {
			a:6378160.0,
			rf:298.2471674270,
			ellipseName:"GRS 67(IUGG 1967)"
		},
		"bessel": {
			a:6377397.155,
			rf:299.1528128,
			ellipseName:"Bessel 1841"
		},
		"bess_nam": {
			a:6377483.865,
			rf:299.1528128,
			ellipseName:"Bessel 1841 (Namibia)"
		},
		"clrk66": {
			a:6378206.4,
			b:6356583.8,
			ellipseName:"Clarke 1866"
		},
		"clrk80": {
			a:6378249.145,
			rf:293.4663,
			ellipseName:"Clarke 1880 mod."
		},
		"CPM": {
			a:6375738.7,
			rf:334.29,
			ellipseName:"Comm. des Poids et Mesures 1799"
		},
		"delmbr": {
			a:6376428.0,
			rf:311.5,
			ellipseName:"Delambre 1810 (Belgium)"
		},
		"engelis": {
			a:6378136.05,
			rf:298.2566,
			ellipseName:"Engelis 1985"
		},
		"evrst30": {
			a:6377276.345,
			rf:300.8017,
			ellipseName:"Everest 1830"
		},
		"evrst48": {
			a:6377304.063,
			rf:300.8017,
			ellipseName:"Everest 1948"
		},
		"evrst56": {
			a:6377301.243,
			rf:300.8017,
			ellipseName:"Everest 1956"
		},
		"evrst69": {
			a:6377295.664,
			rf:300.8017,
			ellipseName:"Everest 1969"
		},
		"evrstSS": {
			a:6377298.556,
			rf:300.8017,
			ellipseName:"Everest (Sabah & Sarawak)"
		},
		"fschr60": {
			a:6378166.0,
			rf:298.3,
			ellipseName:"Fischer (Mercury Datum) 1960"
		},
		"fschr60m": {
			a:6378155.0,
			rf:298.3,
			ellipseName:"Fischer 1960"
		},
		"fschr68": {
			a:6378150.0,
			rf:298.3,
			ellipseName:"Fischer 1968"
		},
		"helmert": {
			a:6378200.0,
			rf:298.3,
			ellipseName:"Helmert 1906"
		},
		"hough": {
			a:6378270.0,
			rf:297.0,
			ellipseName:"Hough"
		},
		"intl": {
			a:6378388.0,
			rf:297.0,
			ellipseName:"International 1909 (Hayford)"
		},
		"kaula": {
			a:6378163.0,
			rf:298.24,
			ellipseName:"Kaula 1961"
		},
		"lerch": {
			a:6378139.0,
			rf:298.257,
			ellipseName:"Lerch 1979"
		},
		"mprts": {
			a:6397300.0,
			rf:191.0,
			ellipseName:"Maupertius 1738"
		},
		"new_intl": {
			a:6378157.5,
			b:6356772.2,
			ellipseName:"New International 1967"
		},
		"plessis": {
			a:6376523.0,
			rf:6355863.0,
			ellipseName:"Plessis 1817 (France)"
		},
		"krass": {
			a:6378245.0,
			rf:298.3,
			ellipseName:"Krassovsky, 1942"
		},
		"SEasia": {
			a:6378155.0,
			b:6356773.3205,
			ellipseName:"Southeast Asia"
		},
		"walbeck": {
			a:6376896.0,
			b:6355834.8467,
			ellipseName:"Walbeck"
		},
		"WGS60": {
			a:6378165.0,
			rf:298.3,
			ellipseName:"WGS 60"
		},
		"WGS66": {
			a:6378145.0,
			rf:298.25,
			ellipseName:"WGS 66"
		},
		"WGS72": {
			a:6378135.0,
			rf:298.26,
			ellipseName:"WGS 72"
		},
		"WGS84": {
			a:6378137.0,
			rf:298.257223563,
			ellipseName:"WGS 84"
		},
		"sphere": {
			a:6370997.0,
			b:6370997.0,
			ellipseName:"Normal Sphere (r=6370997)"
		}
	},
	Datum : {
		"WGS84": {
			towgs84: "0,0,0",
			ellipse: "WGS84",
			datumName: "WGS84"
		},
		"GGRS87": {
			towgs84: "-199.87,74.79,246.62",
			ellipse: "GRS80",
			datumName: "Greek_Geodetic_Reference_System_1987"
		},
		"NAD83": {
			towgs84: "0,0,0",
			ellipse: "GRS80",
			datumName: "North_American_Datum_1983"
		},
		"NAD27": {
			nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
			ellipse: "clrk66",
			datumName: "North_American_Datum_1927"
		},
		"potsdam": {
			towgs84: "606.0,23.0,413.0",
			ellipse: "bessel",
			datumName: "Potsdam Rauenberg 1950 DHDN"
		},
		"carthage": {
			towgs84: "-263.0,6.0,431.0",
			ellipse: "clark80",
			datumName: "Carthage 1934 Tunisia"
		},
		"hermannskogel": {
			towgs84: "653.0,-212.0,449.0",
			ellipse: "bessel",
			datumName: "Hermannskogel"
		},
		"ire65": {
			towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
			ellipse: "mod_airy",
			datumName: "Ireland 1965"
		},
		"nzgd49": {
			towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
			ellipse: "intl",
			datumName: "New Zealand Geodetic Datum 1949"
		},
		"OSGB36": {
			towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
			ellipse: "airy",
			datumName: "Airy 1830"
		}
	}
};
