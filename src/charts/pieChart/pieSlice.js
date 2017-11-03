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
import Ui from './../../core/ui.core'; 
import UtilCore from './../../core/util.core';
import {Component} from "./../../viewEngin/pview";

class PieSlice extends Component {
  constructor(props) {
    super(props);
    this.colorLegendWidth = 40; 
    this.colorLegendHeight = 2; 
    this.midAngle = (this.props.startAngle + this.props.endAngle)/2;
    this.slicedOut = false; 
    this.state = {
      startAngle: this.props.startAngle, 
      endAngle: this.props.endAngle,
      upperArcTransform: "",
      legendPath: this.getLegendPath(),
      colorTransform: "",
      textTransform: ""
    };
  }

  render() {
    let textStartPoint = this.getTextStartPoint(); 
    let colorStartPoint = this.getColorLegendStartPoint(); 
    return (
      <g class={`pie-grp-${this.props.index}`} events={{rotatePie: this.rotatePie.bind(this)}} >
        <rect class={`pie-${this.props.index} color-legend-${this.props.index}`} x={colorStartPoint.x} y={colorStartPoint.y} transform={this.state.colorTransform} width={this.colorLegendWidth} height={this.colorLegendHeight} fill={this.props.data.color} fill-opacity='1' />
        <text class={`pie-${this.props.index} txt-pie-grp-pie-${this.props.index}`} transform={this.state.textTransform} fill='#717171' font-family='Lato'>
          <tspan class={`pie-${this.props.index} txt-pie-${this.props.index}`} x={textStartPoint.x} y={textStartPoint.y} text-anchor={this.getTextAnchor()} font-size='16'>{`${this.props.data.label} [${this.props.data.percent.toFixed(2)} %]`}</tspan>
        </text>
        <path class={`pie-${this.props.index} pie-hover-${this.props.index}`} fill={this.props.data.color} stroke='none' stroke-width='0' fill-opacity='0' style={{'transition': 'fill-opacity 0.3s linear', 'cursor':'pointer'}} /> 
        <path class={`pie-${this.props.index} upper-arc-pie-${this.props.index}`} 
          d={this.getUpperArcPath()} transform={this.state.upperArcTransform} fill={this.props.data.color} 
          stroke={this.props.strokeColor} stroke-width={this.props.strokeWidth} style={{'cursor':'pointer'}}
          events={{
            mousedown:this.onMouseDown.bind(this), mouseup:this.onMouseUp.bind(this),
            mousemove:this.onMouseMove.bind(this)
          }} 
        />
        <path class={`pie-${this.props.index} path-to-legend-${this.props.index}`} d={this.state.legendPath} fill='none' stroke='#555' stroke-width='1' />
      </g>
    );
  }


  getUpperArcPath() {
    let path = Geom.describeEllipticalArc(this.props.cx, this.props.cy, this.props.width, this.props.height, this.state.startAngle || this.props.startAngle, this.state.endAngle || this.props.endAngle, 0);
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

  onMouseDown(e) {
    e.stopPropagation();
    this.mouseDownPos = { x: e.clientX, y: e.clientY };
    this.mouseDown = 1;
  }

  onMouseUp(e) {
    e.stopPropagation();
    this.mouseDown = 0;
    if(this.mouseDrag === 0) {
      this.slideToggle(); 
    }
    this.mouseDrag = 0;
  }

  onMouseMove(e) {
    if (!this.props.toggleEnabled) {
      return;
    }
    if (this.mouseDown === 1 && (this.mouseDownPos.x !== e.clientX && this.mouseDownPos.y !== e.clientY)) {
      let dragStartPoint = Ui.cursorPoint(this.props.rootNodeId, e);
      let dragAngle = this.getAngle(new Point(this.props.cx, this.props.cy), dragStartPoint);

      if (dragAngle > this.dragStartAngle) {
        this.props.rotateChart(2, false);
      } else {
        this.props.rotateChart(-2, false);
      }
      this.dragStartAngle = dragAngle;
      this.mouseDrag = 1;
      //this.tooltip.hide();
    } else {
      /** for tooltip only  */
      // let mousePos = Ui.cursorPoint(this.props.rootNodeId, e);
      // let pieData, elemId = e.target.getAttribute("class");
      // let pieIndex = elemId.substring("pie".length);

      // for (let i in this.CHART_DATA.pieSet) {
      //   if (this.CHART_DATA.pieSet[i].id === elemId) {
      //     pieData = this.CHART_DATA.pieSet[i];
      //   }
      // }
      // let row1 = this.CHART_DATA.uniqueDataSet[pieIndex].label + ", " + this.CHART_DATA.uniqueDataSet[pieIndex].value;
      // let row2 = this.CHART_DATA.uniqueDataSet[pieIndex].percent.toFixed(2) + "%";
      // let color = (this.CHART_OPTIONS.dataSet[pieIndex].color ? this.CHART_OPTIONS.dataSet[pieIndex].color : UtilCore.getColor(pieIndex));
      // this.tooltip.updateTip(mousePos, color, row1, row2);
    }
  }

  rotatePie(e) {
    this.midAngle = ((this.state.startAngle + this.state.endAngle) / 2) % 360;
    this.setState({
      startAngle: this.state.startAngle + e.detail.rotationIndex,
      endAngle: this.state.endAngle += e.detail.rotationIndex,
      legendPath: this.getLegendPath()
    });
  }

  getAngle(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    let rad = Math.atan2(deltaY, deltaX);
    let deg = rad * 180.0 / Math.PI;
    deg = (deg < 0) ? deg + 450 : deg + 90;
    return deg % 360;
  }
}

export default PieSlice; 