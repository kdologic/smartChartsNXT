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
    console.log(this.ref);
    
    return (
      <g class='pie-set'>
        {this.createPieSlices()}
      </g>
    );
  }

  createPieSlices() {
    // let startAngle;
    // let endAngle = 0;
    return this.props.dataSet.map((data, i) =>{
      this.state.startAngle = this.state.endAngle; 
      this.state.endAngle += (data.percent * 3.6);
    console.log(this.state.startAngle, this.state.endAngle);
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
    //console.log(rotationIndex);
    this.ref.children.map((child, index) => {
      let e = new CustomEvent('rotatePie', {'detail':{rotationIndex}}); 
      //console.log(e); 
      child.node.dispatchEvent(e); 
      //console.log(child.node);
    }); 
    // for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
    //   let pieData;
    //   let elemId = "pie" + pieIndex;
    //   pieData = this.CHART_DATA.pieSet[pieIndex];
    //   this.CHART_DATA.pieSet[pieIndex].slicedOut = false;

    //   let pieGroup = this.CHART_DATA.chartSVG.querySelectorAll(".pie" + pieIndex);
    //   for (let i = 0; i < pieGroup.length; i++) {
    //     pieGroup[i].setAttribute("transform", "");
    //   }
    //   this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex).setAttribute("d", "");

    //   let upperArcPath = this.geom.describeEllipticalArc(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.CHART_DATA.pieWidth, this.CHART_DATA.pieHeight, (pieData["upperArcPath"].startAngle + rotationIndex), (pieData["upperArcPath"].endAngle + rotationIndex), 0);
    //   let upperArcPie = this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + pieIndex).setAttribute("d", upperArcPath.d);
    //   let midAngle = (((pieData["upperArcPath"].startAngle + rotationIndex) + (pieData["upperArcPath"].endAngle + rotationIndex)) / 2) % 360.00;

    //   this.CHART_DATA.pieSet[pieIndex]["upperArcPath"] = upperArcPath;
    //   this.CHART_DATA.pieSet[pieIndex]["midAngle"] = (midAngle < 0 ? 360 + midAngle : midAngle);
      // if (!ignorOrdering) {
      //   this.resetTextPos();
      // }
    //}

  } /*End rotateChart()*/
  
}

export default PieSet; 