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
    this.state = {
      startAngle:0,
      endAngle:0
    };
  }

  render() {
    return (
      <g class='pie-set'>
        {this.createPieSlices()}
      </g>
    );
  }

  createPieSlices() {
    return this.props.dataSet.map((data, i) =>{
      this.state.startAngle = this.state.endAngle; 
      this.state.endAngle += (data.percent * 3.6);
      return (
        <PieSlice index={i} rootNodeId={this.props.rootNodeId}
          toggleEnabled={this.props.dataSet.length > 0 ? true : false}
          cx ={this.props.cx} cy={this.props.cy} 
          width={this.props.width} height={this.props.height} 
          offsetWidth={this.props.offsetWidth} offsetHeight={this.props.offsetHeight}
          data={data} startAngle={this.state.startAngle} endAngle={this.state.endAngle} 
          strokeColor={this.props.strokeColor} strokeWidth={this.props.strokeWidth} 
          rotateChart={this.rotateChart.bind(this)}
        />
      );
    });
  }

  rotateChart(rotationIndex, ignorOrdering) {
    this.ref.children.map((child, index) => {
      let e = new CustomEvent('onRotateSlice', {'detail':{rotationIndex}}); 
      child.node.dispatchEvent(e); 
    }); 
  } 
  
}

export default PieSet; 