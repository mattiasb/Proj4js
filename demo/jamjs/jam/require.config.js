var jam = {
    "packages": [
        {
            "name": "proj4js",
            "location": "jam/proj4js",
            "main": "dist/proj4js.amd.js"
        }
    ],
    "version": "0.2.8",
    "shim": {}
};

if (typeof require !== "undefined" && require.config) {
    require.config({packages: jam.packages, shim: jam.shim});
}
else {
    var require = {packages: jam.packages, shim: jam.shim};
}

if (typeof exports !== "undefined" && typeof module !== "undefined") {
    module.exports = jam;
}