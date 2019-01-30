"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import Geom from "./../../core/geom.core";
import UtilCore from "./../../core/util.core";
import DataPoints from "./../../components/dataPoints";
import eventEmitter from './../../core/eventEmitter';

/**
 * areaFill.js
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create an area based on input points.
 * @extends Component 
 */

class AreaFill extends Component{
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    this.rid = Math.round(Math.random()*100001);
    this.clipPathId = 'sc-clip-' + this.rid;
    this.gradId = "sc-area-fill-grad-" + this.rid;
    this.state = {
      marker: ~~this.props.marker,
      scaleX: 0,
      scaleY: 0,
      baseLine: 0,
      pointSet: [], 
      valueSet: [],
      strokeOpacity: this.props.strokeOpacity || 1,
      opacity: this.props.opacity || 1
    };
    this.subComp = {}; 
    this.mouseMoveBind = this.interactiveMouseMove.bind(this);
    this.mouseLeaveBind = this.interactiveMouseLeave.bind(this);
    this.changeAreaBrightnessBind = this.changeAreaBrightness.bind(this); 
    this.prepareData(this.props); 
    this.linePath = this.props.spline ? this.getCurvedLinePath(this.props) : this.getLinePath(this.props);
  }
  
  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.on('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.on('changeAreaBrightness', this.changeAreaBrightnessBind);
  }

  componentWillUnmount() {
    this.emitter.removeListener('interactiveMouseMove', this.mouseMoveBind);
    this.emitter.removeListener('interactiveMouseLeave', this.mouseLeaveBind);
    this.emitter.removeListener('changeAreaBrightness', this.changeAreaBrightnessBind);
  }

  propsWillReceive(nextProps) {
    this.state.marker = ~~nextProps.marker;
    this.prepareData(nextProps);
    this.linePath = nextProps.spline ? this.getCurvedLinePath(nextProps) : this.getLinePath(nextProps);
  }

  render() {
    return (
      <g class='sc-area-fill' transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`} >
        <defs>
          <clipPath id={this.clipPathId}>
            <rect x={0} y={0} width={this.props.width} height={this.props.height} />
          </clipPath>
        </defs>
        {this.props.gradient && this.createGradient(this.gradId)}
        <path class={`sc-series-area-path-${this.props.index}`} stroke='none' fill={this.props.gradient ? `url(#${this.gradId})` : this.props.fill} 
          d={this.getAreaPath(this.linePath.slice()).join(' ')} stroke-width='0' opacity={this.state.opacity} >
        </path> 
        <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.fill} stroke-opacity={this.state.strokeOpacity} fill='none' d={this.linePath.join(' ')} stroke-width={this.props.strokeWidth} opacity='1'></path> 
        {this.props.dataPoints &&
          <DataPoints pointSet={this.state.pointSet} type='circle' opacity={this.state.marker} r={this.props.markerRadius} fillColor={this.props.fill} onRef={(ref) => {this.subComp.dataPoints = ref;}} /> 
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
      if(props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      if(i > 0) {
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
      if(props.centerSinglePoint && this.state.valueSet.length === 1) {
        point = new Point(this.state.scaleX + props.paddingX, (this.state.baseLine) - (data * this.state.scaleY));
      }
      point.index = i; 
      return point; 
    });
    path = this.state.pointSet.length === 0 ? [] : (this.state.pointSet.length === 1 ? ['L', this.state.pointSet[0].x, this.state.pointSet[0].y] : Geom.getBezierSplines(this.state.pointSet));
    path.unshift('M', this.state.pointSet[0].x, this.state.pointSet[0].y);
    return path; 
  }

  createGradient(gardId) {
    return(
      <defs>
        <linearGradient id={gardId} x1="0%" y1="0%" x2="0%" y2="100%" gradientUnits="objectBoundingBox">
          <stop offset="0%" stop-color={this.props.fill} stop-opacity="1" />
          <stop offset="100%" stop-color="rgb(255,255,255)" stop-opacity="0" />
        </linearGradient>
      </defs>
    );
  }
  
  prepareData(props) {
    this.state.valueSet = props.dataSet.data.map((data) => {
      return data.value;
    });
    this.state.scaleX = (props.width - (2 * props.paddingX)) / (props.maxSeriesLen-1 || 2);
    this.state.scaleY = props.height / (props.maxVal-props.minVal); 
    this.state.baseLine = props.maxVal * this.state.scaleY; 
    this.state.marker = this.state.scaleX < 15 ? 0 : this.state.marker; 
  }

  interactiveMouseMove(e) {
    if(!this.props.dataPoints) {
      return;
    }
    e = UtilCore.extends({}, e); // Deep Clone event for prevent call-by-ref
    let mousePos = e.pos; 
    let pt = new Point(mousePos.x - this.props.posX, mousePos.y - this.props.posY); 
    let nearPoint = Geom.findClosestPoint(this.state.pointSet, pt, true); 
    this.subComp.dataPoints.doHighlight(false);
    if(nearPoint.dist < (this.state.scaleX / 2)) {
      this.subComp.dataPoints.doHighlight(nearPoint.index); 
      e.highlightedPoint = {
        x: (this.props.posX + nearPoint.x),
        y: (this.props.posY + nearPoint.y),
        dist: nearPoint.dist,
        pointIndex: nearPoint.index,
        seriesIndex: this.props.index
      };
    } else {
      e.highlightedPoint = null; 
    }
    this.emitter.emit("pointHighlighted", e);
  }

  interactiveMouseLeave(e) {
    if(this.props.dataPoints) {
      this.subComp.dataPoints.doHighlight(false);
    }
  }

  changeAreaBrightness(e) {
    if(this.props.instanceId === e.instanceId && e.strokeOpacity) {
      this.setState({strokeOpacity: e.strokeOpacity, opacity: e.opacity || this.props.opacity || 1}); 
    }
  }

}

export default AreaFill;