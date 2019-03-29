"use strict";

import { Component } from "./../../viewEngin/pview";
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';

/**
 * interactivePlane.js
 * @createdOn:14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This components will create an interactive plane over chart area. Where user can interact with mouse or touch.
 * @extends Component
 */

class InteractivePlane extends Component{

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
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
            mouseenter: this.onMouseEnter,
            mouseleave: this.onMouseLeave,
            mousemove: this.onMouseMove
          }}
        />
      </g>
    );
  }

  onMouseMove(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos; 
    this.emitter.emit('interactiveMouseMove', e);
  }

  onMouseEnter(e) {
    this.emitter.emit('interactiveMouseEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('interactiveMouseLeave', e);
  }

}

export default InteractivePlane; 