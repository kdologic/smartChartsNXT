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
      arcTransform: "",
      legendPath: this.getLegendPath(),
      colorTransform: "",
      textTransform: ""
    };
  }

  componentDidMount() {
    if(this.props.slicedOut === true) {
      this.toggleSlide(); 
    }
  }

  render() {
    let textStartPoint = this.getTextStartPoint(); 
    let colorStartPoint = this.getColorLegendStartPoint(); 
    return (
      <g class={`pie-grp-${this.props.index}`} 
        events={{
          onRotateSlice: this.rotateSlice.bind(this), 
          toggleSlide: this.toggleSlide.bind(this),
          sliceHover: this.onMouseEnter.bind(this), 
          sliceLeave: this.onMouseLeave.bind(this)
        }} >
        <rect class={`pie-${this.props.index} color-legend-${this.props.index}`} x={colorStartPoint.x} y={colorStartPoint.y} transform={this.state.colorTransform} width={this.colorLegendWidth} height={this.colorLegendHeight} fill={this.props.data.color} fill-opacity='1' />
        <text class={`pie-${this.props.index} txt-pie-grp-pie-${this.props.index}`} transform={this.state.textTransform} fill='#717171' font-family='Lato'>
          <tspan class={`pie-${this.props.index} txt-pie-${this.props.index}`} x={textStartPoint.x} y={textStartPoint.y} text-anchor={this.getTextAnchor()} font-size='16'>{`${this.props.data.label} [${this.props.data.percent.toFixed(2)} %]`}</tspan>
        </text>
        <path class={`pie-${this.props.index} pie-hover-${this.props.index}`} 
          d={this.getArcPath(this.props.width + 10, this.props.height + 10)} transform={this.state.arcTransform} 
          fill={this.props.data.color} stroke='none' stroke-width='0' fill-opacity='0'
          style={{'transition': 'fill-opacity 0.3s linear', 'cursor':'pointer'}} 
        /> 
        <path class={`pie-${this.props.index} upper-arc-pie-${this.props.index}`} 
          d={this.getArcPath()} transform={this.state.arcTransform} fill={this.props.data.color} 
          stroke={this.props.strokeColor} stroke-width={this.props.strokeWidth} style={{'cursor':'pointer'}}
          events={{
            mousedown: this.onMouseDown.bind(this), touchstart: this.onMouseDown.bind(this),
            mouseup: this.onMouseUp.bind(this), touchend: this.onMouseUp.bind(this), 
            mousemove: this.onMouseMove.bind(this), touchmove: this.onMouseMove.bind(this),
            mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)
          }} 
        />
        <path class={`pie-${this.props.index} path-to-legend-${this.props.index}`} d={this.state.legendPath} fill='none' stroke='#555' stroke-width='1' />
      </g>
    );
  }


  getArcPath(width = this.props.width, height = this.props.height) {
    let path = Geom.describeEllipticalArc(this.props.cx, this.props.cy, width, height, this.state.startAngle || this.props.startAngle, this.state.endAngle || this.props.endAngle, 0);
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

  toggleSlide() {
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
      reState.arcTransform = `translate(${shiftedCentre.x - this.props.cx}, ${shiftedCentre.y - this.props.cy})`;
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
    e.preventDefault(); 
    this.mouseDownPos = { x: e.clientX || e.touches[0].clientX, y: e.clientY || e.touches[0].clientY };
    this.mouseDown = 1;
    this.mouseDrag = 0; 
  }

  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault(); 
    if(this.mouseDrag === 0) {
      this.toggleSlide(); 
    }
    this.mouseDown = 0;
    this.mouseDrag = 0;
  }

  onMouseMove(e) {
    if (!this.props.toggleEnabled) {
      return;
    }
    let pos = {clientX : e.clientX || e.touches[0].clientX, clientY : e.clientY || e.touches[0].clientY };
    if (this.mouseDown === 1 && (this.mouseDownPos.x !== pos.clientX && this.mouseDownPos.y !== pos.clientY)) {
      let dragStartPoint = Ui.cursorPoint(this.props.rootNodeId, pos);
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

  onMouseEnter(e) {
    this.ref.node.querySelector(`.pie-hover-${this.props.index}`).style['fill-opacity'] = 0.4; 
  }

  onMouseLeave(e) {
    this.mouseDown = 0; 
    this.ref.node.querySelector(`.pie-hover-${this.props.index}`).style['fill-opacity'] = 0; 
  }

  rotateSlice(e) {
    this.slicedOut = false; 
    this.state.startAngle = this.state.startAngle + e.detail.rotationIndex; 
    this.state.endAngle = this.state.endAngle + e.detail.rotationIndex;
    let mid = ((this.state.startAngle + this.state.endAngle) / 2) % 360;
    this.midAngle = (mid < 0 ? 360 + mid : mid);
    
    this.state.legendPath = this.getLegendPath(); 
    this.state.arcTransform = this.state.colorTransform = this.state.textTransform = ''; 
    let textStartPoint = this.getTextStartPoint(); 
    let colorStartPoint = this.getColorLegendStartPoint(); 
    let upperArc = this.ref.node.querySelector(`.upper-arc-pie-${this.props.index}`);
    let colorLegend = this.ref.node.querySelector(`.color-legend-${this.props.index}`); 
    let textPie = this.ref.node.querySelector(`.txt-pie-${this.props.index}`);
    let pieHover = this.ref.node.querySelector(`.pie-hover-${this.props.index}`); 
    
    upperArc.setAttribute('d', this.getArcPath());
    upperArc.setAttribute('transform', this.state.arcTransform); 
    pieHover.setAttribute('d', this.getArcPath(this.props.width + 10, this.props.height + 10));
    pieHover.setAttribute('transform', this.state.arcTransform); 

    this.ref.node.querySelector(`.path-to-legend-${this.props.index}`).setAttribute('d', this.state.legendPath);
    
    colorLegend.setAttribute('x', colorStartPoint.x);
    colorLegend.setAttribute('y', colorStartPoint.y);
    colorLegend.setAttribute('transform', this.state.colorTransform);
    
    textPie.setAttribute('x', textStartPoint.x);
    textPie.setAttribute('y', textStartPoint.y);
    textPie.setAttribute('text-anchor', this.getTextAnchor());
    textPie.parentNode.setAttribute('transform',this.state.textTransform); 
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