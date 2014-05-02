"use strict";

var GObject = require('./gobject');
var Polygon = require('./polygon');
var Image   = require('./image');
var util    = require('../util/util');

// A few constants -------------------------------------------------

var DEFAULT_MARGIN = 5;

var VERTEX_HANDLE_WIDTH  = 6;
var VERTEX_HANDLE_HEIGHT = VERTEX_HANDLE_WIDTH;

// Required modules ------------------------------------------------

var ko = require('knockout');

require('../util/stringTemplateEngine');

var templates = require('../../generated/sketchpad/templates')
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_SKETCHPAD_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['HAS_SKETCHPAD_TEMPLATES'] = 'YES';
}

// View Model used by the "designer" widget ------------------------

function SketchPad(width, height, options) {
  
  this.options = options || {};
  
  console.log('SketchPad() width:', ko.unwrap(width), ' height:', ko.unwrap(height));
  
  this.width  = ko.isObservable(width ) ? width  : ko.observable(width );
  this.height = ko.isObservable(height) ? height : ko.observable(height);
  this.zoom   = ko.isObservable(this.options.zoom) ? options.zoom : ko.observable(1);
  
  this.zoomPercent = ko.computed({
    read : function() { return Math.floor(this.zoom() * 100 + 0.49); },
    write: function(value) { this.zoom( value / 100 ); }
  }, this);
  
  this.width .subscribe( function() { window.setTimeout(this.refresh.bind(this), 1); }, this );
  this.height.subscribe( function() { window.setTimeout(this.refresh.bind(this), 1); }, this );
  this.zoom  .subscribe( function() { window.setTimeout(this.refresh.bind(this), 1); }, this );
  
  this.margin  = ko.observable(DEFAULT_MARGIN);

  this.objects = ko.observableArray();

  this.selectedObject = ko.observable(null);
  
  this._redraw_required = ko.observable();
    
  this.objects.subscribe( function(changes) {
    var redraw_flag = false;
    changes.forEach( function(change) {
      //change.index
      //change.status
      //change.value
      if (change.status === 'added') change.value._owner = this; // so we don't have to pass owner when constructing objects
      redraw_flag = true;
    }, this);
    if (redraw_flag) {
      // TODO: replace this cheap-o temp implementation
      if (this.display_context) this.redraw();
      else this._redraw_required(true);
    }
  }, this, 'arrayChange');
  
  this.selectedObject.subscribe( function(obj) {
    console.log('SketchPad: selectedObject value has changed');
    this.redraw();
  }, this);
}

SketchPad.prototype.init = function(element) {
  console.log('SketchPad::init()', element);

  // Obtain container element
  this.container = element.getElementsByClassName('container')[0];
  
  // Obtain contexts for both canvases ("display" and "overlay")
  this.display_context = element.getElementsByClassName('display')[0].getContext('2d');
  this.overlay_context = element.getElementsByClassName('overlay')[0].getContext('2d');
  //this.overlay_context.translate( this.margin(), this.margin() );
  
  if (this._redraw_required()) window.setTimeout( this.redraw.bind(this), 0 );
};

// TODO: SketchPad.prototype.detach()

SketchPad.prototype._renderObject = function(obj, options) {
  //console.log('SketchPad::_renderObject()');
  
  obj.render(this.display_context, options);
};

SketchPad.prototype._renderOutline = function(obj, options) {
  //console.log('SketchPad::_renderOutline()');
  
  //console.time('_renderOutline');
  if (obj.drawOutline) obj.drawOutline(this.overlay_context, options);
  //console.timeEnd('_renderOutline');
};

SketchPad.prototype._objectChanged = function(obj) {
  
  // TODO: optimize ?
  this.refresh();
};

SketchPad.prototype._getDisplay = function(dont_clear) {

  this.display_context.setTransform(1, 0, 0, 1, 0, 0);
  this.display_context.scale( this.zoom(), this.zoom() );
  if (!dont_clear) this.display_context.clearRect(0, 0, this.width(), this.height());
  return this.display_context;
};

SketchPad.prototype._getOverlay = function(dont_clear) {

  this.overlay_context.setTransform(1, 0, 0, 1, this.margin(), this.margin() );
  this.overlay_context.scale( this.zoom(), this.zoom() );
  if (!dont_clear) this.overlay_context.clearRect(-this.margin(), -this.margin(), this.width() + 2 * this.margin(), this.height() + 2 * this.margin() );
  return this.overlay_context;
};

SketchPad.prototype._getRelativeMousePos = function(e) {  
  //console.log('_getRelativeMousePos:', e);
  
  var elt_pos = util.getAbsoluteElementPosition(e.target);
  
  return { x: e.pageX - elt_pos.x, // - this.margin(), 
           y: e.pageY - elt_pos.y  /* - this.margin() */ };
};

SketchPad.prototype._getScaledMousePos = function(e) {  
  //console.log('_getScaledMouseCoords:', e);
  
  var elt_pos = util.getAbsoluteElementPosition(e.target);
  
  var scale = 1 / this.zoom();
  
  return { x: scale * (e.pageX - elt_pos.x - this.margin()), 
           y: scale * (e.pageY - elt_pos.y - this.margin()) };
};

// Event handlers ----------------------------------------------------

SketchPad.prototype.mouseDown = function(target, e) {
  //console.log('SketchPad::mouseDown()', e);
  console.time('mouseDown');
  
  this._getOverlay(true);
  
  var pos    = this._getRelativeMousePos(e);
  var scaled = this._getScaledMousePos(e);
  
  // Selected object first
  if (!(this.selectedObject() && this.selectedObject().testMouseDown(this.overlay_context, pos.x, pos.y, scaled.x, scaled.y))) {
  
    // Inverse Z order
    for (var i = this.objects().length; -- i >= 0; ) {
      var obj = this.objects()[i];
      if (obj !== this.selectedObject() && obj.testMouseDown(this.overlay_context, pos.x, pos.y, scaled.x, scaled.y)) break;
    }
  }
  
  console.timeEnd('mouseDown');
};

SketchPad.prototype.mouseUp = function(target, e) {
  //console.log('SketchPad::mouseUp()');
  
  if (this._mouse_owner) {
    var pos = this._getRelativeMousePos(e);
    var scaled = this._getScaledMousePos(e);
    this._mouse_owner.mouseUp(pos.x, pos.y, scaled.x, scaled.y);
  }
};

SketchPad.prototype.mouseMove = function(target, e) {
  //console.log('SketchPad::mouseMove()', e);

  var pos    = this._getRelativeMousePos(e);  
  var scaled = this._getScaledMousePos(e);
  
  // Has the mouse been "captured" by any of the objects ?
  if (this._mouse_owner) {
    this._mouse_owner.mouseDrag(pos.x, pos.y, scaled.x, scaled.y);
  }

  // Check for hover (inverse Z order)
  var must_redraw = false;
  for (var i = this.objects().length; -- i >= 0; ) {
    var obj = this.objects()[i];
    var hovered = obj !== this.selectedObject() && obj.containsPosition(this.overlay_context, pos.x, pos.y, scaled.x, scaled.y);
    if (hovered !== obj.options.hovered) {
      obj.options.hovered = hovered;
      if (obj.options.hovered) console.log('hovered');
      must_redraw = true;
    }
  }
  if (must_redraw) this.redraw();
};

SketchPad.prototype.mouseOut = function(target, e) {
  //console.log('SketchPad::mouseOut()');

  if (this._mouse_owner) {
    var pos = this._getRelativeMousePos(e);  
    var scaled = this._getScaledMousePos(e);
    this._mouse_owner.mouseUp(pos.x, pos.y, scaled.x, scaled.y);
    //this.releaseMouse();
  }
};

// Interface towards graphical objects -------------------------------

SketchPad.prototype.captureMouse = function(obj, cursor) {
  console.log('SketchPad::captureMouse()');
  
  // You caught it, you own it
  this._mouse_owner = obj;  
  
  // Change cursor style (if asked for)
  this.container.style.cursor = '-webkit-'+cursor;
  this.container.style.cursor = '-moz-'+cursor;
  this.container.style.cursor = '-ms-'+cursor;
  this.container.style.cursor = cursor;
};

SketchPad.prototype.releaseMouse = function() {
  console.log('SketchPad::releaseMouse()');
  
  this._mouse_owner = null;
  this.container.style.cursor = 'auto';
};

// Public methods ----------------------------------------------------

SketchPad.prototype.refresh = function() {
  //console.log('SketchPad::refresh()');
  
  if (this.display_context) this.redraw();
  else this._redraw_required(true);
};

SketchPad.prototype.redraw = function(options) {
  //console.log('SketchPad::redraw()');
  console.time('redraw');
  
  this._getDisplay();
  this._getOverlay();
  
  this.objects().forEach( function(obj) { 
    var selected = obj === this.selectedObject();
    this._renderObject (obj, {selected: selected});
    this._renderOutline(obj, {selected: selected});
  }, this );

  console.timeEnd('redraw');
};

// Other initialization --------------------------------------------

// Attach object classes to SketchPad constructor
// TODO: do this in a special source file "sketchpad-bundle.js" or so
SketchPad.Object  = GObject;
SketchPad.Image   = Image;
SketchPad.Polygon = Polygon;

// Custom binding --------------------------------------------------

ko.bindingHandlers.gpc_kowidgets_sketchpad = {
  
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called when the binding is first applied to an element
    // Set up any initial state, event handlers, etc. here
    
    bindingContext.$rawData.init(element);
  },
  
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called once when the binding is first applied to an element,
    // and again whenever the associated observable changes value.
    // Update the DOM element based on the supplied values here.
  }
};

module.exports = SketchPad;