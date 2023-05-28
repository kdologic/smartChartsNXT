'use strict';

import { IVnode } from '../../viewEngin/component.model';
import { PATTERN } from './../../settings/globalEnums';
import { IDefImageFill, IPattern, IPatternChild } from './patterns.model';

/**
 * patterns.tsx
 * @createdOn: 20-Jun-2020
 * @author: SmartChartsNXT
 * @description: This components will create the predefined and custom patterns for chart.
 * @extends Component
 */

class Patterns {
  createCustom(opts: IPattern, id: string): IVnode {
    const TagName = opts.tagName;
    return (
      <defs>
        <TagName id={id} {...opts.attrs}  >
          {
            opts.children.map((child: IPatternChild) => {
              let ChildTag = child.tagName;
              return (<ChildTag {...child.attrs} />);
            })
          }
        </TagName>
      </defs>);
  }

  createImageType(opts: IDefImageFill, id: string): IVnode {
    return (
      <defs>
        <pattern id={id} x="0" y="0" width='1' height='1'  >
          <image width={opts.width || '100%'} height={opts.height || '100%'} preserveAspectRatio="none" href={opts.src || ''} />
        </pattern>
      </defs>);
  }

  getType(patternName: PATTERN, id: string, fillColor: string = '#000') {
    switch (patternName) {
      case PATTERN.CIRCLE_2: return (
        <defs>
          <pattern id={id} x="0" y="0" width="9" height="9" patternUnits="userSpaceOnUse" >
            <circle cx="3" cy="3" r="3" stroke='none' fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.CIRCLE_3: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <circle cx="5" cy="5" r="4" stroke-width='2' stroke={fillColor} fill='none' />
          </pattern>
        </defs>
      );
      case PATTERN.BACK_DIAGONAL_1: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <path d="M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11" stroke-width="1" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.BACK_DIAGONAL_2: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <path d="M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11" stroke-width="3" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.FRONT_DIAGONAL_1: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <path d="M 10 0 L 0 10 M 1 -1 L -1 1 M 9 11 L 11 9" stroke-width="1" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.FRONT_DIAGONAL_2: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <path d="M 10 0 L 0 10 M 1 -1 L -1 1 M 9 11 L 11 9" stroke-width="3" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.VERTICAL_1: return (
        <defs>
          <pattern id={id} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse" >
            <path d="M 1 0 L 1 5" stroke-width="1" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.VERTICAL_2: return (
        <defs>
          <pattern id={id} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" >
            <path d="M 3 0 L 3 6" stroke-width="3" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.HORIZONTAL_1: return (
        <defs>
          <pattern id={id} x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse" >
            <path d="M 0 1 L 5 1" stroke-width="1" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.HORIZONTAL_2: return (
        <defs>
          <pattern id={id} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse" >
            <path d="M 0 3 L 6 3" stroke-width="3" stroke={fillColor} fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.SQUARE: return (
        <defs>
          <pattern id={id} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" >
            <rect x={2} y={2} width={5} height={5} stroke-width="2" stroke={fillColor} fill='none' />
          </pattern>
        </defs>
      );
      case PATTERN.BOX3D: return (
        <defs>
          <pattern id={id} x="0" y="0" width="17.4" height="30" patternUnits="userSpaceOnUse" >
            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" stroke-width="1" stroke={fillColor} fill='none' />
            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" transform="translate(8.7,15)" stroke-width="1" stroke={fillColor} fill='none' />
            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" transform="translate(-8.7,15)" stroke-width="1" stroke={fillColor} fill='none' />

            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" transform="translate(-8.7,-5)" stroke-width="1" stroke-opacity="0.5" stroke={fillColor} fill='none' />
            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" transform="translate(0,10)" stroke-width="1" stroke-opacity="0.5" stroke={fillColor} fill='none' />
            <path d="M8.660254037844386 0L17.32050807568877 5L17.32050807568877 15L8.660254037844386 20L0 15L0 5Z" transform="translate(-17.4,10)" stroke-width="1" stroke-opacity="0.5" stroke={fillColor} fill='none' />
          </pattern>
        </defs>
      );
      case PATTERN.SHAPE_S: return (
        <defs>
          <pattern id={id} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse" >
            <path d="M 10 1 L 5 1 L 5 9 L 0 9" stroke-width="2" stroke={fillColor} fill='none' />
          </pattern>
        </defs>
      );
      case PATTERN.CHECKERBOARD: return (
        <defs>
          <pattern id={id} x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse" >
            <rect x={0} y={0} width={7.5} height={7.5} stroke='none' fill={fillColor} />
            <rect x={7.5} y={7.5} width={7.5} height={7.5} stroke='none' fill={fillColor} />
          </pattern>
        </defs>
      );
      case PATTERN.CIRCLE_1:
      default: return (
        <defs>
          <pattern id={id} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse" >
            <circle cx="1" cy="1" r="1" stroke='none' fill={fillColor} />
          </pattern>
        </defs>
      );
    }
  }
}

export default new Patterns();