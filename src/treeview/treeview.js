"use strict";

define('treeview', [], function() {

  function Node(level) {
    this.level = level;
    this.children = [];
  }
  
  // Create a Node for each level
  
  function fromJSON(obj, options) {
  
    var options = options || {};
  
    return objectToNode(obj, []);
  
    function objectToNode(obj, parents) {
      //console.log('objectToNode()', obj, parents);
      
      var node = new Node(parents.length);
      
      if (_.isArray(obj)) {
        var items = _.filter(obj, function(item) { return _.isObject(item); } );
        _.each(items, function(item, index) {
          //console.log('array child node #'+index+':', item.toString(), parents.length);
          var child = makeChildNode(item);
          child.name = '#' + index;
          // TODO: recurse depending on item type
          node.children.push( child );
        });
      }
      else if (_.isObject(obj)) {
        _.each(obj, function(item, key) {
          if (_.isObject(item)) {
            var child = makeChildNode(item);
            child.name = key;
            node.children.push( child );
          }
        });
      }
      else {
        throw new Error('TreeView.fromJSON(): unsupported object type:', obj);
      }
      
      return node;
      
      //---
      
      function makeChildNode(item) { return objectToNode(item, parents.concat([obj])); }
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});