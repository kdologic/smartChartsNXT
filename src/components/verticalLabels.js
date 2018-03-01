/**
 * verticalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels for the chart. 
 */

"use strict";

import defaultConfig from "./../settings/config";
import Ticks from "./ticks";
import { Component } from "./../viewEngin/pview";

class VerticalLabels extends Component{

    constructor(props) {
      super(props);
      this.config = {
        color: this.props.opts.fillColor || defaultConfig.theme.fontColorDark,
        fontSize: this.props.opts.maxFontSize || defaultConfig.theme.fontSizeSmall,
        fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
        opacity:this.props.opts.opacity || "1"
      };
      this.state = {
        fontSize: this.config.fontSize
      };
      this.minLabelVal = 0 ; 
      this.maxLabelVal = 0; 
      this.valueInterval = this.getValueInterval(this.props.maxVal, this.props.minVal, this.props.labelCount);
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

    render() {
      return (
        <g class='vertical-text-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
          {
            this.getLabels()
          }
          <Ticks posX={5} posY={0} span='5' tickInterval={this.props.intervalLen} tickCount={this.props.labelCount} type='vertical'></Ticks>
        </g>
      );
    }

    getLabels() {
      let labels = []; 
      this.minLabelVal = this.valueInterval * Math.floor((this.props.minVal > 0 ? 0 : this.props.minVal) / this.props.intervalLen);
      for (let lCount = this.props.labelCount - 1, i = 0; lCount >= 0; lCount--) {
        this.maxLabelVal = this.formatTextValue(this.minLabelVal + (i++ * this.valueInterval));
        labels.push(this.getEachLabel(this.maxLabelVal, lCount)); 
      }
      return labels;
    }

    getEachLabel(val, index) {
      return (
        <g>
          <text font-family={this.config.fontFamily} fill={this.config.color} stroke='none' font-size={this.state.fontSize} opacity={this.config.opacity} text-rendering='geometricPrecision'>
            <tspan text-anchor='end' x={0} y={index * this.props.intervalLen} dy='5'> {(this.props.labelPrefix ? this.props.labelPrefix : "") + val} </tspan>
          </text>
        </g>
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

    getValueInterval(maxVal, minVal, intervalCount) {
        minVal = minVal > 0 ? 0 : minVal;
        maxVal = maxVal < 0 ? 0 :maxVal;
        let tempInterval = (maxVal - minVal) / (intervalCount - 2);
        let digitBase10 = Math.pow(10,Math.round(tempInterval).toString().length-1);
        let nearestNum = Math.ceil(tempInterval/digitBase10)*digitBase10;
        return nearestNum; 
    }

}

export default VerticalLabels;