/**
 * grid.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a grid for the chart. 
 */

"use strict";

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";

class Grid extends Component{
  constructor(props) {
      super(props);
  }
  
  render() {
    return (
      <g class='chart-grid' transform={`translate(${this.props.posX},${this.props.posY})`} >
        {this.drawGridLines()}
        <rect class='grid-rect' x={0} y={0} width={this.props.width} height={this.props.height} stroke={defaultConfig.theme.bgColorMedium}  shape-rendering='optimizeSpeed' pointer-events='all' fill='none' stroke-width='0' />
        <line class='grid-box-left-border' x1={0} y1={0} x2={0} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
        <line class='grid-box-bottom-border' x1={0} y1={this.props.height} x2={this.props.width} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
      </g>
    );
  }

  drawGridLines(){
    let grids = []; 
    for (let gridCount = 0; gridCount < this.props.gridCount - 1; gridCount++) {
      grids.push(<line class={`grid-line-${gridCount}`} x1={0} y1={gridCount * this.props.gridHeight} x2={this.props.width} y2={gridCount * this.props.gridHeight} fill='none' stroke='#ddd' stroke-width='1' stroke-opacity='1' shape-rendering='optimizeSpeed'/>);
    }
    return grids;
  }

}

export default Grid;