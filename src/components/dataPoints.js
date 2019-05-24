"use strict";

import { Component } from "./../viewEngin/pview";
import eventEmitter from "./../core/eventEmitter";

/**
 * dataPoints.js
 * @createdOn:09-Mar-2018
 * @author:SmartChartsNXT
 * @description: This components will plot data points in chart area. 
 * @extends Component
 */

class DataPoints extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      highlitedIndex: null,
      pointSet: this.props.opacity ? this.props.pointSet : [],
      opacity: this.props.opacity
    };
    this.doHighlight = this.doHighlight.bind(this); 
    this.normalize = this.normalize.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('highlightPointMarker', this.doHighlight);
    this.emitter.on('normalizeAllPointMarker', this.normalize);
  }

  componentWillUnmount() {
    this.emitter.removeListener('highlightPointMarker', this.doHighlight);
    this.emitter.removeListener('normalizeAllPointMarker', this.normalize);
  }

  propsWillReceive(newProps) {
    this.state.pointSet = newProps.opacity ? newProps.pointSet : [],
    this.state.opacity = newProps.opacity; 
  }

  render() {
    return (
      <g class='sc-data-points'> 
      {
        this.state.pointSet.map((point, i) => {
          return this.drawPoint(point);
        })
      } 
      </g>
    ); 
  }

  drawPoint(point) {
    switch(this.props.type) {
      case 'circle': 
      default:
      return (
      <g class={`sc-data-point-${point.index}`}>
        <circle cx={point.x} cy={point.y} r={this.props.r + 2} class='outer-highliter' fill={this.props.fillColor} fill-opacity='0' stroke-width='1' stroke='#fff' stroke-opacity='0' style={{'transition': 'fill-opacity 0.2s linear'}} > </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r - 2} class='outer-offset' fill={this.props.fillColor} opacity='1' stroke-width='0'> </circle>
        <circle cx={point.x} cy={point.y} r={this.props.r - 3} class='inner-dot' fill={'#fff'} opacity='1' stroke-width='0'> </circle>
      </g>);
    }
  }

  normalize(e) {
    if(this.props.opacity === 0) {
      this.setState({pointSet: []});
    }else {
      let index = this.state.highlitedIndex || 0; 
      let fillOpacity = 0; 
      this.state.highlitedIndex = null;
      let pointDom = this.ref.node.querySelector(`.sc-data-point-${index}`);
      if(pointDom) {
        let highlighterElem = pointDom.querySelector(`.outer-highliter`);
        highlighterElem.setAttribute('fill-opacity', fillOpacity);
        highlighterElem.setAttribute('stroke-opacity', fillOpacity);  
      }
    }
  }

  doHighlight(e) {
    let index = e.highlightedPoint.pointIndex;
    if(index == undefined || index == null || isNaN(index)) {
      return;
    }
    let fillOpacity = 1; 
    let pointDom;
    if(this.props.opacity === 0) {
      let pData = {x: e.highlightedPoint.relX, y: e.highlightedPoint.relY, index};
      this.setState({pointSet: [pData]});
    }
    this.state.highlitedIndex = index;
    pointDom = this.ref.node.querySelector(`.sc-data-point-${index}`); 
    if(pointDom) {
      let highlighterElem = pointDom.querySelector(`.outer-highliter`);
      highlighterElem.setAttribute('fill-opacity', fillOpacity);
      highlighterElem.setAttribute('stroke-opacity', fillOpacity); 
    }
  }
}

export default DataPoints; 