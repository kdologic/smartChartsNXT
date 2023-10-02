'use strict';

import defaultConfig from '../../settings/config';
import GeomCore from '../../core/geom.core';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import UtilCore from '../../core/util.core';
import MarkerIcon from '../marker/markerIcon.component';
import { ILegendBoxProps, ILegendLengthData, ILegendOptions } from './legendBox.model';
import { ILegendsConfig } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import { ALIGNMENT, DISPLAY, FLOAT, ICON_TYPE } from '../../settings/globalEnums';
import { IVnode } from '../../viewEngin/component.model';

/**
 * legendBox.component.jsx
 * @createdOn: 06-Nov-2017
 * @author: SmartChartsNXT
 * @description:This is a component class will create legend area.
 * @extends Component
 *
 * Legend box accept 3 positioning parameters -
 * {Number} left, {Number} right, {String} float - [top | bottom | left | right]
 *
 * When Float type is top or bottom only left param is acceptable and top param will be ignored.
 * When Float type is left or right only top param is acceptable and left param will be ignored.
 * When Float wasn't set then top and left both values will be considered.
 *
 * display - inline : inline only take space as much required. it wouldn't wrap the legends.
 * display - block: block will take entire row. It will wrap the legends if overflow.
 *
 * @event
 * 1. legendClicked - Triggered when clicked on a legend box.
 * 2. legendHovered - Triggered when mouse hover on a legend box.
 * 3. legendLeaved - Triggered when move out of legend box.
 * 4. legendRendered - Triggered when legneds fully rendered.
 */

class LegendBox extends Component<ILegendBoxProps> {
  private emitter: CustomEvents;
  private config: ILegendsConfig;
  private renderCount: number;
  private padding: number;
  private containerWidth: number;
  private containerHeight: number;
  private iconWidth: number;
  private iconHeight: number;
  private hoverHeight: number;
  private lineHeight: number;
  private toggleColor: string;
  private cumulativeWidth: number;

  constructor(props: ILegendBoxProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.config = {};
    this.setConfig(this.props);
    this.renderCount = 0;
    this.state = {
      legendSet: this.props.legendSet.map((lSet) => {
        lSet.totalWidth = 0;
        lSet.labelLength = 0;
        lSet.isToggled = lSet.isToggled === undefined ? false : lSet.isToggled;
        lSet.transform = '';
        lSet.icon = {
          ...{
            enable: true,
            type: ICON_TYPE.CIRCLE,
            URL: ''
          }, ...lSet.icon
        };
        lSet.bgFillOpacity = 0;
        lSet.strokeOpacity = 0.1;
        lSet.defaultIconStroke = 'none';
        lSet.iconHighlight = false;
        if (!lSet.icon.enable) {
          lSet.icon.type = ICON_TYPE.NONE;
        }
        return lSet;
      }),
      left: 0,
      top: 0,
      trnsX: 0,
      trnsY: 0,
      legendSetTransformX: 0,
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
    this.iconWidth = this.config.hideIcon === true ? 0 : 15;
    this.iconHeight = this.config.hideIcon === true ? 0 : 15;
    this.hoverHeight = 15;
    this.lineHeight = 30;
    this.toggleColor = 'none';
    this.cumulativeWidth = 0;
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);

    this.calcFloatingPosition();
    UtilCore.extends(this.state.lengthSet, this.calcLegendDimensions());
    this.calcLegendPositions();
    this.setContainerWidthHeight();
  }

  setConfig(props: ILegendBoxProps): void {
    this.config = {
      top: typeof props.opts.top === 'undefined' ? (props.top || 0) : UiCore.percentToPixel((this as any).context.svgWidth, props.opts.top.toString()),
      left: typeof props.opts.left === 'undefined' ? (props.left || 0) : UiCore.percentToPixel((this as any).context.svgWidth, props.opts.left.toString()),
      maxWidth: typeof props.opts.maxWidth === 'undefined' ? (this as any).context.svgWidth : UiCore.percentToPixel((this as any).context.svgWidth, props.opts.maxWidth),
      type: props.opts.alignment || props.type || ALIGNMENT.HORIZONTAL,
      float: props.opts.float || props.float || FLOAT.NONE,
      display: props.opts.display || props.display || DISPLAY.INLINE,
      textColor: props.opts.textColor || defaultConfig.theme.fontColorDark,
      bgColor: props.opts.bgColor || props.background || 'none',
      hoverColor: props.opts.hoverColor || props.hoverColor || 'none',
      fontSize: props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: props.opts.fontFamily || defaultConfig.theme.fontFamily,
      itemBorderWidth: typeof props.opts.itemBorderWidth === 'undefined' ? 1 : props.opts.itemBorderWidth,
      itemBorderColor: props.opts.itemBorderColor || '#000',
      itemBorderOpacity: typeof props.opts.itemBorderOpacity === 'undefined' ? 1 : props.opts.itemBorderOpacity,
      itemBorderRadius: typeof props.opts.itemBorderRadius === 'undefined' ? 10 : props.opts.itemBorderRadius,
      strokeColor: props.opts.borderColor || props.strokeColor || 'none',
      strokeWidth: typeof props.opts.borderWidth === 'undefined' ? (props.strokeWidth || 1) : 1,
      strokeOpacity: typeof props.opts.borderOpacity === 'undefined' ? (props.strokeOpacity || 1) : 1,
      opacity: typeof props.opts.opacity === 'undefined' ? (props.opacity || 0.9) : 0.9,
      toggleType: !!(props.opts.toggleType || props.toggleType || false),
      hideIcon: typeof props.opts.hideIcon === 'undefined' ? (typeof props.hideIcon === 'undefined' ? false : props.hideIcon) : props.opts.hideIcon,
      hideLabel: typeof props.opts.hideLabel === 'undefined' ? (typeof props.hideLabel === 'undefined' ? false : props.hideLabel) : props.opts.hideLabel,
      hideValue: typeof props.opts.hideValue === 'undefined' ? (typeof props.hideValue === 'undefined' ? false : props.hideValue) : props.opts.hideValue
    };
    this.iconWidth = this.config.hideIcon === true ? 0 : 15;
    this.iconHeight = this.config.hideIcon === true ? 0 : 15;
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    /* Need to re-render when float = bottom */
    if (this.config.float === FLOAT.BOTTOM || this.config.float === FLOAT.RIGHT) {
      this.update();
    } else {
      this.renderCount = 0;
      const configData = UtilCore.extends({}, this.config, { bBox: this.getBBox() });
      setTimeout(() => this.emitter.emit('legendRendered', configData));
    }
  }

  beforeUpdate(nextProps: ILegendBoxProps) {
    this.setConfig(nextProps);
    this.calcFloatingPosition();
    UtilCore.extends(this.state.lengthSet, this.calcLegendDimensions());
    this.calcLegendPositions();
    this.setContainerWidthHeight();
  }

  afterUpdate() {
    /* Need to re-render when float = bottom */
    if ((this.config.float === FLOAT.BOTTOM || this.config.float === FLOAT.RIGHT) && this.renderCount < 2) {
      this.update();
    } else {
      this.renderCount = 0;
      const configData = UtilCore.extends({}, this.config, { bBox: this.getBBox() });
      this.emitter.emit('legendRendered', configData);
    }
  }

  render(): IVnode {
    this.cumulativeWidth = 0;
    this.renderCount++;
    return (
      <g transform={`translate(${this.state.legendBoxTransformX},${this.state.legendBoxTransformY})`} role="region">
        <path class='legend-container-border' d={this.getContainerBorderPath()} fill={this.config.bgColor}
          opacity={this.config.opacity} stroke-width={this.config.strokeWidth} stroke={this.config.strokeColor} stroke-opacity={this.config.strokeOpacity}
        />
        <g class='sc-legend-set' transform={`translate(${this.state.legendSetTransformX})`}>
          {this.getLegendSet()}
        </g>
      </g>
    );
  }

  getLegendSet(): IVnode[] {
    return this.state.legendSet.map((data: ILegendOptions, index: number) => this.getLegend(data, index));
  }

  getLegend(data: ILegendOptions, index: number, withContainer: boolean = true): IVnode {
    return (
      <g class={`sc-legend-${index} sc-series-legend`} transform={this.state.legendSet[index].transform || ''} style={{ cursor: 'pointer' }} tabindex='0'
        role="button" aria-label={(data.isToggled ? 'Show' : 'Hide ') + data.label + ' series'} aria-pressed={data.isToggled}
        events={{
          click: (e: MouseEvent) => this.onClick(e, index),
          keyup: (e: KeyboardEvent) => this.onClick(e, index),
          mouseenter: (e: MouseEvent) => this.onHover(e, index),
          mouseleave: (e: MouseEvent) => this.onLeave(e, index),
          focusin: (e: FocusEvent) => this.onHover(e, index),
          focusout: (e: FocusEvent) => this.onLeave(e, index)
        }} >
        {withContainer &&
          <rect class={`sc-legend-${index} sc-legend-border-${index}`} x={this.state.left + (this.padding / 2)} y={this.state.top + (this.padding / 2)} rx={this.config.itemBorderRadius}
            width={data.totalWidth} height={this.hoverHeight + this.padding} fill={this.config.hoverColor} stroke-opacity={this.config.itemBorderOpacity}
            stroke={this.config.itemBorderColor} stroke-width={this.config.itemBorderWidth} style={{ 'transition': 'fill-opacity 0.3s linear', 'fillOpacity': data.bgFillOpacity, 'pointerEvents': 'all' }}>
          </rect>
        }
        {!this.config.hideIcon &&
          <g class='sc-legend-icon-group' transform="translate(2,0)">
            {this.getIcon(index, data)}
            <path class={`sc-icon-x-${index}`} stroke='#000' fill='none' stroke-linecap='round' stroke-opacity={data.isToggled ? 1 : 0}
              d={[
                'M', this.state.left + this.padding, this.state.top + this.padding,
                'L', this.state.left + this.padding + this.iconWidth, this.state.top + this.padding + this.iconWidth,
                'M', this.state.left + this.padding + this.iconWidth, this.state.top + this.padding,
                'L', this.state.left + this.padding, this.state.top + this.padding + this.iconWidth
              ].join(' ')} stroke-width='1'>
            </path>
          </g>
        }
        {this.getLegendText(data, index)}
      </g>
    );
  }

  getLegendText(data: ILegendOptions, index: number) {
    return (
      <text class={`sc-legend-${index} sc-legend-txt-${index}`} stroke-width={0.5} stroke={this.config.textColor} stroke-opacity={data.strokeOpacity} font-size={this.config.fontSize} x={this.state.left + this.iconWidth + (2 * this.padding)} y={this.state.top + this.padding + 14}
        fill={this.config.textColor} font-family={this.config.fontFamily} pointer-events='none' >
        <tspan class={`sc-legend-${index} sc-legend-txt-label-${index}`} text-decoration={data.isToggled ? 'line-through' : 'none'}>{!this.config.hideLabel && data.label}</tspan>
        <tspan class={`sc-legend-${index} sc-legend-txt-value-${index}`} text-decoration={data.isToggled ? 'line-through' : 'none'}
          dx={this.state.lengthSet.max.labelLength - data.labelLength + this.padding}>
          {!this.config.hideValue && data.value}
        </tspan>
      </text>
    );
  }

  getIcon(index: number, data: ILegendOptions): IVnode | IVnode[] {
    const line = <line x1={this.state.left + this.padding - (this.iconWidth / 4)} y1={this.state.top + this.padding + (this.iconWidth / 2)} x2={this.state.left + this.padding + this.iconWidth + (this.iconWidth / 4)} y2={this.state.top + this.padding + (this.iconWidth / 2)} stroke={data.color} stroke-width={2} stroke-linecap="round"></line>;
    if (!data.icon.enable) {
      return line;
    }
    if (!data.icon.type) {
      return [
        line,
        <rect x={this.state.left + this.padding} y={this.state.top + this.padding} width={this.iconWidth} height={this.iconWidth} fill={data.isToggled ? this.toggleColor : data.color}
          shape-rendering='optimizeSpeed' stroke-width={2} stroke={data.defaultIconStroke} opacity='1'>
        </rect>
      ];
    }
    return [
      line,
      <MarkerIcon index={index} instanceId={index} type={data.icon.type} x={this.state.left + this.padding + (this.iconWidth / 2)} y={this.state.top + this.padding + (this.iconHeight / 2)} width={this.iconWidth} height={this.iconHeight} fillColor={data.isToggled ? this.toggleColor : data.color} highlighted={data.iconHighlight} strokeColor="#fff" URL={data.icon.URL || ''}></MarkerIcon>
    ];
  }

  calcFloatingPosition(): void {
    switch (this.config.float) {
      case FLOAT.TOP:
        this.state.legendBoxTransformX = this.config.left || this.padding;
        this.state.legendBoxTransformY = this.padding;
        break;
      case FLOAT.BOTTOM:
        this.state.legendBoxTransformX = this.config.left || this.padding;
        this.state.legendBoxTransformY = (this as any).context.svgHeight - this.containerHeight - this.padding;
        break;
      case FLOAT.LEFT:
        this.state.legendBoxTransformX = this.padding;
        this.state.legendBoxTransformY = this.config.top || this.padding;
        break;
      case FLOAT.RIGHT:
        this.state.legendBoxTransformX = (this as any).context.svgWidth - this.containerWidth - this.padding;
        this.state.legendBoxTransformY = this.config.top || this.padding;
        break;
      case FLOAT.NONE:
      default:
        this.state.legendBoxTransformX = this.config.left || this.padding;
        this.state.legendBoxTransformY = this.config.top || this.padding;
    }
    if (this.config.display === DISPLAY.BLOCK) {
      this.state.legendBoxTransformX = this.padding;
    }
    this.state.legendSetTransformX = 0;
  }

  calcLegendPositions(): void {
    this.state.lineCount = 1;
    this.cumulativeWidth = 0;
    this.state.lengthSet.max.lineWidth = 0;
    const legendBoxTransformX = this.config.float === FLOAT.RIGHT ? 0 : this.state.legendBoxTransformX;
    let maxAllowedWidth = (this as any).context.svgWidth;
    if (this.config.display !== DISPLAY.BLOCK) {
      maxAllowedWidth = this.config.left + this.config.maxWidth > (this as any).context.svgWidth ? ((this as any).context.svgWidth - this.config.left) : this.config.maxWidth;
    }
    if (this.state.legendSet.length && this.config.type === ALIGNMENT.VERTICAL) {
      maxAllowedWidth = 1;
    }
    for (let index = 0; index < this.state.legendSet.length; index++) {
      const legendWidth = this.state.legendSet[index].totalWidth;
      let transformX = index === 0 ? 0 : this.cumulativeWidth + this.padding;
      let transformY = (this.state.lineCount - 1) * this.lineHeight;
      if (legendBoxTransformX + transformX + legendWidth + this.padding > legendBoxTransformX + maxAllowedWidth) {
        this.cumulativeWidth = 0;
        this.state.lineCount++;
        transformX = 0;
        transformY = (this.state.lineCount - 1) * this.lineHeight;
      }
      this.cumulativeWidth = transformX + legendWidth;
      if (this.cumulativeWidth > this.state.lengthSet.max.lineWidth) {
        this.state.lengthSet.max.lineWidth = this.cumulativeWidth + this.padding;
      }
      this.state.legendSet[index].transform = `translate(${transformX}, ${transformY})`;
    }
  }

  calcLegendDimensions(): ILegendLengthData {
    let lengthSet: ILegendLengthData = {
      totalWidth: [],
      labelLength: []
    };
    this.state.legendSet.forEach((lSet: ILegendOptions, index: number) => {
      lengthSet.totalWidth.push(lSet.totalWidth = UiCore.getComputedBBox(this.getLegend(lSet, index, false)).width + this.padding);
      lengthSet.labelLength.push(lSet.labelLength = UiCore.getComputedTextWidth(this.getLegendText(lSet, index)));
    });
    lengthSet.max = {
      width: Math.max(...lengthSet.totalWidth),
      labelLength: Math.max(...lengthSet.labelLength)
    };
    return lengthSet;
  }

  setContainerWidthHeight() {
    if (this.config.display === DISPLAY.BLOCK) {
      this.containerWidth = Math.max((this as any).context.svgWidth - (2 * this.padding), this.state.lengthSet.max.lineWidth);
    } else if (this.config.display === DISPLAY.INLINE) {
      this.containerWidth = this.state.lengthSet.max.lineWidth;
    }
    this.containerHeight = (this.state.lineCount * this.lineHeight) + (this.padding / 2);
  }

  getContainerBorderPath() {
    return GeomCore.describeRoundedRect(this.state.left, this.state.top, this.containerWidth, this.containerHeight, 10).join(' ');
  }

  getBBox(): {x: number, y: number, width: number, height: number} {
    return {
      width: this.containerWidth,
      height: this.containerHeight,
      x: this.state.legendBoxTransformX,
      y: this.state.legendBoxTransformY
    };
  }

  assignLegendData(index: number): ILegendOptions {
    const legend: ILegendOptions = this.state.legendSet[index];
    let legendOptions: ILegendOptions = {
      label: legend.label,
      value: legend.value,
      color: legend.color,
      index: index,
      icon: legend.icon,
      isToggled: legend.isToggled
    };
    return legendOptions;
  }

  onClick(e: MouseEvent | KeyboardEvent, index: number) {
    if (e instanceof KeyboardEvent && e.type === 'keyup' && e.code !== 'Space') {
      return;
    }
    if (this.config.toggleType) {
      this.state.legendSet[index].isToggled = !this.state.legendSet[index].isToggled;
      this.update();
    }
    const selectedLegendOption = this.assignLegendData(index);
    this.emitter.emit('legendClicked', {event: e, legendOption: selectedLegendOption});
  }

  onHover(e: FocusEvent, index: number) {
    this.state.legendSet[index].bgFillOpacity = 1;
    this.state.legendSet[index].strokeOpacity = 1;
    this.state.legendSet[index].defaultIconStroke = '#000';
    this.state.legendSet[index].iconHighlight = true;

    this.update();
    const selectedLegendOption = this.assignLegendData(index);
    this.emitter.emit('legendHovered', {event: e, legendOption: selectedLegendOption});
  }

  onLeave(e: FocusEvent, index: number) {
    this.state.legendSet[index].bgFillOpacity = 0;
    this.state.legendSet[index].strokeOpacity = 0.1;
    this.state.legendSet[index].defaultIconStroke = 'none';
    this.state.legendSet[index].iconHighlight = false;

    this.update();
    const selectedLegendOption = this.assignLegendData(index);
    this.emitter.emit('legendLeaved', {event: e, legendOption: selectedLegendOption});
  }
}

export default LegendBox;