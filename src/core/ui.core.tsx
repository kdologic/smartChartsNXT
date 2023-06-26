'use strict';

import { mountTo } from '../viewEngin/pview';
import StoreManager from '../liveStore/storeManager';
import UtilCore from './util.core';
import patterns from '../styles/patterns/patterns';
import gradients from '../styles/gradients/gradients';
import { IVnode } from '../viewEngin/component.model';
import { FILL_TYPE } from '../settings/globalEnums';
import { IFillOptions, IYIntervalType } from './core.model';

/**
 * ui.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description:SmartChartsNXT Core Library components. This singleton class contains UI functionalities.
 */

class UiCore {

  /**
   * Create a drop shadow over SVG component. Need to pass the ID of the drop shadow element.
   * @param {String} shadowId Element ID of dropShadow Component.
   * @param {String} offsetX Offset value to shift shadow by x coordinate.
   * @param {String} offsetY Offset value to shift shadow by y coordinate.
   * @returns {Object} Virtual node of drop shadow component.
   */
  static dropShadow = (shadowId: string, offsetX: number, offsetY: number): IVnode => {
    return (
      <defs>
        <filter xmlns='http://www.w3.org/2000/svg' id={shadowId} height='130%'>
          <feGaussianBlur in='SourceAlpha' stdDeviation='1' />
          <feOffset dx={offsetX || 4} dy={offsetY || 4} result='offsetblur' />
          <feComponentTransfer>
            <feFuncA type='linear' slope='0.2' />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>
    );
  };

  /**
   * Create radial gradient
   * @param {string} gradId - Identifier of this gradient.
   * @param {number} cx - Center x.
   * @param {number} cy - Center y.
   * @param {number} fx - Offset x.
   * @param {number} fy - Offset y.
   * @param {number} r -  Radius
   * @param {Array} gradArr - Array of number or object.
   * @return {Object} JSX
   * @config
   * gradArr = [0.1, -0.06, 0.9] or
   * gradArr = [{offset:0, opacity:0.06},{offset:83, opacity:0.2},{offset:95, opacity:0}]
   * (-) negative indicates darker shades
   *
  */
  static radialGradient = (gradId: string, cx: number, cy: number, fx: number, fy: number, r: number, gradArr: number[] | { offset: number, opacity: number }[]): IVnode => {
    return (
      <defs>
        <radialGradient id={gradId} cx={cx} cy={cy} fx={fx} fy={fy} r={r} gradientUnits='userSpaceOnUse'>
          {gradArr.map((grad, i) => {
            let offset = i / gradArr.length * 100;
            let opacity = grad;
            let color = '#fff';
            if (typeof grad === 'object') {
              offset = grad.offset !== undefined ? grad.offset : offset;
              opacity = grad.opacity !== undefined ? grad.opacity : opacity;
              if (opacity < 0) {
                color = '#000';
                opacity = Math.abs(opacity as number);
              }
            }
            return <stop instanceId={i} offset={`${offset}%`} stop-color={color} stop-opacity={opacity}></stop>;
          })}
        </radialGradient>
      </defs>
    );
  };

  /**
   * Calculate font size according to scale and max size.
   * @param {Number} totalWidth Max width of component.
   * @param {Number} scale Scale factor when width change.
   * @param {Number} maxSize Max font size bound.
   * @return {Number} Calculated font size.
   */
  static getScaledFontSize = (totalWidth: number, scale: number, maxSize: number): number => {
    let fSize = totalWidth / scale;
    return fSize < maxSize ? fSize : maxSize;
  };

  /**
   * Get text width in svg pixel.
   * @param {Object} textNode - JSX of text node.
   * @return {Number} Text width in Pixel.
   */

  static getComputedTextWidth = (textNode: IVnode): number => {
    return UiCore.getComputedBBox(textNode).width;
  };

  /**
   * Get text bounding box {width, height} before rendering.
   * @param {Object} virtualNode - JSX of text node.
   * @return {Object} Text bounding Box
   */
  static getComputedBBox = (virtualNode: IVnode): DOMRect => {
    let bbox: DOMRect;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.visibility = 'hidden';
    svg.style.position = 'absolute';
    svg.style.left = '-10000px';
    document.body.appendChild(svg);
    const textDOM = mountTo(virtualNode, svg).node as SVGTextElement;
    if (textDOM) {
      bbox = textDOM.getBoundingClientRect();
      if (typeof textDOM.getComputedTextLength === 'function') {
        bbox.width = textDOM.getComputedTextLength();
      }
    }
    svg.parentNode.removeChild(svg);
    return bbox;
  };

  /**
   * Convert Window screen coordinate into SVG point coordinate in global SVG space.
   * @param {String} targetElem SVG element in which point coordinate will be calculated.
   * @param {Object} evt Pointer event related to screen like mouse or touch point.
   * @return {Point} Returns a point which transform into SVG coordinate system.
   */
  static cursorPoint = (targetElem: SVGGraphicsElement, evt: MouseEvent | TouchEvent): DOMPoint => {
    if (typeof targetElem === 'string') {
      targetElem = document.querySelector('#' + targetElem + ' .smartcharts-nxt .sc-prime-view');
    }
    let pt = new DOMPoint();
    if (evt instanceof MouseEvent && evt.clientX !== undefined) {
      pt.x = evt.clientX;
      pt.y = evt.clientY;
    } else if (evt instanceof TouchEvent && evt.touches[0]) {
      pt.x = evt.touches[0].clientX;
      pt.y = evt.touches[0].clientY;
    } else {
      pt.x = 0;
      pt.y = 0;
    }
    return pt.matrixTransform(targetElem.getScreenCTM().inverse());
  };

  /**
   * Convert pixel value into pixel value.
   * @param {Number} total Total length in pixel.
   * @param {Number} percent Percent value out of total pixel
   * @return {Number} Calculated percent value.
   */
  static percentToPixel = (total: number, percent: string = ''): number => {
    if (percent.toString().indexOf('%') === -1) {
      return parseFloat(percent);
    }
    const percentNumber = Number.parseFloat(percent);
    if (!isNaN(percentNumber)) {
      return total * percentNumber / 100;
    }
    return 0;
  };

  /**
   * Calculate interval value and also interval count for a given range.
   * @param {Number} minVal Minimum Value.
   * @param {Number} maxVal Maximum Value
   * @return {Object} Returns interval object.
   */

  static calcIntervalByMinMax = (minVal: number, maxVal: number, zeroBase: boolean): IYIntervalType => {
    let arrWeight = [0.01, 0.02, 0.05];
    let weightDecimalLevel = 1;
    let minIntervalCount = 6;
    let maxIntervalCount = 12;
    let mid = (maxVal + minVal) / 2;
    let tMinVal = minVal;
    if (zeroBase) {
      tMinVal = minVal > 0 ? 0 : minVal;
      maxVal = maxVal < 0 ? 0 : maxVal;
    }

    let digitBase10 = Math.round(mid).toString().length;
    for (let w = 0; w <= 100; w = (w + 1) % arrWeight.length) {
      let weight = arrWeight[w] * weightDecimalLevel;
      let tInt = Math.pow(10, digitBase10 - 1) * weight;
      if (w === arrWeight.length - 1) {
        weightDecimalLevel *= 10;
      }
      for (let interval = minIntervalCount; interval <= maxIntervalCount; interval++) {
        let hitInterval = +parseFloat((tInt * interval).toString()).toFixed(2);
        if (minVal <= 0) {
          tMinVal = (Math.ceil(tMinVal / tInt) * tInt);
        } else {
          tMinVal = (Math.floor(tMinVal / tInt) * tInt);
        }
        if ((tMinVal + hitInterval) >= (maxVal + tInt)) {
          let iMax = tMinVal + hitInterval;
          if (minVal < 0) {
            tMinVal -= (2 * tInt);
            interval += 2;
          } else if (Math.floor(tMinVal) == Math.floor(minVal)) {
            if (!zeroBase) {
              tMinVal -= tInt;
              interval++;
            }
          }
          return {
            iVal: () => tInt,
            iCount: interval,
            iMax: iMax,
            iMin: tMinVal
          };
        }
      }
    }
  };

  static calcIntervalByMinMaxLog = (minVal: number, maxVal: number): IYIntervalType => {
    let startWeight = 0.1;
    minVal = minVal <= 0 ? startWeight : minVal;
    maxVal = maxVal <= 0 ? 1 : maxVal;

    let iMin = startWeight;
    let iMax, iCount = 0;
    if (startWeight > minVal) {
      while (iMin > minVal) {
        iMin /= 10;
      }
    } else {
      while (iMin < minVal) {
        iMin *= 10;
      }
    }
    iMin = iMin / 10;
    iMax = iMin;
    while (iMax < maxVal) {
      iCount++;
      iMax = iMax * 10;
    }
    return {
      iVal: (i: number) => 10 ** i,
      iCount: iCount,
      iMax: iMax,
      iMin: iMin
    };
  }

  /**
   * Format a text value base in Billion, Million, Thousand etc.
   * @param {Number} value Input number to format.
   * @returns String of formatted value.
   */

  static formatTextValue = (value: number, decimalCount: number = 2): string => {
    if (Math.abs(Number(value)) >= 1000000000000) {
      return (Number(value) / 1000000000000).toFixed(2) + ' T';
    } else if (Math.abs(Number(value)) >= 1000000000) {
      return (Number(value) / 1000000000).toFixed(2) + ' B';
    } else if (Math.abs(Number(value)) >= 1000000) {
      return (Number(value) / 1000000).toFixed(2) + ' M';
    } else if (Math.abs(Number(value)) >= 1000) {
      return (Number(value) / 1000).toFixed(2) + ' K';
    } else {
      return Number(value).toFixed(decimalCount);
    }
  };

  /**
   * Insert and style tag in DOM
   * @param {Object} parentNode DOM node where style will be prepend
   * @param {String} styleStr String of CSS text
   * @param {String} position Optional. in which position will add this style. Default: 'afterbegin'
   * @return {void} void
   * @config
   * position: ['beforebegin' | default: 'afterbegin' | 'beforeend' | 'afterend' ]
   */
  static prependStyle = (parentNode: SVGElement | HTMLElement, styleStr: string, position: InsertPosition = 'afterbegin'): void => {
    parentNode.insertAdjacentHTML(position, '<style>' + styleStr + '</style>');
  };

  /**
   * Process fill options for pattern, gradient or image based on config.
   * @param {Object} fillOptions Object of fill option type have pattern, gradient or image ID.
   * @param {String} rid A randomly generated fill id.
   * @return {Object} Return {fillType, fillBy and fillId}
   */
  static processFillOptions = (fillOptions: IFillOptions = {}, rid = UtilCore.getRandomID()): { fillType: FILL_TYPE, fillBy: string, fillId: string } => {
    const globalDefMap = StoreManager.getStore('global').getValue('defMap');
    const gradId = 'sc-fill-grad-' + rid;
    const patternId = 'sc-fill-pattern-' + rid;
    let fillType: FILL_TYPE = FILL_TYPE.SOLID_COLOR;
    let fillBy = 'none';
    let fillId;

    if (fillOptions.pattern && typeof fillOptions.pattern === 'string') {
      if (fillOptions.pattern in globalDefMap) {
        fillType = FILL_TYPE.PATTERN_CUSTOM;
        fillBy = `url(#${globalDefMap[fillOptions.pattern]})`;
        fillId = fillOptions.pattern;
      } else {
        fillType = FILL_TYPE.PATTERN_PRESET;
        fillBy = `url(#${patternId})`;
        fillId = patternId;
      }
    } else if (fillOptions.gradient && typeof fillOptions.gradient === 'string') {
      if (fillOptions.gradient in globalDefMap) {
        fillType = FILL_TYPE.GRADIENT_CUSTOM;
        fillBy = `url(#${globalDefMap[fillOptions.gradient]})`;
        fillId = fillOptions.gradient;
      } else {
        fillType = FILL_TYPE.GRADIENT_PRESET;
        fillBy = `url(#${gradId})`;
        fillId = gradId;
      }
    } else if (fillOptions.image && typeof fillOptions.image === 'string' && fillOptions.image in globalDefMap) {
      fillType = FILL_TYPE.PATTERN_IMAGE;
      fillBy = `url(#${globalDefMap[fillOptions.image]})`;
      fillId = fillOptions.image;
    }

    return { fillType, fillBy, fillId };
  };

  /**
   * Generate the fill type pattern or gradient element.
   * @param {String} fillId Predefined ID that used refer the def element.
   * @param {String} fillType Type of fill element will create pattern or gradient.
   * @param {Object} fillOptions Configuration of fill option.
   * @param {String} color Hex color code for pattern.
   * @return {Void} void
   */
  static generateFillElem = (fillId: string, fillType: FILL_TYPE, fillOptions: IFillOptions, color: string): IVnode => {
    switch (fillType) {
      case 'patternPreset': return patterns.getType(fillOptions.pattern, fillId, color);
      case 'gradientPreset': return gradients.getType(fillOptions.gradient, fillId, color);
    }
  };

}

export default UiCore;