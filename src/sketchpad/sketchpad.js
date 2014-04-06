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

GObject.prototype._notifyChange = function() {
  
  // TODO: system based on observables ? or use Knockout events ?
  if (this._owner) this._owner._objectChanged(this);
};

/* Image represents pictures (using DOM IMG elements).
 */
 
function Image(options) {

  GObject.call(this, options);
  
  this.img = document.createElement('img');
  //window.setTimeout( function() { this.img.src = options.url; }.bind(this), 1000 );
  this.img.src = options.url;
  this.img.addEventListener('load', this._notifyChange.bind(this));
}

Image.prototype = new GObject();
Image.prototype.constructor = Image;

Image.prototype.draw = function(context) { 
  if (!context) debugger;
  context.drawImage(this.img, this.x, this.y); };

/* An "area" is a graphical object without a direct visual representation; it is shown
  on screen by its outline only.
 */
 
function Area(options) {
  
  GObject.call(this, options);
  
  this.points      = this.options.points || [ {x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}, {x:0, y: 100}];
  this.fillColor   = this.options.fillColor || 'rgba(255, 100, 100, 0.5)'; 
  this.strokeColor = this.options.strokeColor || 'rgb(0, 0, 0';
}

Area.prototype = new GObject();
Area.prototype.constructor = Area;

Area.prototype.draw = function(ctx) {
  // No-op  
};

Area.prototype.drawOutline = function(ctx, options) {

  // Draw polygon
  
  ctx.fillStyle   = this.fillColor;
  ctx.strokeStyle = this.strokeColor;
  ctx.translate( this.x,  this.y);
  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);
  for (var i = 1; i < this.points.length; i++) ctx.lineTo(this.points[i].x, this.points[i].y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.translate(-this.x, -this.y);  

  // Draw handles 
  
  ctx.fillStyle   = 'rgba(255, 100, 100, 0.5)'; // TODO: depends on whether select or not
  ctx.strokeStyle = '#000000';
  
  ctx.translate( this.x,  this.y);
  
  for (var i = 0; i < this.points.length; i++) {
    var point = this.points[i];
    ctx.beginPath();
    ctx.rect(point.x - 3, point.y - 3, 6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  ctx.translate(-this.x, -this.y);
}

// View Model used by the "designer" widget ------------------------

function SketchPad(width, height, options) {
  
  this.options = options || {};
  
  this.width   = ko.observable(width);
  this.height  = ko.observable(height);
  
  this.margin  = ko.observable(DEFAULT_MARGIN);

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

SketchPad.prototype._drawObject = function(obj) {
  console.log('SketchPad::_drawObject()');
  
  obj.draw(this.display_context);
};

SketchPad.prototype._drawOutline = function(obj) {
  console.log('SketchPad::_drawOutline()');
  
  if (obj.drawOutline) obj.drawOutline(this.overlay_context);
};

SketchPad.prototype._objectChanged = function(obj) {
  
  // TODO: optimize ?
  this.refresh();
};

// Public methods ----------------------------------------------------

SketchPad.prototype.refresh = function() {
  
  if (this.display_context) {
    this.redraw();
  }
  else this._redraw_required(true);
};

SketchPad.prototype.redraw = function() {
  console.log('SketchPad::redraw()');
  
  // We translate on the overlay context so that the origins of both are identical
  //this.display_context.translate( 0.5, 0.5 );
  this.display_context.save();
  this.overlay_context.translate( 0.5 + this.margin(), 0.5 + this.margin() );
  this.overlay_context.save();
  
  this.objects().forEach( function(obj) { 
    this._drawObject(obj);
    this._drawOutline(obj);
  }, this );

  this.display_context.restore();
  this.overlay_context.restore();
};
 
// Other initialization --------------------------------------------

// Attach object classes to SketchPad constructor

SketchPad.Object  = GObject; // no point in keeping the "G" prefix
SketchPad.Image   = Image;
SketchPad.Area = Area;

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