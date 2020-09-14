'use strict';

/**
 * ui.core.js
 * @createdOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @description:SmartChartsNXT Core Library components. This singleton class contains UI functionalities.
 */

import { mountTo } from './../viewEngin/pview';
import StoreManager from './../liveStore/storeManager';
import utilCore from './../core/util.core';
import patterns from './../styles/patterns';
import gradients from './../styles/gradients';

class UiCore {
  constructor() { }

  /**
   * Create a drop shadow over SVG component. Need to pass the ID of the drop shadow element.
   * @param {String} shadowId Element ID of dropShadow Component.
   * @param {String} offsetX Offset value to shift shadow by x coordinate.
   * @param {String} offsetY Offset value to shift shadow by y coordinate.
   * @returns {Object} Virtual node of drop shadow component.
   */
  dropShadow(shadowId, offsetX, offsetY) {
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
  }

  /** Create radial gradient
   * @param {string} gradId - Identifire of this gradient.
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
  radialGradient(gradId, cx, cy, fx, fy, r, gradArr) {
    return (
      <defs>
        <radialGradient id={gradId} cx={cx} cy={cy} fx={fx} fy={fy} r={r} gradientUnits='userSpaceOnUse'>
          {gradArr.map((grad, i) => {
            let offset = i / gradArr.length * 100;
            let opacity = grad;
            let color = '#fff';
            if (typeof grad === 'object') {
              offset = grad.offset !== 'undefined' ? grad.offset : offset;
              opacity = grad.opacity !== 'undefined' ? grad.opacity : opacity;
              if (opacity < 0) {
                color = '#000';
                opacity = Math.abs(opacity);
              }
            }
            return <stop offset={`${offset}%`} stop-color={color} stop-opacity={opacity}></stop>;
          })}
        </radialGradient>
      </defs>
    );
  }

  /**
   * Calculate font size according to scale and max size.
   * @param {Number} totalWidth Max width of component.
   * @param {Number} scale Scale factor when width change.
   * @param {Number} maxSize Max font size bound.
   * @return {Number} Calculated font size.
   */
  getScaledFontSize(totalWidth, scale, maxSize) {
    let fSize = totalWidth / scale;
    return fSize < maxSize ? fSize : maxSize;
  }

  /**
   * Get text width in svg pixel.
   * @param {Object} textNode - JSX of text node.
   * @return {Number} Text width in Pixel.
   */

  getComputedTextWidth(textNode) {
    return this.getComputedBBox(textNode).width;
  }

  /**
   * Get text bounding box {width, height} before rendering.
   * @param {Object} vnode - JSX of text node.
   * @return {Object} Text bounding Box
   */
  getComputedBBox(vnode) {
    let bbox = {};
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.visibility = 'hidden';
    svg.style.position = 'absolute';
    svg.style.left = '-10000px';
    document.body.appendChild(svg);
    const textDOM = mountTo(vnode, svg).node;
    if (textDOM) {
      bbox = textDOM.getBoundingClientRect();
    }
    svg.parentNode.removeChild(svg);
    return { width: bbox.width, height: bbox.height };
  }

  /** Returns true if it is a touch device
   * @return {boolean} Returns 'true' for touch device otherwise return 'false'.
   */
  isTouchDevice() {
    return 'ontouchstart' in document.documentElement;
  }

  /**
   * Convert Window screen coordinate into SVG point coordinate in global SVG space.
   * @param {String} targetElem SVG element in which point coordinate will be calculated.
   * @param {Object} evt Pointer event related to screen like mouse or touch point.
   * @return {Point} Returns a point which transform into SVG coordinate system.
   */
  cursorPoint(targetElem, evt) {
    if (typeof targetElem === 'string') {
      targetElem = document.querySelector('#' + targetElem + ' .smartcharts-nxt');
    }
    let pt = targetElem.createSVGPoint();
    pt.x = evt.clientX !== undefined ? evt.clientX : evt.touches[0] ? evt.touches[0].clientX : 0;
    pt.y = evt.clientY !== undefined ? evt.clientY : evt.touches[0] ? evt.touches[0].clientY : 0;
    return pt.matrixTransform(targetElem.getScreenCTM().inverse());
  }

  /**
   * Convert pixel value into pixel value.
   * @param {Number} total Total length in pixel.
   * @param {Number} percent Percent value out of total pixel
   * @return {Number} Calculated percent value.
   */
  percentToPixel(total, percent = '') {
    if (percent.toString().indexOf('%') === -1) {
      return percent;
    }
    if (!isNaN(percent = Number.parseFloat(percent))) {
      return total * percent / 100;
    }
    return 0;
  }

  /**
   * Calculate interval value and also interval count for a given range.
   * @param {Number} minVal Minimum Value.
   * @param {Number} maxVal Maximum Value
   * @return {Object} Returns interval object.
   */

  calcIntervalByMinMax(minVal, maxVal, zeroBase) {
    let arrWeight = [0.01, 0.02, 0.05];
    let weightDecimalLevel = 1;
    let minIntvCount = 6;
    let maxIntvCount = 12;
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
      for (let intv = minIntvCount; intv <= maxIntvCount; intv++) {
        let hitIntv = +parseFloat(tInt * intv).toFixed(2);
        if (minVal <= 0) {
          tMinVal = (Math.ceil(tMinVal / tInt) * tInt);
        } else {
          tMinVal = (Math.floor(tMinVal / tInt) * tInt);
        }
        if ((tMinVal + hitIntv) >= (maxVal + tInt)) {
          let iMax = tMinVal + hitIntv;
          if (minVal < 0) {
            tMinVal -= (2 * tInt);
            intv += 2;
          } else if (Math.floor(tMinVal) == Math.floor(minVal)) {
            if (!zeroBase) {
              tMinVal -= tInt;
              intv++;
            }
          }

          return {
            iVal: tInt,
            iCount: intv,
            iMax: iMax,
            iMin: tMinVal
          };
        }
      }
    }
  }

  /**
   * Format a text value base in Billion, Million, Thousand etc.
   * @param {Number} value Input number to format.
   * @returns String of formatted value.
   */

  formatTextValue(value) {
    if (Math.abs(Number(value)) >= 1000000000000) {
      return (Number(value) / 1000000000000).toFixed(2) + ' T';
    } else if (Math.abs(Number(value)) >= 1000000000) {
      return (Number(value) / 1000000000).toFixed(2) + ' B';
    } else if (Math.abs(Number(value)) >= 1000000) {
      return (Number(value) / 1000000).toFixed(2) + ' M';
    } else if (Math.abs(Number(value)) >= 1000) {
      return (Number(value) / 1000).toFixed(2) + ' K';
    } else {
      return Number(value).toFixed(2);
    }
  }

  /**
   * Insert and style tag in DOM
   * @param {Object} parentNode DOM node where style will be prepend
   * @param {String} styleStr String of CSS text
   * @param {String} position Optional. in which position will add this style. Default: 'afterbegin'
   * @return {void} void
   * @config
   * position: ['beforebegin' | default: 'afterbegin' | 'beforeend' | 'afterend' ]
   */
  prependStyle(parentNode, styleStr, position = 'afterbegin') {
    parentNode.insertAdjacentHTML(position, '<style>' + styleStr + '</style>');
  }

  /**
   * Process fill options for pattern, gradient or image based on config
   * @param {Object} fillOptions Object of fill option type have pattern, gradient or image ID
   * @return {Object} Return {fillType, fillBy and fillId}
   */
  processFillOptions(fillOptions = {}) {
    const globalDefMap = StoreManager.getStore('global').getValue('defMap');
    const rid = utilCore.getRandomID();
    const gradId = 'sc-fill-grad-' + rid;
    const patternId = 'sc-fill-pattern-' + rid;
    let fillType = 'solidColor';
    let fillBy = 'none';
    let fillId;
    if (fillOptions.pattern && typeof fillOptions.pattern === 'string') {
      if (fillOptions.pattern in globalDefMap) {
        fillType = 'patternCustom';
        fillBy = `url(#${globalDefMap[fillOptions.pattern]})`;
        fillId = fillOptions.pattern;
      } else {
        fillType = 'patternPreset';
        fillBy = `url(#${patternId})`;
        fillId = patternId;
      }
    } else if (fillOptions.gradient && typeof fillOptions.gradient === 'string') {
      if (fillOptions.gradient in globalDefMap) {
        fillType = 'gradientCustom';
        fillBy = `url(#${globalDefMap[fillOptions.gradient]})`;
        fillId = fillOptions.gradient;
      } else {
        fillType = 'gradientPreset';
        fillBy = `url(#${gradId})`;
        fillId = gradId;
      }
    } else if (fillOptions.image && typeof fillOptions.image === 'string' && fillOptions.image in globalDefMap) {
      fillType = 'patternImage';
      fillBy = `url(#${globalDefMap[fillOptions.image]})`;
      fillId = fillOptions.image;
    }
    return { fillType, fillBy, fillId };
  }

  /**
   * Generate the fill type pattern or gradient element.
   * @param {String} fillId Predefined ID that used refer the def element.
   * @param {String} fillType Type of fill element will create pattern or gradient.
   * @param {Object} fillOptions Configuration of fill option.
   * @param {String} color Hex color code for pattern.
   * @return {Void} void
   */
  generateFillElem(fillId, fillType, fillOptions, color) {
    switch (fillType) {
      case 'patternPreset': return patterns.getType(fillOptions.pattern, fillId, color);
      case 'gradientPreset': return gradients.getType(fillOptions.gradient, fillId, color);
    }
  }

}

export default new UiCore();