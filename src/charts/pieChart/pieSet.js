"use strict";

/*
 * pieSet.js
 * @CreatedOn: 01-Nov-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:This is a parent class of pie slice class which create all the pie slices. 
 */

import Point from "./../../core/point";
import {Component} from "./../../viewEngin/pview";
import PieSlice from "./pieSlice"; 

class PieSet extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <g class='pie-set'>
        {this.createPieSlices()}
      </g>
    );
  }

  createPieSlices() {
    let startAngle;
    let endAngle = 0;
    return this.props.dataSet.map((data, i) =>{
      startAngle = endAngle; 
      endAngle += (data.percent * 3.6);
      return (
        <PieSlice index={i} toggleEnabled={true}
        cx ={this.props.cx} cy={this.props.cy} 
        width={this.props.width} height={this.props.height} 
        offsetWidth={this.props.offsetWidth} offsetHeight={this.props.offsetHeight}
        data={data} startAngle={startAngle} endAngle={endAngle} 
        strokeColor={this.props.strokeColor} strokeWidth={this.props.strokeWidth} />
      );
    });
  }
}

export default PieSet; 