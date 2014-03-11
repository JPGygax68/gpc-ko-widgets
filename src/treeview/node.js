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
  
    // Basic structure
    this.treeview = treeview;
    // TODO: should parent and level be observables too ? (in case nodes are being moved around?)
    this.parent = parent;
    this.level = !!parent ? parent.level + 1 : 0;
    this.children = ko.observableArray();
    
    // Essential data: data item and index (within parent data)
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
    console.log('Node.onKeyDown():', self.label(), event, 'key:', event.key);

    // TODO: use a "shortcut" registry to link keyboard input to actions
    // TODO: formalize "actions"
    if      (Keyboard.is(event, 'Down'  )) { if (this.goNextNode    ()) return fullStop(); }
    else if (Keyboard.is(event, 'Up'    )) { if (this.goPreviousNode()) return fullStop(); }
    //else if (Keyboard.is(event, 'Left' )) { if (this.exitNode      ()) return fullStop(); }
    //else if (Keyboard.is(event, 'Right')) { if (this.enterNode     ()) return fullStop(); }

    else if (Keyboard.is(event, 'Left'  )) { if (this.closeNode     ()) return fullStop(); }
    else if (Keyboard.is(event, 'Right' )) { if (this.openNode      ()) return fullStop(); }
    
    else if (Keyboard.is(event, 'Insert')) { if (this.insertBefore  ()) return fullStop(); }
    
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
      if (!!this.parent.onCreateNewChild) {
        var item_index = ko.unwrap(this.index); // the index of this node might change after insertion of new one
        var child_node = this.parent.onCreateNewChild(this.parent.data, item_index);
        if (!!child_node) {
          var node_index = _.indexOf(this.parent.children(), this);
          this.parent.children.splice(node_index, 0, child_node);
          // TODO: sort
          child_node.hasFocus(true);
        }
      }
    }
    return true;
  };
  
  // EXTERNALLY ACCESSIBLE METHODS -----------------
  
  Node.prototype.createChildNode = function(data, index, label, options) {
    console.log('createChildNode()', data, index, label);
    var child = new Node(this.treeview, this.parent, data, index, label);
    if (options.filter) {
      // TODO: wrap the following into a reusable method (and use it in fromModel())
      var usage = options.filter(child, data, index, this);
      if (usage === false) return;
      if (usage instanceof Node) child = usage;
    }
    return child;
  };
  
  Node.prototype.getChildItem = function(index) {
    var count = this.children().length;
    if (index < 0) return;
    if (index >= count) return;
    return this.children()[index];
  };
  
  // EXPORT --------------
  
  return Node;
});