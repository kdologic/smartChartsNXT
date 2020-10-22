'use strict';

import StoreManager from './liveStore/storeManager';
import Core from './core/chart.core';
import UtilCore from './core/util.core';
import { OPTIONS_TYPE, CHART_TYPE } from './settings/globalEnums';
import { COLOR_STRINGS, RAINBOW_COLOR_MODEL, COLOR_MODEL } from './core/fillColorModel';
import defaultConfig from './settings/config';
import * as helperMethods from './globalMethods/helperMethods';
import Easing from './plugIns/easing';

/**
 * index.js
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: Initialize the chart library.
 * Using namespace SmartChartsNXT
 */

StoreManager.createStore('global', {});
const SmartChartsNXT = new Core();
SmartChartsNXT.version = '__version__';
SmartChartsNXT.CHART_TYPE = UtilCore.deepFreeze({ ...CHART_TYPE });
SmartChartsNXT.ENUMS = UtilCore.deepFreeze({ ...OPTIONS_TYPE });
SmartChartsNXT.GLOBAL = { ...defaultConfig };
SmartChartsNXT.COLOR_STRINGS = UtilCore.deepFreeze({ ...COLOR_STRINGS });
SmartChartsNXT.COLOR_MODEL = UtilCore.deepFreeze(COLOR_MODEL);
SmartChartsNXT.RAINBOW_COLOR_MODEL = UtilCore.deepFreeze(RAINBOW_COLOR_MODEL);
SmartChartsNXT.HELPER = { ...helperMethods };
SmartChartsNXT.EASING = UtilCore.deepFreeze(Easing);

export default SmartChartsNXT;

if (typeof window !== 'undefined') {
  window.SmartChartsNXT = SmartChartsNXT;
  window.$SC = SmartChartsNXT;
}