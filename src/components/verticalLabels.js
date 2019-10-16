'use strict';

import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';
import eventEmitter from './../core/eventEmitter';
import defaultConfig from './../settings/config';
import Ticks from './ticks';

/**
 * verticalLabels.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Vertical Labels and Tick marks for the chart.
 * @extends Component
 * @example
  "yAxis": {
    "title": "Usage %",
    "prepend": "Rs.",
    "append": " %",
    "labelRotate": 0,
    "tickOpacity": 1,
    "tickColor": '#222',
    "tickSpan": 5,
    "labelOpacity": 1,
    "labelColor": "#000",
    "axisColor": "#000", // TODO
    "fontSize": 14,
    "fontFamily": "Lato",
    "zeroBase": false,  // min label of y-axis always stick to zero if all value are positive and
                        // max label of y-axis always stick to zero if all value are negative.
  }
 * @events -
 * 1. onVerticalLabelRender : Fire when horizontal labels draws.
 */
class VerticalLabels extends Component {

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.config = {};
    this.resetConfig(this.props.opts);
    this.defaultTickSpan = 6;
    this.state = {
      fontSize: this.config.fontSize
    };
    this.valueSet = [];
    this.zeroBaseIndex = -1;
    this.minLabelVal = this.props.minVal;
    this.maxLabelVal = this.props.maxVal;
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
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
  }

  render() {
    let labels = this.getLabels();
    this.emitter.emit('onVerticalLabelsRender', {
      intervalLen: this.props.intervalLen,
      intervarValue: this.props.valueInterval,
      zeroBaseIndex: this.zeroBaseIndex,
      values: this.valueSet,
      count: this.props.labelCount
    });
    return (
      <g class='sc-vertical-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        {labels}
        <Ticks posX={5} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
      </g>
    );
  }

  getLabels() {
    let labels = [];
    this.zeroBaseIndex = -1;
    for (let lCount = this.props.labelCount, i = 0; lCount >= 0; lCount--) {
      let labelVal = this.minLabelVal + (i++ * this.props.valueInterval);
      this.maxLabelVal = uiCore.formatTextValue(labelVal);
      labels.push(this.getEachLabel(this.maxLabelVal, lCount));
      this.valueSet.unshift(this.maxLabelVal);
      if (labelVal === 0) {
        this.zeroBaseIndex = lCount;
      }
    }
    return labels;
  }

  getEachLabel(val, index) {
    let x = 0;
    let y = this.valueSet.length === 1 ? this.props.valueInterval : index * this.props.intervalLen;
    let transform = this.config.labelRotate ? 'rotate(' + this.config.labelRotate + ',' + x + ',' + y + ')' : '';
    return (
      <text font-family={this.config.fontFamily} fill={this.config.labelColor} opacity={this.config.labelOpacity} stroke='none'
        font-size={this.state.fontSize} opacity={this.config.tickOpacity} transform={transform} text-rendering='geometricPrecision' >
        <tspan class={`vlabel-${index}`} labelIndex={index} text-anchor='end' x={0} y={index * this.props.intervalLen} dy='0.4em' events={{ mouseenter: this.onMouseEnter, mouseleave: this.onMouseLeave }}>
          {(this.props.opts.prepend ? this.props.opts.prepend : '') + val + (this.props.opts.append ? this.props.opts.append : '') }
        </tspan>
      </text>
    );
  }

  onMouseEnter(e) {
    let lblIndex = e.target.classList[0].replace('vlabel-', '');
    e.labelText = (this.props.opts.prepend ? this.props.opts.prepend : '') + this.valueSet[lblIndex] + (this.props.opts.append ? this.props.opts.append : '');
    this.emitter.emit('vLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('vLabelExit', e);
  }
}

export default VerticalLabels;