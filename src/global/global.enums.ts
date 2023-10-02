'use strict';

/**
 * global.enums.ts
 * @createdOn: 15-Jul-2019
 * @author: SmartChartsNXT
 * @description: Global enumeration values.
 */

export enum ICON_TYPE {
  CIRCLE = 'circle',
  TRIANGLE = 'triangle',
  DIAMOND = 'diamond',
  STAR = 'star',
  CUSTOM = 'custom',
  NONE = 'none'
}

export enum LINE_STYLE {
  DASHED = 'dashed',
  SOLID = 'solid'
};

export enum ALIGNMENT {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical'
};

export enum HORIZONTAL_ALIGN {
  RIGHT = 'right',
  LEFT = 'left',
  CENTER = 'center'
};

export enum TEXT_ANCHOR {
  START = 'start',
  MIDDLE = 'middle',
  END = 'end'
};

export enum VERTICAL_ALIGN {
  TOP = 'top',
  CENTER = 'center',
  BOTTOM = 'bottom'
};

export enum DISPLAY {
  INLINE = 'inline',
  BLOCK = 'block',
  NONE = 'none'
};

export enum FLOAT {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right',
  NONE = 'none'
};

export enum CROSSHAIR_SPREAD {
  NONE = 'none',
  FULL = 'full',
  IN_POINT = 'inPoint'
};

export enum TOOLTIP_POSITION {
  STATIC = 'static',
  DYNAMIC = 'dynamic'
};

export enum TOOLTIP_ALIGN {
  TOP = 'top',
  BOTTOM = 'bottom',
  LEFT = 'left',
  RIGHT = 'right'
};

export enum GRADIENT {
  LINEAR_HORIZONTAL = 'linear_horizontal',
  LINEAR_HORIZONTAL_REV = 'linear_horizontal_rev',
  LINEAR_VERTICAL = 'linear_vertical',
  LINEAR_VERTICAL_REV = 'linear_vertical_rev',
  RADIAL = 'radial',
  RADIAL_REV = 'radial_rev'
};

export enum PATTERN {
  CIRCLE_1 = 'sc-pattern-circle-1',
  CIRCLE_2 = 'sc-pattern-circle-2',
  CIRCLE_3 = 'sc-pattern-circle-3',
  BACK_DIAGONAL_1 = 'sc-pattern-back-diagonal-1',
  BACK_DIAGONAL_2 = 'sc-pattern-back-diagonal-2',
  FRONT_DIAGONAL_1 = 'sc-pattern-front-diagonal-1',
  FRONT_DIAGONAL_2 = 'sc-pattern-front-diagonal-2',
  VERTICAL_1 = 'sc-pattern-vertical-1',
  VERTICAL_2 = 'sc-pattern-vertical-2',
  HORIZONTAL_1 = 'sc-pattern-horizontal-1',
  HORIZONTAL_2 = 'sc-pattern-horizontal-2',
  SQUARE = 'sc-pattern-square',
  BOX3D = 'sc-pattern-box3d',
  SHAPE_S = 'sc-pattern-shape-s',
  CHECKERBOARD = 'sc-pattern-carbon-checkerboard'
};

export enum AXIS_TYPE {
  LOGARITHMIC = 'logarithmic',
  LINEAR = 'linear'
};

export enum FILL_TYPE {
  NONE = 'none',
  SOLID_COLOR = 'solidColor',
  PATTERN_CUSTOM = 'patternCustom',
  PATTERN_PRESET = 'patternPreset',
  GRADIENT_CUSTOM = 'gradientCustom',
  GRADIENT_PRESET = 'gradientPreset',
  PATTERN_IMAGE = 'patternImage'
};

export enum SAVE_AS {
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
  PDF = 'pdf',
  PRINT = 'print'
};

export class OPTIONS_TYPE {
  public ICON_TYPE = ICON_TYPE;
  public LINE_STYLE = LINE_STYLE;
  public ALIGNMENT = ALIGNMENT;
  public HORIZONTAL_ALIGN = HORIZONTAL_ALIGN;
  public VERTICAL_ALIGN = VERTICAL_ALIGN;
  public DISPLAY = DISPLAY;
  public FLOAT = FLOAT;
  public CROSSHAIR_SPREAD = CROSSHAIR_SPREAD;
  public TOOLTIP_POSITION = TOOLTIP_POSITION;
  public TOOLTIP_ALIGN = TOOLTIP_ALIGN
  public GRADIENT = GRADIENT;
  public PATTERN = PATTERN;
  public AXIS_TYPE = AXIS_TYPE;
  public TEXT_ANCHOR = TEXT_ANCHOR;
};

export enum CHART_TYPE {
  AREA_CHART = 'AreaChart',
  LINE_CHART = 'LineChart',
  //STEP_CHART: TChartType = 'StepChart',
  PIE_CHART = 'PieChart',
  DONUT_CHART = 'DonutChart'
  //COLUMN_CHART: TChartType = 'ColumnChart',
  //BAR_CHART: TChartType = 'BarChart'
}