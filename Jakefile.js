var $ = require('fquery');

// TODO: Factor out into build settings file
var files = ['Proj4js.js'
			 , 'Class.js'
			 , 'Common.js'
			 , 'Point.js'
			 , 'Datum.js'
			 , 'Proj.js'
			 , 'projCode/*.js'
			];

task('default', ['build:all']);

desc('Check source for errors with JSHint');
task('jshint', [], function(){
	console.log("jshint checking not added yet");
});

namespace('build', function(){

	desc('Build all');
	task('all', [  'build:browser'
				 , 'build:commonjs'
				 , 'build:AMD'
				]);

	desc('Build a classic browser-global version for use without a '
		 + 'module loader.');
	task('browser', ['jshint'], function(){
		compile()
			.write($.OVERWRITE, 'dist/proj4js.js')
			.uglifyjs()
			.wrap(license())
			.write($.OVERWRITE, 'dist/proj4js.min.js');
	});

	desc('Build a commonjs module for use in for example node.js');
	task('commonjs', ['jshint'], function(){
		compile()
			.wrap('', 'module.exports = Proj4js;')
			.write($.OVERWRITE, 'dist/proj4js.commonjs.js');

	});

	desc('Build an AMD module to be loaded by for example require.js).');
	task('AMD', ['jshint'], function(){
		compile()
			.wrap('define(function () {'
				  ,'return Proj4js; });')
			.write($.OVERWRITE, 'dist/proj4js.amd.js');
	});
});

// Helpers

function compile(){
	return $('lib:' + files.join(", ")).concat(';');
}

function license(){
	return $('LICENSE')
		.wrap('/*\n','\n*/')
		.content();
}