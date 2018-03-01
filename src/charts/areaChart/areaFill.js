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

class AreaFill extends Component{
  constructor(props) {
      super(props);
      //this.maxVal = 0; 
      //this.minVal = 0;
      this.baseLine = 0; 
      this.scaleX = 0; 
      this.scaleY = 0; 
      this.pointSet = []; 
      this.valueSet = []; 

      this.prepareData(); 
  }
  
  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    return (
      <g class='sc-area-fill' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <path class={`sc-series-area-path-${this.props.index}`} stroke='none' fill={this.props.fill} d={this.getAreaPath().join(' ')} stroke-width='0' opacity={this.props.opacity}></path>
        <path class={`sc-series-line-path-${this.props.index}`} stroke={this.props.fill} fill='none' d={this.getLinePath().join(' ')} stroke-width='1' opacity='1'></path>
      </g>
    );
  }

  getAreaPath() {
    let path = this.getLinePath(); 
    path.push('L', this.pointSet[this.pointSet.length - 1].x, this.props.height, 'L', this.pointSet[0].x, this.props.height, 'Z');
    return path;
  }

  getLinePath() {
    let path = [];
    this.pointSet = this.valueSet.map((data, i) => {
      let point = new Point((i * this.scaleX) + (this.scaleX / 2), (this.baseLine) - (data * this.scaleY));
      path.push(i === 0 ? 'M' : 'L', point.x, point.y); 
      return point; 
    });
    return path; 
  }
  
  prepareData() {
    this.valueSet = this.props.dataSet.data.map((data) => {
      //this.maxVal = Math.max(this.maxVal, data.value); 
      //this.minVal = Math.min(this.minVal, data.value); 
      return data.value;
    });
    this.scaleX = this.props.width / this.props.maxSeriesLen;
    this.scaleY = this.props.height / (this.props.maxVal-this.props.minVal); 
    this.baseLine = this.props.maxVal * this.scaleY; 
  }

}

export default AreaFill;