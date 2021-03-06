'use strict';

import { Component } from './../viewEngin/pview';

/**
 * custom.icon.js
 * @createdOn:26-Apr-2020
 * @author:SmartChartsNXT
 * @description: Create User defined custom icon from URL.
 */

class CustomIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: this.props.highlighted ? 0.5 : 0
    };
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  afterUpdate() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUpdate(nextProps) {
    if(this.props.highlighted !== nextProps.highlighted) {
      this.state.highlighted = nextProps.highlighted ? 0.5 : 0;
    }
  }

  render() {
    return (
      <g class={`sc-icon-custom-${this.props.id || 0}`} transform={`translate(${(-this.props.width/2)},${(-this.props.height/2)})`}>
        <circle cx={this.props.x + (this.props.width/2)} cy={this.props.y + (this.props.width/2)} r={this.props.width/2} class='sc-outer-highlighter' fill={this.props.fillColor} stroke-width='1' stroke='#fff' fill-opacity={this.state.highlighted} stroke-opacity={this.state.highlighted} style={{ 'transition': 'fill-opacity 0.2s linear' }} > </circle>
        <image x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} href={this.props.URL} />
      </g>
    );
  }

  normalize() {
    this.setState({highlighted : 0});
  }

  highlight() {
    this.setState({highlighted : 0.5});
  }
}

export default CustomIcon;