"use strict";

// TODO: need to document the predefined/reserved object options somewhere!

var _    = require('underscore');

var util = require('../util/util');

/* This is the abstract base class.
  - The first argument contains the properties to attach to the graphical object.
    IMPORTANT: because these properties can be computed observables (or functions
      that will be made into computeds), their order can be very important!
 */ 
function GObject(props, options) {

  this.options = options || {};
  
  if (props) {
    _.each(props, function(prop, name) { if (typeof prop !== 'undefined') this[name] = this.makeObservable(prop); }, this);
  }
  
  if (!this.x       ) this.x        = this.makeObservable(0);
  if (!this.y       ) this.y        = this.makeObservable(0);
  if (!this.rotation) this.rotation = this.makeObservable(0);
  if (!this.pivot_x ) this.pivot_x  = this.makeObservable(0);
  if (!this.pivot_y ) this.pivot_y  = this.makeObservable(0);
}

GObject.prototype.makeObservable = util.makeObservable;

GObject.prototype.select = function() {

  if (this !== this._owner.selectedObject()) this._owner.selectedObject( this );
}

GObject.prototype._notifyChange = function() {
  
  // TODO: system based on observables ? or use Knockout events ?
  if (this._owner) this._owner._objectChanged(this);
};

GObject.prototype.applyTransformations = function(ctx) {

  ctx.translate( this.x(), this.y() );
  ctx.rotate   ( this.rotation()    );
};

GObject.prototype.undoTransformations = function(ctx) {

  ctx.rotate   ( -this.rotation()     );
  ctx.translate( -this.x(), -this.y() );
};

// Implement in descendants
GObject.prototype.draw = function(context, options) { throw new Error(this.constructor.toString()+' does not implement draw()!'); };
  // options: selected (boolean)

/** The render() method applies transformations, draw()s the object, the undoes the transformations.
 */
GObject.prototype.render = function(ctx, options) {  
  this.applyTransformations(ctx);
  this.draw(ctx, options);
  this.undoTransformations(ctx);
};

/* The default implementation of containsPosition() requires a method _drawPath(ctx) to be implemented.
  TODO: clean up the interface: make it clear the context is set up so that it must be used with relative mouse coordinates;
    also, ctx shouldn't be the first arg but the last, or in options, as it's not always needed; and put scaled coords first ?
    NOTE: reflect any changes to testMouseDown() as well
 */
GObject.prototype.containsPosition = function(ctx, x, y, scaled_x, scaled_y) {
  
  if (!this._drawPath) { console.log('no _drawPath() method'); return false; }
  
  // Hit inside the polygon ?
  this.applyTransformations(ctx);
  this._drawPath(ctx);  
  var result = ctx.isPointInPath(x, y);
  this.undoTransformations(ctx);
  return result;
};

/* TODO: see containsPosition()
 */
GObject.prototype.testMouseDown = function(ctx, x, y, scaled_x, scaled_y) {
  
  if (this.containsPosition(ctx, x, y, scaled_x, scaled_y)) { 
    console.log('calling this.select()');
    this.select(); // should trigger redraw()
    if (!this.options.no_dragging) {
      // Begin dragging
      this._owner.captureMouse(this, 'grab');
      this._dragging = {
        offset: { x: scaled_x - this.x(), y: scaled_y - this.y() }
      };
    }
    return true; // truthy means that mouseDown has been "consumed"
  }
};

GObject.prototype.mouseDrag = function(x, y, scaled_x, scaled_y) {

  if (this._dragging) {
    this.x(scaled_x - this._dragging.offset.x);
    this.y(scaled_y - this._dragging.offset.y);
    this._owner.redraw();
    return true;
  }
};

GObject.prototype.mouseUp = function(x, y, scaled_x, scaled_y) {

  if (this._dragging) {
    this._owner.releaseMouse();
    this._dragging = false;
    return true;
  }
};

// We export the class
module.exports = GObject;