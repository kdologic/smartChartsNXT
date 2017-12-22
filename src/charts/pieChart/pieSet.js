"use strict";

/**
 * pieSet.js
 * @createdOn: 01-Nov-2017
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:This is a parent class of pie slice class which create all the pie slices. 
 */

import defaultConfig from "./../../settings/config";
import Point from "./../../core/point";
import {Component} from "./../../viewEngin/pview";
import PieSlice from "./pieSlice"; 

class PieSet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startAngle:0,
      endAngle:0,
      pieTextFontSize: defaultConfig.theme.fontSizeMedium,
      showSliceMarker: true,
      hideMarkerText: false, 
      animPercent: null
    };
    this.slices = {};
    this.global = {
      mouseDownPos: {},
      mouseDown: 0,
      mouseDrag: 0
    };
    this.renderCounter = 0; 
  }

  componentWillMount() {
    this.state.startAngle = 0; 
    this.state.endAngle = 0;
    this.state.showSliceMarker = true;  
  }

  componentDidMount() {
    this.renderCounter++; 
    let pieSetBBox = this.ref.node.getBBox(); 
    if(pieSetBBox.width > this.props.pieAreaWidth) {
      switch(this.renderCounter) {
        case 1: this.setState({pieTextFontSize: defaultConfig.theme.fontSizeSmall}); break; 
        case 2: this.setState({hideMarkerText: true}); break;
        case 3: this.setState({showSliceMarker: false}); break; 
      }
    } else if(this.props.animated) {
      if(this.state.animPercent === null) {
        this.state.animPercent = 0; 
      }
      if(this.state.animPercent <= 100){
        this.doAnimation(); 
      }
    } 
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
      let percent = Math.min(this.state.animPercent || data.percent, data.percent);
      this.state.startAngle = this.state.endAngle; 
      this.state.endAngle += (percent * 3.6);
      console.log(this.state.endAngle);
      return (
        <PieSlice index={i} rootNodeId={this.props.rootNodeId}
          toggleEnabled={this.props.dataSet.length > 0 ? true : false} cx ={this.props.cx} cy={this.props.cy} 
          width={this.props.width} height={this.props.height} offsetWidth={this.props.offsetWidth} offsetHeight={this.props.offsetHeight}
          data={data} startAngle={this.state.startAngle} endAngle={this.state.endAngle} strokeColor={this.props.strokeColor} 
          strokeWidth={this.props.strokeWidth} rotateChart={this.rotateChart.bind(this)} slicedOut={data.slicedOut} fontSize={this.state.pieTextFontSize}
          updateTip={this.props.updateTip} hideTip={this.props.hideTip} onRef={ref => this.slices["s"+i] = ref} parentCtx={this.global} 
          showSliceMarker={this.state.showSliceMarker} hideMarkerText={this.state.hideMarkerText}
        />
      );
    });
  }

  rotateChart(rotationIndex) {
    Object.keys(this.slices).forEach((key) => {
      this.slices[key].rotateSlice(rotationIndex); 
    });
  } 

  doAnimation() {
    setTimeout(() => {
      this.setState({animPercent:this.state.animPercent + 4});
    }, 50);
  }
  
}

export default PieSet; 