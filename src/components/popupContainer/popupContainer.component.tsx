'use strict';

import Point from '../../core/point';
import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import GeomCore from '../../core/geom.core';
import UtilCore from '../../core/util.core';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import RichTextBox from '../../components/richTextBox/richTextBox.component';
import Easing from '../../plugIns/easing';
import { IPopupConfig, IPopupContainerProps } from './popupContainer.model';
import { IVnode } from '../../viewEngin/component.model';
import { HORIZONTAL_ALIGN } from '../../global/global.enums';
import { IResizeEvent } from '../../global/global.models';

/**
 * popupContainer.component.tsx
 * @createdOn:22-Dec-2020
 * @author:SmartChartsNXT
 * @description:This is a base component to show SVG based popup.
 * @extends Component
 */

class PopupContainer extends Component<IPopupContainerProps> {
  private rid: string;
  private shadowId: string;
  private emitter: CustomEvents;
  private activePopup: string;
  private mousePos: DOMPoint;

  constructor(props: IPopupContainerProps) {
    super(props);
    this.rid = UtilCore.getRandomID();
    this.shadowId = 'shadow-' + this.rid;
    this.state = {
      popupData: {},
      popupQueue: [],
      paddingX: 5,
      paddingY: 5,
      titleHeight: 40,
      hasModal: false
    };
    this.activePopup = null;
    this.mousePos = null;
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.createPopup = this.createPopup.bind(this);
    this.onClose = this.onClose.bind(this);
    this.onCloseIconMouseIn = this.onCloseIconMouseIn.bind(this);
    this.onCloseIconMouseOut = this.onCloseIconMouseOut.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onEscPress = this.onEscPress.bind(this);
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('createPopup', this.createPopup);
    this.emitter.on('resize', this.onResize);
    document.addEventListener('keyup', this.onEscPress, false);
  }

  beforeUnmount(): void {
    this.emitter.removeListener('createPopup', this.createPopup);
    this.emitter.removeListener('resize', this.onResize);
    document.removeEventListener('keyup', this.onEscPress, false);
  }

  render(): IVnode {
    return (
      <g class="sc-popup-container" aria-live="polite">
        {this.state.hasModal &&
          <rect class="sc-popup-backdrop" x={0} y={0} width={(this as any).context.svgWidth} height={(this as any).context.svgHeight} fill={'#000'} fill-opacity={0.2} style={{ 'pointer-events': 'all' }}></rect>
        }
        {this.getStyle()}
        {UiCore.dropShadow(this.shadowId, 5, 5)}
        {this.renderAllPopups()}
      </g>
    );
  }

  renderAllPopups(): IVnode[] {
    let popups: IVnode[] = [];
    for (let popupId of this.state.popupQueue) {
      let data = this.state.popupData[popupId];
      if (data.x === undefined) {
        data.x = data.draggedX = (this as any).context.svgCenter.x - (data.width / 2);
      }
      if (data.y === undefined) {
        data.y = data.draggedY = (this as any).context.svgCenter.y - (data.height / 2);
      }
      popups.push(
        <g class={`sc-popup-inst-${popupId}`} instanceId={popupId} id={popupId} transform={`translate(${data.draggedX}, ${data.draggedY})`} >
          {data.isAnimated &&
            <remove-before-save>
              <style>
                {this.getScaleKeyframe(popupId, data)}
              </style>
            </remove-before-save>
          }
          <defs>
            <clipPath id={data.clipId}>
              <path d={GeomCore.describeRoundedRect(0, 0, data.width, data.height, 8).join(' ')} fill="none" stroke="#000"></path>
            </clipPath>
          </defs>

          <path class='sc-popup-bg' d={GeomCore.describeRoundedRect(0, 0, data.width, data.height, 8).join(' ')} fill="#fff" stroke="none" filter={`url(#${this.shadowId})`}></path>

          <g class="sc-popup-title-bar" clip-path={`url(#${data.clipId})`} >
            <rect class='sc-popup-title-bg' x={0} y={0} width={data.width} height={this.state.titleHeight} fill="#fff" stroke="none" shape-rendering="optimizeSpeed" style={{ 'cursor': data.isDraggable ? 'move' : 'default' }}
              events={{
                mousedown: (e: MouseEvent) => this.onMouseDown(e, popupId, data.isDraggable),
                touchstart: (e: TouchEvent) => this.onMouseDown(e, popupId, data.isDraggable)
              }}></rect>
            <g style={{ 'pointerEvents': 'none' }} role="heading" aria-level="3">
              <RichTextBox class='sc-popup-title' posX={2 * this.state.paddingX} posY={0} width={data.width - this.state.titleHeight - (2 * this.state.paddingY)} height={this.state.titleHeight} textAlign={HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={true}
                fontSize={Number.parseFloat(data.fontSize) + 1} textColor={data.fontColor} text={data.title || ''}>
              </RichTextBox>
            </g>
            <g class="sc-close-icon-group" transform={`translate(${data.width - this.state.titleHeight}, ${0})`}>
              <title>Close(Esc)</title>
              <rect class='sc-close-icon-bg' x={0} y={0} width={this.state.titleHeight} height={this.state.titleHeight} fill="#d73e4d" stroke="none" fill-opacity={0.0001}
                events={{
                  click: (e: MouseEvent) => this.onClose(e, popupId),
                  mouseenter: (e: MouseEvent) => this.onCloseIconMouseIn(e, popupId),
                  mouseleave: (e: MouseEvent) => this.onCloseIconMouseOut(e, popupId),
                  focusin: (e: FocusEvent) => this.onCloseIconMouseIn(e, popupId),
                  focusout: (e: FocusEvent) => this.onCloseIconMouseOut(e, popupId)
                }}>
              </rect>
              <text class='sc-close-cross' text-rendering='geometricPrecision' stroke='#000' fill='#000' font-size='22' pointer-events='none'>
                <tspan text-anchor='middle' x={this.state.titleHeight / 2} y={this.state.titleHeight / 2 + (UtilCore.isIE ? 6 : 0)} dominant-baseline="middle">&times;</tspan>
              </text>
            </g>
            <line x1={0} y1={this.state.titleHeight} x2={data.width} y2={this.state.titleHeight} shape-rendering="optimizeSpeed" stroke="#b7b7b7"></line>
          </g>

          <g class="sc-popup-body-group" clip-path={`url(#${data.clipId})`}>
            <RichTextBox class='sc-popup-body' posX={0} posY={this.state.titleHeight} width={data.width} contentWidth={data.width} height={data.height - this.state.titleHeight}
              textAlign={HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={data.textVerticalAlignMiddle} overflow="scroll"
              fontSize={data.fontSize} textColor={data.fontColor} style={{ ...{ padding: '5px' }, ...data.style }} text={data.body || ''} >
            </RichTextBox>
          </g>

        </g>
      );
    }
    return popups;
  }

  createPopup(data: IPopupConfig): void {
    const popupId = 'popup-' + UtilCore.getRandomID();
    this.state.popupQueue.push(popupId);
    let popupData = this.parsePopupData(data);
    this.state.popupData[popupId] = popupData;
    if (popupData.isModal) {
      this.state.hasModal = true;
    }
    this.update();
  }

  destroyPopup(popupId: string): void {
    if (this.state.popupData[popupId]) {
      delete this.state.popupData[popupId];
      this.state.popupQueue.splice(this.state.popupQueue.indexOf(popupId), 1);
      this.state.hasModal = false;
      for (let key in this.state.popupData) {
        if (this.state.popupData[key].isModal) {
          this.state.hasModal = true;
        }
      }
      this.update();
    }
  }

  parsePopupData(data: IPopupConfig): IPopupConfig {
    let defaults: IPopupConfig = {
      x: undefined,
      y: undefined,
      draggedX: undefined,
      draggedY: undefined,
      width: 300,
      height: 200,
      title: '',
      body: '',
      fontSize: '14',
      fontColor: '#000',
      style: {},
      isDraggable: true,
      isModal: true,
      isAnimated: true,
      textVerticalAlignMiddle: false,
      clipId: 'clip-' + UtilCore.getRandomID()
    };
    let mergedData = { ...defaults, ...data };
    mergedData.draggedX = mergedData.x;
    mergedData.draggedY = mergedData.y;
    return mergedData;
  }

  getStyle(): IVnode {
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
          .sc-popup-container foreignObject::-webkit-scrollbar-track {
            background-color: #efefef;
            width: 4px;
          }
          .sc-popup-container foreignObject::-webkit-scrollbar-thumb {
            background-color: #666666;
            border: 1px solid transparent;
            background-clip: content-box;
          }
          .sc-popup-container foreignObject::-webkit-scrollbar {
            width: 8px;
          }
          .sc-popup-container foreignObject::-webkit-scrollbar-thumb:hover {
            background: #333; 
          }
        `}
      </style>
    );
  }

  getScaleKeyframe(id: string, popupData: IPopupConfig): string {
    return (`
      ${this.generateAnimKeyframe(600, id, popupData, 100)}
      .sc-popup-inst-${id} {
        transform: translate(${this.props.posX}px, ${this.props.posY}px);
        animation: scale-easeOutElastic-${id} 1s linear both;
      }
    `);
  }

  generateAnimKeyframe(duration: number, id: string, popupData: IPopupConfig, steps: number = 10): string {
    const aStage = duration / steps;

    let keyFrame: string = `@keyframes scale-easeOutElastic-${id} {`;
    for (let i = 0; i < steps; i++) {
      const stageNow = aStage * i;
      const scaleD = Easing.easeOutElastic(stageNow / duration).toFixed(2);
      const frame = `${Math.round(100 / steps * i)}% {
        transform: translate(${popupData.x}px, ${popupData.y}px) translate(${popupData.width / 2}px, ${popupData.height}px) scale(${scaleD}, ${scaleD}) translate(${-popupData.width / 2}px, ${-popupData.height}px);
      }`;
      keyFrame += frame;
    }
    keyFrame += '}';
    return keyFrame;
  }

  rearrangePopupQueue(): void {
    const activeIndex = this.state.popupQueue.indexOf(this.activePopup);
    this.state.popupQueue.splice(activeIndex, 1);
    this.state.popupQueue.push(this.activePopup);
  }

  onMouseDown(e: MouseEvent|TouchEvent, popupId: string, isDraggable: boolean): void {
    if (!isDraggable) {
      return;
    }
    this.mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, e);
    this.activePopup = popupId;
    this.rearrangePopupQueue();
    window.addEventListener('mousemove', this.onMouseMove, false);
    window.addEventListener('touchmove', this.onMouseMove, false);
    window.addEventListener('mouseup', this.onMouseUp, false);
    window.addEventListener('touchend', this.onMouseUp, false);
  }

  onMouseMove(e: MouseEvent|TouchEvent): void {
    if (this.activePopup) {
      const mousePosNow = UiCore.cursorPoint((this as any).context.rootContainerId, e);
      const mouseMoved = new Point(mousePosNow.x - this.mousePos.x, mousePosNow.y - this.mousePos.y);
      let popupData = this.state.popupData[this.activePopup];
      popupData.draggedX = popupData.x + mouseMoved.x;
      popupData.draggedY = popupData.y + mouseMoved.y;
      this.update();
    }
  }

  onMouseUp(): void {
    const popupData = this.state.popupData[this.activePopup];
    popupData.x = popupData.draggedX;
    popupData.y = popupData.draggedY;
    this.activePopup = null;
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('touchmove', this.onMouseMove);
    window.removeEventListener('touchend', this.onMouseUp);
  }

  onClose(e: MouseEvent|TouchEvent|KeyboardEvent, popupId: string): void {
    this.destroyPopup(popupId);
  }

  onCloseIconMouseIn(e: FocusEvent, popupId: string): void {
    let crossText = (this.ref.node as any).querySelector('#' + popupId + ' .sc-close-cross');
    crossText.style.fill = '#fff';
    crossText.style.stroke = '#fff';
  }

  onCloseIconMouseOut(e: FocusEvent, popupId: string): void {
    let crossText = (this.ref.node as any).querySelector('#' + popupId + ' .sc-close-cross');
    crossText.style.fill = '#000';
    crossText.style.stroke = '#000';
  }

  onResize(e: IResizeEvent): void {
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

  onEscPress(e: KeyboardEvent) {
    if (e.code === 'Escape' && this.state.popupQueue.length) {
      this.onClose(e, this.state.popupQueue[this.state.popupQueue.length - 1]);
    }
  }
}

export default PopupContainer;