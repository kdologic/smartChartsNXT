
"use strict";

/**
 * button.js 
 * */

import { Component } from "./../../pview";
import Style from "./../../style";

class Button extends Component {
  constructor(props) {
    super(props);
    this.btnUID = 'btn-' + Math.round(Math.random() * 100000);
  }

  render() {
    return (
      <g class={`btn ${this.props.instanceId} ${this.btnUID}`} transform={`translate(${this.props.posx},${this.props.posy})`} events={{click: this.props.onClick}}>
        <Style>
          {{
            [".btn." + this.btnUID + " rect:hover"] : {
              "fill":this.props.borderColor
            }
          }}
        </Style>
        <rect x='0' y='0' rx={this.props.borderRadius} width={this.props.width} height={this.props.height} fill={this.props.bgColor} stroke={this.props.borderColor}/>
        {this.props.extChildren}
      </g>
    );
  }

}

export default Button;