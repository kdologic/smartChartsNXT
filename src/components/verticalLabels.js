"use strict";

import eventEmitter from './../core/eventEmitter';
import defaultConfig from "./../settings/config";
import Ticks from "./ticks";
import { Component } from "./../viewEngin/pview";

/**
 * verticalLabels.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels and Tick marks for the chart.
 * @extends Component
 * "yAxis": {
      "title": "Total Sales",
      "prefix": "Rs. ",
      "labelRotate": 0,
      "tickOpacity": 1,
      "tickColor": '#222',
      "tickSpan": 5,
      "labelOpacity": 1,
      "labelColor": "#009688",
      "fontSize": 20,
      "fontFamily": "Lato"
    }
 */
class VerticalLabels extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.config = {};
    this.resetConfig(this.props.opts); 
    this.state = {
      fontSize: this.config.fontSize
    };
    this.valueSet = []; 
    this.minLabelVal = this.props.minVal; 
    this.maxLabelVal = this.props.maxVal;
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    this.intervalId = setInterval(() => {
      if(this.ref.node.getBoundingClientRect().width > this.props.maxWidth){
        this.setState({fontSize: this.state.fontSize-1});
      }else {
        clearInterval(this.intervalId);
      }
    });
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
        <tspan class={`vlabel-${index}`} labelIndex={index} text-anchor='end' x={0} y={index * this.props.intervalLen} dy="0.4em" events={{mouseenter: this.onMouseEnter, mouseleave: this.onMouseLeave}}> 
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
    let lblIndex = e.target.classList[0].replace('vlabel-',''); 
    e.labelText = (this.props.opts.prefix ? this.props.opts.prefix : "") + this.valueSet[lblIndex];
    this.emitter.emit('vLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('vLabelExit', e);
  }
}

export default VerticalLabels;