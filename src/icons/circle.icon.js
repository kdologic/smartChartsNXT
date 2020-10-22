'use strict';

import { Component } from './../viewEngin/pview';

/**
 * circle.icon.js
 * @createdOn:24-Apr-2020
 * @author:SmartChartsNXT
 * @description: Create circle icon.
 */

class CircleIcon extends Component {
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
      <g class={`sc-icon-circle-${this.props.id || 0}`}>
        <circle cx={this.props.x} cy={this.props.y} r={this.props.r + 4} class='sc-outer-highlighter' fill={this.props.fillColor} stroke-width='1' stroke='#fff' fill-opacity={this.state.highlighted} stroke-opacity={this.state.highlighted} style={{ 'transition': 'fill-opacity 0.2s linear' }} > </circle>
        <circle cx={this.props.x} cy={this.props.y} r={this.props.r} class='sc-outer-offset' fill={this.props.fillColor} opacity='1' stroke-width='0'> </circle>
        <circle cx={this.props.x} cy={this.props.y} r={this.props.r - 1} class='sc-inner-dot' fill={'#fff'} opacity='1' stroke-width='0'> </circle>
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

export default CircleIcon;