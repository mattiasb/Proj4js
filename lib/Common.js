
Proj4js.common = {
	PI : 3.141592653589793238, //Math.PI,
	HALF_PI : 1.570796326794896619, //Math.PI*0.5,
	TWO_PI : 6.283185307179586477, //Math.PI*2,
	FORTPI : 0.78539816339744833,
	R2D : 57.29577951308232088,
	D2R : 0.01745329251994329577,
	SEC_TO_RAD : 4.84813681109535993589914102357e-6, /* SEC_TO_RAD = Pi/180/3600 */
	EPSLN : 1.0e-10,
	MAX_ITER : 20,
	// following constants from geocent.c
	COS_67P5 : 0.38268343236508977,  /* cosine of 67.5 degrees */
	AD_C : 1.0026000,                /* Toms region 1 constant */

	/* datum_type values */
	PJD_UNKNOWN  : 0,
	PJD_3PARAM   : 1,
	PJD_7PARAM   : 2,
	PJD_GRIDSHIFT: 3,
	PJD_WGS84    : 4,   // WGS84 or equivalent
	PJD_NODATUM  : 5,   // WGS84 or equivalent
	SRS_WGS84_SEMIMAJOR : 6378137.0,  // only used in grid shift transforms

	// ellipoid pj_set_ell.c
	SIXTH : .1666666666666666667, /* 1/6 */
	RA4   : .04722222222222222222, /* 17/360 */
	RA6   : .02215608465608465608, /* 67/3024 */
	RV4   : .06944444444444444444, /* 5/72 */
	RV6   : .04243827160493827160, /* 55/1296 */

	// Function to compute the constant small m which is the radius of
	//   a parallel of latitude, phi, divided by the semimajor axis.
	// -----------------------------------------------------------------
	msfnz : function(eccent, sinphi, cosphi) {
		var con = eccent * sinphi;
		return cosphi/(Math.sqrt(1.0 - con * con));
	},

	// Function to compute the constant small t for use in the forward
	//   computations in the Lambert Conformal Conic and the Polar
	//   Stereographic projections.
	// -----------------------------------------------------------------
	tsfnz : function(eccent, phi, sinphi) {
		var con = eccent * sinphi;
		var com = .5 * eccent;
		con = Math.pow(((1.0 - con) / (1.0 + con)), com);
		return (Math.tan(.5 * (this.HALF_PI - phi))/con);
	},

	// Function to compute the latitude angle, phi2, for the inverse of the
	//   Lambert Conformal Conic and Polar Stereographic projections.
	// ----------------------------------------------------------------
	phi2z : function(eccent, ts) {
		var eccnth = .5 * eccent;
		var con, dphi;
		var phi = this.HALF_PI - 2 * Math.atan(ts);
		for (var i = 0; i <= 15; i++) {
			con = eccent * Math.sin(phi);
			dphi = this.HALF_PI - 2 * Math.atan(ts *(Math.pow(((1.0 - con)/(1.0 + con)),eccnth))) - phi;
			phi += dphi;
			if (Math.abs(dphi) <= .0000000001) return phi;
		}
		alert("phi2z has NoConvergence");
		return (-9999);
	},

	/* Function to compute constant small q which is the radius of a
	 parallel of latitude, phi, divided by the semimajor axis.
	 ------------------------------------------------------------*/
	qsfnz : function(eccent,sinphi) {
		var con;
		if (eccent > 1.0e-7) {
			con = eccent * sinphi;
			return (( 1.0- eccent * eccent) * (sinphi /(1.0 - con * con) - (.5/eccent)*Math.log((1.0 - con)/(1.0 + con))));
		} else {
			return(2.0 * sinphi);
		}
	},

	/* Function to eliminate roundoff errors in asin
	 ----------------------------------------------*/
	asinz : function(x) {
		if (Math.abs(x)>1.0) {
			x=(x>1.0)?1.0:-1.0;
		}
		return Math.asin(x);
	},

	// following functions from gctpc cproj.c for transverse mercator projections
	e0fn : function(x) {return(1.0-0.25*x*(1.0+x/16.0*(3.0+1.25*x)));},
	e1fn : function(x) {return(0.375*x*(1.0+0.25*x*(1.0+0.46875*x)));},
	e2fn : function(x) {return(0.05859375*x*x*(1.0+0.75*x));},
	e3fn : function(x) {return(x*x*x*(35.0/3072.0));},
	mlfn : function(e0,e1,e2,e3,phi) {return(e0*phi-e1*Math.sin(2.0*phi)+e2*Math.sin(4.0*phi)-e3*Math.sin(6.0*phi));},

	srat : function(esinp, exp) {
		return(Math.pow((1.0-esinp)/(1.0+esinp), exp));
	},

	// Function to return the sign of an argument
	sign : function(x) { if (x < 0.0) return(-1); else return(1);},

	// Function to adjust longitude to -180 to 180; input in radians
	adjust_lon : function(x) {
		x = (Math.abs(x) < this.PI) ? x: (x - (this.sign(x)*this.TWO_PI) );
		return x;
	},

	// IGNF - DGR : algorithms used by IGN France

	// Function to adjust latitude to -90 to 90; input in radians
	adjust_lat : function(x) {
		x= (Math.abs(x) < this.HALF_PI) ? x: (x - (this.sign(x)*this.PI) );
		return x;
	},

	// Latitude Isometrique - close to tsfnz ...
	latiso : function(eccent, phi, sinphi) {
		if (Math.abs(phi) > this.HALF_PI) return +Number.NaN;
		if (phi==this.HALF_PI) return Number.POSITIVE_INFINITY;
		if (phi==-1.0*this.HALF_PI) return -1.0*Number.POSITIVE_INFINITY;

		var con= eccent*sinphi;
		return Math.log(Math.tan((this.HALF_PI+phi)/2.0))+eccent*Math.log((1.0-con)/(1.0+con))/2.0;
	},

	fL : function(x,L) {
		return 2.0*Math.atan(x*Math.exp(L)) - this.HALF_PI;
	},

	// Inverse Latitude Isometrique - close to ph2z
	invlatiso : function(eccent, ts) {
		var phi= this.fL(1.0,ts);
		var Iphi= 0.0;
		var con= 0.0;
		do {
			Iphi= phi;
			con= eccent*Math.sin(Iphi);
			phi= this.fL(Math.exp(eccent*Math.log((1.0+con)/(1.0-con))/2.0),ts)
		} while (Math.abs(phi-Iphi)>1.0e-12);
		return phi;
	},

	// Needed for Gauss Schreiber
	// Original:  Denis Makarov (info@binarythings.com)
	// Web Site:  http://www.binarythings.com
	sinh : function(x)
	{
		var r= Math.exp(x);
		r= (r-1.0/r)/2.0;
		return r;
	},

	cosh : function(x)
	{
		var r= Math.exp(x);
		r= (r+1.0/r)/2.0;
		return r;
	},

	tanh : function(x)
	{
		var r= Math.exp(x);
		r= (r-1.0/r)/(r+1.0/r);
		return r;
	},

	asinh : function(x)
	{
		var s= (x>= 0? 1.0:-1.0);
		return s*(Math.log( Math.abs(x) + Math.sqrt(x*x+1.0) ));
	},

	acosh : function(x)
	{
		return 2.0*Math.log(Math.sqrt((x+1.0)/2.0) + Math.sqrt((x-1.0)/2.0));
	},

	atanh : function(x)
	{
		return Math.log((x-1.0)/(x+1.0))/2.0;
	},

	// Grande Normale
	gN : function(a,e,sinphi)
	{
		var temp= e*sinphi;
		return a/Math.sqrt(1.0 - temp*temp);
	},

	//code from the PROJ.4 pj_mlfn.c file;  this may be useful for other projections
	pj_enfn: function(es) {
		var en = new Array();
		en[0] = this.C00 - es * (this.C02 + es * (this.C04 + es * (this.C06 + es * this.C08)));
		en[1] = es * (this.C22 - es * (this.C04 + es * (this.C06 + es * this.C08)));
		var t = es * es;
		en[2] = t * (this.C44 - es * (this.C46 + es * this.C48));
		t *= es;
		en[3] = t * (this.C66 - es * this.C68);
		en[4] = t * es * this.C88;
		return en;
	},

	pj_mlfn: function(phi, sphi, cphi, en) {
		cphi *= sphi;
		sphi *= sphi;
		return(en[0] * phi - cphi * (en[1] + sphi*(en[2]+ sphi*(en[3] + sphi*en[4]))));
	},

	pj_inv_mlfn: function(arg, es, en) {
		var k = 1./(1.-es);
		var phi = arg;
		for (var i = Proj4js.common.MAX_ITER; i ; --i) { /* rarely goes over 2 iterations */
			var s = Math.sin(phi);
			var t = 1. - es * s * s;
			//t = this.pj_mlfn(phi, s, Math.cos(phi), en) - arg;
			//phi -= t * (t * Math.sqrt(t)) * k;
			t = (this.pj_mlfn(phi, s, Math.cos(phi), en) - arg) * (t * Math.sqrt(t)) * k;
			phi -= t;
			if (Math.abs(t) < Proj4js.common.EPSLN)
				return phi;
		}
		Proj4js.reportError("cass:pj_inv_mlfn: Convergence error");
		return phi;
	},

	/* meridinal distance for ellipsoid and inverse
	 **	8th degree - accurate to < 1e-5 meters when used in conjuction
	 **		with typical major axis values.
	 **	Inverse determines phi to EPS (1e-11) radians, about 1e-6 seconds.
	 */
	C00: 1.0,
	C02: .25,
	C04: .046875,
	C06: .01953125,
	C08: .01068115234375,
	C22: .75,
	C44: .46875,
	C46: .01302083333333333333,
	C48: .00712076822916666666,
	C66: .36458333333333333333,
	C68: .00569661458333333333,
	C88: .3076171875

};
