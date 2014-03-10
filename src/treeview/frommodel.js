"use strict";

define(['./node', './defs', '../util/model'], function(Node, Defs, Model) {

  // Create a Node for each level
  
  function fromModel(obj, options) {
  
    var options = options || {};
  
    // TODO: create a class for this
    
    var treeview = {
      showRoot: ko.observable(false),
      showValueColumn: ko.observable(false),
      labelColumnWidth: ko.observable(Defs.DEFAULT_LABEL_COLUMN_WIDTH)
    }
    
    treeview.rootNode = itemToNode(obj, null, '(ROOT)', [] );
    
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
        
        if (isArray(item)) {
          if (!node.leaf()) {
            var subitems = _.filter(ko.unwrap(item), function(subitem) { return isObject(subitem); } );
            _.each(subitems, function(subitem, index) {
              //console.log('array child node #'+index+':', item.toString(), parents.length);
              var child = makeChildNode(subitem, index);
              if (child) {
                // TODO: recurse depending on item type
                node.children.push( child );
                if (typeof child.label() === 'undefined') {
                  child.label = ko.computed( function() { return '#' + (_.indexOf(node.children(), child) + 1); } );
                }
              }
            });
            // TODO: the following code belongs into the Node class
            if (ko.isObservable(item)) item.subscribe( function(changes) { 
              _.each(changes, function(change) {
                console.log('array change:', change.status, change.value, change.index); 
                if (change.status === 'added') {
                  node.children.splice(change.index, 0, makeChildNode(change.value, change.index, change.index.toString()) );
                  // TODO: renumber remaining items
                }
                else if (change.status === 'removed') {
                  // TODO
                }
              });
            }, null, 'arrayChange');
          }
        }
        else if (isObject(item)) {
          //console.log('item is object');
          if (!node.leaf()) {
            _.each(ko.unwrap(item), function(subitem, subkey) {
              if (subkey.slice(0, 2) !== '__') {
                //console.log('  ', subkey, ':', subitem);
                var child = makeChildNode(subitem, subkey, subkey);
                if (child) node.children.push( child );
              }
            });
          }
        }
        else {
          // TODO: generating HTML code looses the two-way binding!
          //if (typeof node.value() === 'undefined' || node.value() === null) node.value( _.escape(ko.unwrap(item).toString()) );
          //if (typeof node.value() === 'undefined' || node.value() === null) node.value = item;
          if (ko.isObservable(item)) {
            node.value = item;
            // TODO: force update of computed's based on node.value (use dummy observable)
          }
          else node.value(item);
          //if (ko.isObservable(node.value)) console.log('item "'+key+'" is observable');
          node.leaf(true);
        }
        
        return node;
      }
      else {
        //console.log('skipping content');
        return null;
      }
      
      //--------
      
      function isObject(item) { return _.isObject(ko.unwrap(item)); }
      function isArray (item) { return _.isArray (ko.unwrap(item)); }
      
      function makeChildNode(subitem, subkey, label) { 
        return itemToNode(subitem, subkey, label, parents.concat([{key: key, obj: obj, node: node}])); }
    }
  }
  
  // EXPORT ------
  
  return fromModel;
});
