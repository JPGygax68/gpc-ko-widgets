"use strict";

var ko = require('knockout');

var Command = require('./command');

function CommandGroup() {

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

CommandGroup.prototype._delegated_keydown = function(view_model, event) {
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

CommandGroup.prototype.setTargetZone = function(x, y, w, h) {
  //console.log('CommandGroup::setTargetZone()', x, y, w, h);
  
  this.top( y + h / 2 - this._panel.element.getBoundingClientRect().top );
  this.height( h );
  
};

CommandGroup.prototype.alignWithElement = function(elt) {
  var rect = elt.getBoundingClientRect();
  this.setTargetZone(rect.left, rect.top, rect.width, rect.height);
};

CommandGroup.prototype.delegate = function(event_name, view_model, event_data) {
  //console.log('CommandGroup::delegate()', event_name, view_model, event_data);
  
  return this['_delegated_'+event_name](view_model, event_data);
};

// EXPORTS -----------------------

module.exports = CommandGroup;