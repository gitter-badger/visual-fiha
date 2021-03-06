'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.img = ScreenLayerView.extend({
  template: function() {
    return '<div class="layer-image" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>';
  },

  bindings: VFDeps.assign({
    'model.src': {
      type: function() {
        this.el.style.backgroundImage = 'url(' + this.model.src + ')';
      }
    },
    'model.backgroundSize': {
      type: function() {
        this.el.style.backgroundSize = this.model.backgroundSize;
      }
    },
    'model.backgroundPosition': {
      type: function() {
        this.el.style.backgroundPosition = this.model.backgroundPosition;
      }
    },
    'model.backgroundRepeat': {
      type: function() {
        this.el.style.backgroundRepeat = this.model.backgroundRepeat;
      }
    }
  }, ScreenLayerView.prototype.bindings)
});