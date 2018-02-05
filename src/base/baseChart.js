/**
 * baseChart.js
 * @createdOn: 10-May-2017
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:This class will be the parent class of all charts.
 */

"use strict";

//let EventCore = require("./../core/event.core");
//let Event = require("./../core/event");

import Geom from './../core/geom.core'; 
import Point from "./../core/point";
import UtilCore from './../core/util.core';
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import Watermark from './../components/watermark'; 
import Menu from './../components/menu'; 

/** ------- Requireing all chart types ------- */
const CHART_MODULES = {
    //AreaChart: require("./../charts/areaChart/areaChart")
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
      let opts = this.props.opts; 
      // this.event = new EventCore();
      // this.plugins = {
      //   animator: animator
      // };
      this.chartType = this.props.opts.type;
      this.CHART_OPTIONS = UtilCore.extends(opts, { width: 1, height: 1});
      this.CHART_DATA = {scaleX: 0, scaleY: 0};
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600
      };
      this.runId = this.props.runid; 
      this.timeOut = null;
      this.loadConfig(CHART_MODULES[this.chartType].config.call(this)); 
      this.initCanvasSize(this.props.width || this.CHART_CONST.FIX_WIDTH, this.props.height || this.CHART_CONST.FIX_HEIGHT); 
    } catch (ex) {
      ex.errorIn = `Error in ${props.opts.type} base constructor : ${ex.message}`;
      throw ex;
    }
  }

  loadConfig(config) {
    for (let key in config) {
      try {
        this.CHART_DATA[key] = eval(config[key]);
      } catch (ex) { throw ex; }
    }
  }

  initBase() {

    // if (this.CHART_OPTIONS.events && typeof this.CHART_OPTIONS.events === "object") {
    //   for (let e in this.CHART_OPTIONS.events) {
    //     this.event.off(e, this.CHART_OPTIONS.events[e]);
    //     this.event.on(e, this.CHART_OPTIONS.events[e]);
    //   }
    // }

    //fire Event onInit
    // let onInitEvent = new Event("onInit", {
    //   srcElement: this
    // });
    // this.event.dispatchEvent(onInitEvent);

    
    // setTimeout(function () {
    //   self.ui.appendMenu2(self.CHART_OPTIONS.targetElem, self.CHART_DATA.svgCenter, null, null, self);
    //   self.ui.appendWaterMark(self.CHART_OPTIONS.targetElem, self.CHART_DATA.scaleX, self.CHART_DATA.scaleY);
    // }, 100);

  } /* End of Init() */
  
  
  render() {
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

        { this.CHART_OPTIONS.canvasBorder ? 
        <g>
          <rect x='0' y='0' vector-effect='non-scaling-stroke'
            width={this.CHART_OPTIONS.width - 1}
            height={this.CHART_OPTIONS.height - 1}
            shape-rendering='optimizeSpeed'
            fill-opacity='0.001'
            style={{ fill: defaultConfig.theme.bgColorLight, strokWidth: 1, stroke: defaultConfig.theme.fontColorMedium }}
          />
        </g> : null}

        {this.CHART_OPTIONS.watermark !== false && <Watermark svgWidth={this.CHART_DATA.svgWidth}></Watermark>}
        
        <g id={`${this.getChartId()}_cont`} >
          <Chart runId={this.runId} chartOptions={this.CHART_OPTIONS} 
            chartData={this.CHART_DATA} chartConst={this.CHART_CONST} 
          /> 
        </g>
        {this.CHART_OPTIONS.showMenu !== false &&
          <Menu x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} targetNode={`#${this.getChartId()}_cont`}></Menu>
        }
      </svg>
     );
  }


  // render() {
  //   //fire event afterRender
  //   let aftrRenderEvent = new Event("afterRender", {
  //     srcElement: this
  //   });
  //   this.event.dispatchEvent(aftrRenderEvent);
  // }

  getRunId() {
    return this.runId;
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