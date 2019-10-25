'use strict';

import defaultConfig from './../settings/config';
import Point from './../core/point';
import eventEmitter from './../core/eventEmitter';
import { Component } from './../viewEngin/pview';
import utilCore from './../core/util.core';
import uiCore from './../core/ui.core';
import SpeechBox from './../components/speechBox';
import Style from './../viewEngin/style';

/**
 * tooltip.js
 * @createdOn:17-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create tooltip area for the chart.
 * @extends Component.
 * @example
 config
"tooltip": {
  "enable": true,                   // [default: true | false ]
  "followPointer": false,           // [true | default: false ]  Note: This option only available when tooltip are grouped.
  "grouped": true,                  // [default: true | false ]
  "pointerVicinity": 10,            // [default: 50] Note: It's an area surrounding marker point where tooltip get visible if mouse pointer entered.
  "content": {
    "header": function(pointSet, index, tipConfig) {
      return (...);
    },
    "body": function(pointSet, index, tipConfig) {
      return (...);
    },
    "footer": function(pointSet, index, tipConfig) {
      return (...);
    }
  },
  "headerTextColor": "greenyellow",   // [ default: #fff ]
  "headerBgColor": "#555",            // [ default: #555 ]
  "textColor": "yellow",              // [ default: #000 ]
  "bgColor": "green",                 // [ default: #fff ]
  "footerTextColor": "greenyellow",   // [ default: #fff ]
  "footerBgColor": "#555",            // [ default: #555 ]
  "fontSize": 14,                     // [ default: 14 ]
  "fontFamily": "Lato",               // [ default: Lato ]
  "xPadding": 0,                      // [ default: 0 ]
  "yPadding": 0,                      // [ default: 0 ]
  "borderColor": "none",              // [ default: point.seriesColor ]
  "borderWidth": 2,                   // [ default: 3 ]
  "opacity": 0.8,                     // [ default: 0.8 ]
}
 */
class Tooltip extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.config = {};
    this.state = {};
    this.setConfig(this.props);
    this.initInstances(this.props);
    this.updateTip = this.updateTip.bind(this);
    this.hide = this.hide.bind(this);
    this.followMousePointer = this.followMousePointer.bind(this);
  }

  initInstances(props) {
    this.instances = [];
    for (let i = 0; i < props.instanceCount; i++) {
      this.instances.push({
        tipId: utilCore.getRandomID(),
        originPoint: new Point(0, 0),
        cPoint: new Point(0, 0),
        topLeft: new Point(0, 0),
        transform: `translate(${this.context.svgWidth / 2},${this.context.svgHeight / 2})`,
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

  setConfig(props) {
    this.config = {
      textColor: props.opts.textColor || defaultConfig.theme.fontColorDark,
      bgColor: props.opts.bgColor || defaultConfig.theme.bgColorLight,
      fontSize: props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: props.opts.fontFamily || defaultConfig.theme.fontFamily,
      xPadding: Number(props.opts.xPadding) || 0,
      yPadding: Number(props.opts.yPadding) || 0,
      strokeWidth: typeof props.opts.borderWidth === 'undefined' ? 3 : props.opts.borderWidth,
      opacity: typeof props.opts.opacity === 'undefined' ? 0.8 : props.opts.opacity,
      followPointer: typeof props.opts.followPointer === 'undefined' ? false : props.opts.followPointer
    };
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('updateTooltip', this.updateTip);
    this.emitter.on('hideTooltip', this.hide);
    if (this.props.grouped && this.config.followPointer) {
      this.emitter.on('interactiveMouseMove', this.followMousePointer);
    }
  }

  propsWillReceive(nextProps) {
    this.setConfig(nextProps);
  }

  componentWillUpdate(nextProps) {
    if(nextProps.instanceCount !== this.props.instanceCount) {
      this.initInstances(nextProps);
    }
  }

  componentDidUpdate() {
    let nodeList = this.ref.node.querySelectorAll('.sc-tooltip-content');
    Array.prototype.forEach.call(nodeList, (node) => {
      let index = node.getAttribute('index');
      node && (node.innerHTML = this.instances[index].tooltipContent);
    });
  }

  componentWillUnmount() {
    this.emitter.removeListener('updateTooltip', this.updateTip);
    this.emitter.removeListener('hideTooltip', this.hide);
    if (this.props.grouped && this.config.followPointer) {
      this.emitter.removeListener('interactiveMouseMove', this.followMousePointer);
    }
  }

  render() {
    if (this.props.opts.enable === false) {
      return <tooltip-disabled></tooltip-disabled>;
    }
    return (
      <g class='sc-tooltip-container' pointer-events='none' aria-atomic='true' aria-live='assertive'>
        {
          this.getTooltipContainer()
        }
      </g>
    );
  }

  getTooltipContainer() {
    let tipContainer = [];
    let transitionFunction = 'transform 0.3s cubic-bezier(.03,.26,.32,1)';
    if (this.props.grouped && this.config.followPointer) {
      transitionFunction = 'none';
    }
    for (let i = 0; i < this.props.instanceCount; i++) {
      if (!this.instances[i].opacity) {
        continue;
      }
      tipContainer.push(<g instanceId={this.props.instanceId} class={`sc-tip-${this.instances[i].tipId}`} transform={this.instances[i].transform.replace(/px/gi, '')}>
        <Style>
          {{
            ['.sc-tip-' + this.instances[i].tipId]: {
              WebkitTransition: transitionFunction,
              MozTransition: transitionFunction,
              OTransition: transitionFunction,
              transition: transitionFunction,
              transform: this.instances[i].transform
            },
            ['.sc-tip-' + this.instances[i].tipId + ' .sc-tooltip-content']: {
              color: this.config.textColor,
              fontSize: this.config.fontSize + 'px',
              fontFamily: this.config.fontFamily,
              overflow: 'hidden',
              opacity: this.config.opacity
            }
          }}
        </Style>
        <SpeechBox x={0} y={0} width={this.instances[i].contentWidth + 1} height={this.instances[i].contentHeight} cpoint={this.instances[i].cPoint}
          bgColor={this.config.bgColor} fillOpacity={this.config.opacity} shadow={true} strokeColor={this.instances[i].strokeColor} strokeWidth={this.config.strokeWidth} >
        </SpeechBox>
        <g class='sc-text-tooltip-grp'>
          <foreignObject class={'sc-tooltip-content'} index={i} innerHTML={this.instances[i].tooltipContent} x={this.instances[i].contentX + 1} y={this.instances[i].contentY} width={this.instances[i].contentWidth - (2 * this.config.xPadding)} height={this.instances[i].contentHeight - (2 * this.config.yPadding)} >
          </foreignObject>
        </g>
      </g>);
    }
    return tipContainer;
  }

  createTooltipContent(line1, line2) {
    let strContents = '<table style=\'color:' + this.config.textColor + ';font-size:' + this.config.fontSize + 'px;font-family:' + this.config.fontFamily + ';\'>';
    strContents += '<tr><td>' + line1 + '</td></tr>';
    if (line2) {
      strContents += '<tr><td><b>' + line2 + '</b></td></tr>';
    }
    strContents += '</table>';
    return strContents;
  }

  *selectNextTipIndex(pointData) {
    let mid = Math.floor(pointData.length / 2);
    yield mid;
    for (let inst = mid - 1; inst >= 0; inst--) {
      yield inst;
    }
    for (let inst = mid + 1; inst < pointData.length; inst++) {
      yield inst;
    }
  }

  updateTip(event) {
    if (this.props.instanceId !== event.instanceId) {
      return;
    }

    let { originPoint, pointData, line1, line2 } = event;
    let tipIterator;

    if (!this.props.grouped && pointData instanceof Array) {
      pointData.sort((a, b) => a.y - b.y);
      tipIterator = this.selectNextTipIndex(pointData);
      this.instances.map((inst) => {
        inst.opacity = 0;
      });
    }

    for (let ic = 0; ic < this.props.instanceCount; ic++) {
      let preAlign = !event.preAlign ? 'top' : event.preAlign;
      let xPadding = this.config.xPadding;
      let yPadding = this.config.yPadding;
      let strContents = '';
      let delta = 10; // is anchor height
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
        } else if (typeof event.content === 'string') {
          let tooltipContent = event.content.replace(/{{/g, '${').replace(/}}/g, '}');
          line1 = utilCore.assemble(tooltipContent, 'point')(pointData);
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
        width: temp.getBoundingClientRect().width,
        height: temp.getBoundingClientRect().height
      };
      temp && temp.parentNode.removeChild(temp);

      let txtWidth = containBox.width;
      let lineHeight = containBox.height;
      let width = txtWidth + (2 * xPadding);
      let height = lineHeight + (2 * yPadding);
      let { topLeft, cPoint } = this.reAlign(preAlign, originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, 0);
      let textPos = new Point(topLeft.x, topLeft.y);

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

  followMousePointer(e) {
    let mousePos = uiCore.cursorPoint(this.context.rootContainerId, e);
    if (this.instances[0] && this.instances[0].opacity) {
      let cPoint = this.instances[0].originPoint;
      let shiftLeft = this.instances[0].contentWidth + 20;
      let shiftTop = this.instances[0].contentHeight / 2;
      this.instances[0].transform = `translate(${mousePos.x - shiftLeft}px,${mousePos.y - shiftTop}px)`;
      this.instances[0].cPoint = new Point(cPoint.x - mousePos.x + shiftLeft, cPoint.y - mousePos.y + shiftTop);
      this.update();
    }
  }

  isOverlapping(rectA, rectB) {
    return (rectA.X1 < rectB.X2 && rectA.X2 > rectB.X1 && rectA.Y1 < rectB.Y2 && rectA.Y2 > rectB.Y1);
  }

  reAlign(alignment, originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, loopCount) {
    let topLeft, cPoint, enumAlign = ['left', 'right', 'top', 'bottom'];
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

  alignLeft(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - delta - xPadding, cPoint.y - lineHeight - yPadding);
    topLeft.x -= (width / 2);
    topLeft.y += (height / 2);
    return { topLeft, cPoint };
  }

  alignRight(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x + (txtWidth / 2) + xPadding + delta, cPoint.y - lineHeight - yPadding);
    topLeft.x -= (width / 2);
    topLeft.y += (height / 2);
    return { topLeft, cPoint };
  }

  alignTop(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y - lineHeight - delta - yPadding);
    return { topLeft, cPoint };
  }

  alignBottom(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
    let cPoint = new Point(originPoint.x, originPoint.y);
    let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y + delta);
    return { topLeft, cPoint };
  }

  show() {
    this.instances.map((inst) => {
      inst.opacity = 1;
    });
    this.update();
  }

  hide() {
    this.instances.map((inst) => {
      inst.opacity = 0;
    });
    this.update();
  }
}

export default Tooltip;