"use strict";

var ko = require('knockout');

var Command = require('./command');

var templates = require('../../generated/commandpanel/templates');
  
// Store our templates in the string template engine (guarded)
if (typeof ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] === 'undefined') {
  ko.utils.extend(ko.templates, templates);
  ko.templates['__HAS_COMMANDPANEL_TEMPLATES__'] = 'YES';
}

function CommandPanel(target) {

  this.target = target;
  
  this.top = ko.observable(0);
  
  this.commands = ko.observableArray();
  
  this.commands.subscribe( function(changes) {
    changes.forEach( function(change) {
      //change.index, change.status, change.value
      // So we don't have to pass owner when constructing objects
      if (change.status === 'added') change.value._owner = this;
    }, this);
  }, this, 'arrayChange');
  
}

CommandPanel.prototype._delegated_keydown = function(view_model, event) {
  console.log('_delegated_keydown()');
  
  for (var i = 0; i < this.commands().length; i ++) {
    var cmd = this.commands()[i];
    if (typeof cmd.shortcut !== 'undefined' && Keyboard.is(event, cmd.shortcut)) { 
      cmd.trigger();
      event.preventDefault();
      event.stopPropagation();
      break;
    }
  }
};

CommandPanel.prototype.setTargetZone = function(x, y, w, h) {
  console.log('CommandPanel::setTargetZone()', x, y, w, h);
  
  this.top( y + h / 2 );
};

CommandPanel.prototype.alignWithElement = function(elt) {
  var rect = elt.getBoundingClientRect();
  this.setTargetZone(rect.left, rect.top, rect.width, rect.height);
};

CommandPanel.prototype.delegate = function(event_name, view_model, event_data) {
  console.log('CommandPanel::delegate()', event_name, view_model, event_data);
  
  return this['_delegated_'+event_name](view_model, event_data);
};

// The Command class must be made available

CommandPanel.Command = Command;

module.exports = CommandPanel;