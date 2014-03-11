"use strict";

// TODO: find a better way than to have TreeView pull in the importer ?

define(['./node', './defs'], function(Node, Defs) {

  function TreeView(model, options) {
  
    // TODO: formally separate run-time options from import options ?
    this.options = options || {};
    
    this.showRoot = ko.observable(false);
    this.showValueColumn = ko.observable(false);
    this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

    this.rootNode = Node.fromModel(model, this, options);
  };
  
  // API ------------------------------
  
  return TreeView;
  
});