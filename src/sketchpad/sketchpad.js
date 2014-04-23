"use strict";

var Polygon = require('./polygon');
var Image   = require('./image');

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
  
  this.width .subscribe( function() { window.setTimeout(this.refresh.bind(this), 1); }, this );
  this.height.subscribe( function() { window.setTimeout(this.refresh.bind(this), 1); }, this );
  
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

SketchPad.prototype._drawObject = function(obj, options) {
  //console.log('SketchPad::_drawObject()');
  
  obj.draw(this.display_context, options);
};

SketchPad.prototype._drawOutline = function(obj, options) {
  //console.log('SketchPad::_drawOutline()');
  
  //console.time('_drawOutline');
  if (obj.drawOutline) obj.drawOutline(this.overlay_context, options);
  //console.timeEnd('_drawOutline');
};

SketchPad.prototype._objectChanged = function(obj) {
  
  // TODO: optimize ?
  this.refresh();
};

SketchPad.prototype._getDisplay = function(dont_clear) {

  if (!dont_clear) this.display_context.clearRect(0, 0, this.width(), this.height());
  return this.display_context;
};

SketchPad.prototype._getOverlay = function(dont_clear) {

  this.overlay_context.setTransform(1, 0, 0, 1, this.margin(), this.margin() );
  if (!dont_clear) this.overlay_context.clearRect(-this.margin(), -this.margin(), this.width() + 2 * this.margin(), this.height() + 2 * this.margin() );
  return this.overlay_context;
};

SketchPad.prototype._getRelativeMouseCoords = function(e) {  
  //console.log('_getRelativeMouseCoords:', e);
  
  var elt_pos = getPosition(e.target);
  
  return { x: e.pageX - elt_pos.x, // - this.margin(), 
           y: e.pageY - elt_pos.y  /* - this.margin() */ };

  //------------
  
  function getPosition(elt) {
    var pos = elt.offsetParent ? getPosition(elt.offsetParent) : { x: 0, y: 0 };
    pos.x += elt.offsetLeft, pos.y += elt.offsetTop;
    return pos;
  }
};

// Event handlers ----------------------------------------------------

SketchPad.prototype.mouseDown = function(target, e) {
  //console.log('SketchPad::mouseDown()', e);
  console.time('mouseDown');
  
  this._getOverlay(true);
  
  var pos = this._getRelativeMouseCoords(e);
  
  // Selected object first
  if (!(this.selectedObject() && this.selectedObject().testMouseDown(this.overlay_context, pos.x, pos.y))) {
  
    // Inverse Z order
    for (var i = this.objects().length; -- i >= 0; ) {
      var obj = this.objects()[i];
      if (obj !== this.selectedObject() && obj.testMouseDown(this.overlay_context, pos.x, pos.y)) break;
    }
  }
  
  console.timeEnd('mouseDown');
};

SketchPad.prototype.mouseUp = function(target, e) {
  //console.log('SketchPad::mouseUp()');
  
  if (this._mouse_owner) {
    var pos = this._getRelativeMouseCoords(e);
    this._mouse_owner.mouseUp(pos.x, pos.y);
  }
};

SketchPad.prototype.mouseMove = function(target, e) {
  //console.log('SketchPad::mouseMove()', e);

  if (this._mouse_owner) {
    var pos = this._getRelativeMouseCoords(e);  
    this._mouse_owner.mouseDrag(pos.x, pos.y);
  }
};

SketchPad.prototype.mouseOut = function(target, e) {
  //console.log('SketchPad::mouseOut()');

  if (this._mouse_owner) {
    var pos = this._getRelativeMouseCoords(e);  
    this._mouse_owner.mouseUp(pos.x, pos.y);
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

SketchPad.prototype.redraw = function() {
  //console.log('SketchPad::redraw()');
  console.time('redraw');
  
  this._getDisplay();
  this._getOverlay();
  
  this.objects().forEach( function(obj) { 
    var selected = obj === this.selectedObject();
    this._drawObject (obj, { selected: selected });
    this._drawOutline(obj, { selected: selected });
  }, this );

  console.timeEnd('redraw');
};

// Other initialization --------------------------------------------

// Attach object classes to SketchPad constructor
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