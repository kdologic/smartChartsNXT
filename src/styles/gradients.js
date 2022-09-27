'use strict';

import { OPTIONS_TYPE } from './../settings/globalEnums';
const enums = new OPTIONS_TYPE();

/**
 * gradients.js
 * @createdOn: 21-Jun-2020
 * @author: SmartChartsNXT
 * @description: This components will create the predefined and custom gradients for chart.
 * @extends Component
 */

class Gradients {
  constructor() { }

  createCustom(opts, id) {
    const TagName = opts.tagName;
    return (
    <defs>
      <TagName id={id} {...opts.attrs} >
      {
        opts.stops.map((stopAttrs) => {
          return (<stop {...stopAttrs} />);
        })
      }
      </TagName>
    </defs>);
  }

  getType(gradientName, id, fillColor = '#000') {
    switch (gradientName) {
      case enums.GRADIENT.LINEAR_HORIZONTAL: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </linearGradient>
        </defs>
      );
      default:
      case enums.GRADIENT.LINEAR_HORIZONTAL_REV: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </linearGradient>
        </defs>
      );
      case enums.GRADIENT.LINEAR_VERTICAL: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </linearGradient>
        </defs>
      );
      case enums.GRADIENT.LINEAR_VERTICAL_REV: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </linearGradient>
        </defs>
      );
      case enums.GRADIENT.RADIAL: return (
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </radialGradient>
        </defs>
      );
      case enums.GRADIENT.RADIAL_REV: return (
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </radialGradient>
        </defs>
      );
    }
  }
}

export default new Gradients();