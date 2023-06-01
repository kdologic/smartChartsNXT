'use strict';

import { Component } from '../../viewEngin/pview';
import defaultConfig from '../../settings/config';
import { IAxisBarProps } from './axisBar.model';

/**
 * axisBar.component.tsx
 * @createdOn:14-Apr-2020
 * @author:SmartChartsNXT
 * @description: This components will create Axis bar.
 */

class AxisBar extends Component {
  constructor(props: IAxisBarProps) {
    super(props);
  }

  render() {
    return (
      <g transform={`translate(${this.props.posX},${this.props.posY})`} >
        { this.props.type === 'x' &&
          <line class='sc-x-axis' x1={0} y1={this.props.height} x2={this.props.width} y2={this.props.height} fill='none' stroke={this.props.xAxis.axisColor || defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed' />
        }
        { this.props.type === 'y' &&
          <line class='sc-y-axis' x1={0} y1={0} x2={0} y2={this.props.height} fill='none' stroke={this.props.yAxis.axisColor || defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed' />
        }
      </g>
    );
  }
}

export default AxisBar;