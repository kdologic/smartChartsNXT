'use strict';

import StoreManager from './../liveStore/storeManager';
import UtilCore from './../core/util.core';
import patterns from './../styles/patterns';
import gradients from './../styles/gradients';



/**
 * globalDefs.js
 * @createdOn: 28-Jun-20
 * @author: SmartChartsNXT
 * @description: This components will create and map all global defs i.e. patterns, gradients, images.
 * @extends Component
 */

class GlobalDefs {
  constructor(opts) {
    this.defs = opts || {};
    this.globalStore = StoreManager.getStore('global');
  }

  mapAll() {
    let map = {};
    let elements = [];
    if(this.defs.patterns instanceof Array) {
      this.defs.patterns.map((pattern) => {
        let rid = UtilCore.getRandomID();
        let patternId = pattern.id || 'sc-fill-custom-pattern-' + rid;
        map[pattern.id] = patternId;
        elements.push(patterns.createCustom(pattern, patternId));
      });
    }
    if(this.defs.gradients instanceof Array) {
      this.defs.gradients.map((gradient) => {
        let rid = UtilCore.getRandomID();
        let gradientId = gradient.id || 'sc-fill-custom-gradient-' + rid;
        map[gradient.id] = gradientId;
        elements.push(gradients.createCustom(gradient, gradientId));
      });
    }
    if(this.defs.imagesFill instanceof Array) {
      this.defs.imagesFill.map((image) => {
        let rid = UtilCore.getRandomID();
        let imageId = image.id || 'sc-fill-custom-image-' + rid;
        map[image.id] = imageId;
        elements.push(patterns.createImageType(image, imageId));
      });
    }
    this.globalStore.setValue('defMap', map);
    return elements;
  }
}

export default GlobalDefs;