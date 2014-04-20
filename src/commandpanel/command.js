"use strict";

var ko = require('knockout');

var Keyboard = require('../util/keyboard');

function Command(name, method, target, options) {

  this.name = name;
  this.method = method;
  this.target = target;
  
  options = options || {}
  this.description = options.description;
  this.shortcut = options.shortcut;
  this.enabled = ko.observable(false);
  this.visible = ko.observable(false);  
}

module.exports = Command;
