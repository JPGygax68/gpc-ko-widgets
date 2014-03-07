"use strict";

define('treeview', ['./node', './frommodel'], function(Node, fromModel) {

  // API ------------------------------
  
  return {
    fromModel: fromModel,
    Node: Node
  };
});