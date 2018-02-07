/**
 * SVG Area Chart 
 * @version:2.0.0
 * @createdOn:31-05-2016
 * @author:SmartChartsNXT
 * @description: SVG Area Chart, that support multiple series, and zoom window.
 * 
 * JSFiddle:
 * Sample caller code:
 */

 "use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import defaultConfig from "./../../settings/config";
import UtilCore from './../../core/util.core';
import UiCore from './../../core/ui.core';
import Draggable from './../../components/draggable'; 
import LegendBox from './../../components/legendBox';
import Tooltip from './../../components/tooltip';


class AreaChart extends Component {
  constructor(props) {
    super(props);
    try {
      let self = this;
      this.CHART_DATA = this.util.extends({
        chartCenter: 0,
        maxima: 0,
        minima: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        gridBoxWidth: 0,
        gridBoxHeight: 0,
        hScrollBoxHeight: opts.hideHorizontalScroller ? 0 : 60,
        fullSeries: [],
        fsScaleX: 0,
        vLabelWidth: 70,
        hLabelHeight: 80,
        windowLeftIndex: 0,
        windowRightIndex: -1,
        longestSeries: 0,
        series: [],
        mouseDown: 0,
        newDataSet: [],
        newCatgList: [],
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, this.CHART_DATA);

      this.CHART_OPTIONS = UtilCore.extends({}, this.props.chartOptions);
      this.CHART_CONST = this.util.extends({
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600,
        MIN_WIDTH: 250,
        MIN_HEIGHT: 400,
        hGridCount: 10
      }, this.CHART_CONST);


      this.init();
    } catch (ex) {
      ex.errorIn = `Error in AreaChart with runId:${this.props.runId}`;
      throw ex;
    }
  }

  init() {
    this.initDataSet();
    this.prepareDataSet(); 
  } 

  initDataSet() {
    this.CHART_DATA.fullSeries = [];
    this.CHART_DATA.series = [];
    this.CHART_DATA.newDataSet = [];
    this.CHART_DATA.newCatgList = [];
    this.CHART_DATA.windowLeftIndex = 0;
    this.CHART_DATA.windowRightIndex = -1;
  }

  prepareDataSet(dataSet) {
    let self = this;
    let maxSet = [];
    let minSet = [];
    let categories = [];
    dataSet = dataSet || this.CHART_OPTIONS.dataSet.series;

    for (let i = 0; i < dataSet.length; i++) {
      let arrData = [];
      for (let j = 0; j < dataSet[i].data.length; j++) {
        arrData.push(dataSet[i].data[j].value);
        if (j > categories.length - 1) {
          categories.push(dataSet[i].data[j].label);
        }
      }
      let maxVal = Math.max.apply(null, arrData);
      let minVal = Math.min.apply(null, arrData);
      maxSet.push(maxVal);
      minSet.push(minVal);
      dataSet[i].color = dataSet[i].color || this.util.getColor(i);
    }
    this.CHART_OPTIONS.dataSet.xAxis.categories = categories;
    this.CHART_DATA.maxima = Math.max.apply(null, maxSet);
    this.CHART_DATA.minima = Math.min.apply(null, minSet);

    //fire Event afterParseData
    // let afterParseDataEvent = new this.event.Event("afterParseData", {
    //   srcElement: self
    // });
    // this.event.dispatchEvent(afterParseDataEvent);
  } 

  render() {
    return (
      <g>
        <style>
          {this.getStyle()}
        </style> 
        <g>
          <Draggable>
            <text class='txt-title-grp' text-rendering='geometricPrecision'>
              <tspan text-anchor='middle' class='txt-title' x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight - 30)}>{this.CHART_OPTIONS.title}</tspan>
              <tspan text-anchor='middle' class='txt-subtitle'x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight)}>{this.CHART_OPTIONS.subtitle}</tspan>
            </text>
          </Draggable>
        </g>
      </g>
    );
  }

  getStyle() {
    return (`
      *{
        outline:none;
      }
      .txt-title-grp .txt-title {
        font-family: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fontFamily) || defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 20, (this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.maxFontSize) || 25)};
        fill: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fillColor) || defaultConfig.theme.fontColorDark};
        stroke: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.borderColor) || 'none'};
      }
      .txt-title-grp .txt-subtitle {
        font-family: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fontFamily) || defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.maxFontSize) || 18)};
        fill: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fillColor) || defaultConfig.theme.fontColorDark};
        stroke: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.borderColor) || 'none'};
      }
    `);
  }
}

export default AreaChart; 
