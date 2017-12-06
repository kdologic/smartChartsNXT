/*
 * BaseChart.js
 * @CreatedOn: 10-May-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:This class will be the parent class of all charts
 */

"use strict";

let UiCore = require("./../core/ui.core");
let EventCore = require("./../core/event.core");
let Event = require("./../core/event");
let transformer = require("./../core/transformer");

import Geom from './../core/geom.core'; 
import Point from "./../core/point";
import UtilCore from './../core/util.core';
import { Component } from "./../viewEngin/pview";

//import Timer from "./../viewEngin/timer"; 
//import Mytitle from "./../viewEngin/mytitle"; 
/** ------- Requireing all chart types ------- */
const CHART_MODULES = {
    //AreaChart: require("./../charts/areaChart/areaChart")
    // LineChart: require("./../charts/lineChart/lineChart"),
    // StepChart: require("./../charts/stepChart/stepChart"),
    PieChart: require("./../charts/pieChart/pieChart")
    // DonutChart: require("./../charts/donutChart/donutChart"),
    // ColumnChart: require("./../charts/columnChart/columnChart")
};

/* ------------- Require pulgIns --------------*/
let animator = require("./../plugIns/animator");

class BaseChart extends Component {
  constructor(props) {
    try {
      super(props); 
      let opts = this.props.opts; 
      // this.geom = new GeomCore();
      // this.event = new EventCore();
      // this.ui = new UiCore();
      this.transformer = transformer;
      this.plugins = {
        animator: animator
      };
      this.chartType = this.props.opts.type;
      this.CHART_OPTIONS = UtilCore.extends(opts, {});
      this.CHART_DATA = {};
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600,
        MIN_WIDTH: 250,
        MIN_HEIGHT: 400
      };
      this.runId = this.props.runid; 
      this.timeOut = null;
      this.initBase(); 
    } catch (ex) {
        ex.errorIn = `Error in ${props.opts.type} base constructor : ${ex.message}`;
        throw ex;
    }
  }

  initBase() {
    let self = this;
    this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = this.props.width || this.CHART_CONST.FIX_WIDTH;
    this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = this.props.height || this.CHART_CONST.FIX_HEIGHT;

    if (this.CHART_OPTIONS.width < this.CHART_CONST.MIN_WIDTH) {
      this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = this.CHART_CONST.MIN_WIDTH;
    }
    if (this.CHART_OPTIONS.height < this.CHART_CONST.MIN_HEIGHT) {
      this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = this.CHART_CONST.MIN_HEIGHT;
    }

    // if (this.CHART_OPTIONS.events && typeof this.CHART_OPTIONS.events === "object") {
    //   for (let e in this.CHART_OPTIONS.events) {
    //     this.event.off(e, this.CHART_OPTIONS.events[e]);
    //     this.event.on(e, this.CHART_OPTIONS.events[e]);
    //   }
    // }

    this.CHART_DATA.scaleX = this.CHART_CONST.FIX_WIDTH - this.CHART_OPTIONS.width;
    this.CHART_DATA.scaleY = this.CHART_CONST.FIX_HEIGHT - this.CHART_OPTIONS.height;

    //fire Event onInit
    // let onInitEvent = new Event("onInit", {
    //   srcElement: this
    // });
    // this.event.dispatchEvent(onInitEvent);

    // let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
    //     "version='1.1'" +
    //     "width='" + this.CHART_OPTIONS.width + "'" +
    //     "height='" + this.CHART_OPTIONS.height + "'" +
    //     "id='" + this.chartType + "'" +
    //     "style='background:" + (this.CHART_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
    //     "> <\/svg>";
    //this.CHART_DATA.chartSVG = 
    
    //this.CHART_DATA.container.innerHTML = "";
    //this.CHART_DATA.container.insertAdjacentHTML("beforeend", vSvg);
    //this.CHART_DATA.container.appendChild(this.CHART_DATA.chartSVG);
    //this.CHART_DATA.chartSVG = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #" + this.chartType);

    this.CHART_DATA.svgWidth = parseInt(this.CHART_OPTIONS.width);
    this.CHART_DATA.svgHeight = parseInt(this.CHART_OPTIONS.height);
    this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));
    // if (this.CHART_OPTIONS.canvasBorder) {
    //   let strSVG = "<g>";
    //   strSVG += "   <rect x='0' y='0' width='" + (this.CHART_DATA.svgWidth - 1) + "' height='" + (this.CHART_DATA.svgHeight - 1) + "' shape-rendering='optimizeSpeed' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
    //   strSVG += "   <\/g>";
    //   this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
    // }

    // setTimeout(function () {
    //   self.ui.appendMenu2(self.CHART_OPTIONS.targetElem, self.CHART_DATA.svgCenter, null, null, self);
    //   self.ui.appendWaterMark(self.CHART_OPTIONS.targetElem, self.CHART_DATA.scaleX, self.CHART_DATA.scaleY);
    // }, 100);

  } /* End of Init() */

  // componentDidMount() {
  //   setTimeout(() => {
  //     this.setState({
  //       timeNow: 12//new Date().toTimeString().split(' ')[0]
  //     });
  //   },1000);
  // }

  render() {
    let Chart = CHART_MODULES[this.chartType];
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        version={1.1}
        width={this.CHART_OPTIONS.width}
        height={this.CHART_OPTIONS.height}
        id={`${this.chartType}_${this.runId}`}
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
            style={{ fill: '#fff', strokWidth: 1, stroke: '#717171' }}
          />
        </g> : null}
        <Chart runId={this.runId}
          chartOptions={this.CHART_OPTIONS} 
          chartData={this.CHART_DATA} 
          chartConst={this.CHART_CONST} 
        /> 
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

  getRunId(chartType) {
    return this.runId;
  }

  
}

export default BaseChart;