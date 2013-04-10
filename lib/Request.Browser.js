/*
Author:       Mattias Bengtsson mattias.bengtsson@kartena.se
License:      MIT as per: ../LICENSE
*/

/** XmlHttpRequest (XHR) GET command . 
 *  The url is expected to be local or support 
 *  Cross-Origin Resource Sharing (CORS). 
 *  If the source can't handle CORS one can always set up a proxy
 *  or use a public service (like http://www.corsproxy.com/)'
 * 
 * Parameters:
 * - url  {string} the url to send the request to
 * - cb   {function} a callback that acts on data or error from request.
 */
Proj4js.get = function (url, cb) {
	var xhr = new XMLHttpRequest(),
		err,
		onError = function () {
            cb && cb("Failed to load resource");
        },
		onLoad = function () {
            cb && cb(undefined, xhr.responseText);
        };
	xhr._url = url;
	if ("withCredentials" in xhr) {
		// XHR for Chrome/Firefox/Opera/Safari.
		xhr.onreadystatechange = function () {
			if (this.readyState == 4) { 
				if(this.status != 200) {
					onError();
				} else {
					onLoad();
				}
			}
		};
	} else if (typeof XDomainRequest != "undefined") {
		// XDomainRequest for IE.
		xhr = new XDomainRequest();
		xhr.onload = onLoad;
		xhr.onerror = onError;
	} else {
		// CORS not supported.
		err = "Failed to construct a CORS request. Are your browser too old?";
		Proj4js.reportError(err);
		cb && cb(err);
		return;
	}
	xhr.ontimeout = onError;
	xhr.open("GET", url, true);
	xhr.send();
};