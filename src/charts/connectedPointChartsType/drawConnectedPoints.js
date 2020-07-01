'use strict';

import { CHART_TYPE } from './../../settings/globalEnums';
import Point from './../../core/point';
import { Component } from './../../viewEngin/pview';
import geom from './../../core/geom.core';
import uiCore from './../../core/ui.core';
import utilCore from './../../core/util.core';
import DataPoints from './../../components/dataPoints';
import eventEmitter from './../../core/eventEmitter';
import Easing from './../../plugIns/easing';

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
    this.rid = utilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.shadowId = 'sc-area-fill-shadow-' + this.rid;
    this.state = {
      marker: ~~this.props.marker,
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
      fillBy: this.props.areaFillColor
    };

    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: this.props.width,
      height: this.props.height
    }, this.props.clip);

    let fillOpt = uiCore.processFillOptions(this.props.fillOptions);
    if(this.state.fillBy === 'none') {
      this.state.fillType = 'solidColor';
      this.state.fillBy = this.props.areaFillColor;
    }else {
      this.state.fillType = fillOpt.fillType;
      this.state.fillBy = fillOpt.fillBy;
      this.state.fillId = fillOpt.fillId;
    }
    this.subComp = {};
    this.mouseMoveBind = this.interactiveMouseMove.bind(this);
    this.mouseLeaveBind = this.interactiveMouseLeave.bind(this);
    this.interactiveKeyPress = this.interactiveKeyPress.bind(this);
    this.changeAreaBrightnessBind = this.changeAreaBrightness.bind(this);
    this.prepareData(this.props);
    this.state.lineSegments = this.props.spline ? this.getCurvedLinePath(this.props) : this.getLinePath(this.props);
    this.state.linePath = this.state.lineSegments.path;
    this.state.areaPath = this.getAreaPath(this.state.lineSegments.pathSegments.slice());
  }

  shouldComponentUpdate() {
    return this.props.shouldRender;
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.on('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.on('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.on('changeAreaBrightness', this.changeAreaBrightnessBind);
    this.state.animated = false;
  }

  componentWillUnmount() {
    this.emitter.removeListener('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.removeListener('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.removeListener('interactiveKeyPress', this.interactiveKeyPress);
    this.emitter.removeListener('changeAreaBrightness', this.changeAreaBrightnessBind);
  }

  propsWillReceive(nextProps) {
    this.state.marker = ~~nextProps.marker;
    this.prepareData(nextProps);
    let fillOpt = uiCore.processFillOptions(this.props.fillOptions);
    if(fillOpt.fillBy === 'none') {
      this.state.fillType = 'solidColor';
      this.state.fillBy = this.props.areaFillColor;
    }else {
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
  }

  prepareData(props) {
    this.state.valueSet = props.dataSet;
    this.state.scaleX = (props.width - (2 * props.paddingX)) / (props.maxSeriesLen - 1 || 2);
    this.state.scaleY = props.height / (props.maxVal - props.minVal);
    this.state.baseLine = props.maxVal * this.state.scaleY;
    this.state.marker = this.state.scaleX < 15 ? 0 : this.state.marker;
    if (typeof props.getScaleX === 'function') {
      props.getScaleX(this.state.scaleX);
    }
  }

  render() {
    return (
      <g class={`sc-area-fill-${this.props.instanceId}`} transform={`translate(${this.props.posX}, ${this.props.posY})`} clip-path={`url(#${this.props.clipId || this.clipPathId})`}>
        <remove-before-save>
          {this.props.animated &&
            <style>
              { this.getScaleKeyframe() }
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
          uiCore.generateFillElem(this.state.fillId, this.state.fillType, this.props.fillOptions, this.props.areaFillColor)
        }
        {this.props.lineDropShadow &&
          uiCore.dropShadow(this.shadowId)
        }
        {this.context.chartType === CHART_TYPE.AREA_CHART &&
          <path class={`sc-series-area-path-${this.props.index}`} stroke={this.props.areaFillColor} fill={this.state.fillBy}
            d={this.state.areaPath.join(' ')} stroke-width={this.props.areaStrokeWidth || 0} opacity={this.state.opacity} >
          </path>
        }
        {typeof this.props.lineStrokeWidth !== 'undefined'  &&
          <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.lineFillColor} stroke-opacity={this.state.strokeOpacity} d={this.state.linePath.join(' ')} filter={this.props.lineDropShadow ? `url(#${this.shadowId})` : ''} stroke-width={this.props.lineStrokeWidth || 0} fill='none' opacity='1'></path>
        }
        {this.props.dataPoints && !this.state.isAnimationPlaying &&
          <DataPoints instanceId={this.props.index} pointSet={this.state.pointSet} type={this.props.markerType} opacity={this.state.marker} markerWidth={this.props.markerWidth} markerHeight={this.props.markerHeight} markerURL={this.props.markerURL || ''} fillColor={this.props.areaFillColor || this.props.lineFillColor} />
        }
      </g>
    );
  }

  getAreaPath(lineSegments) {
    let linePath = [];
    for(let i = 0;i<lineSegments.length;i++) {
      let segment = lineSegments[i];
      if(segment.length === 0) {
        continue;
      }
      let startSegIndex = i === 0 ? 0 : this.state.lineSegments.segmentIndexes[i-1]+1;
      let endSegIndex = this.state.lineSegments.segmentIndexes[i];
      linePath.push(...segment);
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
      if(data === null) {
        sIndex = -1;
        segmentIndexes.push(i);
        path.push(pathSegment.slice());
        pathSegment = [];
        point.isHidden = true;
      }else {
        if (sIndex === 0) {
          pathSegment.push('M', point.x, point.y);
        }else {
          pathSegment.push('L', point.x, point.y);
        }
      }
      sIndex++;
      point.index = i;
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
      if(data === null) {
        segmentIndexes.push(i);
        pointSegments.push(pathSegment.slice());
        pathSegment = [];
        point.isHidden = true;
      }else {
        pathSegment.push(point);
      }
      point.index = i;
      return point;
    });
    pointSegments.push(pathSegment);
    for(let i = 0; i < pointSegments.length; i++) {
      let pointSegment = pointSegments[i];
      if(pointSegment.length === 0) {
        path.push([]);
      }else if(pointSegment.length === 1) {
        path.push(['M', this.state.pointSet[0].x, this.state.pointSet[0].y]);
      }else {
        path.push(geom.catmullRomFitting(pointSegment, 0.1)) ;
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
    let evt = utilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    const mousePos = uiCore.cursorPoint(this.context.rootContainerId, e);
    const pt = new Point(mousePos.x - this.props.posX, mousePos.y - this.props.posY);
    let pointSet = this.state.pointSet;
    if (this.props.clip.offsetLeft > this.props.markerWidth/2) {
      pointSet = pointSet.slice(1);
    }
    if (pointSet.length && +pointSet[pointSet.length - 1].x.toFixed(3) > +(this.state.clip.x + this.state.clip.width).toFixed(3)) {
      pointSet = pointSet.slice(0, pointSet.length - 1);
    }
    const nearPoint = geom.findClosestPoint(pointSet, pt, this.props.tooltipOpt.grouped);
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
    let evt = utilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    if (e.which == 37 || e.which == 39) {
      let pointSet = this.state.pointSet;
      if (this.props.clip.offsetLeft > this.props.markerWidth/2) {
        pointSet = pointSet.slice(1);
      }
      if (pointSet.length && +pointSet[pointSet.length - 1].x.toFixed(3) > +(this.state.clip.x + this.state.clip.width).toFixed(3)) {
        pointSet = pointSet.slice(0, pointSet.length - 1);
      }
      if(!pointSet.length) {
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