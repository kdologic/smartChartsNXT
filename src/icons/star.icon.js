'use strict';

import { Component } from './../viewEngin/pview';

/**
 * star.icon.js
 * @createdOn:25-Apr-2020
 * @author:SmartChartsNXT
 * @description: Create Star Shape icon.
 */

class StarIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: this.props.width == undefined ? 40 : this.props.width + (this.props.width / 10), // increase the width by 10% for better result.
      highlighted: this.props.highlighted ? 0.5 : 0,
      arms: this.props.arms || 7
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
    if (this.props.highlighted !== nextProps.highlighted) {
      this.state.highlighted = nextProps.highlighted ? 0.5 : 0;
    }
  }

  render() {
    return (
      <g class={`sc-icon-star-${this.props.id || 0}`} >
        <polygon points={this.calculateStarPoints(this.props.x, this.props.y, this.state.arms, (this.state.width + 10) / 2, (this.state.width + 10) / 4)} class='sc-outer-highlighter' fill={this.props.fillColor} stroke-width='1' stroke='#fff' fill-opacity={this.state.highlighted} stroke-opacity={this.state.highlighted} style={{ 'transition': 'fill-opacity 0.2s linear' }} />
        <polygon points={this.calculateStarPoints(this.props.x, this.props.y, this.state.arms, this.state.width / 2, this.state.width / 4)} class='sc-outer-offset' fill={this.props.fillColor} opacity='1' stroke-width='0' />
        <polygon points={this.calculateStarPoints(this.props.x, this.props.y, 5, (this.state.width - 2) / 2, (this.state.width - 2) / 4)} class='sc-inner-star' fill={'#fff'} opacity='1' stroke-width='0' />
      </g>
    );
  }

  calculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius) {
    let results = '';
    const angle = Math.PI / arms;
    for (let i = 0; i < 2 * arms; i++) {
      let r = (i & 1) == 0 ? outerRadius : innerRadius;
      let currX = centerX + Math.cos(i * angle) * r;
      let currY = centerY + Math.sin(i * angle) * r;

      if (i == 0) {
        results = currX + ',' + currY;
      } else {
        results += ', ' + currX + ',' + currY;
      }
    }
    return results;
  }

  normalize() {
    this.setState({ highlighted: 0 });
  }

  highlight() {
    this.setState({ highlighted: 0.5 });
  }
}

export default StarIcon;