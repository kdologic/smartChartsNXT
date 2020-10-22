'use strict';

import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import defaultConfig from '../settings/config';
import { Component } from '../viewEngin/pview';
import Textbox from './textBox';
import Style from '../viewEngin/style';
import utilCore from '../core/util.core';
import uiCore from '../core/ui.core';

/**
 * heading.js
 * @createdOn:20-Jun-2019
 * @author:SmartChartsNXT
 * @description: This components will create heading elements of chart.
 * @extends: Component
 */

class heading extends Component {
  constructor(props) {
    super(props);
    this.id = utilCore.getRandomID();
    this.state = {
      text: this.props.opts.text
    };
    this.config = {};
    this.setConfig(this.props);
  }

  setConfig(props) {
    let alignTextMap = { [ENUMS.HORIZONTAL_ALIGN.LEFT]: 'left', [ENUMS.HORIZONTAL_ALIGN.CENTER]: 'middle', [ENUMS.HORIZONTAL_ALIGN.RIGHT]: 'right' };
    this.config = {
      width: uiCore.percentToPixel(this.context.svgWidth, (props.opts.width || props.width)) || this.context.svgWidth - 10,
      height: uiCore.percentToPixel(this.context.svgWidth, props.opts.height),
      style: props.opts.style || '',
      top: typeof props.opts.top === 'undefined' ? (props.posY || 0) : uiCore.percentToPixel(this.context.svgHeight, props.opts.top),
      left: typeof props.opts.left === 'undefined' ? (props.posX || 0) : uiCore.percentToPixel(this.context.svgWidth, props.opts.left),
      fontFamily: props.opts.fontFamily || props.fontFamily || defaultConfig.theme.fontFamily,
      fontSize: props.opts.fontSize || props.fontSize || defaultConfig.theme.fontSizeLarge,
      textColor: props.opts.textColor || props.textColor || defaultConfig.theme.fontColorDark,
      stroke: props.opts.borderColor || props.stroke || 'none',
      bgColor: props.opts.bgColor || props.bgColor || 'none',
      textAnchor: alignTextMap[props.opts.textAlign] || alignTextMap[props.textAlign] || alignTextMap.center,
      padding: props.opts.padding || props.padding || 0,
      responsive: Object.assign({
        wrapText: true,
        reducer: () => ({ text: props.opts.text })
      }, props.opts.responsive)
    };

    let modifiedConfig = {};
    if (typeof this.config.responsive.reducer === 'function') {
      modifiedConfig = this.config.responsive.reducer(this.context.svgWidth, this.context.svgHeight) || {};
      this.state.text = modifiedConfig.text || props.opts.text;
    }
  }

  beforeUpdate(nextProps) {
    this.setConfig(nextProps);
  }

  render() {
    const style = {
      [`.sc-header-text-${this.id}`]: {
        'font-family': this.config.fontFamily,
        'font-size': this.config.fontSize + 'px',
        'fill': this.config.textColor,
        'stroke': this.config.stroke,
        ...this.config.style
      }
    };
    return (
      <g aria-hidden='true' class={`sc-header-grp-${this.id}`}>
        <Style>
          {{ [`.sc-header-grp-${this.id}`]: this.config.style }}
        </Style>
        <Textbox class={`sc-header-text-${this.id}`} style={style} posX={this.config.left} posY={this.config.top} width={this.config.width} height={this.config.height} textAnchor={this.config.textAnchor} bgColor={this.config.bgColor}
          textColor={this.config.textColor} borderRadius={0} padding={this.config.padding} stroke={this.config.stroke} text={this.state.text || ''} wrapText={this.config.responsive.wrapText}>
        </Textbox>
      </g>
    );
  }

}

export default heading;