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

Image.prototype.draw = function(context, options) { 
  if (!context) debugger;
  context.drawImage(this.img, this.x, this.y); };

module.exports = Image;