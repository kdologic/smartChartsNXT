'use strict';

import deepmerge from 'deepmerge';

/**
 * util.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description: SmartChartsNXT Core Library components contains utillity functions.
 */

class UtilCore {
  constructor() { }
  /**
   * https://www.npmjs.com/package/deepmerge
   * Merges the enumerable properties of two or more objects deeply.
   * It will modify the destination object.
   * @param  {any} dest Destination object which will be extendts by rest of the paramater objects.
   * @param  {...any} args Array of source object.
   * @return {Object} Merged object.
   */
  extends(dest, ...args) {
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
    if(!dest) {
      return {};
    }else if(args.length === 0) {
      return dest;
    }else {
      return dest = deepmerge.all([dest, ...args], { 'arrayMerge': overwriteMerge });
    }
  }

  /**
   * Returns a number whose value is limited to the given range.
   * @param {Number} min The lower boundary of the output range.
   * @param {Number} max The upper boundary of the output range.
   * @param {Numebr} val Value to compare within range of min-max.
   * @returns {Number} A number in the range [min, max].
   *
   * Example: limit the output of this computation to between 0 and 255
   * (x * 255).clamp(0, 255)
   */
  clamp(min, max, val) {
    return Math.min(Math.max(val, min), max);
  }

  /**
   * Check if it is a date.
   * @param {Number} ms Milliseconds since Jan 1, 1970, 00:00:00.000 GMT
   * @returns {Boolean} Return true or false.
   */
  isDate(ms) {
    try {
      let d = new Date(ms);
      return d instanceof Date && !isNaN(d);
    } catch (e) {
      return false;
    }
  }

  /**
   * Memoized version of a function for faster execution.
   * @param {Function} fn A function to memoize.
   * @returns {Function} Return a memoized version of the function.
   */
  memoize = (fn) => {
    let cache = {};
    return (...args) => {
      if (args in cache) {
        return cache[args];
      } else {
        let result = fn(...args);
        cache[args] = result;
        return result;
      }
    };
  }
  /**
   * Return a color HEX code from index.
   * @param {Number} index Index of color HEX code.
   * @param {Boolean} ranbowFlag Return rainbow color HEX code.
   * @returns {String} Color HEX code.
   */
  getColor(index, ranbowFlag) {
    let Colors = {};
    Colors.names = {
      'light-blue': '#95CEFF',
      'light-orange': '#ff9e01',
      'olive-green': '#b0de09',
      'coral': '#FF7F50',
      'light-seagreen': '#20B2AA',
      'gold': '#ffd700',
      'light-slategray': '#778899',
      'rust': '#F56B19',
      'mat-violet': '#B009DE',
      'violet': '#DE09B0',
      'dark-Orange': '#FF8C00',
      'mat-blue': '#09b0de',
      'mat-green': '#09DEB0',
      'ruscle-red': '#d9534f',
      'dark-turquoise': '#00CED1',
      'orchid': '#DA70D6',
      'length': 16
    };
    Colors.rainbow = {
      'red': '#ff0f00',
      'dark-orange': '#ff6600',
      'light-orange': '#ff9e01',
      'dark-yello': '#fcd202',
      'light-yellow': '#f8ff01',
      'olive-green': '#b0de09',
      'green': '#04d215',
      'sky-blue': '#0d8ecf',
      'light-blue': '#0d52d1',
      'blue': '#2a0cd0',
      'violet': '#8a0ccf',
      'pink': '#cd0d74',
      'length': 12
    };
    let result;
    let count = 0;
    if (ranbowFlag) {
      index = index % 12;
      Colors.rainbow.length;
      for (let prop in Colors.rainbow) {
        if (index === count++) {
          result = Colors.rainbow[prop];
        }
      }
    } else {
      index = index % Colors.names.length;
      for (let prop in Colors.names) {
        if (index === count++) {
          result = Colors.names[prop];
        }
      }
    }

    return result;
  }

  colorLuminance(hex, lum) {
    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    let rgb = '#', c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ('00' + c).substr(c.length);
    }
    return rgb;
  }

  assemble(literal, params) {
    return new Function(params, 'return `' + literal + '`;'); // TODO: Proper escaping
  }

  /**
   * Generate Universally Unique IDentifier (UUID) RFC4122 version 4 compliant.
   * @returns {string} Return a GUID.
   */
  uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  /**
   * Generate a 14 character (xxxx-xxxx-xxxx) unique random ID (Uniqueness was tested upto 10,000 ids).
   * @returns {string} Returns a unique string.
   */
  getRandomID() {
    let chr4 = () => {
      return Math.random().toString(16).slice(-4);
    };
    return chr4() + '-' + chr4() + '-' + chr4();
  }

}

export default new UtilCore();