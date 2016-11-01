'use strict';
var LayerControlView = require('./../control-view');
var DetailsView = require('./../../controller/details-view');

var ControlCanvasLayerView = VFDeps.View.extend({
  template: [
    '<section class="canvas-layer">',
    '<header class="columns">',
    '<div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>',
    '<div class="column no-grow gutter-horizontal"><button class="edit-draw-function vfi-cog-alt"></button></div>',
    '<h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>',
    '<div class="column no-grow text-right gutter-left"><button class="vfi-trash-empty remove-layer"></button></div>',
    '</header>',
    '</section>'
  ].join(''),

  session: {
    showMappings: ['boolean', true, false]
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  },

  events: {
    'click .remove-layer': '_removeLayer',
    'click .edit-draw-function': '_editDrawFunction',
    'click .active.prop-toggle': '_toggleActive',
    'click header [data-hook=name]': '_showMappings'
  },

  _removeLayer: function() {
    this.model.collection.remove(this.model);
  },
  _editDrawFunction: function () {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'drawFunction');
    }
    else {
      console.warn('A function is already being edited');
    }
  },
  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showMappings: function () {
    this.rootView.showDetails(new DetailsView({
      parent: this,
      model: this.model,
    }));
  },

  bindings: {
    'model.active': [
      {
        type: 'booleanClass',
        name: 'disabled',
        invert: true
      },

      {
        type: 'booleanClass',
        selector: '.active.prop-toggle',
        yes: 'vfi-toggle-on',
        no: 'vfi-toggle-off'
      }
    ],

    drawFunction: '[data-hook=drawFunction]',
    'model.name': '[data-hook=name]',
    'model.duration': '[data-hook=duration]',
    'model.fps': '[data-hook=fps]',
    'model.frametime': '[data-hook=frametime]'
  }
});

module.exports = LayerControlView.canvas = LayerControlView.extend({
  template: [
    '<section class="row canvas-control">',
    '<header>',
    '<h3>Canvas</h3>',
    '<div class="columns">',
    '<div class="column gutter-right" contenteditable="true" data-placeholder="new-layer-name" data-hook="new-layer-name"></div>',
    '<div class="column gutter-horizontal" contenteditable="true" data-placeholder="propA, propB" data-hook="new-layer-props"></div>',
    '<div class="column no-grow gutter-left">',
    '<button name="add-layer" class="vfi-plus"></button>',
    '</div>',
    '</div>',
    '</header>',

    '<div class="layers">',
    '<div class="items"></div>',
    '</div>',
    '</section>'
  ].join(''),

  events: {
    'input [data-hook=new-layer-name]': '_inputLayerName',
    'click [name=add-layer]': '_addLayer'
  },

  _inputLayerName: function() {
    this.query('[name=add-layer]').disabled = !this.queryByHook('new-layer-name').textContent.trim();
  },

  _addLayer: function(evt) {
    evt.preventDefault();
    var nameEl = this.queryByHook('new-layer-name');
    var name = nameEl.textContent.trim();
    var propsEl = this.queryByHook('new-layer-props');
    var propsVal = propsEl ? propsEl.textContent.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];

    var props = {};
    propsVal.forEach(function(prop) {
      props[prop] = 'any';
    });
    var res = this.model.canvasLayers.add({
      name: name,
      drawFunction: 'function(ctx) {\n  // ' + name + ' drawFunction\n}',
      props: props
    });

    if (!res) {
      console.warn('new layer?', res);
      return;
    }
    nameEl.textContent = '';
    var layerControlView = this.model.canvasLayersView.views.find(function(v) {
      return v.model === res;
    });
    if (!layerControlView.codeEditor.changed) {
      layerControlView.codeEditor.edit(res, 'drawFunction');
    }
  },

  initialize: function () {
    this.once('change:rendered', this._inputLayerName);
  },


  subviews: {
    canvasLayersView: {
      waitFor: 'el',
      selector: '.layers .items',
      prepareView: function (el) {
        return this.renderCollection(this.model.canvasLayers, ControlCanvasLayerView, el);
      }
    }
  }
});