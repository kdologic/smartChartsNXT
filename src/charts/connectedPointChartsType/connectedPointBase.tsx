'use strict';

import { CHART_TYPE, ALIGNMENT, FLOAT, VERTICAL_ALIGN, HORIZONTAL_ALIGN, AXIS_TYPE, LINE_STYLE, DISPLAY, AXIS_PRIORITY } from '../../global/global.enums';
import Point, { RangePoint } from '../../core/point';
import { Component } from '../../viewEngin/pview';
import crossfilter from 'crossfilter2';
import defaultConfig from '../../settings/config';
import UtilCore from '../../core/util.core';
import UiCore from '../../core/ui.core';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import Draggable from '../../components/draggable/draggable.component';
import LegendBox from '../../components/legendBox/legendBox.component';
import Heading from '../../components/heading/heading.component';
import TextBox from '../../components/textBox/textBox.component';
import Grid from '../../components/grid/grid.component';
import MarkRegion from '../../components/markRegion/markRegion.component';
import AxisBar from '../../components/axisBar/axisBar.component';
import PointerCrosshair from '../../components/pointerCrosshair/pointerCrosshair.component';
import DrawConnectedPoints from './drawConnectedPoints/drawConnectedPoints.component';
import VerticalLabels from '../../components/verticalLabels/verticalLabels.component';
import HorizontalLabels from '../../components/horizontalLabels/horizontalLabels.component';
import HorizontalScroller from '../../components/horizontalScroller/horizontalScroller.component';
import ZoomoutBox from '../../components/zoomOutBox/zoomOutBox.component';
import Tooltip from '../../components/tooltip/tooltip.component';
import InteractivePlane from './interactivePlane/interactivePlane.component';
import StoreManager from '../../liveStore/storeManager';
import SeriesLabel from '../../components/seriesLabel/seriesLabel.component';
import AnnotationLabels from '../../components/annotationLabels/annotationLabels.component';
import a11yFactory, { A11yWriter } from '../../core/a11y';
import { IObject } from '../../viewEngin/pview.model';
import Store from '../../liveStore/store';
import { IHighlightedPoint, IValueCategory, IConnectedPointChartConfig, IConnectedPointData, ILabelValue, IYAxisConfig, ISeriesConfig, IConnectedPointDataSet, IMarkerIcon, IConnectedPointChartProps, IBoundingBox, CategoryLabelType, ISeriesData, ILabelValueArr, ITooltipConfig, ILegendsConfig } from './connectedPointChartsType.model';
import { Dayjs } from 'dayjs';
import { ILegendOptions } from '../../components/legendBox/legendBox.model';
import { IHighlightPointMarkerEvent } from '../../components/dataPoints/dataPoints.model';
import { IHorizontalLabelHoverEvent } from '../../components/horizontalLabels/horizontalLabels.model';
import { IVerticalLabelHoverEvent } from '../../components/verticalLabels/verticalLabels.model';
import { HIGHLIGHT_EVENT_TYPE } from './drawConnectedPoints/drawConnectedPoints.model';
import { IVnode } from '../../viewEngin/component.model';
import { HeadingTypeMap } from '../../components/heading/heading.model';
import { IHScrollOffsetEvent } from '../../components/horizontalScroller/horizontalScroller.model';
import { IDimensionBox } from '../../global/global.models';

/**
 * connectedPointBase.js
 * @createdOn:31-May-2016
 * @author:SmartChartsNXT
 * @description: Base component for connected point charts. Common component to draw area chart, line chart, step chart, etc.
 * @extends Component
 */

class ConnectedPointBase extends Component<IConnectedPointChartProps> {
  private a11yWriter: A11yWriter;
  private CHART_DATA: IObject;
  private CHART_OPTIONS: IConnectedPointChartConfig;
  private CHART_CONST: IObject;
  private yAxisDefaults: IYAxisConfig;
  private defaultMargins: IBoundingBox;
  private store: Store;
  private emitter: CustomEvents;
  private legendBoxType: ALIGNMENT;
  private legendBoxFloat: FLOAT;
  private pointData: IHighlightedPoint[] = [];
  private originPoint: Point;
  private prevOriginPoint: Point;
  private eventStream: { [timeStamp: number]: IHighlightPointMarkerEvent[] } = {};
  private scrollWindowClipId = UtilCore.getRandomID();
  private scrollOffsetClipId = UtilCore.getRandomID();
  private srLenAccId = UtilCore.getRandomID();
  private hLabelAccId = UtilCore.getRandomID();
  private vLabelAccId = UtilCore.getRandomID();

  constructor(props: IConnectedPointChartProps) {
    super(props);
    try {
      let self = this;
      this.a11yWriter = a11yFactory.getWriter((this as any).context.runId);
      this.CHART_DATA = UtilCore.extends({
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
        vLabelWidth: 60,
        paddingX: 10,
        longestSeries: 0,
        zoomOutBoxWidth: 40,
        zoomOutBoxHeight: 40
      }, props.chartData);

      this.yAxisDefaults = {
        type: AXIS_TYPE.LINEAR,
        title: 'Value-axis',
        zeroBase: false,
        labelAlign: HORIZONTAL_ALIGN.RIGHT,
        positionOpposite: false
      };

      this.CHART_OPTIONS = UtilCore.extends({
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
          xAxis: {
            type: AXIS_TYPE.LINEAR,
            title: 'Label-axis',
            labelAlign: VERTICAL_ALIGN.BOTTOM,
            positionOpposite: false
          },
          yAxis: this.yAxisDefaults
        },
        horizontalScroller: {
          enable: false,
          height: 35,
          chartInside: true
        },
        tooltip: {
          enable: true,
          followPointer: false,
          grouped: true,
          pointerVicinity: 50,
          anchorWidth: 0,
          anchorHeight: 10,
          borderWidth: 0,
          borderRadius: 10
        },
        zoomWindow: {}
      }, props.chartOptions) as IConnectedPointChartConfig;

      this.CHART_CONST = UtilCore.extends({}, this.props.chartConst);

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
        hGridCount: {
          [AXIS_PRIORITY.PRIMARY]: 6,
          [AXIS_PRIORITY.SECONDARY]: 6
        },
        gridHeight: {
          [AXIS_PRIORITY.PRIMARY]: 0,
          [AXIS_PRIORITY.SECONDARY]: 0
        },
        cs: {
          maxima: 0,
          minima: 0,
          [AXIS_PRIORITY.PRIMARY]: {
            yInterval: {},
            valueInterval: 0
          },
          [AXIS_PRIORITY.SECONDARY]: {
            yInterval: {},
            valueInterval: 0
          },
          scaleX: 0,
          dataSet: undefined
        },
        fs: {
          maxima: 0,
          minima: 0,
          [AXIS_PRIORITY.PRIMARY]: {
            yInterval: {},
            valueInterval: 0
          },
          [AXIS_PRIORITY.SECONDARY]: {
            yInterval: {},
            valueInterval: 0
          },
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

      this.defaultMargins = {
        left: 30,
        right: 30,
        top: 80,
        bottom: 10
      };

      this.legendBoxType = this.props.chartOptions.legends ? (this.props.chartOptions.legends.alignment || ALIGNMENT.HORIZONTAL) : ALIGNMENT.HORIZONTAL;
      this.legendBoxFloat = this.props.chartOptions.legends ? (this.props.chartOptions.legends.float || FLOAT.NONE) : FLOAT.NONE;
      this.emitter = eventEmitter.getInstance((this as any).context.runId);
      this.store = StoreManager.getStore((this as any).context.runId);
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
      this.a11yWriter.createSpace(this.srLenAccId, this.hLabelAccId, this.vLabelAccId);
      this.a11yWriter.write(this.srLenAccId, '<div aria-hidden="false">Chart draws ' + this.CHART_DATA.dataSet.series.length + ' data series.</div>');
      this.a11yWriter.write(this.hLabelAccId, '<div aria-hidden="false">Chart has 1 X axis displaying ' + (this.CHART_DATA.dataSet.xAxis.title || 'values') + '.</div>', false);
      this.a11yWriter.write(this.vLabelAccId, '<div aria-hidden="false">Chart has 1 Y axis displaying ' + (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].title || 'values') + '.</div>', false);
    } catch (ex) {
      ex.errorIn = `Error in ${(this as any).context.chartType} with runId:${(this as any).context.runId}`;
      throw ex;
    }
  }

  init() {
    if (!this.CHART_OPTIONS.horizontalScroller.enable) {
      this.CHART_OPTIONS.horizontalScroller.height = 0;
    }

    this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
    this.CHART_DATA.marginLeft = !this.CHART_DATA.marginLeft ? this.defaultMargins.left : this.CHART_DATA.marginLeft;
    this.CHART_DATA.marginRight = !this.CHART_DATA.marginRight ? this.defaultMargins.right : this.CHART_DATA.marginRight;
    this.CHART_DATA.marginTop = !this.CHART_DATA.marginTop ? this.defaultMargins.top : this.CHART_DATA.marginTop;
    this.CHART_DATA.marginBottom = this.CHART_OPTIONS.horizontalScroller.height + this.CHART_DATA.hLabelHeight + this.defaultMargins.bottom;

    if (this.CHART_DATA.dataSet.xAxis.positionOpposite && (this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.TOP && this.CHART_DATA.marginTop === this.defaultMargins.top)) {
      this.CHART_DATA.marginTop = this.defaultMargins.top + this.CHART_DATA.hLabelHeight;
    }

    if (this.CHART_DATA.dataSet.xAxis.positionOpposite) {
      this.CHART_DATA.marginBottom -= this.CHART_DATA.hLabelHeight;
    }

    if (this.CHART_DATA.dataSet.xAxis.positionOpposite === false && this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.TOP) {
      this.CHART_DATA.marginBottom -= this.CHART_DATA.hLabelHeight;
    }

    if (!this.CHART_OPTIONS.horizontalScroller.enable) {
      this.CHART_DATA.marginBottom -= this.CHART_OPTIONS.horizontalScroller.height;
    }

    if (!this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].positionOpposite && (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].labelAlign === HORIZONTAL_ALIGN.RIGHT && this.CHART_DATA.marginLeft === this.defaultMargins.left)) {
      this.CHART_DATA.marginLeft = this.defaultMargins.left + this.CHART_DATA.vLabelWidth;
    }

    if (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY] && !this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY].positionOpposite && (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY].labelAlign === HORIZONTAL_ALIGN.RIGHT)) {
      this.CHART_DATA.marginLeft = this.defaultMargins.left + this.CHART_DATA.vLabelWidth;
    }

    if (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].positionOpposite && (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].labelAlign === HORIZONTAL_ALIGN.LEFT && this.CHART_DATA.marginRight === this.defaultMargins.right)) {
      this.CHART_DATA.marginRight = this.defaultMargins.right + this.CHART_DATA.vLabelWidth;
    }

    if (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY] && this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY].positionOpposite && (this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.SECONDARY].labelAlign === HORIZONTAL_ALIGN.LEFT)) {
      this.CHART_DATA.marginRight = this.defaultMargins.right + this.CHART_DATA.vLabelWidth;
    }

    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;

    for (let series of this.CHART_DATA.dataSet.series) {
      if (series.visible === undefined) {
        series.visible = true;
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
    if (this.CHART_DATA.dataSet.yAxis instanceof Array) {
      let yAxis: IObject = {
        [AXIS_PRIORITY.PRIMARY]: this.yAxisDefaults,
        [AXIS_PRIORITY.SECONDARY]: undefined
      };
      if (this.CHART_DATA.dataSet.yAxis[0]) {
        yAxis[AXIS_PRIORITY.PRIMARY] = UtilCore.extends(yAxis[AXIS_PRIORITY.PRIMARY], this.CHART_DATA.dataSet.yAxis[0]);
      }
      if (this.CHART_DATA.dataSet.yAxis[1]) {
        yAxis[AXIS_PRIORITY.SECONDARY] = UtilCore.extends(this.yAxisDefaults, this.CHART_DATA.dataSet.yAxis[1]);
      }
      this.CHART_DATA.dataSet.yAxis = yAxis;
    } else {
      this.CHART_DATA.dataSet.yAxis = {
        primary: UtilCore.extends(this.yAxisDefaults, this.CHART_DATA.dataSet.yAxis)
      };
    }
    const categoryOpt = this.CHART_DATA.dataSet.xAxis.categories;
    let categoryValues: string[] = [];
    let startFrom: number | Dayjs = 1;
    let increaseBy: number = 1;
    let defaultOption: IValueCategory = {
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
        if (categoryOpt.parseAsDate && UtilCore.isDate(categoryOpt.startFrom, categoryOpt.parseDateFormat)) {
          startFrom = UtilCore.dateFormat(categoryOpt.startFrom, categoryOpt.parseDateFormat || undefined);
        } else {
          startFrom = categoryOpt.startFrom;
        }
      }
      increaseBy = typeof categoryOpt.increaseBy !== 'undefined' && !isNaN(Number.parseFloat('' + increaseBy)) ? categoryOpt.increaseBy : increaseBy;
    }

    const resolveCategory = (data: IConnectedPointData, index: number): CategoryLabelType => {
      let label: CategoryLabelType;
      const parseAsDate = this.CHART_DATA.dataSet.xAxis.categories.parseAsDate;
      const parseDateFormat = this.CHART_DATA.dataSet.xAxis.categories.parseDateFormat;
      if (data !== null && typeof data === 'object') {
        if (data instanceof Array && data.length > 1) {
          if (parseAsDate && (typeof data[0] === 'string' || typeof data[0] === 'number') && UtilCore.isDate(data[0], parseDateFormat)) {
            label = UtilCore.dateFormat(data[0], parseDateFormat || undefined);
          } else {
            label = data[0];
          }
        } else if (typeof data === 'object' && !(data instanceof Array)) {
          if (parseAsDate && UtilCore.isDate(data.label, parseDateFormat)) {
            label = UtilCore.dateFormat(data.label, parseDateFormat || undefined);
          } else {
            label = data.label;
          }
        }
      }
      if (label === undefined) {
        for (let series of this.CHART_OPTIONS.dataSet.series) {
          if (series.data && series.data[index] && typeof series.data[index] === 'object') {
            if (series.data[index] instanceof Array && (series.data[index] as ILabelValueArr).length > 1) {
              const labelValueArr: ILabelValueArr = series.data[index] as ILabelValueArr;
              if (parseAsDate && UtilCore.isDate(labelValueArr[0], parseDateFormat)) {
                label = UtilCore.dateFormat(labelValueArr[0], parseDateFormat || undefined);
              } else {
                label = labelValueArr[0];
              }
              break;
            } else if (typeof (series.data[index] as ILabelValue).label !== 'undefined') {
              const labelValue: ILabelValue = series.data[index] as ILabelValue;
              if (parseAsDate && UtilCore.isDate(labelValue.label, parseDateFormat)) {
                label = UtilCore.dateFormat(labelValue.label, parseDateFormat || undefined);
              } else {
                label = labelValue.label;
              }
              break;
            }
          }
        }
        if (label === undefined) {
          if (typeof categoryValues[index] !== 'undefined') {
            if (parseAsDate && UtilCore.isDate(categoryValues[index], parseDateFormat)) {
              label = UtilCore.dateFormat(categoryValues[index], parseDateFormat || undefined);
            } else {
              label = categoryValues[index];
            }
          } else {
            label = UtilCore.isDate(startFrom) ? UtilCore.dateFormat(startFrom as number + (index * increaseBy)) : startFrom as number + (index * increaseBy);
          }
        }
      }
      return label;
    };

    const dataMapFn = (sourceData: IConnectedPointData, index: number): ILabelValue => {
      let data: ILabelValue = { value: 0 };
      let yAxisType = this.CHART_DATA.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type;
      if (sourceData !== null && typeof sourceData === 'object') {
        if (sourceData instanceof Array) {
          if (sourceData.length > 1) {
            data.value = sourceData[1];
          } else if (sourceData.length === 1) {
            data.value = sourceData[0] as any;
          } else {
            data.value = null;
          }
        } else {
          data = { ...sourceData };
          data.value = sourceData.value;
        }
      } else {
        data.value = sourceData as any;
      }
      if (yAxisType === AXIS_TYPE.LOGARITHMIC && data.value <= 0) {
        data.value = null;
      }
      data.label = resolveCategory(sourceData, index);
      data.index = index;
      return data;
    };

    return dataMapFn;
  }

  processTurboData() {
    let dataMapFn = this.beforeProcessTurboData();
    for (let i = 0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
      this.CHART_DATA.dataSet.series[i].data = this.CHART_OPTIONS.dataSet.series[i].data.map(dataMapFn);
      this.CHART_DATA.dataSet.series[i].turboData = crossfilter(this.CHART_DATA.dataSet.series[i].data);
      this.CHART_DATA.dataSet.series[i].dataDimIndex = this.CHART_DATA.dataSet.series[i].turboData.dimension((d: ILabelValue) => d.index);
      this.CHART_DATA.dataSet.series[i].dataDimValue = this.CHART_DATA.dataSet.series[i].turboData.dimension((d: ILabelValue) => d.value);
    }
  }

  prepareDataSet(isFS: boolean = false) {
    let primaryMaxSet = [];
    let primaryMinSet = [];
    let secondaryMaxSet = [];
    let secondaryMinSet = [];
    let categories: CategoryLabelType[] = [];
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
      let data: ILabelValue[] = dataSet.series[i].data as ILabelValue[];
      let minVal: number = data.length === 0 ? 0 : Number.MAX_SAFE_INTEGER;
      let maxVal: number = data.length === 0 ? 10 : Number.MIN_SAFE_INTEGER;
      let customizedMarkers: IMarkerIcon[] = [];
      dataSet.series[i].valueSet = [];
      for (let j = 0, len = data.length; j < len; j++) {
        const v = data[j].value;
        minVal = (v < minVal && v !== null) ? v : minVal;
        maxVal = (v > maxVal) ? v : maxVal;
        if (j > categories.length - 1) {
          categories.push(data[j].label);
        }
        if (data[j].marker) {
          customizedMarkers[j] = data[j].marker;
        }
        dataSet.series[i].valueSet.push(v);
      }
      let yAxisFollow = dataSet.series[i].yAxisLinkIndex === 0 || !dataSet.series[i].yAxisLinkIndex ? 'primary' : 'secondary';
      if (yAxisFollow === 'primary') {
        primaryMaxSet.push(maxVal);
        primaryMinSet.push(minVal);
      } else {
        secondaryMaxSet.push(maxVal);
        secondaryMinSet.push(minVal);
      }
      dataSet.series[i].index = i;
      dataSet.series[i].lineWidth = typeof dataSet.series[i].lineWidth === 'undefined' ? 1.5 : dataSet.series[i].lineWidth;
      this.setSeriesColor(i, dataSet.series[i]);
      dataSet.series[i].customizedMarkers = customizedMarkers;
    }
    this.state[dataFor].dataSet = dataSet;
    this.state[dataFor].dataSet.xAxis.selectedCategories = categories;
    this.state[dataFor].maxima = Math.max(...primaryMaxSet, ...secondaryMaxSet);
    this.state[dataFor].primaryMaxima = Math.max(...primaryMaxSet);
    this.state[dataFor].secondaryMaxima = Math.max(...secondaryMaxSet);
    this.state[dataFor].minima = Math.min(...primaryMinSet, ...secondaryMinSet);
    this.state[dataFor].primaryMinima = Math.min(...primaryMinSet);
    this.state[dataFor].secondaryMinima = Math.min(...secondaryMinSet);
    if (!isFinite(this.state[dataFor].secondaryMaxima)) {
      this.state[dataFor].secondaryMaxima = this.state[dataFor].maxima;
    }
    if (!isFinite(this.state[dataFor].secondaryMinima)) {
      this.state[dataFor].secondaryMinima = this.state[dataFor].minima;
    }
    /* For primary y axis */
    if (this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type === AXIS_TYPE.LINEAR) {
      this.state[dataFor][AXIS_PRIORITY.PRIMARY].yInterval = UiCore.calcIntervalByMinMax(this.state[dataFor].primaryMinima, this.state[dataFor].primaryMaxima, this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.PRIMARY].zeroBase);
    } else if (this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type === AXIS_TYPE.LOGARITHMIC) {
      this.state[dataFor][AXIS_PRIORITY.PRIMARY].yInterval = UiCore.calcIntervalByMinMaxLog(this.state[dataFor].primaryMinima, this.state[dataFor].primaryMaxima);
    }
    /* For secondary y axis */
    if (this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.SECONDARY]) {
      if (this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.SECONDARY].type === AXIS_TYPE.LINEAR) {
        this.state[dataFor][AXIS_PRIORITY.SECONDARY].yInterval = UiCore.calcIntervalByMinMax(this.state[dataFor].secondaryMinima, this.state[dataFor].secondaryMaxima, this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.SECONDARY].zeroBase);
      } else if (this.state[dataFor].dataSet.yAxis[AXIS_PRIORITY.SECONDARY].type === AXIS_TYPE.LOGARITHMIC) {
        this.state[dataFor][AXIS_PRIORITY.SECONDARY].yInterval = UiCore.calcIntervalByMinMaxLog(this.state[dataFor].secondaryMinima, this.state[dataFor].secondaryMaxima);
      }
    }
    ({ iVal: this.state[dataFor][AXIS_PRIORITY.PRIMARY].valueInterval, iCount: this.state.hGridCount[AXIS_PRIORITY.PRIMARY] } = this.state[dataFor][AXIS_PRIORITY.PRIMARY].yInterval);
    ({ iVal: this.state[dataFor].secondary.valueInterval, iCount: this.state.hGridCount[AXIS_PRIORITY.SECONDARY] } = this.state[dataFor][AXIS_PRIORITY.SECONDARY].yInterval);
    this.state.gridHeight[AXIS_PRIORITY.PRIMARY] = (this.CHART_DATA.gridBoxHeight / this.state.hGridCount[AXIS_PRIORITY.PRIMARY]);
    this.state.gridHeight[AXIS_PRIORITY.SECONDARY] = (this.CHART_DATA.gridBoxHeight / this.state.hGridCount[AXIS_PRIORITY.SECONDARY]);
  }

  setSeriesColor(index: number, series: ISeriesConfig) {
    if (!series.lineColor && !series.areaColor) {
      series.lineColor = series.areaColor = UtilCore.getColor(index);
    } else if (!series.lineColor) {
      series.lineColor = series.areaColor;
    } else if (!series.areaColor) {
      series.areaColor = series.lineColor;
    }
  }

  copyDataset(dataSet: IConnectedPointDataSet): IConnectedPointDataSet {
    let data: IObject = {};
    for (let key in dataSet) {
      if (key === 'series') {
        data[key] = [];
        for (let series of dataSet[key]) {
          let s: IObject = {};
          for (let seriesKey in series) {
            if (seriesKey === 'data') {
              s[seriesKey as keyof ISeriesConfig] = series.dataDimIndex.bottom(Infinity);
            } else if (['turboData', 'dataDimIndex', 'dataDimValue'].indexOf(seriesKey) === -1) {
              s[seriesKey as keyof ISeriesConfig] = UtilCore.deepCopy(series[seriesKey as keyof ISeriesConfig]);
            }
          }
          data[key].push(s as ISeriesConfig);
        }
      } else {
        data[key] = UtilCore.deepCopy(dataSet[key as keyof IConnectedPointDataSet]);
      }
    }
    return data as IConnectedPointDataSet;
  }

  calculateScale(width: number, height: number, maxVal: number, minVal: number, paddingX: number, maxSeriesLen: number, yAxisInfo: IYAxisConfig): { scaleX: number, scaleY: number, baseLine: number } {
    let scaleX = (width - (2 * paddingX)) / (maxSeriesLen - 1 || 2);
    let scaleY = 0, baseLine = 0;
    if (yAxisInfo.type === AXIS_TYPE.LINEAR) {
      scaleY = height / (maxVal - minVal);
      baseLine = maxVal * scaleY;
    } else if (yAxisInfo.type === AXIS_TYPE.LOGARITHMIC) {
      scaleY = height / (Math.log10(maxVal) - Math.log10(minVal));
      baseLine = Math.log10(maxVal) * scaleY;
    }
    return { scaleX, scaleY, baseLine };
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

  propsWillReceive(nextProps: IConnectedPointChartProps) {
    this.CHART_CONST = UtilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = UtilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions) as IConnectedPointChartConfig;
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

  afterMount(): void {
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

  afterUpdate(): void {
    this.state.shouldFSRender = false;
  }

  beforeUnmount(): void {
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
      <g class='sc-connected-point-base'>
        <Draggable instanceId='drag-132'>
          <Heading instanceId='sc-title' type={HeadingTypeMap.h3} opts={this.CHART_OPTIONS.title} posX={0} posY={UiCore.percentToPixel(this.CHART_DATA.svgHeight, this.CHART_OPTIONS.title.top.toString())} width='90%' />
          <Heading instanceId='sc-subtitle' type={HeadingTypeMap.h5} opts={this.CHART_OPTIONS.subtitle} posX={0} posY={UiCore.percentToPixel(this.CHART_DATA.svgHeight, this.CHART_OPTIONS.subtitle.top.toString())} width='95%' />
        </Draggable>

        <MarkRegion posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} xMarkRegions={this.state.cs.dataSet.xAxis.markRegions || []} yMarkRegions={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].markRegions || []}
          xAxisType={this.state.cs.dataSet.xAxis.type} yAxisType={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type} width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} yInterval={this.state.cs[AXIS_PRIORITY.PRIMARY].yInterval}
          paddingX={this.CHART_DATA.paddingX} leftIndex={this.state.windowLeftIndex} vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
        </MarkRegion>

        <Grid opts={this.CHART_OPTIONS?.gridBox || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} yAxisType={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type}
          vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
        </Grid>

        <g class='sc-chart-area-container'>
          {this.drawSeries()}
        </g>

        {this.drawYAxis(this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY], AXIS_PRIORITY.PRIMARY)}

        {this.state.cs.dataSet.yAxis[AXIS_PRIORITY.SECONDARY] &&
          this.drawYAxis(this.state.cs.dataSet.yAxis[AXIS_PRIORITY.SECONDARY], AXIS_PRIORITY.SECONDARY)
        }

        {this.state.cs.dataSet.xAxis.positionOpposite === false &&
          <g>
            <TextBox class='sc-horizontal-axis-title' posX={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2))}
              posY={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + (this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.BOTTOM ? (this.CHART_DATA.hLabelHeight / 2) : 0) + 5)}
              bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={this.CHART_DATA.dataSet.xAxis.titleColor || defaultConfig.theme.fontColorDark} bgOpacity={0.6} borderRadius={1} padding={5} stroke='none'
              textAnchor='middle' fontWeight='bold' text={this.CHART_DATA.dataSet.xAxis.title}
              style={{
                '.sc-horizontal-axis-title': {
                  'font-size': UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
                }
              }} />
            <AxisBar instanceId="x-bottom" type='x' xAxis={this.state.cs.dataSet.xAxis || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
              width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight}>
            </AxisBar>

            <HorizontalLabels opts={this.state.cs.dataSet.xAxis || {}}
              posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight}
              maxWidth={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} maxHeight={this.CHART_DATA.hLabelHeight}
              categorySet={this.state.cs.dataSet.xAxis.selectedCategories} paddingX={this.CHART_DATA.paddingX} accessibilityId={this.hLabelAccId}
              clip={{
                x: this.state.offsetLeftChange,
                width: this.CHART_DATA.gridBoxWidth
              }} >
            </HorizontalLabels>
          </g>
        }

        {this.state.cs.dataSet.xAxis.positionOpposite === true &&
          <g>
            <TextBox class='sc-horizontal-axis-title' posX={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2))}
              posY={(this.CHART_DATA.marginTop - (this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.TOP ? this.CHART_DATA.hLabelHeight : this.CHART_DATA.hLabelHeight / 2) - 5)}
              bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={this.CHART_DATA.dataSet.xAxis.titleColor || defaultConfig.theme.fontColorDark} bgOpacity={0.6} borderRadius={1} padding={5} stroke='none'
              textAnchor='middle' fontWeight='bold' text={this.CHART_DATA.dataSet.xAxis.title}
              style={{
                '.sc-horizontal-axis-title': {
                  'font-size': UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
                }
              }} />
            <AxisBar instanceId="x-top" type='x' xAxis={this.state.cs.dataSet.xAxis || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
              width={this.CHART_DATA.gridBoxWidth} height={0}>
            </AxisBar>

            <HorizontalLabels opts={this.state.cs.dataSet.xAxis || {}}
              posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop}
              maxWidth={this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange} maxHeight={this.CHART_DATA.hLabelHeight}
              categorySet={this.state.cs.dataSet.xAxis.selectedCategories} paddingX={this.CHART_DATA.paddingX} accessibilityId={this.hLabelAccId}
              clip={{
                x: this.state.offsetLeftChange,
                width: this.CHART_DATA.gridBoxWidth
              }} >
            </HorizontalLabels>
          </g>
        }

        {this.getSeriesLabel()}

        <PointerCrosshair hLineStart={this.CHART_DATA.marginLeft} hLineEnd={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth}
          vLineStart={this.CHART_DATA.marginTop} vLineEnd={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight}
          opts={this.CHART_OPTIONS.pointerCrosshair} xAxis={this.state.cs.dataSet.xAxis} yAxis={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY]}>
        </PointerCrosshair>

        {(!this.CHART_OPTIONS.legends || (this.CHART_OPTIONS.legends && this.CHART_OPTIONS.legends.enable !== false)) &&
          <Draggable instanceId='drag-135'>
            <LegendBox legendSet={this.getLegendData()} float={this.legendBoxFloat} left={this.CHART_DATA.marginLeft} top={this.CHART_DATA.legendTop} opts={this.CHART_OPTIONS.legends || {}}
              display={DISPLAY.INLINE} type={this.legendBoxType} background='none'
              hoverColor='none' hideIcon={false} hideLabel={false} hideValue={true} toggleType={true} >
            </LegendBox>
          </Draggable>
        }

        {this.CHART_OPTIONS.horizontalScroller.enable !== false &&
          <HorizontalScroller opts={this.CHART_OPTIONS.horizontalScroller || {}} posX={this.CHART_DATA.marginLeft}
            posY={(this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) + (this.CHART_DATA.dataSet.xAxis.positionOpposite ? 0 : this.CHART_DATA.hLabelHeight)}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={this.CHART_OPTIONS.horizontalScroller.height} leftOffset={this.state.leftOffset} rightOffset={this.state.rightOffset}
            offsetColor='#bbb' offsetClipId={this.scrollOffsetClipId} windowClipId={this.scrollWindowClipId} getRangeVal={this.getRangeVal.bind(this)} >
            {this.CHART_OPTIONS.horizontalScroller.enable && this.CHART_OPTIONS.horizontalScroller.chartInside &&
              this.drawHScrollSeries(0, 0)
            }
          </HorizontalScroller>
        }

        <InteractivePlane posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} >
        </InteractivePlane>

        {this.CHART_OPTIONS.annotationLabels && this.CHART_OPTIONS.annotationLabels.length && this.state.cs.dataSet.series.filter((d: ISeriesConfig) => d.data.length > 0).length &&
          <AnnotationLabels annotations={this.CHART_OPTIONS.annotationLabels} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
            width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} yInterval={this.state.cs[AXIS_PRIORITY.PRIMARY].yInterval} yAxisType={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type}
            scaleX={this.state.cs.scaleX} scaleY={this.state.cs.scaleY} baseLine={this.state.cs.baseLine}
            paddingX={this.CHART_DATA.paddingX} leftIndex={this.state.windowLeftIndex} vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
          </AnnotationLabels>
        }

        <g class="sc-marker-tooltip-container-main">
          {this.CHART_OPTIONS.tooltip.enable &&
            <Tooltip instanceId='marker-tooltip' instanceCount={this.CHART_OPTIONS.tooltip.grouped ? 1 : this.state.cs.dataSet.series.filter((d: ISeriesConfig) => d.data.length > 0).length}
              opts={this.CHART_OPTIONS.tooltip || {}} grouped={this.CHART_OPTIONS.tooltip.grouped}
              svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} >
            </Tooltip>
          }
        </g>

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

        {this.CHART_OPTIONS.horizontalScroller.enable && (this.state.hScrollLeftOffset !== 0 || this.state.hScrollRightOffset !== 100) &&
          <ZoomoutBox posX={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth - this.CHART_DATA.zoomOutBoxWidth} posY={this.CHART_DATA.marginTop}
            width={this.CHART_DATA.zoomOutBoxWidth} height={this.CHART_DATA.zoomOutBoxHeight} >
          </ZoomoutBox>
        }
      </g>
    );
  }

  drawSeries(): IVnode {
    let isBothSinglePoint = true;
    this.state.cs.dataSet.series.filter((d: ISeriesConfig) => d.data.length > 0).map((s: ISeriesConfig) => {
      isBothSinglePoint = !!(+isBothSinglePoint * (+(s.data.length === 1)));
    });
    return this.state.cs.dataSet.series.filter((d: ISeriesConfig) => d.data.length > 0).map((series: ISeriesConfig) => {
      let seriesTotalDataCount: number = this.state.fs.dataSet.series.filter((s: ISeriesConfig) => s.index === series.index)[0].data.filter((v: ISeriesData) => v !== null).length;
      let yAxisFollow = series.yAxisLinkIndex === 0 || !series.yAxisLinkIndex ? AXIS_PRIORITY.PRIMARY : AXIS_PRIORITY.SECONDARY;
      let width = this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange;
      let height = this.CHART_DATA.gridBoxHeight;
      let maxVal = this.state.cs[yAxisFollow].yInterval.iMax;
      let minVal = this.state.cs[yAxisFollow].yInterval.iMin;
      let yAxisInfo = this.state.cs.dataSet.yAxis[yAxisFollow];

      let scale = this.calculateScale(width, height, maxVal, minVal, this.CHART_DATA.paddingX, this.state.maxSeriesLen, yAxisInfo);
      this.state.cs.scaleX = scale.scaleX;
      this.state.cs.scaleY = scale.scaleY;
      this.state.cs.baseLine = scale.baseLine;
      return (
        <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'cs-' + series.index} name={series.name} posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={width} height={height} maxSeriesLen={this.state.maxSeriesLen} areaFillColor={series.areaColor} lineFillColor={series.lineColor} fillOptions={series.fillOptions || {}}
          lineDropShadow={(this as any).context.chartType === CHART_TYPE.LINE_CHART && typeof series.dropShadow === 'undefined' ? true : series.dropShadow || false} strokeOpacity={series.lineOpacity || 1} opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline}
          marker={typeof series.marker === 'object' ? series.marker : {}} customizedMarkers={series.customizedMarkers || []} centerSinglePoint={isBothSinglePoint} lineStrokeWidth={series.lineWidth} lineStyle={series.lineStyle || LINE_STYLE.SOLID} lineDashArray={series.lineDashArray || '0'} areaStrokeWidth={0} maxVal={maxVal} minVal={minVal}
          dataPoints={true} dataLabels={series.dataLabels} seriesLabel={series.seriesLabel} animated={series.animated == undefined ? true : !!series.animated} shouldRender={true} tooltipOpt={this.CHART_OPTIONS.tooltip} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo}
          totalSeriesCount={this.state.fs.dataSet.series.length} totalDataCount={seriesTotalDataCount} accessibility={true} accessibilityText={series.a11y ? series.a11y.description || '' : ''} emitScale={true}
          scaleX={scale.scaleX} scaleY={scale.scaleY} baseLine={scale.baseLine}
          clip={{
            x: this.state.offsetLeftChange,
            width: this.CHART_DATA.gridBoxWidth,
            offsetLeft: this.state.offsetLeftChange,
            offsetRight: this.state.offsetRightChange
          }}
        >
        </DrawConnectedPoints>
      );
    });
  }

  drawHScrollSeries(marginLeft: number, marginTop: number): IVnode {
    return this.state.fs.dataSet.series.filter((d: ISeriesConfig) => d.data.length > 0).map((series: ISeriesConfig) => {
      const yAxisFollow = series.yAxisLinkIndex === 0 || !series.yAxisLinkIndex ? AXIS_PRIORITY.PRIMARY : AXIS_PRIORITY.SECONDARY;
      const width = this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth;
      const height = this.CHART_OPTIONS.horizontalScroller.height - 5;
      const maxVal = this.state.fs[yAxisFollow].yInterval.iMax;
      const minVal = this.state.fs[yAxisFollow].yInterval.iMin;
      const yAxisInfo = this.state.cs.dataSet.yAxis[yAxisFollow];

      const scale = this.calculateScale(width, height, maxVal, minVal, 0, this.state.maxSeriesLenFS, yAxisInfo);
      this.state.fs.scaleX = scale.scaleX;
      return (
        <g class='sc-fs-chart-area-container'>
          <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'fs-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={width} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#efefef' lineFillColor='#dedede' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} lineStyle={LINE_STYLE.SOLID} lineDashArray={'0'} areaStrokeWidth={1}
            maxVal={maxVal} minVal={minVal} dataPoints={false} dataLabels={false} seriesLabel={false} customizedMarkers={[]} animated={false} shouldRender={this.state.shouldFSRender} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo}
            accessibility={false} emitScale={false} scaleX={scale.scaleX} scaleY={scale.scaleY} baseLine={scale.baseLine}
            clipId={this.scrollOffsetClipId}>
          </DrawConnectedPoints>
          <DrawConnectedPoints dataSet={series.valueSet} index={series.index} instanceId={'fs-clip-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={height} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#cccccc' lineFillColor='#777' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} lineStyle={LINE_STYLE.SOLID} lineDashArray={'0'} areaStrokeWidth={1}
            maxVal={maxVal} minVal={minVal} dataPoints={false} dataLabels={false} seriesLabel={false} customizedMarkers={[]} animated={false} shouldRender={this.state.shouldFSRender} clipId={this.scrollWindowClipId} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo} accessibility={false} emitScale={false}
            scaleX={scale.scaleX} scaleY={scale.scaleY} baseLine={scale.baseLine}>
          </DrawConnectedPoints>
        </g>
      );
    });
  }

  getSeriesLabel(): IVnode {
    this.store.removeValue('seriesLabelData');
    return this.state.cs.dataSet.series.map((series: ISeriesConfig) => {
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

  drawYAxis(yAxis: IYAxisConfig, priority: AXIS_PRIORITY): IVnode {
    if (yAxis.positionOpposite === false) {
      return (
        <g>
          <TextBox class='sc-vertical-axis-title' posX={5} posY={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2))}
            transform={`rotate(${-90})`} bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={yAxis.titleColor || defaultConfig.theme.fontColorDark} bgOpacity={0.6}
            textAnchor='middle' borderRadius={1} padding={5} stroke='none' fontWeight='bold' text={yAxis.title}
            style={{
              '.sc-vertical-axis-title': {
                'font-size': UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
              }
            }} />
          <AxisBar instanceId="y-left" type='y' yAxis={yAxis || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
            width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight}>
          </AxisBar>
          <VerticalLabels instanceId="v-label-left" opts={yAxis || {}} priority={priority}
            posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} maxVal={this.state.cs[priority].yInterval.iMax} minVal={this.state.cs[priority].yInterval.iMin} valueInterval={this.state.cs[priority].valueInterval}
            labelCount={this.state.hGridCount[priority]} intervalLen={this.state.gridHeight[priority]} maxWidth={this.CHART_DATA.vLabelWidth} accessibilityId={this.vLabelAccId} >
          </VerticalLabels>
        </g>
      );
    } else if (yAxis.positionOpposite) {
      return (
        <g>
          <TextBox class='sc-vertical-axis-title' posX={(this as any).context.svgWidth - 5} posY={(this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2))}
            transform={`rotate(${90})`} bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={yAxis.titleColor || defaultConfig.theme.fontColorDark} bgOpacity={0.6}
            textAnchor='middle' borderRadius={1} padding={5} stroke='none' fontWeight='bold' text={yAxis.title}
            style={{
              '.sc-vertical-axis-title': {
                'font-size': UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, 14) + 'px'
              }
            }} />
          <AxisBar instanceId="y-right" type='y' yAxis={yAxis || {}} posX={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth} posY={this.CHART_DATA.marginTop}
            width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight}>
          </AxisBar>

          <VerticalLabels instanceId="v-label-right" opts={yAxis || {}} priority={priority}
            posX={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth} posY={this.CHART_DATA.marginTop} maxVal={this.state.cs[priority].yInterval.iMax} minVal={this.state.cs[priority].yInterval.iMin} valueInterval={this.state.cs[priority].valueInterval}
            labelCount={this.state.hGridCount[priority]} intervalLen={this.state.gridHeight[priority]} maxWidth={this.CHART_DATA.vLabelWidth} accessibilityId={this.vLabelAccId} >
          </VerticalLabels>
        </g>
      );
    }
  }

  onHScroll(hScrollEvent: IHScrollOffsetEvent) {
    let leftIndex = Math.floor((this.state.maxSeriesLenFS - 1) * hScrollEvent.leftOffset / 100);
    let rightIndex = Math.ceil((this.state.maxSeriesLenFS - 1) * hScrollEvent.rightOffset / 100);
    let hScrollIntervalPercent = 100 / (this.state.maxSeriesLenFS - 1);
    this.state.hScrollLeftOffset = hScrollEvent.leftOffset;
    this.state.hScrollRightOffset = hScrollEvent.rightOffset;

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
      rangeTipPoints: this.getRangeVal(hScrollEvent.leftHandlePos, hScrollEvent.rightHandlePos)
    });
    this.calcOffsetChanges();
    this.hideTip();
    this.update();
  }

  getRangeVal(leftHandlePos: Point, rightHandlePos: Point): RangePoint[] {
    const leftRangePoint = new RangePoint(leftHandlePos.x - this.CHART_DATA.marginLeft, leftHandlePos.y - 5);
    const rightRangePoint = new RangePoint(rightHandlePos.x - this.CHART_DATA.marginLeft, rightHandlePos.y - 5);
    const xAxis = this.state.cs.dataSet.xAxis;
    if (!xAxis.selectedCategories.length) {
      leftRangePoint.value = undefined;
      rightRangePoint.value = undefined;
      return [leftRangePoint, rightRangePoint];
    }
    let lRangeVal = xAxis.selectedCategories[0];
    lRangeVal = xAxis.categories.parseAsDate && UtilCore.isDate(lRangeVal) ? UtilCore.dateFormat(lRangeVal).format(xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat) : lRangeVal;
    leftRangePoint.value = (xAxis.prepend ? xAxis.prepend : '') + lRangeVal + (xAxis.append ? xAxis.append : '');

    let rRangeVal = xAxis.selectedCategories[xAxis.selectedCategories.length - 1];
    rRangeVal = xAxis.categories.parseAsDate && UtilCore.isDate(rRangeVal) ? UtilCore.dateFormat(rRangeVal).format(xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat) : rRangeVal;
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

  updateLabelTip(eventData: IHorizontalLabelHoverEvent | IVerticalLabelHoverEvent) {
    this.emitter.emitSync('updateTooltip', {
      instanceId: 'label-tooltip',
      originPoint: UiCore.cursorPoint((this as any).context.rootContainerId, eventData.event),
      pointData: undefined,
      line1: eventData.labelText,
      line2: undefined
    });
  }

  consumeEvents(e: IHighlightPointMarkerEvent): IHighlightedPoint {
    const series: ISeriesConfig = this.state.cs.dataSet.series[e.highlightedPoint.seriesIndex];
    const point: ILabelValue = series.data[e.highlightedPoint.pointIndex] as ILabelValue;
    let formattedLabel: string = point.label as string;
    let formattedValue: string = UiCore.formatTextValue(point.value);
    if (this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY] && this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].prefix) {
      formattedValue = this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].prefix + formattedValue;
    }
    if (this.state.cs.dataSet.xAxis && this.state.cs.dataSet.xAxis.categories.parseAsDate && UtilCore.isDate(formattedLabel)) {
      formattedLabel = UtilCore.dateFormat(formattedLabel).format(this.state.cs.dataSet.xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat);
    }
    const hPoint: IHighlightedPoint = {
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

  onHighlightPointMarker(eventData: IHighlightPointMarkerEvent): void {
    if (!this.eventStream[eventData.event.timeStamp]) {
      this.eventStream[eventData.event.timeStamp] = [eventData];
    } else {
      this.eventStream[eventData.event.timeStamp].push(eventData);
    }
    //consume events when all events are received
    if (this.eventStream[eventData.event.timeStamp].length === this.state.cs.dataSet.series.filter((s: ISeriesConfig) => s.data.length > 0).length) {
      for (let evt of this.eventStream[eventData.event.timeStamp]) {
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
      delete this.eventStream[eventData.event.timeStamp];
    }
  }

  onMouseLeave(): void {
    this.pointData = [];
    this.originPoint = undefined;
    this.prevOriginPoint = undefined;
    this.hideTip();
  }

  updateCrosshair(pointData: IHighlightedPoint[] | null): void {
    this.emitter.emit('setVerticalCrosshair', pointData);
    this.emitter.emit('setHorizontalCrosshair', pointData);
  }

  updateDataTooltip(originPoint: Point, pointData: IHighlightedPoint[]): void {
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

  getTooltipHeader(pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig): string {
    return (
      `<p style="background-color:${tipConfig.headerBgColor || '#555'};font-size: ${defaultConfig.theme.fontSizeLarge}px; text-align: center; color: ${tipConfig.headerTextColor || '#fff'};margin:0;padding: 5px 5px;">
        ${pointSet[index].formattedLabel}
      </p>`
    );
  }

  getTooltipBody(pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig): string {
    let point: IHighlightedPoint = pointSet[index];
    return (
      `<tr  style="font-size: ${tipConfig.fontSize || defaultConfig.theme.fontSizeMedium}px; color:${tipConfig.textColor || '#000'};">
        <td style="padding: 5px">
          <span style="background-color:${point.areaColor}; display:inline-block; width:10px; height:10px; margin-right:5px;"></span>
            ${point.seriesName}:
        </td>
        <td style="padding: 5px">${point.value}</td>
      </tr>`
    );
  }

  getTooltipFooter(): string {
    return '';
  }

  hideTip(event?: MouseEvent): void {
    this.emitter.emitSync('hideTooltip', event);
    this.updateCrosshair(null);
  }

  onLegendRendered(e: { bBox: IDimensionBox } & ILegendsConfig): void {
    if (e.float === FLOAT.NONE) {
      const addedMarginTop = e.bBox.height;
      let newMarginTop = this.defaultMargins.top + addedMarginTop;
      if (this.CHART_DATA.dataSet.xAxis.positionOpposite && (this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.TOP)) {
        newMarginTop = newMarginTop + this.CHART_DATA.hLabelHeight;
      }
      if (this.CHART_DATA.marginTop != newMarginTop) {
        this.CHART_DATA.marginTop = newMarginTop;
        this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
        this.prepareDataSet();
        this.update();
      }
    }
  }

  onLegendClick(eventData: { event: MouseEvent, legendOption: ILegendOptions }): void {
    const legendOption = eventData.legendOption;
    this.CHART_DATA.dataSet.series[legendOption.index].visible = !this.CHART_DATA.dataSet.series[legendOption.index].visible;
    this.prepareDataSet();
    this.hideTip(eventData.event);
    this.update();
  }

  onLegendHover(eventData: { event: MouseEvent, legendOption: ILegendOptions }): void {
    this.state.cs.dataSet.series.forEach((series: ISeriesConfig, i: number) => {
      this.emitter.emit('changeAreaBrightness', {
        type: HIGHLIGHT_EVENT_TYPE.HIGHLIGHT,
        instanceId: 'cs-' + i,
        strokeOpacity: i == eventData.legendOption.index ? 1 : 0.2,
        opacity: i == eventData.legendOption.index ? 0.5 : 0.1
      });
    });
  }

  onLegendLeave(eventData: { event: MouseEvent, legendOption: ILegendOptions }): void {
    this.state.cs.dataSet.series.forEach((series: ISeriesConfig, i: number) => {
      this.emitter.emit('changeAreaBrightness', {
        type: HIGHLIGHT_EVENT_TYPE.NORMALIZE,
        instanceId: 'cs-' + i,
        strokeOpacity: this.CHART_DATA.dataSet.series[i].lineOpacity || 1,
        opacity: this.CHART_DATA.dataSet.series[i].areaOpacity || 0.2
      });
    });
  }

  getLegendData(): ILegendOptions[] {
    return this.state.cs.dataSet.series.map((series: ISeriesConfig) => {
      return {
        label: series.name,
        color: series.lineColor,
        icon: typeof series.marker === 'object' ? series.marker : {},
        isToggled: !series.visible
      };
    });
  }

}

export default ConnectedPointBase;