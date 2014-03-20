"use strict";

var ko            = require('knockout');
var _             = require('underscore');
var ko_templates  = require('knockout-strings');

var Node = require('./node');
var Defs = require('./defs');

var templates = require('./templates/output/templates')

var ko_tmpls = ko_templates(ko); // inject string template engine into Knockout
_.extend(ko.templates, templates);
//console.log('ko_tmpls:', ko_tmpls, 'ko.templates:', ko.templates, ko_tmpls === ko.templates ? 'EQUAL' : 'not equal');

function TreeView(model, options) {

  // TODO: formally separate run-time options from import options ?
  this.options = options || {};
  
  this.showRoot = ko.observable(false);
  this.showValueColumn = ko.observable(false);
  this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

  this.rootNode = Node.fromModel(model, this, options);
}

module.exports = TreeView;