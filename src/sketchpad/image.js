"use strict";

var _ = require('underscore');

var GObject = require('./gobject');

/* Image represents pictures (using DOM IMG elements).
 */
 
function Image(options) {

  options = options || {};
  
  // The dimensions are passed in as 0, which the GObject ctor will make into observables.
  // The coordinates can be passed in through the options; if none are specified, the GObject
  // ctor will created them as observables initialized to 0.
  GObject.call(this, { width: 0, height: 0, x: options.x, y: options.y }, options);

  this.img = document.createElement('img');
  
  var self = this;
  this.img.addEventListener('load', function() {
    self.width ( self.img.width  );
    self.height( self.img.height );
    self._notifyChange();
  });
  if (options.url) this.img.src = options.url; // starts loading (if url is defined)
}

Image.prototype = new GObject();
Image.prototype.constructor = Image;

Image.prototype._drawPath = function(ctx) {
  ctx.beginPath();
  ctx.rect(0, 0, this.img.width, this.img.height);
  ctx.closePath();
};

Image.prototype.draw = function(ctx, options) { 
  ctx.drawImage(this.img, 0, 0);
};

Image.prototype.drawOutline = function(ctx, options) { 
  
  options = options || {};
  
  if (options.selected) {
    this.applyTransformations(ctx);
    this._drawPath(ctx);
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
    ctx.stroke();
    this.undoTransformations(ctx);
  }
};

module.exports = Image;