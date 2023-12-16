'use strict';

/**
 * helperMethods.ts
 * @createdOn:26-Apr-2020
 * @author:SmartChartsNXT
 * @description: This file is the collection of different utility methods that help in runtime.
 */


/**
 * This method will show color with names in console.
 * @returns {void} Returns nothing.
 */
export const showColorModel = function () {
  for (let color in $SC.COLOR_STRINGS) {
    /* eslint-disable-next-line no-console */
    console.log('%c  ', 'background: ' + $SC.COLOR_STRINGS[color] + ';', color);
  }
};