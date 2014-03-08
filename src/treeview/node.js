"use strict";

define(['./node', './defs', '../util/keyboard', ], function(Node, Defs, Keyboard) {

  "use strict";
  
  function Node(treeview, parent, level, label) {
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
    this.indent = ko.computed( function() {
      // TODO: use treeview properties instead of defaults!
      return level > 0 || this.treeview.showRoot() ? Defs.DEFAULT_HANDLE_WIDTH + Defs.DEFAULT_SPACING_AFTER_HANDLE : 0;
    }, this);
    this.value = ko.observable(null); // default
    this.hasValue = ko.computed( function() { return typeof this.value() !== 'undefined' && this.value() !== null; }, this );
    this.valueTemplateName = ko.observable();
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
    this.labelWidthCss = ko.computed( function() { return this.hasValue() ? this.labelWidth()+'px' : ''; }, this );
    this.labelColspan = ko.computed( function() {
      return (this.leaf() ? 2 : 1) + (this.hasValue() ? 1 : 0);
    }, this);
    this.hasFocus = ko.observable(false);
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
    if      (Keyboard.keyIs(event, 'Down' )) { if (this.goNextNode    ()) return fullStop(); }
    else if (Keyboard.keyIs(event, 'Up'   )) { if (this.goPreviousNode()) return fullStop(); }
    else if (Keyboard.keyIs(event, 'Left' )) { if (this.exitNode      ()) return fullStop(); }
    else if (Keyboard.keyIs(event, 'Right')) { if (this.enterNode     ()) return fullStop(); }
    
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
  
  // EXPORT --------------
  
  return Node;
});