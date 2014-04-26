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

var Command = require('./command');

var CommandGroup = require('./commandgroup');

var templates = require('../../generated/commandpanel/templates');
  
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