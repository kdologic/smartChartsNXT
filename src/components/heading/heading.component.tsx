'use strict';

import defaultConfig from '../../settings/config';
import { Component } from '../../viewEngin/pview';
import RichTextBox from '../richTextBox';
import UtilCore from '../../core/util.core';
import UiCore from '../../core/ui.core';
import { HeadingTypeMap, IHeadingConfig, IHeadingProps } from './heading.model';
import { HORIZONTAL_ALIGN } from '../../global/global.enums';
import { IVnode } from '../../viewEngin/component.model';

/**
 * heading.component.tsx
 * @createdOn:20-Jun-2019
 * @author:SmartChartsNXT
 * @description: This components will create heading elements of chart.
 * @extends: Component
 */

class Heading extends Component<IHeadingProps> {
  private config: IHeadingConfig;
  private id: string;

  constructor(props: IHeadingProps) {
    super(props);
    this.id = UtilCore.getRandomID();
    this.state = {
      text: this.props.opts.text
    };
    this.setConfig(this.props);
  }

  setConfig(props: IHeadingProps): void {
    this.config = {
      width: UiCore.percentToPixel((this as any).context.svgWidth, (props.opts.width || props.width) as string) || (this as any).context.svgWidth - 10,
      height: UiCore.percentToPixel((this as any).context.svgHeight, props.opts.height as string),
      style: props.opts.style || {},
      offsetTop: typeof props.opts.top === 'undefined' ? (props.posY || 0) : UiCore.percentToPixel((this as any).context.svgHeight, props.opts.top.toString()),
      offsetLeft: typeof props.opts.left === 'undefined' ? (props.posX || 0) : UiCore.percentToPixel((this as any).context.svgWidth, props.opts.left.toString()),
      fontSize: props.type || HeadingTypeMap.h2,
      textColor: props.opts.textColor || props.textColor || defaultConfig.theme.fontColorDark,
      textAlign: props.opts.textAlign || props.textAlign || HORIZONTAL_ALIGN.CENTER,
      responsive: Object.assign({
        reducer: () => ({ text: props.opts.text })
      }, props.opts.responsive)
    };
    this.config.top = this.config.offsetTop;

    switch (this.config.textAlign) {
      case 'left': {
        this.config.left = this.config.offsetLeft;
        break;
      }
      case 'right':{
        this.config.left = ((this as any).context.svgWidth - this.config.width) + this.config.offsetLeft;
        break;
      }
      case 'center':
      default: {
        this.config.left = ((this as any).context.svgWidth - this.config.width) / 2 + this.config.offsetLeft;
        break;
      }
    }

    let modifiedConfig: {text?: string};
    if (typeof this.config.responsive.reducer === 'function') {
      modifiedConfig = this.config.responsive.reducer((this as any).context.svgWidth, (this as any).context.svgHeight) || {};
      this.state.text = modifiedConfig.text || props.opts.text;
    }
  }

  beforeUpdate(nextProps: IHeadingProps) {
    this.setConfig(nextProps);
  }

  render(): IVnode {
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