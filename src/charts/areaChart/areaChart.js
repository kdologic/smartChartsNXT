"use strict";

/**
 * SVG Area Chart :: areaChart.js
 * @version:2.0.0
 * @createdOn:31-05-2016
 * @author:SmartChartsNXT
 * @description: SVG Area Chart, that support multiple series and zoom window.
 */

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import defaultConfig from "./../../settings/config";
import UtilCore from './../../core/util.core';
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';
import Draggable from './../../components/draggable'; 
import LegendBox from './../../components/legendBox';
import Grid from './../../components/grid';
import AreaFill from './areaFill'; 
import VerticalLabels from './../../components/verticalLabels';
import HorizonalLabels from './../../components/horizontalLabels';
import Tooltip from './../../components/tooltip';
import InteractivePlane from './interactivePlane'; 

/** 
 * SVG Area Chart, that support multiple series and zoom window.
 * @extends Component
 */

class AreaChart extends Component {
  constructor(props) {
    super(props);
    try {
      let self = this;
      this.CHART_DATA = UtilCore.extends({
        chartCenter: 0,
        maxima: 0,
        minima: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        gridBoxWidth: 0,
        gridBoxHeight: 0,
        offsetWidth: 20, // distance of text label from left and right side 
        offsetHeight: 70, // distance of text label from top and bottom side
        hScrollBoxMarginTop: 70, 
        hScrollBoxHeight: this.props.hideHorizontalScroller ? 0 : 60,
        fullSeries: [],
        fsScaleX: 0,
        vLabelWidth: 70,
        hLabelHeight: 80,
        hGridCount: 6,
        valueInterval:0,
        paddingX: 10,
        windowLeftIndex: 0,
        windowRightIndex: -1,
        longestSeries: 0,
        series: [],
        mouseDown: 0,
        newDataSet: [],
        newCatgList: [],
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, this.props.chartData);

      this.CHART_OPTIONS = UtilCore.extends({
        dataSet: {
          xAxis: {label: 'x-axis'},
          yAxis: {label: 'y-axis'}
        }
      }, this.props.chartOptions);
      this.CHART_CONST = UtilCore.extends({}, this.props.chartConst);
      
      this.subComp = {
        area: []
      };

      this.emitter = eventEmitter.getInstance(this.context.runId); 

      this.init();
      this.bindEventsOfDataTooltips(); 
    } catch (ex) {
      ex.errorIn = `Error in AreaChart with runId:${this.context.runId}`;
      throw ex;
    }
  }

  init() {
    this.initDataSet();
    this.minWidth = this.CHART_DATA.minWidth; 
    this.minHeight = this.CHART_DATA.minHeight;
    this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
    this.CHART_DATA.marginLeft = ((-1) * this.CHART_DATA.scaleX / 2) + 100;
    this.CHART_DATA.marginRight = ((-1) * this.CHART_DATA.scaleX / 2) + 20;
    this.CHART_DATA.marginTop = ((-1) * this.CHART_DATA.scaleY / 2) + 120;
    this.CHART_DATA.marginBottom = ((-1) * this.CHART_DATA.scaleY / 2) + this.CHART_DATA.hScrollBoxHeight + 90;
    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;

    let longestSeries = 0;
    let longSeriesLen = 0;
    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {

      if (this.CHART_OPTIONS.dataSet.series[index].data.length > longSeriesLen) {
        longestSeries = index;
        longSeriesLen = this.CHART_OPTIONS.dataSet.series[index].data.length;
      }
    }
    this.CHART_DATA.longestSeries = longestSeries;
    
    /* Will set initial zoom window */
    if (this.CHART_OPTIONS.zoomWindow) {
      if (this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.leftIndex >= 0 && this.CHART_OPTIONS.zoomWindow.leftIndex < longSeriesLen - 1) {
        this.CHART_DATA.windowLeftIndex = this.CHART_OPTIONS.zoomWindow.leftIndex;
      }
      if (this.CHART_OPTIONS.zoomWindow.rightIndex && this.CHART_OPTIONS.zoomWindow.rightIndex > this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.rightIndex <= longSeriesLen - 1) {
        this.CHART_DATA.windowRightIndex = this.CHART_OPTIONS.zoomWindow.rightIndex;
      } else {
        this.CHART_DATA.windowRightIndex = (longSeriesLen) - 1;
      }
    } 
    if(this.CHART_DATA.windowRightIndex === -1){
      this.CHART_DATA.windowRightIndex = (longSeriesLen) - 1;
    }
    
   
    this.prepareDataSet(); 
  } 

  initDataSet() {
    this.CHART_DATA.fullSeries = [];
    this.CHART_DATA.series = [];
    this.CHART_DATA.newDataSet = [];
    this.CHART_DATA.newCatgList = [];
    this.CHART_DATA.windowLeftIndex = 0;
    this.CHART_DATA.windowRightIndex = -1;
    this.subComp = {
      area: []
    };
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
      dataSet[i].color = dataSet[i].color || UtilCore.getColor(i);
    }
    
    this.CHART_OPTIONS.dataSet.xAxis.categories = categories;
    this.CHART_DATA.maxima = Math.max.apply(null, maxSet);
    this.CHART_DATA.minima = Math.min.apply(null, minSet);
    this.CHART_DATA.objInterval = UiCore.calcInterval(this.CHART_DATA.minima, this.CHART_DATA.maxima);
    ({iVal: this.CHART_DATA.valueInterval, iCount: this.CHART_DATA.hGridCount} = this.CHART_DATA.objInterval);
    this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_DATA.hGridCount)); 
  } 

  propsWillReceive(nextProps){
    this.CHART_CONST = UtilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = UtilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions);
    this.CHART_DATA.hScrollBoxHeight = nextProps.hideHorizontalScroller ? 0 : 60,
    this.init(); 
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
        
        <Grid posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} 
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} 
          gridCount={this.CHART_DATA.hGridCount} gridHeight={this.CHART_DATA.gridHeight}>
        </Grid> 

        <VerticalLabels onRef={ref => this.subComp.vLabel = ref}  opts={this.CHART_OPTIONS.dataSet.yAxis || {}}
          posX={this.CHART_DATA.marginLeft - 10} posY={this.CHART_DATA.marginTop} maxVal={this.CHART_DATA.objInterval.iMax} minVal={this.CHART_DATA.objInterval.iMin} valueInterval={this.CHART_DATA.valueInterval}
          labelCount={this.CHART_DATA.hGridCount} intervalLen={this.CHART_DATA.gridHeight} maxWidth={this.CHART_DATA.vLabelWidth} 
          updateTip={this.updateLabelTip.bind(this)} hideTip={this.hideTip.bind(this)}>
        </VerticalLabels> 

        <HorizonalLabels onRef={ref => this.subComp.vLabel = ref}  opts={this.CHART_OPTIONS.dataSet.xAxis || {}}
          posX={this.CHART_DATA.marginLeft + 10} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight} maxWidth={this.CHART_DATA.gridBoxWidth} 
          categorySet = {this.CHART_OPTIONS.dataSet.xAxis.categories} paddingX={this.CHART_DATA.paddingX}
          updateTip={this.updateLabelTip.bind(this)} hideTip={this.hideTip.bind(this)}>
        </HorizonalLabels>   

        <text class='vertical-axis-title' fill={defaultConfig.theme.fontColorDark} transform={`rotate(${-90},${20},${(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight/2))})`} text-rendering='geometricPrecision' text-anchor='middle' font-weight="bold" stroke="white" stroke-width="10" stroke-linejoin="round" paint-order="stroke">
          <tspan x={20} y={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight/2))}>{this.CHART_OPTIONS.dataSet.yAxis.title}</tspan>
        </text>

        <text class='horizontal-axis-title' fill={defaultConfig.theme.fontColorDark} text-rendering='geometricPrecision' text-anchor='middle' font-weight="bold" stroke="white" stroke-width="25" stroke-linejoin="round" paint-order="stroke">
          <tspan x={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth/2))} y={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + (this.CHART_DATA.hScrollBoxMarginTop/2) + 15)}>{this.CHART_OPTIONS.dataSet.xAxis.title}</tspan>
        </text>
        
        { 
          this.drawSeries() 
        }

        <Tooltip onRef={ref => this.subComp.tooltip = ref} opts={this.CHART_OPTIONS.tooltip || {}}
          svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} >
        </Tooltip>
        
        <InteractivePlane onRef={ref => this.subComp.interactivePlane = ref} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} 
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} >
        </InteractivePlane>
      </g>
    );
  }

  drawSeries() {
    let maxSeriesLen = this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex + 1).length;
    
    return this.CHART_OPTIONS.dataSet.series.map((series, i) => {
      return (
        <AreaFill dataSet={series} index={i} instanceId={i} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} maxSeriesLen={maxSeriesLen} fill={series.bgColor || UtilCore.getColor(i)} 
          opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline}
          maxVal={this.CHART_DATA.objInterval.iMax} minVal={this.CHART_DATA.objInterval.iMin} onRef={ref => this.subComp.area.push(ref)} >
        </AreaFill>
      );
    });
  }

  updateLabelTip(e, labelData) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    if(this.subComp.tooltip) {
      this.subComp.tooltip.updateTip(mousePos, null, labelData);
    }
  }

  bindEventsOfDataTooltips() {
    let pointData = [], originPoint, prevOriginPoint;
    let eventStream = {}; 
    let self = this; 

    this.emitter.on('onPointHighlight', (e) => {
      if(!eventStream[e.timeStamp] ) {
        eventStream[e.timeStamp] = [e]; 
      } else {
        eventStream[e.timeStamp].push(e); 
      }
      //consume events when all events are received
      if(eventStream[e.timeStamp].length === this.CHART_OPTIONS.dataSet.series.length) {
        for(let evt of eventStream[e.timeStamp]) {
          if(evt.highlightedPoint === null) {
            continue; 
          }
          pointData.push(consumeEvents(evt));
        }
        if(!prevOriginPoint || (originPoint.x !== prevOriginPoint.x && originPoint.y !== prevOriginPoint.y)) {
          this.updateDataTooltip(originPoint, pointData);
        }
        pointData = [];
        prevOriginPoint = originPoint; 
        originPoint = undefined;
        delete eventStream[e.timeStamp]; 
      } 
    });

    function consumeEvents(e) {
      let series = self.CHART_OPTIONS.dataSet.series[e.highlightedPoint.seriesIndex];
      let point = series.data[e.highlightedPoint.pointIndex];
      let hPoint = {
        label: point.label,
        value: point.value,
        seriesName: series.name,
        seriesIndex: e.highlightedPoint.seriesIndex, 
        pointIndex: e.highlightedPoint.pointIndex,
        seriesColor: series.bgColor || UtilCore.getColor(e.highlightedPoint.seriesIndex),
        dist: e.highlightedPoint.dist
      };
  
      if(originPoint) {
        originPoint = new Point(e.highlightedPoint.x , (e.highlightedPoint.y + originPoint.y) / 2);
      } else {
        originPoint = new Point(e.highlightedPoint.x, e.highlightedPoint.y);
      }
      return hPoint; 
    }

    this.emitter.on('interactiveMouseLeave', (e) => {
      if(!this.subComp.tooltip) {
        return; 
      } 
      pointData = [];
      originPoint = undefined;
      prevOriginPoint = undefined; 
      this.hideTip(); 
    });
  }

  

  updateDataTooltip(originPoint, pointData) {
    if(!this.subComp.tooltip) {
      return; 
    }
    if (this.CHART_OPTIONS.tooltip && this.CHART_OPTIONS.tooltip.content) {
      this.subComp.tooltip.updateTip(originPoint, pointData, undefined, undefined, 'left');
    } 
    else {
      let row1 = this.getDefaultTooltipHTML.call(pointData); 
      let row2 = 'html'; 
      this.subComp.tooltip.updateTip(originPoint, pointData, row1, row2, 'left');
    }
  }

  getDefaultTooltipHTML(){
    return '<table>' +
      '<tbody>' +
        '<tr style="background-color: #aaa; font-size: 14px; text-align: left; color: #FFF;">' +
          '<th colspan="2" style="padding: 2px 5px; ">' + this[0].label + '</th>' +
        '</tr>' +
          this.map(function(point) {
            return '<tr>' + 
                '<td style="font-size: 13px; padding: 3px 6px; background-color: #fff;">' +
                  '<span style="background-color:' + point.seriesColor +'; display:inline-block; width:10px; height:10px;margin-right:5px;"></span>' + point.seriesName + '</td>' +
                '<td style="font-size: 13px; padding: 3px 6px; background-color: #fff;">'+ point.value + '</td>' +
              '</tr>';
          }).join('') +
      '</tbody>' +
    '</table>';
  }

  hideTip() {
    this.subComp.tooltip && this.subComp.tooltip.hide(); 
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
      .vertical-axis-title, .horizontal-axis-title {
        font-family: ${defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14)};
      }
    `);
  }
}

export default AreaChart; 
