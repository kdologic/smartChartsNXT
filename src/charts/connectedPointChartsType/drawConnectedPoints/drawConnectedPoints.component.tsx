'use strict';

import { AXIS_TYPE, CHART_TYPE, FILL_TYPE, ICON_TYPE, LINE_STYLE } from '../../../global/global.enums';
import { DataPoint } from '../../../core/point';
import { Component } from '../../../viewEngin/pview';
import defaultConfig from '../../../settings/config';
import GeomCore from '../../../core/geom.core';
import UiCore from '../../../core/ui.core';
import UtilCore from '../../../core/util.core';
import storeManager from '../../../liveStore/storeManager';
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
 */

class DrawConnectedPoints extends Component<IDrawConnectedPointsProps> {
  private emitter: CustomEvents;
  private storeData: Store;
  private a11yWriter: A11yWriter;
  private rid: string;
  private clipPathId: string;
  private shadowId: string;
  private defaultMarkerWidth: number = 12;
  private defaultMarkerHeight: number = 12;
  private liveRegionId: string;
  private animationDuration = 500;

  constructor(props: IDrawConnectedPointsProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.storeData = storeManager.getStore((this as any).context.runId);
    this.a11yWriter = a11yFactory.getWriter((this as any).context.runId);
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.shadowId = 'sc-area-fill-shadow-' + this.rid;
    this.state = {
      scaleY: 0,
      baseLine: 0,
      pointSet: [],
      valueSet: [],
      lineSegments: [],
      linePath: [],
      straightLinePath: [],
      areaPath: [],
      straightAreaPath: [],
      strokeOpacity: 1,
      strokeWidth: 0,
      lineDashArray: 0,
      opacity: 1,
      currentHighlightedPoint: {
        pointIndex: null
      },
      animated: true,
      isAnimationPlaying: true,
      addStraightPathClass: true,
      fillType: FILL_TYPE.SOLID_COLOR,
      fillBy: defaultConfig.theme.fontColorHighlight,
      hasDataLabels: true
    };

    if (typeof this.storeData.getValue('pointsData') === 'undefined') {
      this.storeData.setValue('pointsData', {});
    }
    this.prepareStateData(this.props);
    this.state.animated = this.props.animated;
    this.state.isAnimationPlaying = !!this.props.animated;

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
    this.setState({ addStraightPathClass: false });
    setTimeout(() => {
      this.setState({ animated: false, isAnimationPlaying: false });
    }, this.animationDuration);
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
    this.storeData.setValue('pointsData', { [this.props.instanceId]: [] });
  }

  propsWillReceive(nextProps: IDrawConnectedPointsProps): void {
    this.prepareStateData(nextProps);
  }

  prepareStateData(props: IDrawConnectedPointsProps) {
    this.state = {
      ...this.state,
      ...{
        valueSet: props.dataSet,
        scaleY: props.scaleY,
        baseLine: props.baseLine,
        strokeOpacity: props.strokeOpacity || 1,
        strokeWidth: props.lineStrokeWidth || 0,
        opacity: typeof props.opacity === 'undefined' ? 1 : props.opacity,
        fillBy: props.areaFillColor,
        hasDataLabels: props.dataLabels ? (typeof props.dataLabels.enable === 'undefined' ? true : !!props.dataLabels.enable) : false
      }
    };

    const fillOpt = UiCore.processFillOptions(props.fillOptions, this.rid);
    if (fillOpt.fillBy === FILL_TYPE.NONE) {
      this.state.fillType = FILL_TYPE.SOLID_COLOR;
      this.state.fillBy = props.areaFillColor;
    } else {
      this.state.fillType = fillOpt.fillType;
      this.state.fillBy = fillOpt.fillBy;
      this.state.fillId = fillOpt.fillId;
    }

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

    if (this.storeData.getValue('parseAsNumber')) {
      this.state.marker.opacity = (this.state.valueSet.length * this.state.marker.width) / 1.5 > this.props.width ? 0 : this.state.marker.opacity;
    } else {
      const scaleX = this.storeData.getValue('scaleX');
      this.state.marker.opacity = scaleX < 15 ? 0 : this.state.marker.opacity;
    }

    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: props.width,
      height: props.height
    }, props.clip);

    if (props.lineStyle === LINE_STYLE.DASHED) {
      this.state.lineDashArray = props.lineDashArray || 4;
    }

    this.state.lineSegments = props.spline ? this.getCurvedLinePath(props) : this.getLinePath(props);
    this.state.linePath = this.state.lineSegments.path;
    this.state.straightLinePath = this.state.lineSegments.straightPathSegments.flat();
    let area = this.getAreaPath(this.state.lineSegments.pathSegments.slice(), this.state.lineSegments.straightPathSegments.slice());
    this.state.areaPath = area.areaPath;
    this.state.straightAreaPath = area.straightAreaPath;

    this.storeData.setValue('pointsData', { [props.instanceId]: this.state.pointSet });
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
          {this.props.animated && UtilCore.isSafari &&
            <style>
              {this.getScaleKeyframe()}
            </style>
          }
          {this.state.animated && !UtilCore.isSafari &&
            <style>
              {`
                #${(this as any).context.rootSvgId} .sc-series-area-path-${this.props.index}.animate, .sc-series-line-path-${this.props.index}.animate {
                  transition: d ${this.animationDuration / 1000}s ease;
                }
                #${(this as any).context.rootSvgId} .sc-series-area-path-${this.props.index}.flat-path {
                  d: path("${this.state.straightAreaPath.join(' ')}");
                }
                #${(this as any).context.rootSvgId} .sc-series-line-path-${this.props.index}.flat-path {
                  d: path("${this.state.straightLinePath.join(' ')}");
                }
              `}
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
          <path class={`sc-series-area-path-${this.props.index}${this.state.addStraightPathClass ? ' flat-path' : ''}${this.state.animated ? ' animate' : ''}`} stroke={this.props.areaFillColor} fill={this.state.fillBy}
            d={this.state.areaPath.join(' ')} stroke-width={this.props.areaStrokeWidth || 0} opacity={this.state.opacity} >
          </path>
        }
        {typeof this.props.lineStrokeWidth !== 'undefined' &&
          <path class={`sc-series-line-path-${this.props.index}${this.state.addStraightPathClass ? ' flat-path' : ''}${this.state.animated ? ' animate' : ''}`} stroke={this.props.lineFillColor} stroke-opacity={this.state.strokeOpacity} d={this.state.linePath.join(' ')}
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

  getAreaPath(lineSegments: IPathSegment[], straightLineSegments: IPathSegment[]): { areaPath: IPathSegment, straightAreaPath: IPathSegment } {
    let areaPath: IPathSegment = [];
    let straightAreaPath: IPathSegment = [];
    for (let i = 0; i < lineSegments.length; i++) {
      let segment: IPathSegment = lineSegments[i];
      if (segment.length === 0) {
        continue;
      }
      let startSegIndex = i === 0 ? 0 : this.state.lineSegments.segmentIndexes[i - 1] + 1;
      let endSegIndex = this.state.lineSegments.segmentIndexes[i];
      for (let s of segment) {
        areaPath.push(s);
      }
      for (let s of straightLineSegments[i]) {
        straightAreaPath.push(s);
      }
      let joiningPoint: IPathSegment = ['L', this.state.pointSet[endSegIndex - 1].x, this.state.baseLine, 'L', this.state.pointSet[startSegIndex].x, this.state.baseLine, 'Z'];
      areaPath.push(...joiningPoint);
      straightAreaPath.push(...joiningPoint);
    }
    return {
      areaPath: areaPath,
      straightAreaPath: straightAreaPath
    };
  }

  getLinePath(props: IDrawConnectedPointsProps): { pathSegments: IPathSegment[], path: IPathSegment, straightPathSegments: IPathSegment[], segmentIndexes: number[] } {
    let path: IPathSegment[] = [];
    let straightPath: IPathSegment[] = [];
    let pathSegment: IPathSegment = [];
    let straightPathSegment: IPathSegment = [];
    let segmentIndexes: number[] = [];
    let sIndex: number = 0;
    const xPositionWithDynamicScaleFn = this.props.isFS ? this.storeData.getValue('xPositionWithDynamicFSScaleFn') : this.storeData.getValue('xPositionWithDynamicScaleFn');
    this.state.pointSet = this.state.valueSet.map((data: number, index: number) => {
      if (this.props.yAxisInfo.type === AXIS_TYPE.LOGARITHMIC && data !== null) {
        data = Math.log10(data);
      }
      let x = xPositionWithDynamicScaleFn(index, this.props.categorySet[index]);
      let point: DataPoint = new DataPoint((x) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new DataPoint(x + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if (data === null) {
        sIndex = -1;
        segmentIndexes.push(index);
        path.push(pathSegment.slice());
        straightPath.push(straightPathSegment.slice());
        pathSegment = [];
        straightPathSegment = [];
        point.isHidden = true;
      } else {
        if (sIndex === 0) {
          pathSegment.push('M', point.x, point.y);
          straightPathSegment.push('M', point.x, this.state.baseLine);
        } else {
          pathSegment.push('L', point.x, point.y);
          straightPathSegment.push('L', point.x, this.state.baseLine);
        }
      }
      sIndex++;
      point.index = index;
      point.value = data;
      return point;
    });
    path.push(pathSegment);
    straightPath.push(straightPathSegment);
    segmentIndexes.push(this.state.pointSet.length);
    return {
      pathSegments: path,
      path: path.flat(),
      straightPathSegments: straightPath,
      segmentIndexes
    };
  }

  getCurvedLinePath(props: IDrawConnectedPointsProps): { pathSegments: IPathSegment[], path: IPathSegment, straightPathSegments: IPathSegment[], segmentIndexes: number[] } {
    let path: IPathSegment[] = [];
    let straightPath: IPathSegment[] = [];
    let pointSegments: DataPoint[][] = [];
    let pathSegment: DataPoint[] = [];
    let segmentIndexes: number[] = [];
    const xPositionWithDynamicScaleFn = this.props.isFS ? this.storeData.getValue('xPositionWithDynamicFSScaleFn') : this.storeData.getValue('xPositionWithDynamicScaleFn');

    this.state.pointSet = this.state.valueSet.map((data: number, index: number) => {
      if (this.props.yAxisInfo.type === AXIS_TYPE.LOGARITHMIC && data !== null) {
        data = Math.log10(data);
      }
      let x = xPositionWithDynamicScaleFn(index, this.props.categorySet[index]);
      let point: DataPoint = new DataPoint((x) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new DataPoint(x + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if (data === null) {
        segmentIndexes.push(index);
        pointSegments.push(pathSegment.slice());
        pathSegment = [];
        point.isHidden = true;
      } else {
        pathSegment.push(point);
      }
      point.index = index;
      point.value = data;
      return point;
    });
    pointSegments.push(pathSegment);
    for (let pointSegment of pointSegments) {
      if (pointSegment.length === 0) {
        path.push([]);
        straightPath.push([]);
      } else if (pointSegment.length === 1) {
        path.push(['M', this.state.pointSet[0].x, this.state.pointSet[0].y]);
        straightPath.push(['M', this.state.pointSet[0].x, this.state.baseLine]);
      } else {
        path.push(GeomCore.catmullRomFitting(pointSegment, 0.1) as IPathSegment);
        straightPath.push(['L', this.state.pointSet[0].x, this.state.baseLine]);
      }
    }
    segmentIndexes.push(this.state.pointSet.length);
    return {
      pathSegments: path,
      path: path.flat(),
      straightPathSegments: straightPath,
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
    const pointerVicinity: number = this.props.tooltipOpt.pointerVicinity;
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
      #${(this as any).context.rootSvgId} .sc-area-fill-${this.props.instanceId} {
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