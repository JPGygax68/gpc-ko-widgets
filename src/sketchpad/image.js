"use strict";

var GObject = require('./gobject');

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

Image.prototype._drawPath = function(ctx) {
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.img.width, this.img.height);
  ctx.closePath();
};

Image.prototype.draw = function(ctx, options) { 
  ctx.drawImage(this.img, this.x, this.y); };

Image.prototype.drawOutline = function(ctx, options) { 
  
  options = options || {};
  
  if (options.selected) {
    this._drawPath(ctx);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.stroke();
  }
};

module.exports = Image;