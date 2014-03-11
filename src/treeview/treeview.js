"use strict";

// TODO: find a better way than to have TreeView pull in the importer ?

define(['./frommodel', './defs'], function(fromModel, Defs) {

  function TreeView(model, options) {
  
    this.showRoot = ko.observable(false);
    this.showValueColumn = ko.observable(false);
    this.labelColumnWidth = ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH);

    this.rootNode = fromModel(model, this, options);
  };
  
  // API ------------------------------
  
  return TreeView;
  
});