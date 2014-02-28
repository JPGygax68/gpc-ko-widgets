(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define([], factory);
    } else {
        // Instead of using a simple global, we are severely namespacing our stuff
        root.gpc = root.gpc || {};
        root.gpc.ko_widgets = root.gpc.ko_widgets || {};
        root.gpc.ko_widgets.treeView = factory();
    }
}(this, function () {
  // AMD module will be inserted after this line
  