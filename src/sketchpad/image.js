"use strict";

var GObject = require('./gobject');

/* Image represents pictures (using DOM IMG elements).
 */
 
function Image(options) {

  GObject.call(this, options);

  this.width  = ko.observable(0);
  this.height = ko.observable(0);
  
  this.img = document.createElement('img');
  
  //window.setTimeout( function() { this.img.src = options.url; }.bind(this), 1000 );
  var self = this;
  this.img.addEventListener('load', function() {
    self.width ( self.img.width  );
    self.height( self.img.height );
    self._notifyChange();
  });
  this.img.src = options.url; // starts loading (if url is defined)
}

Image.prototype = new GObject();
Image.prototype.constructor = Image;

Image.prototype._drawPath = function(ctx) {
  ctx.beginPath();
  ctx.rect(this.x(), this.y(), this.img.width, this.img.height);
  ctx.closePath();
};

Image.prototype.draw = function(ctx, options) { 
  ctx.drawImage(this.img, this.x(), this.y());
};

Image.prototype.drawOutline = function(ctx, options) { 
  
  options = options || {};
  
  if (options.selected) {
    this._drawPath(ctx);
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.5)';
    ctx.stroke();
  }
};

module.exports = Image;