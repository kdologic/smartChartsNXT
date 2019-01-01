"use strict";

import Point from "./../core/point";
import UtilCore from './../core/util.core';
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import Watermark from './../components/watermark'; 
import Menu from './../components/menu'; 

/**
 * baseChart.js
 * @createdOn: 10-May-2017
 * @author: SmartChartsNXT
 * @version: 2.0.0
 * @description:This is base chart with defaulf config and this will initiate loading of a specific chart type. 
 */

/** ------- Requireing all chart types ------- */
const CHART_MODULES = {
    AreaChart: {
      config: require("./../charts/areaChart/config").default,
      chart: require("./../charts/areaChart/areaChart").default
    },
    // LineChart: require("./../charts/lineChart/lineChart"),
    // StepChart: require("./../charts/stepChart/stepChart"),
    PieChart: {
      config: require("./../charts/pieChart/config").default,
      chart: require("./../charts/pieChart/pieChart").default
    },
    DonutChart: {
      config: require("./../charts/donutChart/config").default,
      chart: require("./../charts/donutChart/donutChart").default
    }
    // ColumnChart: require("./../charts/columnChart/columnChart")
};

/* ------------- Require pulgIns --------------*/
//let animator = require("./../plugIns/animator");

class BaseChart extends Component {
  constructor(props) {
    try {
      super(props); 
      // this.plugins = {
      //   animator: animator
      // };
      this.chartType = this.props.opts.type;
      this.CHART_OPTIONS = UtilCore.extends(this.props.opts, { width: 1, height: 1});
      this.CHART_DATA = {scaleX: 0, scaleY: 0};
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600
      };
       
      this.state = {
        width: this.props.width || this.CHART_CONST.FIX_WIDTH, 
        height: this.props.height || this.CHART_CONST.FIX_HEIGHT
      }; 
      this.loadConfig(CHART_MODULES[this.chartType].config.call(this)); 
      this.initCanvasSize(this.state.width, this.state.height); 
    } catch (ex) {
      ex.errorIn = `Error in ${props.opts.type} base constructor : ${ex.message}`;
      throw ex;
    }
  }

  passContext() {
    return {
      runId: this.props.runId,
      chartType: this.chartType, 
      rootSvgId: this.getChartId(),
      rootContainerId: this.CHART_OPTIONS.targetElem, 
      svgWidth: this.CHART_DATA.svgWidth,
      svgHeight: this.CHART_DATA.svgHeight,
      svgCenter: this.CHART_DATA.svgCenter
    };
  }

  loadConfig(config) {
    for (let key in config) {
      try {
        this.CHART_DATA[key] = config[key];
      } catch (ex) { throw ex; }
    }
  }
  
  render() {
    this.initCanvasSize(this.state.width, this.state.height); 
    let Chart = CHART_MODULES[this.chartType].chart;
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        version={1.1}
        width={this.CHART_OPTIONS.width}
        height={this.CHART_OPTIONS.height}
        id={this.getChartId()}
        style={{
          background: this.CHART_OPTIONS.bgColor || 'none',
          MozTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitUserSelect: 'none',
          HtmlUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          OUserSelect: 'none',
          UserSelect: 'none'
        }} >

        {this.CHART_OPTIONS.canvasBorder &&
        <g>
          <rect x='1' y='1' class="sc-canvas-border" vector-effect='non-scaling-stroke'
            width={this.CHART_OPTIONS.width - 1}
            height={this.CHART_OPTIONS.height - 1}
            shape-rendering='optimizeSpeed'
            fill-opacity='0.001'
            style={{ fill: defaultConfig.theme.bgColorLight, strokeWidth: 1, stroke: defaultConfig.theme.fontColorMedium }}
          />
        </g>}

        {this.CHART_OPTIONS.watermark !== false && 
          <Watermark svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} posX={10} posY={12} link="http://www.smartcharts.cf">Powered by SmartChartsNXT</Watermark>
        }
        
        <g id={`${this.getChartId()}_cont`} >
          <Chart chartOptions={this.CHART_OPTIONS} chartData={this.CHART_DATA} chartConst={this.CHART_CONST} ></Chart>
        </g>

        {this.CHART_OPTIONS.showMenu !== false &&
          <Menu x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} targetNode={`#${this.getChartId()}_cont`}></Menu>
        }
      </svg>
     );
  }

  getRunId() {
    return this.props.runId;
  }

  initCanvasSize(width, height, minWidth = this.CHART_DATA.minWidth, minHeight = this.CHART_DATA.minHeight) {
    this.CHART_DATA.svgWidth = this.CHART_OPTIONS.width = UtilCore.clamp(minWidth, Math.max(minWidth, width), width);
    this.CHART_DATA.svgHeight = this.CHART_OPTIONS.height = UtilCore.clamp(minHeight, Math.max(minHeight, height), height);
    this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));
  }

  getChartId() {
    return `${this.chartType}_${this.getRunId()}`; 
  }
  
}

export default BaseChart;