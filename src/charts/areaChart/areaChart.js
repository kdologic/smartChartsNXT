"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import crossfilter from './../../plugIns/crossfilter.min.js';
import defaultConfig from "./../../settings/config";
import UtilCore from './../../core/util.core';
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';
import Style from "./../../viewEngin/style";
import Draggable from './../../components/draggable'; 
import LegendBox from './../../components/legendBox';
import TextBox from './../../components/textBox';
import Grid from './../../components/grid';
import PointerCrosshair from './../../components/pointerCrosshair';
import AreaFill from './areaFill'; 
import VerticalLabels from './../../components/verticalLabels';
import HorizontalLabels from './../../components/horizontalLabels';
import HorizontalScroller from './../../components/horizontalScroller';
import ZoomoutBox from './../../components/zoomOutBox';
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
        hLabelHeight: 80, 
        vLabelWidth: 70,
        paddingX: 5,
        longestSeries: 0,
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, this.props.chartData);

      this.CHART_OPTIONS = UtilCore.extends({
        dataSet: {
          xAxis: {title: 'Label-axis'},
          yAxis: {title: 'Value-axis'}
        },
        horizontalScroller: {
          enable: true,
          height: 35,
          chartInside: true
        }
      }, this.props.chartOptions);
      this.CHART_CONST = UtilCore.extends({}, this.props.chartConst);

      for(let i=0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
        for(let j=0; j < this.CHART_OPTIONS.dataSet.series[i].data.length; j++) {
          this.CHART_OPTIONS.dataSet.series[i].data[j].index = j;
        }
        this.CHART_OPTIONS.dataSet.series[i].turboData = crossfilter(this.CHART_OPTIONS.dataSet.series[i].data);
        this.CHART_OPTIONS.dataSet.series[i].dataDimIndex = this.CHART_OPTIONS.dataSet.series[i].turboData.dimension((d,i) => {return i;});
        this.CHART_OPTIONS.dataSet.series[i].dataDimValue = this.CHART_OPTIONS.dataSet.series[i].turboData.dimension((d,i) => {return d.value;});
      }
      
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
        offsetRightChange: 0,
        shouldFSRender: this.props.resizeComponent
      }; 

      this.legendBoxType = this.props.chartOptions.legends ? this.props.chartOptions.legends.alignment : 'horizontal';
      this.legendBoxFloat = this.props.chartOptions.legends ? this.props.chartOptions.legends.float : 'none';
      this.pointData = [], 
      this.originPoint;
      this.prevOriginPoint;
      this.eventStream = {}; 
      this.emitter = eventEmitter.getInstance(this.context.runId); 
      this.onHScroll = this.onHScroll.bind(this); 
      this.onHighlightPointMarker = this.onHighlightPointMarker.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.updateLabelTip = this.updateLabelTip.bind(this);
      this.hideTip = this.hideTip.bind(this);
      this.onLegendClick = this.onLegendClick.bind(this); 
      this.onLegendHover = this.onLegendHover.bind(this); 
      this.onLegendLeave = this.onLegendLeave.bind(this); 
      this.onZoomout = this.onZoomout.bind(this);

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

    if(this.state.fs.scaleX && this.state.cs.scaleX) {
      this.calcOffsetChanges(); 
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
    let dataSet = this.copyDataset(this.CHART_OPTIONS.dataSet);
    if(!isFS) {
      for(let i = 0;i < this.CHART_OPTIONS.dataSet.series.length;i++) {
        if(!dataSet.series[i].data.length) {
          dataSet.series[i].visible = false; 
        }else if(!dataSet.series[i].visible) {
          dataSet.series[i].data = [];
        }else {
          dataSet.series[i].data = this.CHART_OPTIONS.dataSet.series[i].dataDimIndex.bottom(this.state.windowRightIndex - this.state.windowLeftIndex + 1, this.state.windowLeftIndex);
        }
      }
    }
    for (let i = 0; i < dataSet.series.length; i++) {
      let data = dataSet.series[i].data;
      let minVal = 0;
      let maxVal = 0;
      dataSet.series[i].valueSet = []; 
      for (let j = 0, len=data.length; j < len; j++) {
        let v = data[j].value;
        minVal = (v < minVal) ? v : minVal;
        maxVal = (v > maxVal) ? v : maxVal;
        if (j > categories.length - 1) {
          categories.push(data[j].label);
        }
        dataSet.series[i].valueSet.push(v);
      }
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

  copyDataset(dataSet) {
    let data = {}; 
    for(let key in dataSet) {
      if(key === "series") {
        data[key] = []; 
        for(let i=0; i < dataSet[key].length; i++) {
          let series = dataSet[key][i], s = {};
          for(let skey in series) {
            if(skey === 'data') {
              s[skey] = series.dataDimIndex.bottom(Infinity);
            }else if(['turboData', 'dataDimIndex','dataDimValue'].indexOf(skey) === -1){
              s[skey] = JSON.parse(JSON.stringify(series[skey])); 
            }
          }
          data[key].push(s);
        }
      }else {
        data[key] = JSON.parse(JSON.stringify(dataSet[key])); 
      }
    }
    return data; 
  }

  calcOffsetChanges() {
    let fsWidth = this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth;
    let leftOffsetDiff = this.state.hScrollLeftOffset - this.state.clipLeftOffset;
    let fsOffsetLeft = fsWidth * leftOffsetDiff / 100;
    this.state.offsetLeftChange = fsOffsetLeft / this.state.fs.scaleX * this.state.cs.scaleX;

    let rightOffsetDiff = this.state.clipRightOffset - this.state.hScrollRightOffset;
    let fsOffsetRight = fsWidth * rightOffsetDiff / 100;
    this.state.offsetRightChange = fsOffsetRight / this.state.fs.scaleX * this.state.cs.scaleX;
  }

  propsWillReceive(nextProps) {
    this.CHART_CONST = UtilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = UtilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions);
    this.state.shouldFSRender = nextProps.resizeComponent;
    this.init(); 
  }

  componentDidMount() {
    this.emitter.on('hScroll', this.onHScroll);
    this.emitter.on('highlightPointMarker', this.onHighlightPointMarker);
    this.emitter.on('interactiveMouseLeave', this.onMouseLeave);
    this.emitter.on('vLabelEnter', this.updateLabelTip);
    this.emitter.on('vLabelExit', this.hideTip);
    this.emitter.on('hLabelEnter', this.updateLabelTip);
    this.emitter.on('hLabelExit', this.hideTip);
    this.emitter.on('legendClicked', this.onLegendClick);
    this.emitter.on('legendHovered', this.onLegendHover);
    this.emitter.on('legendLeaved', this.onLegendLeave);
    this.emitter.on('onZoomout', this.onZoomout);
    this.state.shouldFSRender = false;
  }

  componentDidUpdate() {
    this.state.shouldFSRender = false;
  }

  componentWillUnmount() {
    this.emitter.removeListener('hScroll', this.onHScroll); 
    this.emitter.removeListener('highlightPointMarker', this.onHighlightPointMarker); 
    this.emitter.removeListener('interactiveMouseLeave', this.onMouseLeave);
    this.emitter.removeListener('vLabelEnter', this.updateLabelTip);
    this.emitter.removeListener('vLabelExit', this.hideTip);
    this.emitter.removeListener('hLabelEnter', this.updateLabelTip);
    this.emitter.removeListener('hLabelExit', this.hideTip); 
    this.emitter.removeListener('legendClicked', this.onLegendClick);
    this.emitter.removeListener('legendHovered', this.onLegendHover);
    this.emitter.removeListener('legendLeaved', this.onLegendLeave);
    this.emitter.removeListener('onZoomout', this.onZoomout);
  }

  render() {
    return (
      <g>
        <Style src={this.getStyle()}></Style> 
        <g>
          <Draggable>
            <text class='txt-title-grp' text-rendering='geometricPrecision'>
              <tspan text-anchor='middle' class='txt-title' x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight - 30)}>{this.CHART_OPTIONS.title}</tspan>
              <tspan text-anchor='middle' class='txt-subtitle'x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight)}>{this.CHART_OPTIONS.subtitle}</tspan>
            </text>
          </Draggable>
        </g>
        
        <Grid opts={this.CHART_OPTIONS.grid || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} 
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} 
          vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
        </Grid> 

        <VerticalLabels  opts={this.state.cs.dataSet.yAxis || {}}
          posX={this.CHART_DATA.marginLeft - 10} posY={this.CHART_DATA.marginTop} maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin} valueInterval={this.state.cs.valueInterval}
          labelCount={this.state.hGridCount} intervalLen={this.state.gridHeight} maxWidth={this.CHART_DATA.vLabelWidth} >
        </VerticalLabels> 

        <HorizontalLabels opts={this.state.cs.dataSet.xAxis || {}}
          posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight} 
          maxWidth={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} maxHeight={this.CHART_DATA.hLabelHeight}
          categorySet = {this.state.cs.dataSet.xAxis.categories} paddingX={this.CHART_DATA.paddingX}
          clip={{
            x: this.state.offsetLeftChange,
            width: this.CHART_DATA.gridBoxWidth
          }} >
        </HorizontalLabels>   

        <TextBox class="sc-vertical-axis-title" posX={20} posY={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight/2))}
          transform={`rotate(${-90})`} background={(this.CHART_OPTIONS.bgColor == 'none' || this.CHART_OPTIONS.bgColor == undefined) ? "#fff" : this.CHART_OPTIONS.bgColor}
          fill={defaultConfig.theme.fontColorDark} borderRadius={15} padding={10} stroke="none" text={this.CHART_OPTIONS.dataSet.yAxis.title} />

        <TextBox class="sc-horizontal-axis-title" posX={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth/2))} posY={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + (this.CHART_DATA.hLabelHeight/2) + 15)}
          background={(this.CHART_OPTIONS.bgColor == 'none' || this.CHART_OPTIONS.bgColor == undefined) ? "#fff" : this.CHART_OPTIONS.bgColor}
          fill={defaultConfig.theme.fontColorDark} borderRadius={15} padding={10} stroke="none" text={this.CHART_OPTIONS.dataSet.xAxis.title} />

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

        { this.CHART_OPTIONS.horizontalScroller.enable && this.CHART_OPTIONS.horizontalScroller.chartInside && 
          this.drawHScrollSeries(this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight+2)
        }

        { this.CHART_OPTIONS.horizontalScroller.enable &&
          <HorizontalScroller opts={this.CHART_OPTIONS.horizontalScroller || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight} 
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height} leftOffset={this.state.leftOffset} rightOffset={this.state.rightOffset}
            svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight}> 
          </HorizontalScroller>
        }

        { this.CHART_OPTIONS.horizontalScroller.enable && (this.state.hScrollLeftOffset !== 0 || this.state.hScrollRightOffset !== 100) &&
          <ZoomoutBox posX={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth - this.CHART_DATA.zoomOutBoxWidth} posY={this.CHART_DATA.marginTop} 
            width={this.CHART_DATA.zoomOutBoxWidth} height={this.CHART_DATA.zoomOutBoxHeight} >
          </ZoomoutBox>
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
        <AreaFill dataSet={series.valueSet} index={series.index} instanceId={'cs' + series.index} posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} height={this.CHART_DATA.gridBoxHeight} maxSeriesLen={this.state.maxSeriesLen} areaFillColor={series.bgColor || UtilCore.getColor(i)} lineFillColor={series.bgColor || UtilCore.getColor(i)} 
          gradient={typeof series.gradient == 'undefined' ? true : series.gradient} strokeOpacity={series.lineOpacity || 1} opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={typeof series.marker == 'undefined' ? true : series.marker} markerRadius={series.markerRadius || 6} centerSinglePoint={isBothSinglePoint} lineStrokeWidth={series.lineWidth || 1.5} areaStrokeWidth={0}
          maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin} dataPoints={true} animate={series.animate == undefined ? true : !!series.animate} shouldRender={true}
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

  drawHScrollSeries(marginLeft, marginTop) {
    return this.state.fs.dataSet.series.filter(d => d.data.length > 0).map((series) => {
      let clipId = 'clip-fs-'+ series.index; 
      let clip = {
        x: (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollLeftOffset/100, 
        width: (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollRightOffset/100 - (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth)*this.state.hScrollLeftOffset/100
      };
      return (
      <g class='sc-fs-chart-area-container'>
        <AreaFill dataSet={series.valueSet} index={series.index} instanceId={'fs-'+ series.index}  posX={marginLeft} posY={marginTop} paddingX={0} 
          width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor="#ddd" lineFillColor="#ddd" 
          gradient={false} opacity="1" spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={false} markerRadius="0" centerSinglePoint={false} lineStrokeWidth={0} areaStrokeWidth={1}
          maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false} animate={false} shouldRender={this.state.shouldFSRender}
          getScaleX={(scaleX) => { this.state.fs.scaleX = scaleX;}}>
        </AreaFill>
        <AreaFill dataSet={series.valueSet} index={series.index} instanceId={'fs-clip-'+ series.index}  posX={marginLeft} posY={marginTop} paddingX={0} 
          width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor="#8c4141" lineFillColor="#8c4141" 
          gradient={false} opacity="1" spline={typeof series.spline === 'undefined' ? true : series.spline} 
          marker={false} markerRadius="0" centerSinglePoint={false} lineStrokeWidth={0} areaStrokeWidth='1'
          maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false} animate={false} shouldRender={this.state.shouldFSRender}
          clipId={clipId}>
        </AreaFill>
        <defs>
          <clipPath id={clipId}>
            <rect x={clip.x} y={0} width={clip.width} height={this.CHART_OPTIONS.horizontalScroller.height} />
          </clipPath>
        </defs>
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
    this.calcOffsetChanges(); 
    this.update();
  }

  onZoomout(e) {
    this.state.windowLeftIndex = 0; 
    this.state.windowRightIndex = this.state.maxSeriesLenFS-1; 
    this.state.hScrollLeftOffset = 0; 
    this.state.hScrollRightOffset = 100;
    this.state.clipLeftOffset = 0;
    this.state.clipRightOffset = 100;
    this.prepareDataSet();
    this.calcOffsetChanges(); 
    this.update(); 
    this.emitter.emit('onScrollReset'); 
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
    let formattedLabel = point.label;
    let formattedValue = UiCore.formatTextValue(point.value);
    if(this.state.cs.dataSet.yAxis && this.state.cs.dataSet.yAxis.prefix) {
      formattedValue = this.state.cs.dataSet.yAxis.prefix + formattedValue;
    }
    if(this.state.cs.dataSet.xAxis && this.state.cs.dataSet.xAxis.parseAsDate) {
      formatedLabel = dateFormat(formattedLabel, this.state.cs.dataSet.xAxis.dateFormat || defaultConfig.formatting.dateFormat);
    }
    let hPoint = {
      x: e.highlightedPoint.x,
      y: e.highlightedPoint.y,
      label: point.label,
      formattedLabel: formattedLabel,
      value: point.value,
      formattedValue: formattedValue,
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

  onHighlightPointMarker(e) {
    if(!this.eventStream[e.timeStamp] ) {
      this.eventStream[e.timeStamp] = [e]; 
    } else {
      this.eventStream[e.timeStamp].push(e); 
    }
    //consume events when all events are received
    if(this.eventStream[e.timeStamp].length === this.state.cs.dataSet.series.filter(s => s.data.length > 0).length) {
      for(let evt of this.eventStream[e.timeStamp]) {
        if(!evt.highlightedPoint || evt.highlightedPoint.pointIndex === null) {
          continue; 
        }
        this.pointData.push(this.consumeEvents(evt));
      }
      if(this.pointData.length && !this.prevOriginPoint || (this.originPoint && (this.originPoint.x !== this.prevOriginPoint.x || this.originPoint.y !== this.prevOriginPoint.y))) {
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
    return ({
      "*": {
        "outline":"none"
      },
      ".txt-title-grp .txt-title": {
        "font-family": (this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fontFamily) || defaultConfig.theme.fontFamily,
        "font-size": UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 20, (this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.maxFontSize) || 25)+'px',
        "fill":(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fillColor) || defaultConfig.theme.fontColorDark,
        "stroke": (this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.borderColor) || 'none'
      },
      ".txt-title-grp .txt-subtitle": {
        "font-family": (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fontFamily) || defaultConfig.theme.fontFamily,
        "font-size": UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.maxFontSize) || 18)+'px',
        "fill": (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fillColor) || defaultConfig.theme.fontColorDark,
        "stroke": (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.borderColor) || 'none'
      },
      ".sc-vertical-axis-title, .sc-horizontal-axis-title": {
        "font-size": UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14)+'px'
      }
    });
  }
}

export default AreaChart; 
