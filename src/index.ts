'use strict';

import StoreManager from './liveStore/storeManager';
import Core from './core/chart.core';
import UtilCore from './core/util.core';
import { OPTIONS_TYPE, CHART_TYPE } from './settings/globalEnums';
import { COLOR_STRINGS, RAINBOW_COLOR_MODEL, COLOR_MODEL } from './core/fillColorModel';
import defaultConfig from './settings/config';
import * as helperMethods from './globalMethods/helperMethods';
import Easing from './plugIns/easing';
StoreManager.createStore('global', {});

declare global {
  var $SC: SmartChartsNXT
  interface Window {
    $SC: SmartChartsNXT
    msCrypto: any
  }
}

/**
 * index.ts
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: Initialize the chart library.
 * Using namespace SmartChartsNXT
 * @module: SmartChartsNXT
 */

class SmartChartsNXT extends Core {
  public version = '__version__';
  public CHART_TYPE = CHART_TYPE;
  public ENUMS: OPTIONS_TYPE = new OPTIONS_TYPE();
  public GLOBAL = { ...defaultConfig };
  public COLOR_STRINGS = UtilCore.deepFreeze({ ...COLOR_STRINGS });
  public COLOR_MODEL = UtilCore.deepFreeze(COLOR_MODEL);
  public RAINBOW_COLOR_MODEL = UtilCore.deepFreeze(RAINBOW_COLOR_MODEL);
  public HELPER = { ...helperMethods };
  public EASING = UtilCore.deepFreeze(Easing);
  public IESupport: any;

  constructor() {
    super();
    window && !window.$SC && (window.$SC = this);
  }
};

export default new SmartChartsNXT();