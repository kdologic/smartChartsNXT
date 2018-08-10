"use strict";

/**
 * horizontalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Labels for the chart. 
 */

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";
import Ticks from "./ticks";

/** 
 * Create a Horizontal Labels and Tick marks for the chart.
 * @extends Component
 */
class HorizontalLabels extends Component{

  constructor(props) {
    super(props);
    this.intervalThreshold = 30;
    this.config = {
      color: this.props.opts.fillColor || defaultConfig.theme.fontColorDark,
      fontSize: this.props.opts.maxFontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
      opacity:this.props.opts.opacity || "1"
    };
    this.state = {
      fontSize: this.config.fontSize, 
      labelRotate:false,
      intervalLen: this.intervalThreshold
    };
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    !this.state.labelRotate && this.checkLabelsWidth();
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  propsWillReceive(nextProps) {
    this.state = {
      fontSize: this.config.fontSize, 
      labelRotate:false,
      intervalLen: this.intervalThreshold
    };
  }

  render() {
    this.setIntervalLength();
    return (
      <g class='sc-horizontal-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        {
          this.getLabels()
        }
        <Ticks posX={0} posY={0} span='6' tickInterval={this.state.intervalLen} tickCount={this.props.categorySet.length} type='horizontal'></Ticks>
      </g>
    );
  }

  getLabels() {
    let labels = []; 
    for (let i = 0; i < this.state.categories.length; i++) {
      labels.push(this.getEachLabel(this.state.categories[i], i));
    }
    return labels;
  }

  getEachLabel(val, index) {
    let x =  this.state.categories.length === 1 ? this.state.intervalLen : index * this.state.intervalLen; 
    let y = 18; 
    let transform = this.state.labelRotate ? "rotate(-45," + x + "," + y + ")" : ""; 
    return (
      <text font-family={this.config.fontFamily} fill={this.config.color} x={x} y={y} 
        transform={transform} font-size={this.state.fontSize} opacity={this.config.opacity} stroke='none' text-rendering='geometricPrecision' >

        <tspan class={`hlabel-${index}`} labelIndex={index} text-anchor={this.state.labelRotate ? 'end' : 'middle'} dy="0.4em" events={{mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)}}> 
          {(this.props.opts.prefix ? this.props.opts.prefix : "") + val} 
        </tspan>

      </text>
    );
  }

  setIntervalLength() {
    let interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (this.props.categorySet.length - 1 || 2);
    this.state.categories = this.props.categorySet;
    if (interval < this.intervalThreshold) {
      let newCategories = [];
      let skipLen = Math.ceil(this.intervalThreshold / interval);
      for (let i = 0; i < this.props.categorySet.length; i += skipLen) {
        newCategories.push(this.props.categorySet[i]);
      }

      interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (newCategories.length - 1);
      if ((newCategories.length - 1) * interval > this.props.maxWidth) {
        newCategories.splice(-1, 1);
      }
      this.state.categories = newCategories;
    }
    this.state.intervalLen = interval;
  }

  checkLabelsWidth() {  
    for(let i=0; i < this.state.categories.length; i++) {
      let textLen = this.ref.node.querySelector('.hlabel-'+ i).getComputedTextLength(); 
      if(textLen > Math.max(this.intervalThreshold, this.state.intervalLen-10)) {
        if(this.state.fontSize > defaultConfig.theme.fontSizeSmall) {
          this.setState({fontSize: this.state.fontSize-1});  
        } else if(!this.state.labelRotate){
          this.setState({labelRotate: true, fontSize: this.config.fontSize});
        }
        return; 
      }
    }
  }

  onMouseEnter(e) {
    if(typeof this.props.updateTip === 'function') {
      let lblIndex = e.target.classList[0].replace('hlabel-',''); 
      this.props.updateTip(e, (this.props.opts.prefix ? this.props.opts.prefix : "") + this.state.categories[lblIndex]);
    }
  }

  onMouseLeave(e) {
    if(typeof this.props.hideTip === 'function') {
      this.props.hideTip(e);
    }
  }

}

export default HorizontalLabels;