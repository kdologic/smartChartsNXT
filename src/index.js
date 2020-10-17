'use strict';

import StoreManager from './liveStore/storeManager';
import Core from './core/chart.core';
import utilCore from './core/util.core';
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
SmartChartsNXT.CHART_TYPE = utilCore.deepFreeze({ ...CHART_TYPE });
SmartChartsNXT.ENUMS = utilCore.deepFreeze({ ...OPTIONS_TYPE });
SmartChartsNXT.GLOBAL = { ...defaultConfig };
SmartChartsNXT.COLOR_STRINGS = utilCore.deepFreeze({ ...COLOR_STRINGS });
SmartChartsNXT.COLOR_MODEL = utilCore.deepFreeze(COLOR_MODEL);
SmartChartsNXT.RAINBOW_COLOR_MODEL = utilCore.deepFreeze(RAINBOW_COLOR_MODEL);
SmartChartsNXT.HELPER = { ...helperMethods };
SmartChartsNXT.EASING = utilCore.deepFreeze(Easing);

export default SmartChartsNXT;

if (typeof window !== 'undefined') {
  window.SmartChartsNXT = SmartChartsNXT;
  window.$SC = SmartChartsNXT;
}