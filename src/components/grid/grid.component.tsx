'use strict';

import defaultConfig from '../../settings/config';
import { Component } from '../../viewEngin/pview';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import UtilCore from '../../core/util.core';
import UiCore from '../../core/ui.core';
import { AXIS_TYPE, FILL_TYPE, LINE_STYLE } from '../../global/global.enums';
import { IGridProps, IUpdateHorizontalGridEvent, IUpdateVerticalGridEvent } from './grid.model';
import { IGridConfig } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';

/**
 * grid.component.tsx
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a grid for the chart.
 * @extends: Component
 */

class Grid extends Component<IGridProps> {
  private emitter: CustomEvents;
  private clipId: string;
  private rFillId: string;
  private config: IGridConfig;

  constructor(props: IGridProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.clipId = UtilCore.getRandomID();
    this.rFillId = UtilCore.getRandomID();
    this.config = {};
    this.state = {
      vGridCount: this.props.vGridCount,
      vGridInterval: this.props.vGridInterval,
      vGridValues: [],
      vLineDashArray: 0,
      hGridCount: this.props.hGridCount,
      hGridInterval: this.props.hGridInterval,
      hLineDashArray: 0,
      zeroBaseGridIndex: undefined
    };
    this.setConfig(props);
    this.updateVerticalGrid = this.updateVerticalGrid.bind(this);
    this.updateHorizontalGrid = this.updateHorizontalGrid.bind(this);
    this.emitter.on('onPrepareCategories', this.updateVerticalGrid);
    this.emitter.on('onVerticalLabelsRender', this.updateHorizontalGrid);
  }

  setConfig(props: IGridProps): void {
    const opts = {
      vertical: (props.opts || {}).vertical || {},
      horizontal: (props.opts || {}).horizontal || {}
    };
    this.config = {
      vertical: {
        enable: typeof opts.vertical.enable === 'undefined' ? true : opts.vertical.enable,
        lineStyle: opts.vertical.lineStyle || LINE_STYLE.DASHED,
        lineColor: opts.vertical.lineColor || defaultConfig.theme.bgColorDark,
        lineThickness: typeof opts.vertical.lineThickness === 'undefined' ? 0.5 : opts.vertical.lineThickness,
        lineOpacity: typeof opts.vertical.lineOpacity === 'undefined' ? 0.5 : opts.vertical.lineOpacity
      },
      horizontal: {
        enable: typeof opts.horizontal.enable === 'undefined' ? true : opts.horizontal.enable,
        lineStyle: opts.horizontal.lineStyle || LINE_STYLE.SOLID,
        lineColor: opts.horizontal.lineColor || defaultConfig.theme.bgColorDark,
        lineThickness: typeof opts.horizontal.lineThickness === 'undefined' ? 0.5 : opts.horizontal.lineThickness,
        lineOpacity: typeof opts.horizontal.lineOpacity === 'undefined' ? 0.5 : opts.horizontal.lineOpacity
      },
      bgColor: props.opts.bgColor || 'none',
      bgOpacity: typeof props.opts.bgOpacity === 'undefined' ? 0.1 : props.opts.bgOpacity
    };

    if (this.config.bgColor === 'none') {
      this.state.fillBy = this.config.bgColor;
      this.state.fillType = FILL_TYPE.NONE;
    } else {
      let fillOpt = UiCore.processFillOptions(this.props.opts.fillOptions, this.rFillId);
      if (fillOpt.fillBy === FILL_TYPE.NONE) {
        this.state.fillType = FILL_TYPE.SOLID_COLOR;
        this.state.fillBy = this.config.bgColor;
      } else {
        this.state.fillType = fillOpt.fillType;
        this.state.fillBy = fillOpt.fillBy;
        this.state.fillId = fillOpt.fillId;
      }
    }
    this.state.vLineDashArray = this.config.vertical.lineStyle === LINE_STYLE.DASHED ? 4 : 0;
    this.state.hLineDashArray = this.config.horizontal.lineStyle === LINE_STYLE.DASHED ? 4 : 0;
  }

  beforeUpdate(nextProps: IGridProps): void {
    this.setConfig(nextProps);
  }

  beforeUnmount() {
    this.emitter.removeListener('onPrepareCategories', this.updateVerticalGrid);
    this.emitter.removeListener('onVerticalLabelsRender', this.updateHorizontalGrid);
  }

  render() {
    return (
      <g class='sc-chart-grid' transform={`translate(${this.props.posX},${this.props.posY})`} >
        {this.state.fillType !== FILL_TYPE.NONE && this.state.fillType !== FILL_TYPE.SOLID_COLOR &&
          UiCore.generateFillElem(this.state.fillId, this.state.fillType, this.props.opts.fillOptions, this.config.bgColor)
        }
        <rect class='sc-grid-rect' x={0} y={0} width={this.props.width} height={this.props.height} stroke='none' shape-rendering='crispedges' pointer-events='all' fill={this.state.fillBy} fill-opacity={this.config.bgOpacity} stroke-width='0' />
        <g class='sc-v-grid-lines' transform={`translate(${this.props.vTransformX}, 0)`} clip-path={`url(#${this.clipId})`} >
          <defs>
            <clipPath id={this.clipId}>
              <rect x={-this.props.vTransformX} y={0} width={this.props.width} height={this.props.height} />
            </clipPath>
          </defs>
          {this.config.vertical.enable && this.drawVGridLines()}
        </g>
        <g class='sc-h-grid-lines' transform={`translate(0, ${this.props.height - (this.props.yAxisType === AXIS_TYPE.LOGARITHMIC ? 0 : (this.state.hGridInterval || 0))})`}>
          {this.config.horizontal.enable && this.drawHGridLines()}
        </g>
      </g>
    );
  }

  drawVGridLines() {
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.vGridCount; gridCount++) {
      let xPos = this.state.vGridInterval(gridCount, this.state.vGridValues[gridCount]);
      grids.push(
        <line instanceId={`vline-${gridCount}`} class={`sc-v-grid-line-${gridCount}`}
          x1={xPos} y1={0} x2={xPos} y2={this.props.height}
          fill='none' stroke={this.config.vertical.lineColor} stroke-opacity={this.config.vertical.lineOpacity}
          stroke-width={this.config.vertical.lineThickness} shape-rendering='crispedges' stroke-dasharray={this.state.vLineDashArray}>
        </line>
      );
    }
    return grids;
  }

  drawHGridLines() {
    let grids = [];
    for (let gridCount = 0; gridCount < this.state.hGridCount; gridCount++) {
      grids.push(
        <line instanceId={`hline-${gridCount}`} class={`sc-h-grid-line sc-h-grid-line-${gridCount}`}
          transform={`translate(0, ${-(gridCount * this.state.hGridInterval)})`} x1={0} y1={0} x2={this.props.width} y2={0}
          fill='none' stroke={this.config.horizontal.lineColor} stroke-opacity={gridCount == this.state.zeroBaseGridIndex ? 1 : this.config.vertical.lineOpacity}
          stroke-width={this.config.horizontal.lineThickness} shape-rendering='crispedges' stroke-dasharray={this.state.hLineDashArray}>
        </line>
      );
      if (this.props.yAxisType === AXIS_TYPE.LOGARITHMIC) {
        for (let subGridCount = 2; subGridCount < 10; subGridCount++) {
          grids.push(
            <line instanceId={`hline-${gridCount}-${subGridCount}`} class={`sc-h-grid-line sc-h-grid-line-${gridCount}-${subGridCount}`}
              transform={`translate(0, ${-((gridCount + (1 - Math.log10(subGridCount))) * this.state.hGridInterval)})`} x1={0} y1={0} x2={this.props.width} y2={0}
              fill='none' stroke={this.config.horizontal.lineColor} stroke-opacity={gridCount == this.state.zeroBaseGridIndex ? 1 : 0.08}
              stroke-width={this.config.horizontal.lineThickness} shape-rendering='crispedges' stroke-dasharray={this.state.hLineDashArray}>
            </line>
          );
        }
      }
    }
    return grids;
  }

  updateVerticalGrid(vg: IUpdateVerticalGridEvent) {
    this.setState({
      vGridCount: vg.count,
      vGridInterval: vg.intervalLen,
      vGridValues: vg.values
    });
  }

  updateHorizontalGrid(hg: IUpdateHorizontalGridEvent) {
    if (hg.isPrimary) {
      this.setState({
        hGridCount: hg.count,
        hGridInterval: hg.intervalLen,
        zeroBaseGridIndex: hg.zeroBaseIndex
      });
    }
  }
}

export default Grid;