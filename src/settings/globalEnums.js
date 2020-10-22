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
  },
  GRADIENT: {
    LINEAR_HORIZONTAL: 'linear_horizontal',
    LINEAR_HORIZONTAL_REV: 'linear_horizontal_rev',
    LINEAR_VERTICAL: 'linear_vertical',
    LINEAR_VERTICAL_REV: 'linear_vertical_rev',
    RADIAL: 'radial',
    RADIAL_REV: 'radial_rev'
  },
  PATTERN: {
    CIRCLE_1: 'sc-pattern-circle-1',
    CIRCLE_2: 'sc-pattern-circle-2',
    CIRCLE_3: 'sc-pattern-circle-3',
    BACK_DIAGONAL_1: 'sc-pattern-back-diagonal-1',
    BACK_DIAGONAL_2: 'sc-pattern-back-diagonal-2',
    FRONT_DIAGONAL_1: 'sc-pattern-front-diagonal-1',
    FRONT_DIAGONAL_2: 'sc-pattern-front-diagonal-2',
    VERTICAL_1: 'sc-pattern-vertical-1',
    VERTICAL_2: 'sc-pattern-vertical-2',
    HORIZONTAL_1: 'sc-pattern-horizontal-1',
    HORIZONTAL_2: 'sc-pattern-horizontal-2',
    SQUARE: 'sc-pattern-square',
    BOX3D: 'sc-pattern-box3d',
    SHAPE_S: 'sc-pattern-shape-s',
    CHECKERBOARD: 'sc-pattern-carbon-checkerboard'
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