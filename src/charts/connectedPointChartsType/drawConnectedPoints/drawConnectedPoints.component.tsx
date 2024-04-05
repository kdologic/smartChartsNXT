'use strict';

import { AXIS_TYPE, CHART_TYPE, FILL_TYPE, ICON_TYPE, LINE_STYLE } from '../../../global/global.enums';
import { DataPoint } from '../../../core/point';
import { Component } from '../../../viewEngin/pview';
import GeomCore from '../../../core/geom.core';
import UiCore from '../../../core/ui.core';
import UtilCore from '../../../core/util.core';
import StoreManager from '../../../liveStore/storeManager';
import DataPoints from '../../../components/dataPoints/dataPoints.component';
import DataLabels from '../../../components/dataLabels/dataLabels.component';
import eventEmitter, { CustomEvents } from '../../../core/eventEmitter';
import Easing from '../../../plugIns/easing';
import a11yFactory, { A11yWriter } from '../../../core/a11y';
import { IInteractiveKeyboardEvent, IInteractiveMouseEvent } from '../interactivePlane/interactivePlane.model';
import { IHighlightPointMarkerEvent } from '../../../components/dataPoints/dataPoints.model';
import { HIGHLIGHT_EVENT_TYPE, IDrawConnectedPointsProps, IHighlightConfigEvent } from './drawConnectedPoints.model';
import Store from '../../../liveStore/store';
import { CategoryLabelType } from '../connectedPointChartsType.model';
import { IVnode } from '../../../viewEngin/component.model';
import { IPathSegment } from '../../../core/core.model';

/**
 * drawConnectedPoints.component.tsx
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create an area based on input points.
 * @extends Component
 * @event
 * 1. onUpdateScale : update scaleX and scaleY.
 */

class DrawConnectedPoints extends Component<IDrawConnectedPointsProps> {
  private emitter: CustomEvents;
  private store: Store;
  private a11yWriter: A11yWriter;
  private rid: string;
  private clipPathId: string;
  private shadowId: string;
  private defaultMarkerWidth: number;
  private defaultMarkerHeight: number;
  private liveRegionId: string;

  constructor(props: IDrawConnectedPointsProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.store = StoreManager.getStore((this as any).context.runId);
    this.a11yWriter = a11yFactory.getWriter((this as any).context.runId);
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
      strokeWidth: this.props.lineStrokeWidth || 0,
      lineDashArray: 0,
      opacity: typeof this.props.opacity === 'undefined' ? 1 : this.props.opacity,
      currentHighlightedPoint: {
        pointIndex: null
      },
      animated: this.props.animated,
      fillType: FILL_TYPE.SOLID_COLOR,
      fillBy: this.props.areaFillColor,
      hasDataLabels: this.props.dataLabels ? (typeof this.props.dataLabels.enable === 'undefined' ? true : !!this.props.dataLabels.enable) : false
    };

    this.defaultMarkerWidth = 12;
    this.defaultMarkerHeight = 12;

    if (this.props.lineStyle === LINE_STYLE.DASHED) {
      this.state.lineDashArray = this.props.lineDashArray || 4;
    }

    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: this.props.width,
      height: this.props.height
    }, this.props.clip);

    let fillOpt = UiCore.processFillOptions(this.props.fillOptions, this.rid);
    if (fillOpt.fillBy === 'none') {
      this.state.fillType = FILL_TYPE.SOLID_COLOR;
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

    this.interactiveMouseMove = this.interactiveMouseMove.bind(this);
    this.interactiveMouseLeave = this.interactiveMouseLeave.bind(this);
    this.interactiveKeyPress = this.interactiveKeyPress.bind(this);
    this.changeAreaBrightness = this.changeAreaBrightness.bind(this);

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

  shouldUpdate(): boolean {
    return this.props.shouldRender;
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('interactiveMouseMove', this.interactiveMouseMove);
    this.emitter.on('interactiveMouseLeave', this.interactiveMouseLeave);
    this.emitter.on('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.on('changeAreaBrightness', this.changeAreaBrightness);
    this.state.animated = false;
  }

  afterUpdate(): void {
    let rangeStart: CategoryLabelType = '';
    let rangeEnd: CategoryLabelType = '';
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

  beforeUnmount(): void {
    this.emitter.removeListener('interactiveMouseMove', this.interactiveMouseMove);
    this.emitter.removeListener('interactiveMouseLeave', this.interactiveMouseLeave);
    this.emitter.removeListener('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.removeListener('changeAreaBrightness', this.changeAreaBrightness);
    this.store.setValue('pointsData', { [this.props.instanceId]: [] });
  }

  propsWillReceive(nextProps: IDrawConnectedPointsProps): void {
    this.prepareData(nextProps);
    let fillOpt = UiCore.processFillOptions(this.props.fillOptions);
    if (fillOpt.fillBy === 'none') {
      this.state.fillType = FILL_TYPE.SOLID_COLOR;
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
    if (nextProps.lineStyle === LINE_STYLE.DASHED) {
      this.state.lineDashArray = nextProps.lineDashArray || 4;
    }
    this.state.hasDataLabels = this.props.dataLabels ? (typeof this.props.dataLabels.enable === 'undefined' ? true : !!this.props.dataLabels.enable) : false;
    this.store.setValue('pointsData', { [nextProps.instanceId]: this.state.pointSet });
  }

  prepareData(props: IDrawConnectedPointsProps) {
    this.state.valueSet = props.dataSet;
    this.state.scaleX = props.scaleX;
    this.state.scaleY = props.scaleY;
    this.state.baseLine = props.baseLine;

    if (typeof props.marker === 'object') {
      this.state.marker = {
        ...{
          enable: true,
          type: ICON_TYPE.CIRCLE,
          width: this.defaultMarkerWidth,
          height: this.defaultMarkerHeight,
          URL: '',
          opacity: 1
        }, ...props.marker
      };
    }

    this.state.marker.opacity = this.state.scaleX < 15 ? 0 : this.state.marker.opacity;
    if (this.props.emitScale) {
      this.emitter.emitSync('onUpdateScale', {
        scaleX: this.state.scaleX,
        scaleY: this.state.scaleY,
        baseLine: this.state.baseLine
      });
    }
  }

  render(): IVnode {
    let ariaLabel = '';
    if (this.props.accessibility) {
      ariaLabel = `Series ${this.props.name}, ${(this as any).context.chartType.replace('Chart', '')} ${this.props.index + 1} of ${this.props.totalSeriesCount} with ${this.props.totalDataCount} data points. ${this.props.accessibilityText || ''}`;
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
        {(this as any).context.chartType === CHART_TYPE.AREA_CHART && this.state.fillType !== FILL_TYPE.SOLID_COLOR &&
          UiCore.generateFillElem(this.state.fillId, this.state.fillType, this.props.fillOptions, this.props.areaFillColor)
        }
        {this.props.lineDropShadow &&
          UiCore.dropShadow(this.shadowId)
        }
        {(this as any).context.chartType === CHART_TYPE.AREA_CHART &&
          <path class={`sc-series-area-path-${this.props.index}`} stroke={this.props.areaFillColor} fill={this.state.fillBy}
            d={this.state.areaPath.join(' ')} stroke-width={this.props.areaStrokeWidth || 0} opacity={this.state.opacity} >
          </path>
        }
        {typeof this.props.lineStrokeWidth !== 'undefined' &&
          <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.lineFillColor} stroke-opacity={this.state.strokeOpacity} d={this.state.linePath.join(' ')}
            filter={this.props.lineDropShadow ? `url(#${this.shadowId})` : ''} stroke-width={this.state.strokeWidth || 0} fill='none' opacity='1' stroke-dasharray={this.state.lineDashArray} stroke-linecap="round">
          </path>
        }
        {this.props.dataPoints && !this.state.isAnimationPlaying && this.state.marker.enable &&
          <DataPoints instanceId={this.props.index.toString()} pointSet={this.state.pointSet} seriesName={this.props.name} xAxisInfo={this.props.xAxisInfo} yAxisInfo={this.props.yAxisInfo}
            type={this.state.marker.type} markerWidth={this.state.marker.width} markerHeight={this.state.marker.height} markerURL={this.state.marker.URL || ''} customizedMarkers={this.props.customizedMarkers}
            fillColor={this.props.lineFillColor || this.props.areaFillColor} opacity={this.state.marker.opacity} events={this.state.marker.events || {}} >
          </DataPoints>
        }
        {this.state.hasDataLabels && !this.state.isAnimationPlaying && this.props.dataLabels &&
          <DataLabels instanceId={'dl' + this.props.index} pointSet={this.state.pointSet} opts={this.props.dataLabels} clip={this.state.clip} />
        }
      </g>
    );
  }

  getAreaPath(lineSegments: IPathSegment[]): IPathSegment {
    let linePath = [];
    for (let i = 0; i < lineSegments.length; i++) {
      let segment: IPathSegment = lineSegments[i];
      if (segment.length === 0) {
        continue;
      }
      let startSegIndex = i === 0 ? 0 : this.state.lineSegments.segmentIndexes[i - 1] + 1;
      let endSegIndex = this.state.lineSegments.segmentIndexes[i];
      for (let s of segment) {
        linePath.push(s);
      }
      linePath.push('L', this.state.pointSet[endSegIndex - 1].x, this.state.baseLine, 'L', this.state.pointSet[startSegIndex].x, this.state.baseLine, 'Z');
    }
    return linePath;
  }

  getLinePath(props: IDrawConnectedPointsProps): { pathSegments: IPathSegment[], path: IPathSegment, segmentIndexes: number[] } {
    let path: IPathSegment[] = [];
    let pathSegment: IPathSegment = [];
    let segmentIndexes: number[] = [];
    let sIndex: number = 0;
    this.state.pointSet = this.state.valueSet.map((data: number, i: number) => {
      if (this.props.yAxisInfo.type === AXIS_TYPE.LOGARITHMIC && data !== null) {
        data = Math.log10(data);
      }
      let point: DataPoint = new DataPoint((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new DataPoint(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
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

  getCurvedLinePath(props: IDrawConnectedPointsProps): { pathSegments: IPathSegment[], path: IPathSegment, segmentIndexes: number[] } {
    let path: IPathSegment[] = [];
    let pointSegments: DataPoint[][] = [];
    let pathSegment: DataPoint[] = [];
    let segmentIndexes: number[] = [];
    this.state.pointSet = this.state.valueSet.map((data: number, i: number) => {
      if (this.props.yAxisInfo.type === AXIS_TYPE.LOGARITHMIC && data !== null) {
        data = Math.log10(data);
      }
      let point: DataPoint = new DataPoint((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new DataPoint(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
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
    for (let pointSegment of pointSegments) {
      if (pointSegment.length === 0) {
        path.push([]);
      } else if (pointSegment.length === 1) {
        path.push(['M', this.state.pointSet[0].x, this.state.pointSet[0].y]);
      } else {
        path.push(GeomCore.catmullRomFitting(pointSegment, 0.1) as IPathSegment);
      }
    }
    segmentIndexes.push(this.state.pointSet.length);
    return {
      pathSegments: path,
      path: path.flat(),
      segmentIndexes
    };
  }

  interactiveMouseMove(eventData: IInteractiveMouseEvent): void {
    if (!this.props.dataPoints || this.state.isAnimationPlaying) {
      return void 0;
    }
    let highlightEventData: IHighlightPointMarkerEvent = {
      event: eventData.event,
      highlightedPoint: {
        x: 0,
        y: 0,
        relX: 0,
        relY: 0,
        dist: 0,
        pointIndex: null,
        seriesIndex: 0,
        offsetLeft: 0
      }
    };
    const mousePos = eventData.mousePos;
    const pt = new DataPoint(mousePos.x - this.props.posX, mousePos.y - this.props.posY);
    let pointSet = this.state.pointSet;
    if (this.props.clip.offsetLeft > this.state.marker.width / 2) {
      pointSet = pointSet.slice(1);
    }
    if (pointSet.length && +pointSet[pointSet.length - 1].x.toFixed(3) > +(this.state.clip.x + this.state.clip.width).toFixed(3)) {
      pointSet = pointSet.slice(0, pointSet.length - 1);
    }
    const nearPoint: DataPoint = GeomCore.findClosestPoint(pointSet, pt, this.props.tooltipOpt.grouped);
    this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
    const pointerVicinity: number = this.props.tooltipOpt.pointerVicinity || (this.state.scaleX / 2);
    if (nearPoint.dist <= pointerVicinity) {
      highlightEventData.highlightedPoint = {
        x: (this.props.posX + nearPoint.x),
        y: (this.props.posY + nearPoint.y),
        relX: nearPoint.x,
        relY: nearPoint.y,
        dist: nearPoint.dist,
        pointIndex: nearPoint.index,
        seriesIndex: this.props.index,
        offsetLeft: this.state.clip.offsetLeft
      };
    } else {
      highlightEventData.highlightedPoint.pointIndex = null;
    }
    this.state.currentHighlightedPoint = highlightEventData.highlightedPoint;
    this.emitter.emitSync('highlightPointMarker', highlightEventData);
  }

  interactiveMouseLeave(): void {
    if (this.props.dataPoints && !this.state.isAnimationPlaying) {
      this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
    }
  }

  interactiveKeyPress(eventData: IInteractiveKeyboardEvent): void {
    if (!this.props.dataPoints || this.state.isAnimationPlaying) {
      return void 0;
    }
    if (eventData.event.code == 'ArrowLeft' || eventData.event.code == 'ArrowRight') {
      let highlightEventData: IHighlightPointMarkerEvent = {
        event: eventData.event,
        highlightedPoint: {
          x: 0,
          y: 0,
          relX: 0,
          relY: 0,
          dist: 0,
          pointIndex: null,
          seriesIndex: 0,
          offsetLeft: 0
        }
      };
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
      if (eventData.event.code == 'ArrowLeft') {
        nextPointIndex = this.state.currentHighlightedPoint.pointIndex === null ? pointSet[pointSet.length - 1].index : this.state.currentHighlightedPoint.pointIndex - 1;
      }

      const nearPoint: DataPoint = pointSet.find((p: DataPoint) => p.index === nextPointIndex);
      if (nearPoint) {
        this.emitter.emitSync('normalizeAllPointMarker', { seriesIndex: this.props.index });
        highlightEventData.highlightedPoint = {
          x: (this.props.posX + nearPoint.x),
          y: (this.props.posY + nearPoint.y),
          relX: nearPoint.x,
          relY: nearPoint.y,
          dist: 0,
          pointIndex: nearPoint.index,
          seriesIndex: this.props.index,
          offsetLeft: this.state.clip.offsetLeft
        };
      } else {
        highlightEventData.highlightedPoint.pointIndex = null;
      }
      this.state.currentHighlightedPoint = highlightEventData.highlightedPoint;
      this.emitter.emitSync('highlightPointMarker', highlightEventData);
    }
  }

  changeAreaBrightness(event: IHighlightConfigEvent): void {
    if (this.props.instanceId === event.instanceId && event.strokeOpacity) {
      this.setState({ strokeOpacity: event.strokeOpacity, strokeWidth: event.type === HIGHLIGHT_EVENT_TYPE.HIGHLIGHT && this.props.lineStrokeWidth ? this.props.lineStrokeWidth + 1 : (this.props.lineStrokeWidth || 0), opacity: event.opacity || this.props.opacity || 1 });
    }
  }

  getScaleKeyframe(): string {
    return (`
      ${this.generateAnimKeyframe(600, 100)}
      .sc-area-fill-${this.props.instanceId} {
        transform: translate(${this.props.posX}px, ${this.props.posY}px);
        animation: scale-easeOutElastic-${this.props.instanceId} 1.5s linear both;
      }
    `);
  }

  generateAnimKeyframe(duration: number, steps: number = 10): string {
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