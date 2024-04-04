'use strict';

import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import UtilCore from '../../core/util.core';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import defaultConfig from '../../settings/config';
import Ticks from '../ticks/ticks.component';
import a11yFactory, { A11yWriter } from '../../core/a11y';
import { IVerticalLabelsProps } from './verticalLabels.model';
import { IYAxisConfig } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import { AXIS_TYPE, HORIZONTAL_ALIGN, TEXT_ANCHOR } from '../../global/global.enums';
import { IVnode } from '../../viewEngin/component.model';

/**
 * verticalLabels.component.tsx
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
class VerticalLabels extends Component<IVerticalLabelsProps> {
  private emitter: CustomEvents;
  private a11yWriter: A11yWriter;
  private config: IYAxisConfig;
  private defaultTickSpan: number;
  private valueSet: string[];
  private zeroBaseIndex: number;
  private minLabelVal: number | string;
  private maxLabelVal: number | string;
  private accId: string;
  private intervalId: any;

  constructor(props: IVerticalLabelsProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.a11yWriter = a11yFactory.getWriter((this as any).context.runId);
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

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    this.intervalId = setInterval(() => {
      if ((this.ref.node as SVGElement).getBoundingClientRect().width > this.props.maxWidth) {
        this.setState({ fontSize: this.state.fontSize - 1 });
      } else {
        clearInterval(this.intervalId);
      }
    });
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  propsWillReceive(nextProps: IVerticalLabelsProps): void {
    this.resetConfig(nextProps.opts);
    this.minLabelVal = nextProps.minVal;
    this.maxLabelVal = nextProps.maxVal;
  }

  resetConfig(config: IYAxisConfig): void {
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

    if(!config.labelAlign) {
      config.labelAlign = TEXT_ANCHOR.END;
    }
    switch (config.labelAlign) {
      case HORIZONTAL_ALIGN.RIGHT: this.config.labelAlign = TEXT_ANCHOR.END; break;
      case HORIZONTAL_ALIGN.LEFT: this.config.labelAlign = TEXT_ANCHOR.START; break;
      case HORIZONTAL_ALIGN.CENTER: this.config.labelAlign = TEXT_ANCHOR.MIDDLE;
    }
  }

  render(): IVnode {
    return (
      <g class='sc-vertical-axis-labels' transform={`translate(${this.props.posX},${this.props.posY})`} aria-hidden='true'>
        {this.getLabels()}
        {!this.props.opts.positionOpposite && this.config.labelAlign === TEXT_ANCHOR.END &&
          <Ticks posX={-(this.props.opts.tickSpan || this.defaultTickSpan)} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
        }
        {this.props.opts.positionOpposite && this.config.labelAlign === TEXT_ANCHOR.START &&
          <Ticks posX={0} posY={0} span={this.props.opts.tickSpan || this.defaultTickSpan} tickInterval={this.props.intervalLen} tickCount={this.props.labelCount + 1} opacity={this.config.tickOpacity} stroke={this.config.tickColor} type='vertical'></Ticks>
        }
      </g>
    );
  }

  getLabels(): IVnode[] {
    let labels = [];
    this.zeroBaseIndex = -1;
    let i = this.props.opts.type === AXIS_TYPE.LOGARITHMIC ? Math.log10(Number(this.minLabelVal)) : 0;
    let decimalCount = this.countDecimals(Number(this.minLabelVal));
    for (let lCount = this.props.labelCount; lCount >= 0; lCount--, i++) {
      let labelVal = Number(this.minLabelVal) + (i * this.props.valueInterval(i));
      if (this.props.opts.type === AXIS_TYPE.LOGARITHMIC) {
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
      isPrimary: this.props.priority === 'primary',
      intervalLen: this.props.intervalLen,
      intervalValue: this.props.valueInterval,
      zeroBaseIndex: this.zeroBaseIndex,
      values: this.valueSet,
      count: this.props.labelCount
    });
    return labels;
  }

  getEachLabel(val: number | string, index: number): IVnode {
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
        <tspan class={`sc-vlabel-${index}`} labelIndex={index} text-anchor={this.config.labelAlign} x={0} y={0} dy='0.4em' events={{ mouseenter: (e: MouseEvent) => this.onMouseEnter(e, index), mouseleave: this.onMouseLeave }}>
          {(this.props.opts.prepend ? this.props.opts.prepend : '') + val + (this.props.opts.append ? this.props.opts.append : '')}
        </tspan>
      </text>
    );
  }

  onMouseEnter(event: MouseEvent, index: number): void {
    const labelText = (this.props.opts.prepend ? this.props.opts.prepend : '') + this.valueSet[index] + (this.props.opts.append ? this.props.opts.append : '');
    const eventData = {
      event,
      labelText
    };
    this.emitter.emit('vLabelEnter', eventData);
  }

  onMouseLeave(e: MouseEvent): void {
    this.emitter.emit('vLabelExit', e);
  }

  countDecimals(value: number): number {
    if (Math.floor(value) === value) {
      return 0;
    }
    let count = value.toString().split('.')[1].length;
    return count > 10 ? 10 : count || 0;
  }
}

export default VerticalLabels;