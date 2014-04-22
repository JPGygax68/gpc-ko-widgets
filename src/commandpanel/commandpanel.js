"use strict";

var ko = require('knockout');

var Command = require('./command');

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

function Group() {

  this.commands = ko.observableArray();

  this.top = ko.observable(0);  
  this.height = ko.observable(0);

  this.target = ko.observable(null);   

  this.commands.subscribe( function(changes) {
    changes.forEach( function(change) {
      //change.index, change.status, change.value
      // So we don't have to pass owner when constructing objects
      if (change.status === 'added') change.value._owner = this;
    }, this);
  }, this, 'arrayChange');  
}

Group.prototype._delegated_keydown = function(view_model, event) {
  //console.log('_delegated_keydown()');
  
  for (var i = 0; i < this.commands().length; i ++) {
    var cmd = this.commands()[i];
    if (ko.unwrap(cmd.enabled)) {
      if (typeof cmd.shortcut !== 'undefined' && Keyboard.is(event, cmd.shortcut)) { 
        cmd.trigger();
        event.preventDefault();
        event.stopPropagation();
        break;
      }
    }
  }
};

Group.prototype.setTargetZone = function(x, y, w, h) {
  //console.log('Group::setTargetZone()', x, y, w, h);
  
  this.top( y + h / 2 );
  this.height( h );
};

Group.prototype.alignWithElement = function(elt) {
  var rect = elt.getBoundingClientRect();
  this.setTargetZone(rect.left, rect.top, rect.width, rect.height);
};

Group.prototype.delegate = function(event_name, view_model, event_data) {
  //console.log('Group::delegate()', event_name, view_model, event_data);
  
  return this['_delegated_'+event_name](view_model, event_data);
};

// We make stuff available by attaching it to the constructor of the CommandPanel class.
CommandPanel.Command = Command;
CommandPanel.Group   = Group;

// EXPORTS -----------------------

module.exports = CommandPanel;