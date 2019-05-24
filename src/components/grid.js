"use strict";

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";
import eventEmitter from './../core/eventEmitter';
import UtilCore from './../core/util.core';

/**
 * grid.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a grid for the chart. 
 * @extends: Component
 */

class Grid extends Component{
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.clipId = UtilCore.getRandomID();
    this.state = {
      vGridCount: this.props.vGridCount,
      vGridInterval: this.props.vGridInterval,
      hGridCount: this.props.hGridCount,
      hGridInterval: this.props.hGridInterval,
      zeroBaseGridIndex: undefined
    };
    this.updateVerticalGrid = this.updateVerticalGrid.bind(this);
    this.updateHorizontalGrid = this.updateHorizontalGrid.bind(this);
    this.emitter.on('onHorizontalLabelsRender', this.updateVerticalGrid);
    this.emitter.on('onVerticalLabelsRender', this.updateHorizontalGrid); 
  }

  componentWillUnmount() {
    this.emitter.removeListener('onHorizontalLabelsRender', this.updateVerticalGrid);
    this.emitter.removeListener('onVerticalLabelsRender', this.updateHorizontalGrid);
  }
  
  render() {
    return (
      <g class='sc-chart-grid' transform={`translate(${this.props.posX},${this.props.posY})`} >
        <g class='sc-v-grid-lines' transform={`translate(${this.props.vTransformX}, 0)`} clip-path={`url(#${this.clipId})`} >
          <defs>
            <clipPath id={this.clipId}>
              <rect x={-this.props.vTransformX} y={0} width={this.props.width} height={this.props.height} />
            </clipPath>
          </defs>
          {this.drawVGridLines()}
        </g>
        <g class='sc-h-grid-lines'>
          {this.drawHGridLines()}
        </g>
        <rect class='grid-rect' x={0} y={0} width={this.props.width} height={this.props.height} stroke={defaultConfig.theme.bgColorMedium}  shape-rendering='optimizeSpeed' pointer-events='all' fill='none' stroke-width='0' />
        <line class='grid-box-left-border' x1={0} y1={0} x2={0} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
        <line class='grid-box-bottom-border' x1={0} y1={this.props.height} x2={this.props.width} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
      </g>
    );
  }

  drawVGridLines(){
    let grids = []; 
    for (let gridCount = 0; gridCount < this.state.vGridCount; gridCount++) {
      grids.push(<line class={`sc-v-grid-line-${gridCount}`} x1={gridCount * this.state.vGridInterval} y1={0} x2={gridCount * this.state.vGridInterval} y2={this.props.height} fill='none' stroke='#555' stroke-opacity="0.1" stroke-width='1' shape-rendering='optimizeSpeed'/>);
    }
    return grids;
  }

  drawHGridLines(){
    let grids = []; 
    for (let gridCount = 0; gridCount < this.state.hGridCount; gridCount++) {
      grids.push(<line class={`sc-h-grid-line-${gridCount}`} x1={0} y1={gridCount * this.state.hGridInterval} x2={this.props.width} y2={gridCount * this.state.hGridInterval} fill='none' stroke='#555' stroke-opacity={gridCount == this.state.zeroBaseGridIndex ? 0.4 : 0.1} stroke-width='1' shape-rendering='optimizeSpeed'/>);
    }
    return grids;
  }

  updateVerticalGrid(vg) {
    this.setState({
      vGridCount: vg.count,
      vGridInterval: vg.intervalLen
    });
  }

  updateHorizontalGrid(hg) {
    this.setState({
      hGridCount: hg.count,
      hGridInterval: hg.intervalLen,
      zeroBaseGridIndex: hg.zeroBaseIndex
    });
  }

}

export default Grid;