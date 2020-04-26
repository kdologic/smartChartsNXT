'use strict';

/**
 * fillColorModel.js
 * @createdOn:09-SEP-2019
 * @author:SmartChartsNXT
 * @description: Fill color model along with color string constants.
 */

export const COLOR_STRINGS = {
  'LIGHT_BLUE': '#95CEFF',
  'LIGHT_ORANGE': '#ff9e01',
  'OLIVE_GREEN': '#b0de09',
  'CORAL': '#FF7F50',
  'LIGHT_SEAGREEN': '#20B2AA',
  'GOLD': '#ffd700',
  'LIGHT_SLATEGRAY': '#778899',
  'RUST': '#F56B19',
  'MAT_VIOLET': '#B009DE',
  'VIOLET': '#DE09B0',
  'DARK_ORANGE': '#FF8C00',
  'MAT_BLUE': '#09b0de',
  'MAT_GREEN': '#09DEB0',
  'RUSCLE_RED': '#d9534f',
  'DARK_TURQUOISE': '#00CED1',
  'ORCHID': '#DA70D6'
};

export const RAINBOW_COLOR_STRINGS = {
  'RED': '#ff0f00',
  'ORANGE': '#ff6600',
  'YELLOW': '#fcd202',
  'GREEN': '#b0de09',
  'BLUE': '#0d8ecf',
  'INDIGO': '#4B0082',
  'VIOLET': '#8B00FF'
};

export const COLOR_MODEL = Object.keys(COLOR_STRINGS).map(c => COLOR_STRINGS[c]);

export const RAINBOW_COLOR_MODEL = Object.keys(RAINBOW_COLOR_STRINGS).map(c => RAINBOW_COLOR_STRINGS[c]);