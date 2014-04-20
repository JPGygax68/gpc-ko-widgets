"use strict";

var ko = require('knockout');

var Command = require('./command');

var templates = require('../../generated/commandpanel/templates');
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] = 'YES';
}

function CommandPanel(commands) {

  this.commands = ko.observableArray();
}

// The Command class must be made available
CommandPanel.Command = Command;

module.exports = CommandPanel;