"use strict";

import Geom from './../core/geom.core';
import UiCore from './../core/ui.core';
import { Component } from "./../viewEngin/pview";
import eventEmitter from './../core/eventEmitter';

/**
 * horizontalScroller.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Scroll area for the chart. Where where user can drag right or left handler 
 * to adjust the window area. 
 * @extends Component
 * 
 * Accepted config -
 "horizontalScroller": {
    "enable": true,
    "width": 200,
    "height": 20,
    "chartInside": true // Show chart inside scroll area.
  }

 * Supported events - 
 * hScroll : fire when user perform scrolling. 

 */

class HorizontalScroller extends Component {
  constructor(props) {
    super(props);
    this.selectedHandler = undefined;
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    let offset = this.calcOffset(props); 
    this.state = {
      sliderLeft: "",
      sliderLeftSel: "",
      sliderLeftSelInner: "",
      leftOffset: offset.leftOffset,
      scrollRight: this.props.width,
      sliderRight: "",
      sliderRightSel: "",
      sliderRightSelInner: "",
      rightOffset: offset.rightOffset,
      windowWidth: offset.windowWidth,
      leftHandlerColor: '#fff',
      rightHandlerColor: '#fff'
    };
    
    this.slider = {}; 
  }

  propsWillReceive(nextProps) {
    let widthChangePercent = ((nextProps.width - this.props.width)/this.props.width)*100;
    this.state.leftOffset = this.state.leftOffset + (this.state.leftOffset*widthChangePercent/100);
    this.state.windowWidth = this.state.windowWidth + (this.state.windowWidth*widthChangePercent/100);
  }

  render() {
    return (
      <g class='sc-horizontal-scroll-cont' transform={`translate(${this.props.posX},${this.props.posY})`}>
        { this.props.opts.chartInside && 
          this.props.extChildren
        }
        <path class='sc-hScroller-upper-path' stroke='#333' fill='none' d={this.getUpperBorderPath()} shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        <path class='sc-hScroller-lower-path' stroke='#333' fill='none' d={this.getLowerBorderPath()} shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        <SliderWindow posX={this.state.leftOffset} posY={0} width={this.state.windowWidth} height={this.props.height} onRef={obj => this.sliderWindow = obj}
          events= {{
            mousedown: this.onMouseDown.bind(this),
            touchstart: this.onMouseDown.bind(this)
          }}> 
        </SliderWindow>
        <SliderLeftHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth}  
          width={this.props.width} height={this.props.height} handlerColor={this.state.leftHandlerColor} onRef={(obj)=>{this.slider.left = obj;}}
          events= {{
            handlerEvent: {
              mousedown: this.onMouseDown.bind(this),
              touchstart: this.onMouseDown.bind(this),
              mouseenter: this.onHoverInHandler.bind(this),
              mouseleave: this.onLeaveInHandler.bind(this),
              focusin: this.onHoverInHandler.bind(this),
              focusout: this.onLeaveInHandler.bind(this)
            },
            offsetEvent: {
              click: this.onOffsetClick.bind(this)
            }
          }}> 
        </SliderLeftHandle>
        <SliderRightHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth}  
          width={this.props.width} height={this.props.height} handlerColor={this.state.rightHandlerColor} onRef={(obj)=>{this.slider.right = obj;}}
          events= {{
            handlerEvent: {
              mousedown: this.onMouseDown.bind(this),
              touchstart: this.onMouseDown.bind(this),
              mouseenter: this.onHoverInHandler.bind(this),
              mouseleave: this.onLeaveInHandler.bind(this),
              focusin: this.onHoverInHandler.bind(this),
              focusout: this.onLeaveInHandler.bind(this)
            },
            offsetEvent: {
              click: this.onOffsetClick.bind(this)
            }
          }}> 
        </SliderRightHandle>
        { this.selectedHandler &&
          <rect class='sc-slider-pane' x={-this.props.posX} y={-this.props.posY} width= {this.props.svgWidth} height={this.props.svgHeight} fill='#000' fill-opacity='0' storke='none' pointer-events='all' style="cursor: -webkit-grabbing; cursor: grabbing;"
            events={{
              mousemove: this.onScrollMove.bind(this),
              touchmove: this.onScrollMove.bind(this),
              mouseup: this.onScrollEnd.bind(this),
              touchend: this.onScrollEnd.bind(this),
              mouseout: this.onScrollEnd.bind(this),
              mouseleave: this.onScrollEnd.bind(this)
            }}
          />
        }
      </g>
    );
  }

  getUpperBorderPath() {
    return [
      "M", 0, 0,
      "L", this.props.width, 0
    ].join(' ');
  }

  getLowerBorderPath() {
    return [
      "M", 0, this.props.height,
      "L", this.props.width, this.props.height
    ].join(' ');
  }

  calcOffset(props) {
    let leftOffset = (props.leftOffset * props.width / 100) || 0;
    let rightOffset = (props.rightOffset * props.width / 100) || 0;
    let windowWidth = rightOffset - leftOffset;
    return { leftOffset, rightOffset, windowWidth };
  }

  onMouseDown(e) {
    let mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    switch (e.target.classList.value) {
      case 'sc-slider-left-sel' :
        this.selectedHandler = 'left';
        break;
      case 'sc-slider-right-sel' :
        this.selectedHandler = 'right';
        break;
      case 'sc-hScroll-window' :
      case 'sc-slider-left-offset' :
      case 'sc-slider-right-offset' :
        this.selectedHandler = 'window';
        break;
    }
    this.mouseDownPos = mousePos;
    this.winWidth = this.state.windowWidth; 
    this.lOffset = this.state.leftOffset; 
    this.update(); 
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
      this.sliderWindow.setState({posX:this.state.leftOffset, width: this.state.windowWidth});
      this.slider.left.setState({leftOffset:this.state.leftOffset, windowWidth: this.state.windowWidth});
      this.slider.right.setState({leftOffset:this.state.leftOffset, windowWidth: this.state.windowWidth});
      this.emitter.emit('hScroll', {
        leftOffset: ((this.state.leftOffset/this.props.width)*100).toFixed(2),
        rightOffset: (((this.state.leftOffset+this.state.windowWidth)/this.props.width)*100).toFixed(2),
        windowWidth: ((this.state.windowWidth/this.props.width)*100).toFixed(2)
      });
    }
  }

  onScrollEnd(e) {
    this.selectedHandler = undefined; 
    this.update(); 
  }

  onOffsetClick(e) {
    this.onMouseDown(e);
    this.mouseDownPos.x = this.lOffset + (this.winWidth/2) + this.props.posX;
    this.onScrollMove(e);
    this.onScrollEnd(e);
  }

  onHoverInHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel')) {
      this.state.leftHandlerColor = e.target.querySelector('.sc-slider-left-sel').style['fill'] = '#ddd';
    }else if(e.target.querySelector('.sc-slider-right-sel')) {
      this.state.rightHandlerColor = e.target.querySelector('.sc-slider-right-sel').style['fill'] = '#ddd';
    }
  }

  onLeaveInHandler(e) {
    if(e.target.querySelector('.sc-slider-left-sel')) {
      this.state.leftHandlerColor = e.target.querySelector('.sc-slider-left-sel').style['fill'] = '#fff';
    }else if(e.target.querySelector('.sc-slider-right-sel')) {
      this.state.rightHandlerColor = e.target.querySelector('.sc-slider-right-sel').style['fill'] = '#fff';
    }
  }
}

class SliderWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
    this.state.events['mouseenter'] = this.onHover.bind(this);
    this.state.events['mouseleave'] = this.onLeave.bind(this);
  }

  propsWillReceive(nextProps) {
    this.state = {...this.state, ...nextProps};
    this.state.events['mouseenter'] = this.onHover.bind(this);
    this.state.events['mouseleave'] = this.onLeave.bind(this);
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
        <rect class='sc-hScroll-window' x={0} y={0} width={this.state.width} height={this.state.height} fill= 'rgb(102,133,194)'  fill-opacity='0.2' storke='none' pointer-events='all' 
        style="transition: fill-opacity 0.3s linear; cursor: -webkit-grab; cursor: grab;" events={this.state.events} />
        <title> Slider Window (Grab to move) </title>
      </g>
    );
  }

  onHover(e) {
    this.ref.node.querySelector('.sc-hScroll-window').style['fill-opacity'] = 0.5;
  }

  onLeave(e) {
    this.ref.node.querySelector('.sc-hScroll-window').style['fill-opacity'] = 0.2;
  }
}

class SliderLeftHandle extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
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
          <filter xmlns="http://www.w3.org/2000/svg" id="slider-dropshadow-left" height="130%" width="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
              <feOffset dx="-1" dy="0" result="offsetblur"></feOffset>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7"></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-left-offset' x={-this.state.leftOffset} y='0' width={this.state.leftOffset} height={this.props.height} events={this.props.events.offsetEvent} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0' stroke-width='0.1' stroke='#717171' >
          <title> Click to move window here  </title>
        </rect>
        <g style={{'cursor': 'ew-resize'}} events={this.props.events.handlerEvent} tabindex="0">
          <title> Left Slider Handle </title>
          <path class='sc-slider-left-sel' stroke='rgb(178, 177, 182)' fill={this.props.handlerColor} filter={`url(#slider-dropshadow-left)`} d={this.state.sliderLeftSel} pointer-events='all' stroke-width='0' opacity='1'></path>
          <path class='sc-slider-left-sel-inner' stroke='#5a5a5a' fill='none' d={this.state.sliderLeftSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
          <path class='sc-slider-left' stroke='rgb(178, 177, 182)' fill='none' d={this.state.sliderLeft}  pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarLeft = [
      "M", (- 5), (this.props.height/2) - 5,
      "L", (- 5), (this.props.height/2) + 5,
      "M", (- 7), (this.props.height/2) - 5,
      "L", (- 7), (this.props.height/2) + 5
    ];

    this.state = {...this.state, 
      sliderLeft: ['M', 0, 0, 'L', 0, this.props.height].join(' '),
      sliderLeftSel: Geom.describeEllipticalArc(0, (this.props.height/2), 15, 15, 180, 360, 0).d,
      sliderLeftSelInner: innerBarLeft.join(' ')
    };
  }
}

class SliderRightHandle extends Component {
  constructor(props) {
    super(props);
    this.state = {...this.props};
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
          <filter xmlns="http://www.w3.org/2000/svg" id="slider-dropshadow-right" height="130%" width="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"></feGaussianBlur>
              <feOffset dx="1" dy="" result="offsetblur"></feOffset>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7"></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-right-offset' x='0' y='0' width={this.state.rightOffset} height={this.props.height} events={this.props.events.offsetEvent} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0' stroke-width='0.1' stroke='#717171' >
          <title> Click to move window here  </title>
        </rect>
        <g style={{'cursor': 'ew-resize'}} class='right-handler' events={this.props.events.handlerEvent} tabindex="0">
          <title> Right Slider Handle </title>
          <path class='sc-slider-right-sel' stroke='rgb(178, 177, 182)' fill={this.props.handlerColor} filter={`url(#slider-dropshadow-right)`} d={this.state.sliderRightSel} stroke-width='0' opacity='1'></path>
          <path class='sc-slider-right-sel-inner' stroke='#5a5a5a' fill='none' d={this.state.sliderRightSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
          <path class='sc-slider-right' stroke='rgb(178, 177, 182)' fill='none' d={this.state.sliderRight} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarRight = [
      "M", 4, (this.props.height/2) - 5,
      "L", 4, (this.props.height/2) + 5,
      "M", 6, (this.props.height/2) - 5,
      "L", 6, (this.props.height/2) + 5
    ];

    this.state = {...this.state, 
      sliderRight: ['M', 0, 0, 'L', 0, this.props.height].join(' '),
      sliderRightSel: Geom.describeEllipticalArc(0, (this.props.height/2), 15, 15, 180, 360, 1).d, 
      sliderRightSelInner: innerBarRight.join(' '),
      rightOffset: Math.abs(this.props.width - (this.state.leftOffset + this.state.windowWidth))
    };
  }
}

export default HorizontalScroller;