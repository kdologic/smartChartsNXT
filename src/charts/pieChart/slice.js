"use strict";

/** 
 * slice.js
 * @createdOn: 01-Nov-2017
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:This is a component class which create each slice and bind related events. 
 */

import defaultConfig from "./../../settings/config";
import Point from "./../../core/point";
import GeomCore from './../../core/geom.core'; 
import UiCore from './../../core/ui.core'; 
import UtilCore from './../../core/util.core';
import {Component} from "./../../viewEngin/pview";

class Slice extends Component {
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
    this.maxMarkerTextLen = 15;
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  afterMount() {
    if(this.props.slicedOut === true) {
      this.toggleSlide(); 
    }
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  render() {
    let textStartPoint = this.getTextStartPoint(); 
    let colorStartPoint = this.getColorLegendStartPoint(); 
    return (
      <g class={`slice-grp-${this.props.index}`} 
        events={{
          toggleSlide: this.toggleSlide.bind(this),
          sliceHover: this.onMouseEnter.bind(this), 
          sliceLeave: this.onMouseLeave.bind(this)
        }} >

        {this.props.showSliceMarker &&
          <g class={`slice-marker-${this.props.index}`}>
            <rect class={`slice-${this.props.index} color-legend-${this.props.index}`} x={colorStartPoint.x} y={colorStartPoint.y} transform={this.state.colorTransform} width={this.colorLegendWidth} height={this.colorLegendHeight} fill={this.props.data.color} fill-opacity='1' />
            <text class={`slice-${this.props.index} txt-slice-grp-slice-${this.props.index}`} transform={this.state.textTransform} fill={defaultConfig.theme.fontColorMedium} font-family={defaultConfig.theme.fontFamily}>
              <tspan class={`slice-${this.props.index} txt-slice-${this.props.index}`} x={textStartPoint.x} y={textStartPoint.y} text-anchor={this.getTextAnchor()} font-size={this.props.fontSize}>
                {this.getMarkerText(this.props.data)}
              </tspan>
            </text>
            <path class={`slice-${this.props.index} path-to-legend-${this.props.index}`} d={this.state.legendPath} stroke-linejoin='round' vector-effect="non-scaling-stroke" fill='none' stroke={defaultConfig.theme.fontColorMedium} stroke-width='1' />
          </g>
        }
        <path class={`slice-${this.props.index} slice-hover-${this.props.index}`} 
          d={this.getArcPath(this.props.width + 10, this.props.height + 10)} transform={this.state.arcTransform} 
          fill={this.props.data.color} stroke='none' stroke-width='0' fill-opacity='0'
          style={{'transition': 'fill-opacity 0.3s linear', 'cursor':'pointer'}} 
        /> 
        <path class={`slice-${this.props.index} upper-arc-slice-${this.props.index}`} tabindex='0'
          d={this.getArcPath()} transform={this.state.arcTransform} fill={this.props.data.color} stroke-linecap='butt' stroke-linejoin='bevel'
          stroke={this.props.strokeColor} stroke-width={this.props.strokeWidth} style={{'cursor':'pointer'}}
          events={{
            mousedown: this.onMouseDown.bind(this), touchstart: this.onMouseDown.bind(this),
            mouseup: this.onMouseUp.bind(this), touchend: this.onMouseUp.bind(this), 
            mousemove: this.onMouseMove.bind(this), touchmove: this.onMouseMove.bind(this),
            mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this),
            focusin: this.onMouseEnter.bind(this), focusout: this.onMouseLeave.bind(this), 
            keyup: this.onKeyUp.bind(this)
          }} 
        />
        {
          UiCore.radialGradient(`grad-slice${this.props.index}`, this.props.cx, this.props.cy, this.props.cx, this.props.cy, this.props.width, this.props.gradient)
        }
        <path class={`slice-${this.props.index} gradient-arc-slice-${this.props.index}`} 
          d={this.getArcPath()} transform={this.state.arcTransform} 
          stroke-width="0.5" stroke-linecap="square" stroke-linejoin="round" fill-opacity="1" stroke-opacity="1" 
          fill={`url(#grad-slice${this.props.index})`} style={{'pointer-events':'none'}}
        />
      </g>
    );
  }

  getMarkerText(data) {
    let text = "";
    if (data.label) {
      text = this.props.hideMarkerText ? "" : data.label.substring(0, this.maxMarkerTextLen);
      text += (!this.props.hideMarkerText && data.label.length > this.maxMarkerTextLen) ? '..' : "";
      text += `[${data.percent.toFixed(2)} %]`;
    }
    return text;
  }

  getArcPath(width = this.props.width, height = this.props.height, innerWidth = this.props.innerWidth, innerHeight = this.props.innerHeight) {
    let path = this.describeArc(this.props.cx, this.props.cy, width, height, innerWidth, innerHeight, this.state.startAngle || this.props.startAngle, this.state.endAngle || this.props.endAngle);
    return path.d;
  }

  getLowerOrbitalPoint() {
    return GeomCore.polarToCartesian(this.props.cx, this.props.cy, GeomCore.getEllipticalRadius(this.props.width, this.props.height, this.midAngle), this.midAngle);
  }

  getUpperOrbitalPoint() {
    return GeomCore.polarToCartesian(this.props.cx, this.props.cy, GeomCore.getEllipticalRadius(this.props.width + this.props.offsetWidth, this.props.height + this.props.offsetHeight, this.midAngle), this.midAngle);
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
      let shiftedCentre = GeomCore.polarToCartesian(this.props.cx, this.props.cy, GeomCore.getEllipticalRadius(shiftIndex * 2, shiftIndex * 2, this.midAngle), this.midAngle);
      if (isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y)) {
        shiftedCentre = new Point(this.props.cx, this.props.cy);
      }
      let sPoint = GeomCore.polarToCartesian(shiftedCentre.x, shiftedCentre.y, GeomCore.getEllipticalRadius(this.props.width, this.props.height, this.midAngle), this.midAngle);
      let ePoint = GeomCore.polarToCartesian(this.props.cx, this.props.cy, GeomCore.getEllipticalRadius(this.props.width + this.props.offsetWidth, this.props.height + this.props.offsetHeight, this.midAngle), this.midAngle);
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

  describeArc(cx, cy, rMaxX, rMaxY, rMinX, rMinY, startAngle, endAngle, sweepFlag = 0) {
    let fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }
    let outerArcStart = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rMaxX, rMaxY, endAngle), endAngle);
    let outerArcEnd = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rMaxX, rMaxY, startAngle), startAngle);
    let innerArcStart = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rMinX, rMinY, endAngle), endAngle);
    let innerArcEnd = GeomCore.polarToCartesian(cx, cy, GeomCore.getEllipticalRadius(rMinX, rMinY, startAngle), startAngle);
    let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    let d = [
      "M", outerArcStart.x, outerArcStart.y,
      "A", rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y,
      "L", innerArcEnd.x, innerArcEnd.y,
      "A", rMinX, rMinY, 0, largeArcFlag, Math.abs(sweepFlag - 1), innerArcStart.x, innerArcStart.y,
      "Z"
    ];

    if (fullArc) {
      d.push("L", outerArcStart.x, outerArcStart.y);
    }
    let path = {
      "d": d.join(" "),
      "outerArc": [rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y].join(" "),
      "outerArcStart": outerArcStart,
      "outerArcEnd": outerArcEnd,
      "innerArc": [rMinX, rMinY, 0, largeArcFlag, sweepFlag, innerArcStart.x, innerArcStart.y].join(" "),
      "innerArcStart": innerArcStart,
      "innerArcEnd": innerArcEnd,
      "center": new Point(cx, cy),
      "rMaxX": rMaxX,
      "rMaxY": rMaxY,
      "startAngle": startAngle,
      "endAngle": endAngle
    };
    return path;
  }

  onMouseDown(e) {
    e.stopPropagation();
    e.preventDefault(); 
    this.props.parentCtx.mouseDownPos = { x: e.clientX || (e.touches ? e.touches[0] : {}).clientX, y: e.clientY || (e.touches ? e.touches[0] : {}).clientY };
    this.props.parentCtx.mouseDown = true;
    this.props.parentCtx.mouseDrag = false; 
  }

  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault(); 
    if(!this.props.parentCtx.mouseDrag) {
      this.toggleSlide(); 
    }
    this.props.parentCtx.mouseDown = false;
    this.props.parentCtx.mouseDrag = false;
  }

  onMouseMove(e) {
    e.preventDefault();
    e.stopPropagation();
    if(this.props.parentCtx.mouseDown) {
      this.props.parentCtx.mouseDrag = true;
      if(UtilCore.isTouchDevice){
        let changedTouch = e.changedTouches[0];
        let elem = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
        elem.dispatchEvent(new TouchEvent('mousemove', e)); 
      }
    } else {
      /** for tooltip only  */
      let mousePos = UiCore.cursorPoint(this.props.rootNodeId, e);
      this.props.updateTip(mousePos, this.props.data);
    }
  }

  onMouseEnter(e) {
    this.ref.node.querySelector(`.slice-hover-${this.props.index}`).style['fill-opacity'] = 0.4; 
  }

  onMouseLeave(e) {
    this.ref.node.querySelector(`.slice-hover-${this.props.index}`).style['fill-opacity'] = 0;
    this.props.hideTip(); 
  }

  onKeyUp(e) {
    if(e.keyCode == 32 || e.keyCode == 13) {
      this.onMouseDown(e); 
      this.onMouseUp(e);
    }
  }

  rotateSlice(rotationIndex) {
    this.slicedOut = false; 
    this.state.startAngle = this.state.startAngle + rotationIndex; 
    this.state.endAngle = this.state.endAngle + rotationIndex;
    let mid = ((this.state.startAngle + this.state.endAngle) / 2) % 360;
    this.midAngle = (mid < 0 ? 360 + mid : mid);
    
    this.state.legendPath = this.getLegendPath(); 
    this.state.arcTransform = this.state.colorTransform = this.state.textTransform = ''; 
    let textStartPoint = this.getTextStartPoint(); 
    let colorStartPoint = this.getColorLegendStartPoint(); 
    let upperArc = this.ref.node.querySelector(`.upper-arc-slice-${this.props.index}`);
    let upperArcGrad = this.ref.node.querySelector(`.gradient-arc-slice-${this.props.index}`);
    let colorLegend = this.ref.node.querySelector(`.color-legend-${this.props.index}`); 
    let textSlice = this.ref.node.querySelector(`.txt-slice-${this.props.index}`);
    let sliceHover = this.ref.node.querySelector(`.slice-hover-${this.props.index}`); 
    let legendPath = this.ref.node.querySelector(`.path-to-legend-${this.props.index}`);

    upperArc.setAttribute('d', this.getArcPath());
    upperArc.setAttribute('transform', this.state.arcTransform); 
    upperArcGrad.setAttribute('d', this.getArcPath());
    upperArcGrad.setAttribute('transform', this.state.arcTransform); 
    sliceHover.setAttribute('d', this.getArcPath(this.props.width + 10, this.props.height + 10));
    sliceHover.setAttribute('transform', this.state.arcTransform); 

    if(legendPath) {
      legendPath.setAttribute('d', this.state.legendPath);
    }
    
    if(colorLegend){
      colorLegend.setAttribute('x', colorStartPoint.x);
      colorLegend.setAttribute('y', colorStartPoint.y);
      colorLegend.setAttribute('transform', this.state.colorTransform);
    }
    
    if(textSlice) {
      textSlice.setAttribute('x', textStartPoint.x);
      textSlice.setAttribute('y', textStartPoint.y);
      textSlice.setAttribute('text-anchor', this.getTextAnchor());
      textSlice.parentNode.setAttribute('transform',this.state.textTransform);
    }
  }
}

export default Slice; 