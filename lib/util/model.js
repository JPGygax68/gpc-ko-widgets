"use strict";

// TODO: not too sure that this module should really be called 'Model'.

define('Model', [], function() {

  // Extended version of ko.observableArray -----------------
  
  function Array() {
    console.log('Model.Array constructor called');
  }
  
  Array.prototype = ko.observableArray();
  
  // Improved version of ko.mapping.fromJS() ----------------
  
  function fromJS(options) {
  }
  
  // EXPORTS -------------------------
  
  return {
    Array: Array,
    fromJS: fromJS
  };
});