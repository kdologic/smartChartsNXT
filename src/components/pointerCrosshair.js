'use strict';

import Point from './../core/point';
import { Component } from './../viewEngin/pview';
import defaultConfig from './../settings/config';
import eventEmitter from './../core/eventEmitter';
import UiCore from './../core/ui.core';
import SpeechBox from './../components/speechBox';
import Style from './../viewEngin/style';

/**
 * pointerCrosshair.js
 * @createdOn:21-Apr-2018
 * @author:SmartChartsNXT
 * @description: This components will create a vertical and horizontal cross line to follow the pointer or touch location. 
 * @extends Component
 * 
 * @config 
 * ```js
 "pointerCrosshair": {
    "vertical": {
      "style": "dashed",              // [default: dashed | solid]
      "spread" : "full",              // [default: full | inPoint | none]
      "lineColor": "#000",            // [default: #000]
      "lineWidth": 1,                 // [default: 1]
      "lineOpacity": 1,               // [default: 1]
      "labelTextColor": "#fff",       // [default: #fff]
      "labelBackgroundColor":"#000",  // [default: #000]
      "labelOpacity": 1               // [default: 1]
    },
    "horizontal": {
      "style": "dashed",              // [default: dashed | solid]
      "spread" : "full",              // [default: full | inPoint | none]
      "lineColor": "#000",            // [default: #000]
      "lineWidth": 1,                 // [default: 1]
      "lineOpacity": 1,               // [default: 1]
      "labelTextColor": "#fff",       // [default: #fff]
      "labelBackgroundColor":"#000",  // [default: #000]
      "labelOpacity": 1               // [default: 1]
    }
  }```
 */

class PointerCrosshair extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.config = {vertical: {}, horizontal:{}}; 
    this.setConfig(this.props.opts); 
    this.state = {
      vx1: 0,
      vy1: 0,
      vx2: 0,
      vy2: 0,
      hx1: 0,
      hy1: 0,
      hx2: 0,
      hy2: 0,
      labelTextPadding: 5,
      verticalLabelText: '',
      verticalLabelWidth: this.config.vertical.labelMinWidth,
      horizontalLabelHeight: this.config.vertical.labelMinHeight,
      horizontalLabelText: '',
      horizontalLabelWidth: this.config.horizontal.labelMinWidth,
      verticalLabelHeight: this.config.horizontal.labelMinHeight, 
      isHorizontalCrosshairVisible: false,
      isVerticalCrosshairVisible: false
    }; 
    this.setVCrosshairBind = this.setVCrosshair.bind(this); 
    this.setHCrosshairBind = this.setHCrosshair.bind(this);
  }

  setConfig(opts) {
    ['vertical', 'horizontal'].map(type => {
      opts[type] = (opts[type] || {});
      this.config[type] = {...this.config[type], ...{
        spread: (opts[type].spread || (type === 'vertical' ? 'full' : 'none')).toLocaleLowerCase(),
        lineColor: opts[type].lineColor || '#000',
        strokeWidth: Number(opts[type].lineWidth) || 1,
        lineOpacity: Number(opts[type].lineOpacity) || 1, 
        labelTextColor: opts[type].labelTextColor || '#fff', 
        labelBackgroundColor: opts[type].labelBackgroundColor || '#000', 
        labelOpacity: Number(opts[type].labelOpacity) || 1, 
        dashArray: (opts[type].style || 'dashed').toLocaleLowerCase() === 'dashed' ? 3 : 0,
        labelMinWidth: 100,
        labelMinHeight: 30
      }};
    });
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
    this.emitter.on('setVerticalCrosshair', this.setVCrosshairBind);
    this.emitter.on('setHorizontalCrosshair', this.setHCrosshairBind);
  }

  componentWillUnmount() {
    this.emitter.removeListener('setVerticalCrosshair', this.setVCrosshairBind);
    this.emitter.removeListener('setHorizontalCrosshair', this.setHCrosshairBind);
  }

  propsWillReceive(nextProps) {
    this.setConfig(nextProps.opts); 
  }

  render() {
    return (
      <g class='sc-pointer-crosshair' transition=''>
        <Style>
          {{
            '.sc-crosshair-group': {
              transition: 'transform 0.3s cubic-bezier(.03,.26,.32,1)'
            },
            '.sc-crosshair-group.sc-h-crosshair': {
              transform: `translate(0, ${this.state.hy1}px)`
            },
            '.sc-crosshair-group.sc-v-crosshair': {
              transform: `translate(${this.state.vx1}px,0)`
            }
          }}
        </Style>
        <g>
          {this.config.horizontal.spread !== 'none' && this.state.isHorizontalCrosshairVisible &&
            <g class='sc-crosshair-group sc-h-crosshair' transform={`translate(0, ${this.state.hy1})`}>
              <line x1={this.state.hx1} y1={0} x2={this.state.hx2} y2={0} 
                fill='none' stroke={this.config.horizontal.lineColor} stroke-width={this.config.horizontal.strokeWidth} opacity={this.config.horizontal.lineOpacity} stroke-dasharray={this.config.horizontal.dashArray} shape-rendering='optimizeSpeed'/>
              <SpeechBox x={this.state.hx1-this.state.horizontalLabelWidth-5} y={-this.state.horizontalLabelHeight/2} width={this.state.horizontalLabelWidth} height={this.state.horizontalLabelHeight} cpoint={new Point(this.state.hx1, 0)}
                anchorBaseWidth={5} bgColor={this.config.horizontal.labelBackgroundColor} fillOpacity={this.config.horizontal.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} > 
              </SpeechBox>
              {this.getHorizontalLabelText()}
            </g>
          }
        </g>
        <g>
          {this.config.vertical.spread !== 'none' && this.state.isVerticalCrosshairVisible &&
            <g class='sc-crosshair-group sc-v-crosshair' transform={`translate(${this.state.vx1},0)`}>
              <line x1={0} y1={this.state.vy1} x2={0} y2={this.state.vy2} 
                fill='none' stroke={this.config.vertical.lineColor} stroke-width={this.config.vertical.strokeWidth} opacity={this.config.vertical.lineOpacity} stroke-dasharray={this.config.vertical.dashArray} shape-rendering='optimizeSpeed'/> 
              <SpeechBox x={-(this.state.verticalLabelWidth/2)} y={this.state.vy2 + 5} width={this.state.verticalLabelWidth} height={this.state.verticalLabelHeight} cpoint={new Point(0, this.state.vy2)}
                anchorBaseWidth={5} bgColor={this.config.vertical.labelBackgroundColor} fillOpacity={this.config.vertical.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} > 
              </SpeechBox>
              {this.getVerticalLabelText()}
            </g>
          }
        </g>
      </g>
    );
  }

  getVerticalLabelText() {
    return (
      <text fill={this.config.vertical.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
        <tspan x='0' y={this.state.vy2 + 25}>{this.state.verticalLabelText}</tspan>
      </text>
    );
  }

  getHorizontalLabelText() {
    return (
      <text fill={this.config.horizontal.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
        <tspan x={this.state.hx1-(this.state.horizontalLabelWidth/2)-5} y={5}>{this.state.horizontalLabelText}</tspan>
      </text>
    );
  }

  setVCrosshair(data) {
    if(!data || this.config.vertical.spread === 'none') {
      this.setState({isVerticalCrosshairVisible: false, verticalLabelText: ''});
      return; 
    }
    this.state.verticalLabelText = data[0].formattedLabel;
    let textWidth = UiCore.getComputedTextWidth(this.getVerticalLabelText()) + (2 * this.state.labelTextPadding); 
    let topY = this.config.vertical.spread === 'full' ? this.props.vLineStart : Math.min(...data.map(d => d.y)); 
    this.setState({
      isVerticalCrosshairVisible: true,
      vx1: data[0].x,
      vy1: topY, 
      vx2: data[0].x,
      vy2: this.props.vLineEnd,
      verticalLabelWidth: textWidth > this.config.vertical.labelMinWidth ? textWidth : this.config.vertical.labelMinWidth
    }); 
  }

  setHCrosshair(data) {
    if(!data || this.config.horizontal.spread === 'none') {
      this.setState({isHorizontalCrosshairVisible: false, horizontalLabelText: ''});
      return; 
    }
    this.state.horizontalLabelText =  data[0].formattedValue;
    let textWidth = UiCore.getComputedTextWidth(this.getHorizontalLabelText()) + (2 * this.state.labelTextPadding); 
    let topY = Math.min(...data.map(d => d.y)); 
    this.setState({
      isHorizontalCrosshairVisible: true,
      hx1: this.props.hLineStart, 
      hy1: topY, 
      hx2: this.config.horizontal.spread === 'full' ? this.props.hLineEnd : data[0].x,
      hy2: topY,
      horizontalLabelWidth: textWidth
    }); 
  }

}
export default PointerCrosshair; 