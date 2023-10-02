'use strict';

import defaultConfig from '../../settings/config';
import Point from '../../core/point';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import { Component } from '../../viewEngin/pview';
import UtilCore from '../../core/util.core';
import UiCore from '../../core/ui.core';
import SpeechBox from '../../components/speechBox/speechBox.components';
import Style from '../../viewEngin/style';
import { ITooltipConfigExtended, ITooltipInstances, ITooltipProps, IUpdateTooltipEvent } from './tooltip.model';
import { IVnode } from '../../viewEngin/component.model';
import { IHighlightedPoint } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import { TOOLTIP_ALIGN, TOOLTIP_POSITION } from '../../global/global.enums';
import { IInteractiveMouseEvent } from '../../charts/connectedPointChartsType/interactivePlane/interactivePlane.model';
import { RectPoint } from '../../core/rect';

/**
 * tooltip.component.tsx
 * @createdOn:17-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create tooltip area for the chart.
 * @extends Component
 */

class Tooltip extends Component<ITooltipProps> {
  private emitter: CustomEvents;
  private config: ITooltipConfigExtended;
  private rootContainer: HTMLElement;
  private allTipContainer: HTMLElement;
  private containerIdIE: string;
  private instances: ITooltipInstances[];

  constructor(props: ITooltipProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.state = {};
    this.setConfig(this.props);
    this.initInstances(this.props);
    this.updateTip = this.updateTip.bind(this);
    this.hide = this.hide.bind(this);
    this.followMousePointer = this.followMousePointer.bind(this);
    this.rootContainer = document.getElementById((this as any).context.rootContainerId);
    this.allTipContainer = null;
    this.containerIdIE = UtilCore.getRandomID();
  }

  initInstances(props: ITooltipProps): void {
    this.instances = [];
    for (let i = 0; i < props.instanceCount; i++) {
      this.instances.push({
        tipId: UtilCore.getRandomID(),
        originPoint: new Point(0, 0),
        cPoint: new Point(0, 0),
        topLeft: new Point(0, 0),
        transform: `translate(${(this as any).context.svgWidth / 2},${(this as any).context.svgHeight / 2})`,
        tooltipContent: '',
        contentX: this.config.xPadding,
        contentY: this.config.yPadding,
        contentWidth: 0,
        contentHeight: 0,
        strokeColor: 'rgb(124, 181, 236)',
        opacity: 0
      });
    }
  }

  setConfig(props: ITooltipProps): void {
    this.config = {
      textColor: props.opts.textColor || defaultConfig.theme.fontColorDark,
      bgColor: props.opts.bgColor || defaultConfig.theme.bgColorLight,
      fontSize: props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: props.opts.fontFamily || defaultConfig.theme.fontFamily,
      xPadding: Number(props.opts.xPadding) || 0,
      yPadding: Number(props.opts.yPadding) || 0,
      strokeWidth: typeof props.opts.borderWidth === 'undefined' ? 3 : props.opts.borderWidth,
      opacity: typeof props.opts.opacity === 'undefined' ? 0.8 : props.opts.opacity,
      followPointer: typeof props.opts.followPointer === 'undefined' ? false : props.opts.followPointer,
      borderRadius: typeof props.opts.borderRadius === 'undefined' ? 0 : props.opts.borderRadius,
      anchorBaseWidth: typeof props.opts.anchorWidth === 'undefined' ? 8 : props.opts.anchorWidth, // width of the anchor
      anchorHeight: typeof props.opts.anchorHeight === 'undefined' ? 10 : props.opts.anchorHeight, // height of the anchor
      dropShadow: typeof props.opts.dropShadow === 'undefined' ? true : props.opts.dropShadow
    };
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    if (UtilCore.isIE && !this.allTipContainer) {
      const containerID = UtilCore.getRandomID();
      let strHtml = `<div id='sc-tooltip-container-html-${containerID}' 
            style='position: absolute; width: ${(this as any).context.svgWidth}px; height: ${(this as any).context.svgHeight}px; top: 0; pointer-events: none;'>
          </div>`;
      this.rootContainer.insertAdjacentHTML('beforeend', strHtml);
      this.allTipContainer = this.rootContainer.querySelector(`#sc-tooltip-container-html-${containerID}`);
    }
    this.emitter.on('updateTooltip', this.updateTip);
    this.emitter.on('hideTooltip', this.hide);
    if (this.props.grouped && this.config.followPointer) {
      this.emitter.on('interactiveMouseMove', this.followMousePointer);
    }
  }

  propsWillReceive(nextProps: ITooltipProps): void {
    this.setConfig(nextProps);
  }

  beforeUpdate(nextProps: ITooltipProps): void {
    if (nextProps.instanceCount !== this.props.instanceCount) {
      this.initInstances(nextProps);
    }
  }

  afterUpdate(): void {
    if (this.allTipContainer) {
      this.allTipContainer.style.width = (this as any).context.svgWidth + 'px';
      this.allTipContainer.style.height = (this as any).context.svgHeight + 'px';
    }
    const nodeList = (this.ref.node as SVGElement).querySelectorAll('.sc-tooltip-content');
    Array.from(nodeList).forEach((node: SVGElement) => {
      const index = Number(node.getAttribute('index'));
      if (!UtilCore.isIE) {
        node && (node.innerHTML = this.instances[index].tooltipContent);
      } else {
        this.createTipAsHTML(node);
      }
    });
  }

  beforeUnmount(): void {
    this.emitter.removeListener('updateTooltip', this.updateTip);
    this.emitter.removeListener('hideTooltip', this.hide);
    if (this.props.grouped && this.config.followPointer) {
      this.emitter.removeListener('interactiveMouseMove', this.followMousePointer);
    }
  }

  render(): IVnode {
    if (this.props.opts.enable === false) {
      return <g class="sc-tooltip-container sc-tooltip-disabled"></g>;
    }
    if (UtilCore.isIE) {
      this.createTipContainerHTML();
    }
    return (
      <g class='sc-tooltip-container' pointer-events='none' aria-atomic='true' aria-live='polite'>
        {
          this.getTooltipContainer()
        }
      </g>
    );
  }

  getTooltipContainer(): IVnode[] {
    let tipContainer = [];
    for (let i = 0; i < this.props.instanceCount; i++) {
      if (!this.instances[i].opacity) {
        continue;
      }
      tipContainer.push(<g instanceId={this.props.instanceId + '-' + i} class={`sc-tip-${this.instances[i].tipId}`} transform={this.instances[i].transform.replace(/px/gi, '')}>
        {this.getTipStyle(i)}
        <SpeechBox x={0} y={0} width={this.instances[i].contentWidth + 1} height={this.instances[i].contentHeight} cpoint={this.instances[i].cPoint}
          bgColor={this.config.bgColor} fillOpacity={this.config.opacity} shadow={this.config.dropShadow} strokeColor={this.instances[i].strokeColor} strokeWidth={this.config.strokeWidth}
          anchorBaseWidth={this.config.anchorBaseWidth} cornerRadius={this.config.borderRadius}>
        </SpeechBox>
        <g class='sc-text-tooltip-grp'>
          {UtilCore.isIE ?
            (<x-div index={i} class={'sc-tooltip-content'} data-instance={JSON.stringify(this.instances[i])}
              style={{
                position: 'absolute',
                width: this.instances[i].contentWidth - (2 * this.config.xPadding) + 1 + 'px',
                height: this.instances[i].contentHeight - (2 * this.config.yPadding) + 'px',
                transform: this.instances[i].transform,
                top: this.instances[i].contentY + 'px',
                left: this.instances[i].contentX + 'px',
                color: this.config.textColor,
                fontSize: this.config.fontSize + 'px',
                fontFamily: this.config.fontFamily,
                overflow: 'hidden',
                opacity: this.config.opacity,
                borderRadius: this.config.borderRadius + 'px'
              }}>
            </x-div>) :
            (
              <foreignObject class={'sc-tooltip-content'} index={i} innerHTML={this.instances[i].tooltipContent} x={this.instances[i].contentX + 1} y={this.instances[i].contentY} width={this.instances[i].contentWidth - (2 * this.config.xPadding)} height={this.instances[i].contentHeight - (2 * this.config.yPadding)} >
              </foreignObject>
            )}
        </g>
      </g>);
    }
    return tipContainer;
  }

  getTipStyle(index: number): IVnode {
    let transitionFunction = 'transform 0.3s cubic-bezier(.03,.26,.32,1)';
    if (this.props.grouped && this.config.followPointer) {
      transitionFunction = 'none';
    }
    if (UtilCore.isIE) {
      transitionFunction = 'none';
    }
    return (
      <Style>
        {{
          ['.sc-tip-' + this.instances[index].tipId]: {
            WebkitTransition: transitionFunction,
            MozTransition: transitionFunction,
            OTransition: transitionFunction,
            transition: transitionFunction,
            transform: this.instances[index].transform
          },
          ['.sc-tip-' + this.instances[index].tipId + ' .sc-tooltip-content']: {
            color: this.config.textColor,
            fontSize: this.config.fontSize + 'px',
            fontFamily: this.config.fontFamily,
            overflow: 'hidden',
            opacity: this.config.opacity,
            borderRadius: this.config.borderRadius + 'px'
          }
        }}
      </Style>);
  }

  createTooltipContent(line1: string, line2: string): string {
    let strContents = '<table style="color:' + this.config.textColor + '; font-size:' + this.config.fontSize + 'px; font-family:' + this.config.fontFamily + ';">';
    strContents += '<tr><td>' + line1 + '</td></tr>';
    if (line2) {
      strContents += '<tr><td><b>' + line2 + '</b></td></tr>';
    }
    strContents += '</table>';
    return strContents;
  }

  createTipContainerHTML(): void {
    if (!this.allTipContainer) {
      return;
    }
    let tipContainer = this.allTipContainer.querySelector('#sc-tooltip-container-' + this.containerIdIE);
    if (tipContainer) {
      tipContainer.parentNode.removeChild(tipContainer);
    }
    let strHtml = `<div id='sc-tooltip-container-${this.containerIdIE}' aria-atomic='true' aria-live='polite' 
        style='position: absolute; width: ${(this as any).context.svgWidth}px; height: ${(this as any).context.svgHeight}px; top: 0; pointer-events: none;'>
      </div>`;
    this.allTipContainer.insertAdjacentHTML('beforeend', strHtml);
  }

  createTipAsHTML(node: SVGElement): void {
    if (node) {
      let instanceData = JSON.parse(node.dataset.instance);
      let tipContainer = document.getElementById(`sc-tooltip-container-${this.containerIdIE}`);
      if (tipContainer) {
        node.innerHTML = instanceData.tooltipContent;
        tipContainer.appendChild(node);
      }
    }
  }

  *selectNextTipIndex(pointData: IHighlightedPoint[]): IterableIterator<number> {
    let mid = Math.floor(pointData.length / 2);
    yield mid;
    for (let inst = mid - 1; inst >= 0; inst--) {
      yield inst;
    }
    for (let inst = mid + 1; inst < pointData.length; inst++) {
      yield inst;
    }
  }

  updateTip(event: IUpdateTooltipEvent): void {
    if (this.props.instanceId !== event.instanceId) {
      return;
    }

    let { originPoint, pointData, line1, line2 } = event, tipIterator;

    if (!this.props.grouped && pointData instanceof Array) {
      pointData.sort((a, b) => a.y - b.y);
      tipIterator = this.selectNextTipIndex(pointData);
      this.instances.map((inst) => {
        inst.opacity = 0;
      });
    }

    for (let ic = 0; ic < this.props.instanceCount; ic++) {
      let preAlign = !event.preAlign ? TOOLTIP_ALIGN.TOP : event.preAlign;
      let xPadding = this.config.xPadding;
      let yPadding = this.config.yPadding;
      let strContents = '';
      let delta = this.config.anchorHeight; // this is anchor height
      let inst;

      if (pointData instanceof Array) {
        inst = this.props.grouped ? ic : tipIterator.next().value;
      }

      if (!this.props.grouped && pointData instanceof Array && pointData[inst]) {
        originPoint = new Point(pointData[inst].x, pointData[inst].y);
      }

      if (!pointData && !line1 && !line2) {
        return;
      }

      let strokeColor = this.props.opts.borderColor || (pointData && pointData[inst].seriesColor) || this.instances[inst].strokeColor;

      if (pointData && pointData[inst] && event.content) {
        line1 = '';
        if (typeof event.content === 'object') {
          if (typeof event.content.header === 'function') {
            line1 += event.content.header(pointData, inst, this.props.opts);
          }
          if (typeof event.content.body === 'function') {
            line1 += '<table style=\'margin:0 auto;\'>';
            if (this.props.grouped === true) {
              for (let i = 0; i < pointData.length; i++) {
                line1 += event.content.body(pointData, i, this.props.opts);
              }
            } else {
              line1 += event.content.body(pointData, inst, this.props.opts);
            }
            line1 += '</table>';
          }
          if (typeof event.content.footer === 'function') {
            line1 += event.content.footer(pointData, inst, this.props.opts);
          }
          line2 = 'html';
        }
      }

      strContents = line2 === 'html' ? line1 : this.createTooltipContent(line1, line2);

      let temp = document.createElement('div');
      temp.innerHTML = strContents;
      temp.style.display = 'inline-block';
      temp.style.fontFamily = this.config.fontFamily;
      temp.style.fontSize = this.config.fontSize + 'px';
      temp.style.visibility = 'hidden';
      temp.style.position = 'absolute';
      document.getElementsByTagName('body')[0].appendChild(temp);
      let containBox = {
        width: temp.getBoundingClientRect().width + 2,
        height: temp.getBoundingClientRect().height
      };
      temp && temp.parentNode.removeChild(temp);

      let txtWidth = containBox.width;
      let lineHeight = containBox.height;
      let width = txtWidth + (2 * xPadding);
      let height = lineHeight + (2 * yPadding);
      let { topLeft, cPoint } = this.reAlign(preAlign, originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, 0);
      if (this.props.opts.position === TOOLTIP_POSITION.STATIC && this.props.grouped) {
        topLeft = cPoint = new Point(this.props.opts.left === undefined ? 0 : this.props.opts.left, this.props.opts.top === undefined ? 0 : this.props.opts.top);
      }
      let newState = {
        preAlign,
        topLeft,
        originPoint,
        cPoint: new Point(cPoint.x - topLeft.x, cPoint.y - topLeft.y),
        transform: `translate(${topLeft.x}px,${topLeft.y}px)`,
        tooltipContent: strContents,
        contentWidth: width,
        contentHeight: height,
        strokeColor: strokeColor,
        opacity: 1,
        anchorSize: delta
      };

      if (!this.props.grouped) {
        this.instances.filter((v) => v.opacity).map((oldTip) => {
          let count = 0;
          let ol = false;
          do {
            count++;
            ol = this.isOverlapping({
              X1: newState.topLeft.x,
              Y1: newState.topLeft.y,
              X2: newState.topLeft.x + newState.contentWidth,
              Y2: newState.topLeft.y + newState.contentHeight
            }, {
              X1: oldTip.topLeft.x,
              Y1: oldTip.topLeft.y,
              X2: oldTip.topLeft.x + oldTip.contentWidth,
              Y2: oldTip.topLeft.y + oldTip.contentHeight
            });
            if (ol) {
              if (newState.topLeft.y < oldTip.topLeft.y) {
                newState.topLeft.y -= 10;
              } else {
                newState.topLeft.y += 10;
              }
            }
          } while (ol && count < 100);
        });

        newState.transform = `translate(${newState.topLeft.x}px,${newState.topLeft.y}px)`;
        newState.cPoint = new Point(cPoint.x - newState.topLeft.x, cPoint.y - newState.topLeft.y);
      }

      if (pointData) {
        if (pointData[ic]) {
          this.instances[ic] = Object.assign(this.instances[ic], newState);
        } else {
          this.instances[ic].opacity = 0;
        }
      } else {
        this.hide();
        this.instances[0] = Object.assign(this.instances[0], newState);
      }
    }

    this.update();
  }

  followMousePointer(eventData: IInteractiveMouseEvent) {
    let mousePos = UiCore.cursorPoint((this as any).context.rootContainerId, eventData.event);
    if (this.instances[0] && this.instances[0].opacity) {
      let cPoint = this.instances[0].originPoint;
      let shiftX = this.instances[0].contentWidth + 20;
      let shiftY = this.instances[0].contentHeight / 2;
      let transX = mousePos.x - shiftX, transY = mousePos.y - shiftY;
      let cTransX = cPoint.x - mousePos.x + shiftX, cTransY = cPoint.y - mousePos.y + shiftY;
      if (transX < 0) {
        transX = mousePos.x + 20;
        cTransX = cPoint.x - mousePos.x - 20;
      }
      if (transY < 0) {
        transY = 0;
        cTransY = cPoint.y;
      }
      this.instances[0].transform = `translate(${transX}px,${transY}px)`;
      this.instances[0].cPoint = new Point(cTransX, cTransY);
      this.update();
    }
  }

  isOverlapping(rectA: RectPoint, rectB: RectPoint) {
    return (rectA.X1 < rectB.X2 && rectA.X2 > rectB.X1 && rectA.Y1 < rectB.Y2 && rectA.Y2 > rectB.Y1);
  }

  reAlign(alignment: TOOLTIP_ALIGN, originPoint: Point, xPadding: number, yPadding: number, width: number, height: number, txtWidth: number, lineHeight: number, delta: number, loopCount: number): {topLeft: Point, cPoint: Point} {
    let topLeft, cPoint, enumAlign: TOOLTIP_ALIGN[] = [TOOLTIP_ALIGN.LEFT, TOOLTIP_ALIGN.RIGHT, TOOLTIP_ALIGN.TOP, TOOLTIP_ALIGN.BOTTOM];
    switch (alignment) {
      case 'left':
        ({ topLeft, cPoint } = this.alignLeft(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
        break;
      case 'right':
        ({ topLeft, cPoint } = this.alignRight(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
        break;
      case 'top':
        ({ topLeft, cPoint } = this.alignTop(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
        break;
      case 'bottom':
        ({ topLeft, cPoint } = this.alignBottom(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
        break;
    }
    if (loopCount < 4 && (topLeft.x < 0 || topLeft.x > this.props.svgWidth || topLeft.y < 0 || topLeft.y > this.props.svgHeight)) {
      return this.reAlign(enumAlign[(enumAlign.indexOf(alignment) + 1) % 4], originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, loopCount + 1);
    }
    return { topLeft, cPoint };
  }

  alignLeft(originPoint: Point, xPadding: number, yPadding: number, width: number, height: number, txtWidth: number, lineHeight: number, delta: number): {topLeft: Point, cPoint: Point} {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - delta - xPadding, cPoint.y - lineHeight - yPadding);
    topLeft.x -= (width / 2);
    topLeft.y += (height / 2);
    return { topLeft, cPoint };
  }

  alignRight(originPoint: Point, xPadding: number, yPadding: number, width: number, height: number, txtWidth: number, lineHeight: number, delta: number): {topLeft: Point, cPoint: Point} {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x + (txtWidth / 2) + xPadding + delta, cPoint.y - lineHeight - yPadding);
    topLeft.x -= (width / 2);
    topLeft.y += (height / 2);
    return { topLeft, cPoint };
  }

  alignTop(originPoint: Point, xPadding: number, yPadding: number, width: number, height: number, txtWidth: number, lineHeight: number, delta: number): {topLeft: Point, cPoint: Point} {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y - lineHeight - delta - yPadding);
    return { topLeft, cPoint };
  }

  alignBottom(originPoint: Point, xPadding: number, yPadding: number, width: number, height: number, txtWidth: number, lineHeight: number, delta: number): {topLeft: Point, cPoint: Point} {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y + delta);
    return { topLeft, cPoint };
  }

  show(): void {
    this.instances.map((inst) => {
      inst.opacity = 1;
    });
    this.update();
  }

  hide(): void {
    this.instances.map((inst) => {
      inst.opacity = 0;
    });
    this.update();
  }
}

export default Tooltip;