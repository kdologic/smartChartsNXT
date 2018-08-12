/**
 * horizontalScroller.js
 * @createdOn:14-Jul-2017
 * @version:2.0.0
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Scroll area for the chart. 
 */


import defaultConfig from "./../settings/config";
import Geom from './../core/geom.core';
import UiCore from './../core/ui.core';
import { Component } from "./../viewEngin/pview";
import eventEmitter from './../core/eventEmitter';

/**
 * This components will create a Horizontal Scroll area for the chart. Where where user can drag right or left handler 
 * to adjust the window area. 
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
      windowWidth: offset.windowWidth
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
        <path class='sc-hScroller-upper-path' stroke='#333' fill='none' d={this.getUpperBorderPath()} shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        {this.props.extChildren}
        <SliderWindow posX={this.state.leftOffset} posY={0} width={this.state.windowWidth} height={this.props.height} onRef={obj => this.sliderWindow = obj}
          events= {{
            mousedown: this.onMouseDown.bind(this)
          }}> 
        </SliderWindow>
        <SliderLeftHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth}  
          width={this.props.width} height={this.props.height} onRef={(obj)=>{this.slider.left = obj;}}
          events= {{
            mousedown: this.onMouseDown.bind(this)
          }}> 
        </SliderLeftHandle>
        <SliderRightHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth}  
          width={this.props.width} height={this.props.height} onRef={(obj)=>{this.slider.right = obj;}}
          events= {{
            mousedown: this.onMouseDown.bind(this)
          }}> 
        </SliderRightHandle>
        { this.selectedHandler &&
          <rect class='sc-slider-pane' x='-50' y='0' width= {this.props.width + 100} height={this.props.height} fill='#000' fill-opacity='0.2' storke='none' pointer-events='all' style="cursor: -webkit-grabbing; cursor: grabbing;"
            events={{
              mousemove : this.onScrollMove.bind(this),
              mouseup : this.onScrollEnd.bind(this),
              mouseout : this.onScrollEnd.bind(this),
              mouseleave : this.onScrollEnd.bind(this)
            }}
          />
        }
      </g>
    );
  }

  getUpperBorderPath() {
    return [
      "M", 0, 10,
      "L", 0, 0,
      "L", this.props.width, 0,
      "L", this.props.width , 10
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
      case 'sc-slider-left-sel':
        this.selectedHandler = 'left';
        break;
      case 'sc-slider-right-sel':
        this.selectedHandler = 'right';
        break;
      case 'sc-hScroll-window':
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
          winWidth = this.winWidth - (this.mouseDownPos.x - mousePosNow.x);
          break;
        case 'window':
          winWidth = this.winWidth; 
          lOffset = this.lOffset - (this.mouseDownPos.x - mousePosNow.x);
          break;
      }

      console.log('window -->',winWidth, 'leftoffset---->', lOffset);
      if(winWidth < 0) {
        if(this.selectedHandler === 'right') {
          lOffset = this.lOffset + winWidth; 
        }else {
          lOffset += winWidth; 
        }
        winWidth = Math.abs(winWidth); 
      }
      this.state.leftOffset = lOffset;
      this.state.windowWidth = winWidth;
      console.log('leftoffset', lOffset);
      console.log('window width:', this.state.windowWidth, 'mPos:', this.mouseDownPos.x, 'mPosNow:', mousePosNow.x);
      
      // if(lOffset + winWidth > this.props.width) {
      //   if(this.selectedHandler === 'window') {
      //     winWidth = this.winWidth;
      //     lOffset = this.props.width - this.winWidth;
      //   }else {
      //     winWidth = this.props.width - lOffset;
      //   }
      // }

      // if(lOffset < 0) {
      //   this.state.leftOffset = 0; 
      //   winWidth = this.winWidth; 
      // }else if(lOffset > this.props.width) {
      //   this.state.leftOffset =this.props.width;
      // }else {
      //   this.state.leftOffset = lOffset;
      // }

      // if(winWidth < 0) {
      //   this.selectedHandler = this.selectedHandler === 'left' ? 'right' : 'left'; 
      //   this.winWidth = 0; 
      //   this.state.windowWidth = 0;
      //   //this.mouseDownPos = mousePosNow;
      //   this.lOffset = lOffset; 
      // }
      //this.state.windowWidth = Math.abs(winWidth);
      
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
}

class SliderWindow extends Component {
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
    return (
      <g class='sc-slider-window-cont' transform={`translate(${this.state.posX},${this.state.posY})`} >
        <rect class='sc-hScroll-window' x={0} y={0} width={this.state.width} height={this.state.height} fill='#000' fill-opacity='0' storke='none' pointer-events='all' 
        style="cursor: -webkit-grab; cursor: grab;" events={this.props.events} />
      </g>
    );
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
          <filter xmlns="http://www.w3.org/2000/svg" id="slider-dropshadow-left" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
              <feOffset dx="-1" dy="1" result="offsetblur"></feOffset>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-left-offset' x={-this.state.leftOffset} y='0' width={this.state.leftOffset} height={this.props.height} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0.7' stroke-width='0.1' stroke='#717171' />
        <g style={{'cursor': 'ew-resize'}} events={this.props.events}>
          <path class='sc-slider-left' stroke='rgb(178, 177, 182)' fill='none' d={this.state.sliderLeft}  pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
          <path class='sc-slider-left-sel' stroke='rgb(178, 177, 182)' fill='#fff' filter={`url(#slider-dropshadow-left)`} d={this.state.sliderLeftSel} pointer-events='all' stroke-width='0' opacity='1'></path>
          <path class='sc-slider-left-sel-inner' stroke='#5a5a5a' fill='none' d={this.state.sliderLeftSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarLeft = [
      "M", (- 4), (this.props.height/2) - 5,
      "L", (- 4), (this.props.height/2) + 5,
      "M", (- 6), (this.props.height/2) - 5,
      "L", (- 6), (this.props.height/2) + 5
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
          <filter xmlns="http://www.w3.org/2000/svg" id="slider-dropshadow-right" height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
              <feOffset dx="1" dy="1" result="offsetblur"></feOffset>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-right-offset' x='0' y='0' width={this.state.rightOffset} height={this.props.height} fill= 'rgba(102,133,194,0.3)'  fill-opacity='0.7' stroke-width='0.1' stroke='#717171' />
        <g style={{'cursor': 'ew-resize'}} class='right-handler' events={this.props.events}>
          <path class='sc-slider-right' stroke='rgb(178, 177, 182)' fill='none' d={this.state.sliderRight} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
          <path class='sc-slider-right-sel' stroke='rgb(178, 177, 182)' fill='#fff' filter={`url(#slider-dropshadow-right)`} d={this.state.sliderRightSel} stroke-width='0' opacity='1'></path>
          <path class='sc-slider-right-sel-inner' stroke='#5a5a5a' fill='none' d={this.state.sliderRightSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths() {
    let innerBarRight = [
      "M", 3, (this.props.height/2) - 5,
      "L", 3, (this.props.height/2) + 5,
      "M", 5, (this.props.height/2) - 5,
      "L", 5, (this.props.height/2) + 5
    ];

    this.state = {...this.state, 
      sliderRight: ['M', 0, 0, 'L', 0, this.props.height].join(' '),
      sliderRightSel: Geom.describeEllipticalArc(1, (this.props.height/2), 15, 15, 180, 360, 1).d, 
      sliderRightSelInner: innerBarRight.join(' '),
      rightOffset: this.props.width - (this.state.leftOffset + this.state.windowWidth)
    };
  }
}

export default HorizontalScroller;