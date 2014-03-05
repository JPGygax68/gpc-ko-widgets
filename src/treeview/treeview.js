"use strict";

define('treeview', [], function() {

  "use strict";
  
  var DEFAULT_HANDLE_WIDTH          = 11;
  var DEFAULT_LABEL_COLUMN_WIDTH    = 200;
  var DEFAULT_SPACING_AFTER_HANDLE  = 4;
  
  function Node(treeview, parent, level, label, value) {
    this.treeview = treeview;
    // TODO: should parent and level be observables too ? (in case nodes are being moved around?)
    this.parent = parent;
    //this.levelClass = function() { return 'level' + level; }
    this.children = ko.observableArray();
    this.label = ko.observable(label);
    this.open = ko.observable(true);
    this.leaf = ko.observable(false);
    this.cssString = ko.computed( function() {
      var classes = [];
      if (this.open()) classes.push('open'); else classes.push('closed');
      classes.push( 'level' + level ); // TODO: observable ?
      return classes.join(' ');
    }, this);
    /* THE FOLLOWING IS ONLY NEEDED IF INDENTATION IS DONE BY INLINE CSS
    this.indent = ko.computed( function() {
      // TODO: use treeview properties instead of defaults!
      return level > 0 || this.treeview.showRoot() ? DEFAULT_HANDLE_WIDTH + DEFAULT_SPACING_AFTER_HANDLE : 0;
    }, this);
    this.labelWidth = ko.computed( function() {
      var width;
      if (!this.parent) {
        width = this.treeview.labelColumnWidth();
        if (this.treeview.showRoot()) width -= this.indent();
      }
      else {
        width = this.parent.labelWidth();
        if (!this.leaf()) width -= this.indent();
      }
      return width;
    }, this);
    */
    this.value = ko.observable(''); // default
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
  
    var treeview = {
      showRoot: ko.observable(false),
      labelColumnWidth: ko.observable(DEFAULT_LABEL_COLUMN_WIDTH)
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
        return itemToNode(subitem, subkey, label, parents.concat([{key: key, obj: obj, node: node}])); }
    }
  }
  
  // API ------------------------------
  
  return {
    fromJSON: fromJSON
  };
});