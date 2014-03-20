"use strict";

// define('knockout', function() { return ko; });

// TODO: find a better way than to have TreeView pull in the importer ?

var ko = require('knockout');

var Node = require('./node');
var Defs = require('./defs');
var templates = {
  // TODO: make sure those will be read in as text
  // TODO: it would be nice to read Jade directly
  // TODO: even better: find a way to automatically read in all templates in a subdir
  treeview     : require('./treeview.html'),
  node_children: require('./node_children.html'),
  node         : require('./node.html')
};

ko.templates['gktvNode'        ] = node;
ko.templates['gktvTreeView'    ] = treeview;
ko.templates['gktvNodeChildren'] = node_children;

function TreeView(model, options) {

  // TODO: formally separate run-time options from import options ?
  this.options = options || {};
  
  this.showRoot = ko.observable(false);
  this.showValueColumn = ko.observable(false);
  this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

  this.rootNode = Node.fromModel(model, this, options);
};

module.exports = TreeView;