"use strict";

define(['underscore'], function( _ ) {

  function Node() {
    this.children = [];
  }
  
  // Create a Node for each level
  
  function fromJSON(obj, options) {
  
    var options = options || {};
  
    return objectToNode(obj, []);
  
    function objectToNode(obj, parents) {
    
      var node = new Node();
      
      if (_.isArray(obj)) {
        for (var i = 0; i < obj.length; i++) {
          var item = obj[i];
          var child = new Node();
          child.name = '#' + i;
          // TODO: recurse depending on item type
          node.children.push( item.toString() );
        }      
      }
      else if (_.isObject(obj)) {
        _.each(obj, function(item, key) {
          if (_.isObject(item)) {
            var child = objectToNode(item, parents.slice(0).concat(item));
            child.name = key;
            node.children.push( child );
          }
        });
      }
      else {
        throw new Error('TreeView.fromJSON(): unsupported object type:', obj);
      }
      
      return node;
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});