'use strict';
var LayerControlView = require('./../control-view');

var ControlCanvasLayerView = VFDeps.View.extend({
  template: '<section class="canvas-layer">' +
    '<header class="columns">' +
      '<div class="column no-grow"><button name="active"></button></div>' +
      '<div class="column no-grow"><button class="edit-draw-function vfi-cog-alt"></button></div>' +
      '<h3 class="column canvas-layer-name gutter-horizontal" data-hook="name"></h3>' +
      '<div class="column no-grow text-right"><button class="vfi-trash-empty remove-canvas-layer"></button></div>' +
    '</header>' +
    '</section>',

  derived: {
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  },

  events: {
    'click .remove-canvas-layer': '_removeLayer',
    'click .edit-draw-function': '_editDrawFunction',
    'click [name="active"]': '_toggleActive',
    'click .canvas-layer-name': '_showMappings'
  },

  _showMappings: LayerControlView.prototype._showMappings,
  _toggleActive: LayerControlView.prototype._toggleActive,

  _editDrawFunction: function () {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'drawFunction');
    }
    else {
      console.warn('A function is already being edited');
    }
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
        selector: '[name="active"]',
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

module.exports = LayerControlView.types.canvas = LayerControlView.extend({
  template: '<section class="row canvas-control">' +
      '<header class="rows">' +
        '<div class="row columns">' +
          '<div class="column no-grow"><button class="active prop-toggle"></button></div>' +
          '<h3 class="column layer-name" data-hook="name"></h3>' +
        '</div>' +

        '<div class="row columns gutter-left">' +
          '<div class="column"><input type="text" placeholder="new-layer-name" data-hook="new-layer-name" /></div>' +
          '<div class="column"><input type="text" placeholder="propA, propB" data-hook="new-layer-props" /></div>' +
          '<div class="column no-grow">' +
            '<button name="add-layer" class="vfi-plus"></button>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<div class="layers">' +
        '<div class="items"></div>' +
      '</div>' +
    '</section>',

  events: VFDeps.assign({
    'change [data-hook=new-layer-name]': '_inputLayerName',
    'click [name=add-layer]': '_addLayer'
  }, LayerControlView.prototype.events),

  _inputLayerName: function() {
    this.query('[name=add-layer]').disabled = !this.queryByHook('new-layer-name').value.trim();
  },

  _addLayer: function(evt) {
    evt.preventDefault();
    var nameEl = this.queryByHook('new-layer-name');
    var name = nameEl.value.trim();
    var propsEl = this.queryByHook('new-layer-props');
    var propsVal = propsEl ? propsEl.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];

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
    nameEl.value = '';
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