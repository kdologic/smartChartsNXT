"use strict";

/**
 * verticalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels for the chart. 
 */

import defaultConfig from "./../settings/config";
import Ticks from "./ticks";
import { Component } from "./../viewEngin/pview";

/** 
 * Create a Vertical Labels and Tick marks for the chart.
 * @extends Component
 */
class VerticalLabels extends Component{

  constructor(props) {
    super(props);
    this.config = {
      color: this.props.opts.fillColor || defaultConfig.theme.fontColorDark,
      fontSize: this.props.opts.maxFontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
      opacity:this.props.opts.opacity || "1"
    };
    this.state = {
      fontSize: this.config.fontSize
    };
    this.valueSet = []; 
    this.minLabelVal = this.props.minVal < 0 ? Math.floor(this.props.minVal / this.props.valueInterval) * this.props.valueInterval : 0; 
    this.maxLabelVal = this.props.maxVal < 0 ? 0 : this.props.valueInterval * this.props.labelCount; 
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    if(this.ref.node.getBoundingClientRect().width > this.props.maxWidth){
      this.setState({fontSize: this.state.fontSize-1});
    }
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  propsWillReceive(nextProps) {
    this.minLabelVal = nextProps.minVal < 0 ? Math.floor(nextProps.minVal / nextProps.valueInterval) * nextProps.valueInterval : 0; 
    this.maxLabelVal = nextProps.maxVal < 0 ? 0 : nextProps.valueInterval * nextProps.labelCount; 
  }

  render() {
    return (
      <g class='sc-vertical-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <text font-family={this.config.fontFamily} fill={this.config.color} stroke='none' font-size={this.state.fontSize} opacity={this.config.opacity} text-rendering='geometricPrecision' >
        {
          this.getLabels()
        }
        </text>
        <Ticks posX={5} posY={0} span='5' tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} type='vertical'></Ticks>
      </g>
    );
  }

  getLabels() {
    let labels = []; 
    for (let lCount = this.props.labelCount, i = 0; lCount >= 0; lCount--) {
      this.maxLabelVal = this.formatTextValue(this.minLabelVal + (i++ * this.props.valueInterval));
      labels.push(this.getEachLabel(this.maxLabelVal, lCount)); 
      this.valueSet.unshift(this.maxLabelVal);
    }
    return labels;
  }

  getEachLabel(val, index) {
    return (
      <tspan class={`vlabel-${index}`} labelIndex={index} text-anchor='end' x={0} y={index * this.props.intervalLen} dy="0.4em" events={{mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)}}> 
        {(this.props.opts.prefix ? this.props.opts.prefix : "") + val} 
      </tspan>
    );
  }

  formatTextValue(value) {
    if (Math.abs(Number(value)) >= 1000000) {
        return (Number(value) / 1000000).toFixed(2) + " M";
    } else if (Math.abs(Number(value)) >= 1000) {
        return (Number(value) / 1000).toFixed(2) + " K";
    } else {
        return Number(value).toFixed(2);
    }
  }
  
  onMouseEnter(e) {
    if(typeof this.props.updateTip === 'function') {
      let lblIndex = e.target.classList[0].replace('vlabel-',''); 
      this.props.updateTip(e, (this.props.opts.prefix ? this.props.opts.prefix : "") + this.valueSet[lblIndex]);
    }
  }

  onMouseLeave(e) {
    if(typeof this.props.hideTip === 'function') {
      this.props.hideTip(e);
    }
  }
}

export default VerticalLabels;