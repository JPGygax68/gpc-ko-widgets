"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
//var stylus = require('gulp-stylus');
//var browserify = require('gulp-browserify');

var browserify_shims = {
	// jQuery attaches itself to the window as '$' so we assign the exports accordingly
	jquery: { path: './bower_components/jquery/dist/jquery.min.js', exports: '$' },
	'jquery-ui': { path: './bower_components/jquery-ui/ui/jquery-ui.js', depends: { jquery: '$' }, exports: null },
  //'jade'      : { path: './bower_components/jade/bin/jade.js', exports: 'jade' },
  'knockout': { path: './components/knockout-3.0.0.js', exports: 'ko' },
  'knockout-mapping'  : { path: './components/knockout.mapping-latest.js', exports: 'ko.mapping' },
};

gulp.task('ko-templates', [], function() {

  gulp.src( './src/treeview/templates.include.jade' )
    .pipe( gulp.dest('./dist/treeview/') );
});

gulp.task('stylus', [], function() {

  gulp.src('src/client/style.styl')
    .pipe( stylus({}) )
    .pipe( gulp.dest('./build/client/') );
    
});

gulp.task('browserify', [], function() {

  gulp.src( 'src/client/main.js' )
    .pipe( browserify({
      shim: browserify_shims,
      transform: ['jadeify'],
      insertGlobals: false,
      detectGlobals: false,
      debug: !gutil.env.production
    }) )
    .pipe( concat('client.js') )
    .pipe( gulp.dest('./build/client/') );
    
});

gulp.task('build', ['ko-templates']);

gulp.task('test', function() {

  gulp.src('test/test.jade')
    .pipe( jade({ pretty: true }) )
    .pipe( gulp.dest('./testbed/') );    

  gulp.src( 'scripts/**/*.js' )
    .pipe( gulp.dest('./testbed/scripts/') );
});

gulp.task('default', ['build']); //, 'watch']);