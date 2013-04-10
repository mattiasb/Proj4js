var $ = require('fquery');

// TODO: Factor out into build settings file
var defaultFiles = [  'Proj4js.js'
					, 'Class.js'
					, 'Common.js'
					, 'Point.js'
					, 'Datum.js'
					, 'Proj.js'
					, 'projCode/*.js'
				   ];

// Helpers

var license = $('LICENSE')
		.wrap('/*\n','*/')
		.content();

function compile (files) {
	var all = Array.isArray(files)
			? defaultFiles.concat(files)
			: defaultFiles;
	return $('lib:' + all.join(", "))
		.concat('\n\n');
}

////// Tasks

task('default', ['build:all']);

desc('Check source for errors with JSHint');
task('jshint', [], function () {
	console.log("jshint checking not added yet");
});

namespace('build', function () {

	desc('Build all');
	task('all', [  'build:browser'
				 , 'build:commonjs'
				 , 'build:AMD'
				]);

	desc('Build a classic browser-global version for use without a '
		 + 'module loader.');
	task('browser', ['jshint'], function () {
		compile(["NoConflict.js","Request.Browser.js"])
			.wrap(license + "\n\n(function(){\n\n",
				 "\n\n})();")
			.write($.OVERWRITE, 'dist/proj4js.js')
			.uglifyjs()
			.write($.OVERWRITE, 'dist/proj4js.min.js');
	});

	desc('Build a commonjs module for use in the browser');
	task('commonjs', ['jshint'], function () {
		compile("Request.Browser.js")
			.wrap(license, '\n\n' + 'module.exports = Proj4js;')
			.write($.OVERWRITE, 'dist/proj4js.commonjs.js');
	});

	desc('Build a commonjs module for use in Node.js');
	task('node', ['jshint'], function () {
		compile()
			.wrap(license, '\n\n' + 'module.exports = Proj4js;')
			.write($.OVERWRITE, 'dist/proj4js.node.js');
	});

	desc('Build an AMD module to be loaded by for example require.js).');
	task('AMD', ['jshint'], function () {
		compile("Request.Browser.js")
			.wrap('define(function () {'
				  ,'return Proj4js; });')
			.wrap(license)
			.write($.OVERWRITE, 'dist/proj4js.amd.js');
	});
});
