'use strict';

import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import { Component } from './../viewEngin/pview';
import UiCore from './../core/ui.core';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import defaultConfig from './../settings/config';
import Ticks from './ticks';
import a11yFactory from './../core/a11y';

/**
 * verticalLabels.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels and Tick marks for the chart.
 * @extends Component
 *
 * @events -
 * 1. onVerticalLabelRender : Fire when horizontal labels draws.
 * 2. vLabelEnter: Fire when mouse hover on label text.
 * 3. vLabelExit: Fire when mouse out of label text.
 */
class VerticalLabels extends Component {

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.a11yWriter = a11yFactory.getWriter(this.context.runId);
    this.config = {};
    this.resetConfig(this.props.opts);
    this.state = {
      fontSize: this.config.fontSize
    };
    this.defaultTickSpan = 6;
    this.valueSet = [];
    this.zeroBaseIndex = -1;
    this.minLabelVal = this.props.minVal;
    this.maxLabelVal = this.props.maxVal;
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);

    /* For accessibility */
    this.accId = this.props.accessibilityId || UtilCore.getRandomID();
    this.a11yWriter.createSpace(this.accId);
    this.a11yWriter.write(this.accId, '<div aria-hidden="false">Range: ' +
      (this.props.opts.prepend || '') + this.minLabelVal + (this.props.opts.append || '') +
      ' to ' +
      (this.props.opts.prepend || '') + this.maxLabelVal + (this.props.opts.append || '') +
      '.</div>', false);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    this.intervalId = setInterval(() => {
      if (this.ref.node.getBoundingClientRect().width > this.props.maxWidth) {
        this.setState({ fontSize: this.state.fontSize - 1 });
      } else {
        clearInterval(this.intervalId);
      }
    });
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  propsWillReceive(nextProps) {
    this.resetConfig(nextProps.opts);
    this.minLabelVal = nextProps.minVal;
    this.maxLabelVal = nextProps.maxVal;
  }

  resetConfig(config) {
    this.config = {
      ...this.config, ...{
        labelRotate: typeof config.labelRotate === 'undefined' ? 0 : config.labelRotate,
        fontSize: config.fontSize || defaultConfig.theme.fontSizeMedium,
        fontFamily: config.fontFamily || defaultConfig.theme.fontFamily,
        tickOpacity: typeof config.tickOpacity === 'undefined' ? 1 : config.tickOpacity,
        tickColor: config.tickColor || defaultConfig.theme.fontColorDark,
        labelOpacity: typeof config.labelOpacity === 'undefined' ? 1 : config.labelOpacity,
        labelColor: config.labelColor || defaultConfig.theme.fontColorDark
      }
    };
    switch (config.labelAlign || $SC.ENUMS.HORIZONTAL_ALIGN.RIGHT) {
      default:
      case 'right': this.config.labelAlign = 'end'; break;
      case 'left': this.config.labelAlign = 'start'; break;
      case 'center': this.config.labelAlign = 'middle';
    }
  }

  render() {
    return (
      <g class='sc-vertical-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`} aria-hidden='true'>
        {this.getLabels()}
        {!this.props.opts.positionOpposite && this.config.labelAlign === 'end' &&
          <Ticks posX={-(this.props.opts.tickSpan || this.defaultTickSpan)} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
        }
        {this.props.opts.positionOpposite && this.config.labelAlign === 'start' &&
          <Ticks posX={0} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
        }
      </g>
    );
  }

  getLabels() {
    let labels = [];
    this.zeroBaseIndex = -1;
    let i = this.props.opts.type === ENUMS.AXIS_TYPE.LOGARITHMIC ? Math.log10(this.minLabelVal) : 0;
    let decimalCount = this.countDecimals(this.minLabelVal);
    for (let lCount = this.props.labelCount; lCount >= 0; lCount--, i++) {
      let labelVal = this.minLabelVal + (i * this.props.valueInterval(i));
      if (this.props.opts.type === ENUMS.AXIS_TYPE.LOGARITHMIC) {
        labelVal = this.props.valueInterval(i);
      }
      this.maxLabelVal = UiCore.formatTextValue(labelVal, decimalCount);
      labels.push(this.getEachLabel(this.maxLabelVal, lCount));
      this.valueSet.unshift(this.maxLabelVal);
      if (labelVal === 0) {
        this.zeroBaseIndex = lCount;
      }
    }
    this.emitter.emitSync('onVerticalLabelsRender', {
      intervalLen: this.props.intervalLen,
      intervalValue: this.props.valueInterval,
      zeroBaseIndex: this.zeroBaseIndex,
      values: this.valueSet,
      count: this.props.labelCount
    });
    return labels;
  }

  getEachLabel(val, index) {
    let labelMargin = (this.props.opts.tickSpan || this.defaultTickSpan) + 5;
    let x = this.config.labelAlign === 'end' ? - (labelMargin) : this.config.labelAlign === 'start' ? labelMargin : 0;
    let y = index * this.props.intervalLen;
    if (this.props.opts.positionOpposite) {
      y = this.config.labelAlign === 'start' ? y : y - 10;
    } else {
      y = this.config.labelAlign === 'end' ? y : y - 10;
    }
    let transform = this.config.labelRotate ? 'rotate(' + this.config.labelRotate + ',' + x + ',' + y + ') translate(' + x + ',' + y + ')' : 'translate(' + x + ',' + y + ')';
    return (
      <text class="sc-vertical-label" font-family={this.config.fontFamily} fill={this.config.labelColor} opacity={this.config.labelOpacity} stroke='none'
        font-size={this.state.fontSize} transform={transform} text-rendering='geometricPrecision' >
        <tspan class={`sc-vlabel-${index}`} labelIndex={index} text-anchor={this.config.labelAlign} x={0} y={0} dy='0.4em' events={{ mouseenter: (e) => this.onMouseEnter(e, index), mouseleave: this.onMouseLeave }}>
          {(this.props.opts.prepend ? this.props.opts.prepend : '') + val + (this.props.opts.append ? this.props.opts.append : '')}
        </tspan>
      </text>
    );
  }

  onMouseEnter(e, index) {
    let lblIndex = index;
    e.labelText = (this.props.opts.prepend ? this.props.opts.prepend : '') + this.valueSet[lblIndex] + (this.props.opts.append ? this.props.opts.append : '');
    this.emitter.emit('vLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('vLabelExit', e);
  }

  countDecimals(value) {
    if (Math.floor(value) === value) {
      return 0;
    }
    let count = value.toString().split('.')[1].length;
    return count > 10 ? 10 : count || 0;
  }
}

export default VerticalLabels;