"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
//var browserify = require('gulp-browserify');
var rjs = require('requirejs');
var prefix = require('gulp-autoprefixer');

var browserify_shims = {
	// jQuery attaches itself to the window as '$' so we assign the exports accordingly
	jquery: { path: './bower_components/jquery/dist/jquery.min.js', exports: '$' },
	'jquery-ui': { path: './bower_components/jquery-ui/ui/jquery-ui.js', depends: { jquery: '$' }, exports: null },
  //'jade'      : { path: './bower_components/jade/bin/jade.js', exports: 'jade' },
  'knockout': { path: './components/knockout-3.0.0.js', exports: 'ko' },
  'knockout-mapping'  : { path: './components/knockout.mapping-latest.js', exports: 'ko.mapping' },
};

// BUILD TASKS ----------------------------------

gulp.task('copy', [], function() {

  return gulp.src( ['./src/treeview/templates.include.jade', './src/treeview/**/*.png'] )
    .pipe( gulp.dest('./dist/treeview/') );
});

gulp.task('css', [], function() {

  return gulp.src('./src/treeview/treeview.styl')
    .pipe( stylus({}) )
    .pipe( prefix('last 20 versions', 'ie 8', 'ie 9') )
    .pipe( gulp.dest('./dist/treeview/') );
    
});

gulp.task('requirejs', function(cb) {
  
  rjs.optimize({
    //appDir: 'src',
    // All paths are relative to this
    baseUrl: './src/treeview',
    // We wrap the bundled AMD modules in a sandwich that supports AMD, CommonJS and global namespace
    // TODO: have this generated by a helper function (using underscore templates ?) instead of using files ?
    wrap: { startFile: 'build/wrap_start.js', endFile: 'build/wrap_end.js' },
    // Uglification type
    optimize: 'none',
    // Almond, the "shim" AMD loader comes first
    name: '../../node_modules/almond/almond',
    // Then come our modules
    include: ['treeview'],
    // Now to specify the output file
    out: './dist/treeview/treeview.js' // TODO: use main.js instead ?
  }, function(buildResponse) {
    console.log('RequireJS optimizer says:', buildResponse);
    cb();
  });

});

gulp.task('build', ['copy', 'requirejs', 'css'] );

// TEST HARNESS -------------------------------

gulp.task('jade-test', ['build'], function() {

  return gulp.src('test/test.jade')
    .pipe( jade({ pretty: false }) )
    .pipe( gulp.dest('./testbed/') );    
});

gulp.task('copy-modules-test', function() {

  return gulp.src( './modules/**/*.js', { base: './modules/' } )
    .pipe( gulp.dest('./testbed/scripts/') );
});

gulp.task('copy-node_modules-test', function() {

  return gulp.src( './node_modules/underscore/*.js', { base: './node_modules/' } )
    .pipe( gulp.dest('./testbed/scripts/') );
});

gulp.task('copy-dist-test', ['build'], function() {

  return gulp.src( ['./dist/**/*.js', './dist/**/*.css', './dist/**/*.png'], { base: './dist/' } )
    .pipe( gulp.dest('./testbed/scripts/gpc/ko_widgets/') );
});

gulp.task('build-test', ['build'], function() {
  return gulp.start( 'jade-test', 'copy-modules-test', 'copy-node_modules-test', 'copy-dist-test' );
});

gulp.task('test', ['build-test']);

gulp.task('watch-test', function() {
  gulp.watch(['test/**/*'], ['build-test']);
});

// DEFAULT TASK / WATCHES -----------------------

gulp.task('watch-all', function() {
  gulp.watch(['src/**/*', 'test/**/*'], ['build-test']);
});

gulp.task('default', ['build-test', 'watch-all']);