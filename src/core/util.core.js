'use strict';

import deepmerge from 'deepmerge';
import {COLOR_MODEL, RAINBOW_COLOR_MODEL} from './fillColorModel';

/**
 * util.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description: SmartChartsNXT Core Library components contains utility functions.
 */

class UtilCore {
  constructor() { }
  /**
   * https://github.com/TehShrike/deepmerge
   * Merges the enumerable properties of two or more objects deeply.
   * It will modify the destination object.
   * @param  {any} dest Destination object which will be extends by rest of the paramter objects.
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
   * Deep copy an object.
   * @param {Object} src Source object which needs deep copy.
   * @return {Object} Returns new copied object.
   */
  deepCopy(src = {}) {
    if(typeof src === 'object') {
      return deepmerge.all([{}, src]);
    }
    return src;
  }

  /**
   * Returns a number whose value is limited to the given range.
   * @param {Number} min The lower boundary of the output range.
   * @param {Number} max The upper boundary of the output range.
   * @param {Number} val Value to compare within range of min-max.
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
   * Check if it is IE.
   * @returns {Boolean} Return true or false.
   */
  isIE() {
    let ua = window.navigator.userAgent;
    return /MSIE|Trident/.test(ua);
  }

  /**
   * Memoize version of a function for faster execution.
   * @param {Function} fn A function to memoize.
   * @returns {Function} Return a memoize version of the function.
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
   * @param {Boolean} rainbowFlag Return rainbow color HEX code.
   * @returns {String} Color HEX code.
   */
  getColor(index, rainbowFlag) {
    let colors;
    if (rainbowFlag) {
      colors = $SC.RAINBOW_COLOR_MODEL.length ? $SC.RAINBOW_COLOR_MODEL : RAINBOW_COLOR_MODEL;
    } else {
      colors = $SC.COLOR_MODEL.length ? $SC.COLOR_MODEL : COLOR_MODEL;
    }
    return colors[index % colors.length ];
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
    const crypto = window.crypto || window.msCrypto;
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

  /**
   * Generate a 14 character (xxxx-xxxx-xxxx) unique random ID (Uniqueness was tested up to 10,000 ids).
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