"use strict";

//var ko           = require('knockout');
var _            = require('underscore');
var ko_templates = require('knockout-strings');

var Defs = require('./defs');
var templates = require('./templates/output/templates')
  
function wrapper(ko) {

  // We inject our dependency on Knockout
  var Node     = require('./node')(ko);
  var ko_tmpls = require('knockout-strings')(ko);

  // Store our templates in the string template engine
  _.extend(ko.templates, templates);
  console.log('ko_tmpls:', ko_tmpls, 'ko.templates:', ko.templates, ko_tmpls === ko.templates ? 'EQUAL' : 'not equal');  
  
  function TreeView(model, options) {
  
    // TODO: formally separate run-time options from import options ?
    this.options = options || {};
    
    this.showRoot = ko.observable(false);
    this.showValueColumn = ko.observable(false);
    this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);
  
    this.rootNode = Node.fromModel(model, this, options);
  }
  
  return TreeView;
}

module.exports = wrapper;