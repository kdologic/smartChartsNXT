'use strict';

import Point from './../core/point';
import { Component } from './../viewEngin/pview';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import UiCore from './../core/ui.core';
import GeomCore from './../core/geom.core';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import RichTextBox from './../components/richTextBox';


/**
 * popupContainer.js
 * @createdOn:22-Dec-2020
 * @author:SmartChartsNXT
 * @description:This is a base component to show SVG based popup.
 * @extends Component
 */

class PopupContainer extends Component {
  constructor(props) {
    super(props);
    this.rid = UtilCore.getRandomID();
    this.shadowId = 'shadow-' + this.rid;
    this.state = {
      popupData: {},
      popupQueue: [],
      paddingX: 5,
      paddingY: 5,
      titleHeight: 30,
      hasModal: false
    };
    this.activePopup = null;
    this.mousePos = null;
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.createPopup = this.createPopup.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCloseIconMouseIn = this.onCloseIconMouseIn.bind(this);
    this.onCloseIconMouseOut = this.onCloseIconMouseOut.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('createPopup', this.createPopup);
    this.emitter.on('resize', this.onResize);
  }

  beforeUnmount() {
    this.emitter.removeListener('createPopup', this.createPopup);
    this.emitter.removeListener('resize', this.onResize);
  }

  render() {
    return (
      <g class="sc-popup-container">
        {this.state.hasModal &&
          <rect class="sc-popup-backdrop" x={0} y={0} width={this.context.svgWidth} height={this.context.svgHeight} fill={'#000'} fill-opacity={0.2} style={{ 'pointer-events': 'all' }}></rect>
        }
        {this.getStyle()}
        {UiCore.dropShadow(this.shadowId, 5, 5)}
        {this.renderAllPopups()}
      </g>
    );
  }

  renderAllPopups() {
    let popups = [];
    for (let popupId of this.state.popupQueue) {
      let data = this.state.popupData[popupId];
      popups.push(
        <g instanceId={popupId} id={popupId} transform={`translate(${data.draggedX}, ${data.draggedY})`} >
          <defs>
            <clipPath id={data.clipId}>
              <path d={GeomCore.describeRoundedRect(0, 0, data.width, data.height, 5).join(' ')} fill="none" stroke="#000"></path>
            </clipPath>
          </defs>

          <path class='sc-popup-bg' d={GeomCore.describeRoundedRect(0, 0, data.width, data.height, 5).join(' ')} fill="#FAFAFA" stroke="none" filter={`url(#${this.shadowId})`}></path>

          <g class="sc-popup-title-bar" clip-path={`url(#${data.clipId})`}>
            <rect class='sc-popup-title-bg' x={0} y={0} width={data.width} height={this.state.titleHeight} fill="#DADADA" stroke="none" style={{ 'cursor': data.isDraggable ? 'move' : 'default' }}
              events={{
                mousedown: (e) => this.onMouseDown(e, popupId, data.isDraggable),
                touchstart: (e) => this.onMouseDown(e, popupId, data.isDraggable)
              }}></rect>
            <g style={{ 'pointerEvents': 'none' }}>
              <RichTextBox class='sc-popup-title' posX={2 * this.state.paddingX} posY={0} width={data.width - this.state.titleHeight - (2 * this.state.paddingY)} height={this.state.titleHeight} textAlign={ENUMS.HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={true}
                fontSize={Number.parseFloat(data.fontSize) + 1} textColor={data.fontColor} text={data.title || ''}>
              </RichTextBox>
            </g>
            <g class="sc-close-icon-group" transform={`translate(${data.width - this.state.titleHeight}, ${0})`}>
              <rect class='sc-close-icon-bg' x={0} y={0} width={this.state.titleHeight} height={this.state.titleHeight} fill="#d73e4d" stroke="none" fill-opacity={0.01}
                events={{
                  click: (e) => this.onClose(e, popupId),
                  mouseenter: (e) => this.onCloseIconMouseIn(e, popupId),
                  mouseleave: (e) => this.onCloseIconMouseOut(e, popupId),
                  focusin: (e) => this.onCloseIconMouseIn(e, popupId),
                  focusout: (e) => this.onCloseIconMouseOut(e, popupId)
                }}>
              </rect>
              <text class='sc-close-cross' text-rendering='geometricPrecision' stroke='#000' fill='#000' font-size='22' pointer-events='none'>
                <tspan text-anchor='middle' x={15} y={22}>&times;</tspan>
              </text>
            </g>
          </g>

          <g class="sc-popup-body-group" clip-path={`url(#${data.clipId})`}>
            <RichTextBox class='sc-popup-body' posX={0} posY={this.state.titleHeight} width={data.width} height={data.height - this.state.titleHeight}
              textAlign={ENUMS.HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={data.textVerticalAlignMiddle} overflow="scroll"
              fontSize={data.fontSize} textColor={data.fontColor} style={{ ...{ padding: '5px' }, ...data.style }} text={data.body || ''} >
            </RichTextBox>
          </g>

        </g>
      );
    }
    return popups;
  }

  createPopup(data) {
    const popupId = 'popup-' + UtilCore.getRandomID();
    this.state.popupQueue.push(popupId);
    let popupData = this.parsePopupData(data);
    this.state.popupData[popupId] = popupData;
    if(popupData.isModal) {
      this.state.hasModal = true;
    }
    this.update();
  }

  destroyPopup(popupId) {
    if (this.state.popupData[popupId]) {
      delete this.state.popupData[popupId];
      this.state.popupQueue.splice(this.state.popupQueue.indexOf(popupId), 1);
      this.state.hasModal = false;
      for(let key in this.state.popupData) {
        if(this.state.popupData[key].isModal) {
          this.state.hasModal = true;
        }
      }
      this.update();
    }
  }

  parsePopupData(data) {
    let defaults = {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      title: '',
      body: '',
      fontSize: '14',
      fontColor: '#000',
      style: {},
      isDraggable: true,
      isModal: true,
      textVerticalAlignMiddle: false,
      clipId:'clip-' + UtilCore.getRandomID()
    };
    let mergedData = { ...defaults, ...data };
    mergedData.draggedX = mergedData.x;
    mergedData.draggedY = mergedData.y;
    return mergedData;
  }

  getStyle() {
    return (
      <style>
        {`
          .sc-close-icon-bg {
            transition-duration: .15s;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-property: fill-opacity;
            cursor:pointer;
          }
          .sc-close-icon-bg:hover, .sc-close-icon-bg:focus {
            fill-opacity: 1;
          }
        `}
      </style>
    );
  }

  rearrangePopupQueue() {
    let activeIndex = this.state.popupQueue.indexOf(this.activePopup);
    this.state.popupQueue.splice(activeIndex, 1);
    this.state.popupQueue.push(this.activePopup);
  }

  onMouseDown(e, popupId, isDraggable) {
    if (!isDraggable) {
      return;
    }
    this.mousePos = UiCore.cursorPoint(this.context.rootContainerId, e);
    this.activePopup = popupId;
    this.rearrangePopupQueue();
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('touchmove', this.onMouseMove, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
    window.addEventListener('touchend', this.onMouseUp, false);
  }

  onMouseMove(e) {
    if (this.activePopup) {
      let mousePosNow = UiCore.cursorPoint(this.context.rootContainerId, e);
      let mouseMoved = new Point(mousePosNow.x - this.mousePos.x, mousePosNow.y - this.mousePos.y);
      let popupData = this.state.popupData[this.activePopup];
      popupData.draggedX = popupData.x + mouseMoved.x;
      popupData.draggedY = popupData.y + mouseMoved.y;
      this.update();
    }
  }

  onMouseUp() {
    let popupData = this.state.popupData[this.activePopup];
    popupData.x = popupData.draggedX;
    popupData.y = popupData.draggedY;
    this.activePopup = null;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('touchend', this.onMouseUp);
  }

  onClose(e, popupId) {
    this.destroyPopup(popupId);
  }

  onCloseIconMouseIn(e, popupId) {
    let crossText = this.ref.node.querySelector('#' + popupId + ' .sc-close-cross');
    crossText.style.fill = '#fff';
    crossText.style.stroke = '#fff';
  }

  onCloseIconMouseOut(e, popupId) {
    let crossText = this.ref.node.querySelector('#' + popupId + ' .sc-close-cross');
    crossText.style.fill = '#000';
    crossText.style.stroke = '#000';
  }

  onResize(e) {
    let resizeInfo = e.data;
    for (let key in this.state.popupData) {
      let popupData = this.state.popupData[key];
      let newX = popupData.x / resizeInfo.oldTargetWidth * resizeInfo.targetWidth;
      let newY = popupData.y / resizeInfo.oldTargetHeight * resizeInfo.targetHeight;
      popupData.x = popupData.draggedX = newX;
      popupData.y = popupData.draggedY = newY;
    }
    this.update();
  }

}

export default PopupContainer;