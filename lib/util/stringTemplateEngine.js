"use strict";

/*  
  Adapted from MIT-licensed code by Ryan Niemeyer. Thanks!

  MIT license: http://www.opensource.org/licenses/mit-license.php

  Defines a template source that tries to key into an object first to find a template string.
  
 */

var ko = require('knockout');

/* Since this KO extension can be bundled separately to each widget (or collection of widgets),
  we must guard against adding add multiple times.
 */
if (!ko.templates) {
  
  var templates = {},
      data = {},
      engine = new ko.nativeTemplateEngine();
  
  /** Constructor for string templates sources.
   */
  ko.templateSources.stringTemplate = function(template) {
    this.templateName = template;
  };
  
  /** A template source represents a template, and provides it with accessor functions
      for both text (the template code itself) and data.
      Note: I'm not sure in what situations the data part is used; in any case,
      it is not directly exposed to user code.
   */ 
  ko.utils.extend(ko.templateSources.stringTemplate.prototype, {
    
    data: function(key, value) {
      data[this.templateName] = data[this.templateName] || {};
      if (arguments.length === 1) {
        return data[this.templateName][key];
      }
      data[this.templateName][key] = value;
    },
    
    text: function(value) {
      if (arguments.length === 0) {
        return templates[this.templateName];
      }
      console.log('setting the text of a string template!', this.templateName, value);
      templates[this.templateName] = value;
    }
  });
  
  /** This is the method that Knockout calls to obtain a template "source" from
      a template "engine".
   */
  engine.makeTemplateSource = function(template, doc) {
    var elem;
  
    if (typeof template === "string") {
  
      // If template name matches the ID of a DOM element, create a DOM template source
      var elem = (doc || document).getElementById(template);
      if (elem) {
          return new ko.templateSources.domElement(elem);
      }
  
      // Otherwise create a string template source
      return new ko.templateSources.stringTemplate(template);
    }
    else if (template && (template.nodeType == 1) || (template.nodeType == 8)) {
      return new ko.templateSources.anonymousTemplate(template);
    }
  };
  
  // Make the templates accessible to user code.
  ko.templates = templates;
  
  // Make this new template engine our default engine
  ko.setTemplateEngine(engine);
  
} // conditional initialization