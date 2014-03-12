"use strict";

define(['./node', './defs', '../util/keyboard', ], function(Node, Defs, Keyboard) {

  "use strict";
  
  /*  TODO: assigning the label at construction time is not really satisfactory, because the label can
      later be replaced (e.g. by a computed observable). This wastes cycles. More importantly, it is 
      not possible to supply a computed observable, as those as per the KO rules will be evaluated 
      immediately (to determine dependency chains), before the node even exists, so "this" will not
      be available.
      
      Possibilities:
      - Introduce a init() method, to be called when the node has been fully defined. init() would 
        "fill in the blanks", i.e. provide a default label if none has been defined at that point.
      - Remove/replace observables depending on the label (labelWidth), so that the label
        can be set at any time.
      - Allow specifying a function for the label, which would be used to create a computed observable
   */
   
  function Node(treeview, parent, data, index, label) {
  
    var self = this;
    
    // Basic structure
    this.treeview = treeview;
    // TODO: should parent and level be observables too ? (in case nodes are being moved around?)
    this.parent = parent;
    this.level = !!parent ? parent.level + 1 : 0;
    this.children = ko.observableArray();
    
    // Essential data: data item and index/key within parent (=container)
    this.data = data;
    if (_.isFunction(index)) this.index = ko.computed(index);
    else if ( _.isNumber(index)) this.index = ko.observable(index);
    else this.index = index;
    
    // The label is mandatory: either a simple value (string) or a function that will be used as a computed
    if (typeof label !== 'undefined') {
      if (typeof label === 'function') this.label = ko.computed(label, this);
      else this.label = ko.observable( label.toString() );
    }
    else if (this.parent && _.isArray(ko.unwrap(this.parent.data))) {
      this.label = ko.observable( function() { return '#' + ko.unwrap(this.index); }, this );
    }
    else this.label = ko.observable(); // To be given a value externally!

    // Configuration
    this.leaf = ko.observable(false);
    this.hasValue = ko.observable(false);
    this.valueTemplateName = ko.observable();
    this.value = ko.observable();
    
    // Interaction
    this.open = ko.observable(true);
    this.hasFocus = ko.observable(false);
    
    // Computed information for DOM and CSS
    this.cssString = ko.computed( function() {
      var classes = [];
      if (this.open()) classes.push('open'); else classes.push('closed');
      classes.push( 'level' + this.level ); // TODO: observable ?
      return classes.join(' ');
    }, this);
    this.indent = ko.computed( function() {
      // TODO: use treeview properties instead of defaults!
      return this.level > 0 || this.treeview.showRoot() ? Defs.DEFAULT_HANDLE_WIDTH + Defs.DEFAULT_SPACING_AFTER_HANDLE : 0;
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
    this.labelColspan = ko.computed( function() {
      return (this.leaf() ? 2 : 1) + (this.treeview.showValueColumn() ? 1 : 0);
    }, this);

    // Subscribe changes to observableArray, so we can add nodes as needed
    if (ko.isObservable(data) && _.isArray(data())) {
      data.subscribe( function(changes) { 
        _.each(changes, function(change) {
          if (change.status === 'added') {
            //console.log('item added to array:', change.status, change.value, change.index); 
            // Find the index of the sibling node representing the item preceding the inserted one
            for (var i = 0; i < self.children().length; i++) {
              var succ = self.children()[i];
              if (change.index <= ko.unwrap(succ.index)) break;
            }
            var node_index = ko.unwrap(succ.index);
            // Create a new node to represent the added item
            //console.log('index of corresponding sibling node:', node_index);
            var new_node = Node.fromModel(change.value, self.treeview, { 
              onNewNode: self.treeview.options.onNewNode,
              key: change.index,
              parent: self
            });
            // Now insert the new node
            if (!!new_node) {
              self.children.splice(node_index, 0, new_node);
              if (self._addingChildItem && change.value === self._addingChildItem.item && self._addingChildItem.parent === data()) {
                new_node.hasFocus(true);
                //console.log('focus set to newly added node');
                delete self._addingChildItem;
              }
            }
          }
          else if (change.status === 'removed') {
            // TODO
          }
        });
      }, null, 'arrayChange');
    }
  }

  // INTERNAL METHODS -------------------------
  
  Node.prototype._getSiblingOf = function(child, offset) {
    var i = _.indexOf(this.children(), child);
    if (i < 0) throw new Error('_getSiblingOf(): starting node not found among children of parent');
    if ((i + offset) >= 0 && (i + offset) < this.children().length) return this.children()[i + offset]; else return null;
  };
  
  Node.prototype._goToSibling = function(offset) {
    if (!!this.parent) {
      var sibling = this.parent._getSiblingOf(this, offset);
      if (!!sibling) { sibling.hasFocus(true); return true; }
    }
  };
  
  Node.prototype._createChildNode = function(data, index, label, options) {
    console.log('_createChildNode()', data, index, label);
    var child = new Node(this.treeview, this, data, index, label);
    if (options.onNewNode) {
      var usage = options.onNewNode(child, data, index, this);
      if (usage === false) return;
      if (usage instanceof Node) child = usage;
    }
    return child;
  };
  
  // EVENT HANDLERS -----------------------------
  
  Node.prototype.onClick = function(self, event) {
    console.log('Node.onClick():', self, event);
    self.open( !self.open() );
    event.preventDefault();
    event.stopPropagation();
  };
  
  Node.prototype.onMouseOverLabel = function(self, event) {
    //console.log('Node.onMouseOverLabel():', self, event);
  };
  
  Node.prototype.onMouseLeaveLabel = function(self, event) {
    //console.log('Node.onMouseLeaveLabel():', self, event);
  };
  
  Node.prototype.onKeyDown = function(self, event) {
    console.log('Node.onKeyDown(); self:', self, ', this:', this, 'event.target:', event.target);

    // TODO: use a "shortcut" registry to link keyboard input to actions
    // TODO: formalize "actions"
    // TODO: better way to find out whether should be handled here ?
    if (event.target.className.split(' ').indexOf('header-row') >= 0) {
      if      (Keyboard.is(event, 'Down'  )) { if (this.goNextNode    ()) return fullStop(); }
      else if (Keyboard.is(event, 'Up'    )) { if (this.goPreviousNode()) return fullStop(); }

      else if (Keyboard.is(event, 'Left'  )) { if (this.closeNode     ()) return fullStop(); }
      else if (Keyboard.is(event, 'Right' )) { if (this.openNode      ()) return fullStop(); }
      
      else if (Keyboard.is(event, 'Insert')) { if (this.insertBefore  ()) return fullStop(); }
    }
    
    return true;
    
    //--------
    
    function fullStop() { event.stopPropagation(); return false; }
  };

  // ACTIONS ---------------------
  
  // Note: Actions return true when successful
  
  /** Move (focus) to the next node. The "next" node is the one that follows *visually*, i.e.
      not necessarily on the same level.
   */
  Node.prototype.goNextNode = function() {
    if (!!this.parent) {
      if (this.open() && this.children().length > 0) { 
        this.children()[0].hasFocus(true); 
        return true; 
      }
      else {
        var node = this;
        var sibling;
        do {
          sibling = node.parent._getSiblingOf(node, 1);
          node = node.parent;
        } while (!sibling);
        sibling.hasFocus(true);
        return true;
      }
    }
  };
  
  /** Move (focus) to the previous node. The "previous" node is the one that precedes the
      current one *visually*, i.e. not necessarily on the same level.
   */
  Node.prototype.goPreviousNode = function() { 
    if (!!this.parent) {
      var sibling = this.parent._getSiblingOf(this, -1);
      if (!!sibling) {
        // Find "last visible descendant" of previous node
        while (!!sibling && sibling.open() && sibling.children().length > 0) {
          sibling = sibling.children()[sibling.children().length - 1];
        }
      }
      else sibling = this.parent;
      sibling.hasFocus(true);
      return true;
    }
  };
  
  Node.prototype.enterNode = function() {
  
    if (this.children().length > 0) {
      if (!this.open()) this.open(true);
      this.children()[0].hasFocus(true);
      return true;
    }
  };
  
  Node.prototype.exitNode = function() {
  
    if (!!this.parent) {
      this.parent.hasFocus(true);
      return true;
    }
  };

  Node.prototype.openNode = function() {
    this.open(true);
    return true;
  };
  
  Node.prototype.closeNode = function() {  
    this.open(false);
    return true;
  };
  
  Node.prototype.insertBefore = function() {
    console.log('insertBefore()');
    if (!!this.parent) {
      // We can only insert if the underlying observableArray has onCreateNewChild() attached
      if (!!this.parent.onCreateNewChild) {
        var item_index = ko.unwrap(this.index); // the index of this node might change after insertion of new one
        // TODO: wrap this in a try..catch
        var child_item = this.parent.onCreateNewChild(this.parent.data, item_index);
        this.parent._addingChildItem = { item: child_item, parent: ko.unwrap(this.parent.data) };
        this.parent.data.splice(item_index, 0, child_item);
        console.assert(typeof this._addingItem === 'undefined');
      }
    }
    return true;
  };
  
  // STATIC METHODS ---------------------------
  
  Node.fromModel = function(item, treeview, options) {
  
    var options = options || {};
    var label;
    if (typeof options.label !== 'undefined') label = options.label;
    else if (typeof options.key !== 'undefined') label = options.key;
  
    return itemToNode(item, options.key, label, options.parent);
    
    //-------
  
    function itemToNode(item, key, label, parent) {
      //console.log('itemToNode()', item, parent);
      
      var node = new Node(treeview, parent, item, key, label);
      
      node.leaf( !_.isObject(item) );
      var usage = options.onNewNode ? options.onNewNode(node, item, key, parent) : node;
      
      if (usage !== false) {
        
        if (typeof usage !== 'undefined') { 
          // TODO: special usage options
        }
        
        if (isArray(item)) {
          if (!node.leaf()) {
            var subitems = _.filter(ko.unwrap(item), function(subitem) { return isObject(subitem); } );
            _.each(subitems, function(subitem, index) {
              //console.log('array child node #'+index+':', item.toString(), parents.length);
              var child = makeChildNode(subitem, 
                function() { return _.indexOf(node.children(), child); }, 
                function() { return '#' + (_.indexOf(node.children(), child) + 1); });
              if (child) {
                // TODO: recurse depending on item type
                node.children.push( child );
              }
            });
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
      
      function makeChildNode(subitem, subkey, label) { return itemToNode(subitem, subkey, label, node); }
    }
  };

  // EXTERNALLY ACCESSIBLE METHODS -----------------
  
  Node.prototype.getChildItem = function(index) {
    var count = this.children().length;
    if (index < 0) return;
    if (index >= count) return;
    return this.children()[index];
  };
  
  // EXPORT --------------
  
  return Node;
});