"use strict";

import { Component } from "./../viewEngin/pview";

/**
 * dataPoints.js
 * @version:2.0.0
 * @createdOn:09-Mar-2018
 * @author:SmartChartsNXT
 * @description: This components will plot data points in chart area. 
 * @extends Component
 */

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
      <g class='sc-data-points'> {
          this.props.pointSet.map((point, i) => {
            return this.getEachPoint(point, i);
          })
      } </g>
    ); 
  }

  getEachPoint(point, index) {
    switch(this.props.type) {
      case 'circle': 
      default:
      return (
      <g class={`sc-data-point-${index}`} opacity={typeof this.props.opacity === 'undefined' ? 1 : this.props.opacity}>
        <circle cx={point.x} cy={point.y} r={this.props.r + 3} class='outer-highliter' fill={this.props.fillColor} fill-opacity='0' stroke-width='1' stroke='#fff' stroke-opacity='0' style={{'transition': 'fill-opacity 0.2s linear'}} > </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r + 1} class='outer-offset' fill={this.props.fillColor} opacity='1' stroke-width='0'> </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r} class='inner-dot' fill={'#fff'} opacity='1' stroke-width='0'> </circle>
      </g>);
    }
  }

  doHighlight(index) {
    let fillOpacity = 1; 
    let pointDom;
    if(index === false) {
      index = this.state.highlitedIndex || 0; 
      fillOpacity = 0; 
      this.state.highlitedIndex = null;
      pointDom = this.ref.node.querySelector(`.sc-data-point-${index}`); 
      pointDom.setAttribute('opacity', typeof this.props.opacity === 'undefined' ? 0 : this.props.opacity);
    } else {
      this.state.highlitedIndex = index;
      pointDom = this.ref.node.querySelector(`.sc-data-point-${index}`); 
      pointDom.setAttribute('opacity', 1);
    }
    let highlighterElem = pointDom.querySelector(`.outer-highliter`);
    let innerDot = pointDom.querySelector(`.inner-dot`);
    highlighterElem.setAttribute('fill-opacity', fillOpacity);
    highlighterElem.setAttribute('stroke-opacity', fillOpacity);  
    innerDot.setAttribute('fill-opacity', +!fillOpacity);  
  }
}

export default DataPoints; 