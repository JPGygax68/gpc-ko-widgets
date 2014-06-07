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

To use
```html
<head>
    <script type="text/javascript" src="scripts/knockout.min.js"></script>
    <script type="text/javascript" src="scripts/gpc-ko-widgets/treeview.js"></script>
    <link rel="stylesheet" href="scripts/gpc-ko-widgets/treeview.css"/>
</head>
```

