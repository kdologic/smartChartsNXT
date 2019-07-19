'use strict';

import eventEmitter from './../core/eventEmitter';
import defaultConfig from './../settings/config';
import UtilCore from './../core/util.core';
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
      "title": "Date",
      "prefix": "",
      "parseAsDate": true,
      "dateFormat": "dd mmm",
      "labelRotate": -45,
      "intervalThreshold": 40,
      "tickOpacity": 1,
      "tickColor": '#222',
      "tickSpan": 6,
      "labelOpacity": 1,
      "labelColor": "#009688",
      "fontSize": 14,
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
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.config = {};
    this.resetConfig(this.props.opts);
    this.defaultTickSpan = 6;
    this.state = {
      intervalLen: this.config.intervalThreshold,
      set categories(cat) {
        if (cat instanceof Array && cat.length > 0) {
          this._categories = cat.map((c) => {
            return self.props.opts.parseAsDate && UtilCore.isDate(c) ? dateFormat(c, self.config.dateFormat) : c;
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
        labelRotate: config.labelRotate || 0,
        fontSize: config.fontSize || defaultConfig.theme.fontSizeSmall,
        fontFamily: config.fontFamily || defaultConfig.theme.fontFamily,
        tickOpacity: config.tickOpacity || 1,
        labelOpacity: config.labelOpacity || 1,
        labelColor: config.labelColor || defaultConfig.theme.fontColorDark,
        tickColor: config.tickColor || defaultConfig.theme.fontColorDark,
        intervalThreshold: config.intervalThreshold || 30,
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
            <rect x={this.state.clip.x - 20} y={this.state.clip.y} width={this.state.clip.width + 20} height={this.state.clip.height} />
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
    let transform = this.config.labelRotate ? 'rotate(' + this.config.labelRotate + ',' + x + ',' + y + ')' : '';
    return (
      <text instanceId={`sc-text-hlabel-${index}`} font-family={this.config.fontFamily} fill={this.config.labelColor} x={x} y={y} opacity
        transform={transform} font-size={this.config.fontSize} opacity={opacity} stroke='none' text-rendering='geometricPrecision' >
        <tspan class={`sc-hlabel-${index} sc-label-text`} labelIndex={index} text-anchor={this.config.labelRotate ? 'end' : 'middle'} dy='0.4em' events={{ mouseenter: this.onMouseEnter, mouseleave: this.onMouseLeave }}>
          {(this.props.opts.prefix ? this.props.opts.prefix : '') + val}
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
    e.labelText = (this.props.opts.prefix ? this.props.opts.prefix : '') + this.state.categories[lblIndex];
    this.emitter.emit('hLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('hLabelExit', e);
  }

}

export default HorizontalLabels;