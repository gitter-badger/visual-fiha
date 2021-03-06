'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: function() {
    return '<video layer-id="' + this.model.cid + '" view-id="' + this.cid + '" autoplay loop muted></video>';
  },

  bindings: VFDeps.assign({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});