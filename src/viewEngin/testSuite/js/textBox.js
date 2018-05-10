
"use strict";

/**
 * textBox.js 
 * */

import { Component } from "./../../pview";
import Style from "./../../style";

export default class TextBox extends Component {
  constructor(props) {
    super(props);
    this.txtbxUID = 'txtbx-' + Math.round(Math.random() * 100000);
  }

  componentDidMount() {
    this.ref.node.querySelector('.text-area').innerHTML = "<p style='margin: 0 auto; font-size: 20px;'>" + this.props.extChildren +"</p>"; 
  }

  render() {
    return (
      <g class={`text-box ${this.txtbxUID} ${this.props.instanceId || ''}`} transform={`translate(${this.props.posx},${this.props.posy})`}>
        <Style>
          {{
            [".text-box." + this.txtbxUID + " rect:hover"] : {
              "fill":this.props.borderColor
            }
          }}
        </Style>
        <rect x='0' y='0' rx={this.props.borderRadius} width={this.props.width} height={this.props.height} fill={this.props.bgColor} stroke={this.props.borderColor}/>
        <foreignObject class='text-area' x="0" y="0" width={this.props.width} height={this.props.height}></foreignObject>
      </g>
    );
  }

}
