/**
 * watermark.js
 * @createdOn: 05-Jan-2018
 * @author: SmartChartsNXT
 * @version: 1.0.0
 * @description:This is a component class will create watermark area. 
 */ 

"use strict";

import { Component } from "./../viewEngin/pview";
import UiCore from './../core/ui.core';
import defaultConfig from "./../settings/config";

class Watermark extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g class='smartChartsNXT-watermark'>
        <style>
          {this.getStyle()}
        </style> 
        <text fill='#717171' text-rendering='geometricPrecision' style='cursor: pointer;' 
        events={{click : () => {window.open('http://www.smartcharts.cf');}}}>
          <tspan text-anchor='start' class='watermark-text' x={this.props.posX} y={this.props.posY} >{this.props.text}</tspan>
        </text>
      </g>
    );
  }

  getStyle() {
    return (`
      .smartChartsNXT-watermark .watermark-text {
        font-family: ${defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.props.svgWidth, 20, 10)};
        fill: ${defaultConfig.theme.fontColorMedium};
        stroke: none;
        stroke-width: 0;
      }
    `);
  }
}

export default Watermark; 