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
   
  function Node(treeview, parent, level, label) {
  
    console.assert(typeof label !== 'undefined');
    
    // Basic structure: parents and children
    this.treeview = treeview;
    // TODO: should parent and level be observables too ? (in case nodes are being moved around?)
    this.parent = parent;
    this.children = ko.observableArray();
    
    // The label is mandatory: either a simple value (string) or a function that will be used as a computed
    if (typeof label === 'function') this.label = ko.computed(label, this);
    else this.label = ko.observable( label.toString() );

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
      classes.push( 'level' + level ); // TODO: observable ?
      return classes.join(' ');
    }, this);
    this.indent = ko.computed( function() {
      // TODO: use treeview properties instead of defaults!
      return level > 0 || this.treeview.showRoot() ? Defs.DEFAULT_HANDLE_WIDTH + Defs.DEFAULT_SPACING_AFTER_HANDLE : 0;
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
    console.log('Node.onMouseOverLabel():', self, event);
  };
  
  Node.prototype.onMouseLeaveLabel = function(self, event) {
    console.log('Node.onMouseLeaveLabel():', self, event);
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
    if (!!this.parent) {
      var index = _.indexOf(this.parent.children(), this);
    }
  };
  
  // EXPORT --------------
  
  return Node;
});