GPC-KO-Widgets
==============

### A Knockout-based collection (in embryo state) of reusable JavaScript widgets

Disclaimer
----------

In its present state, this project is little more than a proof of concept, though it does contain one usable widget (`TreeView`).


Quick Start
-----------

First, obtain the package via `npm install gpc-ko-widgets`.

GPC-KO-Widgets is built for consumption via [browserify](https://github.com/substack/node-browserify). Browserify not only handles module imports, but CSS injection as well by making use of the excellent [cssify](https://github.com/davidguttman/cssify) transform.


First off, your code will of course need [knockout](http://knockoutjs.com/), as well as its plugin [knockout-mapping](http://knockoutjs.com/documentation/plugins-mapping.html):

```js
var ko = require('knockout');
var ko.mappings = require('knockout.mappings');
```

To be able to use a widget, your code must also import the module implementing its view model:

```js
var TreeView = require('gpc-ko-widgets/treeview');
```

Instantiating a widget is a matter of using Knockout's `template` binding, like so:

```html
div(data-bind="template: { name: 'gktvTreeView', data: myTreeview }")
```

... and providing a TreeView object as part of your Knockout view-model:

```javascript
var myTree = {
    'Item 1': {},
    'Item 2': {
        'Subitem 2.1': {},
        'Subitem 2.2': {},
    },
    'Item 3': {}
};

var myViewModel = { 
    myTreeview: new gpc.kowidgets.TreeView( ko.mapping.fromJS(myTree) ),
};

/* Called from body.onload (or as part of jQuery "ready" function) */
window.start = function() {
    ko.applyBindings(myViewModel);
}
```

And that's it! Thanks to Browserify and friends, you don't have to worry about copying CSS files and referencing them from your HTML.

More to come
------------

There is quite a bit more to say about this project, but I'm out time at the moment. Stay tuned for an explanation of how GPC-KO-Widgets leverages both [Jade](http://jade-lang.com/) and Knockout templates, and how it uses actual data models on top of Knockout's usual view models.
