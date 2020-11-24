'use strict';

import { CHART_TYPE, OPTIONS_TYPE as ENUMS } from './../../settings/globalEnums';
import Point from './../../core/point';
import { Component } from './../../viewEngin/pview';
import GeomCore from './../../core/geom.core';
import UiCore from './../../core/ui.core';
import UtilCore from './../../core/util.core';
import StoreManager from './../../liveStore/storeManager';
import DataPoints from './../../components/dataPoints';
import DataLabels from './../../components/dataLabels';
import eventEmitter from './../../core/eventEmitter';
import Easing from './../../plugIns/easing';
import a11yFactory from './../../core/a11y';

/**
 * drawConnectedPoints.js
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create an area based on input points.
 * @extends Component
 */

class DrawConnectedPoints extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.store = StoreManager.getStore(this.context.runId);
    this.a11yWriter = a11yFactory.getWriter(this.context.runId);
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.shadowId = 'sc-area-fill-shadow-' + this.rid;
    this.state = {
      scaleX: 0,
      scaleY: 0,
      baseLine: 0,
      pointSet: [],
      valueSet: [],
      strokeOpacity: this.props.strokeOpacity || 1,
      opacity: typeof this.props.opacity === 'undefined' ? 1 : this.props.opacity,
      currentHighlightedPoint: {
        pointIndex: null
      },
      animated: this.props.animated,
      fillType: 'solidColor',
      fillBy: this.props.areaFillColor,
      hasDataLabels: this.props.dataLabels ? (typeof this.props.dataLabels.enable === 'undefined' ? true : !!this.props.dataLabels.enable) : false
    };

    this.defaultMarkerWidth = 12;
    this.defaultMarkerHeight = 12;

    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: this.props.width,
      height: this.props.height
    }, this.props.clip);

    let fillOpt = UiCore.processFillOptions(this.props.fillOptions, this.rid);
    if (fillOpt.fillBy === 'none') {
      this.state.fillType = 'solidColor';
      this.state.fillBy = this.props.areaFillColor;
    } else {
      this.state.fillType = fillOpt.fillType;
      this.state.fillBy = fillOpt.fillBy;
      this.state.fillId = fillOpt.fillId;
    }
    if (typeof this.store.getValue('pointsData') === 'undefined') {
      this.store.setValue('pointsData', {});
    }

    this.prepareData(this.props);
    this.state.lineSegments = this.props.spline ? this.getCurvedLinePath(this.props) : this.getLinePath(this.props);
    this.state.linePath = this.state.lineSegments.path;
    this.state.areaPath = this.getAreaPath(this.state.lineSegments.pathSegments.slice());
    this.store.setValue('pointsData', { [this.props.instanceId]: this.state.pointSet });

    this.mouseMoveBind = this.interactiveMouseMove.bind(this);
    this.mouseLeaveBind = this.interactiveMouseLeave.bind(this);
    this.interactiveKeyPress = this.interactiveKeyPress.bind(this);
    this.changeAreaBrightnessBind = this.changeAreaBrightness.bind(this);

    /* For accessibility */
    if (this.props.accessibility) {
      this.liveRegionId = UtilCore.getRandomID();
      this.a11yWriter.createSpace(this.liveRegionId)
        .config({
          attrs: {
            'aria-live': 'polite',
            'aria-atomic': true
          }
        });
    }
  }

  shouldUpdate() {
    return this.props.shouldRender;
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.on('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.on('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.on('changeAreaBrightness', this.changeAreaBrightnessBind);
    this.state.animated = false;
  }

  afterUpdate() {
    let rangeStart = '', rangeEnd = '';
    if (this.props.accessibility) {
      rangeStart = this.props.xAxisInfo.selectedCategories[0];
      if (this.props.xAxisInfo.categories.parseAsDate && UtilCore.isDate(rangeStart)) {
        rangeStart = UtilCore.dateFormat(rangeStart).format('LL');
      }
      rangeEnd = this.props.xAxisInfo.selectedCategories[this.props.xAxisInfo.selectedCategories.length - 1];
      if (this.props.xAxisInfo.categories.parseAsDate && UtilCore.isDate(rangeEnd)) {
        rangeEnd = UtilCore.dateFormat(rangeEnd).format('LL');
      }
      this.a11yWriter.write(this.liveRegionId, `<g>Series ${this.props.name}, displaying ${this.state.pointSet.length} data points. Range between ${this.props.xAxisInfo.title} : ${(this.props.xAxisInfo.prepend || '') + rangeStart + (this.props.xAxisInfo.append || '')} to ${(this.props.xAxisInfo.prepend || '') + rangeEnd + (this.props.xAxisInfo.append || '')}</g>`, true, 1000);
    }
  }

  beforeUnmount() {
    this.emitter.removeListener('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.removeListener('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.removeListener('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.removeListener('changeAreaBrightness', this.changeAreaBrightnessBind);
    this.store.setValue('pointsData', { [this.props.instanceId]: [] });
  }

  propsWillReceive(nextProps) {
    this.prepareData(nextProps);
    let fillOpt = UiCore.processFillOptions(this.props.fillOptions);
    if (fillOpt.fillBy === 'none') {
      this.state.fillType = 'solidColor';
      this.state.fillBy = this.props.areaFillColor;
    } else {
      this.state.fillType = fillOpt.fillType;
      this.state.fillBy = fillOpt.fillBy;
      this.state.fillId = fillOpt.fillId;
    }
    this.state.lineSegments = nextProps.spline ? this.getCurvedLinePath(nextProps) : this.getLinePath(nextProps);
    this.state.linePath = this.state.lineSegments.path;
    this.state.areaPath = this.getAreaPath(this.state.lineSegments.pathSegments.slice());
    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: nextProps.width,
      height: nextProps.height
    }, nextProps.clip);
    this.state.hasDataLabels = this.props.dataLabels ? (typeof this.props.dataLabels.enable === 'undefined' ? true : !!this.props.dataLabels.enable) : false;
    this.store.setValue('pointsData', { [nextProps.instanceId]: this.state.pointSet });
  }

  prepareData(props) {
    this.state.valueSet = props.dataSet;
    this.state.scaleX = (props.width - (2 * props.paddingX)) / (props.maxSeriesLen - 1 || 2);
    this.state.scaleY = props.height / (props.maxVal - props.minVal);
    this.state.baseLine = props.maxVal * this.state.scaleY;
    if (typeof props.marker === 'object') {
      this.state.marker = {
        ...{
          enable: true,
          type: ENUMS.ICON_TYPE.CIRCLE,
          width: this.defaultMarkerWidth,
          height: this.defaultMarkerHeight,
          URL: '',
          opacity: 1
        }, ...props.marker
      };
    }

    this.state.marker.opacity = this.state.scaleX < 15 ? 0 : this.state.marker.opacity;
    if (typeof props.getScaleX === 'function') {
      props.getScaleX(this.state.scaleX);
    }
  }

  render() {
    let ariaLabel = '';
    if (this.props.accessibility) {
      ariaLabel = `Series ${this.props.name}, ${this.context.chartType.replace('Chart', '')} ${this.props.index + 1} of ${this.props.totalSeriesCount} with ${this.props.totalDataCount} data points. ${this.props.accessibilityText || ''}`;
    }
    return (
      <g class={`sc-area-fill-${this.props.instanceId}`} transform={`translate(${this.props.posX}, ${this.props.posY})`} clip-path={`url(#${this.props.clipId || this.clipPathId})`}
        role='region' tabindex='-1' aria-hidden={!this.props.accessibility} aria-label={ariaLabel}>
        <remove-before-save>
          {this.props.animated &&
            <style>
              {this.getScaleKeyframe()}
            </style>
          }
        </remove-before-save>
        {this.props.clipId === undefined &&
          <defs>
            <clipPath id={this.clipPathId}>
              <rect x={this.state.clip.x} y={this.state.clip.y} width={this.state.clip.width} height={this.state.clip.height} />
            </clipPath>
          </defs>
        }
        {this.context.chartType === CHART_TYPE.AREA_CHART && this.state.fillType !== 'solidColor' &&
          UiCore.generateFillElem(this.state.fillId, this.state.fillType, this.props.fillOptions, this.props.areaFillColor)
        }
        {this.props.lineDropShadow &&
          UiCore.dropShadow(this.shadowId)
        }
        {this.context.chartType === CHART_TYPE.AREA_CHART &&
          <path class={`sc-series-area-path-${this.props.index}`} stroke={this.props.areaFillColor} fill={this.state.fillBy}
            d={this.state.areaPath.join(' ')} stroke-width={this.props.areaStrokeWidth || 0} opacity={this.state.opacity} >
          </path>
        }
        {typeof this.props.lineStrokeWidth !== 'undefined' &&
          <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.lineFillColor} stroke-opacity={this.state.strokeOpacity} d={this.state.linePath.join(' ')} filter={this.props.lineDropShadow ? `url(#${this.shadowId})` : ''} stroke-width={this.props.lineStrokeWidth || 0} fill='none' opacity='1'></path>
        }
        {this.props.dataPoints && !this.state.isAnimationPlaying && this.state.marker.enable &&
          <DataPoints instanceId={this.props.index} pointSet={this.state.pointSet} seriesName={this.props.name} xAxisInfo={this.props.xAxisInfo} yAxisInfo={this.props.yAxisInfo}
            type={this.state.marker.type} markerWidth={this.state.marker.width} markerHeight={this.state.marker.height} markerURL={this.state.marker.URL || ''} customizedMarkers={this.props.customizedMarkers} fillColor={this.props.areaFillColor || this.props.lineFillColor} opacity={this.state.marker.opacity} >
          </DataPoints>
        }
        {this.state.hasDataLabels && !this.state.isAnimationPlaying &&
          <DataLabels instanceId={'dl' + this.props.index} pointSet={this.state.pointSet} opts={this.props.dataLabels} clip={this.state.clip} />
        }
      </g>
    );
  }

  getAreaPath(lineSegments) {
    let linePath = [];
    for (let i = 0; i < lineSegments.length; i++) {
      let segment = lineSegments[i];
      if (segment.length === 0) {
        continue;
      }
      let startSegIndex = i === 0 ? 0 : this.state.lineSegments.segmentIndexes[i - 1] + 1;
      let endSegIndex = this.state.lineSegments.segmentIndexes[i];
      for (let s = 0; s < segment.length; s++) {
        linePath.push(segment[s]);
      }
      linePath.push('L', this.state.pointSet[endSegIndex - 1].x, this.state.baseLine, 'L', this.state.pointSet[startSegIndex].x, this.state.baseLine, 'Z');
    }
    return linePath;
  }

  getLinePath(props) {
    let path = [];
    let pathSegment = [];
    let segmentIndexes = [], sIndex = 0;
    this.state.pointSet = this.state.valueSet.map((data, i) => {
      let point = new Point((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if (data === null) {
        sIndex = -1;
        segmentIndexes.push(i);
        path.push(pathSegment.slice());
        pathSegment = [];
        point.isHidden = true;
      } else {
        if (sIndex === 0) {
          pathSegment.push('M', point.x, point.y);
        } else {
          pathSegment.push('L', point.x, point.y);
        }
      }
      sIndex++;
      point.index = i;
      point.value = data;
      return point;
    });
    path.push(pathSegment);
    segmentIndexes.push(this.state.pointSet.length);
    return {
      pathSegments: path,
      path: path.flat(),
      segmentIndexes
    };
  }

  getCurvedLinePath(props) {
    let path = [], pointSegments = [];
    let pathSegment = [];
    let segmentIndexes = [];
    this.state.pointSet = this.state.valueSet.map((data, i) => {
      let point = new Point((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if (data === null) {
        segmentIndexes.push(i);
        pointSegments.push(pathSegment.slice());
        pathSegment = [];
        point.isHidden = true;
      } else {
        pathSegment.push(point);
      }
      point.index = i;
      point.value = data;
      return point;
    });
    pointSegments.push(pathSegment);
    for (let i = 0; i < pointSegments.length; i++) {
      let pointSegment = pointSegments[i];
      if (pointSegment.length === 0) {
        path.push([]);
      } else if (pointSegment.length === 1) {
        path.push(['M', this.state.pointSet[0].x, this.state.pointSet[0].y]);
      } else {
        path.push(GeomCore.catmullRomFitting(pointSegment, 0.1));
      }
    }
    segmentIndexes.push(this.state.pointSet.length);
    return {
      pathSegments: path,
      path: path.flat(),
      segmentIndexes
    };
  }

  interactiveMouseMove(e) {
    if (!this.props.dataPoints || this.state.isAnimationPlaying) {
      return;
    }
    let evt = UtilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    const mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    const pt = new Point(mousePos.x - this.props.posX, mousePos.y - this.props.posY);
    let pointSet = this.state.pointSet;
    if (this.props.clip.offsetLeft > this.state.marker.width / 2) {
      pointSet = pointSet.slice(1);
    }
    if (pointSet.length && +pointSet[pointSet.length - 1].x.toFixed(3) > +(this.state.clip.x + this.state.clip.width).toFixed(3)) {
      pointSet = pointSet.slice(0, pointSet.length - 1);
    }
    const nearPoint = GeomCore.findClosestPoint(pointSet, pt, this.props.tooltipOpt.grouped);
    this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
    const pointerVicinity = this.props.tooltipOpt.pointerVicinity || (this.state.scaleX / 2);
    if (nearPoint.dist <= pointerVicinity) {
      evt.highlightedPoint = {
        x: (this.props.posX + nearPoint.x),
        y: (this.props.posY + nearPoint.y),
        relX: nearPoint.x,
        relY: nearPoint.y,
        dist: nearPoint.dist,
        pointIndex: nearPoint.index,
        seriesIndex: this.props.index
      };
    } else {
      evt.highlightedPoint = {
        pointIndex: null
      };
    }
    this.state.currentHighlightedPoint = evt.highlightedPoint;
    this.emitter.emitSync('highlightPointMarker', evt);
  }

  interactiveMouseLeave() {
    if (this.props.dataPoints && !this.state.isAnimationPlaying) {
      this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
    }
  }

  interactiveKeyPress(e) {
    if (!this.props.dataPoints || this.state.isAnimationPlaying) {
      return void 0;
    }
    let evt = UtilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    if (e.which == 37 || e.which == 39) {
      let pointSet = this.state.pointSet;
      if (this.props.clip.offsetLeft > this.state.marker.width / 2) {
        pointSet = pointSet.slice(1);
      }
      if (pointSet.length && +pointSet[pointSet.length - 1].x.toFixed(3) > +(this.state.clip.x + this.state.clip.width).toFixed(3)) {
        pointSet = pointSet.slice(0, pointSet.length - 1);
      }
      if (!pointSet.length) {
        return void 0;
      }
      let nextPointIndex = this.state.currentHighlightedPoint.pointIndex === null ? pointSet[0].index : this.state.currentHighlightedPoint.pointIndex + 1;
      if (e.which == 37) {
        nextPointIndex = this.state.currentHighlightedPoint.pointIndex === null ? pointSet[pointSet.length - 1].index : this.state.currentHighlightedPoint.pointIndex - 1;
      }

      const nearPoint = pointSet.find((p) => p.index === nextPointIndex);
      if (nearPoint) {
        this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
        evt.highlightedPoint = {
          x: (this.props.posX + nearPoint.x),
          y: (this.props.posY + nearPoint.y),
          relX: nearPoint.x,
          relY: nearPoint.y,
          dist: 0,
          pointIndex: nearPoint.index,
          seriesIndex: this.props.index
        };
      } else {
        evt.highlightedPoint = {
          pointIndex: null
        };
      }

      this.state.currentHighlightedPoint = evt.highlightedPoint;
      this.emitter.emitSync('highlightPointMarker', evt);
    }
  }

  changeAreaBrightness(e) {
    if (this.props.instanceId === e.instanceId && e.strokeOpacity) {
      this.setState({ strokeOpacity: e.strokeOpacity, opacity: e.opacity || this.props.opacity || 1 });
    }
  }

  getScaleKeyframe() {
    return (`
      ${this.generateAnimKeyframe(600, 100)}
      .sc-area-fill-${this.props.instanceId} {
        transform: translate(${this.props.posX}px, ${this.props.posY}px);
        animation: scale-easeOutElastic-${this.props.instanceId} 1.5s linear both;
      }
    `);
  }

  generateAnimKeyframe(duration, steps = 10) {
    let aStage = duration / steps;

    let keyFrame = `@keyframes scale-easeOutElastic-${this.props.instanceId} {`;
    for (let i = 0; i < steps; i++) {
      let stageNow = aStage * i;
      let scaleD = Easing.easeOutElastic(stageNow / duration).toFixed(2);
      let frame = `${Math.round(100 / steps * i)}% {
        transform: translate(${this.props.posX}px, ${this.props.posY}px) translate(${this.props.width / 2}px, ${this.props.height}px) scale(1, ${scaleD}) translate(${-this.props.width / 2}px, ${-this.props.height}px);
      }`;
      keyFrame += frame;
    }
    keyFrame += '}';
    return keyFrame;
  }
}

export default DrawConnectedPoints;