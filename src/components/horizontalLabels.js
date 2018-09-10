"use strict";

import defaultConfig from "./../settings/config";
import UtilCore from './../core/util.core';
import { Component } from "./../viewEngin/pview";
import Ticks from "./ticks";
import dateFormat from "dateformat";

/**
 * horizontalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Labels for the chart.
 * @extends Component 
 */

class HorizontalLabels extends Component{

  constructor(props) {
    super(props);
    let self = this;
    this.config = {};
    this.resetConfig(this.props.opts); 
    this.state = {
      intervalLen: this.config.intervalThreshold,
      set categories(cat) {
        if(cat instanceof Array && cat.length > 0){
          this._categories = cat.map((c)=> {
            return self.props.opts.parseAsDate && UtilCore.isDate(c) ? dateFormat(c, self.config.dateFormat) : c;
          });
        } else {
          this._categories = []; 
        }
      },
      get categories() {
        return this._categories; 
      }
    };
    this.state.categories = this.props.categorySet;
      
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  propsWillReceive(nextProps) {
    this.resetConfig(nextProps.opts); 
    this.state.categories = nextProps.categorySet;
  }

  resetConfig(config) {
    this.config = {...this.config, ...{
      labelRotate: config.labelRotate || 0,
      fontSize: config.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: config.fontFamily || defaultConfig.theme.fontFamily,
      tickOpacity: config.tickOpacity || 1,
      labelOpacity: config.labelOpacity || 1,
      labelColor: config.labelColor || defaultConfig.theme.fontColorDark,
      tickColor: config.tickColor || defaultConfig.theme.fontColorDark,
      intervalThreshold: config.intervalThreshold || 30,
      dateFormat: config.dateFormat || defaultConfig.formatting.dateFormat
    }};
  }

  render() {
    this.setIntervalLength();
    return (
      <g class='sc-horizontal-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        {
          this.getLabels()
        }
        <Ticks posX={0} posY={0} span={this.props.opts.tickSpan || 6} tickInterval={this.state.intervalLen} tickCount={this.state.categories.length} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='horizontal'></Ticks>
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
    let transform = this.config.labelRotate ? "rotate(" + this.config.labelRotate + "," + x + "," + y + ")" : ""; 
    return (
      <text font-family={this.config.fontFamily} fill={this.config.labelColor} x={x} y={y} 
        transform={transform} font-size={this.config.fontSize} opacity={this.config.labelOpacity} stroke="none" text-rendering='geometricPrecision' >

        <tspan class={`hlabel-${index} label-text`} labelIndex={index} text-anchor={this.config.labelRotate ? 'end' : 'middle'} dy="0.4em" events={{mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)}}> 
          {(this.props.opts.prefix ? this.props.opts.prefix : "") + val} 
        </tspan>

      </text>
    );
  }

  setIntervalLength() {
    let interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (this.props.categorySet.length - 1 || 2);
    let skipLen = Math.ceil(this.config.intervalThreshold / interval);
    if (skipLen > 0) {
      let newCategories = [];
      for (let i = 0; i < this.props.categorySet.length; i += skipLen) {
        newCategories.push(this.props.categorySet[i]);
      }
      this.state.categories = newCategories;
    }
    interval = skipLen * interval; 

    this.state.intervalLen = interval;
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