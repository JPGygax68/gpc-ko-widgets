"use strict";

var ko = require('knockout');
console.log('ko:', ko);

//var TreeView = gpc.kowidgets.TreeView;  // from global
var TreeView     = require('gpc-ko-widgets/treeview');   // CommonJS style
var SketchPad    = require('gpc-ko-widgets/sketchpad');
var CommandPanel = require('gpc-ko-widgets/commandpanel');

/*
var myViewModel = {
  treeView: {
    name: 'Root Node',
    children: [
      { name: 'Child #1', children: [] },
      { name: 'Child #2' }
    ]
  }
};
*/

var data = {
  "id": 112,
  "width": 557,
  "height": 561,
  "name": "RhB Ge 6/6 I Vakuummanometer",
  "texture_file": "rhb\\RhB_Ge66_Vakuumanometer.png",
  "indicators": [
    {
      "type": 0,
      "width": 244,
      "height": 36,
      "name": "RhB Vakuumbremse Behälter",
      "min": 4,
      "max": 75.8,
      "center_x": 18,
      "center_y": 18,
      "adjustments": [
        {
          "actual": 0,
          "set": 0
        },
        {
          "actual": 76,
          "set": 76
        },
        {
          "actual": 6,
          "set": 10
        },
        {
          "actual": 11.5,
          "set": 15
        },
        {
          "actual": 16.4,
          "set": 20
        },
        {
          "actual": 21.42,
          "set": 25
        },
        {
          "actual": 26.8,
          "set": 30
        },
        {
          "actual": 32.1,
          "set": 35
        },
        {
          "actual": 37.7,
          "set": 40
        },
        {
          "actual": 43,
          "set": 45
        },
        {
          "actual": 48.35,
          "set": 50
        },
        {
          "actual": 53.8,
          "set": 55
        },
        {
          "actual": 59.2,
          "set": 60
        },
        {
          "actual": 64.3,
          "set": 65
        },
        {
          "actual": 69.6,
          "set": 70
        },
        {
          "actual": 74.6,
          "set": 75
        },
        {
          "actual": 1.25,
          "set": 5
        }
      ],
      "textures": [
        {
          "from": 0,
          "to": 77,
          "filename": "rhb\\RhB_Ge66_Vakuumanometer_Zeiger.png"
        }
      ],
      "x": 266,
      "y": 280,
      "angle_from": -255,
      "angle_to": -105
    },
    {
      "type": 0,
      "width": 244,
      "height": 36,
      "name": "RhB Vakuumbremse Wagen",
      "min": 0,
      "max": 76,
      "center_x": 18,
      "center_y": 18,
      "adjustments": [
        {
          "actual": 0,
          "set": 0
        },
        {
          "actual": 76,
          "set": 76
        },
        {
          "actual": 1.35,
          "set": 5
        },
        {
          "actual": 6.05,
          "set": 10
        },
        {
          "actual": 11.2,
          "set": 15
        },
        {
          "actual": 16.3,
          "set": 20
        },
        {
          "actual": 21.5,
          "set": 25
        },
        {
          "actual": 26.9,
          "set": 30
        },
        {
          "actual": 32.2,
          "set": 35
        },
        {
          "actual": 37.8,
          "set": 40
        },
        {
          "actual": 43.2,
          "set": 45
        },
        {
          "actual": 48.6,
          "set": 50
        },
        {
          "actual": 53.9,
          "set": 55
        },
        {
          "actual": 59,
          "set": 60
        },
        {
          "actual": 64.45,
          "set": 65
        },
        {
          "actual": 69.5,
          "set": 70
        },
        {
          "actual": 74.55,
          "set": 75
        }
      ],
      "textures": [
        {
          "from": 0,
          "to": 77,
          "filename": "rhb\\RhB_Ge66_Vakuumanometer_Zeiger.png"
        }
      ],
      "x": 304,
      "y": 281,
      "angle_from": 77,
      "angle_to": -76
    }
  ],
  "click_areas": []
};

// Prepare our data model

var myModel = ko.mapping.fromJS( data );

var tv = new TreeView(myModel, { onNewNode: onNewNode });
//tv.showRoot(true);
tv.showValueColumn(true);

var sp = new SketchPad(640, 480);

sp.objects.subscribe( function(changes) {
  console.log('SketchPad objects notification:', changes);
}, this, 'arrayChange');

sp.objects.push( new SketchPad.Image({url: 'data/SampleVial-Full.png'}) );
sp.objects.push( new SketchPad.Polygon({x: -5, y: -5, rotation: 35*Math.PI/180}) );
sp.objects.push( new SketchPad.Polygon({x: 35, y: 35}) );

var list = {

  selected_li: ko.observable(null),
  
  // We handle focus and blur ourselves
  
  focusIn: function(data, event) {
    //console.log('focusIn()', this, data);
    console.assert(event.target.tagName === 'LI');
    this.selected_li( event.target );
    cg1.alignWithElement(event.target);
  },
  
  blur: function(data, event) {
    console.log('blur');
    this.selected_li( null );
  },
  
  // But we delegate keyboard events to the command panel
  
  keyDown: function(data, event) {
    //console.log('list.keyDown()', data, event);    
    cg1.delegate('keydown', data, event);
  },
  
  goTo: function(element) {
    console.assert(element.tagName === 'LI');
    element.focus();
  },
  
  up: function() {
    //console.log('up');
    // TODO: turn the conditional into an assert once the command conditionals work
    if (this.selected_li().previousElementSibling) {
      this.goTo(this.selected_li().previousElementSibling);
    }
  },
  
  down: function() {
    //console.log('down');
    if (this.selected_li().nextElementSibling) {
      this.goTo(list.selected_li().nextElementSibling);
    }
  }
}

var cp = new CommandPanel();
var Command = CommandPanel.Command;

var cg1 = new CommandPanel.Group();
cp.groups.push(cg1);

cg1.commands.push( new Command('Move Up', 
  function() { list.up  (); }, { 
    shortcut: 'UP', 
    enabled: ko.computed(function() { return !!(list.selected_li() && list.selected_li().previousElementSibling); })
      // NOTE: this technique requires separate Command instances for each target that can be attached to the command panel
      //  Not sure whether this could be a problem or not.
  } ) 
);
cg1.commands.push( new Command('Move Down', 
  function() { list.down(); }, { 
    shortcut: 'DOWN',
    enabled: ko.computed(function() { return !!(list.selected_li() && list.selected_li().nextElementSibling); })
  } ) 
);

cg1.target( list );

var cg2 = new CommandPanel.Group();
cg2.commands.push( new Command('To paragraphs', function() { }, { enabled: ko.observable(true) } ) );
cp.groups.push(cg2);

var myViewModel = { 
  page: ko.observable('SketchPad'), //'CommandPanel'),
  treeview    : tv,
  sketchpad   : sp,
  list        : list,
  commandpanel: cp,
  
  goTreeView    : function() { this.page('TreeView'    ); },
  goSketchPad   : function() { this.page('SketchPad'   ); },
  goCommandPanel: function() { this.page('CommandPanel'); },
};

window.sp = sp;

window.start = function() {
  ko.applyBindings(myViewModel);

  var item5 = document.querySelector('#command_panel ul > li:nth-child(5)');
  cg1.alignWithElement(item5);
  
  cg2.alignWithElement( document.querySelector('#command_panel ul') );
};

//----

function onNewNode(node, item, key) {
  //console.log('onNewNode():', node.label() ); // parents.length > 0 ? _.last(parents).key : ''); //node, item, key, parents);
  
  if (!node.parent) {
    console.log('root node');
    node.addChildNode('Size', [item.width, 'x', item.height], { valueTemplateName: 'tmplRow', leaf: true });
  }
  else {
    // Immediate child of root node ?
    if (!node.parent.parent) { 
      if (!_.isObject(ko.unwrap(item))) { console.log(key+':', item); return false; }
    }
    // Adjustments are tabular data that we want to edit
    else if (key === 'adjustments') {
      node.open(false);
      node.onCreateNewChild = function(parent, options) {
      	var index = options.index || 0;
        var _parent = ko.unwrap(parent);
        var subitem = { set: 0, actual: 0 };
        if (index > 0 && index < _parent.length) {
          subitem.set    = interpolate(ko.unwrap(_parent[index-1].set   ), ko.unwrap(_parent[index].set   ));
          subitem.actual = interpolate(ko.unwrap(_parent[index-1].actual), ko.unwrap(_parent[index].actual));
        }
        return ko.mapping.fromJS(subitem);
        //-------
        function interpolate(v1, v2) { return v1 + (v2 - v1) / 2; }
      };
    }
    // Labels
    // TODO: is it wise to have string indices (=keys) wrapped as observables ?
    if (ko.unwrap(node.parent.index) === 'adjustments') {
      //console.log('adding to adjustments');
      node.label = ko.computed(adjustmentLabelFunc, node);
      node.open(false);
    }
    else {
      // Capitalize label
      // TODO: make this a feature of TreeView ?
      if (typeof ko.unwrap(node.label) === 'string' && !ko.isComputed(node.label)) {
        if (typeof node.label() !== 'string') debugger;
        node.label( node.label()[0].toUpperCase() + node.label().slice(1) ); //+ '-' + node.label() + node.label() );
      }
    }
  }

  // How to display "value" cell
  var unwrapped = ko.unwrap(item);
  if (!_.isObject(unwrapped)) {
    if      (_.isNumber (unwrapped)) node.valueTemplateName('tmplNumericField');
    else if (_.isBoolean(unwrapped)) node.valueTemplateName('tmplBooleanField');
    else if (_.isString (unwrapped)) node.valueTemplateName('tmplStringField' );
    else throw new Error('unsupported type for "value" of node');
    node.hasValue(true);
  }
  
  //--------
  
  function adjustmentLabelFunc() { return this.data.set().toString() + ': ' + this.data.actual().toString(); }
}

//----------------------

function test() {
  myModel.indicators()[0].adjustments.push( {
    actual: ko.observable(99),
    set: ko.observable(100)
  });
}
