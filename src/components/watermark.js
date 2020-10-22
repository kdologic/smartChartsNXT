'use strict';

import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';
import utilCore from './../core/util.core';
import defaultConfig from './../settings/config';

/**
 * watermark.js
 * @createdOn: 05-Jan-2018
 * @author: SmartChartsNXT
 * @description:This is a component class will create watermark area.
 * @extends: Component
 */

class Watermark extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: defaultConfig.theme.fontColorMedium,
      linkIconX: 0,
      linkIconY: -7,
      textWidth: 0,
      highlight: false
    };

    this.titleId = utilCore.getRandomID();
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  afterMount() {
    let textWidth = this.ref.node.querySelector('.watermark-text').getBBox().width;
    if (this.state.textWidth !== textWidth) {
      this.setState({
        linkIconX: textWidth + 5,
        textWidth
      });
    }
  }

  render() {
    return (
      <g class='sc-watermark' transform={`translate(${this.props.posX},${this.props.posY})`}>
        <title id={this.titleId}>{this.props.title}</title>
        <style>
          {this.getStyle()}
        </style>
        <g class='sc-watermark-link' role='link' stroke={this.state.color} fill={this.state.color} style='cursor: pointer;' tabindex='0' arial-labelledby={this.titleId}
          events={{
            click: this.onClick,
            mouseenter: this.onHover,
            mouseleave: this.onMouseLeave,
            focusin: this.onHover,
            focusout: this.onMouseLeave
          }}>
          <rect x={0} y={-8} width={this.state.textWidth + 15} height={10} pointer-events='all' stroke='none' fill='none' fill-opacity='0' />
          <text class='watermark-text' x={0} y={0} text-rendering='geometricPrecision'>
            <tspan text-anchor='start'>{this.props.extChildren}</tspan>
          </text>
          {this.state.highlight &&
            <line x1={0} y1={2} x2={this.state.textWidth + 15} y2={2} fill='none' stroke={this.state.color} stroke-width='1' opacity='1' shape-rendering='optimizeSpeed' />
          }
          <g transform={`translate(${this.state.linkIconX},${this.state.linkIconY}) scale(0.3)`} stroke='none' fill='#000'>
            <path class='sc-redirect-icon' d='M22 14.5v5c0 2.484-2.016 4.5-4.5 4.5h-13A4.502 4.502 0 0 1 0 19.5v-13C0 4.016 2.016 2 4.5 2h11c.281 0 .5.219.5.5v1c0 .281-.219.5-.5.5h-11A2.507 2.507 0 0 0 2 6.5v13C2 20.875 3.125 22 4.5 22h13c1.375 0 2.5-1.125 2.5-2.5v-5c0-.281.219-.5.5-.5h1c.281 0 .5.219.5.5zM28 1v8c0 .547-.453 1-1 1a.99.99 0 0 1-.703-.297l-2.75-2.75L13.36 17.14c-.094.094-.234.156-.359.156s-.266-.063-.359-.156l-1.781-1.781c-.094-.094-.156-.234-.156-.359s.063-.266.156-.359L21.048 4.454l-2.75-2.75a.996.996 0 0 1-.297-.703c0-.547.453-1 1-1h8c.547 0 1 .453 1 1z' />
          </g>
        </g>
      </g>
    );
  }

  onClick() {
    window.open(this.props.link, '_blank');
  }

  onHover() {
    this.setState({ highlight: true, color: defaultConfig.theme.fontColorHighlight });
  }

  onMouseLeave() {
    this.setState({ highlight: false, color: defaultConfig.theme.fontColorMedium });
  }

  getStyle() {
    return (`
      .sc-watermark .watermark-text {
        font-family: ${defaultConfig.theme.fontFamily};
        font-size: ${uiCore.getScaledFontSize(this.props.svgWidth, 20, 10) + 'px'};
        stroke: none;
        stroke-width: 0;
      }
    `);
  }
}

export default Watermark;