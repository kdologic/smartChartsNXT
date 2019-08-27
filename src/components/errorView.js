'use strict';

import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';


/**
 * errorView.js
 * @createdOn:28-Dec-2017
 * @author:SmartChartsNXT
 * @description: This components will show error screen.
 */

class ErrorView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        version={1.1}
        width={this.props.width}
        height={this.props.height}
        id={`${this.props.chartType}_${this.props.runId}_error`}
        style={{
          background: 'none',
          MozTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitUserSelect: 'none',
          HtmlUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          OUserSelect: 'none',
          UserSelect: 'none'
        }}>
        <rect x='0' y='0' width={this.props.width} height={this.props.height} fill='#eee' stroke='none'></rect>
        <path class='upper-box' d={this.getUpperBoxPath().join(' ')} filter='' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>
        <path class='lower-box' d={this.getLowerBoxPath().join(' ')} filter='' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>
        <circle cx={this.props.width / 2} cy={(this.props.height / 2) - 80} r='25' fill='#717171' />
        <text fill='#fff' x={(this.props.width / 2) - 5} y={(this.props.height / 2) - 70} font-weight='bold' font-size='35'>i</text>
        <text class='error-text-group' fill='#000' font-family='Lato' text-rendering='geometricPrecision'>
          <tspan class='err-text' text-anchor='middle' x={this.props.width / 2} y={this.props.height / 2} font-size={uiCore.getScaledFontSize(this.props.width, 15, 25)} >Oops! Something went wrong. </tspan>
          <tspan class='err-text' text-anchor='middle' x={this.props.width / 2} y={(this.props.height / 2 + 30)} font-size={uiCore.getScaledFontSize(this.props.width, 25, 16)} fill='#03A9F4'>See the javascript console for technical details.</tspan>
        </text>
      </svg>
    );
  }

  getUpperBoxPath() {
    return [
      'M', 0, 0,
      'H', this.props.width,
      'V', 50,
      ...(this.getZigZagPath())
    ];
  }

  getLowerBoxPath() {
    return [
      'M', 0, this.props.height,
      'H', this.props.width,
      'v', -40,
      ...(this.getZigZagPath())
    ];
  }

  getZigZagPath() {
    let zigzagPath = [];
    for (let i = this.props.width, counter = 0; i >= 0; i -= 10, counter++) {
      zigzagPath.push('l', -10, (counter % 2 === 0 ? -10 : 10));
    }
    zigzagPath.push('Z');
    return zigzagPath;
  }

}

export default ErrorView;