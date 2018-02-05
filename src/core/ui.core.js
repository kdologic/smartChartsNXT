/**
 * ui.core.js
 * @CreatedOn: 07-Apr-2016
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:SmartChartsNXT Core Library components. That contains ui functionality.
 */

/*-----------SmartChartsNXT UI functions------------- */

"use strict";

import Point from './point';
import Geom from './geom.core'; 

class UiCore {
  constructor() {}

  dropShadow(shadowId) {
    return (
      <defs>
        <filter xmlns="http://www.w3.org/2000/svg" id={shadowId} height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="0"/> 
          <feOffset dx="4" dy="4" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2"/>
          </feComponentTransfer>
          <feMerge> 
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/> 
          </feMerge>
        </filter>
      </defs>
    );
  }

  /** Create radial gradient
   * @param {string} gradId - identifire of this gradient
   * @param {number} cx - center x 
   * @param {number} cy - center y
   * @param {number} fx - offset x
   * @param {number} fy - offset y
   * @param {number} r -  radius
   * @param {Array} gradArr - Array of number or object. 
   * Example --
   * gradArr = [0.1, -0.06, 0.9] or 
   * gradArr = [{offset:0, opacity:0.06},{offset:83, opacity:0.2},{offset:95, opacity:0}]
   * (-) negative indicates darker shades
   * 
  */
  radialShadow(gradId, cx, cy, fx, fy, r, gradArr) {
    return (
      <defs>
        <radialGradient id={gradId} cx={cx} cy={cy} fx={fx} fy={fy} r={r} gradientUnits="userSpaceOnUse">
          {gradArr.map((grad, i) =>{
            let offset = i/gradArr.length*100;
            let opacity = grad; 
            let color = '#fff'; 
            if(typeof grad === 'object'){
              offset = grad.offset !== 'undefined' ? grad.offset : offset; 
              opacity = grad.opacity  !== 'undefined' ? grad.opacity : opacity; 
              if(opacity < 0) {
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

  getScaledFontSize(totalWidth, scale, maxSize) {
    let fSize = totalWidth / scale;
    return fSize < maxSize ? fSize : maxSize;
  }

  /** Returns true if it is a touch device 
   * @return {boolean}
  */
  isTouchDevice() {
    return "ontouchstart" in document.documentElement;
  }

  /* Get point in global SVG space*/
  cursorPoint(targetElem, evt) {
    if (typeof targetElem === "string") {
      targetElem = document.querySelector("#" + targetElem + " svg");
    }
    let pt = targetElem.createSVGPoint();
    pt.x = evt.clientX || evt.touches[0].clientX;
    pt.y = evt.clientY || evt.touches[0].clientY;
    return pt.matrixTransform(targetElem.getScreenCTM().inverse());
  } /*End cursorPoint()*/

}

export default new UiCore();