'use strict';

import deepmerge from 'deepmerge';
import { COLOR_MODEL, RAINBOW_COLOR_MODEL } from './fillColorModel';
import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { IObject } from '../viewEngin/pview.model';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

/**
 * util.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description: SmartChartsNXT Core Library components contains utility functions.
 */

class UtilCore {

  /**
   * Check if it is IE.
   */
  static isIE = /MSIE|Trident/.test(window.navigator.userAgent);

  /**
   * Check if it is a touch device.
   */
  static isTouchDevice = 'ontouchstart' in document.documentElement;

  /**
   * Using DayJS for date formatting lib.
   */
  static dateFormat = dayjs;

  /**
   * https://github.com/TehShrike/deepmerge
   * Merges the enumerable properties of two or more objects deeply.
   * It will modify the destination object.
   * @param  {any} dest Destination object which will be extends by rest of the paramter objects.
   * @param  {...any} args Array of source object.
   * @return {Object} Merged object.
   */
  static extends = (dest: IObject, ...args: IObject[]): IObject => {
    // @ts-ignore
    const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;
    if (!dest) {
      return {};
    } else if (args.length === 0) {
      return dest;
    } else {
      return deepmerge.all([dest, ...args], { 'arrayMerge': overwriteMerge });
    }
  };

  /**
   * Deep copy an object.
   * @param {Object} src Source object which needs deep copy.
   * @return {Object} Returns new copied object.
   */
  static deepCopy = (src: IObject = {}): IObject => {
    if (typeof src === 'object') {
      return deepmerge.all([{}, src]);
    }
    return src;
  };

  /**
   * Deep Freeze object recursively.
   * @param {Object} anyObject Input object to be freeze.
   * @returns {Object} Frozen object.
   */
  static deepFreeze = (anyObject: IObject) => {
    let propNames = Object.getOwnPropertyNames(anyObject);
    for (let name of propNames) {
      let value = anyObject[name];
      if (value && typeof value === 'object') {
        UtilCore.deepFreeze(value);
      }
    }
    return Object.freeze(anyObject);
  };

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
  static clamp = (min: number, max: number, val: number): number => {
    return Math.min(Math.max(val, min), max);
  };

  /**
   * Check if it is a date.
   * @param {String | Number | Date} date Input date of date can be String, Number or Valid Date type object.
   * @param {String} format Parsing format of input date.
   * @returns {Boolean} Return true or false.
   */
  static isDate = (date: string | number | Dayjs, format?: string): boolean => {
    if (!date) {
      return false;
    }
    if (format || format === '') {
      return UtilCore.dateFormat(date, format || undefined).isValid();
    } else {
      return UtilCore.dateFormat.isDayjs(date);
    }
  };

  /**
   * Return a color HEX code from index.
   * @param {Number} index Index of color HEX code.
   * @param {Boolean} rainbowFlag Return rainbow color HEX code.
   * @returns {String} Color HEX code.
   */
  static getColor = (index: number, rainbowFlag?: boolean): string => {
    let colors;
    if (rainbowFlag) {
      colors = $SC.RAINBOW_COLOR_MODEL.length ? $SC.RAINBOW_COLOR_MODEL : RAINBOW_COLOR_MODEL;
    } else {
      colors = $SC.COLOR_MODEL.length ? $SC.COLOR_MODEL : COLOR_MODEL;
    }
    return colors[index % colors.length];
  };

  static colorLuminance = (hex: string, lum: number): string => {
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
  };

  static assemble = (literal: string, params: any) => {
    return new Function(params, 'return `' + literal + '`;'); // TODO: Proper escaping
  };

  /**
   * Generate Universally Unique IDentifier (UUID) RFC4122 version 4 compliant.
   * @returns {string} Return a GUID.
   */
  static uuidv4 = (): string => {
    const crypto = window.crypto || window.msCrypto;
    //@ts-ignore
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  };

  /**
   * Generate a 14 character (xxxx-xxxx-xxxx) unique random ID (Uniqueness was tested up to 10,000 ids).
   * @returns {string} Returns a unique string.
   */
  static getRandomID = (): string => {
    let chr4 = () => {
      return Math.random().toString(16).slice(-4);
    };
    return chr4() + '-' + chr4() + '-' + chr4();
  };

  /**
   * Wrap a function to get execution time accurately.
   * @param {*} fn input function of which we need a execution time.
   * @param {*} mark The string which uniquely identify the time mark.
   * @return {function} Returns the curry function.
   */
  static timeLogSync = (fn: Function, mark: string) => {
    let that = this;
    return (...args: any[]) => {
      /* eslint-disable-next-line no-console */
      console.time(mark);
      if (typeof fn === 'function') {
        fn.apply(that, args);
      }
      /* eslint-disable-next-line no-console */
      console.timeEnd(mark);
    };
  };
}

export default UtilCore;