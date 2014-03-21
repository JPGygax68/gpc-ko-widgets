"use strict";

// TODO: this module contains both the TreeView class, with its init code, and init code
//  that applies to the widget collection. These components need to be separated out.

// TODO: all bundles generated from the GPC-KO-Widgets sources should follow a common 
//  pattern, and, when using global exports, export to a common namespace object
//  without causing clashes. In other words, importing all widgets separately should
//  work ok even if it would be more economical to choose a bundle containing all
//  required widgets.

var ko = require('knockout');
var tmpl_eng = require('knockout-string-templates');

var Defs = require('./defs');
var Node = require('./node');
var templates = require('./templates/output/templates')
  
// Store our templates in the string template engine
ko.utils.extend(ko.templates, templates);

function TreeView(model, options) {

  // TODO: formally separate run-time options from import options ?
  this.options = options || {};
  
  this.showRoot = ko.observable(false);
  this.showValueColumn = ko.observable(false);
  this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

  this.rootNode = Node.fromModel(model, this, options);
}

module.exports = TreeView;