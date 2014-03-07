"use strict";

define(['./node', './defs'], function(Node, Defs) {

  /** Create a TreeView view-model from a "generic" model.
      Typically, the model would be the product of the ko.mapping.fromJS() function;
      i.e., an object containing observables.
   */
  // Create a Node for each level
  
  function fromModel(obj, options) {
  
    var options = options || {};
  
    var treeview = {
      showRoot: ko.observable(false),
      showValueColumn: ko.observable(false),
      labelColumnWidth: ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH)
    }
    
    treeview.rootNode = itemToNode(obj, null, '(ROOT)', []);
    
    return treeview;
    
    //-------
  
    function itemToNode(item, key, label, parents) {
      //console.log('itemToNode()', item, parents);
      
      var parent_node = parents.length > 0 ? _.last(parents).node : null;
      var node = new Node(treeview, parent_node, parents.length, label);
      
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
          //throw new Error('TreeView.fromModel(): unsupported item type:', item);
          if (typeof node.value() === 'undefined' || node.value() === null) node.value( _.escape(item.toString()) );
          node.leaf(true);
        }
        
        return node;
      }
      else {
        //console.log('skipping content');
        return null;
      }
      
      //---
      
      function makeChildNode(subitem, subkey, label) { 
        return itemToNode(subitem, subkey, label, parents.concat([{key: key, obj: obj, node: node}])); }
    }
  }
  
  // EXPORT ------
  
  return fromModel;
});
