'use strict';

import { Component } from './../../viewEngin/pview';
import uiCore from './../../core/ui.core';
import eventEmitter from './../../core/eventEmitter';

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

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onFocusIn = this.onFocusIn.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    return (
      <g class='sc-interactive' transform={`translate(${this.props.posX},${this.props.posY})`} role="region" aria-label="Interactive chart. Use left arrow or right arrow to navigate between data points.">
        <rect class={'sc-interactive-plane' + (this.state.isFocused ? ' focus-in' : '')} width={this.props.width} height={this.props.height} fill='none' style={{ pointerEvents: 'all' }} tabindex='0'
          events={{
            mouseenter: this.onMouseEnter,
            mouseleave: this.onMouseLeave,
            mousemove: this.onMouseMove,
            focusin: this.onFocusIn,
            focusout: this.onFocusOut,
            keyup: this.onKeyUp
          }}
        />
      </g>
    );
  }

  onMouseMove(e) {
    let mousePos = uiCore.cursorPoint(this.context.rootContainerId, e);
    e.pos = mousePos;
    this.emitter.emitSync('interactiveMouseMove', e);
  }

  onMouseEnter(e) {
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