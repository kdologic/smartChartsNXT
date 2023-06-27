'use strict';

import Point, { RangePoint } from '../../core/point';
import { Component } from '../../viewEngin/pview';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import UiCore from '../../core/ui.core';
import SpeechBox from '../../components/speechBox/speechBox.components';
import defaultConfig from '../../settings/config';
import StoreManager from '../../liveStore/storeManager';
import { IHorizontalScrollerProps, IHScrollOffsetModel } from './horizontalScroller.model';
import Store from '../../liveStore/store';
import { IVnode } from '../../viewEngin/component.model';
import SliderWindow from './sliderWindow/sliderWindow.component';
import SliderLeftHandle from './sliderLeftHandle/sliderLeftHandle.component';
import SliderRightHandle from './sliderRightHandle/sliderRightHandle.component';

/**
 * horizontalScroller.component.tsx
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
 * @event
 * hScroll : Fire when user perform scrolling.
 */

class HorizontalScroller extends Component<IHorizontalScrollerProps> {
  private selectedHandler: string;
  private emitter: CustomEvents;
  private store: Store;
  private rangeLabelTexPadding: number;
  private rangeLabelBoxHeight: number;
  private anchorHeight: number;
  private scrollTime: number;
  private scrollThrottle: number;
  private mouseDownPos: Point;
  private winWidth: number;
  private lOffset: number;

  constructor(props: IHorizontalScrollerProps) {
    super(props);
    this.selectedHandler = undefined;
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.store = StoreManager.getStore((this as any).context.runId);
    const offset: IHScrollOffsetModel = this.calcOffset(props);
    this.rangeLabelTexPadding = 5;
    this.rangeLabelBoxHeight = 30;
    this.anchorHeight = 10;
    this.scrollTime = Date.now();
    this.scrollThrottle = 150;
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
      leftHandlePos: new Point(0, 0),
      rightHandlePos: new Point(0, 0),
      leftHandlerColor: '#fff',
      rightHandlerColor: '#fff',
      leftInnerBarColor: '#5a5a5a',
      rightInnerBarColor: '#5a5a5a',
      sliderWindowOpacity: 0.2,
      handlerFocused: null,
      rangeTipPoints: [],
      leftRangeTipXY: new Point(0, -(this.rangeLabelBoxHeight + this.anchorHeight)),
      rightRangeTipXY: new Point(0, -(this.rangeLabelBoxHeight + this.anchorHeight)),
      leftRangeTipTextPos: new Point(0, 0),
      rightRangeTipTextPos: new Point(0, 0)
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
    this.onUpdateRangeVal = this.onUpdateRangeVal.bind(this);
  }

  propsWillReceive(nextProps: IHorizontalScrollerProps) {
    const globalRenderAll = this.store.getValue('globalRenderAll');
    const widthChangePercent = ((nextProps.width - this.props.width) / this.props.width) * 100;
    if (widthChangePercent) {
      this.state.leftOffset = this.state.leftOffset + (this.state.leftOffset * widthChangePercent / 100);
      this.state.windowWidth = this.state.windowWidth + (this.state.windowWidth * widthChangePercent / 100);
      this.state.rangeTipPoints = [];
    }else if(globalRenderAll) {
      const offset: IHScrollOffsetModel = this.calcOffset(nextProps);
      this.state.leftOffset = offset.leftOffset;
      this.state.leftOffsetPercent = offset.leftOffsetPercent;
      this.state.rightOffset = offset.rightOffset;
      this.state.rightOffsetPercent = offset.rightOffsetPercent;
      this.state.windowWidth = offset.windowWidth;
    }
  }

  afterMount() {
    this.emitter.on('onScrollReset', this.onScrollReset);
    this.emitter.on('onUpdateRangeVal', this.onUpdateRangeVal);
  }

  beforeUnmount() {
    this.emitter.removeListener('onScrollReset', this.onScrollReset);
    this.emitter.removeListener('onUpdateRangeVal', this.onUpdateRangeVal);
    this.onScrollEnd();
  }

  render() {
    let clip = {
      x: this.props.width * this.state.leftOffsetPercent / 100,
      width: this.props.width * this.state.rightOffsetPercent / 100 - this.props.width * this.state.leftOffsetPercent / 100
    };
    return (
      <g class='sc-horizontal-scroll-cont' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <defs aria-hidden='true'>
          <clipPath id={this.props.windowClipId}>
            <rect x={clip.x} y={0} width={clip.width} height={this.props.height} />
          </clipPath>
          <clipPath id={this.props.offsetClipId}>
            <rect x={0} y={0} width={clip.x} height={this.props.height} />
            <rect x={clip.x + clip.width} y={0} width={this.props.width - (clip.x + clip.width)} height={this.props.height} />
          </clipPath>
        </defs>
        <rect class='sc-slider-bg' x={0} y={0} width={this.props.width} height={this.props.height} fill='#ddd' fill-opacity='0.1' />
        {this.props.extChildren}
        <SliderWindow posX={this.state.leftOffset} posY={0} width={this.state.windowWidth} height={this.props.height} offsetColor={this.props.offsetColor}
          fillOpacity={this.state.sliderWindowOpacity} focusedIn={this.state.handlerFocused === 'window'}
          events={{
            mousedown: this.onMouseDown,
            touchstart: this.onMouseDown,
            mouseenter: this.onHoverInSliderWindow,
            mouseleave: this.onLeaveSliderWindow,
            focusin: this.onFocusInSliderWindow,
            focusout: this.onFocusOutSliderWindow,
            keydown: this.onKeyMove
          }}>
        </SliderWindow>

        <SliderLeftHandle leftOffset={this.state.leftOffset} windowWidth={this.state.windowWidth} offsetPercent={this.state.leftOffsetPercent}
          width={this.props.width} height={this.props.height} handlerColor={this.state.leftHandlerColor} innerBarColor={this.state.leftInnerBarColor}
          focusedIn={this.state.handlerFocused === 'left'}
          events={{
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
          events={{
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

        {this.selectedHandler &&
          <rect class='sc-slider-pane' x={-this.props.posX} y={-this.props.posY} width={(this as any).context.svgWidth} height={(this as any).context.svgHeight} fill='#000' fill-opacity='0' stroke='none' pointer-events='all' style='cursor: grabbing; cursor: -webkit-grabbing; cursor: -moz-grabbing;' />
        }

        {this.state.rangeTipPoints.length > 1 && (this.selectedHandler || this.state.handlerFocused) &&
          <g class='sc-slider-range-tip'>
            {this.state.rangeTipPoints[0].value !== undefined &&
              <SpeechBox x={this.state.leftRangeTipXY.x} y={this.state.leftRangeTipXY.y} width={this.state.rangeTipPoints[0].textDim.width + (2 * this.rangeLabelTexPadding)} height={this.rangeLabelBoxHeight}
                cpoint={new Point(this.state.leftHandlePos.x, 0)} bgColor='#62d8dc' fillOpacity={0.7} cornerRadius={5}
                shadow={true} strokeColor='#000' strokeWidth='1'>
              </SpeechBox>
            }
            {this.state.rangeTipPoints[1].value !== undefined &&
              <SpeechBox x={this.state.rightRangeTipXY.x} y={this.state.rightRangeTipXY.y} width={this.state.rangeTipPoints[1].textDim.width + (2 * this.rangeLabelTexPadding)} height={this.rangeLabelBoxHeight}
                cpoint={new Point(this.state.rightHandlePos.x, 0)} bgColor='#62d8dc' fillOpacity={0.7} cornerRadius={5}
                shadow={true} strokeColor='#000' strokeWidth='1'>
              </SpeechBox>
            }
            {
              [
                this.getRangeLabelText(this.state.leftRangeTipTextPos, this.state.rangeTipPoints[0].value),
                this.getRangeLabelText(this.state.rightRangeTipTextPos, this.state.rangeTipPoints[1].value)
              ]
            }
          </g>
        }
      </g>
    );
  }

  getRangeLabelText(position: Point, printValue: string | number): IVnode {
    return (
      <text class='sc-range-label-text' fill={'#000'} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' stroke='none' style='font-size:12px;'>
        <tspan x={position.x} y={-(this.rangeLabelBoxHeight / 2 + this.rangeLabelTexPadding)} text-anchor='middle'>{printValue}</tspan>
      </text>
    );
  }

  getUpperBorderPath(): string {
    return [
      'M', 0, 0,
      'L', this.props.width, 0
    ].join(' ');
  }

  getLowerBorderPath(): string {
    return [
      'M', 0, this.props.height,
      'L', this.props.width, this.props.height
    ].join(' ');
  }

  calcOffset(props: IHorizontalScrollerProps): IHScrollOffsetModel {
    let leftOffset = (props.leftOffset * props.width / 100) || 0;
    let rightOffset = (props.rightOffset * props.width / 100) || 0;
    let windowWidth = rightOffset - leftOffset;
    return { leftOffset, rightOffset, windowWidth, leftOffsetPercent: leftOffset / props.width * 100, rightOffsetPercent: rightOffset / props.width * 100 };
  }

  onMouseDown(e: MouseEvent | TouchEvent): void {
    let mousePos: Point = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    let classList = Array.prototype.slice.call((e.target as SVGElement).classList);
    if (classList.includes('sc-slider-left-sel')) {
      this.selectedHandler = 'left';
    } else if (classList.includes('sc-slider-right-sel')) {
      this.selectedHandler = 'right';
    } else if (classList.includes('sc-hScroll-window') || classList.includes('sc-slider-left-offset') || classList.includes('sc-slider-right-offset')) {
      this.selectedHandler = 'window';
    }

    this.mouseDownPos = mousePos;
    this.winWidth = this.state.windowWidth;
    this.lOffset = this.state.leftOffset;

    window.addEventListener('mousemove', this.onScrollMove, false);
    window.addEventListener('touchmove', this.onScrollMove, false);
    window.addEventListener('mouseup', this.onScrollEnd, false);
    window.addEventListener('touchend', this.onScrollEnd, false);
  }

  onScrollMove(e: MouseEvent): void {
    if (this.selectedHandler) {
      const mousePosNow: Point = UiCore.cursorPoint((this as any).context.rootContainerId, e);
      let winWidth = 0;
      let lOffset = this.state.leftOffset;
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

      if (winWidth < 0) {
        if (this.selectedHandler === 'right') {
          lOffset = this.lOffset + winWidth;
        } else {
          lOffset += winWidth;
        }
        winWidth = Math.abs(winWidth);
      }

      if (lOffset < 0) {
        if (this.selectedHandler !== 'window') {
          winWidth += lOffset;
        }
        lOffset = 0;
      } else if (lOffset > this.props.width) {
        lOffset = this.props.width;
      }

      if (lOffset + winWidth > this.props.width) {
        if (this.selectedHandler === 'window') {
          winWidth = this.winWidth;
          lOffset = this.props.width - this.winWidth;
        } else {
          winWidth = this.props.width - lOffset;
        }
      }

      this.state.leftOffset = lOffset;
      this.state.windowWidth = winWidth;
      this.state.rightOffset = lOffset + winWidth;
      this.state.leftOffsetPercent = this.state.leftOffset / this.props.width * 100;
      this.state.rightOffsetPercent = ((this.state.leftOffset + this.state.windowWidth) / this.props.width) * 100;

      this.state.leftHandlePos = new Point(this.state.leftOffset, this.props.posY);
      this.state.rightHandlePos = new Point(this.state.rightOffset, this.props.posY);
      if((this.scrollTime + this.scrollThrottle - Date.now()) < 0) {
        this.emitter.emit('hScroll', {
          leftOffset: this.state.leftOffsetPercent,
          leftHandlePos: this.state.leftHandlePos,
          rightOffset: this.state.rightOffsetPercent,
          rightHandlePos: this.state.rightHandlePos,
          windowWidth: ((this.state.windowWidth / this.props.width) * 100)
        });
        this.scrollTime = Date.now();
      }
      this.update();
    }
  }

  onUpdateRangeVal(e: {rangeTipPoints: RangePoint[]}) {
    this.state.rangeTipPoints = e.rangeTipPoints;
    this.state.rangeTipPoints.forEach((point: RangePoint) => {
      let textDim = UiCore.getComputedBBox(this.getRangeLabelText(new Point(0, 0), point.value));
      textDim.width = textDim.width < 25 ? 25 : textDim.width;
      point.textDim = textDim;
    });
    this.state.leftRangeTipXY.x = this.state.leftHandlePos.x - this.rangeLabelTexPadding - (this.state.rangeTipPoints[0].textDim.width / 2);
    this.state.rightRangeTipXY.x = this.state.rightRangeTipTextPos.x = this.state.rightHandlePos.x - this.rangeLabelTexPadding - (this.state.rangeTipPoints[1].textDim.width / 2);
    if (this.state.leftRangeTipXY.x + (this.rangeLabelTexPadding * 3) + this.state.rangeTipPoints[0].textDim.width > this.state.rightRangeTipXY.x) {
      this.state.rightRangeTipXY.x = this.state.leftRangeTipXY.x + (this.rangeLabelTexPadding * 3) + this.state.rangeTipPoints[0].textDim.width;
    }
    if(this.state.rightRangeTipXY.x + (this.rangeLabelTexPadding * 2) + this.state.rangeTipPoints[1].textDim.width > this.props.width) {
      const diff = this.state.rightRangeTipXY.x + (this.rangeLabelTexPadding * 2) + this.state.rangeTipPoints[1].textDim.width - this.props.width;
      this.state.rightRangeTipXY.x -= diff;
    }
    if (this.state.leftRangeTipXY.x + (this.rangeLabelTexPadding * 3) + this.state.rangeTipPoints[0].textDim.width > this.state.rightRangeTipXY.x) {
      const diff = this.state.leftRangeTipXY.x + (this.rangeLabelTexPadding * 3) + this.state.rangeTipPoints[1].textDim.width - this.state.rightRangeTipXY.x;
      this.state.leftRangeTipXY.x -= diff;
    }
    this.state.leftRangeTipTextPos.x = this.state.leftRangeTipXY.x + (this.state.rangeTipPoints[0].textDim.width / 2) + this.rangeLabelTexPadding;
    this.state.rightRangeTipTextPos.x = this.state.rightRangeTipXY.x + (this.state.rangeTipPoints[1].textDim.width / 2) + this.rangeLabelTexPadding;

    this.update();
  }

  onScrollEnd() {
    this.selectedHandler = undefined;
    this.update();
    window.removeEventListener('mousemove', this.onScrollMove);
    window.removeEventListener('mouseup', this.onScrollEnd);
    window.removeEventListener('touchmove', this.onScrollMove);
    window.removeEventListener('touchend', this.onScrollEnd);
  }

  onOffsetClick(e: MouseEvent) {
    this.onMouseDown(e);
    this.mouseDownPos.x = this.lOffset + (this.winWidth / 2) + this.props.posX;
    this.onScrollMove(e);
    this.onScrollEnd();
  }

  onHoverInHandler(e: MouseEvent) {
    if ((e.target as SVGElement).querySelector('.sc-slider-left-sel')) {
      this.setState({ leftHandlerColor: '#333', leftInnerBarColor: '#fff' });
    } else if ((e.target as SVGElement).querySelector('.sc-slider-right-sel')) {
      this.setState({ rightHandlerColor: '#333', rightInnerBarColor: '#fff' });
    }
  }

  onLeaveInHandler(e: MouseEvent) {
    if ((e.target as SVGElement).querySelector('.sc-slider-left-sel') && this.state.handlerFocused !== 'left') {
      this.setState({ 'leftHandlerColor': '#fff', leftInnerBarColor: '#5a5a5a' });
    } else if ((e.target as SVGElement).querySelector('.sc-slider-right-sel') && this.state.handlerFocused !== 'right') {
      this.setState({ 'rightHandlerColor': '#fff', rightInnerBarColor: '#5a5a5a' });
    }
  }

  onFocusInHandler(e: MouseEvent) {
    if ((e.target as SVGElement).querySelector('.sc-slider-left-sel')) {
      this.setState({ leftHandlerColor: '#333', leftInnerBarColor: '#fff', handlerFocused: 'left' });
    } else if ((e.target as SVGElement).querySelector('.sc-slider-right-sel')) {
      this.setState({ rightHandlerColor: '#333', rightInnerBarColor: '#fff', handlerFocused: 'right' });
    }
  }

  onFocusOutHandler(e: MouseEvent) {
    if ((e.target as SVGElement).querySelector('.sc-slider-left-sel')) {
      this.setState({ 'leftHandlerColor': '#fff', leftInnerBarColor: '#5a5a5a', handlerFocused: null });
    } else if ((e.target as SVGElement).querySelector('.sc-slider-right-sel')) {
      this.setState({ 'rightHandlerColor': '#fff', rightInnerBarColor: '#5a5a5a', handlerFocused: null });
    }
  }

  onHoverInSliderWindow() {
    this.setState({ 'sliderWindowOpacity': 0.5 });
  }

  onLeaveSliderWindow() {
    this.setState({ 'sliderWindowOpacity': 0.2 });
  }

  onFocusInSliderWindow() {
    this.setState({ 'sliderWindowOpacity': 0.5, handlerFocused: 'window' });
  }

  onFocusOutSliderWindow() {
    this.setState({ 'sliderWindowOpacity': 0.2, handlerFocused: null });
  }

  onKeyMove(e: KeyboardEvent) {
    let event = {
      clientX: this.state.leftOffset,
      clientY: 0
    };
    if(!(this.ref.node instanceof Text)) {
      switch (this.state.handlerFocused) {
        case 'left':
          (e.target as SVGElement) = this.ref.node.querySelector('.sc-slider-left-sel');
          break;
        case 'right':
          (e.target as SVGElement) = this.ref.node.querySelector('.sc-slider-right-sel');
          break;
        case 'window':
          (e.target as SVGElement) = this.ref.node.querySelector('.sc-hScroll-window');
          break;
      }
    }
    

    // left arrow pressed
    if (e.key === 'ArrowLeft') {
      this.onMouseDown(event as MouseEvent);
      event.clientX = this.state.leftOffset - 10;
      // right arrow pressed
    } else if (e.key == 'ArrowRight') {
      this.onMouseDown(event as MouseEvent);
      event.clientX = this.state.leftOffset + 10;
    }
    this.onScrollMove(event as MouseEvent);
    this.onScrollEnd();
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

export default HorizontalScroller;