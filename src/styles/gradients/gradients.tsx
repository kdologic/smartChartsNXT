'use strict';

import { GRADIENT } from '../../global/global.enums';
import { IVnode } from '../../viewEngin/component.model';
import { IGradient, IGradientStop } from './gradients.model';

/**
 * gradients.tsx
 * @createdOn: 21-Jun-2020
 * @author: SmartChartsNXT
 * @description: This components will create the predefined and custom gradients for chart.
 * @extends Component
 */

class Gradients {
  createCustom(opts: IGradient, id: string): IVnode {
    const TagName = opts.tagName;
    return (
      <defs>
        <TagName id={id} {...opts.attrs} >
          {
            opts.stops.map((stopAttrs: IGradientStop) => {
              return (<stop {...stopAttrs} />);
            })
          }
        </TagName>
      </defs>);
  }

  getType(gradientName: GRADIENT, id: string, fillColor: string = '#000'): IVnode {
    switch (gradientName) {
      case GRADIENT.LINEAR_HORIZONTAL: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </linearGradient>
        </defs>
      );

      case GRADIENT.LINEAR_VERTICAL: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </linearGradient>
        </defs>
      );
      case GRADIENT.LINEAR_VERTICAL_REV: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </linearGradient>
        </defs>
      );
      case GRADIENT.RADIAL: return (
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={fillColor} stop-opacity="1" />
          </radialGradient>
        </defs>
      );
      case GRADIENT.RADIAL_REV: return (
        <defs>
          <radialGradient id={id} cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </radialGradient>
        </defs>
      );
      case GRADIENT.LINEAR_HORIZONTAL_REV:
      default: return (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={fillColor} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </linearGradient>
        </defs>
      );
    }
  }
}

export default new Gradients();