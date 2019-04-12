"use strict";

import { Component } from "./../viewEngin/pview";
import eventEmitter from './../core/eventEmitter';
import Geom from "./../core/geom.core";
import defaultConfig from "./../settings/config";

/** 
 * zoomOutBox.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create zoom out box area for the chart. Used full zoom out. 
 * @extends Component
 */

class ZoomOutBox extends Component {
  constructor(props) {
    super(props); 
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    this.state = {
      isFocused: false,
      isMouseHover: false,
      width: this.props.width,
      height: this.props.height,
      zoomHandStart: Geom.polarToCartesian(this.props.width/2, this.props.height/2, 10, 135),
      zoomHandEnd: Geom.polarToCartesian(this.props.width/2, this.props.height/2, 20, 135)
    };

    this.onClick = this.onClick.bind(this);
    this.onMouseOver = this.onMouseOver.bind(this); 
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
  }

  propsWillReceive(nextProps) {
    this.state = Object.assign({}, {
      width: nextProps.width,
      height: nextProps.height,
      zoomHandStart: Geom.polarToCartesian(nextProps.width/2, nextProps.height/2, 10, 135),
      zoomHandEnd: Geom.polarToCartesian(nextProps.width/2, nextProps.height/2, 20, 135)
    });
  }

  render() {
    return (
      <g class='sc-zoomout-box-container' transform={`translate(${this.props.posX},${this.props.posY})`} role="button" aria-label="Zoom out" tabindex="0" style='cursor:pointer;' 
        events={{
          click: this.onClick,
          mouseenter: this.onMouseOver,
          mouseleave: this.onMouseLeave, 
          focusin: this.onFocusIn,
          focusout: this.onFocusOut,
          keypress: this.onKeyPress
        }}>
        <title>Zoom out</title> 
        <rect class={'sc-zoomout-box' + (this.state.isFocused ? ' focus-in' : '' )} x={0} y={0} rx={5} ry={5} width={this.state.width} height={this.state.height} pointer-events='all' stroke='none' fill='none' stroke-width='1' />
        <circle r='10' cx={this.state.width/2} cy={this.state.height/2} stroke={defaultConfig.theme.bgColorMedium} pointer-events='none' stroke-width='1' fill={this.state.isFocused || this.state.isMouseHover ? '#fd9848':'#ffecdd'} />
        <line x1={(this.state.width/2)-4} y1={this.state.height/2} x2={(this.state.width/2)+4} y2={this.state.height/2} stroke={this.state.isFocused || this.state.isMouseHover ? '#fff' : defaultConfig.theme.bgColorMedium} pointer-events='none' stroke-width='2' fill='none' shape-rendering="optimizeSpeed"/>
        <line x1={this.state.zoomHandStart.x} y1={this.state.zoomHandStart.y} x2={this.state.zoomHandEnd.x} y2={this.state.zoomHandEnd.y} stroke={defaultConfig.theme.bgColorMedium} pointer-events='none' stroke-width='2' fill='none' />
      </g>
    );
  }
    
  onClick(e) {
    this.emitter.emit('onZoomout');
  }

  onMouseOver(e) {
    this.setState({ isMouseHover: true});
  }

  onMouseLeave(e) {
    this.setState({ isMouseHover: false});
  }

  onFocusIn(e) {
    this.setState({ isFocused: true});
  }

  onFocusOut(e) {
    this.setState({ isFocused: false});
  }

  onKeyPress(e) {
    if(e.which === 13 || e.which === 32) {
      this.emitter.emit('onZoomout');
    }
  }
}

module.exports = ZoomOutBox;