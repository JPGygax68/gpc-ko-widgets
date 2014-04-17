"use strict";

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
  
  if (!this.x) this.x = this.makeObservable(0);
  if (!this.y) this.y = this.makeObservable(0);
}

GObject.prototype.makeObservable = util.makeObservable;

GObject.prototype.select = function() {

  if (this !== this._owner.selectedObject()) this._owner.selectedObject( this );
}

GObject.prototype._notifyChange = function() {
  
  // TODO: system based on observables ? or use Knockout events ?
  if (this._owner) this._owner._objectChanged(this);
};

// Implement in descendants
GObject.prototype.draw      = function(context, options) { throw new Error(this.constructor.toString()+' does not implement draw()!'); };
  // options: selected (boolean)
  
/* The default implementation of mouseDown() requires a method _drawPath(ctx) to be implemented.
 */
GObject.prototype.mouseDown = function(x, y) {
  
  if (!this._drawPath) { console.log('no _drawPath() method'); return false; }
  
  var ctx = this._owner.display_context;
  
  // Hit inside the polygon ?
  this._drawPath(ctx);
  if (ctx.isPointInPath(x, y)) { 
    console.log('HIT');
    this.select(); // should trigger redraw()
    if (!this.options.no_dragging) {
      // Begin dragging
      this._owner.captureMouse(this, 'grab');
      this._dragging = {
        offset: { x: x - this.x(), y: y - this.y() }
      };
    }
    return true; // truthy means that mouseDown has been "consumed"
  }
};

GObject.prototype.mouseMove = function(x, y) {

  if (this._dragging) {
    this.x(x - this._dragging.offset.x);
    this.y(y - this._dragging.offset.y);
    this._owner.redraw();
    return true;
  }
};

GObject.prototype.mouseUp = function(x, y) {

  if (this._dragging) {
    this._owner.releaseMouse();
    this._dragging = false;
    return true;
  }
};

// We export the class
module.exports = GObject;