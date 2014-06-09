"use strict";

/* A Command Panel (per the current definition) is actually a sub-panel, intended to be 
  placed into a "side panel", i.e. a vertical strip set aside on the right side of a wide
  screen and intended to visually guide the user.
  The purpose of the Command Panel is to show to the user what commands are capable of
  acting on the data being edited in the main portion of the screen.
  Commands are organized into groups, the visual representation of which try to "follow"
  the "target zone", i.e. the visual representation of the part of the data that the 
  commands in that group would act upon.
 */
 
var ko = require('knockout');

var Command = require('./lib/commandpanel/command');

var CommandGroup = require('./lib/commandpanel/commandgroup');

var templates = require('./generated/commandpanel/templates');
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] = 'YES';
}

function CommandPanel() {

  this.groups = ko.observableArray();  
  this.groups.subscribe( function(changes) {
    changes.forEach( function(change) {
      //change.index, change.status, change.value
      // So we don't have to pass owner when constructing objects
      if (change.status === 'added') change.value._panel = this;
    }, this);
  }, this, 'arrayChange');  
}

CommandPanel.prototype.init = function(element, valueAccessor, allBindings, viewModel, bindingContext) {

  this.element = element;
};

CommandPanel.prototype.reflow = function(focused_group) {
  console.log('CommandPanel::reflow()');

  var ymin = 32767;
  var elements = this.element.getElementsByClassName('group');
  //console.log(''+elements.length+' group elements');

  // Analyze our group elements
  var focused_elt = null, focused_index = -1;
  var positions = [];
  for (var i = 0; i < elements.length; i++) {
    var elt = elements[i];
    var group = ko.dataFor(elt);
    if (group === focused_group) { focused_index = i; focused_elt = elt; }
    positions.push( {pos: group.position(), element: elt } );
  }
  
  // Sort by position
  var focused = positions[focused_index];
  positions.sort( function(a, b) { return a.pos - b.pos; } );  
  var focused_index = positions.indexOf(focused);  
  console.log('focused_index:', focused_index, 'focused element:', focused_elt);
  
  // Re-arrange predecessors upward from focused element
  if (focused_index > 0) {
    console.log('predecessors: focused_index =', focused_index);
    var pos = focused_group.position();
    for (var i = 0; i < focused_index; i ++) {
      var elt = positions[i].element;
      var group = ko.dataFor(elt);
      pos -= 5 + elt.offsetHeight;
      if (pos < group.position()) group.attachmentOffset( pos - group.position() ); else { group.attachmentOffset(0); pos = group.position(); }
    }
  }
  
  // ..and successors downward
  if (focused_index < (positions.length-1)) {
    console.log('successors: focused_index =', focused_index);
    var pos = focused_group.position() + focused_elt.offsetHeight;
    console.log('initial pos:', pos, focused_group.position());
    for (var i = focused_index + 1; i < positions.length; i ++) {
      pos += 5;
      var elt = positions[i].element;
      var group = ko.dataFor(elt);
      console.log('pos:', pos, 'successor element:', elt, 'successor pos:', group.position());
      if (pos > group.position()) group.attachmentOffset(pos - group.position()); else { group.attachmentOffset(0); pos = group.position(); }
      pos += elt.offsetHeight;
    }
  }
};

// We make stuff available by attaching it to the constructor of the CommandPanel class.
CommandPanel.Command = Command;
CommandPanel.Group   = CommandGroup;

// Custom binding --------------------------------------------------

ko.bindingHandlers.gpc_kowidgets_commandpanel = {
  
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called when the binding is first applied to an element
    // Set up any initial state, event handlers, etc. here
    
    bindingContext.$rawData.init(element);
  },
  
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called once when the binding is first applied to an element,
    // and again whenever the associated observable changes value.
    // Update the DOM element based on the supplied values here.
  }
};

// EXPORTS -----------------------

module.exports = CommandPanel;