"use strict";

/* This is the abstract base class.
 */
 
function GObject(options) {

  this.options = options || {};
  this.x = this.options.x || 0;
  this.y = this.options.y || 0;  
}

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
  
// Override in descendants, if needed
GObject.prototype.mouseDown   = function() {};  // returning truthy means event is consumed
GObject.prototype.mouseMove   = function() {};  //
GObject.prototype.mouseUp     = function() {};
GObject.prototype.drawOverlay = function(context, options) {};
  // options: selected

// We export the class
module.exports = GObject;