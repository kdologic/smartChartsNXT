"use strict";

import { Component } from "./../viewEngin/pview";

/**
 * tick.js
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create a tick mark for the chart. 
 */

class Ticks extends Component{
  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <g class='sc-tick-mark' transform={`translate(${this.props.posX},${this.props.posY})`} >
        {this.props.type === 'vertical' ? this.drawTickLinesVertical() : this.drawTickLinesHorizontal() }
      </g>
    );
  }

  drawTickLinesVertical() {
    let ticks = []; 
    for (let tickCount = 0; tickCount < this.props.tickCount; tickCount++) {
      ticks.push(<line instanceId={`tick-${tickCount}`} class={`sc-tick-line-${tickCount}`} 
        x1={0} y1={this.props.tickCount === 1 ? this.props.tickInterval : tickCount * this.props.tickInterval}
        x2={this.props.span} y2={this.props.tickCount === 1 ? this.props.tickInterval : tickCount * this.props.tickInterval} fill='none' stroke={this.props.color || "#000"} 
        stroke-width='1' stroke-opacity={this.props.opacity} stroke={this.props.stroke} shape-rendering='optimizeSpeed'/>);
    }
    return ticks;
  }

  drawTickLinesHorizontal() {
    let ticks = []; 
    for (let tickCount = 0; tickCount < this.props.tickCount; tickCount++) {
      ticks.push(<line instanceId={`tick-${tickCount}`} class={`sc-tick-line-${tickCount}`} 
        x1={this.props.tickCount === 1 ? this.props.tickInterval : tickCount * this.props.tickInterval} y1={this.props.span} 
        x2={this.props.tickCount === 1 ? this.props.tickInterval : tickCount * this.props.tickInterval} y2={0} fill='none' stroke={this.props.color || "#000"} 
        stroke-width='1' stroke-opacity={this.props.opacity} stroke={this.props.stroke} shape-rendering='optimizeSpeed'/>);
    }
    return ticks;
  }

}

export default Ticks;