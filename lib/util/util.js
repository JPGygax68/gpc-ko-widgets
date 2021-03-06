"use strict";

var ko = require('knockout');
var _ = require('underscore');

function valueType(value) {
  value = ko.unwrap(value);
  if      (_.isNumber (value)) return 'number';
  else if (_.isBoolean(value)) return 'boolean';
  else if (_.isString (value)) return 'string';
  else if (_.isArray  (value)) return 'array';
  else if (_.isObject (value)) return 'object';
  throw('valueType('+value.toString()+'): unknown type');
};

/* Returns the passed object or value as an observable.
  - If the argument is already an observable, it is returned unchanged.
  - If the argument is a value, that value is used to initialize an observable, 
    which will be returned.
  - If the first argument is a function, that function will be used to create a 
    computed observable. SPECIAL NOTE: for the computation function to be able
    to use "this", "this" must be made available to makeObservable() via bind(), 
    call() or apply().
 */
function makeObservable(value) {
  //console.log('makeObservable()', value);
  if      (ko.isObservable(value)) return value;
  else if (_.isFunction(value)   ) return ko.computed(value, this);
  else                             return ko.observable(value);
}

function getAbsoluteElementPosition(elt) {
  var pos = elt.offsetParent ? getAbsoluteElementPosition(elt.offsetParent) : { x: 0, y: 0 };
  pos.x += elt.offsetLeft, pos.y += elt.offsetTop;
  return pos;
}

module.exports = {
  valueType: valueType,
  makeObservable: makeObservable,
  getAbsoluteElementPosition: getAbsoluteElementPosition
};