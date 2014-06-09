"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var shim = require('browserify-shim');
var prefix = require('gulp-autoprefixer');
var path = require('path');
var _ = require('underscore');
var source = require('vinyl-source-stream');
var nib = require('nib');

// BUILD TASKS -----------------------------------------------

gulp.task('jade', [], function() {

  return gulp.src('./test.jade')
    .pipe( jade({ pretty: true }) )
    .pipe( gulp.dest('./output/') );    
});

gulp.task('css', [], function() {

  return gulp.src('./test.styl')
    .pipe( stylus({ use: [nib()], errors: true }) )
    .pipe( prefix('last 20 versions', 'ie 8', 'ie 9') )
    .pipe( gulp.dest('./output/') );
    
});

gulp.task('browserify', [], function() {

  return browserify({
      entries: ['./main.js'],
      debug: true
    })
    // The "external" modules must be included manually (external script elements)
    //.external('treeview')
    //.external('sketchpad')
    //.external('commandpanel')
    .bundle({pretty:true})
    .pipe( source('main.js') )
    .pipe( gulp.dest('./output/') );
    
});

gulp.task('copy', function() {

  return gulp.src( [ /*'./*.js',*/ './data/**/*'], { base: './' } )
    .pipe( gulp.dest('./output/') );
});

gulp.task('copy-modules', function() {

  return gulp.src( './modules/**/*.js', { base: './modules/' } )
    .pipe( gulp.dest('./output/scripts/') );
});

gulp.task('copy-node_modules', function() {

  return gulp.src( './node_modules/underscore/*.js', { base: './node_modules/' } )
    .pipe( gulp.dest('./output/scripts/') );
});

gulp.task('copy-dist', [], function() {

  return gulp.src( ['../dist/**/*.js', '../dist/**/*.css', '../dist/**/*.png'], { base: '../dist/' } )
    .pipe( gulp.dest('./output/scripts/gpc/kowidgets/') );
});

gulp.task('build', ['jade', 'css', 'browserify', 'copy', 'copy-modules', 'copy-node_modules', 'copy-dist']);

// DEFAULT TASK / WATCHES -----------------------

gulp.task('default', ['build'], function() {
  gulp.watch(['./**/*'], ['build']);
});
