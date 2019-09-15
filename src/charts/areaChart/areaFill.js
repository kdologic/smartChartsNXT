'use strict';

import Point from './../../core/point';
import { Component } from './../../viewEngin/pview';
import geom from './../../core/geom.core';
import uiCore from './../../core/ui.core';
import utilCore from './../../core/util.core';
import DataPoints from './../../components/dataPoints';
import eventEmitter from './../../core/eventEmitter';
import Easing from './../../plugIns/easing';

/**
 * areaFill.js
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create an area based on input points.
 * @extends Component
 */

class AreaFill extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.rid = utilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.gradId = 'sc-area-fill-grad-' + this.rid;
    this.state = {
      marker: ~~this.props.marker,
      scaleX: 0,
      scaleY: 0,
      baseLine: 0,
      pointSet: [],
      valueSet: [],
      strokeOpacity: this.props.strokeOpacity || 1,
      opacity: this.props.opacity || 1,
      currentHighlightedPoint: {
        pointIndex: null
      },
      animated: this.props.animated
    };

    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: this.props.width,
      height: this.props.height
    }, this.props.clip);

    this.subComp = {};
    this.mouseMoveBind = this.interactiveMouseMove.bind(this);
    this.mouseLeaveBind = this.interactiveMouseLeave.bind(this);
    this.interactiveKeyPress = this.interactiveKeyPress.bind(this);
    this.changeAreaBrightnessBind = this.changeAreaBrightness.bind(this);
    this.prepareData(this.props);
    this.state.linePath = this.props.spline ? this.getCurvedLinePath(this.props) : this.getLinePath(this.props);
    this.state.areaPath = this.getAreaPath(this.state.linePath.slice());
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
    this.state.linePath = nextProps.spline ? this.getCurvedLinePath(nextProps) : this.getLinePath(nextProps);
    this.state.areaPath = this.getAreaPath(this.state.linePath.slice());
    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: nextProps.width,
      height: nextProps.height
    }, nextProps.clip);
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
        {this.props.gradient &&
          this.createGradient(this.gradId)
        }
        <path class={`sc-series-area-path-${this.props.index}`} stroke={this.props.areaFillColor} fill={this.props.gradient ? `url(#${this.gradId})` : this.props.areaFillColor}
          d={this.state.areaPath.join(' ')} stroke-width={this.props.areaStrokeWidth || 0} opacity={this.state.opacity} >
        </path>
        {this.props.lineStrokeWidth &&
          <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.lineFillColor} stroke-opacity={this.state.strokeOpacity} fill='none' d={this.state.linePath.join(' ')} stroke-width={this.props.lineStrokeWidth || 1} opacity='1'></path>
        }
        {this.props.dataPoints && !this.state.isAnimationPlaying &&
          <DataPoints instanceId={this.props.index} pointSet={this.state.pointSet} type='circle' opacity={this.state.marker} r={this.props.markerRadius} fillColor={this.props.lineFillColor || this.props.areaFillColor} />
        }
      </g>
    );
  }

  getAreaPath(linePath) {
    linePath.push('L', this.state.pointSet[this.state.pointSet.length - 1].x, this.state.baseLine, 'L', this.state.pointSet[0].x, this.state.baseLine, 'Z');
    return linePath;
  }

  getLinePath(props) {
    let path = [];
    this.state.pointSet = this.state.valueSet.map((data, i) => {
      let point = new Point((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if (i > 0) {
        path.push('L', point.x, point.y);
      }
      point.index = i;
      return point;
    });
    path.unshift('M', this.state.pointSet[0].x, this.state.pointSet[0].y);
    return path;
  }

  getCurvedLinePath(props) {
    let path = [];
    this.state.pointSet = this.state.valueSet.map((data, i) => {
      let point = new Point((i * this.state.scaleX) + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      if (props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      point.index = i;
      return point;
    });
    path = this.state.pointSet.length === 0 ? [] : (this.state.pointSet.length === 1 ? ['L', this.state.pointSet[0].x, this.state.pointSet[0].y] : geom.catmullRomFitting(this.state.pointSet, 0.1));
    path.unshift('M', this.state.pointSet[0].x, this.state.pointSet[0].y);
    return path;
  }

  createGradient(gardId) {
    return (
      <defs>
        <linearGradient id={gardId} x1='0%' y1='0%' x2='0%' y2='100%' gradientUnits='objectBoundingBox'>
          <stop offset='0%' stop-color={this.props.areaFillColor} stop-opacity='1' />
          <stop offset='100%' stop-color='rgb(255,255,255)' stop-opacity='0' />
        </linearGradient>
      </defs>
    );
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

  interactiveMouseMove(e) {
    if (!this.props.dataPoints || this.state.isAnimationPlaying) {
      return;
    }
    let evt = utilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    const mousePos = uiCore.cursorPoint(this.context.rootContainerId, e);
    const pt = new Point(mousePos.x - this.props.posX, mousePos.y - this.props.posY);
    let pointSet = this.state.pointSet;
    if (this.props.clip.offsetLeft > this.props.markerRadius) {
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
      if (this.props.clip.offsetLeft > this.props.markerRadius) {
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

export default AreaFill;