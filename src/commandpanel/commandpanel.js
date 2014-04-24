"use strict";

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

// We make stuff available by attaching it to the constructor of the CommandPanel class.
CommandPanel.Command = Command;
CommandPanel.Group   = CommandGroup;

// EXPORTS -----------------------

module.exports = CommandPanel;