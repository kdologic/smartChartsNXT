'use strict';

import defaultConfig from './../settings/config';
import { Component } from './../viewEngin/pview';
import eventEmitter from './../core/eventEmitter';
import utilCore from './../core/util.core';
import uiCore from './../core/ui.core';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';

/**
 * grid.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a grid for the chart.
 * @extends: Component
 */

class Grid extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.clipId = utilCore.getRandomID();
    this.config = {};
    this.state = {
      vGridCount: this.props.vGridCount,
      vGridInterval: this.props.vGridInterval,
      vLineDashArray: 0,
      hGridCount: this.props.hGridCount,
      hGridInterval: this.props.hGridInterval,
      hLineDashArray: 0,
      zeroBaseGridIndex: undefined
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
        enable: typeof opts.vertical.enable === 'undefined' ? true : opts.vertical.enable,
        lineStyle: opts.vertical.lineStyle || ENUMS.LINE_STYLE.DASHED,
        lineColor: opts.vertical.lineColor || defaultConfig.theme.bgColorMedium,
        lineThickness: typeof opts.vertical.lineThickness === 'undefined' ? 1 : opts.vertical.lineThickness,
        lineOpacity: typeof opts.vertical.lineOpacity === 'undefined' ? 0.2 : opts.vertical.lineOpacity
      },
      horizontal: {
        enable: typeof opts.horizontal.enable === 'undefined' ? true : opts.horizontal.enable,
        lineStyle: opts.horizontal.lineStyle || ENUMS.LINE_STYLE.SOLID,
        lineColor: opts.horizontal.lineColor || defaultConfig.theme.bgColorMedium,
        lineThickness: typeof opts.horizontal.lineThickness === 'undefined' ? 1 : opts.horizontal.lineThickness,
        lineOpacity: typeof opts.horizontal.lineOpacity === 'undefined' ? 0.2 : opts.horizontal.lineOpacity
      },
      bgColor: props.opts.bgColor || 'none',
      bgOpacity: typeof props.opts.bgOpacity === 'undefined' ? 0.1 : props.opts.bgOpacity
    };

    if(this.config.bgColor === 'none') {
      this.state.fillBy = this.config.bgColor;
      this.state.fillType = 'none';
    }else {
      let fillOpt = uiCore.processFillOptions(this.props.opts.fillOptions);
      if(this.state.fillBy === 'none') {
        this.state.fillType = 'solidColor';
        this.state.fillBy = this.config.bgColor;
      }else {
        this.state.fillType = fillOpt.fillType;
        this.state.fillBy = fillOpt.fillBy;
        this.state.fillId = fillOpt.fillId;
      }
    }
    this.state.vLineDashArray = this.config.vertical.lineStyle === ENUMS.LINE_STYLE.DASHED ? 4 : 0;
    this.state.hLineDashArray = this.config.horizontal.lineStyle === ENUMS.LINE_STYLE.DASHED ? 4 : 0;
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
        { this.state.fillType !== 'none' && this.state.fillType !== 'solidColor' &&
          uiCore.generateFillElem(this.state.fillId, this.state.fillType, this.props.opts.fillOptions, this.config.bgColor)
        }
        <rect class='sc-grid-rect' x={0} y={0} width={this.props.width} height={this.props.height} stroke='none' shape-rendering='optimizeSpeed' pointer-events='all' fill={this.state.fillBy} fill-opacity={this.config.bgOpacity} stroke-width='0' />
        <g class='sc-v-grid-lines' transform={`translate(${this.props.vTransformX}, 0)`} clip-path={`url(#${this.clipId})`} >
          <defs>
            <clipPath id={this.clipId}>
              <rect x={-this.props.vTransformX} y={0} width={this.props.width} height={this.props.height} />
            </clipPath>
          </defs>
          {this.config.vertical.enable && this.drawVGridLines()}
        </g>
        <g class='sc-h-grid-lines'>
          {this.config.horizontal.enable && this.drawHGridLines()}
        </g>
      </g>
    );
  }

  drawVGridLines() {
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.vGridCount; gridCount++) {
      grids.push(
        <line instanceId={`vline-${gridCount}`} class={`sc-v-grid-line-${gridCount}`}
          x1={gridCount * this.state.vGridInterval} y1={0} x2={gridCount * this.state.vGridInterval} y2={this.props.height}
          fill='none' stroke={this.config.vertical.lineColor} stroke-opacity={this.config.vertical.lineOpacity}
          stroke-width={this.config.vertical.lineThickness} shape-rendering='optimizeSpeed' stroke-dasharray={this.state.vLineDashArray}>
        </line>
      );
    }
    return grids;
  }

  drawHGridLines() {
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.hGridCount; gridCount++) {
      grids.push(
        <line instanceId={`hline-${gridCount}`} class={`sc-h-grid-line-${gridCount}`}
          x1={0} y1={gridCount * this.state.hGridInterval} x2={this.props.width} y2={gridCount * this.state.hGridInterval}
          fill='none' stroke={this.config.horizontal.lineColor} stroke-opacity={gridCount == this.state.zeroBaseGridIndex ? 1 : this.config.vertical.lineOpacity}
          stroke-width={this.config.horizontal.lineThickness} shape-rendering='optimizeSpeed' stroke-dasharray={this.state.hLineDashArray}>
        </line>
      );
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