'use strict';

/**
 * globalEnums.js
 * @createdOn: 15-Jul-2019
 * @author: SmartChartsNXT
 * @description: Global enumeration values.
 */

export const OPTIONS_TYPE = {
  ICON_TYPE: {
    CIRCLE: 'circle',
    TRIANGLE: 'triangle',
    DIAMOND: 'diamond',
    STAR: 'star',
    CUSTOM: 'custom'
  },
  LINE_STYLE: {
    DASHED: 'dashed',
    SOLID: 'solid'
  },
  GRADIENT_STYLE: {
    NONE: 'none',
    LINEAR_HORIZONTAL: 'linear_horizontal',
    LINEAR_VERTICAL: 'linear_vertical',
    RADIAL: 'radial'
  },
  ALIGNMENT: {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
  },
  HORIZONTAL_ALIGN: {
    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center'
  },
  DISPLAY: {
    INLINE: 'inline',
    BLOCK: 'block',
    NONE: 'none'
  },
  FLOAT: {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    NONE: 'none'
  },
  CROSSHAIR_SPREAD: {
    NONE: 'none',
    FULL: 'full',
    IN_POINT: 'inPoint'
  },
  TOOLTIP_POSITION: {
    STATIC: 'static',
    DYNAMIC: 'dynamic'
  }
};

export const CHART_TYPE = {
  AREA_CHART: 'AreaChart',
  LINE_CHART: 'LineChart',
  //STEP_CHART: 'StepChart',
  PIE_CHART: 'PieChart',
  DONUT_CHART: 'DonutChart'
  //COLUMN_CHART: 'ColumnChart',
  //BAR_CHART: 'BarChart'
};