"use strict";

var ko = require('knockout');
var _  = require('underscore');

var util = require('./util');

function ViewModel(data) {
  _.extend(this, data);
}

// TODO: make it inherit the entirety of underscore ?

ViewModel.prototype.valueType      = util.valueType;
ViewModel.prototype.makeObservable = util.makeObservable;

module.exports = ViewModel;