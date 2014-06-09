"use strict";

var _ = require('underscore');

var util = require('./util/util');

module.exports = _.extend({
  TreeView    : require('./treeview/treeview'),
  SketchPad   : require('./sketchpad/sketchpad'),
  CommandPanel: require('./commandpanel/commandpanel'),
  ViewModel   : require('./util/viewmodel')
}, util);