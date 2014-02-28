"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
//var stylus = require('gulp-stylus');
//var browserify = require('gulp-browserify');
var rjs = require('requirejs');

var browserify_shims = {
	// jQuery attaches itself to the window as '$' so we assign the exports accordingly
	jquery: { path: './bower_components/jquery/dist/jquery.min.js', exports: '$' },
	'jquery-ui': { path: './bower_components/jquery-ui/ui/jquery-ui.js', depends: { jquery: '$' }, exports: null },
  //'jade'      : { path: './bower_components/jade/bin/jade.js', exports: 'jade' },
  'knockout': { path: './components/knockout-3.0.0.js', exports: 'ko' },
  'knockout-mapping'  : { path: './components/knockout.mapping-latest.js', exports: 'ko.mapping' },
};

// BUILD TASKS ----------------------------------

gulp.task('copy-templates', [], function() {

  return gulp.src( './src/treeview/templates.include.jade' )
    .pipe( gulp.dest('./dist/treeview/') );
});

gulp.task('stylus', [], function() {

  return gulp.src('src/client/style.styl')
    .pipe( stylus({}) )
    .pipe( gulp.dest('./build/client/') );
    
});

gulp.task('requirejs', function(cb) {
  
  rjs.optimize({
    //appDir: 'src',
    baseUrl: './',
    paths: {
      //app: '../app'
      'underscore': './node_modules/underscore/underscore-min'
    },
    name: './src/treeview/treeview.js',
    out: 'dist/treeview/javascript/treeview.js',
    shim: {
      'underscore': { exports: '_' }
    }
    /*
    modules: [
      //First set up the common build layer.
      {
        name: 'treeview/treeview.js',
        include: [
          //'jquery',
          //'app/lib',
          //'app/controller/Base',
          //'app/model/Base'
        ]
      }
    ]
    */
  }, function(buildResponse) {
    console.log('requirejs response', buildResponse);
    cb();
  }, cb);

});

gulp.task('build', ['copy-templates', 'requirejs'] ); // TODO: add Stylus, others

// TEST HARNESS -------------------------------

gulp.task('test-jade', ['copy-templates'], function() {

  return gulp.src('test/test.jade')
    .pipe( jade({ pretty: true }) )
    .pipe( gulp.dest('./testbed/') );    
});

gulp.task('test-copy', function() {

  return gulp.src( 'scripts/**/*.js' )
    .pipe( gulp.dest('./testbed/scripts/') );
});

gulp.task('test-build', ['build'], function() {
  return gulp.start( 'test-jade', 'test-copy' );
});

gulp.task('test', ['test-build']);

// DEFAULT TASK ---------------------------------

gulp.task('default', ['build']); //, 'watch']);