var $ = require('fquery');

task('default', ['build:all']);

desc('Check source for errors with JSHint');
task('jshint', [], function(){
	console.log("jshint: Not implemented.");
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
		var license = $('LICENSE')
			.wrap('/*\n','\n*/')
			.content();

		$('lib: proj4js.js, projCode/*.js')
			.concat(';')
			.write($.OVERWRITE, 'dist/proj4js.js')
			.uglifyjs()
			.wrap(license)
			.write($.OVERWRITE, 'dist/proj4js.min.js');
	});

	desc('Build a commonjs module for use in for example node.js');
	task('commonjs', ['jshint'], function(){
		$('lib: proj4js.js, projCode/*.js')
			.concat(';')
			.wrap('', 'module.exports = Proj4js;')
			.write($.OVERWRITE, 'dist/proj4js.commonjs.js');

	});

	desc('Build an AMD module to be loaded by an AMD-loader'
	   + ' (for example require.js).');
	task('AMD', ['jshint'], function(){
		$('lib: proj4js.js, projCode/*.js')
			.concat(';')
			.wrap('define(function () {'
				  ,'return Proj4js; });')
			.write($.OVERWRITE, 'dist/proj4js.amd.js');
	});
});
