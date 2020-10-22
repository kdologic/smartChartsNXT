'use strict';

/**
 * chartComponentMapper.js
 * @createdOn: 17-Jul-2019
 * @author: SmartChartsNXT
 * @description: This is a configuration file to preload and map different chart components with chart type and its config file.
 */

import { CHART_TYPE } from './globalEnums';
import ConnectedPointBase from '../charts/connectedPointChartsType/connectedPointBase';
import {config as areaChartConfig, validationRules as areaChartValidationRules} from '../charts/connectedPointChartsType/areaChart/areaChart.config';
import {config as lineChartConfig, validationRules as lineChartValidationRules} from '../charts/connectedPointChartsType/lineChart/lineChart.config';

/** ------- Mapping components and config with respective chart types ------- */

export const CHART_MODULES = {
  [CHART_TYPE.AREA_CHART]: {
    config: areaChartConfig,
    validationRules: areaChartValidationRules,
    chart: ConnectedPointBase
  },
  [CHART_TYPE.LINE_CHART]: {
    config: lineChartConfig,
    validationRules: lineChartValidationRules,
    chart: ConnectedPointBase
  }
  //,
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