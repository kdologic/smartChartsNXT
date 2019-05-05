"use strict";

import { Component } from "./../viewEngin/pview";

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
      textBBox: {height:0},
      textWidth: 0
    };
  }

  componentDidMount() {
    this.state.textBBox = this.ref.node.querySelector('text').getBBox();
    if(this.state.textBBox.width > this.state.textWidth) {
      this.setState({textWidth: this.state.textBBox.width});
    }
  }

  render() {
    return (
      <g class={this.props.class} transform={`translate(${this.props.posX},${this.props.posY})`} tabindex="-1">
        <rect x={-((this.state.textWidth/2)+this.props.padding)} y={-((this.state.textBBox.height/2)+this.props.padding)} width={this.state.textWidth+(2*this.props.padding)} height={this.state.textBBox.height+(this.props.padding)} transform={this.props.transform || ""} rx={this.props.borderRadius || 0} opacity='0.7' fill={this.props.background}></rect> 
        <text fill={this.props.fill} transform={this.props.transform || ""} text-rendering='geometricPrecision' text-anchor='middle' font-weight="bold" stroke={this.props.stroke || "none"} stroke-width={this.props.strokeWidth || 1} stroke-linejoin="round" paint-order="stroke">
          <tspan x="0" y="0">{this.props.text}</tspan>
        </text>
      </g>
    );
  }
}

export default TextBox;