'use strict';

import defaultConfig from './../settings/config';
import geom from './../core/geom.core';
import eventEmitter from './../core/eventEmitter';
import { Component } from './../viewEngin/pview';
import uiCore from '../core/ui.core';
import utilCore from '../core/util.core';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';

/**
 * legendBox.js
 * @createdOn: 06-Nov-2017
 * @author: SmartChartsNXT
 * @description:This is a component class will create legned area.
 * @extends Component
 *
 * Legend box accept 3 positioning parameters -
 * {Number} left, {Number} right, {String} float - [top | bottom | left | right]
 *
 * When Float type is top or bottom only left param is acceptable and top param will be ignored.
 * When Float type is left or right only top param is acceptable and left param will be ignored.
 * When Float was't set then top and left both values will be considered.
 *
 * display - inline : inline only take space as much required. it would't wrap the legends.
 * display - block: block will take entire row. It will wrap the legends if overflow.
 *
 * @example
 * config:
"legends":{
    "enable" : true,                              // [ default: true | false ]
    "top": 70,                                    // [ default: 70 ]
    "left": 100,                                  // [ default: 100 ]
    "maxWidth": "90%",                            // [ default : 100%] x % value accepted. Only applicable when display inline.
    "alignment": $SC.ENUMS.ALIGNMENT.HORIZONTAL,  // [ default: ALIGNMENT.HORIZONTAL | ALIGNMENT.VERTICAL ]
    "display": $SC.ENUMS.DISPLAY.INLINE,          // [ default: DISPLAY.INLINE | DISPLAY.BLOCK] Note: block will take entire row but inline only take space as much required
    "float": $SC.ENUMS.FLOAT.NONE,                // [ FLOAT.TOP | FLOAT.BOTTOM | FLOAT.LEFT | FLOAT.RIGHT | default: FLOAT.NONE ]
    "textColor": "#000",                          // [ default: theme.fontColorDark ]
    "bgColor": "none",                            // [ default: none ]
    "hoverColor":"none",                          // [ default: none ]
    "fontSize": 14,                               // [ default: theme.fontSizeMedium ]
    "fontFamily": "Lato",                         // [ default: Lato ]
    "itemBorderWidth": 1,                         // [ default: 1 ]
    "itemBorderColor": "#000",                    // [ default: #000 ]
    "itemBorderOpacity": 1,                       // [ default: 1 ]
    "itemBorderRadius": 10,                       // [ default: 10 ]
    "borderColor": "none",                        // [ default: none ]
    "borderWidth": 1,                             // [ default: 1 ]
    "borderOpacity": 1,                           // [ default: 1 ]
    "opacity": 0.9,                               // [ default: 0.9 ]
    "toggleType": true,                           // [ default: true | false ]
    "hideIcon": false,                            // [ true | default: false ]
    "hideLabel": false,                           // [ true | default: false ]
    "hideValue": false                            // [ true | default: false ]
  }

 * @event
 * 1. legendClicked - Triggered when clicked on a legend box.
 * 2. legendHovered - Triggered when mouse hover on a legend box.
 * 3. legendLeaved - Triggered when move out of legend box.
 * 4. legendRendered - Triggered when legneds fully rendered.
 */

class LegendBox extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.config = {};
    this.setConfig(this.props);
    this.renderCount = 0;
    this.state = {
      legendSet: this.props.legendSet.map(lSet => {
        lSet.totalWidth = lSet.labelLength = 0;
        lSet.isToggeled = lSet.isToggeled === undefined ? false : lSet.isToggeled;
        lSet.transform = '';
        return lSet;
      }),
      left: 0,
      top: 0,
      trnsX: 0,
      trnsY: 0,
      legendSetTrnsX: 0,
      lineCount: 1,
      lengthSet: {
        max: {
          width: 0,
          labelLength: 0,
          lineWidth: 0
        }
      }
    };
    this.padding = 10;
    this.containerWidth = 0;
    this.containerHeight = 0;
    this.colorContWidth = this.config.hideIcon === true ? 0 : 15;
    this.hoverHeight = 15;
    this.lineHeight = 30;
    this.toggleColor = 'none';
    this.cumulativeWidth = 0;
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.calcFloatingPosition();
    utilCore.extends(this.state.lengthSet, this.calcLegendDimensions());
    this.calcLegendPositions();
    this.setContainerWidthHeight();
  }

  setConfig(props) {
    this.config = {
      top: typeof props.opts.top === 'undefined' ? (props.top || 0) : uiCore.percentToPixel(this.context.svgWidth, props.opts.top),
      left: typeof props.opts.left === 'undefined' ? (props.left || 0) : uiCore.percentToPixel(this.context.svgWidth, props.opts.left),
      maxWidth: typeof props.opts.maxWidth === 'undefined' ? this.context.svgWidth : uiCore.percentToPixel(this.context.svgWidth, props.opts.maxWidth),
      type: props.opts.alignment || props.type || ENUMS.ALIGNMENT.HORIZONTAL,
      float: props.opts.float || props.float || ENUMS.FLOAT.NONE,
      display: props.opts.display || props.display || ENUMS.DISPLAY.INLINE,
      textColor: props.opts.textColor || defaultConfig.theme.fontColorDark,
      bgColor: props.opts.bgColor || props.background || 'none',
      hoverColor: props.opts.hoverColor || props.hoverColor || '#999',
      fontSize: props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: props.opts.fontFamily || defaultConfig.theme.fontFamily,
      itemBorderWidth: typeof props.opts.itemBorderWidth === 'undefined' ? 1 : props.opts.itemBorderWidth,
      itemBorderColor: props.opts.itemBorderColor || '#000',
      itemBorderOpacicy: typeof props.opts.itemBorderOpacicy === 'undefined' ? 1 : props.opts.itemBorderOpacicy,
      itemBorderRadius: typeof props.opts.itemBorderRadius === 'undefined' ? 10 : props.opts.itemBorderRadius,
      strokeColor: props.opts.borderColor || props.strokeColor || 'none',
      strokeWidth: typeof props.opts.borderWidth === 'undefined' ? (props.strokeWidth || 1) : 1,
      strokeOpacity: typeof props.opts.borderOpacity === 'undefined' ? (props.strokeOpacity || 1) : 1,
      opacity: typeof props.opts.opacity === 'undefined' ? (props.opacity || 0.9) : 0.9,
      toggleType: !!(props.opts.toggleType || props.toggleType || false),
      hideIcon: props.opts.hideIcon === 'undefined' ? (typeof props.hideIcon === 'undefined' ? false : props.hideIcon) : props.opts.hideIcon,
      hideLabel: props.opts.hideLabel === 'undefined' ? (typeof props.hideLabel === 'undefined' ? false : props.hideLabel) : props.opts.hideLabel,
      hideValue: props.opts.hideValue === 'undefined' ? (typeof props.hideValue === 'undefined' ? false : props.hideValue) : props.opts.hideValue
    };
    this.colorContWidth = this.config.hideIcon === true ? 0 : 15;
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    /* Need to re-render when float = bottm */
    if (this.config.float === ENUMS.FLOAT.BOTTOM || this.config.float === ENUMS.FLOAT.RIGHT) {
      this.update();
    } else {
      this.renderCount = 0;
      const configData = utilCore.extends({}, this.config, { bBox: this.getBBox() });
      setTimeout(() => this.emitter.emit('legendRendered', configData));
    }
  }

  componentWillUpdate(nextProps) {
    this.setConfig(nextProps);
    this.calcFloatingPosition();
    utilCore.extends(this.state.lengthSet, this.calcLegendDimensions());
    this.calcLegendPositions();
    this.setContainerWidthHeight();
  }

  componentDidUpdate() {
    /* Need to re-render when float = bottm */
    if ((this.config.float === ENUMS.FLOAT.BOTTOM || this.config.float === ENUMS.FLOAT.RIGHT) && this.renderCount < 2) {
      this.update();
    } else {
      this.renderCount = 0;
      const configData = utilCore.extends({}, this.config, { bBox: this.getBBox() });
      this.emitter.emit('legendRendered', configData);
    }
  }

  render() {
    this.cumulativeWidth = 0;
    this.renderCount++;
    return (
      <g transform={`translate(${this.state.legendBoxTrnsX},${this.state.legendBoxTrnsY})`}>
        <path class='legend-container-border' d={this.getContainerBorderPath()} fill={this.config.bgColor}
          opacity={this.config.opacity} stroke-width={this.config.strokeWidth} stroke={this.config.strokeColor} stroke-opacity={this.config.strokeOpacity}
        />
        <g class='legend-set' transform={`translate(${this.state.legendSetTrnsX})`}>
          {this.getLegendSet()}
        </g>
      </g>
    );
  }

  getLegendSet() {
    return this.state.legendSet.map((data, index) => this.getLegend(data, index));
  }

  getLegend(data, index, withContainer = true) {
    return (
      <g class={`sc-legend-${index} sc-series-legend`} tabindex='0' transform={this.state.legendSet[index].transform || ''} style={{ cursor: 'pointer' }}
        events={{
          click: this.onClick,
          keyup: this.onClick,
          mouseenter: this.onHover,
          mouseleave: this.onLeave,
          focusin: this.onHover,
          focusout: this.onLeave
        }} >
        {withContainer &&
          <rect class={`sc-legend-${index} sc-legend-border-${index}`} x={this.state.left + (this.padding / 2)} y={this.state.top + (this.padding / 2)} rx={this.config.itemBorderRadius}
            width={data.totalWidth} height={this.hoverHeight + this.padding} fill={this.config.hoverColor} stroke-opacity={this.config.itemBorderOpacicy}
            stroke={this.config.itemBorderColor} stroke-width={this.config.itemBorderWidth} style={{ 'transition': 'fill-opacity 0.3s linear', 'fillOpacity': '0', 'pointerEvents': 'all' }}>
          </rect>
        }
        {!this.props.opts.hideIcon &&
          <g class='sc-legend-icon-group'>
            <rect class={`sc-legend-${index} sc-legend-color-${index}`} x={this.state.left + this.padding} y={this.state.top + this.padding}
              width={this.colorContWidth} height={this.colorContWidth} fill={data.isToggeled ? this.toggleColor : data.color}
              shape-rendering='optimizeSpeed' stroke-width={2} stroke='none' opacity='1'>
            </rect>
            <path class={`sc-icon-x-${index}`} stroke='#000' fill='none' stroke-linecap='round' stroke-opacity={data.isToggeled ? 1 : 0}
              d={[
                'M', this.state.left + this.padding, this.state.top + this.padding,
                'L', this.state.left + this.padding + this.colorContWidth, this.state.top + this.padding + this.colorContWidth,
                'M', this.state.left + this.padding + this.colorContWidth, this.state.top + this.padding,
                'L', this.state.left + this.padding, this.state.top + this.padding + this.colorContWidth
              ].join(' ')} stroke-width='1'>
            </path>
          </g>
        }
        {this.getLegendText(data, index)}
      </g>
    );
  }

  getLegendText(data, index) {
    return (
      <text class={`sc-legend-${index} sc-legend-txt-${index}`} font-size={this.config.fontSize} x={this.state.left + this.colorContWidth + (2 * this.padding)} y={this.state.top + this.padding + 14}
        fill={this.config.textColor} font-family={this.config.fontFamily} pointer-events='none' >
        <tspan class={`sc-legend-${index} sc-legend-txt-label-${index}`} text-decoration={data.isToggeled ? 'line-through' : 'none'}>{!this.config.hideLabel && data.label}</tspan>
        <tspan class={`sc-legend-${index} sc-legend-txt-value-${index}`} text-decoration={data.isToggeled ? 'line-through' : 'none'}
          dx={this.state.lengthSet.max.labelLength - this.state.legendSet[index].labelLength + this.padding}>
          {!this.config.hideValue && data.value}
        </tspan>
      </text>
    );
  }

  calcFloatingPosition() {
    switch (this.config.float) {
      case ENUMS.FLOAT.TOP:
        this.state.legendBoxTrnsX = this.config.left || this.padding;
        this.state.legendBoxTrnsY = this.padding;
        break;
      case ENUMS.FLOAT.BOTTOM:
        this.state.legendBoxTrnsX = this.config.left || this.padding;
        this.state.legendBoxTrnsY = this.context.svgHeight - this.containerHeight - this.padding;
        break;
      case ENUMS.FLOAT.LEFT:
        this.state.legendBoxTrnsX = this.padding;
        this.state.legendBoxTrnsY = this.config.top || this.padding;
        break;
      case ENUMS.FLOAT.RIGHT:
        this.state.legendBoxTrnsX = this.context.svgWidth - this.containerWidth - this.padding;
        this.state.legendBoxTrnsY = this.config.top || this.padding;
        break;
      case ENUMS.FLOAT.NONE:
      default:
        this.state.legendBoxTrnsX = this.config.left || this.padding;
        this.state.legendBoxTrnsY = this.config.top || this.padding;
    }
    if (this.config.display === ENUMS.DISPLAY.BLOCK) {
      this.state.legendBoxTrnsX = this.padding;
    }
    this.state.legendSetTrnsX = 0;
  }

  calcLegendPositions() {
    this.state.lineCount = 1;
    this.cumulativeWidth = 0;
    this.state.lengthSet.max.lineWidth = 0;
    const legendBoxTrnsX = this.config.float === ENUMS.FLOAT.RIGHT ? 0 : this.state.legendBoxTrnsX;
    let maxAllowedWidth = this.context.svgWidth;
    if (this.config.display !== ENUMS.DISPLAY.BLOCK) {
      maxAllowedWidth = this.config.left + this.config.maxWidth > this.context.svgWidth ? (this.context.svgWidth - this.config.left) : this.config.maxWidth;
    }
    if (this.state.legendSet.length && this.config.type === ENUMS.ALIGNMENT.VERTICAL) {
      maxAllowedWidth = 1;
    }
    for (let index = 0; index < this.state.legendSet.length; index++) {
      const legendWidth = this.state.legendSet[index].totalWidth;
      let trnsX = this.cumulativeWidth + this.padding;
      let trnsY = (this.state.lineCount - 1) * this.lineHeight;
      if (legendBoxTrnsX + trnsX + legendWidth + this.padding > legendBoxTrnsX + maxAllowedWidth) {
        this.cumulativeWidth = 0;
        this.state.lineCount++;
        trnsX = this.cumulativeWidth + this.padding;
        trnsY = (this.state.lineCount - 1) * this.lineHeight;
      }
      this.cumulativeWidth = trnsX + legendWidth;
      if (this.cumulativeWidth > this.state.lengthSet.max.lineWidth) {
        this.state.lengthSet.max.lineWidth = this.cumulativeWidth + this.padding;
      }
      this.state.legendSet[index].transform = `translate(${trnsX}, ${trnsY})`;
    }
  }

  calcLegendDimensions() {
    let lengthSet = {
      totalWidth: [],
      labelLength: []
    };
    this.state.legendSet.forEach((lSet, index) => {
      lengthSet.totalWidth.push(lSet.totalWidth = uiCore.getComputedBBox(this.getLegend(lSet, index, false)).width + this.padding),
        lengthSet.labelLength.push(lSet.labelLength = uiCore.getComputedTextWidth(this.getLegendText(lSet, index)));
    });
    lengthSet.max = {
      width: Math.max(...lengthSet.totalWidth),
      labelLength: Math.max(...lengthSet.labelLength)
    };
    //lengthSet.innerWidth = (lengthSet.max.width + this.padding) * Math.min(this.state.legendSet.length, this.getMaxLegendInLine(lengthSet.max.width + (2 * this.padding)));
    return lengthSet;
  }

  setContainerWidthHeight() {
    if (this.config.display === ENUMS.DISPLAY.BLOCK) {
      this.containerWidth = Math.max(this.context.svgWidth - (2 * this.padding), this.state.lengthSet.max.lineWidth);
    } else if (this.config.display === ENUMS.DISPLAY.INLINE) {
      this.containerWidth = this.state.lengthSet.max.lineWidth;
    }
    this.containerHeight = (this.state.lineCount * this.lineHeight) + (this.padding / 2);
  }

  getContainerBorderPath() {
    return geom.describeRoundedRect(this.state.left, this.state.top, this.containerWidth, this.containerHeight, 10).join(' ');
  }

  getBBox() {
    return {
      width: this.containerWidth,
      height: this.containerHeight,
      x: this.state.legendBoxTrnsX,
      y: this.state.legendBoxTrnsY
    };
  }

  assignLegendData(index, e) {
    let legend = this.state.legendSet[index];
    e.label = legend.label;
    e.value = legend.value;
    e.color = legend.color;
    e.index = index;
    e.isToggeled = legend.isToggeled;
    return e;
  }

  onClick(e) {
    if (e.type === 'keyup' && (e.which || e.keyCode) !== 32) {
      return;
    }
    let index = e.target.classList[0].substring('sc-legend-'.length);
    if (this.config.toggleType) {
      this.state.legendSet[index].isToggeled = !this.state.legendSet[index].isToggeled;
      this.update();
    }
    this.assignLegendData(index, e);
    this.emitter.emit('legendClicked', e);
  }

  onHover(e) {
    let index = e.target.classList[0].substring('sc-legend-'.length);
    if (this.ref.node.querySelector(`.sc-legend-border-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-border-${index}`).style['fill-opacity'] = 0.9;
    }
    if (this.ref.node.querySelector(`.sc-legend-txt-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-txt-${index}`).style['font-weight'] = 'bold';
    }
    if (this.ref.node.querySelector(`.sc-legend-color-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-color-${index}`).setAttribute('stroke', '#000');
    }
    this.assignLegendData(index, e);
    this.emitter.emit('legendHovered', e);
  }

  onLeave(e) {
    let index = e.target.classList[0].substring('sc-legend-'.length);
    if (this.ref.node.querySelector(`.sc-legend-border-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-border-${index}`).style['fill-opacity'] = 0;
    }
    if (this.ref.node.querySelector(`.sc-legend-txt-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-txt-${index}`).style['font-weight'] = 'normal';
    }
    if (this.ref.node.querySelector(`.sc-legend-color-${index}`)) {
      this.ref.node.querySelector(`.sc-legend-color-${index}`).setAttribute('stroke', 'none');
    }
    this.assignLegendData(index, e);
    this.emitter.emit('legendLeaved', e);
  }
}

export default LegendBox;