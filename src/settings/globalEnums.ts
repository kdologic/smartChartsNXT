'use strict';

/**
 * globalEnums.js
 * @createdOn: 15-Jul-2019
 * @author: SmartChartsNXT
 * @description: Global enumeration values.
 */

export class OPTIONS_TYPE {
  public ICON_TYPE = {
    CIRCLE: 'circle',
    TRIANGLE: 'triangle',
    DIAMOND: 'diamond',
    STAR: 'star',
    CUSTOM: 'custom'
  }
  
  public LINE_STYLE = {
    DASHED: 'dashed',
    SOLID: 'solid'
  };

  public ALIGNMENT = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
  };

  public HORIZONTAL_ALIGN = {
    RIGHT: 'right',
    LEFT: 'left',
    CENTER: 'center'
  };

  public VERTICAL_ALIGN = {
    TOP: 'top',
    CENTER: 'center',
    BOTTOM: 'bottom'
  };

  public DISPLAY = {
    INLINE: 'inline',
    BLOCK: 'block',
    NONE: 'none'
  };

  public FLOAT = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    NONE: 'none'
  };

  public CROSSHAIR_SPREAD = {
    NONE: 'none',
    FULL: 'full',
    IN_POINT: 'inPoint'
  };

  public TOOLTIP_POSITION = {
    STATIC: 'static',
    DYNAMIC: 'dynamic'
  };

  public GRADIENT = {
    LINEAR_HORIZONTAL: 'linear_horizontal',
    LINEAR_HORIZONTAL_REV: 'linear_horizontal_rev',
    LINEAR_VERTICAL: 'linear_vertical',
    LINEAR_VERTICAL_REV: 'linear_vertical_rev',
    RADIAL: 'radial',
    RADIAL_REV: 'radial_rev'
  };

  public PATTERN = {
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
  };

  public AXIS_TYPE = {
    LOGARITHMIC: 'logarithmic',
    LINEAR: 'linear'
  };
}

export class CHART_TYPE {
  public AREA_CHART = 'AreaChart';
  public LINE_CHART ='LineChart';
  //STEP_CHART: 'StepChart',
  public PIE_CHART = 'PieChart';
  public DONUT_CHART = 'DonutChart';
  //COLUMN_CHART: 'ColumnChart',
  //BAR_CHART: 'BarChart'
}