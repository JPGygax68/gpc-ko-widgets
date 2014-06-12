GPC-KO-Widgets
==============

### A Knockout-based collection (in embryo state) of reusable JavaScript widgets

Disclaimer
----------

At its present state, this project is little more than a proof of concept, though it does contain one usable widget (`TreeView`).


Quick Start
-----------

Obtain this package via `npm install gpc-ko-widgets`.

There are two basic ways to use this package. The "quick" way is to use one or more of the provided JavaScript "bundles", each of which provides the full code for a particular widget (i.e. with all the internal dependencies, but without Knockout).

The other way is to use [browserify](https://github.com/substack/node-browserify) to manage the dependencies of your project.


### A) Using the bundles

Find the directory `node_modules/gpc-ko-widgets/dist/`, and then the subdirectory corresponding to the widget you need (e.g. `treeview`). Copy the contents of that subdirectory to a subdirectory `gpc-ko-widgets`of your site's `scripts` directory (which can be named differently of course). [Note: it is of course possible to set aside a subdirectory for each widget if you use more than one, but it shouldn't be necessary; the filenames should not clash.]

To use the widget, the `head` section of your HTML needs to include both the bundle and the CSS file, on top of Knockout:

```html
<script type="text/javascript" src="scripts/knockout/knockout.min.js"></script>
<script type="text/javascript" src="scripts/knockout/knockout.mapping-latest.js"></script>
<script type="text/javascript" src="scripts/gpc-ko-widgets/treeview.js"></script>
<link rel="stylesheet" href="scripts/gpc-ko-widgets/treeview.css"/>
```

Instantiating a widget is a matter of using Knockout's `template` binding, like so:

```html
div(data-bind="template: { name: 'gktvTreeView', data: treeview }")
```

... and preparing the data model prior to initializing Knockout:

```javascript
var myTree = {
    'Item 1': {},
    'Item 2': {
        'Subitem 2.1': {},
        'Subitem 2.2': {}
    }
};

var myViewModel = { 
  treeview    : new TreeView( ko.mapping.fromJS(myTree) ),
  /* other KO viewmodel parts */
};

function start() {
    /* ... other initialization */
    ko.applyBindings(myViewModel);
}

```

