"use strict";

define('treeview', [], function() {

  "use strict";
  
  function Node(level, label) {
    this.level = level;
    this.children = [];
    this.label = ko.observable(label);
    this.open = ko.observable(true);
    this.leaf = ko.observable(false);
  }
  
  Node.prototype.onClick = function(self, event) {
    console.log('Node.onClick():', self, event);
    self.open( !self.open() );
    event.preventDefault();
    event.stopPropagation();
  };
  
  // Create a Node for each level
  
  function fromJSON(obj, options) {
  
    var options = options || {};
  
    return {
      rootNode: objectToNode(obj, null, '(ROOT)', []),
      showRoot: ko.observable(false)
    };
  
    function objectToNode(obj, key, label, parents) {
      //console.log('objectToNode()', obj, parents);
      
      var node = new Node(parents.length, label);
      
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
              var child = makeChildNode(item, index, '#' + index);
              if (child) {
                // TODO: recurse depending on item type
                node.children.push( child );
              }
            });
          }
          else if (_.isObject(obj)) {
            _.each(obj, function(item, key) {
              if (_.isObject(item)) {
                var child = makeChildNode(item, key, key);
                if (child) node.children.push( child );
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
      
      function makeChildNode(item, key, label) { return objectToNode(item, key, label, parents.concat([obj])); }
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});