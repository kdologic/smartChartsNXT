/**
 * areaFill.js
 * @version:2.0.0
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create a area based on input points. 
 */

"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import Geom from "./../../core/geom.core";
import DataPoints from "./../../components/dataPoints";
import eventEmitter from './../../core/eventEmitter';


class AreaFill extends Component{
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    this.baseLine = 0; 
    this.scaleX = 0; 
    this.scaleY = 0; 
    this.pointSet = []; 
    this.valueSet = []; 
    this.clipPathId = 'sc-clip-' + Math.round(Math.random()*100001);
    this.prepareData(); 
    this.bindEvents(); 
  }
  
  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    this.subComp = {}; 
    this.prepareData();
    let path = this.props.spline ? this.getCurvedLinePath() : this.getLinePath(); 
    return (
      <g class='sc-area-fill'>
        <defs>
          <clipPath id={this.clipPathId}>
            <rect x={0} y={0} width={this.props.width} height={this.props.height} />
          </clipPath>
        </defs>
        <g transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`} >
          <path class={`sc-series-area-path-${this.props.index}`} stroke='none' fill={this.props.fill} 
            d={this.getAreaPath(path.slice()).join(' ')} stroke-width='0' opacity={this.props.opacity} >
          </path> 
          <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.fill} fill='none' d={path.join(' ')} stroke-width='1' opacity='1'></path> 
          <DataPoints pointSet={this.pointSet} type='circle' r={3} fillColor={this.props.fill} onRef={ref => this.subComp.dataPoints = ref} /> 
        </g>
      </g>
    );
  }

  getAreaPath(linePath) {
    linePath.push('L', this.pointSet[this.pointSet.length - 1].x, this.baseLine, 'L', this.pointSet[0].x, this.baseLine, 'Z');
    return linePath;
  }

  getLinePath() {
    let path = [];
    this.pointSet = this.valueSet.map((data, i) => {
      let point = new Point((i * this.scaleX) + this.props.paddingX, (this.baseLine) - (data * this.scaleY));
      if(i > 0) {
        path.push('L', point.x, point.y);
      }
      point.index = i; 
      return point; 
    });
    path.unshift('M', this.pointSet[0].x, this.pointSet[0].y);
    return path; 
  }

  getCurvedLinePath() {
    let path = [];
    this.pointSet = this.valueSet.map((data, i) => {
      let point = new Point((i * this.scaleX) + this.props.paddingX, (this.baseLine) - (data * this.scaleY));
      point.index = i; 
      return point; 
    });
    path = Geom.getBezierSplines(this.pointSet);
    path.unshift('M', this.pointSet[0].x, this.pointSet[0].y);
    return path; 
  }
  
  prepareData() {
    this.valueSet = this.props.dataSet.data.map((data) => {
      return data.value;
    });
    this.scaleX = (this.props.width - (2 * this.props.paddingX)) / (this.props.maxSeriesLen-1);
    this.scaleY = this.props.height / (this.props.maxVal-this.props.minVal); 
    this.baseLine = this.props.maxVal * this.scaleY; 
  }

  bindEvents() {
    this.emitter.on('interactiveMouseMove', this.interactiveMouseMove.bind(this));
    this.emitter.on('interactiveMouseLeave', this.interactiveMouseLeave.bind(this));
  }

  interactiveMouseMove(mousePos) {
    let pt = new Point(mousePos.x - this.props.posX, mousePos.y - this.props.posY); 
    let nearPoint = Geom.findClosestPoint(this.pointSet, pt); 
    this.subComp.dataPoints.doHighlight(false);
    this.subComp.dataPoints.doHighlight(nearPoint.index); 
  }

  interactiveMouseLeave(e) {
    this.subComp.dataPoints.doHighlight(false);
  }

}

export default AreaFill;