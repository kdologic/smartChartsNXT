'use strict';

import { OPTIONS_TYPE as ENUMS, CHART_TYPE } from './../../settings/globalEnums';
import Point from './../../core/point';
import { Component } from './../../viewEngin/pview';
import crossfilter from 'crossfilter2';
import defaultConfig from './../../settings/config';
import utilCore from './../../core/util.core';
import uiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';
import Draggable from './../../components/draggable';
import LegendBox from './../../components/legendBox';
import Heading from './../../components/heading';
import TextBox from './../../components/textBox';
import Grid from './../../components/grid';
import AxisBar from './../../components/axisBar';
import PointerCrosshair from './../../components/pointerCrosshair';
import DrawConnectedPoints from './drawConnectedPoints';
import VerticalLabels from './../../components/verticalLabels';
import HorizontalLabels from './../../components/horizontalLabels';
import HorizontalScroller from './../../components/horizontalScroller';
import ZoomoutBox from './../../components/zoomOutBox';
import Tooltip from './../../components/tooltip';
import InteractivePlane from './interactivePlane';
import StoreManager from './../../liveStore/storeManager';
import SeriesLabel from './../../components/seriesLabel';
import a11yFactory from './../../core/a11y';


/**
 * connectedPointBase.js
 * @createdOn:31-May-2016
 * @author:SmartChartsNXT
 * @description: Base component for connected point charts. Common component to draw area chart, line chart, step chart, etc.
 * @extends Component
 */

class ConnectedPointBase extends Component {
  constructor(props) {
    super(props);
    try {
      let self = this;
      this.a11yWriter = a11yFactory.getWriter(this.context.runId);
      this.CHART_DATA = utilCore.extends({
        chartCenter: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        gridBoxWidth: 0,
        gridBoxHeight: 0,
        titleTop: 20,         // Default x position of title from top
        subtitleTop: 50,      // Default x position of subtitle from top
        legendTop: 70,
        hLabelHeight: 80,
        vLabelWidth: 70,
        paddingX: 5,
        longestSeries: 0,
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, this.props.chartData);

      this.CHART_OPTIONS = utilCore.extends({
        title: {
          top: this.CHART_DATA.titleTop,
          textColor: defaultConfig.theme.fontColorDark,
          borderColor: 'none',
          fontFamily: defaultConfig.theme.fontFamily,
          fontSize: defaultConfig.theme.fontSizeLarge,
          responsive: {
            wrapText: true
          }
        },
        subtitle: {
          top: this.CHART_DATA.subtitleTop,
          textColor: defaultConfig.theme.fontColorDark,
          borderColor: 'none',
          fontFamily: defaultConfig.theme.fontFamily,
          fontSize: defaultConfig.theme.fontSizeMedium,
          responsive: {
            wrapText: true
          }
        },
        dataSet: {
          xAxis: { title: 'Label-axis' },
          yAxis: { title: 'Value-axis', zeroBase: false }
        },
        horizontalScroller: {
          enable: true,
          height: 35,
          chartInside: true
        },
        tooltip: {
          enable: true,
          followPointer: false,
          grouped: true,
          pointerVicinity: 50
        },
        zoomWindow: {}
      }, this.props.chartOptions);

      this.CHART_CONST = utilCore.extends({}, this.props.chartConst);

      this.processTurboData();

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
          this.leftOffset = this.maxSeriesLenFS <= 1 ? 0 : index * 100 / (this.maxSeriesLenFS - 1);
        },
        get windowLeftIndex() {
          return this._windowLeftIndex;
        },
        set windowRightIndex(index) {
          this._windowRightIndex = index;
          this.rightOffset = this.maxSeriesLenFS <= 1 ? 0 : index * 100 / (this.maxSeriesLenFS - 1);
        },
        get windowRightIndex() {
          return this._windowRightIndex;
        },
        hGridCount: 6,
        gridHeight: 0,
        cs: {
          maxima: 0,
          minima: 0,
          valueInterval: 0,
          yInterval: {},
          scaleX: 0,
          dataSet: undefined
        },
        fs: {
          maxima: 0,
          minima: 0,
          valueInterval: 0,
          yInterval: {},
          dataSet: undefined
        },
        hScrollLeftOffset: 0,
        hScrollRightOffset: 100,
        clipLeftOffset: 0,
        clipRightOffset: 100,
        offsetLeftChange: 0,
        offsetRightChange: 0,
        shouldFSRender: this.props.globalRenderAll
      };

      this.legendBoxType = this.props.chartOptions.legends ? (this.props.chartOptions.legends.alignment || 'horizontal') : 'horizontal';
      this.legendBoxFloat = this.props.chartOptions.legends ? (this.props.chartOptions.legends.float || 'none') : 'none';
      this.pointData = [];
      this.originPoint;
      this.prevOriginPoint;
      this.eventStream = {};
      this.scrollWindowClipId = utilCore.getRandomID();
      this.scrollOffsetClipId = utilCore.getRandomID();
      this.emitter = eventEmitter.getInstance(this.context.runId);
      this.store = StoreManager.getStore(this.context.runId);
      this.onHScroll = this.onHScroll.bind(this);
      this.onHighlightPointMarker = this.onHighlightPointMarker.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.updateLabelTip = this.updateLabelTip.bind(this);
      this.hideTip = this.hideTip.bind(this);
      this.onLegendClick = this.onLegendClick.bind(this);
      this.onLegendHover = this.onLegendHover.bind(this);
      this.onLegendLeave = this.onLegendLeave.bind(this);
      this.onLegendRendered = this.onLegendRendered.bind(this);
      this.onZoomout = this.onZoomout.bind(this);

      this.init();

      /* For accessibility */
      this.srLenAccId = utilCore.getRandomID();
      this.hLabelAccId = utilCore.getRandomID();
      this.vLabelAccId = utilCore.getRandomID();
      this.a11yWriter.createSpace(this.srLenAccId, this.hLabelAccId, this.vLabelAccId);
      this.a11yWriter.write(this.srLenAccId, '<div aria-hidden="false">Chart draws ' + this.CHART_DATA.dataSet.series.length + ' data series.</div>');
      this.a11yWriter.write(this.hLabelAccId, '<div aria-hidden="false">Chart has 1 X axis displaying ' + (this.CHART_DATA.dataSet.xAxis.title || 'values') + '.</div>', false);
      this.a11yWriter.write(this.vLabelAccId, '<div aria-hidden="false">Chart has 1 Y axis displaying ' + (this.CHART_DATA.dataSet.yAxis.title || 'values') + '.</div>', false);
    } catch (ex) {
      ex.errorIn = `Error in ${this.context.chartType} with runId:${this.context.runId}`;
      throw ex;
    }
  }

  init() {
    if (!this.CHART_OPTIONS.horizontalScroller.enable) {
      this.CHART_OPTIONS.horizontalScroller.height = 0;
    }
    this.minWidth = this.CHART_DATA.minWidth;
    this.minHeight = this.CHART_DATA.minHeight;

    const defaultMargins = {
      left: 100,
      right: 20,
      top: 120,
      bottom: this.CHART_OPTIONS.horizontalScroller.height + 90
    };

    this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
    this.CHART_DATA.marginLeft = !this.CHART_DATA.marginLeft ? defaultMargins.left : this.CHART_DATA.marginLeft;
    this.CHART_DATA.marginRight = !this.CHART_DATA.marginRight ? defaultMargins.right : this.CHART_DATA.marginRight;
    this.CHART_DATA.marginTop = !this.CHART_DATA.marginTop ? defaultMargins.top : this.CHART_DATA.marginTop;
    this.CHART_DATA.marginBottom = !this.CHART_DATA.marginBottom ? this.CHART_OPTIONS.horizontalScroller.height + defaultMargins.bottom : this.CHART_DATA.marginBottom;

    if (this.CHART_DATA.dataSet.yAxis.labelAlign === ENUMS.HORIZONTAL_ALIGN.LEFT && this.CHART_DATA.marginLeft === defaultMargins.left) {
      this.CHART_DATA.marginLeft = defaultMargins.left - this.CHART_DATA.vLabelWidth;
    }

    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;

    for (let index = 0; index < this.CHART_DATA.dataSet.series.length; index++) {
      if (this.CHART_DATA.dataSet.series[index].visible == undefined) {
        this.CHART_DATA.dataSet.series[index].visible = true;
      }
    }

    if (this.state.fs.scaleX && this.state.cs.scaleX) {
      this.calcOffsetChanges();
    }

    if (this.state.windowLeftIndex < 0 && this.state.windowRightIndex < 0) {
      this.setWindowIndexes();
      this.state.clipLeftOffset = this.state.hScrollLeftOffset = this.state.leftOffset;
      this.state.clipRightOffset = this.state.hScrollRightOffset = this.state.rightOffset;
    }

    /* Prepare data set for Horizontal scroll */
    this.prepareDataSet(true);
    /* Prepare data set for chart area. */
    this.prepareDataSet();
  }

  setWindowIndexes() {
    if (this.CHART_OPTIONS.zoomWindow) {
      this.setLeftWindowIndex();
      this.setRightWindowIndex();
    } else {
      if (!this.CHART_OPTIONS.zoomWindow.leftIndex) {
        this.state.windowLeftIndex = 0;
      }
      if (!this.CHART_OPTIONS.zoomWindow.rightIndex) {
        this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
      }
    }
  }

  setLeftWindowIndex() {
    if (this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.leftIndex >= 0 && this.CHART_OPTIONS.zoomWindow.leftIndex < this.state.maxSeriesLen) {
      this.state.windowLeftIndex = this.CHART_OPTIONS.zoomWindow.leftIndex - 1;
    } else {
      this.state.windowLeftIndex = 0;
    }
  }

  setRightWindowIndex() {
    if (this.CHART_OPTIONS.zoomWindow.rightIndex && this.CHART_OPTIONS.zoomWindow.rightIndex >= this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.rightIndex <= this.state.maxSeriesLenFS) {
      this.state.windowRightIndex = this.CHART_OPTIONS.zoomWindow.rightIndex - 1;
    } else {
      this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
    }
  }

  beforeProcessTurboData() {
    this.CHART_DATA.dataSet = this.CHART_OPTIONS.dataSet;
    let categoryOpt = this.CHART_DATA.dataSet.xAxis.categories, categoryValues = [];
    let startFrom = 1, increaseBy = 1;
    let defaultOption = {
      value: [],
      startFrom: startFrom,
      increaseBy: increaseBy,
      parseAsDate: false,
      parseDateFormat: defaultConfig.formatting.parseDateFormat,
      displayDateFormat: defaultConfig.formatting.displayDateFormat
    };
    this.CHART_DATA.dataSet.xAxis.categories = { ...defaultOption };
    if (categoryOpt && categoryOpt instanceof Array) {
      this.CHART_DATA.dataSet.xAxis.categories.value = categoryValues = categoryOpt;
    } else if (categoryOpt && typeof categoryOpt === 'object') {
      this.CHART_DATA.dataSet.xAxis.categories = { ...defaultOption, ...categoryOpt };
      if (categoryOpt.value instanceof Array) {
        categoryValues = categoryOpt.value;
      }
      if (typeof categoryOpt.startFrom !== 'undefined') {
        if (categoryOpt.parseAsDate && utilCore.isDate(categoryOpt.startFrom, categoryOpt.parseDateFormat)) {
          startFrom = utilCore.dateFormat(categoryOpt.startFrom, categoryOpt.parseDateFormat || undefined);
        } else {
          startFrom = categoryOpt.startFrom;
        }
      }
      increaseBy = typeof categoryOpt.increaseBy !== 'undefined' && !isNaN(Number.parseFloat(increaseBy)) ? categoryOpt.increaseBy : increaseBy;
    }

    const resolveCategory = (data, index) => {
      let label, parseAsDate = this.CHART_DATA.dataSet.xAxis.categories.parseAsDate, parseDateFormat = this.CHART_DATA.dataSet.xAxis.categories.parseDateFormat;
      if (data !== null && typeof data === 'object') {
        if (typeof data.label !== 'undefined') {
          if (parseAsDate && utilCore.isDate(data.label, parseDateFormat)) {
            label = utilCore.dateFormat(data.label, parseDateFormat || undefined);
          } else {
            label = data.label;
          }
        }
      }
      if (label === undefined) {
        for (let s = 0; s < this.CHART_OPTIONS.dataSet.series.length; s++) {
          let series = this.CHART_OPTIONS.dataSet.series[s];
          if (series.data && series.data[index] && typeof series.data[index] === 'object' && typeof series.data[index].label !== 'undefined') {
            if (parseAsDate && utilCore.isDate(series.data[index].label, parseDateFormat)) {
              label = utilCore.dateFormat(series.data[index].label, parseDateFormat || undefined);
            } else {
              label = series.data[index].label;
            }
            break;
          }
        }
        if (label === undefined) {
          if (typeof categoryValues[index] !== 'undefined') {
            if (parseAsDate && utilCore.isDate(categoryValues[index], parseDateFormat)) {
              label = utilCore.dateFormat(categoryValues[index], parseDateFormat || undefined);
            } else {
              label = categoryValues[index];
            }
          } else {
            label = utilCore.isDate(startFrom) ? utilCore.dateFormat(startFrom + (index * increaseBy)) : startFrom + (index * increaseBy);
          }
        }
      }
      return label;
    };

    const dataMapFn = (data, index) => {
      let d = {};
      if (data !== null && typeof data === 'object') {
        d.value = data.value;
      } else {
        d.value = data;
      }
      d.label = resolveCategory(data, index);
      d.index = index;
      return d;
    };

    return dataMapFn;
  }

  processTurboData() {
    let dataMapFn = this.beforeProcessTurboData();
    for (let i = 0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
      this.CHART_DATA.dataSet.series[i].data = this.CHART_OPTIONS.dataSet.series[i].data.map(dataMapFn);
      this.CHART_DATA.dataSet.series[i].turboData = crossfilter(this.CHART_DATA.dataSet.series[i].data);
      this.CHART_DATA.dataSet.series[i].dataDimIndex = this.CHART_DATA.dataSet.series[i].turboData.dimension((d) => d.index);
      this.CHART_DATA.dataSet.series[i].dataDimValue = this.CHART_DATA.dataSet.series[i].turboData.dimension((d) => d.value);
    }
  }

  prepareDataSet(isFS = false) {
    let maxSet = [];
    let minSet = [];
    let categories = [];
    let dataFor = isFS ? 'fs' : 'cs';
    let dataSet = this.copyDataset(this.CHART_DATA.dataSet);
    if (!isFS) {
      for (let i = 0; i < this.CHART_DATA.dataSet.series.length; i++) {
        if (!dataSet.series[i].data.length) {
          dataSet.series[i].visible = false;
        } else if (!dataSet.series[i].visible) {
          dataSet.series[i].data = [];
        } else {
          dataSet.series[i].data = this.CHART_DATA.dataSet.series[i].dataDimIndex.bottom(this.state.windowRightIndex - this.state.windowLeftIndex + 1, this.state.windowLeftIndex);
        }
      }
    }
    for (let i = 0; i < dataSet.series.length; i++) {
      let data = dataSet.series[i].data;
      let minVal = data.length === 0 ? 0 : Number.MAX_SAFE_INTEGER;
      let maxVal = data.length === 0 ? 1 : Number.MIN_SAFE_INTEGER;
      let customizedMarkers = {};
      dataSet.series[i].valueSet = [];
      for (let j = 0, len = data.length; j < len; j++) {
        let v = data[j].value;
        minVal = (v < minVal) ? v : minVal;
        maxVal = (v > maxVal) ? v : maxVal;
        if (j > categories.length - 1) {
          categories.push(data[j].label);
        }
        if (data[j].marker) {
          customizedMarkers[j] = data[j].marker;
        }
        dataSet.series[i].valueSet.push(v);
      }
      maxSet.push(maxVal);
      minSet.push(minVal);
      dataSet.series[i].index = i;
      dataSet.series[i].lineWidth = typeof dataSet.series[i].lineWidth === 'undefined' ? 1.5 : dataSet.series[i].lineWidth;
      this.setSeriesColor(i, dataSet.series[i]);
      dataSet.series[i].customizedMarkers = customizedMarkers;
    }
    this.state[dataFor].dataSet = dataSet;
    this.state[dataFor].dataSet.xAxis.selectedCategories = categories;
    this.state[dataFor].maxima = Math.max(...maxSet);
    this.state[dataFor].minima = Math.min(...minSet);
    this.state[dataFor].yInterval = uiCore.calcIntervalByMinMax(this.state[dataFor].minima, this.state[dataFor].maxima, this.state[dataFor].dataSet.yAxis.zeroBase);
    ({ iVal: this.state[dataFor].valueInterval, iCount: this.state.hGridCount } = this.state[dataFor].yInterval);
    this.state.gridHeight = (this.CHART_DATA.gridBoxHeight / this.state.hGridCount);
  }

  setSeriesColor(index, series) {
    if (!series.lineColor && !series.areaColor) {
      series.lineColor = series.areaColor = utilCore.getColor(index);
    } else if (!series.lineColor) {
      series.lineColor = series.areaColor;
    } else if (!series.areaColor) {
      series.areaColor = series.lineColor;
    }
  }

  copyDataset(dataSet) {
    let data = {};
    for (let key in dataSet) {
      if (key === 'series') {
        data[key] = [];
        for (let i = 0; i < dataSet[key].length; i++) {
          let series = dataSet[key][i], s = {};
          for (let skey in series) {
            if (skey === 'data') {
              s[skey] = series.dataDimIndex.bottom(Infinity);
            } else if (['turboData', 'dataDimIndex', 'dataDimValue'].indexOf(skey) === -1) {
              s[skey] = utilCore.deepCopy(series[skey]);
            }
          }
          data[key].push(s);
        }
      } else {
        data[key] = utilCore.deepCopy(dataSet[key]);
      }
    }
    return data;
  }

  calcOffsetChanges() {
    if (!this.state.fs.scaleX) {
      this.state.fs.scaleX = (this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth) / (this.state.maxSeriesLenFS - 1);
    }
    let fsWidth = this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth;
    let leftOffsetDiff = this.state.hScrollLeftOffset - this.state.clipLeftOffset;
    let fsOffsetLeft = fsWidth * leftOffsetDiff / 100;
    this.state.offsetLeftChange = fsOffsetLeft / this.state.fs.scaleX * this.state.cs.scaleX;

    let rightOffsetDiff = this.state.clipRightOffset - this.state.hScrollRightOffset;
    let fsOffsetRight = fsWidth * rightOffsetDiff / 100;
    this.state.offsetRightChange = fsOffsetRight / this.state.fs.scaleX * this.state.cs.scaleX;
  }

  propsWillReceive(nextProps) {
    this.CHART_CONST = utilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = utilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = utilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions);
    this.state.shouldFSRender = nextProps.globalRenderAll;
    if (this.store.getValue('globalRenderAll')) {
      this.processTurboData();
      this.init();
      if (nextProps.chartOptions.zoomWindow && nextProps.chartOptions.zoomWindow.leftIndex && nextProps.chartOptions.zoomWindow.leftIndex - 1 !== this.state.windowLeftIndex) {
        this.setLeftWindowIndex();
      }
      if (nextProps.chartOptions.zoomWindow && nextProps.chartOptions.zoomWindow.rightIndex && nextProps.chartOptions.zoomWindow.rightIndex - 1 !== this.state.windowRightIndex) {
        this.setRightWindowIndex();
      }
      this.prepareDataSet();
      this.state.clipLeftOffset = this.state.leftOffset = this.state.hScrollLeftOffset = this.state.windowLeftIndex * 100 / (this.state.maxSeriesLenFS - 1);
      this.state.clipRightOffset = this.state.rightOffset = this.state.hScrollRightOffset = this.state.windowRightIndex * 100 / (this.state.maxSeriesLenFS - 1);
    } else {
      this.init();
    }
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
    this.emitter.on('legendRendered', this.onLegendRendered);
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
    this.emitter.removeListener('legendRendered', this.onLegendRendered);
    this.emitter.removeListener('onZoomout', this.onZoomout);
  }

  render() {
    return (
      <g>
        <Draggable instanceId='drag-132'>
          <Heading instanceId='sc-title' opts={this.CHART_OPTIONS.title} posX={this.CHART_DATA.svgWidth / 2} posY={uiCore.percentToPixel(this.CHART_DATA.svgHeight, this.CHART_OPTIONS.title.top)} width='90%' />
          <Heading instanceId='sc-subtitle' opts={this.CHART_OPTIONS.subtitle} posX={this.CHART_DATA.svgWidth / 2} posY={uiCore.percentToPixel(this.CHART_DATA.svgHeight, this.CHART_OPTIONS.subtitle.top)} width='95%' fontSize={defaultConfig.theme.fontSizeSmall} />
        </Draggable>

        <Grid opts={this.CHART_OPTIONS.gridBox || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight}
          vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
        </Grid>

        <AxisBar xAxis={this.state.cs.dataSet.xAxis || {}} yAxis={this.state.cs.dataSet.yAxis || {}}
          posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight}>
        </AxisBar>

        <TextBox class='sc-vertical-axis-title' posX={5} posY={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2))}
          transform={`rotate(${-90})`} bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={defaultConfig.theme.fontColorDark} bgOpacity={0.6}
          textAnchor='middle' borderRadius={1} padding={5} stroke='none' fontWeight='bold' text={this.CHART_DATA.dataSet.yAxis.title}
          style={{
            '.sc-vertical-axis-title': {
              'font-size': uiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
            }
          }} />

        <TextBox class='sc-horizontal-axis-title' posX={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2))} posY={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + (this.CHART_DATA.hLabelHeight / 2) + 5)}
          bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={defaultConfig.theme.fontColorDark} bgOpacity={0.6} borderRadius={1} padding={5} stroke='none'
          textAnchor='middle' fontWeight='bold' text={this.CHART_DATA.dataSet.xAxis.title}
          style={{
            '.sc-horizontal-axis-title': {
              'font-size': uiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
            }
          }} />

        <g class='sc-chart-area-container'>
          {this.drawSeries()}
        </g>

        <VerticalLabels opts={this.state.cs.dataSet.yAxis || {}}
          posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin} valueInterval={this.state.cs.valueInterval}
          labelCount={this.state.hGridCount} intervalLen={this.state.gridHeight} maxWidth={this.CHART_DATA.vLabelWidth} accessibilityId={this.vLabelAccId} >
        </VerticalLabels>

        <HorizontalLabels opts={this.state.cs.dataSet.xAxis || {}}
          posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight}
          maxWidth={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} maxHeight={this.CHART_DATA.hLabelHeight}
          categorySet={this.state.cs.dataSet.xAxis.selectedCategories} paddingX={this.CHART_DATA.paddingX} accessibilityId={this.hLabelAccId}
          clip={{
            x: this.state.offsetLeftChange,
            width: this.CHART_DATA.gridBoxWidth
          }} >
        </HorizontalLabels>

        {this.getSeriesLabel()}

        <PointerCrosshair hLineStart={this.CHART_DATA.marginLeft} hLineEnd={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth}
          vLineStart={this.CHART_DATA.marginTop} vLineEnd={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight}
          opts={this.CHART_OPTIONS.pointerCrosshair || {}}>
        </PointerCrosshair>

        {(!this.CHART_OPTIONS.legends || (this.CHART_OPTIONS.legends && this.CHART_OPTIONS.legends.enable !== false)) &&
          <Draggable instanceId='drag-135'>
            <LegendBox legendSet={this.getLegendData()} float={this.legendBoxFloat} left={this.CHART_DATA.marginLeft} top={this.CHART_DATA.legendTop} opts={this.CHART_OPTIONS.legends || {}}
              display='inline' type={this.legendBoxType} background='none'
              hoverColor='none' hideIcon={false} hideLabel={false} hideValue={false} toggleType={true} >
            </LegendBox>
          </Draggable>
        }

        {this.CHART_OPTIONS.horizontalScroller.enable &&
          <HorizontalScroller opts={this.CHART_OPTIONS.horizontalScroller || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height} leftOffset={this.state.leftOffset} rightOffset={this.state.rightOffset}
            offsetColor='#bbb' offsetClipId={this.scrollOffsetClipId} windowClipId={this.scrollWindowClipId} getRangeVal={this.getRangeVal.bind(this)} >
            {this.CHART_OPTIONS.horizontalScroller.enable && this.CHART_OPTIONS.horizontalScroller.chartInside &&
              this.drawHScrollSeries(0, 0)
            }
          </HorizontalScroller>
        }

        {this.CHART_OPTIONS.tooltip.enable &&
          <Tooltip instanceId='marker-tooltip' instanceCount={this.CHART_OPTIONS.tooltip.grouped ? 1 : this.state.cs.dataSet.series.filter(d => d.data.length > 0).length}
            opts={this.CHART_OPTIONS.tooltip || {}} grouped={this.CHART_OPTIONS.tooltip.grouped}
            svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} >
          </Tooltip>
        }

        <Tooltip instanceId='label-tooltip' instanceCount={1} grouped={false} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight}
          opts={{
            textColor: '#fff',
            bgColor: 'black',
            fontSize: 14,
            xPadding: 5,
            yPadding: 5,
            borderColor: 'none',
            borderWidth: 0
          }}>
        </Tooltip>

        <Tooltip instanceId='range-tooltip' instanceCount={2} grouped={false} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight}
          opts={{
            textColor: '#fff',
            bgColor: 'black',
            fontSize: 14,
            xPadding: 5,
            yPadding: 5,
            borderColor: 'none',
            borderWidth: 0
          }}>
        </Tooltip>

        <InteractivePlane posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} >
        </InteractivePlane>

        {this.CHART_OPTIONS.horizontalScroller.enable && (this.state.hScrollLeftOffset !== 0 || this.state.hScrollRightOffset !== 100) &&
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
      let seriesTotalDataCount = this.state.fs.dataSet.series.filter(s => s.index === series.index)[0].data.filter(v => v !== null).length;
      return (
        <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'cs-' + series.index} name={series.name} posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} height={this.CHART_DATA.gridBoxHeight} maxSeriesLen={this.state.maxSeriesLen} areaFillColor={series.areaColor} lineFillColor={series.lineColor} fillOptions={series.fillOptions || {}}
          lineDropShadow={this.context.chartType === CHART_TYPE.LINE_CHART && typeof series.dropShadow === 'undefined' ? true : series.dropShadow || false} strokeOpacity={series.lineOpacity || 1} opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline}
          marker={typeof series.marker === 'object' ? series.marker : {}} customizedMarkers={series.customizedMarkers || {}} centerSinglePoint={isBothSinglePoint} lineStrokeWidth={series.lineWidth} areaStrokeWidth={0} maxVal={this.state.cs.yInterval.iMax} minVal={this.state.cs.yInterval.iMin}
          dataPoints={true} dataLabels={series.dataLabels} seriesLabel={series.seriesLabel} animated={series.animated == undefined ? true : !!series.animated} shouldRender={true} tooltipOpt={this.CHART_OPTIONS.tooltip} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={this.state.cs.dataSet.yAxis}
          totalSeriesCount={this.state.fs.dataSet.series.length} totalDataCount={seriesTotalDataCount} accessibility={true} accessibilityText={series.a11y ? series.a11y.description || '' : ''}
          getScaleX={(scaleX) => {
            this.state.cs.scaleX = scaleX;
          }}
          clip={{
            x: this.state.offsetLeftChange + this.CHART_DATA.paddingX,
            width: this.CHART_DATA.gridBoxWidth - (2 * this.CHART_DATA.paddingX),
            offsetLeft: this.state.offsetLeftChange,
            offsetRight: this.state.offsetRightChange
          }}
        >
        </DrawConnectedPoints>
      );
    });
  }

  drawHScrollSeries(marginLeft, marginTop) {
    return this.state.fs.dataSet.series.filter(d => d.data.length > 0).map((series) => {
      return (
        <g class='sc-fs-chart-area-container'>
          <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'fs-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#efefef' lineFillColor='#dedede' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} areaStrokeWidth={1}
            maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false} dataLabels={false} seriesLabel={false} animated={false} shouldRender={this.state.shouldFSRender} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={this.state.cs.dataSet.yAxis} accessibility={false}
            getScaleX={(scaleX) => {
              this.state.fs.scaleX = scaleX;
            }}
            clipId={this.scrollOffsetClipId}>
          </DrawConnectedPoints>
          <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'fs-clip-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#cccccc' lineFillColor='#777' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} lineDropShadow={false} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} areaStrokeWidth={1}
            maxVal={this.state.fs.yInterval.iMax} minVal={this.state.fs.yInterval.iMin} dataPoints={false} dataLabels={false} seriesLabel={false} animated={false} shouldRender={this.state.shouldFSRender} clipId={this.scrollWindowClipId} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={this.state.cs.dataSet.yAxis} accessibility={false}>
          </DrawConnectedPoints>
        </g>
      );
    });
  }

  getSeriesLabel() {
    this.store.removeValue('seriesLabelData');
    return this.state.cs.dataSet.series.map((series) => {
      if (series.data.length > 0 && series.seriesLabel && (typeof series.seriesLabel.enable === 'undefined' || series.seriesLabel.enable === true)) {
        return (
          <SeriesLabel instanceId={'sl-' + series.index} seriesName={series.name} seriesId={'cs-' + series.index} opts={series.seriesLabel}
            posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} textColor={series.lineColor || series.areaColor} borderColor={series.lineColor || series.areaColor}
            clip={{
              x: this.state.offsetLeftChange + this.CHART_DATA.paddingX,
              width: this.CHART_DATA.gridBoxWidth - (2 * this.CHART_DATA.paddingX),
              offsetLeft: this.state.offsetLeftChange,
              offsetRight: this.state.offsetRightChange
            }} />
        );
      } else {
        return <g></g>;
      }
    });
  }

  onHScroll(e) {
    let leftIndex = Math.floor((this.state.maxSeriesLenFS - 1) * e.leftOffset / 100);
    let rightIndex = Math.ceil((this.state.maxSeriesLenFS - 1) * e.rightOffset / 100);
    let hScrollIntervalPercent = 100 / (this.state.maxSeriesLenFS - 1);
    this.state.hScrollLeftOffset = e.leftOffset;
    this.state.hScrollRightOffset = e.rightOffset;

    if (this.state.windowLeftIndex != leftIndex || this.state.windowRightIndex != rightIndex) {
      if (leftIndex > this.state.windowLeftIndex) {
        this.state.clipLeftOffset += (leftIndex - this.state.windowLeftIndex) * hScrollIntervalPercent;
      } else if (leftIndex < this.state.windowLeftIndex) {
        this.state.clipLeftOffset -= (this.state.windowLeftIndex - leftIndex) * hScrollIntervalPercent;
      }
      if (rightIndex > this.state.windowRightIndex) {
        this.state.clipRightOffset += (rightIndex - this.state.windowRightIndex) * hScrollIntervalPercent;
      } else if (rightIndex < this.state.windowRightIndex) {
        this.state.clipRightOffset -= (this.state.windowRightIndex - rightIndex) * hScrollIntervalPercent;
      }
      this.state.windowLeftIndex = leftIndex;
      this.state.windowRightIndex = rightIndex;
      this.prepareDataSet();
    }
    this.emitter.emit('onUpdateRangeVal', {
      rangeTipPoints: this.getRangeVal(e.leftHandlePos, e.rightHandlePos)
    });
    this.calcOffsetChanges();
    this.update();
  }

  getRangeVal(leftHandlePos, rightHandlePos) {
    const leftRangePoint = new Point(leftHandlePos.x - this.CHART_DATA.marginLeft, leftHandlePos.y - 5);
    const rightRangePoint = new Point(rightHandlePos.x - this.CHART_DATA.marginLeft, rightHandlePos.y - 5);
    const xAxis = this.state.cs.dataSet.xAxis;
    if (!xAxis.selectedCategories.length) {
      leftRangePoint.value = undefined;
      rightRangePoint.value = undefined;
      return [leftRangePoint, rightRangePoint];
    }
    let lRangeVal = xAxis.selectedCategories[0];
    lRangeVal = xAxis.categories.parseAsDate && utilCore.isDate(lRangeVal) ? utilCore.dateFormat(lRangeVal).format(xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat) : lRangeVal;
    leftRangePoint.value = (xAxis.prepend ? xAxis.prepend : '') + lRangeVal + (xAxis.append ? xAxis.append : '');

    let rRangeVal = xAxis.selectedCategories[xAxis.selectedCategories.length - 1];
    rRangeVal = xAxis.categories.parseAsDate && utilCore.isDate(rRangeVal) ? utilCore.dateFormat(rRangeVal).format(xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat) : rRangeVal;
    rightRangePoint.value = (xAxis.prepend ? xAxis.prepend : '') + rRangeVal + (xAxis.append ? xAxis.append : '');
    return [leftRangePoint, rightRangePoint];
  }

  onZoomout() {
    this.state.windowLeftIndex = 0;
    this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
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
    this.emitter.emitSync('updateTooltip', {
      instanceId: 'label-tooltip',
      originPoint: uiCore.cursorPoint(this.context.rootContainerId, e),
      pointData: undefined,
      line1: e.labelText,
      line2: undefined
    });
  }

  consumeEvents(e) {
    let series = this.state.cs.dataSet.series[e.highlightedPoint.seriesIndex];
    let point = series.data[e.highlightedPoint.pointIndex];
    let formattedLabel = point.label;
    let formattedValue = uiCore.formatTextValue(point.value);
    if (this.state.cs.dataSet.yAxis && this.state.cs.dataSet.yAxis.prefix) {
      formattedValue = this.state.cs.dataSet.yAxis.prefix + formattedValue;
    }
    if (this.state.cs.dataSet.xAxis && this.state.cs.dataSet.xAxis.categories.parseAsDate && utilCore.isDate(formattedLabel)) {
      formattedLabel = utilCore.dateFormat(formattedLabel).format(this.state.cs.dataSet.xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat);
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
      lineColor: series.lineColor,
      areaColor: series.areaColor,
      dist: e.highlightedPoint.dist
    };

    if (this.originPoint) {
      this.originPoint = new Point(e.highlightedPoint.x, (e.highlightedPoint.y + this.originPoint.y) / 2);
    } else {
      this.originPoint = new Point(e.highlightedPoint.x, e.highlightedPoint.y);
    }
    return hPoint;
  }

  onHighlightPointMarker(e) {
    if (!this.eventStream[e.timeStamp]) {
      this.eventStream[e.timeStamp] = [e];
    } else {
      this.eventStream[e.timeStamp].push(e);
    }
    //consume events when all events are received
    if (this.eventStream[e.timeStamp].length === this.state.cs.dataSet.series.filter(s => s.data.length > 0).length) {
      for (let evt of this.eventStream[e.timeStamp]) {
        if (!evt.highlightedPoint || evt.highlightedPoint.pointIndex === null) {
          continue;
        }
        this.pointData.push(this.consumeEvents(evt));
      }
      if (this.pointData.length && !this.prevOriginPoint || (this.originPoint && (this.originPoint.x !== this.prevOriginPoint.x || this.originPoint.y !== this.prevOriginPoint.y))) {
        this.updateDataTooltip(this.originPoint, this.pointData);
        this.updateCrosshair(this.pointData);
      }
      if (!this.pointData.length) {
        this.hideTip();
      }
      this.pointData = [];
      this.prevOriginPoint = this.originPoint;
      this.originPoint = undefined;
      delete this.eventStream[e.timeStamp];
    }
  }

  onMouseLeave() {
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
    if (this.CHART_OPTIONS.tooltip && typeof this.CHART_OPTIONS.tooltip.content === 'object') {
      this.emitter.emitSync('updateTooltip', {
        instanceId: 'marker-tooltip',
        originPoint,
        pointData,
        content: {
          header: this.CHART_OPTIONS.tooltip.content.header || this.getTooltipHeader,
          body: this.CHART_OPTIONS.tooltip.content.body || this.getTooltipBody,
          footer: this.CHART_OPTIONS.tooltip.content.footer || this.getTooltipFooter
        },
        line1: undefined, line2: undefined, preAlign: 'left'
      });
    } else {
      this.emitter.emitSync('updateTooltip', {
        instanceId: 'marker-tooltip',
        originPoint,
        pointData,
        content: {
          header: this.getTooltipHeader,
          body: this.getTooltipBody,
          footer: this.getTooltipFooter
        },
        line1: undefined, line2: undefined, preAlign: 'left'
      });
    }
  }

  getTooltipHeader(pointSet, index, tipConfig) {
    return (
      `<p style='background-color:${tipConfig.headerBgColor || '#555'}; font-size: ${defaultConfig.theme.fontSizeLarge}px; text-align: left; color: ${tipConfig.headerTextColor || '#fff'};margin:0;padding: 3px 5px;'>
        ${pointSet[index].formattedLabel}
      </p>`
    );
  }

  getTooltipBody(pointSet, index, tipConfig) {
    let point = pointSet[index];
    return (
      `<tr  style='font-size: ${tipConfig.fontSize || defaultConfig.theme.fontSizeMedium}px; padding: 3px 6px; color:${tipConfig.textColor || '#000'};'>
        <td>
          <span style='background-color:${point.areaColor}; display:inline-block; width:10px; height:10px;margin-right:5px;'></span>${point.seriesName}
        </td>
        <td>${point.value}</td>
      </tr>`
    );
  }

  getTooltipFooter() {
    return '';
  }

  hideTip(e) {
    this.emitter.emitSync('hideTooltip', e);
    this.updateCrosshair(null);
  }

  onLegendRendered(e) {
    if (e.float === ENUMS.FLOAT.NONE) {
      const newMarginTop = e.bBox.y + e.bBox.height + 10;
      if (this.CHART_DATA.marginTop !== newMarginTop) {
        this.CHART_DATA.marginTop = newMarginTop;
        this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
        this.prepareDataSet();
        this.update();
      }
    }
  }

  onLegendClick(e) {
    this.CHART_DATA.dataSet.series[e.index].visible = !this.CHART_DATA.dataSet.series[e.index].visible;
    this.prepareDataSet();
    this.update();
  }

  onLegendHover(e) {
    this.state.cs.dataSet.series.forEach((s, i) => {
      this.emitter.emit('changeAreaBrightness', {
        instanceId: 'cs' + i,
        strokeOpacity: i == e.index ? 1 : 0.2,
        opacity: i == e.index ? 1 : 0.1
      });
    });
  }

  onLegendLeave() {
    this.state.cs.dataSet.series.forEach((s, i) => {
      this.emitter.emit('changeAreaBrightness', {
        instanceId: 'cs' + i,
        strokeOpacity: this.CHART_DATA.dataSet.series[i].lineOpacity || 1,
        opacity: this.CHART_DATA.dataSet.series[i].areaOpacity || 0.2
      });
    });
  }

  getLegendData() {
    return this.state.cs.dataSet.series.map((series) => {
      return {
        label: series.name,
        color: series.areaColor,
        icon: typeof series.marker === 'object' ? series.marker : {},
        isToggled: !series.visible
      };
    });
  }

}

export default ConnectedPointBase;