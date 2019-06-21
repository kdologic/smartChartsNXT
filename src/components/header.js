"use strict";

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";
import Textbox from "./textBox";
import Style from "./../viewEngin/style";
import UtilCore from "../core/util.core";
import UiCore from "../core/ui.core";

/**
 * header.js
 * @createdOn:20-Jun-2019
 * @author:SmartChartsNXT
 * @description: This components will create header elements of chart. 
 * @extends: Component
 */

class Header extends Component{
  constructor(props) {
    super(props);
    this.id = UtilCore.getRandomID();
    this.config = {};
    this.setConfig(this.props); 
  }

  setConfig(props) {
    this.config = {
      fontFamily: props.opts.fontFamily || props.fontFamily || defaultConfig.theme.fontFamily,
      fontSize: props.opts.fontSize|| props.fontSize || defaultConfig.theme.fontSizeLarge,
      textColor: props.opts.textColor || props.textColor || defaultConfig.theme.fontColorDark,
      stroke: props.opts.borderColor || props.stroke || "none",
      bgColor: props.opts.bgColor || props.bgColor || "none",
      textAnchor: props.opts.textAlign || props.textAlign || "middle",
      padding: props.opts.padding || props.padding || 0,
      maxWidth: props.opts.maxWidth,
      wrapText: props.opts.wrapText || true
      };
  }

  componentWillUpdate(nextProps) {
    this.setConfig(nextProps);
  }

  render() {
    return (
      <g class={`sc-header-grp-${this.id}`}>
        <Style>
          {{
            [`.sc-header-grp-${this.id} .sc-header-text-${this.id} text`]: {
              "font-family": this.config.fontFamily,
              "font-size": this.config.fontSize+'px',
              "fill": this.config.textColor,
              "stroke": this.config.stroke
            }
          }}
        </Style>
        <Textbox class={`sc-header-text-${this.id}`} posX={this.props.posX} posY={this.props.posY} maxWidth={this.config.maxWidth} height={this.props.height} textAnchor={this.config.textAnchor} bgColor={this.config.bgColor} 
          textColor={this.config.textColor} borderRadius={0} padding={this.config.padding} stroke={this.config.stroke} text={this.props.opts.text || ""}>
        </Textbox>
      </g>
    );
  }

  

}

export default Header;