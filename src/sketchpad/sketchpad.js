"use strict";

// A few constants -------------------------------------------------

var DEFAULT_MARGIN = 5;

var VERTEX_HANDLE_WIDTH  = 6;
var VERTEX_HANDLE_HEIGHT = VERTEX_HANDLE_WIDTH;

// Required modules ------------------------------------------------

var ko = require('knockout');

require('../util/stringTemplateEngine');

var templates = require('../../temp/sketchpad/templates')
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_SKETCHPAD_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['HAS_SKETCHPAD_TEMPLATES'] = 'YES';
}

// Graphical object classes ----------------------------------------

/* This is the abstract base class.
 */
function GObject(options) {

  this.options = options || {};
  this.x = this.options.x || 0;
  this.y = this.options.y || 0;  
  
  this._owner = null; // this must be set when adding the object to the SketchPad's "objects" array
}

function Image(options) {

  GObject.call(this, options);
  
  this.img = document.createElement('img');
  //document.body.appendChild(this.img);
  this.img.src = options.url;  
  this.img.addEventListener('load', function() { 
    console.log('image loaded:', arguments); });
}

Image.prototype = new GObject();
Image.prototype.constructor = Image;

Image.prototype.draw = function(context) { 
  context.drawImage(this.img, this.x, this.y); };

// View Model used by the "designer" widget ------------------------

function SketchPad(width, height, options) {
  
  this.options = options || {};
  
  this.width  = ko.observable(width);
  this.height = ko.observable(height);
  
  this.margin = ko.observable(DEFAULT_MARGIN);

  this.objects = ko.observableArray();

  this._redraw_required = ko.observable();
    
  this.objects.subscribe( function(changes) {
    var redraw_flag = false;
    changes.forEach( function(change) {
      //change.index
      //change.status
      //change.value
      if (change.status === 'added') change.value._owner = this;
      redraw_flag = true;
    }, this);
    if (redraw_flag) {
      // TODO: replace this cheap-o temp implementation
      if (this.display_context) this.redraw();
      else this._redraw_required(true);
    }
  }, this, 'arrayChange');
}

// Attach graphical objects to constructor

SketchPad.Object = GObject; // no point in keeping the "G" prefix
SketchPad.Image  = Image;

SketchPad.prototype._drawObject = function(obj) {
  console.log('SketchPad::_drawObject()');
  
  var ctx = this.display_context;
  obj.draw(ctx);
};

SketchPad.prototype.redraw = function() {
  
  this.objects().forEach( function(obj) { this._drawObject(obj); }, this );
  
  this._redraw_required(false);
};
 
// Custom binding --------------------------------------------------

ko.bindingHandlers.gpc_kowidgets_designer = {
  
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called when the binding is first applied to an element
    // Set up any initial state, event handlers, etc. here
    
    var instance = bindingContext.$rawData;
    
    console.log('instrumentViewer.init()', 'element:', element, 'value:', valueAccessor(), 'instance:', instance);

    // Obtain contexts for both canvases ("display" and "overlay")
    instance.display_context = element.getElementsByClassName('display')[0].getContext('2d');
    instance.overlay_context = element.getElementsByClassName('overlay')[0].getContext('2d');
    
    if (instance._redraw_required()) window.setTimeout( instance.redraw.bind(instance), 0 );
  },
  
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called once when the binding is first applied to an element,
    // and again whenever the associated observable changes value.
    // Update the DOM element based on the supplied values here.
  }
};

module.exports = SketchPad;