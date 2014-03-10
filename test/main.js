"use strict";

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
}      

//console.log('KeyEvent.DOM_VK_DOWN', KeyEvent.DOM_VK_DOWN);

//var arr = ko.observableArray();
//console.log('arr isArray ?', _.isArray(arr()), 'isObservable ?', ko.isObservable(arr));

var myModel = ko.mapping.fromJS( data );

var myViewModel = { treeView: gpc.ko_widgets.treeView.fromModel(myModel, { filter: filter }) };
//myViewModel.treeView.showRoot(true);
myViewModel.treeView.showValueColumn(true);

ko.applyBindings(myViewModel);

//----

function filter(node, item, key, parents) {
  //console.log('filter():', node.label() ); // parents.length > 0 ? _.last(parents).key : ''); //node, item, key, parents);
  if (key === 'adjustments') node.open(false);
  // Non-object items
  var unwrapped = ko.unwrap(item);
  if (!_.isObject(unwrapped)) {
    if      (_.isNumber (unwrapped)) node.valueTemplateName('tmplNumericField');
    else if (_.isBoolean(unwrapped)) node.valueTemplateName('tmplBooleanField');
    else if (_.isString (unwrapped)) node.valueTemplateName('tmplStringField' );
  }
  if (parents.length === 0) {          
  }
  else {
    // 
    var parent = _.last(parents);
    if (parent.key === 'adjustments') {
      node.label = ko.computed( function() { 
        return item.set().toString() + ': ' + item.actual().toString(); });
      if (key === 0) {
        console.log('item.set:', item.set);
        item.set.subscribe( function(newValue) { console.log('new value:', newValue); } );
      }
      node.open(false);
    }
    else {
      // Capitalize label
      if (typeof node.label() === 'string') {
        node.label( node.label()[0].toUpperCase() + node.label().slice(1) ); // + '-' + node.label() );
      }
    }
  }
}

//----------------------

function test() {
  myModel.indicators()[0].adjustments.push( {
    actual: ko.observable(99),
    set: ko.observable(100)
  });
}
