"use strict";

// TODO: this whole file needs to be basically done from scratch,
// as it no longer serves the same purpose: it used to be responsible
// for creating bundles, but its future task will (most likely) be 
// confined to Jade and Stylus.

var gulp = require('gulp');
var gutil = require('gulp-util');
//var concat = require('gulp-concat');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var stylus_itself = require('stylus');
var browserify = require('browserify');
var shim = require('browserify-shim');
var rjs = require('requirejs');
var prefix = require('gulp-autoprefixer');
//var urequire = require('urequire');
var path = require('path');
var stream = require('stream');
var through = require('through2');
var source = require('vinyl-source-stream');
var _ = require('underscore');

// DEAD CODE, FOR REFERENCE ------------------------------------------------------

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

//---- END of dead code -------------------------------

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

function bundleTask(name, options) {

  var task_name = name + '-browserify';
  var options = options || {};
  
  //var module_path = name.indexOf('/') >= 0 ? name : name + '/' + name; // TODO: replace with name + '/main' ?
  //if (path.extname(module_path) !== '.js') module_path += '.js';
  var module_path = name + '.js';
  
  console.log('bundleTask()', path.join('./dist/', module_path) );
  
  gulp.task(task_name, [], function() {

    return browserify('./'+module_path)
      .require('./'+module_path, {expose: name})
      // .exclude('knockout')
      // .exclude('knockout-mapping')
      // .exclude('underscore')
      .bundle() // { standalone: 'gpc.kowidgets.TreeView' })
      .pipe( source(path.basename(module_path)) )
      .pipe( gulp.dest( path.join('./dist/') ) );
  });

  return task_name;
}

// TODO: replace with a "style" task that also handles assets ?

function stylusTask(name) {

  gulp.task(name+'-stylus', [], function() {
    return gulp.src('./lib/'+name+'/*.styl')
      .pipe( stylus({ url: stylus_itself.url() }) )
      .pipe( prefix('last 20 versions', 'ie 8', 'ie 9') )
      .pipe( gulp.dest('./generated/'+name+'/') );      
  });
}

/* Defines a task tree that builds a widget bundle.
 */
function widgetBundle(name, abbr) {

  /* Translate Jade template files into a string dictionary.
   */
  gulp.task(name+'-jade', [], function() {

    return gulp.src( ['./lib/'+name+'/*.jade'] )
      .pipe( jade({ pretty: true }) )
      .pipe( assembler('templates.js', {prefix: abbr}) )
      .pipe( gulp.dest('./generated/'+name+'/') );    
  });

  //bundleTask(name);

  stylusTask(name);

  gulp.task(name+'-copy', [], function() {

    return gulp.src( ['./lib/'+name+'/**/*.png'] )
      .pipe( gulp.dest('./dist/'+name+'/') );
  });

  gulp.task('widget-'+name, [name+'-jade', /*name+'-browserify',*/ name+'-stylus', name+'-copy']);
  
  return 'widget-'+name;
}

gulp.task('build', [
  widgetBundle('treeview', 'gktv'), 
  widgetBundle('sketchpad', 'gksp'), 
  widgetBundle('commandpanel', 'gkcp')
  //bundleTask('util/keyboard')
]);

// DEFAULT TASK / WATCHES -----------------------

gulp.task('default', ['build'], function() {
  gulp.watch(['./**.js', './lib/**.*'], ['build']);
});
