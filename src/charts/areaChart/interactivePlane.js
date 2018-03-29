/**
 * interactivePlane.js
 * @version:2.0.0
 * @createdOn:14-Mar-2018
 * @author:SmartChartsNXT
 * @description: This components will create an interactive plane over chart area. 
 */

"use strict";

import { Component } from "./../../viewEngin/pview";
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';

class InteractivePlane extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId); 
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  render() {
    return (
      <g class='sc-interactive' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <rect class='sc-interactive-plane' width={this.props.width} height={this.props.height} fill='none' style={{pointerEvents: 'all'}} 
          events={{
            mouseenter: this.onMouseEnter.bind(this),
            mouseleave: this.onMouseLeave.bind(this),
            mousemove: this.onMouseMove.bind(this)
          }}
        />
        
      </g>
    );
  }

  onMouseMove(e) {
    let mousePos = UiCore.cursorPoint(this.props.rootNodeId, e);
    this.emitter.emit('interactiveMouseMove', mousePos);
  }

  onMouseEnter(e) {
    this.emitter.emit('interactiveMouseEnter');
  }

  onMouseLeave(e) {
    this.emitter.emit('interactiveMouseLeave');
  }


}

export default InteractivePlane; 