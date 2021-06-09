'use strict';

import eventEmitter from './../core/eventEmitter';
import defaultConfig from './../settings/config';
import UtilCore from './../core/util.core';
import { Component } from './../viewEngin/pview';
import Ticks from './ticks';
import UiCore from '../core/ui.core';
import a11yFactory from './../core/a11y';

/**
 * horizontalLabels.js
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Labels for the chart.
 * @extends Component
 *
 * @event
 * 1. onHorizontalLabelsRender : Fire when horizontal labels draws.
 * 2. hLabelEnter: Fire when mouse hover on label text.
 * 3. hLabelExit: Fire mouse out of label text.
 */

class HorizontalLabels extends Component {

  constructor(props) {
    super(props);
    let self = this;
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.a11yWriter = a11yFactory.getWriter(this.context.runId);
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
            return self.props.opts.categories.parseAsDate && UtilCore.isDate(c) ? UtilCore.dateFormat(c).format(self.config.dateFormat) : c;
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

    /* For accessibility */
    this.accId = this.props.accessibilityId || UtilCore.getRandomID();
    this.a11yWriter.createSpace(this.accId);
    this.a11yWriter.write(this.accId, '<div aria-hidden="false">Range: ' +
      (this.props.opts.prepend || '') + (this.props.opts.categories.parseAsDate && UtilCore.isDate(this.props.categorySet[0]) ? UtilCore.dateFormat(this.props.categorySet[0]).format('LL') : this.props.categorySet[0]) + (this.props.opts.append || '') +
      ' to ' +
      (this.props.opts.prepend || '') + (this.props.opts.categories.parseAsDate && UtilCore.isDate(this.props.categorySet[this.props.categorySet.length - 1]) ? UtilCore.dateFormat(this.props.categorySet[this.props.categorySet.length - 1]).format('LL') : this.props.categorySet[this.props.categorySet.length - 1]) + (this.props.opts.append || '') +
      '</div>', false);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
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
        dateFormat: config.categories.dateFormat || defaultConfig.formatting.displayDateFormat
      }
    };
  }

  render() {
    this.setIntervalLength();
    this.emitter.emitSync('onHorizontalLabelsRender', {
      intervalLen: this.state.intervalLen,
      values: this.state.categories,
      count: this.state.categories.length
    });
    return (
      <g class='sc-horizontal-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`} aria-hidden='true'>
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
    let label = <text class="sc-horizontal-label" font-family={this.config.fontFamily} fill={this.config.labelColor} x={0} y={0}
      transform={transform} font-size={this.config.fontSize} opacity={opacity} stroke='none' text-rendering='geometricPrecision' >
      <tspan class={`sc-hlabel-${index} sc-label-text`} labelIndex={index} text-anchor={this.config.labelRotate ? 'end' : 'middle'} dy='0.4em' events={{ mouseenter: (e) => this.onMouseEnter(e, index), mouseleave: this.onMouseLeave }}>
        {(this.props.opts.prepend ? this.props.opts.prepend : '') + val + (this.props.opts.append ? this.props.opts.append : '')}
      </tspan>
    </text>;

    if (index === this.state.categories.length - 1 && !this.config.labelRotate) {
      let labelWidth = UiCore.getComputedTextWidth(label);
      if (x + (labelWidth) > this.props.maxWidth) {
        let diff = x + (labelWidth / 2) + this.props.paddingX - this.props.maxWidth;
        label.attributes.transform = 'translate(' + (x - diff) + ',' + y + ')';
      }
    }
    return label;
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

  onMouseEnter(e, index) {
    let lblIndex = index;
    let lblText = this.state.categories[lblIndex];
    if (UtilCore.isDate(this.props.categorySet[lblIndex])) {
      lblText = UtilCore.dateFormat(this.props.categorySet[lblIndex]).format('lll');
    }
    e.labelText = (this.props.opts.prepend ? this.props.opts.prepend : '') + lblText + (this.props.opts.append ? this.props.opts.append : '');
    this.emitter.emit('hLabelEnter', e);
  }

  onMouseLeave(e) {
    this.emitter.emit('hLabelExit', e);
  }

}

export default HorizontalLabels;