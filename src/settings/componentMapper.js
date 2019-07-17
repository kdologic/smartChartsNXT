/* eslint-disable quotes */
'use strict';

/**
 * componentMapper.js
 * @createdOn: 17-Jul-2019
 * @author: SmartChartsNXT
 * @description: Global enumeraton values.
 */

 import {CHART_TYPE} from './globalEnums';
 import AreaChart from './../charts/areaChart/areaChart';
 import areaChartConfig from './../charts/areaChart/config';

/** ------- Requireing all chart types ------- */
export const CHART_MODULES = {
    [CHART_TYPE.AREA_CHART]: {
        config: areaChartConfig,
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