"use strict";

import { Component } from "./../viewEngin/pview";
import UiCore from "./../core/ui.core";

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
    this.state = {
      textBBox: {
        height: 0
      },
      textWidth: this.props.width || 0
    };
  }

  componentDidMount() {
    this.state.textBBox = this.ref.node.querySelector('text').getBBox();
    if(this.state.textBBox.width > this.state.textWidth) {
      this.setState({textWidth: this.state.textBBox.width, splitText: true});
    }
  }

  componentWillUpdate(nextProps) {
    if(this.props.width !== nextProps.width) {
      this.state.textWidth = nextProps.width;
    }
  }

  componentDidUpdate() {
    // this.state.textBBox = this.ref.node.querySelector('text').getBBox();
    // if(this.state.textBBox.width > this.state.textWidth) {
    //   this.setState({textWidth: this.state.textBBox.width});
    // }
  }

  render() { 
    return (
      <g class={this.props.class} transform={`translate(${this.props.posX},${this.props.posY})`} tabindex="-1">
        <rect x={-((this.state.textWidth/2)+this.props.padding)} y={-this.props.padding} width={this.state.textWidth + (2*this.props.padding)} height={this.state.textBBox.height+(2 * this.props.padding)} transform={this.props.transform || ""} rx={this.props.borderRadius || 0} opacity={this.props.bgOpacity || 1} fill={this.props.bgColor || 'none'}></rect> 
        { this.getTextNode() }
      </g>
    );
  }

  getTextNode() {
    let splitText = this.state.textBBox.width > this.state.textWidth;
    return (
      <text fill={this.props.textColor} transform={this.props.transform || ''} text-rendering='geometricPrecision' font-weight={this.props.fontWeight || "normal"} stroke={this.props.stroke || "none"} stroke-width={this.props.strokeWidth || 1} stroke-linejoin="round" paint-order="stroke">
        <tspan text-anchor={this.props.textAnchor || 'middle'} x="0" y="0" dominant-baseline="hanging">{this.props.text}</tspan>
      </text>
    );
  }
}

export default TextBox;