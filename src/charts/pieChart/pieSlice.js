"use strict";

/*
 * pieSlice.js
 * @CreatedOn: 01-Nov-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:This is a component class which create each pie slice and bind related events. 
 */

import Point from "./../../core/point";
import Geom from './../../core/geom.core'; 
import {Component} from "./../../viewEngin/pview";
import UtilCore from './../../core/util.core';

class PieSlice extends Component {
  constructor(props) {
    super(props);
    this.colorLegendWidth = 40; 
    this.colorLegendHeight = 2; 
    this.midAngle = (this.props.startAngle + this.props.endAngle)/2;
    this.slicedOut = false; 
    this.state = {
      upperArcPath: this.getUpperArcPath(),
      upperArcTransform: "",
      legendPath: this.getLegendPath(),
      colorStartPoint: this.getColorLegendStartPoint(),
      colorTransform: "",
      textStartPoint: this.getTextStartPoint(),
      textTransform: ""
    };
  }

  render() {
    return (
      <g class={`pie-grp-${this.props.index}`} events={{click:this.slideToggle.bind(this)}}>
        <rect class={`pie-${this.props.index} color-legend-${this.props.index}`} x={this.state.colorStartPoint.x} y={this.state.colorStartPoint.y} transform={this.state.colorTransform} width={this.colorLegendWidth} height={this.colorLegendHeight} fill={this.props.data.color} fill-opacity='1' />
        <text class={`pie-${this.props.index} txt-pie-grp-pie-${this.props.index}`} transform={this.state.textTransform} fill='#717171' font-family='Lato'>
          <tspan class={`pie-${this.props.index} txt-pie-${this.props.index}`} x={this.state.textStartPoint.x} y={this.state.textStartPoint.y} text-anchor={this.getTextAnchor()} font-size='16'>{`${this.props.data.label} [${this.props.data.percent.toFixed(2)} %]`}</tspan>
        </text>
        <path class={`pie-${this.props.index} pie-hover-${this.props.index}`} fill={this.props.data.color} stroke='none' stroke-width='0' fill-opacity='0' style={{'transition': 'fill-opacity 0.3s linear', 'cursor':'pointer'}} /> 
        <path class={`pie-${this.props.index} upper-arc-pie-${this.props.index}`} d={this.state.upperArcPath} transform={this.state.upperArcTransform} fill={this.props.data.color} stroke={this.props.strokeColor} stroke-width={this.props.strokeWidth} style={{'cursor':'pointer'}} />
        <path class={`pie-${this.props.index} path-to-legend-${this.props.index}`} d={this.state.legendPath} fill='none' stroke='#555' stroke-width='1' />
      </g>
    );
  }

  getUpperArcPath() {
    let path = Geom.describeEllipticalArc(this.props.cx, this.props.cy, this.props.width, this.props.height, this.props.startAngle, this.props.endAngle, 0);
    return path.d;
  }

  getLowerOrbitalPoint() {
    return Geom.polarToCartesian(this.props.cx, this.props.cy, Geom.getEllipticalRadious(this.props.width, this.props.height, this.midAngle), this.midAngle);
  }

  getUpperOrbitalPoint() {
    return Geom.polarToCartesian(this.props.cx, this.props.cy, Geom.getEllipticalRadious(this.props.width + this.props.offsetWidth, this.props.height + this.props.offsetHeight, this.midAngle), this.midAngle);
  }

  getTextAnchor() {
    return this.midAngle > 180 ? 'end' : 'start';
  }

  getTextStartPoint() {
    let ePoint = this.getUpperOrbitalPoint();
    return new Point(ePoint.x + (this.midAngle > 180 ? -(10) : 10), ePoint.y + 5);
  }

  getColorLegendStartPoint() {
    let txtStartPoint = this.getTextStartPoint();
    return new Point(txtStartPoint.x + (this.midAngle > 180 ? -(this.colorLegendWidth) : 0), txtStartPoint.y + 4);
  }

  getLegendPath(sPoint = this.getLowerOrbitalPoint(), ePoint = this.getUpperOrbitalPoint()) {
    return ["M", sPoint.x, sPoint.y, "L", ePoint.x, ePoint.y, "l", (this.midAngle > 180 ? -5 : 5), 0].join(' ');
  }

  slideToggle() {
    if (!this.props.toggleEnabled) {
      return void 0;
    }
    let reState = {}; 
    let sliceOut = this.slicedOut;
    let shiftIndex = sliceOut ? 15 : 1;
    this.slicedOut = !this.slicedOut; 
    let shiftInterval = setInterval(() => {
      let shiftedCentre = Geom.polarToCartesian(this.props.cx, this.props.cy, Geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, this.midAngle), this.midAngle);
      if (isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y)) {
        shiftedCentre = new Point(this.props.cx, this.props.cy);
      }
      let sPoint = Geom.polarToCartesian(shiftedCentre.x, shiftedCentre.y, Geom.getEllipticalRadious(this.props.width, this.props.height, this.midAngle), this.midAngle);
      let ePoint = Geom.polarToCartesian(this.props.cx, this.props.cy, Geom.getEllipticalRadious(this.props.width + this.props.offsetWidth, this.props.height + this.props.offsetHeight, this.midAngle), this.midAngle);
      ePoint.x += (this.midAngle > 180 ? -shiftIndex : shiftIndex);

      reState.legendPath = this.getLegendPath(sPoint, ePoint);
      reState.upperArcTransform = `translate(${shiftedCentre.x - this.props.cx}, ${shiftedCentre.y - this.props.cy})`;
      reState.textTransform = `translate(${this.midAngle > 180 ? -shiftIndex : shiftIndex}, 0)`;
      reState.colorTransform = `translate(${this.midAngle > 180 ? -shiftIndex : shiftIndex}, 0)`;

      shiftIndex = sliceOut ? shiftIndex - 1 : shiftIndex + 1;
      if ((!sliceOut && shiftIndex === 15) || (sliceOut && shiftIndex === -1)) {
        clearInterval(shiftInterval);
      }
      this.setState(reState); 
    }, 10);
  }

}

export default PieSlice; 