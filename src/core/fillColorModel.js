'use strict';

/**
 * fillColorModel.js
 * @createdOn:09-SEP-2019
 * @author:SmartChartsNXT
 * @description: Fill color model along with color string constants.
 */

export const COLOR_STRINGS = {
  'LIGHT-BLUE': '#95CEFF',
  'LIGHT-ORANGE': '#ff9e01',
  'OLIVE-GREEN': '#b0de09',
  'CORAL': '#FF7F50',
  'LIGHT-SEAGREEN': '#20B2AA',
  'GOLD': '#ffd700',
  'LIGHT-SLATEGRAY': '#778899',
  'RUST': '#F56B19',
  'MAT-VIOLET': '#B009DE',
  'VIOLET': '#DE09B0',
  'DARK-ORANGE': '#FF8C00',
  'MAT-BLUE': '#09b0de',
  'MAT-GREEN': '#09DEB0',
  'RUSCLE-RED': '#d9534f',
  'DARK-TURQUOISE': '#00CED1',
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