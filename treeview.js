"use strict";

var ko = require('knockout');

require('./lib/util/stringTemplateEngine');
var Defs = require('./lib/treeview/defs');
var Node = require('./lib/treeview/node');

var templates = require('./generated/treeview/templates')
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_TREEVIEW_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['HAS_TREEVIEW_TEMPLATES'] = 'YES';
}

function TreeView(model, options) {

  // TODO: formally separate run-time options from import options ?
  this.options = options || {};
  
  this.showRoot = ko.observable(false);
  this.showValueColumn = ko.observable(false);
  this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

  this.rootNode = Node.fromModel(model, this, options);
}

// TODO: provide factory methods instead ?
TreeView.Node = Node;

module.exports = TreeView;