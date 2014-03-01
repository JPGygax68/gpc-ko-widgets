"use strict";

define('treeview', [], function() {

  "use strict";
  
  function Node(level) {
    this.level = level;
    this.children = [];
    this.leaf = ko.observable(false);
  }
  
  // Create a Node for each level
  
  function fromJSON(obj, options) {
  
    var options = options || {};
  
    return {
      rootNode: objectToNode(obj, null, []),
      showRoot: ko.observable(false)
    };
  
    function objectToNode(obj, key, parents) {
      //console.log('objectToNode()', obj, parents);
      
      var node = new Node(parents.length);
      
      var usage = options.filter ? options.filter(node, obj, key, parents) : node;
      
      if (usage !== false) {
        
        if (typeof usage !== 'undefined') { 
          // TODO: special usage options
        }
        
        if (!node.leaf()) {
          if (_.isArray(obj)) {
            var items = _.filter(obj, function(item) { return _.isObject(item); } );
            _.each(items, function(item, index) {
              //console.log('array child node #'+index+':', item.toString(), parents.length);
              var child = makeChildNode(item, index);
              if (child) {
                child.name = '#' + index;
                // TODO: recurse depending on item type
                node.children.push( child );
              }
            });
          }
          else if (_.isObject(obj)) {
            _.each(obj, function(item, key) {
              if (_.isObject(item)) {
                var child = makeChildNode(item, key);
                if (child) {
                  child.name = key;
                  node.children.push( child );
                }
              }
            });
          }
          else {
            throw new Error('TreeView.fromJSON(): unsupported object type:', obj);
          }
        }
      }
      
      return node;
      
      //---
      
      function makeChildNode(item, key) { return objectToNode(item, key, parents.concat([obj])); }
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});