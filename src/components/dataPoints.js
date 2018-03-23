/**
 * dataPoints.js
 * @version:2.0.0
 * @createdOn:09-Mar-2018
 * @author:SmartChartsNXT
 * @description: This components will plot data points in chart area. 
 */

"use strict";

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";

class DataPoints extends Component{

  constructor(props) {
    super(props);
    this.state = {
      highlitedIndex: null
    };
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  render() {
    return (
      <g>
        {
          this.props.pointSet.map((point, i) => {
            //this.state.point[i].highlight = false;
            return this.getEachPoint(point, i);
          })
        }
      </g>
    ); 
  }

  getEachPoint(point, index) {
    switch(this.props.type) {
      case 'circle': 
      default:
      return (<g class={`sc-data-point-${index}`}>
        <circle cx={point.x} cy={point.y} r={this.props.r + 5} class='outer-highliter' fill={this.props.fillColor} fill-opacity='0' stroke-width='1' style={{'transition': 'fill-opacity 0.2s linear'}} > </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r + 2} class='outer-offset' fill={'#fff'} opacity='1' stroke-width='0'> </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r} class='inner-dot' fill={this.props.fillColor} opacity='1' stroke-width='0'> </circle>
      </g>);
    }
  }

  doHighlight(index) {
    let fillOpacity = 1; 
    if(index === false) {
      index = this.state.highlitedIndex || 0; 
      fillOpacity = 0; 
      this.state.highlitedIndex = null; 
    } else {
      this.state.highlitedIndex = index;
    }
    let highlighterElem = this.ref.node.querySelector(`.sc-data-point-${index} .outer-highliter`);
    let innerDot = this.ref.node.querySelector(`.sc-data-point-${index} .inner-dot`);
    highlighterElem.setAttribute('fill-opacity', fillOpacity);  
    innerDot.setAttribute('fill-opacity', +!fillOpacity);  
  }
}

export default DataPoints; 