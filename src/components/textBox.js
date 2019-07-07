'use strict';

import { Component } from './../viewEngin/pview';
import UiCore from './../core/ui.core';
import Style from './../viewEngin/style';

/**
 * textBox.js
 * @createdOn:04-May-2019
 * @author:SmartChartsNXT
 * @description: This components will create a text box area. 
 * @extends: Component
 */

class TextBox extends Component{
  constructor(props) {
    super(props);
    this.state = {};
    this.initState();
  }

  initState() {
    this.state = {
      text: this.props.text,
      textBBox: {
        width: this.props.width || 0,
        height: this.props.height|| 0
      },
      textWidth: 0,
      textHeight: 0,
      lineHeight: 0,
      splitText: false,
      textAnchor: this.props.textAnchor || 'middle'
    };
  }

  componentDidMount() {
    this.processAfterRender();
  }

  componentDidUpdate() {
    this.processAfterRender();
  }

  processBeforeRender() {
    this.state.text = this.props.text; 
    const textBBox = UiCore.getComputedTextBBox(this.getTextNode([this.state.text]));
    this.state.textWidth = textBBox.width; 
    this.state.lineHeight = textBBox.height;
    this.state.splitText = textBBox.width > this.props.width && this.props.wrapText;
    this.state.textBBox.width = this.props.width || textBBox.width + (2 * this.props.padding || 0);
    this.state.textBBox.height = this.props.height || textBBox.height + (2 * this.props.padding || 0);
  }

  processAfterRender() {
    const textNode = this.state.splitText ? this.getSplittedTextNode() : this.getTextNode([this.state.text]);
    const textBBox = UiCore.getComputedTextBBox(textNode);
    this.state.textBBox.width = this.props.width || textBBox.width + (2 * this.props.padding || 0);
    this.state.textBBox.height = this.props.height || textBBox.height + (2 * this.props.padding || 0);
    const bgRect = this.ref.node.querySelector('.sc-textbox-bg');
    if(bgRect) {
      bgRect.setAttribute('width', this.state.textBBox.width);
      bgRect.setAttribute('height', this.state.textBBox.height);
    }
  }


  render() {
    this.processBeforeRender();
    let textNode = this.state.splitText ? this.getSplittedTextNode() : this.getTextNode([this.state.text]);
    return (
      <g transform={`translate(${this.props.posX},${this.props.posY}) ${this.props.transform || ''}`} tabindex='-1'>
          <rect class='sc-textbox-bg' x={ (this.state.textAnchor === 'middle' ? -(this.state.textBBox.width/2) : 0) } y={0} 
            width={this.state.textBBox.width} height={this.state.textBBox.height} 
            rx={this.props.borderRadius || 0} opacity={this.props.bgOpacity || 1} fill={this.props.bgColor || 'none'}>
          </rect>
        { textNode }
      </g>
    );
  }

  getSplittedTextNode() {
    let lines = this.splitText(this.state.text);
    return this.getTextNode(lines);
  }

  getTextNode(lines) {
    return (
      <g>
        {this.props.style && 
          <Style>
            {this.props.style}
          </Style>
        }
        <text class={this.props.class || ''} fill={this.props.textColor} text-rendering='geometricPrecision' font-weight={this.props.fontWeight || 'normal'} stroke={this.props.stroke || 'none'} stroke-width={this.props.strokeWidth || 1} stroke-linejoin='round' paint-order='stroke'>
          {lines.map((line, i) => <tspan text-anchor={this.state.textAnchor || 'middle'} x={0} y={this.props.padding + (i * this.state.lineHeight)} dy={1} dominant-baseline='hanging'>{line}</tspan>)}
        </text>
      </g>
    );
  }
  
  splitText(txt = '') {
    let words = txt.split(/(\s+)/).filter( e => e.trim().length > 0);
    let lines = [], line=[]; 
    for(let w of words) {
      let textWidth = UiCore.getComputedTextWidth(this.getTextNode([line.concat(w).join(' ')]));
      if (textWidth > this.state.textBBox.width) {
        lines.push(line.join(' '));
        line = [w]; 
      }else {
        line.push(w);
      }
    }
    lines.push(line.join(' '));
    return lines;
  }

}

export default TextBox;