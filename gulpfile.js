"use strict";

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var shim = require('browserify-shim');
var rjs = require('requirejs');
var prefix = require('gulp-autoprefixer');
var urequire = require('urequire');
var path = require('path');
var stream = require('stream');
var through = require('through2');
var source = require('vinyl-source-stream');
var _ = require('underscore');

// CURRENTLY NOT IN USE, using shim settings in package.json instead:
var browserify_shim = {
  'knockout'        : { path: './modules/knockout/knockout-3.1.0.js', exports: 'ko' },
  'knockout-mapping': { path: './modules/knockout/knockout.mapping-latest.js', depends: { 'knockout': 'ko' }, exports: null },
}
      
// Adapted from Coffeescript code by Kevin Malakoff

function GulpURequire(options) {
  this.options = options || {};
  stream.Transform.call(this, {objectMode: true});
  this.files = [];
}

GulpURequire.prototype = new stream.Transform();

GulpURequire.prototype._transform = function(file, encoding, callback) {
  this.files.push(file);
  callback();
};

GulpURequire.prototype._flush = function(callback) {
  var self = this;
  urequire.compile(this.files, this.options, function(err, result) {
    if (err) return callback(err);
    
    self.push( new gutil.File({
      base: options.project_name, 
      path: process.cwd(),
      contents: new Buffer(result)
    }) );
    
    callback();
  });
};

var urequire = function(options) { return new GulpURequire(options); };

// "Assemble" HTML template files (produces a JSON stream)

function assembler(filename, options) {
  
  var stream = through.obj( function(file, enc, callback) {
    this.last_file = file;
    console.assert(file.isBuffer());
    var name = this.options.prefix + camelify(path.basename(file.path, '.html'));
    this.templates[name] = file.contents.toString();
    callback();
  }, function(callback) {
    // We put our templates into a new stream, which we assign to a new file
    var file = new gutil.File({
      base: this.last_file.base, 
      cwd: this.last_file.cwd, 
      path: path.join(this.last_file.base, filename),
      contents: new Buffer('module.exports = ' + JSON.stringify(this.templates, null, '  ')+';')
    });
    // On to the next stage!
    this.push(file);
    callback();
  });
  
  stream.options = options || {};
  stream.options.prefix = stream.options.prefix || '';
  
  stream.templates = {};
      
  return stream;

  function camelify(name) {
    return _.reduce(name.split('-'), function(result, part) { return result + part[0].toUpperCase()+part.slice(1); }, '');
  }

  function debugTap() {
    var stream = through.obj( function(file, enc, callback) {
      //console.log('file.path:', file.path);
      //console.log('file.base:', file.base);
      //console.log('file.cwd :', file.cwd );
      //console.log('file.contents:', file.contents);
      console.log( 'Name:', camelify(path.basename(file.path, '.html')) );
      this.push(file);
      callback();
    });
    return stream;
  }
}

// BUILD TASKS -----------------------------------------------

/* Take the Jade Knockout templates contained in src/treeview/templates and make them into a 
  require'able module returning a hash indexed by the template filenames 
  (without extension and "camelified").
 */
gulp.task('treeview-jade', [], function() {

  return gulp.src( ['./src/treeview/templates/*.jade'] )
    .pipe( jade({ pretty: true }) )
    .pipe( assembler('templates.js', {prefix: 'gktv'}) )
    .pipe( gulp.dest('./generated/treeview/') );    
      
});

gulp.task('sketchpad-jade', [], function() {

  return gulp.src( ['./src/sketchpad/templates/*.jade'] )
    .pipe( jade({ pretty: true }) )
    .pipe( assembler('templates.js', {prefix: 'gksp'}) )
    .pipe( gulp.dest('./generated/sketchpad/') );    
      
});

gulp.task('commandpanel-jade', [], function() {

  return gulp.src( ['./src/commandpanel/*.jade'] )
    .pipe( jade({ pretty: true }) )
    .pipe( assembler('templates.js', {prefix: 'gkcp'}) )
    .pipe( gulp.dest('./generated/commandpanel/') );    
      
});

gulp.task('templates', ['treeview-jade', 'sketchpad-jade', 'commandpanel-jade']);

gulp.task('copy', [], function() {

  return gulp.src( ['./src/**/*.png'] )
    .pipe( gulp.dest('./dist/') );
});

gulp.task('css', [], function() {

  return gulp.src('./src/**/*.styl')
    .pipe( stylus({}) )
    .pipe( prefix('last 20 versions', 'ie 8', 'ie 9') )
    .pipe( gulp.dest('./dist/') );
    
});

/** Create a standalone Javascript bundle, not including Knockout (or knockout-mapping).
    (package.json contains browserify-shim settings that make the bundle expect these
    libraries to be provided via script tags.)
 */
gulp.task('browserify-treeview', [], function() {

  return browserify({ entries: ['./src/treeview/treeview.js'] })
    .require('./src/treeview/treeview', {expose: 'treeview'})
    .exclude('knockout')
    .exclude('knockout-mapping')
    .bundle() // Use: { standalone: 'gpc.kowidgets.TreeView' } to use globals
    .pipe( source('treeview.js') )
    .pipe( gulp.dest('./dist/treeview/') );
    
});

gulp.task('browserify-sketchpad', [], function() {

  return browserify({ entries: ['./src/sketchpad/sketchpad.js'] })
    .require('./src/sketchpad/sketchpad', {expose: 'sketchpad'})
    .exclude('knockout')
    .exclude('knockout-mapping')
    .bundle()
    .pipe( source('sketchpad.js') )
    .pipe( gulp.dest('./dist/sketchpad/') );
    
});

gulp.task('browserify-commandpanel', [], function() {

  return browserify({ entries: ['./src/commandpanel/commandpanel.js'] })
    .require('./src/commandpanel/commandpanel', {expose: 'commandpanel'})
    .exclude('knockout')
    .exclude('knockout-mapping')
    .bundle()
    .pipe( source('commandpanel.js') )
    .pipe( gulp.dest('./dist/commandpanel/') );
    
});

gulp.task('browserify', ['browserify-treeview', 'browserify-sketchpad', 'browserify-commandpanel']);

gulp.task('requirejs', function(cb) {
  
  rjs.optimize({
    //appDir: 'src',
    // All paths are relative to this
    baseUrl: './src/treeview',
    paths: {
      'text': '../../node_modules/text/text',
      'knockout': '../../modules/knockout/knockout-3.0.0',
      'stringTemplateEngine': '../../modules/knockout/stringTemplateEngine'
    },
    shim: {
      'knockout': { exports: 'ko' }
    },
    // We wrap the bundled AMD modules in a sandwich that supports AMD, CommonJS and global namespace
    // TODO: have this generated by a helper function (using underscore templates ?) instead of using files ?
    wrap: { startFile: 'build/wrap_start.js', endFile: 'build/wrap_end.js' },
    // Uglification type
    optimize: 'none',
    // Almond, the "shim" AMD loader comes first
    name: '../../node_modules/almond/almond',
    // Then come our modules
    include: ['treeview'],
    exclude: ['knockout'],
    // Now to specify the output file
    out: './dist/treeview/treeview.js' // TODO: use main.js instead ?
  }, function(buildResponse) {
    console.log('RequireJS optimizer says:', buildResponse);
    cb();
  });

});

gulp.task('build', ['templates', 'copy', 'browserify', 'css'] );

// TEST HARNESS -------------------------------

gulp.task('jade-test', ['build'], function() {

  return gulp.src('test/test.jade')
    .pipe( jade({ pretty: true }) )
    .pipe( gulp.dest('./testbed/') );    
});

gulp.task('css-test', [], function() {

  return gulp.src('./test/**/*.styl')
    .pipe( stylus({}) )
    .pipe( prefix('last 20 versions', 'ie 8', 'ie 9') )
    .pipe( gulp.dest('./testbed/') );
    
});

gulp.task('browserify-test', [], function() {

  return browserify({
      entries: ['./test/main.js'],
      debug: true
    })
    .external('treeview')
    .external('sketchpad')
    .external('commandpanel')
    .bundle()
    .pipe( source('main.js') )
    .pipe( gulp.dest('./testbed/') );
    
});

gulp.task('copy-test', function() {

  return gulp.src( ['./test/*.js', './test/data/**/*'], { base: './test/' } )
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
    .pipe( gulp.dest('./testbed/scripts/gpc/kowidgets/') );
});

gulp.task('build-test', ['build'], function() {
  return gulp.start( 'jade-test', 'css-test', /*'browserify-test'*/ 'copy-test', 'copy-modules-test', 'copy-node_modules-test', 'copy-dist-test' );
});

gulp.task('test', ['build-test']);

gulp.task('watch-test', function() {
  gulp.watch(['test/**/*'], ['build-test']);
});

// DEFAULT TASK / WATCHES -----------------------

gulp.task('watch-all', function() {
  gulp.watch(['package.json', 'src/**/*', 'test/**/*', '!src/**/output/**/*'], ['build-test']);
});

gulp.task('default', ['build-test', 'watch-all']);