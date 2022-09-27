'use strict';

import { OPTIONS_TYPE } from './../settings/globalEnums';
import defaultConfig from '../settings/config';
import { Component } from '../viewEngin/pview';
import RichTextBox from './richTextBox';
import UtilCore from '../core/util.core';
import UiCore from '../core/ui.core';
const enums = new OPTIONS_TYPE();

/**
 * heading.js
 * @createdOn:20-Jun-2019
 * @author:SmartChartsNXT
 * @description: This components will create heading elements of chart.
 * @extends: Component
 */

class Heading extends Component {
  constructor(props) {
    super(props);
    this.id = UtilCore.getRandomID();
    this.state = {
      text: this.props.opts.text
    };
    this.config = {};
    this.setConfig(this.props);
  }

  setConfig(props) {
    const alignTextMap = { [enums.HORIZONTAL_ALIGN.LEFT]: 'left', [enums.HORIZONTAL_ALIGN.CENTER]: 'center', [enums.HORIZONTAL_ALIGN.RIGHT]: 'right' };
    const headingTypeMap = { h1: '32', h2: '24', h3: '18.72', h4: '16', h5: '13.28', h6: '10.72' };
    this.config = {
      width: UiCore.percentToPixel(this.context.svgWidth, (props.opts.width || props.width)) || this.context.svgWidth - 10,
      height: UiCore.percentToPixel(this.context.svgHeight, props.opts.height),
      style: props.opts.style || '',
      offsetTop: typeof props.opts.top === 'undefined' ? (props.posY || 0) : UiCore.percentToPixel(this.context.svgHeight, props.opts.top),
      offsetLeft: typeof props.opts.left === 'undefined' ? (props.posX || 0) : UiCore.percentToPixel(this.context.svgWidth, props.opts.left),
      fontSize: headingTypeMap[this.props.type] || headingTypeMap['h2'],
      textColor: props.opts.textColor || props.textColor || defaultConfig.theme.fontColorDark,
      textAlign: alignTextMap[props.opts.textAlign] || alignTextMap[props.textAlign] || alignTextMap.center,
      responsive: Object.assign({
        reducer: () => ({ text: props.opts.text })
      }, props.opts.responsive)
    };
    this.config.top = this.config.offsetTop;

    switch (this.config.textAlign) {
      case 'left':
        this.config.left = this.config.offsetLeft;
        break;
      default:
      case 'center':
        this.config.left = (this.context.svgWidth - this.config.width) / 2 + this.config.offsetLeft;
        break;
      case 'right':
        this.config.left = (this.context.svgWidth - this.config.width) + this.config.offsetLeft;
        break;
    }

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
    return (
      <g aria-hidden='true' class={`sc-header-grp-${this.id}`}>
        <RichTextBox class={`sc-header-text-${this.id}`} style={this.config.style} posX={this.config.left} posY={this.config.top} width={this.config.width} height={this.config.height} textAlign={this.config.textAlign}
          fontSize={this.config.fontSize} textColor={this.config.textColor} text={this.state.text || ''} >
        </RichTextBox>
      </g>
    );
  }

}

export default Heading;