"use strict";

var ko = require('knockout');

var util = require('../util/util');

var Keyboard = require('../util/keyboard');

function Command(name, func, options) {

  this.name = name;
  this.func = func;
  
  options = options || {};
  this.description = options.description;
  this.shortcut = options.shortcut;
  this.enabled = ko.observable(false);
  this.visible = ko.observable(false);  
  
  this._owner = null;
}

Command.prototype.trigger = function() {

  console.assert(this._owner && this._owner.target);
  
  this.func(this.params);
};

module.exports = Command;
