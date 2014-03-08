"use strict";

define(['./node', './defs'], function(Node, Defs) {

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
  
  //Node.prototype.getSuccessorOf   = function(child) { return this._getSiblingOf(child,  1); }  
  //Node.prototype.getPredecessorOf = function(child) { return this._getSiblingOf(child, -1); }
  
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
    if      (!!event.key ? (event.key === 'Down') : (event.which === 40)) { if (this.goToSuccessor  ()) return; }
    else if (!!event.key ? (event.key === 'Up'  ) : (event.which === 38)) { if (this.goToPredecessor()) return; }
    
    return true;
  };

  // ACTIONS ---------------------
  
  Node.prototype.goToSuccessor   = function() { return this._goToSibling( 1); }
  
  Node.prototype.goToPredecessor = function() { return this._goToSibling(-1); }
  
  // EXPORT --------------
  
  return Node;
});