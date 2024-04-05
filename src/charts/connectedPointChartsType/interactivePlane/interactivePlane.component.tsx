'use strict';

import { Component } from '../../../viewEngin/pview';
import UiCore from '../../../core/ui.core';
import eventEmitter, { CustomEvents } from '../../../core/eventEmitter';
import InteractiveHotspots from '../interactiveHotspots/interactiveHotspots.component';
import { IInteractiveKeyboardEvent, IInteractiveMouseEvent, IInteractivePlaneProps } from './interactivePlane.model';
import { IVnode } from '../../../viewEngin/component.model';

/**
 * interactivePlane.component.tsx
 * @createdOn:14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This components will create an interactive plane over chart area. Where user can interact with mouse or touch or keyboard.
 * @extends Component
 */

class InteractivePlane extends Component<IInteractivePlaneProps> {
  private emitter: CustomEvents;

  constructor(props: IInteractivePlaneProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
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

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render(): IVnode {
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

  onClick(e: MouseEvent): void {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    const eventData: IInteractiveMouseEvent = {
      event: e,
      mousePos
    };
    this.emitter.emitSync('interactiveMouseClick', eventData);
  }

  onMouseDown(e: MouseEvent): void {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    const eventData: IInteractiveMouseEvent = {
      event: e,
      mousePos
    };
    this.emitter.emitSync('interactiveMouseDown', eventData);
  }

  onMouseUp(e: MouseEvent): void {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    const eventData: IInteractiveMouseEvent = {
      event: e,
      mousePos
    };
    this.emitter.emitSync('interactiveMouseUp', eventData);
  }

  onMouseMove(e: MouseEvent): void {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    const eventData: IInteractiveMouseEvent = {
      event: e,
      mousePos
    };
    this.emitter.emitSync('interactiveMouseMove', eventData);
  }

  onMouseEnter(e: MouseEvent): void {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    const eventData: IInteractiveMouseEvent = {
      event: e,
      mousePos
    };
    this.emitter.emitSync('interactiveMouseEnter', eventData);
  }

  onMouseLeave(e: MouseEvent): void {
    this.emitter.emitSync('interactiveMouseLeave', e);
  }

  onFocusIn(): void {
    this.setState({ isFocused: true });
  }

  onFocusOut(): void {
    this.setState({ isFocused: false });
  }

  onKeyUp(e: KeyboardEvent): void {
    const eventData: IInteractiveKeyboardEvent = {
      event: e,
    };
    this.emitter.emit('interactiveKeyPress', eventData);
  }

}

export default InteractivePlane;