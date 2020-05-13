'use strict';

import eventEmitter from './../core/eventEmitter';
import defaultConfig from './../settings/config';
import utilCore from './../core/util.core';
import { Component } from './../viewEngin/pview';
import Ticks from './ticks';
import dateFormat from 'dateformat';

/**
 * horizontalLabels.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Labels for the chart.
 * @extends Component
 *
 * @example
 * "xAxis": {
      "title": "Month",
      "prepend": "",
      "append": "",
      "parseAsDate": true,
      "dateFormat": "mmm - yyyy",
      "labelRotate": -45,
      "intervalThreshold": 40,
      "tickOpacity": 1,
      "tickColor": '#222',
      "tickSpan": 6,
      "labelOpacity": 1,
      "labelColor": "#000",
      "axisColor": "#000", // TODO
      "fontSize": 12,
      "fontFamily": "Lato"
    }

 * @event
 * onHorizontalLabelRender : Fire when horizontal labels draws.
 */

class HorizontalLabels extends Component {

  constructor(props) {
    super(props);
    let self = this;
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.rid = utilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.config = {};
    this.resetConfig(this.props.opts);
    this.defaultTickSpan = 6;
    this.state = {
      intervalLen: this.config.intervalThreshold,
      set categories(cat) {
        if (cat instanceof Array && cat.length > 0) {
          this._categories = cat.map((c) => {
            return self.props.opts.parseAsDate && utilCore.isDate(c) ? dateFormat(c, self.config.dateFormat) : c;
          });
        } else {
          this._categories = [];
        }
      },
      get categories() {
        return this._categories;
      }
    };
    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: this.props.maxWidth,
      height: this.props.maxHeight
    }, this.props.clip);
    this.state.categories = this.props.categorySet;
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  propsWillReceive(nextProps) {
    this.resetConfig(nextProps.opts);
    this.state.categories = nextProps.categorySet;
    this.state.clip = Object.assign({
      x: 0,
      y: 0,
      width: nextProps.maxWidth,
      height: nextProps.maxHeight
    }, nextProps.clip);
  }

  resetConfig(config) {
    this.config = {
      ...this.config, ...{
        labelRotate: typeof config.labelRotate === 'undefined' ? 0 : config.labelRotate,
        fontSize: config.fontSize || defaultConfig.theme.fontSizeMedium,
        fontFamily: config.fontFamily || defaultConfig.theme.fontFamily,
        tickOpacity: typeof config.tickOpacity === 'undefined' ? 1 : config.tickOpacity,
        labelOpacity: typeof config.labelOpacity === 'undefined' ? 1 : config.labelOpacity,
        labelColor: config.labelColor || defaultConfig.theme.fontColorDark,
        tickColor: config.tickColor || defaultConfig.theme.fontColorDark,
        intervalThreshold: typeof config.intervalThreshold === 'undefined' ? 30 : config.intervalThreshold,
        dateFormat: config.dateFormat || defaultConfig.formatting.dateFormat
      }
    };
  }

  render() {
    this.setIntervalLength();
    this.emitter.emit('onHorizontalLabelsRender', {
      intervalLen: this.state.intervalLen,
      values: this.state.categories,
      count: this.state.categories.length
    });
    return (
      <g class='sc-horizontal-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`}>
        <defs>
          <clipPath id={this.clipPathId}>
            <rect x={this.state.clip.x - 100} y={this.state.clip.y} width={this.state.clip.width + 100} height={this.state.clip.height} />
          </clipPath>
          <clipPath id={this.clipPathId + '-tick'}>
            <rect x={this.state.clip.x - this.props.paddingX} y={this.state.clip.y} width={this.state.clip.width + this.props.paddingX} height={this.props.opts.tickSpan || this.defaultTickSpan} />
          </clipPath>
        </defs>
        <g class='sc-horizontal-labels' transform={`translate(${this.props.paddingX}, 0)`}>
          {
            this.getLabels()
          }
        </g>
        <g class={'sc-horizontal-ticks'} transform={`translate(${this.props.paddingX}, 0)`} clip-path={`url(#${this.clipPathId}-tick)`}>
          <Ticks posX={0} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.state.intervalLen} tickCount={this.state.categories.length} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='horizontal'></Ticks>
        </g>
      </g>
    );
  }

  getLabels() {
    let labels = [];
    for (let i = 0; i < this.state.categories.length; i++) {
      labels.push(this.getEachLabel(this.state.categories[i], i));
    }
    return labels;
  }

  getEachLabel(val, index) {
    let x = this.state.categories.length === 1 ? this.state.intervalLen : index * this.state.intervalLen;
    let y = 18;
    let opacity = x - this.state.clip.x + this.props.paddingX < 0 ? 0 : this.config.labelOpacity;
    let transform = this.config.labelRotate ? 'rotate(' + this.config.labelRotate + ',' + x + ',' + y + ') translate(' + x + ',' + y + ')' : 'translate(' + x + ',' + y + ')';
    return (
      <text font-family={this.config.fontFamily} fill={this.config.labelColor} x={0} y={0} opacity
        transform={transform} font-size={this.config.fontSize} opacity={opacity} stroke='none' text-rendering='geometricPrecision' >
        <tspan class={`sc-hlabel-${index} sc-label-text`} labelIndex={index} text-anchor={this.config.labelRotate ? 'end' : 'middle'} dy='0.4em' events={{ mouseenter: this.onMouseEnter, mouseleave: this.onMouseLeave }}>
          {(this.props.opts.prepend ? this.props.opts.prepend : '') + val + (this.props.opts.append ? this.props.opts.append : '')}
        </tspan>
      </text>
    );
  }

  setIntervalLength() {
    let interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (this.props.categorySet.length - 1 || 2);
    let skipLen = Math.ceil(this.config.intervalThreshold / interval);
    if (skipLen > 0) {
      let newCategories = [];
      for (let i = 0; i < this.props.categorySet.length; i += skipLen) {
        newCategories.push(this.props.categorySet[i]);
      }
      this.state.categories = newCategories;
    }
    interval = skipLen * interval;

    this.state.intervalLen = interval;
  }

  onMouseEnter(e) {
    let lblIndex = e.target.getAttribute('labelIndex');
    e.labelText = (this.props.opts.prepend ? this.props.opts.prepend : '') + this.state.categories[lblIndex] + (this.props.opts.append ? this.props.opts.append : '');
    this.emitter.emit('hLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('hLabelExit', e);
  }

}

export default HorizontalLabels;