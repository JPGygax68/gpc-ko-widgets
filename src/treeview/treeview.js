"use strict";

define('treeview', [], function() {

  "use strict";
  
  function Node(level, label) {
    this.level = level;
    this.children = ko.observableArray();
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
  
  Node.prototype.onMouseOverLabel = function(self, event) {
    console.log('Node.onMouseOverLabel():', self, event);
  }
  Node.prototype.onMouseLeaveLabel = function(self, event) {
    console.log('Node.onMouseLeaveLabel():', self, event);
  }
  
  // Create a Node for each level
  
  function fromJSON(obj, options) {
  
    var options = options || {};
  
    return {
      rootNode: itemToNode(obj, null, '(ROOT)', []),
      showRoot: ko.observable(false)
    };
  
    function itemToNode(item, key, label, parents) {
      //console.log('itemToNode()', item, parents);
      
      var node = new Node(parents.length, label);
      
      node.leaf( !_.isObject(item) );
      var usage = options.filter ? options.filter(node, item, key, parents) : node;
      
      if (usage !== false) {
        
        if (typeof usage !== 'undefined') { 
          // TODO: special usage options
        }
        
        if (_.isArray(item)) {
          var items = _.filter(item, function(item) { return _.isObject(item); } );
          if (!node.leaf()) {
            _.each(items, function(subitem, index) {
              //console.log('array child node #'+index+':', item.toString(), parents.length);
              var child = makeChildNode(subitem, index, '#' + index);
              if (child) {
                // TODO: recurse depending on item type
                node.children.push( child );
              }
            });
          }
        }
        else if (_.isObject(item)) {
          //console.log('item is object');
          if (!node.leaf()) {
            _.each(item, function(subitem, subkey) {
              //console.log('  ', subkey, ':', subitem);
              var child = makeChildNode(subitem, subkey, subkey);
              if (child) node.children.push( child );
            });
          }
        }
        else {
          //throw new Error('TreeView.fromJSON(): unsupported item type:', item);
          node.value = ko.observable(item);
          node.leaf(true);
        }
        
        return node;
      }
      else {
        console.log('skipping content');
        return null;
      }
      
      //---
      
      function makeChildNode(subitem, subkey, label) { 
        return itemToNode(subitem, subkey, label, parents.concat([{key: key, obj: obj}])); }
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});