'use strict';

/**
 * componentMapper.js
 * @createdOn: 17-Jul-2019
 * @author: SmartChartsNXT
 * @description: Global enumeration values.
 */

import { CHART_TYPE } from './globalEnums';
import AreaChart from './../charts/areaChart/areaChart';
import {config as areaChartConfig, validationRules as areaChartValidationRules} from './../charts/areaChart/config';

/** ------- Requireing all chart types ------- */
export const CHART_MODULES = {
  [CHART_TYPE.AREA_CHART]: {
    config: areaChartConfig,
    validationRules: areaChartValidationRules,
    chart: AreaChart
  }
  //,
  // LineChart: require('./../charts/lineChart/lineChart'),
  // StepChart: require('./../charts/stepChart/stepChart'),
  // PieChart: {
  //   config: require('./../charts/pieChart/config').default,
  //   chart: require('./../charts/pieChart/pieChart').default
  // },
  // DonutChart: {
  //   config: require('./../charts/donutChart/config').default,
  //   chart: require('./../charts/donutChart/donutChart').default
  // }
  // ColumnChart: require('./../charts/columnChart/columnChart')
};