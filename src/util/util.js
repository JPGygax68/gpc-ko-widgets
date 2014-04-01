"use strict";

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

module.exports = {
  valueType: valueType
};