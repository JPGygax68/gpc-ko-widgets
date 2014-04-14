"use strict";

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

// Override in descendants
GObject.prototype.mouseDown = function() {};
GObject.prototype.mouseMove = function() {};
GObject.prototype.mouseUp   = function() {};

// We export the class
module.exports = GObject;