'use strict';

import defaultConfig from './../settings/config';
import { Component } from './../viewEngin/pview';
import eventEmitter from './../core/eventEmitter';
import UtilCore from './../core/util.core';
import {OPTIONS_TYPE as ENUMS} from './../settings/globalEnums';

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
    this.gradId = UtilCore.getRandomID();
    this.config = {};
    this.state = {
      vGridCount: this.props.vGridCount,
      vGridInterval: this.props.vGridInterval,
      vLineDashArray: 0,
      hGridCount: this.props.hGridCount,
      hGridInterval: this.props.hGridInterval,
      hLineDashArray: 0,
      zeroBaseGridIndex: undefined,
      showBgGradient: false
    };
    this.setConfig(this.props);
    this.updateVerticalGrid = this.updateVerticalGrid.bind(this);
    this.updateHorizontalGrid = this.updateHorizontalGrid.bind(this);
    this.emitter.on('onHorizontalLabelsRender', this.updateVerticalGrid);
    this.emitter.on('onVerticalLabelsRender', this.updateHorizontalGrid);
  }

  setConfig(props) {
    const opts = {
      vertical: (props.opts || {}).vertical || {},
      horizontal: (props.opts || {}).horizontal || {}
    };
    this.config = {
      vertical: {
        enable: opts.vertical.enable === 'undefined' ? true : opts.vertical.enable,
        lineStyle: opts.vertical.lineStyle || ENUMS.LINE_STYLE.DASHED,
        lineColor: opts.vertical.lineColor || defaultConfig.theme.bgColorMedium,
        lineThickness: opts.vertical.lineThickness || 1,
        lineOpacity: opts.vertical.lineOpacity || 0.2
      },
      horizontal: {
        enable: opts.horizontal.enable === 'undefined' ? true : opts.horizontal.enable,
        lineStyle: opts.horizontal.lineStyle || ENUMS.LINE_STYLE.SOLID,
        lineColor: opts.horizontal.lineColor || defaultConfig.theme.bgColorMedium,
        lineThickness: opts.horizontal.lineThickness || 1,
        lineOpacity: opts.horizontal.lineOpacity || 0.2
      },
      bgColor: props.opts.bgColor || 'none',
      bgGradient: props.opts.bgGradient || 'none',
      bgOpacity: props.opts.bgOpacity || 0.1
    };
    this.state.vLineDashArray = this.config.vertical.lineStyle === ENUMS.LINE_STYLE.DASHED ? 4 : 0;
    this.state.hLineDashArray = this.config.horizontal.lineStyle === ENUMS.LINE_STYLE.DASHED ? 4 : 0;
    this.state.showBgGradient = this.config.bgColor !== 'none' && this.config.bgGradient !== 'none';
  }

  componentWillUpdate(nextProps) {
    this.setConfig(nextProps);
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
          {this.config.bgColor !== 'none' && this.config.bgGradient !== 'none' &&
            this.createGradient(this.gradId, this.config.bgGradient, this.config.bgColor)
          }
          {this.config.vertical.enable && this.drawVGridLines()}
        </g>
        <g class='sc-h-grid-lines'>
          {this.config.horizontal.enable && this.drawHGridLines()}
        </g>
        <rect class='sc-grid-rect' x={0} y={0} width={this.props.width} height={this.props.height} stroke='none'  shape-rendering='optimizeSpeed' pointer-events='all' fill={this.state.showBgGradient ? `url(#${this.gradId})` : this.config.bgColor} fill-opacity={this.config.bgOpacity} stroke-width='0' />
        <line class='sc-grid-box-left-border' x1={0} y1={0} x2={0} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
        <line class='sc-grid-box-bottom-border' x1={0} y1={this.props.height} x2={this.props.width} y2={this.props.height} fill='none' stroke={defaultConfig.theme.bgColorDark} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed'/>
      </g>
    );
  }

  drawVGridLines(){
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.vGridCount; gridCount++) {
      grids.push(<line class={`sc-v-grid-line-${gridCount}`} x1={gridCount * this.state.vGridInterval} y1={0} x2={gridCount * this.state.vGridInterval} y2={this.props.height} fill='none' stroke={this.config.vertical.lineColor} stroke-opacity={this.config.vertical.lineOpacity} stroke-width={this.config.vertical.lineThickness} shape-rendering='optimizeSpeed' stroke-dasharray={this.state.vLineDashArray} />);
    }
    return grids;
  }

  drawHGridLines(){
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.hGridCount; gridCount++) {
      grids.push(<line class={`sc-h-grid-line-${gridCount}`} x1={0} y1={gridCount * this.state.hGridInterval} x2={this.props.width} y2={gridCount * this.state.hGridInterval} fill='none' stroke={this.config.horizontal.lineColor} stroke-opacity={gridCount == this.state.zeroBaseGridIndex ? 1 : this.config.vertical.lineOpacity} stroke-width={this.config.horizontal.lineThickness} shape-rendering='optimizeSpeed' stroke-dasharray={this.state.hLineDashArray} />);
    }
    return grids;
  }

  createGradient(gardId, gradType, color) {
    let gradHtml = '';
    switch(gradType) {
      case ENUMS.GRADIENT_STYLE.LINEAR_VERTICAL:
        gradHtml =
        (<defs>
          <linearGradient id={gardId} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={color} stop-opacity="1" />
          </linearGradient>
        </defs>);
        break;
      case ENUMS.GRADIENT_STYLE.LINEAR_HORIZONTAL:
        gradHtml =
        (<defs>
          <linearGradient id={gardId} x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color={color} stop-opacity="1" />
            <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
          </linearGradient>
        </defs>);
        break;
      case ENUMS.GRADIENT_STYLE.RADIAL:
        gradHtml = (<defs>
          <radialGradient id={gardId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%" gradientUnits="objectBoundingBox">
            <stop offset="0%" stop-color="rgb(255,255,255)" stop-opacity="0" />
            <stop offset="100%" stop-color={color} stop-opacity="1" />
          </radialGradient>
        </defs>);
        break;
    }
    return gradHtml;
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