'use strict';

import { CHART_TYPE, ALIGNMENT, FLOAT, VERTICAL_ALIGN, HORIZONTAL_ALIGN, AXIS_TYPE, LINE_STYLE, DISPLAY, AXIS_PRIORITY } from '../../global/global.enums';
import Point, { RangePoint } from '../../core/point';
import { Component } from '../../viewEngin/pview';
import crossfilter from 'crossfilter2'; /* Api reference: https://github.com/crossfilter/crossfilter/wiki/API-Reference */
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
import storeManager from '../../liveStore/storeManager';
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
 * 
 * @event
 * 1. onPrepareCategories : Fire after processing categories and register function for xPositionWithDynamicScaleFn.
 * 2. onUpdateRangeVal: Fire after horizontal scroll and update max and min range value.
 * 3. onScrollReset: Fire when reset zoom value, zoom out completely.
 * 4. setVerticalCrosshair: Fire move cursor on interactive plane to set vertical crosshair value. 
 * 5. setHorizontalCrosshair: Fire move cursor on interactive plane to set horizontal crosshair value.
 * 6. changeAreaBrightness: Fire when hover on legend to change area brightness.
 */

class ConnectedPointBase extends Component<IConnectedPointChartProps> {
  private a11yWriter: A11yWriter;
  private CHART_DATA: IObject;
  private CHART_OPTIONS: IConnectedPointChartConfig;
  private CHART_CONST: IObject;
  private yAxisDefaults: IYAxisConfig;
  private defaultMargins: IBoundingBox;
  private storeData: Store;
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
      this.emitter = eventEmitter.getInstance((this as any).context.runId);
      this.storeData = storeManager.getStore((this as any).context.runId);
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
        enable: true,
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
            enable: true,
            type: AXIS_TYPE.LINEAR,
            title: 'Label-axis',
            labelAlign: VERTICAL_ALIGN.BOTTOM,
            positionOpposite: false,
            intervalThreshold: 50
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
        _maxSeriesLenFS: 0,
        _windowLeftIndex: -1,
        _windowRightIndex: -1,
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
          let maxSeriesLenFS = this.maxSeriesLenFS;
          this._windowLeftIndex = index;
          this.leftOffset = maxSeriesLenFS <= 1 ? 0 : index * 100 / (maxSeriesLenFS - 1);
        },
        get windowLeftIndex() {
          return this._windowLeftIndex;
        },
        set windowRightIndex(index) {
          let maxSeriesLenFS = this.maxSeriesLenFS;
          this._windowRightIndex = index;
          this.rightOffset = maxSeriesLenFS <= 1 ? 0 : index * 100 / (maxSeriesLenFS - 1);
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
        shouldFSRender: this.props.globalRenderAll,
        parseAsNumber: false
      };

      this.defaultMargins = {
        left: 30,
        right: 30,
        top: 80,
        bottom: 10
      };

      this.legendBoxType = this.props.chartOptions.legends ? (this.props.chartOptions.legends.alignment || ALIGNMENT.HORIZONTAL) : ALIGNMENT.HORIZONTAL;
      this.legendBoxFloat = this.props.chartOptions.legends ? (this.props.chartOptions.legends.float || FLOAT.NONE) : FLOAT.NONE;
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

    if (this.state.windowLeftIndex < 0 && this.state.windowRightIndex < 0) {
      this.setScrollWindowDefaultIndexes();
      this.state.hScrollLeftOffset = this.state.leftOffset;
      this.state.hScrollRightOffset = this.state.rightOffset;
      if (!this.storeData.getValue('parseAsNumber')) {
        this.state.clipLeftOffset = this.state.leftOffset;
        this.state.clipRightOffset = this.state.rightOffset;
      }
    }

    /* Prepare data set for Horizontal scroll */
    if (this.CHART_OPTIONS.horizontalScroller && this.CHART_OPTIONS.horizontalScroller.enable) {
      this.prepareDataSet(true);
    }
    /* Prepare data set for chart area. */
    this.prepareDataSet();
    if (this.CHART_OPTIONS.horizontalScroller && this.CHART_OPTIONS.horizontalScroller.enable) {
      this.calcOffsetChanges();
    }
  }

  setScrollWindowDefaultIndexes() {
    if (this.CHART_OPTIONS.zoomWindow) {
      this.setLeftWindowDefaultIndex();
      this.setRightWindowDefaultIndex();
    } else {
      if (!this.CHART_OPTIONS.zoomWindow.leftIndex) {
        this.state.windowLeftIndex = 0;
      }
      if (!this.CHART_OPTIONS.zoomWindow.rightIndex) {
        this.state.windowRightIndex = this.state.maxSeriesLenFS - 1;
      }
    }
  }

  setLeftWindowDefaultIndex() {
    if (this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.leftIndex >= 0 && this.CHART_OPTIONS.zoomWindow.leftIndex < this.state.maxSeriesLen) {
      this.state.windowLeftIndex = this.CHART_OPTIONS.zoomWindow.leftIndex - 1;
    } else {
      this.state.windowLeftIndex = 0;
    }
  }

  setRightWindowDefaultIndex() {
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
    let categoryMaxSet = [], categoryMinSet = [];
    for (let i = 0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
      this.CHART_DATA.dataSet.series[i].data = this.CHART_OPTIONS.dataSet.series[i].data.map(dataMapFn);
      this.CHART_DATA.dataSet.series[i].parseAsNumber = this.isAllNumbers(this.CHART_DATA.dataSet.series[i].data) && !this.CHART_DATA.dataSet.xAxis.categories.parseAsDate;

      this.CHART_DATA.dataSet.series[i].turboData = crossfilter(this.CHART_DATA.dataSet.series[i].data);
      this.CHART_DATA.dataSet.series[i].categoryDim = this.CHART_DATA.dataSet.series[i].turboData.dimension((d: ILabelValue) => d.label);
      this.CHART_DATA.dataSet.series[i].dataDimIndex = this.CHART_DATA.dataSet.series[i].turboData.dimension((d: ILabelValue) => d.index);
      this.CHART_DATA.dataSet.series[i].allCategories = this.CHART_DATA.dataSet.series[i].categoryDim.bottom(Infinity).map((d: ILabelValue) => d.label);
      this.CHART_DATA.dataSet.series[i].categoryMax = Math.max(...this.CHART_DATA.dataSet.series[i].allCategories);
      this.CHART_DATA.dataSet.series[i].categoryMin = Math.min(...this.CHART_DATA.dataSet.series[i].allCategories);
      categoryMaxSet.push(this.CHART_DATA.dataSet.series[i].categoryMax);
      categoryMinSet.push(this.CHART_DATA.dataSet.series[i].categoryMin);
    }
    const parseAsNumber = this.CHART_DATA.dataSet.series.every((series: ISeriesConfig) => series.parseAsNumber);
    this.storeData.setValue('parseAsNumber', parseAsNumber);
    this.CHART_DATA.dataSet.xAxis.categoryMaximaOfAllSeries = Math.max(...categoryMaxSet);
    this.CHART_DATA.dataSet.xAxis.categoryMinimaOfAllSeries = Math.min(...categoryMinSet);
  }

  prepareDataSet(isFS: boolean = false) {
    let primaryMaxSet = [];
    let primaryMinSet = [];
    let secondaryMaxSet = [];
    let secondaryMinSet = [];
    let mergedCategories = new Set<CategoryLabelType>();
    let allCategories: CategoryLabelType[] = [];
    let dataFor = isFS ? 'fs' : 'cs';
    let dataSet: IConnectedPointDataSet = this.copyDataset(this.CHART_DATA.dataSet);
    if (!isFS) {
      let largestSeriesIndex = 0;
      let largestSeriesLength = 0;
      for (let i = 0; i < dataSet.series.length; i++) {
        if (!dataSet.series[i].data.length) {
          dataSet.series[i].visible = false;
        } else if (!dataSet.series[i].visible) {
          dataSet.series[i].data = [];
        } else {
          if (this.storeData.getValue('parseAsNumber')) {
            dataSet.series[i].data = this.CHART_DATA.dataSet.series[i].categoryDim.bottom(Infinity);
          } else {
            dataSet.series[i].data = this.CHART_DATA.dataSet.series[i].dataDimIndex.bottom(this.state.windowRightIndex - this.state.windowLeftIndex + 1, this.state.windowLeftIndex);
          }
        }
        if (dataSet.series[i].allCategories.length > largestSeriesLength) {
          largestSeriesIndex = i;
          largestSeriesLength = dataSet.series[i].data.length;
        }
      }
      allCategories = dataSet.series[largestSeriesIndex].allCategories;
    }
    for (let i = 0; i < dataSet.series.length; i++) {
      let data: ILabelValue[] = dataSet.series[i].data as ILabelValue[];
      let minVal: number = data.length === 0 ? 0 : Number.MAX_SAFE_INTEGER;
      let maxVal: number = data.length === 0 ? 10 : Number.MIN_SAFE_INTEGER;
      let customizedMarkers: IMarkerIcon[] = [];
      dataSet.series[i].valueSet = [];
      dataSet.series[i].categorySet = [];
      for (let j = 0, len = data.length; j < len; j++) {
        const v = data[j].value;
        minVal = (v < minVal && v !== null) ? v : minVal;
        maxVal = (v > maxVal) ? v : maxVal;

        if (this.storeData.getValue('parseAsNumber')) {
          mergedCategories.add(data[j].label);
        } else {
          if (j > mergedCategories.size - 1) {
            mergedCategories.add(data[j].label);
          }
        }

        if (data[j].marker) {
          customizedMarkers[j] = data[j].marker;
        }
        dataSet.series[i].valueSet.push(v);
        dataSet.series[i].categorySet.push(data[j].label);
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
      dataSet.series[i].lineWidth = typeof dataSet.series[i].lineWidth === 'undefined' ? 1 : dataSet.series[i].lineWidth;
      this.setSeriesColor(i, dataSet.series[i]);
      dataSet.series[i].customizedMarkers = customizedMarkers;
    }
    if (this.storeData.getValue('parseAsNumber') && dataSet.series.length > 1) {
      mergedCategories = new Set(Array.from(mergedCategories).sort((a: number, b: number) => a - b));
    }
    let categories: CategoryLabelType[] = Array.from(mergedCategories);
    this.state[dataFor].dataSet = dataSet;
    this.state[dataFor].dataSet.xAxis.selectedCategories = categories;
    this.state[dataFor].dataSet.xAxis.selectedSkippedCategories = categories;
    this.state[dataFor].dataSet.xAxis.allCategories = allCategories;
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

    if (isFS) {
      let fsScaleX = 0;
      const maxWidth = this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth;
      const parseAsNumber = this.storeData.getValue('parseAsNumber');
      if (parseAsNumber) {
        const minValue = this.CHART_DATA.dataSet.xAxis.categoryMinimaOfAllSeries;
        const maxValue = this.CHART_DATA.dataSet.xAxis.categoryMaximaOfAllSeries;
        let valueDiff = maxValue - minValue;
        if (this.CHART_DATA.dataSet.xAxis.type === AXIS_TYPE.LOGARITHMIC) {
          valueDiff = Math.log10(maxValue) - Math.log10(minValue);
        }
        fsScaleX = maxWidth / valueDiff;
      } else {
        fsScaleX = maxWidth / (this.state.maxSeriesLenFS - 1);
      }
      this.storeData.setValue('fsScaleX', fsScaleX);
    }

    if (dataFor === 'cs') {
      this.createIntervalX();
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

  createIntervalX() {
    const maxWidth: number = this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange;
    let categorySet = this.state.cs.dataSet.xAxis.selectedCategories;

    /* calculating scaleX for fixed interval */
    let interval = (maxWidth - (2 * this.CHART_DATA.paddingX)) / (categorySet.length - 1 || 2);
    let skippedInterval = interval;

    /* calculating scaleX for dynamic interval */
    const parseAsNumber = this.storeData.getValue('parseAsNumber');
    if (parseAsNumber) {
      const minValue = Math.min(...categorySet);
      const maxValue = Math.max(...categorySet);
      let valueDiff = maxValue - minValue;
      if (this.CHART_DATA.dataSet.xAxis.type === AXIS_TYPE.LOGARITHMIC) {
        valueDiff = Math.log10(maxValue) - Math.log10(minValue);
        console.log(Math.log10(maxValue),Math.log10(minValue), Math.log10(maxValue) - Math.log10(minValue));

      }
      interval = (maxWidth - (2 * this.CHART_DATA.paddingX)) / valueDiff;
    }

    const getPositionByDynamicScaleX = (index: number, categoryValue?: string | number, withSkippedInterval: boolean = false) => {
      let x = categorySet.length === 1 ? interval : index * interval;
      if (withSkippedInterval) {
        x = categorySet.length === 1 ? interval : index * skippedInterval;
      }
      if (parseAsNumber) {
        categoryValue = categoryValue ?? this.state.cs.dataSet.xAxis.selectedCategories[index];
        if (this.CHART_DATA.dataSet.xAxis.type === AXIS_TYPE.LOGARITHMIC) {
          x = (categorySet.length === 1) ? index * interval : (Math.log10(+categoryValue ) - Math.log10(categorySet[0])) * interval;
        }else {
          x = (categorySet.length === 1) ? index * interval : (+categoryValue - categorySet[0]) * interval;
        }
      }
      return x;
    };

    this.storeData.setValue('xPositionWithDynamicScaleFn', getPositionByDynamicScaleX);
    this.storeData.setValue('scaleX', interval);

    if (this.CHART_OPTIONS.horizontalScroller.enable && this.CHART_OPTIONS.horizontalScroller.chartInside) {
      const getPositionByDynamicFSScaleX = (index: number, categoryValue?: string | number) => {
        let fsInterval = this.storeData.getValue('fsScaleX');
        let fsCategorySet = this.state.fs.dataSet.xAxis.selectedCategories;
        let x = fsCategorySet.length === 1 ? fsInterval : index * fsInterval;
        if (parseAsNumber) {
          categoryValue = categoryValue ?? fsCategorySet;
          if (this.CHART_DATA.dataSet.xAxis.type === AXIS_TYPE.LOGARITHMIC) {
            x = (fsCategorySet.length === 1) ? index * fsInterval : (Math.log10(+categoryValue) - Math.log10(fsCategorySet[0])) * fsInterval;
          }else {
            x = (fsCategorySet.length === 1) ? index * fsInterval : (+categoryValue - fsCategorySet[0]) * fsInterval;
          }
        }
        return x;
      };
      this.storeData.setValue('xPositionWithDynamicFSScaleFn', getPositionByDynamicFSScaleX);
    }

    /* skip overlapping categories */
    if (parseAsNumber && categorySet.length > 2) {
      let newCategories = [];
      let categoryXPos = getPositionByDynamicScaleX(0, categorySet[0]);
      let nextCategoryXPos = getPositionByDynamicScaleX(1, categorySet[1]);
      newCategories.push(categorySet[0]);
      for (let i = 1; i < categorySet.length; i++) {
        nextCategoryXPos = getPositionByDynamicScaleX(i, categorySet[i]);
        // console.log('categoryXPos',categoryXPos,'nextCategoryXPos',nextCategoryXPos)
        if ((nextCategoryXPos - categoryXPos) > this.state.cs.dataSet.xAxis.intervalThreshold) {
          newCategories.push(categorySet[i]);
          categoryXPos = nextCategoryXPos;
          // console.log('selected category:',categorySet[i] )
        }
      }
      categorySet = newCategories;
      // console.log('skipped categories:', newCategories);
    } else {
      const skipLen = Math.ceil(this.state.cs.dataSet.xAxis.intervalThreshold / interval);
      if (skipLen > 0) {
        let newCategories = [];
        for (let i = 0; i < categorySet.length; i += skipLen) {
          newCategories.push(categorySet[i]);
        }
        categorySet = newCategories;
      }
      skippedInterval = skipLen * interval;
    }
    this.state.cs.dataSet.xAxis.selectedSkippedCategories = categorySet;
    this.emitHorizontalLabelsRender(this.state.cs.dataSet.xAxis.selectedCategories);
  }

  emitHorizontalLabelsRender(categories: number[]) {
    if (this.storeData.getValue('parseAsNumber')) {
      const minValue = Math.min(...categories);
      const maxValue = Math.max(...categories);
      const intervalByMinMax = UiCore.calcIntervalByMinMax(minValue, maxValue, false);
      const fixGridCount = intervalByMinMax.iCount;
      const interval = intervalByMinMax.iVal();
      const vGridValues = [];
      for (let i = 0; i < fixGridCount; i++) {
        vGridValues.push(i * interval);
      }
      this.emitter.emitSync('onPrepareCategories', {
        intervalLen: this.storeData.getValue('xPositionWithDynamicScaleFn'),
        values: vGridValues,
        count: vGridValues.length
      });
    } else {
      this.emitter.emitSync('onPrepareCategories', {
        intervalLen: this.storeData.getValue('xPositionWithDynamicScaleFn'),
        values: categories,
        count: categories.length
      });
    }
  }

  isAllNumbers(dataSet: ILabelValue[]) {
    let allNumber = true;
    for (let data of dataSet) {
      if (isNaN(data.label as number)) {
        allNumber = false;
        break;
      }
    }
    return allNumber;
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
              if (this.storeData.getValue('parseAsNumber')) {
                s[seriesKey as keyof ISeriesConfig] = series.categoryDim.bottom(Infinity);
              } else {
                s[seriesKey as keyof ISeriesConfig] = series.dataDimIndex.bottom(Infinity);
              }
            } else if (['turboData', 'dataDimIndex', 'categoryDim'].indexOf(seriesKey) === -1) {
              s[seriesKey as keyof ISeriesConfig] = series[seriesKey as keyof ISeriesConfig];
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

  createIntervalY(height: number, maxVal: number, minVal: number, yAxisInfo: IYAxisConfig, saveInStore = true): { scaleY: number, baseLine: number } {
    let scaleY = 0, baseLine = 0;
    if (yAxisInfo.type === AXIS_TYPE.LINEAR) {
      scaleY = height / (maxVal - minVal);
      baseLine = maxVal * scaleY;
    } else if (yAxisInfo.type === AXIS_TYPE.LOGARITHMIC) {
      scaleY = height / (Math.log10(maxVal) - Math.log10(minVal));
      baseLine = Math.log10(maxVal) * scaleY;
    }
    if (saveInStore) {
      this.storeData.setValue('scaleY', scaleY);
      this.storeData.setValue('baseLine', baseLine);
    }
    return { scaleY, baseLine };
  }

  propsWillReceive(nextProps: IConnectedPointChartProps) {
    this.CHART_CONST = UtilCore.extends(this.CHART_CONST, nextProps.chartConst);
    this.CHART_DATA = UtilCore.extends(this.CHART_DATA, nextProps.chartData);
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, nextProps.chartOptions) as IConnectedPointChartConfig;
    this.state.shouldFSRender = nextProps.globalRenderAll;
    if (this.storeData.getValue('globalRenderAll')) {
      this.processTurboData();
      this.init();
      if (nextProps.chartOptions.zoomWindow && nextProps.chartOptions.zoomWindow.leftIndex && nextProps.chartOptions.zoomWindow.leftIndex - 1 !== this.state.windowLeftIndex) {
        this.setLeftWindowDefaultIndex();
      }
      if (nextProps.chartOptions.zoomWindow && nextProps.chartOptions.zoomWindow.rightIndex && nextProps.chartOptions.zoomWindow.rightIndex - 1 !== this.state.windowRightIndex) {
        this.setRightWindowDefaultIndex();
      }
      this.prepareDataSet();
      this.state.leftOffset = this.state.hScrollLeftOffset = this.state.windowLeftIndex * 100 / (this.state.maxSeriesLenFS - 1);
      this.state.rightOffset = this.state.hScrollRightOffset = this.state.windowRightIndex * 100 / (this.state.maxSeriesLenFS - 1);
      if (!this.storeData.getValue('parseAsNumber')) {
        this.state.clipLeftOffset = this.state.leftOffset;
        this.state.clipRightOffset = this.state.rightOffset;
      }
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

        <Grid opts={this.CHART_OPTIONS?.gridBox || {}} posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop}
          width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} yAxisType={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type}
          vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
        </Grid>

        {((this.state.cs.dataSet.xAxis.markRegions instanceof Array && this.state.cs.dataSet.xAxis.markRegions.length) || (this.state.cs.dataSet.yAxis.primary.markRegions instanceof Array && this.state.cs.dataSet.yAxis.primary.markRegions.length)) &&
          <MarkRegion posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop} xMarkRegions={this.state.cs.dataSet.xAxis.markRegions || []} yMarkRegions={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].markRegions || []}
            xAxisType={this.state.cs.dataSet.xAxis.type} yAxisType={this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].type} width={this.CHART_DATA.gridBoxWidth} height={this.CHART_DATA.gridBoxHeight} yInterval={this.state.cs[AXIS_PRIORITY.PRIMARY].yInterval}
            paddingX={this.CHART_DATA.paddingX} leftIndex={this.state.windowLeftIndex} vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange} allCategorySet={this.state.cs.dataSet.xAxis.allCategories}>
          </MarkRegion>
        }
        
        <g class='sc-chart-area-container'>
          {this.drawSeries()}
        </g>

        {this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY].enable &&
          this.drawYAxis(this.state.cs.dataSet.yAxis[AXIS_PRIORITY.PRIMARY], AXIS_PRIORITY.PRIMARY)}

        {this.state.cs.dataSet.yAxis[AXIS_PRIORITY.SECONDARY] && this.state.cs.dataSet.yAxis[AXIS_PRIORITY.SECONDARY].enable &&
          this.drawYAxis(this.state.cs.dataSet.yAxis[AXIS_PRIORITY.SECONDARY], AXIS_PRIORITY.SECONDARY)
        }

        {this.state.cs.dataSet.xAxis.enable && this.state.cs.dataSet.xAxis.positionOpposite === false &&
          <g class="sc-x-axis-group">
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
              categorySet={this.state.cs.dataSet.xAxis.selectedSkippedCategories} paddingX={this.CHART_DATA.paddingX} accessibilityId={this.hLabelAccId}
              clip={{
                x: this.state.offsetLeftChange,
                width: this.CHART_DATA.gridBoxWidth
              }} >
            </HorizontalLabels>
          </g>
        }

        {this.state.cs.dataSet.xAxis.enable && this.state.cs.dataSet.xAxis.positionOpposite === true &&
          <g class="sc-x-axis-group">
            <TextBox class="sc-horizontal-axis-title" posX={(this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2))}
              posY={(this.CHART_DATA.marginTop - (this.CHART_DATA.dataSet.xAxis.labelAlign === VERTICAL_ALIGN.TOP ? this.CHART_DATA.hLabelHeight : this.CHART_DATA.hLabelHeight / 2) - 5)}
              bgColor={this.CHART_OPTIONS.bgColor || '#fff'} textColor={this.CHART_DATA.dataSet.xAxis.titleColor || defaultConfig.theme.fontColorDark} bgOpacity={0.6} borderRadius={1} padding={5} stroke='none'
              textAnchor="middle" fontWeight="bold" text={this.CHART_DATA.dataSet.xAxis.title}
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
              categorySet={this.state.cs.dataSet.xAxis.selectedSkippedCategories} paddingX={this.CHART_DATA.paddingX} accessibilityId={this.hLabelAccId}
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
            allCategorySet={this.state.cs.dataSet.xAxis.allCategories} paddingX={this.CHART_DATA.paddingX} leftIndex={this.state.windowLeftIndex} vTransformX={this.CHART_DATA.paddingX - this.state.offsetLeftChange}>
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
      let seriesTotalDataCount: number = this.CHART_DATA.dataSet.series[series.index].dataDimIndex.bottom(Infinity).filter((v: ISeriesData) => v !== null).length;
      let yAxisFollow = series.yAxisLinkIndex === 0 || !series.yAxisLinkIndex ? AXIS_PRIORITY.PRIMARY : AXIS_PRIORITY.SECONDARY;
      let width = this.CHART_DATA.gridBoxWidth + this.state.offsetLeftChange + this.state.offsetRightChange;
      let height = this.CHART_DATA.gridBoxHeight;
      let maxVal = this.state.cs[yAxisFollow].yInterval.iMax;
      let minVal = this.state.cs[yAxisFollow].yInterval.iMin;
      let yAxisInfo = this.state.cs.dataSet.yAxis[yAxisFollow];

      let scale = this.createIntervalY(height, maxVal, minVal, yAxisInfo);
      return (
        <DrawConnectedPoints dataSet={series.valueSet} categorySet={series.categorySet} index={series.index} instanceId={'cs-' + series.index} name={series.name} posX={this.CHART_DATA.marginLeft - this.state.offsetLeftChange} posY={this.CHART_DATA.marginTop} paddingX={this.CHART_DATA.paddingX}
          width={width} height={height} maxSeriesLen={this.state.maxSeriesLen} areaFillColor={series.areaColor} lineFillColor={series.lineColor} fillOptions={series.fillOptions || {}}
          lineDropShadow={(this as any).context.chartType === CHART_TYPE.LINE_CHART && typeof series.dropShadow === 'undefined' ? true : series.dropShadow || false} strokeOpacity={series.lineOpacity || 1} opacity={series.areaOpacity || 0.2} spline={typeof series.spline === 'undefined' ? true : series.spline}
          marker={typeof series.marker === 'object' ? series.marker : {}} customizedMarkers={series.customizedMarkers || []} centerSinglePoint={isBothSinglePoint} lineStrokeWidth={series.lineWidth} lineStyle={series.lineStyle || LINE_STYLE.SOLID} lineDashArray={series.lineDashArray || '0'} areaStrokeWidth={0} maxVal={maxVal} minVal={minVal}
          dataPoints={true} dataLabels={series.dataLabels} seriesLabel={series.seriesLabel} animated={series.animated == undefined ? true : !!series.animated} shouldRender={true} tooltipOpt={this.CHART_OPTIONS.tooltip} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo}
          totalSeriesCount={this.CHART_DATA.dataSet.series.length} totalDataCount={seriesTotalDataCount} accessibility={true} accessibilityText={series.a11y ? series.a11y.description || '' : ''}
          scaleY={scale.scaleY} baseLine={scale.baseLine} isFS={false}
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

      const scale = this.createIntervalY(height, maxVal, minVal, yAxisInfo, false);
      return (
        <g class='sc-fs-chart-area-container'>
          <DrawConnectedPoints dataSet={series.valueSet} categorySet={series.categorySet} index={series.index} instanceId={'fs-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={width} height={this.CHART_OPTIONS.horizontalScroller.height - 5} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#efefef' lineFillColor='#dedede' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} lineStyle={LINE_STYLE.SOLID} lineDashArray={'0'} areaStrokeWidth={1}
            maxVal={maxVal} minVal={minVal} dataPoints={false} dataLabels={false} seriesLabel={false} customizedMarkers={[]} animated={false} shouldRender={this.state.shouldFSRender} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo}
            accessibility={false} scaleY={scale.scaleY} baseLine={scale.baseLine} isFS={true}
            clipId={this.scrollOffsetClipId}>
          </DrawConnectedPoints>
          <DrawConnectedPoints dataSet={series.valueSet} categorySet={series.categorySet} index={series.index} instanceId={'fs-clip-' + series.index} name={series.name} posX={marginLeft} posY={marginTop} paddingX={0}
            width={this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth} height={height} maxSeriesLen={this.state.maxSeriesLenFS} areaFillColor='#cccccc' lineFillColor='#777' fillOptions={{}}
            lineDropShadow={false} opacity={0.5} spline={typeof series.spline === 'undefined' ? true : series.spline} marker={{ enable: false }} centerSinglePoint={false} lineStrokeWidth={1} lineStyle={LINE_STYLE.SOLID} lineDashArray={'0'} areaStrokeWidth={1}
            maxVal={maxVal} minVal={minVal} dataPoints={false} dataLabels={false} seriesLabel={false} customizedMarkers={[]} animated={false} shouldRender={this.state.shouldFSRender} clipId={this.scrollWindowClipId} xAxisInfo={this.state.cs.dataSet.xAxis} yAxisInfo={yAxisInfo} accessibility={false}
            scaleY={scale.scaleY} baseLine={scale.baseLine} isFS={true}>
          </DrawConnectedPoints>
        </g>
      );
    });
  }

  getSeriesLabel(): IVnode {
    this.storeData.removeValue('seriesLabelData');
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
        <g class="sc-y-axis-group">
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
            posX={this.CHART_DATA.marginLeft} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight} maxVal={this.state.cs[priority].yInterval.iMax} minVal={this.state.cs[priority].yInterval.iMin} valueInterval={this.state.cs[priority].valueInterval}
            labelCount={this.state.hGridCount[priority]} intervalLen={this.state.gridHeight[priority]} maxWidth={this.CHART_DATA.vLabelWidth} accessibilityId={this.vLabelAccId} >
          </VerticalLabels>
        </g>
      );
    } else if (yAxis.positionOpposite) {
      return (
        <g class="sc-y-axis-group">
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
            posX={this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth} posY={this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight} maxVal={this.state.cs[priority].yInterval.iMax} minVal={this.state.cs[priority].yInterval.iMin} valueInterval={this.state.cs[priority].valueInterval}
            labelCount={this.state.hGridCount[priority]} intervalLen={this.state.gridHeight[priority]} maxWidth={this.CHART_DATA.vLabelWidth} accessibilityId={this.vLabelAccId} >
          </VerticalLabels>
        </g>
      );
    }
  }

  onHScroll(hScrollEvent: IHScrollOffsetEvent) {
    let maxSeriesLenFS = this.state.maxSeriesLenFS;
    let leftIndex = 0;
    let rightIndex = 0;
    this.state.hScrollLeftOffset = hScrollEvent.leftOffset;
    this.state.hScrollRightOffset = hScrollEvent.rightOffset;
    if (!this.storeData.getValue('parseAsNumber')) {
      leftIndex = Math.floor((maxSeriesLenFS - 1) * hScrollEvent.leftOffset / 100);
      rightIndex = Math.ceil((maxSeriesLenFS - 1) * hScrollEvent.rightOffset / 100);
      this.setScrollWindowIndexes(leftIndex, rightIndex);
    }
    this.emitter.emit('onUpdateRangeVal', {
      rangeTipPoints: this.getRangeVal(hScrollEvent.leftHandlePos, hScrollEvent.rightHandlePos, hScrollEvent.leftOffset, hScrollEvent.rightOffset)
    });
    this.calcOffsetChanges();
    this.createIntervalX();
    this.hideTip();
    this.update();
  }

  setScrollWindowIndexes(leftIndex: number, rightIndex: number) {
    let maxSeriesLenFS = this.state.maxSeriesLenFS;
    let hScrollIntervalPercent = 100 / (maxSeriesLenFS - 1);
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
  }

  calcOffsetChanges() {
    let fsScaleX = this.storeData.getValue('fsScaleX');
    let csScaleX = this.storeData.getValue('scaleX');
    let fsWidth = this.CHART_OPTIONS.horizontalScroller.width || this.CHART_DATA.gridBoxWidth;
    let leftOffsetDiff = this.state.hScrollLeftOffset - this.state.clipLeftOffset;
    let fsOffsetLeft = fsWidth * leftOffsetDiff / 100;
    this.state.offsetLeftChange = fsOffsetLeft / fsScaleX * csScaleX;

    let rightOffsetDiff = this.state.clipRightOffset - this.state.hScrollRightOffset;
    let fsOffsetRight = fsWidth * rightOffsetDiff / 100;
    this.state.offsetRightChange = fsOffsetRight / fsScaleX * csScaleX;
  }

  getRangeVal(leftHandlePos: Point, rightHandlePos: Point, leftOffset: number, rightOffset: number): RangePoint[] {
    const leftRangePoint = new RangePoint(leftHandlePos.x - this.CHART_DATA.marginLeft, leftHandlePos.y - 5);
    const rightRangePoint = new RangePoint(rightHandlePos.x - this.CHART_DATA.marginLeft, rightHandlePos.y - 5);
    const xAxis = this.state.cs.dataSet.xAxis;
    if (!xAxis.selectedCategories.length) {
      leftRangePoint.value = undefined;
      rightRangePoint.value = undefined;
      return [leftRangePoint, rightRangePoint];
    }
    let lRangeVal = xAxis.selectedCategories[0];
    if (this.storeData.getValue('parseAsNumber')) {
      lRangeVal = Math.floor(xAxis.categoryMinimaOfAllSeries + (xAxis.categoryMaximaOfAllSeries - xAxis.categoryMinimaOfAllSeries) * leftOffset / 100);
    }
    lRangeVal = xAxis.categories.parseAsDate && UtilCore.isDate(lRangeVal) ? UtilCore.dateFormat(lRangeVal).format(xAxis.categories.displayDateFormat || defaultConfig.formatting.displayDateFormat) : lRangeVal;
    leftRangePoint.value = (xAxis.prepend ? xAxis.prepend : '') + lRangeVal + (xAxis.append ? xAxis.append : '');

    let rRangeVal = xAxis.selectedCategories[xAxis.selectedCategories.length - 1];
    if (this.storeData.getValue('parseAsNumber')) {
      rRangeVal = Math.floor(xAxis.categoryMinimaOfAllSeries + (xAxis.categoryMaximaOfAllSeries - xAxis.categoryMinimaOfAllSeries) * rightOffset / 100);
    }
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