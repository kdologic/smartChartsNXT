'use strict';

import Core from './core/chart.core';
import { OPTIONS_TYPE, CHART_TYPE } from './settings/globalEnums';
import defautlConfig from './settings/config';

/**
 * index.js
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: Initialize the chart library.
 * Using namespace SmartChartsNXT
 */

const SmartChartsNXT = new Core();
SmartChartsNXT.CHART_TYPE = { ...CHART_TYPE };
SmartChartsNXT.ENUMS = { ...OPTIONS_TYPE };
SmartChartsNXT.global = { ...defautlConfig };

export default SmartChartsNXT;

if (typeof window !== 'undefined') {
  window.SmartChartsNXT = SmartChartsNXT;
  window.$SC = SmartChartsNXT;
}