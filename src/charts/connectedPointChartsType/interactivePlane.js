'use strict';

import { Component } from './../../viewEngin/pview';
import UiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';
import InteractiveHotspots from './interactiveHotspots';

/**
 * interactivePlane.js
 * @createdOn:14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This components will create an interactive plane over chart area. Where user can interact with mouse or touch or keyboard.
 * @extends Component
 */

class InteractivePlane extends Component {

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      isFocused: false
    };

    this.onClick = this.onClick.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    return (
      <g class='sc-interactive' transform={`translate(${this.props.posX},${this.props.posY})`} role="region" aria-label="Interactive chart. Use left arrow or right arrow to navigate between data points."
        events={{
          click: this.onClick,
          mousedown: this.onMouseDown,
          mouseup: this.onMouseUp,
          mouseenter: this.onMouseEnter,
          mouseleave: this.onMouseLeave,
          mousemove: this.onMouseMove,
          focusin: this.onFocusIn,
          focusout: this.onFocusOut,
          keyup: this.onKeyUp
        }}>
        <rect class={'sc-interactive-plane' + (this.state.isFocused ? ' focus-in' : '')} width={this.props.width} height={this.props.height} fill='none' style={{ pointerEvents: 'all' }} tabindex='0' />
        <InteractiveHotspots></InteractiveHotspots>
      </g>
    );
  }

  onClick(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseClick', e);
  }

  onMouseDown(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseDown', e);
  }

  onMouseUp(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseUp', e);
  }

  onMouseMove(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseMove', e);
  }

  onMouseEnter(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emitSync('interactiveMouseLeave', e);
  }

  onFocusIn() {
    this.setState({ isFocused: true });
  }

  onFocusOut() {
    this.setState({ isFocused: false });
  }

  onKeyUp(e) {
    this.emitter.emit('interactiveKeyPress', e);
  }

}

export default InteractivePlane;