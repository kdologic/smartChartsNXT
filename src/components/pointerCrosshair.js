"use strict";

import { Component } from "./../viewEngin/pview";
import eventEmitter from './../core/eventEmitter';

/**
 * pointerCrosshair.js
 * @createdOn:21-Apr-2018
 * @author:SmartChartsNXT
 * @description: This components will create a vertical and horizontal cross line to follow the pointer or touch location. 
 * @extends Component
 * 
 * @config 
 * "pointerCrosshair": {
      "vertical": {
        "style": "dashed",  //[dashed | solid]
        "spread" : "full",  //[full | inPoint | none]
        "color" : "#000",
        "lineWidth": '1',
        "opacity": '1'
      },
      "horizontal": {
        "style": "dashed",  //[dashed | solid]
        "spread" : "full",  //[full | inPoint | none]
        "color" : "#000",
        "lineWidth": '1',
        "opacity": '1'
      }
    }
 */

class PointerCrosshair extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      vx1: 0,
      vy1: 0,
      vx2: 0,
      vy2: 0,
      hx1: 0,
      hy1: 0,
      hx2: 0,
      hy2: 0
    }; 
    this.config = {vertical: {}, horizontal:{}}; 
    this.setConfig(this.props.opts); 
    this.setVCrosshairBind = this.setVCrosshair.bind(this); 
    this.setHCrosshairBind = this.setHCrosshair.bind(this);
  }

  setConfig(opts) {
    ["vertical", "horizontal"].map(type => {
      this.config[type] = {...this.config[type], ...{
        color: (opts[type] || {}).color || '#000',
        spread: ((opts[type] || {}).spread || (type === 'vertical' ? 'full' : 'none')).toLocaleLowerCase(),
        style: ((opts[type] || {}).style || 'dashed').toLocaleLowerCase(),
        strokeWidth: Number((opts[type] || {}).lineWidth) || 1,
        opacity: Number((opts[type] || {}).opacity) || 1, 
        dashArray: ((opts[type] || {}).style || 'dashed').toLocaleLowerCase() === "dashed" ? 3 : 0
      }};
    });
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

  propsWillReceive(nextProps) {
    this.setConfig(nextProps.opts); 
  }

  render() {
    return (
      <g class='sc-pointer-crosshair'>
        {this.config.horizontal.spread !== 'none' && 
          <line class='sc-h-crosshair' x1={this.state.hx1} y1={this.state.hy1} x2={this.state.hx2} y2={this.state.hy2} 
            fill='none' stroke={this.config.horizontal.color} stroke-width={this.config.horizontal.strokeWidth} opacity={this.config.horizontal.opacity} stroke-dasharray={this.config.horizontal.dashArray} shape-rendering='optimizeSpeed'/> 
        }
        {this.config.vertical.spread !== 'none' &&
          <line class='sc-v-crosshair' x1={this.state.vx1} y1={this.state.vy1} x2={this.state.vx2} y2={this.state.vy2} 
            fill='none' stroke={this.config.vertical.color} stroke-width={this.config.vertical.strokeWidth} opacity={this.config.vertical.opacity} stroke-dasharray={this.config.vertical.dashArray} shape-rendering='optimizeSpeed'/> 
        }
      </g>
    );
  }

  setVCrosshair(data) {
    if(!data || this.config.vertical.spread === 'none') {
      this.setState({ vx1: 0, vy1: 0, vx2: 0, vy2: 0});
      return; 
    }
    let topY = this.config.vertical.spread === 'full' ? this.props.vLineStart : Math.min(...data.map(d => d.y)); 
    this.setState({
      vx1: data[0].x,
      vy1: topY, 
      vx2: data[0].x,
      vy2: this.props.vLineEnd
    }); 
  }

  setHCrosshair(data) {
    if(!data || this.config.horizontal.spread === 'none') {
      this.setState({ hx1: 0, hy1: 0, hx2: 0, hy2: 0});
      return; 
    }
    let topY = Math.min(...data.map(d => d.y)); 
    
    this.setState({
      hx1: this.props.hLineStart, 
      hy1: topY, 
      hx2: this.config.horizontal.spread === 'full' ? this.props.hLineEnd : data[0].x,
      hy2: topY
    }); 
  }

}
export default PointerCrosshair; 