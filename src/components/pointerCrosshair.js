"use strict";

import { Component } from "./../viewEngin/pview";
import eventEmitter from './../../core/eventEmitter';

/**
 * pointerCrosshair.js
 * @version:2.0.0
 * @createdOn:21-Apr-2018
 * @author:SmartChartsNXT
 * @description: This components will create a vertical and horizontal cross line to follow the pointer or touch location. 
 * @extends Component
 */

class PointerCrosshair extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      vx1: 200,
      vy1: 500,
      vx2: 200,
      vy2: 600,
      hx1: 0,
      hy1: 0,
      hx2: 0,
      hy2: 0
    }; 
    this.setVCrosshairBind = this.setVCrosshair.bind(this); 
    this.setHCrosshairBind = this.setHCrosshair.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
    this.emitter.on('setVerticalCrosshair', this.setVCrosshairBind);
    this.emitter.on('setHorizontalCrosshair', this.setHCrosshairBind);
  }

  componentWillUnmount() {
    this.emitter.removeListener('setVerticalCrosshair', this.setVCrosshairBind);
    this.emitter.removeListener('setHorizontalCrosshair', this.setHCrosshairBind);
  }

  render() {
    return (
      <g class='sc-pointer-crosshair'>
        <line class='sc-h-crosshair' x1={this.state.hx1} y1={this.state.hy1} x2={this.state.hx2} y2={this.state.hy2} fill='none' stroke="#000" stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/> 
        <line class='sc-v-crosshair' x1={this.state.vx1} y1={this.state.vy1} x2={this.state.vx2} y2={this.state.vy2} fill='none' stroke="#000" stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/> 
      </g>
    );
  }

  setVCrosshair(e) {

  }

  setHCrosshair(e) {

  }

}
export default PointerCrosshair; 