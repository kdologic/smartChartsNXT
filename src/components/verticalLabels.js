"use strict";

import defaultConfig from "./../settings/config";
import Ticks from "./ticks";
import { Component } from "./../viewEngin/pview";

/**
 * verticalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels and Tick marks for the chart.
 * @extends Component
 */
class VerticalLabels extends Component{

  constructor(props) {
    super(props);
    this.config = {};
    this.resetConfig(this.props.opts); 
    this.state = {
      fontSize: this.config.fontSize
    };
    this.valueSet = []; 
    this.minLabelVal = this.props.minVal; 
    this.maxLabelVal = this.props.maxVal; 
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
    this.resetConfig(nextProps.opts);
    this.minLabelVal = nextProps.minVal; 
    this.maxLabelVal = nextProps.maxVal; 
  }

  resetConfig(config) {
    this.config = {...this.config, ...{
      labelRotate: config.labelRotate || 0,
      fontSize: config.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: config.fontFamily || defaultConfig.theme.fontFamily,
      tickOpacity: config.tickOpacity || 1,
      tickColor: config.tickColor || defaultConfig.theme.fontColorDark,
      labelOpacity: config.labelOpacity || 1,
      labelColor: config.labelColor || defaultConfig.theme.fontColorDark
    }};
  }

  render() {
    return (
      <g class='sc-vertical-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        {
          this.getLabels()
        }
        <Ticks posX={5} posY={0} span={this.props.opts.tickSpan || 5} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
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
    let x =  0; 
    let y = this.valueSet.length === 1 ? this.props.valueInterval : index * this.props.intervalLen; 
    let transform = this.config.labelRotate ? "rotate(" + this.config.labelRotate + "," + x + "," + y + ")" : "";
    return (
      <text font-family={this.config.fontFamily} fill={this.config.labelColor} opacity={this.config.labelOpacity} stroke='none' 
        font-size={this.state.fontSize} opacity={this.config.tickOpacity} transform={transform} text-rendering='geometricPrecision' >
        <tspan class={`vlabel-${index}`} labelIndex={index} text-anchor='end' x={0} y={index * this.props.intervalLen} dy="0.4em" events={{mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)}}> 
          {(this.props.opts.prefix ? this.props.opts.prefix : "") + val} 
        </tspan>
      </text>
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