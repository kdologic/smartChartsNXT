"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import defaultConfig from "./../../settings/config";
import UtilCore from './../../core/util.core';
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';
import Draggable from './../../components/draggable'; 
import LegendBox from './../../components/legendBox';
import Grid from './../../components/grid';
import PointerCrosshair from './../../components/pointerCrosshair';
import AreaFill from './areaFill'; 
import VerticalLabels from './../../components/verticalLabels';
import HorizontalLabels from './../../components/horizontalLabels';
import HorizontalScroller from './../../components/horizontalScroller';
import Tooltip from './../../components/tooltip';
import InteractivePlane from './interactivePlane'; 
import dateFormat from "dateformat";

/**
 * SVG Area Chart :: areaChart.js
 * @createdOn:31-05-2016
 * @author:SmartChartsNXT
 * @description: SVG Area Chart, that support multiple series and zoom window.
 * @extends Component
 */

class AreaChart extends Component {
  constructor(props) {
    super(props);
    try {
      let self = this;
      this.CHART_DATA = UtilCore.extends({
        chartCenter: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        gridBoxWidth: 0,
        gridBoxHeight: 0,
        offsetHeight: 70, // distance of text label from top and bottom side
        hScrollBoxMarginTop: 80, 
        vLabelWidth: 70,
        paddingX: 10,
        longestSeries: 0,
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, this.props.chartData);

      this.CHART_OPTIONS = UtilCore.extends({
        dataSet: {
          xAxis: {label: 'x-axis'},
          yAxis: {label: 'y-axis'}
        },
        horizontalScroller: {
          enable: true,
          height: 35,
          chartInside: true
        }
      }, this.props.chartOptions);
      this.CHART_CONST = UtilCore.extends({}, this.props.chartConst);
      
      this.state = {
        _maxSeriesLen: 0,
        _longestSeries: 0,
        _maxSeriesLenFS: 0, 
        _windowLeftIndex: -1,
        _windowRightIndex: -1, 
        get longestSeries() {
          let dataSet = this.cs.dataSet || self.CHART_OPTIONS.dataSet;
          this._maxSeriesLen = 0; 
          for (let index = 0; index < dataSet.series.length; index++) {
            if (dataSet.series[index].data.length >= this._maxSeriesLen) {
              this._longestSeries = index;
              this._maxSeriesLen = dataSet.series[index].data.length;
            }
          }
          return this._longestSeries; 
        },
        get maxSeriesLen() {
          let dataSet = this.cs.dataSet || self.CHART_OPTIONS.dataSet;
          this._maxSeriesLen = 0; 
          for (let index = 0; index < dataSet.series.length; index++) {
            if (dataSet.series[index].data.length > this._maxSeriesLen) {
              this._longestSeries = index;
              this._maxSeriesLen = dataSet.series[index].data.length;
            }
          }
          return this._maxSeriesLen;
        },
        get maxSeriesLenFS() {
          for (let index = 0; index < self.CHART_OPTIONS.dataSet.series.length; index++) {
            if (self.CHART_OPTIONS.dataSet.series[index].data.length > this._maxSeriesLenFS) {
              this._maxSeriesLenFS = self.CHART_OPTIONS.dataSet.series[index].data.length;
            }
          }
          return this._maxSeriesLenFS;
        },
        set windowLeftIndex(index) {
          this._windowLeftIndex = index;
          this.leftOffset = index * 100 / (this.maxSeriesLenFS - 1); 
        },
        get windowLeftIndex() {
          return this._windowLeftIndex;
        },
        set windowRightIndex(index) {
          this._windowRightIndex = index;
          this.rightOffset = index * 100 / (this.maxSeriesLenFS - 1); 
        },
        get windowRightIndex() {
          return this._windowRightIndex; 
        },
        hGridCount: 6,
        gridHeight: 0,
        cs: {
          maxima: 0, 
          minima: 0, 
          valueInterval:0,
          yInterval: {},
          scaleX: 0,
          dataSet: undefined
        },
        fs: {
          maxima: 0, 
          minima: 0, 
          valueInterval:0,
          yInterval: {},
          dataSet: undefined
        },
        hScrollLeftOffset: 0,
        hScrollRightOffset: 100, 
        clipLeftOffset: 0,
        clipRightOffset: 100,
        offsetLeftChange: 0,
        offsetRightChange: 0
      }; 

      this.legendBoxType = this.props.chartOptions.legends ? this.props.chartOptions.legends.alignment : 'horizontal';
      this.legendBoxFloat = this.props.chartOptions.legends ? this.props.chartOptions.legends.float : 'none';
      this.pointData = [], 
      this.originPoint;
      this.prevOriginPoint;
      this.eventStream = {}; 
      this.emitter = eventEmitter.getInstance(this.context.runId); 
      this.onHScrollBind = this.onHScroll.bind(this); 
      this.onPointHighlightedBind = this.onPointHighlighted.bind(this);
      this.onMouseLeaveBind = this.onMouseLeave.bind(this);
      this.updateLabelTipBind = this.updateLabelTip.bind(this);
      this.hideTipBind = this.hideTip.bind(this);
      this.onLegendClickBind = this.onLegendClick.bind(this); 
      this.onLegendHoverBind = this.onLegendHover.bind(this); 
      this.onLegendLeaveBind = this.onLegendLeave.bind(this); 

      this.init();
      
    } catch (ex) {
      ex.errorIn = `Error in AreaChart with runId:${this.context.runId}`;
      throw ex;
    }
  }

  init() {
    if(!this.CHART_OPTIONS.horizontalScroller.enable) {
      this.CHART_OPTIONS.horizontalScroller.height = 0; 
    }
    this.minWidth = this.CHART_DATA.minWidth; 
    this.minHeight = this.CHART_DATA.minHeight;
    this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
    this.CHART_DATA.marginLeft = ((-1) * this.CHART_DATA.scaleX / 2) + 100;
    this.CHART_DATA.marginRight = ((-1) * this.CHART_DATA.scaleX / 2) + 20;
    this.CHART_DATA.marginTop = ((-1) * this.CHART_DATA.scaleY / 2) + 120;
    this.CHART_DATA.marginBottom = ((-1) * this.CHART_DATA.scaleY / 2) + this.CHART_OPTIONS.horizontalScroller.height + 90;
    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      if(this.CHART_OPTIONS.dataSet.series[index].visible == undefined) {
        this.CHART_OPTIONS.dataSet.series[index].visible = true;
      }
    }

    if(this.state.windowLeftIndex < 0 && this.state.windowRightIndex < 0) {
      /* Will set initial zoom window */
      if (this.CHART_OPTIONS.zoomWindow) {
        if (this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.leftIndex >= 0 && this.CHART_OPTIONS.zoomWindow.leftIndex < this.state.maxSeriesLen) {
          this.state.windowLeftIndex = this.CHART_OPTIONS.zoomWindow.leftIndex - 1;
        }
        if (this.CHART_OPTIONS.zoomWindow.rightIndex && this.CHART_OPTIONS.zoomWindow.rightIndex >= this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.rightIndex <= this.state.maxSeriesLenFS) {
          this.state.windowRightIndex = this.CHART_OPTIONS.zoomWindow.rightIndex - 1;
        } else {
          this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
        }
      } else {
        this.state.windowLeftIndex = 0; 
        this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
      }
      this.state.clipLeftOffset = this.state.hScrollLeftOffset = this.state.leftOffset;
      this.state.clipRightOffset = this.state.hScrollRightOffset = this.state.rightOffset; 
    }
    
    /* Prepare data set for Horizontal scroll */
    this.prepareDataSet(true); 
    /* Prepare data set for chart area. */
    this.prepareDataSet(); 
  } 

  prepareDataSet(isFS=false) {
    let maxSet = [];
    let minSet = [];
    let categories = [];
    let dataFor = isFS ? 'fs' : 'cs';  
    let dataSet = JSON.parse(JSON.stringify(this.CHART_OPTIONS.dataSet));
    if(!isFS) {
      for(let i = 0;i < this.CHART_OPTIONS.dataSet.series.length;i++) {
        if(!dataSet.series[i].data.length) {
          dataSet.series[i].visible = false; 
        }else if(!dataSet.series[i].visible) {
          dataSet.series[i].data = [];
        }else {
          dataSet.series[i].data = this.CHART_OPTIONS.dataSet.series[i].data.slice(this.state.windowLeftIndex, this.state.windowRightIndex + 1);
        }
      }
    }
    for (let i = 0; i < dataSet.series.length; i++) {
      let arrData = [];
      for (let j = 0; j < dataSet.series[i].data.length; j++) {
        arrData.push(dataSet.series[i].data[j].value);
        if (j > categories.length - 1) {
          categories.push(dataSet.series[i].data[j].label);
        }
      }
      let maxVal = arrData.length ? Math.max(...arrData) : 0;
      let minVal = arrData.length ? Math.min(...arrData) : 0;
      maxSet.push(maxVal);
      minSet.push(minVal);
      dataSet.series[i].color = dataSet.series[i].color || UtilCore.getColor(i);
      dataSet.series[i].index = i; 
    }
    this.state[dataFor].dataSet = dataSet; 
    this.state[dataFor].dataSet.xAxis.categories = categories; 
    this.state[dataFor].maxima = Math.max(...maxSet);
    this.state[dataFor].minima = Math.min(...minSet);
    this.state[dataFor].yInterval = UiCore.calcIntervalByMinMax(this.state[dataFor].minima, this.state[dataFor].maxima, this.state[dataFor].dataSet.yAxis.zeroBase);
    ({iVal: this.state[dataFor].valueInterval, iCount: this.state.hGridCount} = this.state[dataFor].yInterval);
    this.state.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.state.hGridCount)); 
  } 

  propsWillReceive(nextProps) {
    this.CHART_CONST = UtilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = UtilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions);
    this.init(); 
  }

  componentDidMount() {
    this.emitter.on('hScroll', this.onHScrollBind);
    this.emitter.on('pointHighlighted', this.onPointHighlightedBind);
    this.emitter.on('interactiveMouseLeave', this.onMouseLeaveBind);
    this.emitter.on('vLabelEnter', this.updateLabelTipBind);
    this.emitter.on('vLabelExit', this.hideTipBind);
    this.emitter.on('hLabelEnter', this.updateLabelTipBind);
    this.emitter.on('hLabelExit', this.hideTipBind);
    this.emitter.on('legendClicked', this.onLegendClickBind);
    this.emitter.on('legendHovered', this.onLegendHoverBind);
    this.emitter.on('legendLeaved', this.onLegendLeaveBind);
  }

  componentWillUnmount() {
    this.emitter.removeListener('hScroll', this.onHScrollBind); 
    this.emitter.removeListener('pointHighlighted', this.onPointHighlightedBind); 
    this.emitter.removeListener('interactiveMouseLeave', this.onMouseLeaveBind);
    this.emitter.removeListener('vLabelEnter', this.updateLabelTipBind);
    this.emitter.removeListener('vLabelExit', this.hideTipBind);
    this.emitter.removeListener('hLabelEnter', this.updateLabelTipBind);
    this.emitter.removeListener('hLabelExit', this.hideTipBind); 
    this.emitter.removeListener('legendClicked', this.onLegendClickBind);
    this.emitter.removeListener('legendHovered', this.onLegendHoverBind);
    this.emitter.removeListener('legendLeaved', this.onLegendLeaveBind);
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
          gridCount={this.state.hGridCount} gridHeight={this.state.gridHeight}>
        </Grid> 

        <VerticalLabels  opts={this.state.cs.dataSet.yAxis || {}}
          posX={this.CHART_DATA.marginLeft - 10} posY={this.CHART_DATA.marginTop} maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin} valueInterval={this.state.cs.valueInterval}
          labelCount={this.state.hGridCount} intervalLen={this.state.gridHeight} maxWidth={this.CHART_DATA.vLabelWidth} >
        </VerticalLabels> 

        <HorizontalLabels opts={this.state.cs.dataSet.xAxis || {}}
          posX={this.CHART_DATA.marginLeft + 10} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight} maxWidth={this.CHART_DATA.gridBoxWidth} 
          categorySet = {this.state.cs.dataSet.xAxis.categories} paddingX={this.CHART_DATA.paddingX} >
        </HorizontalLabels>   

        <text class='vertical-axis-title' fill={defaultConfig.theme.fontColorDark} transform={`rotate(${-90},${20},${(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight/2))})`} text-rendering='geometricPrecision' text-anchor='middle' font-weight="bold" stroke="white" stroke-width="10" stroke-linejoin="round" paint-order="stroke">
          <tspan x={20} y={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight/2))}>{this.CHART_OPTIONS.dataSet.yAxis.title}</tspan>
        </text>

        <text class='horizontal-axis-title' fill={defaultConfig.theme.fontColorDark} text-rendering='geometricPrecision' text-anchor='middle' font-weight="bold" stroke="white" stroke-width="25" stroke-linejoin="round" paint-order="stroke">
          <tspan x={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth/2))} y={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + (this.CHART_DATA.hScrollBoxMarginTop/2) + 15)}>{this.CHART_OPTIONS.dataSet.xAxis.title}</tspan>
        </text>
        
        <PointerCrosshair hLineStart={this.CHART_DATA.marginLeft} hLineEnd={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth} 
          vLineStart={this.CHART_DATA.marginTop} vLineEnd={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight}
          opts={this.CHART_OPTIONS.pointerCrosshair || {}}> 
        </PointerCrosshair>
        
        <g class='sc-chart-area-container'>
          { this.drawSeries() }
        </g>
        
        {(!this.CHART_OPTIONS.legends || (this.CHART_OPTIONS.legends && this.CHART_OPTIONS.legends.enable !== false)) &&
          <Draggable>
            <LegendBox legendSet={this.getLegendData()} float={this.legendBoxFloat} left={this.CHART_DATA.marginLeft} top={this.CHART_DATA.offsetHeight+5} opts={this.CHART_OPTIONS.legends || {}} 
              display="inline" canvasWidth={this.CHART_DATA.svgWidth} canvasHeight={this.CHART_DATA.svgHeight} type={this.legendBoxType} background='none'
              hoverColor="#ddd" toggleType={true} >
            </LegendBox>
          </Draggable>
        }

        <Tooltip opts={this.CHART_OPTIONS.tooltip || {}}
          svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} >
        </Tooltip>

        <InteractivePlane posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} 
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} >
        </InteractivePlane>

        { this.CHART_OPTIONS.horizontalScroller.enable &&
          <HorizontalScroller opts={this.CHART_OPTIONS.horizontalScroller || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxMarginTop} 
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height} leftOffset={this.state.leftOffset} rightOffset={this.state.rightOffset}
            svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight}> 
            {this.drawHScrollSeries()}
          </HorizontalScroller>
        }
      </g>
    );
  }

  drawSeries() {
    let isBothSinglePoint = true; 
    this.state.cs.dataSet.series.filter(d => d.data.length > 0).map(s => {
      isBothSinglePoint = !!(isBothSinglePoint * (s.data.length == 1));
    });
    return this.state.cs.dataSet.series.filter(d => d.data.length > 0).map((series) => {
      return (
        <AreaFill dataSet={series} index={series.index} instanceId={'cs' + series.index} posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} height={this.CHART_DATA.gridBoxHeight} maxSeriesLen={this.state.maxSeriesLen} areaFillColor={series.bgColor || UtilCore.getColor(i)} lineFillColor={series.bgColor || UtilCore.getColor(i)} 
          gradient={typeof series.gradient == 'undefined' ? true : series.gradient} strokeOpacity={series.lineOpacity || 1} opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={typeof series.marker == 'undefined' ? true : series.marker} markerRadius={series.markerRadius || 6} centerSinglePoint={isBothSinglePoint} lineStrokeWidth={series.lineWidth || 1.5} areaStrokeWidth={0}
          maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin} dataPoints={true}
          getScaleX={(scaleX) => { this.state.cs.scaleX = scaleX;}}
          clip={{
            x: this.state.offsetLeftChange + this.CHART_DATA.paddingX,
            width: this.CHART_DATA.gridBoxWidth - (2*this.CHART_DATA.paddingX),
            offsetLeft: this.state.offsetLeftChange, 
            offsetRight: this.state.offsetRightChange
          }}
          >
        </AreaFill>
      );
    });
  }

  drawHScrollSeries() {
    return this.state.fs.dataSet.series.filter(d => d.data.length > 0).map((series) => {
      return (
      <g class='sc-fs-chart-area-container'>
        <AreaFill dataSet={series} index={series.index} instanceId={'fs-'+ series.index}  posX={0} posY={5} paddingX={0} 
          width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor="#ddd" lineFillColor="#ddd" 
          gradient={false} opacity="1" spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={false} markerRadius="0" centerSinglePoint={false} lineStrokeWidth="0" areaStrokeWidth='0'
          maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false}>
        </AreaFill>
        <AreaFill dataSet={series} index={series.index} instanceId={'fs-clip-'+ series.index}  posX={0} posY={5} paddingX={0} 
          width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor="#8c4141" lineFillColor="#8c4141" 
          gradient={false} opacity="1" spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={false} markerRadius="0" centerSinglePoint={false} lineStrokeWidth="0" areaStrokeWidth='1'
          maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false}
          clip={{
            x: (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollLeftOffset/100, 
            width: (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollRightOffset/100 - (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollLeftOffset/100
            }}>
        </AreaFill>
      </g>
      );
    });
  }

  onHScroll(e) {
    let leftIndex = Math.floor((this.state.maxSeriesLenFS-1) * e.leftOffset / 100); 
    let rightIndex = Math.ceil((this.state.maxSeriesLenFS-1) * e.rightOffset / 100);
    let hScrollIntervalPercent = 100 / (this.state.maxSeriesLenFS-1);
    this.state.hScrollLeftOffset = e.leftOffset; 
    this.state.hScrollRightOffset = e.rightOffset; 

    if(this.state.windowLeftIndex != leftIndex || this.state.windowRightIndex != rightIndex) {
      if(leftIndex > this.state.windowLeftIndex) {
        this.state.clipLeftOffset += (leftIndex-this.state.windowLeftIndex)*hScrollIntervalPercent; 
      }else if(leftIndex < this.state.windowLeftIndex) {
        this.state.clipLeftOffset -= (this.state.windowLeftIndex-leftIndex)*hScrollIntervalPercent; 
      }
      if(rightIndex > this.state.windowRightIndex) {
        this.state.clipRightOffset += (rightIndex-this.state.windowRightIndex)*hScrollIntervalPercent; 
      }else if(rightIndex < this.state.windowRightIndex) {
        this.state.clipRightOffset -= (this.state.windowRightIndex-rightIndex)*hScrollIntervalPercent; 
      }
      this.state.windowLeftIndex = leftIndex; 
      this.state.windowRightIndex = rightIndex; 
      this.prepareDataSet();
    }

    this.state.offsetLeftChange = (this.state.cs.scaleX * (e.leftOffset - this.state.clipLeftOffset) / (this.state.maxSeriesLenFS-1))/4;
    this.state.offsetRightChange = (this.state.cs.scaleX * (this.state.clipRightOffset - e.rightOffset) / (this.state.maxSeriesLenFS-1))/4;
    console.log('leftoffset', e.leftOffset, 'rightoffset', e.rightOffset, 'scaleX', this.state.cs.scaleX, 'offsetRightChange', this.state.offsetRightChange);
     
    this.update();
  }

  updateLabelTip(e) { 
    this.emitter.emit('updateTooltip', {
      originPoint: UiCore.cursorPoint(this.context.rootContainerId, e), 
      pointData: undefined,
      line1: e.labelText,
      line2: undefined
    });
  }

  consumeEvents(e) {
    let series = this.state.cs.dataSet.series[e.highlightedPoint.seriesIndex];
    let point = series.data[e.highlightedPoint.pointIndex];
    let formatedLabel = point.label;
    if(this.state.cs.dataSet.xAxis && this.state.cs.dataSet.xAxis.parseAsDate) {
      formatedLabel = dateFormat(formatedLabel, this.state.cs.dataSet.xAxis.dateFormat || defaultConfig.formatting.dateFormat);
    }
    let hPoint = {
      x: e.highlightedPoint.x,
      y: e.highlightedPoint.y,
      label: point.label,
      formattedLabel: formatedLabel,
      value: point.value,
      seriesName: series.name,
      seriesIndex: e.highlightedPoint.seriesIndex, 
      pointIndex: e.highlightedPoint.pointIndex,
      seriesColor: series.bgColor || UtilCore.getColor(e.highlightedPoint.seriesIndex),
      dist: e.highlightedPoint.dist
    };

    if(this.originPoint) {
      this.originPoint = new Point(e.highlightedPoint.x , (e.highlightedPoint.y + this.originPoint.y) / 2);
    } else {
      this.originPoint = new Point(e.highlightedPoint.x, e.highlightedPoint.y);
    }
    return hPoint; 
  }

  onPointHighlighted(e) {
    if(!this.eventStream[e.timeStamp] ) {
      this.eventStream[e.timeStamp] = [e]; 
    } else {
      this.eventStream[e.timeStamp].push(e); 
    }
    //consume events when all events are received
    if(this.eventStream[e.timeStamp].length === this.state.cs.dataSet.series.filter(s => s.data.length > 0).length) {
      for(let evt of this.eventStream[e.timeStamp]) {
        if(evt.highlightedPoint === null) {
          continue; 
        }
        this.pointData.push(this.consumeEvents(evt));
      }
      if(this.pointData.length && !this.prevOriginPoint || (this.originPoint && this.originPoint.x !== this.prevOriginPoint.x && this.originPoint.y !== this.prevOriginPoint.y)) {
        this.updateDataTooltip(this.originPoint, this.pointData);
        this.updateCrosshair(this.pointData);
      }
      if(!this.pointData.length) {
        this.hideTip();
      }
      this.pointData = [];
      this.prevOriginPoint = this.originPoint; 
      this.originPoint = undefined;
      delete this.eventStream[e.timeStamp]; 
    } 
  }

  onMouseLeave(e) {
    this.pointData = [];
    this.originPoint = undefined;
    this.prevOriginPoint = undefined; 
    this.hideTip(); 
  }

  updateCrosshair(data) {
    this.emitter.emit('setVerticalCrosshair', data);
    this.emitter.emit('setHorizontalCrosshair', data);
  }

  updateDataTooltip(originPoint, pointData) {
    if (this.CHART_OPTIONS.tooltip && this.CHART_OPTIONS.tooltip.content) {
      this.emitter.emit('updateTooltip', {originPoint, pointData, line1: undefined, line2: undefined, preAlign: 'left'}); 
    } 
    else {
      let row1 = this.getDefaultTooltipHTML.call(pointData); 
      this.emitter.emit('updateTooltip', {originPoint, pointData, line1: row1, line2: 'html', preAlign: 'left'}); 
    }
  }

  getDefaultTooltipHTML() {
    return '<table>' +
      '<tbody>' +
        '<tr style="background-color: #aaa; font-size: 14px; text-align: left; color: #FFF;">' +
          '<th colspan="2" style="padding: 2px 5px; ">' + this[0].formattedLabel + '</th>' +
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

  hideTip(e) {
    this.emitter.emit('hideTooltip', e);
    this.updateCrosshair(null);
  }

  onLegendClick(e) {
    this.CHART_OPTIONS.dataSet.series[e.index].visible = !this.CHART_OPTIONS.dataSet.series[e.index].visible;
    this.prepareDataSet(); 
    this.update(); 
  }

  onLegendHover(e) {
    this.state.cs.dataSet.series.forEach((s,i) => {
      this.emitter.emit('changeAreaBrightness', {
        instanceId: 'cs'+ i, 
        strokeOpacity: i == e.index ? 1 : 0.2,
        opacity: i == e.index ? 1 : 0.1
      });
    });
  }

  onLegendLeave(e) {
    this.state.cs.dataSet.series.forEach((s,i) => {
      this.emitter.emit('changeAreaBrightness', {
        instanceId: 'cs'+ i, 
        strokeOpacity: this.CHART_OPTIONS.dataSet.series[i].lineOpacity || 1,
        opacity: this.CHART_OPTIONS.dataSet.series[i].areaOpacity || 0.2
      });
    });
  }

  getLegendData() {
    return this.state.cs.dataSet.series.map((data) => {
      return {label: data.name, color: data.bgColor, isToggeled: !data.visible}; 
    });
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
