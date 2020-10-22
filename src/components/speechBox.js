'use strict';

import Point from './../core/point';
import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';

/**
 * speechBox.js
 * @createdOn:23-Jan-2018
 * @author:SmartChartsNXT
 * @description:This components will create speech box with SVG by providing top-left point and c-point.
 * @extends Component
 */

class SpeechBox extends Component {
  constructor(props) {
    super(props);
    this.aHalfWidth = typeof this.props.anchorBaseWidth === 'undefined' ? 8 : this.props.anchorBaseWidth;
    this.state = {
      aTop: false,
      aBottom: false,
      aLeft: false,
      aRight: false
    };
  }
  set cpoint(point) {
    this._cpoint = point;
    this.calcAnchorDirection();
  }

  get cpoint() {
    return this._cpoint;
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUpdate(nextProps) {
    this.aHalfWidth = typeof nextProps.anchorBaseWidth === 'undefined' ? 8 : nextProps.anchorBaseWidth;
  }

  render() {
    this.cpoint = this.props.cpoint;
    return (
      <g id={this.props.id || ''} class='sc-speech-box' transform={`translate(${this.props.x},${this.props.y})`}>
        {this.props.shadow && uiCore.dropShadow('sc-speech-box-drop-shadow')}
        <path class='sc-speech-box-path' d={this.getBoxPath()} fill={this.props.bgColor} fill-opacity={typeof this.props.fillOpacity === 'undefined' ? 1 : this.props.fillOpacity}
          filter={this.props.shadow ? 'url(#sc-speech-box-drop-shadow)' : ''}
          stroke={this.props.strokeColor} stroke-width={typeof this.props.strokeWidth === 'undefined' ? 1 : this.props.strokeWidth } stroke-opacity={typeof this.props.strokeOpacity === 'undefined' ? 1 : this.props.strokeOpacity}
          shape-rendering='geometricPrecision' vector-effect='non-scaling-stroke' />
      </g>
    );
  }

  getBoxPath() {
    const cr = this.props.cornerRadius || 0;
    let d = ['M', cr, 0];
    let topPath, bottomPath, leftPath, rightPath, cpoint = new Point(this.cpoint.x - this.props.x, this.cpoint.y - this.props.y);

    if (this.state.aTop) {
      topPath = ['L', cpoint.x - this.aHalfWidth, 0, cpoint.x, cpoint.y, cpoint.x + this.aHalfWidth, 0, this.props.width, 0];
      if (cr) {
        topPath = ['L', cpoint.x - this.aHalfWidth, 0, cpoint.x, cpoint.y, cpoint.x + this.aHalfWidth, 0, this.props.width - cr, 0, 'A', cr, cr, 0, 0, 1, this.props.width, cr];
      }
    } else {
      topPath = ['L', this.props.width, 0];
      if (cr) {
        topPath = ['L', this.props.width - cr, 0, 'A', cr, cr, 0, 0, 1, this.props.width, cr];
      }
    }
    if (this.state.aRight) {
      rightPath = ['L', this.props.width, cpoint.y - this.aHalfWidth, cpoint.x, cpoint.y, this.props.width, cpoint.y + this.aHalfWidth, this.props.width, this.props.height];
      if (cr) {
        rightPath = ['L', this.props.width, cpoint.y - this.aHalfWidth, cpoint.x, cpoint.y, this.props.width, cpoint.y + this.aHalfWidth, this.props.width, this.props.height - cr, 'A', cr, cr, 0, 0, 1, this.props.width - cr, this.props.height];
      }
    } else {
      rightPath = ['L', this.props.width, this.props.height];
      if (cr) {
        rightPath = ['L', this.props.width, this.props.height - cr, 'A', cr, cr, 0, 0, 1, this.props.width - cr, this.props.height];
      }
    }
    if (this.state.aBottom) {
      bottomPath = ['L', cpoint.x + this.aHalfWidth, this.props.height, cpoint.x, cpoint.y, cpoint.x - this.aHalfWidth, this.props.height, 0, this.props.height];
      if (cr) {
        bottomPath = ['L', cpoint.x + this.aHalfWidth, this.props.height, cpoint.x, cpoint.y, cpoint.x - this.aHalfWidth, this.props.height, cr, this.props.height, 'A', cr, cr, 0, 0, 1, 0, this.props.height - cr];
      }
    } else {
      bottomPath = ['L', 0, this.props.height];
      if (cr) {
        bottomPath = ['L', cr, this.props.height, 'A', cr, cr, 0, 0, 1, 0, this.props.height - cr];
      }
    }
    if (this.state.aLeft) {
      leftPath = ['L', 0, cpoint.y + this.aHalfWidth, cpoint.x, cpoint.y, 0, cpoint.y - this.aHalfWidth, 0, 0];
      if (cr) {
        leftPath = ['L', 0, cpoint.y + this.aHalfWidth, cpoint.x, cpoint.y, 0, cpoint.y - this.aHalfWidth, 0, cr, 'A', cr, cr, 0, 0, 1, cr, 0];
      }
    } else {
      leftPath = ['L', 0, 0];
      if (cr) {
        leftPath = ['L', 0, cr, 'A', cr, cr, 0, 0, 1, cr, 0];
      }
    }

    if (this.state.aTop && this.state.aRight) {
      topPath = ['L', this.props.width - (2 * this.aHalfWidth), 0, cpoint.x, cpoint.y];
      rightPath = ['L', this.props.width, (2 * this.aHalfWidth), this.props.width, this.props.height];
      if (cr) {
        rightPath = ['L', this.props.width, (2 * this.aHalfWidth), this.props.width, this.props.height - cr, 'A', cr, cr, 0, 0, 1, this.props.width - cr, this.props.height];
      }
    }

    if (this.state.aTop && this.state.aLeft) {
      topPath = ['L', cpoint.x, cpoint.y, (2 * this.aHalfWidth), 0, this.props.width, 0];
      leftPath = ['L', 0, (2 * this.aHalfWidth), cpoint.x, cpoint.y];
      if (cr) {
        topPath = ['L', this.props.width - cr, 0, 'A', cr, cr, 0, 0, 1, this.props.width, cr];
        leftPath = ['L', 0, (2 * this.aHalfWidth), cpoint.x, cpoint.y, cr + this.aHalfWidth, 0];
      }
    }

    if (this.state.aBottom && this.state.aRight) {
      bottomPath = ['L', cpoint.x, cpoint.y, this.props.width - (2 * this.aHalfWidth), this.props.height, 0, this.props.height];
      rightPath = ['L', this.props.width, this.props.height - (2 * this.aHalfWidth), cpoint.x, cpoint.y];
      if (cr) {
        bottomPath = ['L', cpoint.x, cpoint.y, this.props.width - (2 * this.aHalfWidth), this.props.height, cr, this.props.height, 'A', cr, cr, 0, 0, 1, 0, this.props.height - cr];
      }
    }

    if (this.state.aBottom && this.state.aLeft) {
      bottomPath = ['L', (2 * this.aHalfWidth), this.props.height, cpoint.x, cpoint.y];
      leftPath = ['L', cpoint.x, cpoint.y, 0, this.props.height - (2 * this.aHalfWidth), 0, 0];
      if (cr) {
        leftPath = ['L', cpoint.x, cpoint.y, 0, this.props.height - (2 * this.aHalfWidth), 0, cr, 'A', cr, cr, 0, 0, 1, cr, 0];
      }
    }

    d.push(...topPath, ...rightPath, ...bottomPath, ...leftPath, 'Z');
    return d.join(' ');
  }

  calcAnchorDirection() {
    const cr = this.props.cornerRadius || 0;
    this.state.aTop = this.props.y > (this.cpoint.y - this.aHalfWidth - cr) ? true : false;
    this.state.aBottom = this.cpoint.y > (this.props.y + this.props.height - this.aHalfWidth - cr) ? true : false;
    this.state.aRight = this.cpoint.x > (this.props.x + this.props.width - this.aHalfWidth - cr) ? true : false;
    this.state.aLeft = this.props.x > (this.cpoint.x - this.aHalfWidth - cr) ? true : false;
  }
}

export default SpeechBox;