'use strict';

import StoreManager from './../../liveStore/storeManager';
import UtilCore from './../../core/util.core';
import patterns from './../patterns/patterns';
import gradients from './../gradients/gradients';
import { IGlobalDefs } from './globalDefs.model';
import Store from '../../liveStore/store';
import { IVnode } from '../../viewEngin/component.model';
import { IObject } from '../../viewEngin/pview.model';
import { IDefImageFill, IPattern } from '../patterns/patterns.model';
import { IGradient } from '../gradients/gradients.model';

/**
 * globalDefs.ts
 * @createdOn: 28-Jun-20
 * @author: SmartChartsNXT
 * @description: This components will create and map all global defs i.e. patterns, gradients, images.
 * @extends Component
 */

class GlobalDefs {
  private defs: IGlobalDefs;
  private globalStore: Store;

  constructor(opts: IGlobalDefs) {
    this.defs = opts || {};
    this.globalStore = StoreManager.getStore('global');
  }

  mapAll(): IVnode[] {
    let map: IObject = {};
    let elements: IVnode[] = [];
    if (this.defs.patterns instanceof Array) {
      this.defs.patterns.forEach((pattern: IPattern) => {
        let rid = UtilCore.getRandomID();
        let patternId = pattern.id || 'sc-fill-custom-pattern-' + rid;
        map[pattern.id] = patternId;
        elements.push(patterns.createCustom(pattern, patternId));
      });
    }
    if (this.defs.gradients instanceof Array) {
      this.defs.gradients.forEach((gradient: IGradient) => {
        let rid = UtilCore.getRandomID();
        let gradientId = gradient.id || 'sc-fill-custom-gradient-' + rid;
        map[gradient.id] = gradientId;
        elements.push(gradients.createCustom(gradient, gradientId));
      });
    }
    if (this.defs.imagesFill instanceof Array) {
      this.defs.imagesFill.forEach((image: IDefImageFill) => {
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