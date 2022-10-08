'use strict';

import { CHART_TYPE } from './globalEnums';
import ConnectedPointBase from '../charts/connectedPointChartsType/connectedPointBase';
import { config as areaChartConfig, validationRules as areaChartValidationRules } from '../charts/connectedPointChartsType/areaChart/areaChart.config';
import { config as lineChartConfig, validationRules as lineChartValidationRules } from '../charts/connectedPointChartsType/lineChart/lineChart.config';
import { IChartModules } from '../models/global.models';
const chartTypes = new CHART_TYPE();

/** ------- Mapping components and config with respective chart types ------- */
/**
 * chartComponentMapper.ts
 * @createdOn: 17-Jul-2019
 * @author: SmartChartsNXT
 * @description: This is a configuration file to preload and map different chart components with chart type and its config file.
 */

export const CHART_MODULES: IChartModules = {
  [chartTypes.AREA_CHART]: {
    config: areaChartConfig,
    validationRules: areaChartValidationRules,
    chart: ConnectedPointBase
  },
  [chartTypes.LINE_CHART]: {
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