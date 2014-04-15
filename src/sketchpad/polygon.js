"use strict";

var GObject = require('./gobject');

/* Polygon - very simple shape, basically just a path plus a fill and stroke style.
 */
 
function Polygon(options) {
  
  GObject.call(this, options);
  
  this.points      = this.options.points || [ {x: 0, y: 0}, {x: 100, y: 0}, {x: 100, y: 100}, {x:0, y: 100}];
  this.fillColor   = this.options.fillColor || 'rgba(255, 100, 100, 0.5)'; 
  this.strokeColor = this.options.strokeColor || 'rgb(0, 0, 0';
  
  // State
  this._selected = false;
  this._dragging_handle = -1;
  this._dragging = false;
}

Polygon.prototype = new GObject();
Polygon.prototype.constructor = Polygon;

Polygon.prototype._drawPath = function(ctx) {
  
  ctx.translate( this.x,  this.y);
  
  ctx.beginPath();
  ctx.moveTo(this.points[0].x, this.points[0].y);
  for (var i = 1; i < this.points.length; i++) ctx.lineTo(this.points[i].x, this.points[i].y);
  ctx.closePath();

  ctx.translate(-this.x, -this.y);
};

Polygon.prototype._drawHandlePath = function(ctx, point) {
  ctx.beginPath();
  ctx.rect(point.x - 3.5, point.y - 3.5, 7, 7);
  ctx.closePath();
};

Polygon.prototype.draw = function(ctx) {

  ctx.fillStyle   = this.fillColor;
  ctx.strokeStyle = this.strokeColor;
  this._drawPath(ctx);
  ctx.fill();
  ctx.stroke();
};

Polygon.prototype.drawOutline = function(ctx, options) {

  ctx.translate( this.x,  this.y);
  
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  
  for (var i = 0; i < this.points.length; i++) {
    var point = this.points[i];
    this._drawHandlePath(ctx, point);
    ctx.fillStyle = i === this._selected_handle ? 'rgba(255, 100, 100, 0.5)' : 'rgba(128, 128, 128, 0.5';
    ctx.fill();
    ctx.stroke();
  }
  
  ctx.translate(-this.x, -this.y);
}

Polygon.prototype.mouseDown = function(x, y) {
  console.log('Polygon::mouseDown()', x, y);
  
  var ctx = this._owner.display_context;
  
  // Hit on one of the handles ?
  var hit = false;
  ctx.translate( this.x,  this.y);
  for (var i = 0; i < this.points.length; i++) {
    var point = this.points[i];
    this._drawHandlePath(ctx, point);
    if (ctx.isPointInPath(x, y)) { 
      console.log('HIT on handle #'+i); 
      this._owner.captureMouse(this);
      this._dragging_handle = i;
      this._selected_handle = i;
      hit = true;
      break;
    }
  }
  ctx.translate(-this.x, -this.y);
  
  if (hit) {
    this._owner.redraw();
    return;
  }
  
  // Hit inside the polygon ?
  this._drawPath(ctx);
  if (ctx.isPointInPath(x, y)) { 
    console.log('HIT');
    // Begin dragging
    this._owner.captureMouse(this, 'grab');
    this._dragging = {
      offset: { x: x - this.x, y: y - this.y }
    };
  }
};

Polygon.prototype.mouseMove = function(x, y) {
  console.log('Polygon::mouseMove()', x, y);
  
  if (this._dragging_handle >= 0) {
    var i = this._dragging_handle;
    var point = this.points[i];
    point.x = x - this.x;
    point.y = y - this.y;
    this._owner.redraw();
  }
  else if (this._dragging) {
    this.x = x - this._dragging.offset.x;
    this.y = y - this._dragging.offset.y;
    this._owner.redraw();
  }
};

Polygon.prototype.mouseUp = function(x, y) {
  console.log('Polygon::mouseUp()', x, y);
  
  if (this._dragging_handle >= 0) {
    this._owner.releaseMouse();
    this._dragging_handle = -1;
  }
  else if (this._dragging) {
    this._owner.releaseMouse();
    this._dragging = false;
  }
};

module.exports = Polygon;

