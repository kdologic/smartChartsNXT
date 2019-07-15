'use strict';

import { Component } from './../viewEngin/pview';
import eventEmitter from './../core/eventEmitter';
import UtilCore from '../core/util.core';
import UiCore from './../core/ui.core';

/**
 * horizontalScroller.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Scroll area for the chart. Where where user can drag right or left handler
 * to adjust the window area.
 * @extends Component
 * @example
 * config:
 * "horizontalScroller" : {
 *    "enable": true,
 *    "width": 200,
 *    "height": 20,
 *    "chartInside": true // Show chart inside scroll area.
 * }
 * Supported events:
 * hScroll : fire when user perform scrolling.

 */

class HorizontalScroller extends Component {
  constructor(props) {
    super(props);
    this.selectedHandler = undefined;
    this.emitter = eventEmitter.getInstance(this.context.runId);
    let offset = this.calcOffset(props);

    this.state = {
      sliderLeft: '',
      sliderLeftSel: '',
      sliderLeftSelInner: '',
      leftOffset: offset.leftOffset,
      leftOffsetPercent: offset.leftOffsetPercent,
      scrollRight: this.props.width,
      sliderRight: '',
      sliderRightSel: '',
      sliderRightSelInner: '',
      rightOffset: offset.rightOffset,
      rightOffsetPercent: offset.rightOffsetPercent,
      windowWidth: offset.windowWidth,
      leftHandlerColor: '#fff',
      rightHandlerColor: '#fff',
      leftInnerBarColor: '#5a5a5a',
      rightInnerBarColor: '#5a5a5a',
      sliderWindowOpacity: 0.2,
      handlerFocused: null
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onHoverInHandler = this.onHoverInHandler.bind(this);
    this.onLeaveInHandler = this.onLeaveInHandler.bind(this);
    this.onFocusInHandler = this.onFocusInHandler.bind(this);
    this.onFocusOutHandler = this.onFocusOutHandler.bind(this);
    this.onOffsetClick = this.onOffsetClick.bind(this);
    this.onScrollMove = this.onScrollMove.bind(this);
    this.onScrollEnd = this.onScrollEnd.bind(this);
    this.onKeyMove = this.onKeyMove.bind(this);
    this.onHoverInSliderWindow = this.onHoverInSliderWindow.bind(this);
    this.onLeaveSliderWindow = this.onLeaveSliderWindow.bind(this);
    this.onFocusInSliderWindow = this.onFocusInSliderWindow.bind(this);
    this.onFocusOutSliderWindow = this.onFocusOutSliderWindow.bind(this);
    this.onScrollReset = this.onScrollReset.bind(this);
  }

  propsWillReceive(nextProps) {
    let widthChangePercent = ((nextProps.width - this.props.width)/this.props.width)*100;
    if(widthChangePercent) {
      this.state.leftOffset = this.state.leftOffset + (this.state.leftOffset*widthChangePercent/100);
      this.state.windowWidth = this.state.windowWidth + (this.state.windowWidth*widthChangePercent/100);
    }
  }

  componentDidMount() {
    this.emitter.on('onScrollReset', this.onScrollReset);
  }

  componentWillUnmount() {
    this.emitter.removeListener('onScrollReset', this.onScrollReset);
    this.onScrollEnd();
  }

  render() {
    return (
      <g class='sc-horizontal-scroll-cont' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <rect class='sc-slider-bg' x={0} y={0} width={this.props.width} height={this.props.height} fill='#000' fill-opacity='0.04' />
        { this.props.extChildren }
        <SliderWindow posX={this.state.leftOffset} posY={0} width={this.state.windowWidth} height={this.props.height}
          fillOpacity={this.state.sliderWindowOpacity} focusedIn={this.state.handlerFocused === 'window'}
          events= {{
            mousedown: this.onMouseDown,
            touchstart: this.onMouseDown,
            mouseenter: this.onHoverInSliderWindow,
            mouseleave: this.onLeaveSliderWindow,
            focusin: this.onFocusInSliderWindow,
            focusout: this.onFocusOutSliderWindow,
            keydown: this.onKeyMove
          }}>
        </SliderWindow>

        <SliderLeftHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth}  offsetPercent={this.state.leftOffsetPercent}
          width={this.props.width} height={this.props.height} handlerColor={this.state.leftHandlerColor} innerBarColor={this.state.leftInnerBarColor}
          focusedIn={this.state.handlerFocused === 'left'}
          events= {{
            handlerEvent: {
              mousedown: this.onMouseDown,
              touchstart: this.onMouseDown,
              mouseenter: this.onHoverInHandler,
              mouseleave: this.onLeaveInHandler,
              focusin: this.onFocusInHandler,
              focusout: this.onFocusOutHandler,
              keydown: this.onKeyMove
            },
            offsetEvent: {
              click: this.onOffsetClick
            }
          }}>
        </SliderLeftHandle>

        <SliderRightHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth} offsetPercent={this.state.rightOffsetPercent}
          width={this.props.width} height={this.props.height} handlerColor={this.state.rightHandlerColor} innerBarColor={this.state.rightInnerBarColor}
          focusedIn={this.state.handlerFocused === 'right'}
          events= {{
            handlerEvent: {
              mousedown: this.onMouseDown,
              touchstart: this.onMouseDown,
              mouseenter: this.onHoverInHandler,
              mouseleave: this.onLeaveInHandler,
              focusin: this.onFocusInHandler,
              focusout: this.onFocusOutHandler,
              keydown: this.onKeyMove
            },
            offsetEvent: {
              click: this.onOffsetClick
            }
          }}>
        </SliderRightHandle>

        { this.selectedHandler &&
          <rect class='sc-slider-pane' x={-this.props.posX} y={-this.props.posY} width= {this.props.svgWidth} height={this.props.svgHeight} fill='#000' fill-opacity='0' storke='none' pointer-events='all' style='cursor: grabbing; cursor: -webkit-grabbing; cursor: -moz-grabbing;' />
        }
      </g>
    );
  }

  getUpperBorderPath() {
    return [
      'M', 0, 0,
      'L', this.props.width, 0
    ].join(' ');
  }

  getLowerBorderPath() {
    return [
      'M', 0, this.props.height,
      'L', this.props.width, this.props.height
    ].join(' ');
  }

  calcOffset(props) {
    let leftOffset = (props.leftOffset * props.width / 100) || 0;
    let rightOffset = (props.rightOffset * props.width / 100) || 0;
    let windowWidth = rightOffset - leftOffset;
    return { leftOffset, rightOffset, windowWidth, leftOffsetPercent: leftOffset/props.width*100, rightOffsetPercent: rightOffset/props.width*100 };
  }

  onMouseDown(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    let classList = e.target.classList.value.split(' ');
    if(classList.includes('sc-slider-left-sel')) {
      this.selectedHandler = 'left';
    }else if(classList.includes('sc-slider-right-sel')) {
      this.selectedHandler = 'right';
    }else if(classList.includes('sc-hScroll-window') || classList.includes('sc-slider-left-offset') || classList.includes('sc-slider-right-offset')) {
      this.selectedHandler = 'window';
    }

    this.mouseDownPos = mousePos;
    this.winWidth = this.state.windowWidth;
    this.lOffset = this.state.leftOffset;

    window.addEventListener('mousemove', this.onScrollMove, false);
    window.addEventListener('touchmove', this.onScrollMove, false);
  }

  onScrollMove(e) {
    if(this.selectedHandler) {
      let mousePosNow = UiCore.cursorPoint(this.context.rootContainerId, e);
      let winWidth = 0, lOffset = this.state.leftOffset;
      switch (this.selectedHandler) {
        case 'left':
          lOffset = this.lOffset - (this.mouseDownPos.x - mousePosNow.x);
          winWidth = this.winWidth + (this.mouseDownPos.x - mousePosNow.x);
          break;
        case 'right':
          lOffset = this.lOffset;
          winWidth = this.winWidth - (this.mouseDownPos.x - mousePosNow.x);
          break;
        case 'window':
          winWidth = this.winWidth;
          lOffset = this.lOffset - (this.mouseDownPos.x - mousePosNow.x);
          break;
      }

      if(winWidth < 0) {
        if(this.selectedHandler === 'right') {
          lOffset = this.lOffset + winWidth;
        }else {
          lOffset += winWidth;
        }
        winWidth = Math.abs(winWidth);
      }

      if(lOffset < 0) {
        if(this.selectedHandler !== 'window') {
          winWidth += lOffset;
        }
        lOffset = 0;
      }else if(lOffset > this.props.width) {
        lOffset =this.props.width;
      }

      if(lOffset + winWidth > this.props.width) {
        if(this.selectedHandler === 'window') {
          winWidth = this.winWidth;
          lOffset = this.props.width - this.winWidth;
        }else {
          winWidth = this.props.width - lOffset;
        }
      }

      this.state.leftOffset = lOffset;
      this.state.windowWidth = winWidth;
      this.state.leftOffsetPercent = this.state.leftOffset/this.props.width*100;
      this.state.rightOffsetPercent = ((this.state.leftOffset+this.state.windowWidth)/this.props.width)*100;
      this.emitter.emit('hScroll', {
        leftOffset: this.state.leftOffsetPercent,
        rightOffset: this.state.rightOffsetPercent,
        windowWidth: ((this.state.windowWidth/this.props.width)*100)
      });
    }

    window.addEventListener('mouseup', this.onScrollEnd, false);
    window.addEventListener('touchend', this.onScrollEnd, false);
  }

  onScrollEnd() {
    this.selectedHandler = undefined;
    this.update();
    window.removeEventListener('mousemove', this.onScrollMove);
    window.removeEventListener('mouseup', this.onScrollEnd);
    window.removeEventListener('touchmove', this.onScrollMove);
    window.removeEventListener('touchend', this.onScrollEnd);
  }

  onOffsetClick(e) {
    this.onMouseDown(e);
    this.mouseDownPos.x = this.lOffset + (this.winWidth/2) + this.props.posX;
    this.onScrollMove(e);
    this.onScrollEnd(e);
  }

  onHoverInHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel')) {
      this.setState({leftHandlerColor:'#333', leftInnerBarColor:'#fff'});
    }else if(e.target.querySelector('.sc-slider-right-sel')) {
      this.setState({rightHandlerColor:'#333', rightInnerBarColor:'#fff'});
    }
  }

  onLeaveInHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel') && this.state.handlerFocused !== 'left') {
      this.setState({'leftHandlerColor':'#fff', leftInnerBarColor:'#5a5a5a'});
    }else if(e.target.querySelector('.sc-slider-right-sel') && this.state.handlerFocused !== 'right') {
      this.setState({'rightHandlerColor':'#fff', rightInnerBarColor:'#5a5a5a'});
    }
  }

  onFocusInHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel') ) {
      this.setState({leftHandlerColor:'#333', leftInnerBarColor:'#fff', handlerFocused: 'left'});
    }else if(e.target.querySelector('.sc-slider-right-sel')) {
      this.setState({rightHandlerColor:'#333', rightInnerBarColor:'#fff', handlerFocused: 'right'});
    }
  }

  onFocusOutHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel')) {
      this.setState({'leftHandlerColor':'#fff', leftInnerBarColor:'#5a5a5a',handlerFocused: null});
    }else if(e.target.querySelector('.sc-slider-right-sel')) {
      this.setState({'rightHandlerColor':'#fff', rightInnerBarColor:'#5a5a5a', handlerFocused: null});
    }
  }

  onHoverInSliderWindow() {
    this.setState({'sliderWindowOpacity': 0.5});
  }

  onLeaveSliderWindow() {
    this.setState({'sliderWindowOpacity': 0.2});
  }

  onFocusInSliderWindow() {
    this.setState({'sliderWindowOpacity': 0.5, handlerFocused: 'window'});
  }

  onFocusOutSliderWindow() {
    this.setState({'sliderWindowOpacity': 0.2, handlerFocused: null});
  }

  onKeyMove(e) {
    let event = {
      clientX: this.state.leftOffset,
      clientY: 0
    };
    switch(this.state.handlerFocused) {
      case 'left':
        event.target = this.ref.node.querySelector('.sc-slider-left-sel');
        break;
      case 'right':
        event.target = this.ref.node.querySelector('.sc-slider-right-sel');
        break;
      case 'window':
        event.target = this.ref.node.querySelector('.sc-hScroll-window');
        break;
    }

    // left arrow pressed
    if(e.keyCode == 37) {
      this.onMouseDown(event);
      event.clientX = this.state.leftOffset - 10;
    // right arrow pressed
    }else if(e.keyCode == 39) {
      this.onMouseDown(event);
      event.clientX = this.state.leftOffset + 10;
    }
    this.onScrollMove(event);
    this.onScrollEnd(event);
  }

  onScrollReset() {
    this.setState({
      leftOffset: 0,
      leftOffsetPercent: 0,
      rightOffset: this.props.width,
      rightOffsetPercent: 100,
      windowWidth: this.props.width
    });
  }
}

class SliderWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
    this.titleId = UtilCore.getRandomID();
  }

  propsWillReceive(nextProps) {
    this.state = Object.assign({}, this.state, nextProps);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    return (
      <g class='sc-slider-window-cont' transform={`translate(${this.state.posX},${this.state.posY})`} >
        <rect class='sc-hScroll-window' aria-labelledby={this.titleId} x={0} y={0} width={this.state.width} height={this.state.height} fill='red' storke='none' stroke-width='1' pointer-events='all' tabindex='0'
          fill-opacity={this.props.fillOpacity} style='transition: fill-opacity 0.3s linear;cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;' events={this.state.events}>
        </rect>
        <title id={this.titleId}> Slider Window (use arrow left or right to slide) </title>
        <rect class={(this.props.focusedIn ? 'focus-in' : '' )} x={0} y={0} rx={5} ry={5} width={this.props.width} height={this.props.height} pointer-events='none' stroke='none' fill='none' stroke-width='1' />
      </g>
    );
  }
}

class SliderLeftHandle extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
    this.titleId = UtilCore.getRandomID();
    this.gradId = UtilCore.getRandomID();
  }

  propsWillReceive(nextProps) {
    this.state = {...this.state, ...nextProps};
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    this.calcSliderPaths();
    return (
      <g class='sc-slider-left-handle' transform={`translate(${this.state.leftOffset},0)`} >
        <defs>
          <filter xmlns='http://www.w3.org/2000/svg' id={this.gradId} height='130%' width='130%'>
              <feGaussianBlur in='SourceAlpha' stdDeviation='1'></feGaussianBlur>
              <feOffset dx='0' dy='1' result='offsetblur'></feOffset>
              <feComponentTransfer>
                <feFuncA type='linear' slope='0.7'></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in='SourceGraphic'></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-left-offset' x={-this.state.leftOffset} y='0' width={this.state.leftOffset} height={this.props.height} events={this.props.events.offsetEvent} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0' >
          <title> Click to move window here  </title>
        </rect>
        <rect class={(this.props.focusedIn ? 'focus-in' : '' )} x={-this.props.height/2} y={0} rx={5} ry={5} width={this.props.height} height={this.props.height} pointer-events='none' stroke='none' fill='none' stroke-width='1' />
        <g style={{'cursor': 'ew-resize'}} events={this.props.events.handlerEvent} role='slider' aria-labelledby={this.titleId} aria-orientation='horizontal' aria-valuemin='0' aria-valuemax='100' aria-valuenow={Math.round(this.state.offsetPercent)} tabindex='0'>
          <title id={this.titleId}> Left Slider Handle (use arrow key left or right to slide) </title>
          <circle class='sc-slider-left-sel' cx={0} cy={this.props.height/2} r={15} fill={this.props.handlerColor} stroke='none' filter={`url(#${this.gradId})`}></circle>
          <path class='sc-slider-left-sel-inner' stroke={this.props.innerBarColor} fill='none' d={this.state.sliderLeftSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarLeft = [
      'M',-2, (this.props.height/2) - 5,
      'L',-2, (this.props.height/2) + 5,
      'M', 2, (this.props.height/2) - 5,
      'L', 2, (this.props.height/2) + 5
    ];

    this.state = {...this.state,
      sliderLeftSelInner: innerBarLeft.join(' ')
    };
  }
}

class SliderRightHandle extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
    this.titleId = UtilCore.getRandomID();
    this.gradId = UtilCore.getRandomID();
  }

  propsWillReceive(nextProps) {
    this.state = {...this.state, ...nextProps};
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    this.calcSliderPaths();
    return (
      <g class='sc-slider-right-handle' transform={`translate(${this.state.leftOffset + this.state.windowWidth},0)`} >
        <defs>
          <filter xmlns='http://www.w3.org/2000/svg' id={this.gradId} height='130%' width='130%'>
              <feGaussianBlur in='SourceAlpha' stdDeviation='1'></feGaussianBlur>
              <feOffset dx='0' dy='1' result='offsetblur'></feOffset>
              <feComponentTransfer>
                <feFuncA type='linear' slope='0.7'></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in='SourceGraphic'></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-right-offset' x='0' y='0' width={this.state.rightOffset} height={this.props.height} events={this.props.events.offsetEvent} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0'>
          <title> Click to move window here  </title>
        </rect>
        <rect class={(this.props.focusedIn ? 'focus-in' : '' )} x={-this.props.height/2} y={0} rx={5} ry={5} width={this.props.height} height={this.props.height} pointer-events='none' stroke='none' fill='none' stroke-width='1' />
        <g style={{'cursor': 'ew-resize'}} class='right-handler' events={this.props.events.handlerEvent} role='slider' aria-labelledby={this.titleId} aria-orientation='horizontal' aria-valuemin='0' aria-valuemax='100' aria-valuenow={Math.round(this.state.offsetPercent)} tabindex='0'>
          <title id={this.titleId}> Right Slider Handle </title>
          <circle class='sc-slider-right-sel' cx={0} cy={this.props.height/2} r={15} fill={this.props.handlerColor} stroke='none' filter={`url(#${this.gradId})`}></circle>
          <path class='sc-slider-right-sel-inner' stroke={this.props.innerBarColor} fill='none' d={this.state.sliderRightSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarRight = [
      'M',-2, (this.props.height/2) - 5,
      'L',-2, (this.props.height/2) + 5,
      'M', 2, (this.props.height/2) - 5,
      'L', 2, (this.props.height/2) + 5
    ];

    this.state = {...this.state,
      sliderRightSelInner: innerBarRight.join(' '),
      rightOffset: Math.abs(this.props.width - (this.state.leftOffset + this.state.windowWidth))
    };
  }
}

export default HorizontalScroller;