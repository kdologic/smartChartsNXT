'use strict';

import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import UtilCore from '../../core/util.core';
import defaultConfig from '../../settings/config';
import { IWatermarkProps } from './watermark.model';
import { IVnode } from '../../viewEngin/component.model';

/**
 * watermark.component.tsx
 * @createdOn: 05-Jan-2018
 * @author: SmartChartsNXT
 * @description:This is a component class will create watermark area.
 * @extends: Component
 */

class Watermark extends Component<IWatermarkProps> {
  private titleId: string;

  constructor(props: IWatermarkProps) {
    super(props);
    this.state = {
      color: defaultConfig.theme.fontColorMedium,
      linkIconX: -35,
      linkIconY: -31,
      highlight: false
    };

    this.titleId = UtilCore.getRandomID();
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  render(): IVnode {
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
          <rect x={0} y={0} width={30} height={30} pointer-events='all' stroke='none' fill='none' fill-opacity='0' />
          <g transform={`translate(${this.state.linkIconX},${this.state.linkIconY}) scale(0.2)`} stroke="none" fill='#000'>
            <path class={this.state.highlight ? 'active' : 'inactive'} d="M 242.054 160.253 C 239.722 160.872 237.472 162.626 236.254 164.794 C 234.953 167.044 235.015 164.505 235.015 209.381 C 235.015 236.339 235.077 250.665 235.222 251.387 C 236.171 256.341 241.084 259.83 246.038 259.025 C 250.063 258.385 253.263 255.247 253.985 251.284 C 254.274 249.674 254.295 169.665 254.006 167.89 C 253.572 165.248 251.653 162.482 249.361 161.161 C 247.277 159.964 244.428 159.613 242.054 160.253 Z" stroke="none" style="fill: rgb(92, 225, 230);"></path>
            <path class={this.state.highlight ? 'active' : 'inactive'} d="M 271.696 183.268 C 270.375 183.578 268.744 184.445 267.671 185.415 C 264.327 188.429 263.543 193.073 265.669 197.305 C 265.854 197.697 271.139 203.147 277.393 209.422 L 288.788 220.816 L 277.311 232.334 C 267.341 242.325 265.772 243.997 265.297 245.009 C 264.471 246.804 264.265 247.878 264.368 249.983 C 264.43 251.573 264.554 252.109 265.111 253.286 C 267.382 258.137 273.182 260.242 277.951 257.951 C 279.169 257.353 280.655 255.949 294.299 242.305 C 310.957 225.688 310.4 226.348 311.102 222.901 C 311.7 219.929 311.267 217.41 309.76 215.078 C 309.43 214.541 302.515 207.502 294.423 199.431 C 283.421 188.47 279.437 184.631 278.652 184.218 C 276.63 183.165 273.802 182.773 271.696 183.268 Z" stroke="none" style="fill: rgb(255, 145, 77);"></path>
            <path class={this.state.highlight ? 'active' : 'inactive'} d="M 213.61 198.853 C 212.103 199.266 210.224 200.422 209.192 201.557 C 208.717 202.115 207.995 203.25 207.582 204.096 L 206.839 205.644 L 206.839 228.867 L 206.839 252.089 L 207.603 253.637 C 209.006 256.486 211.731 258.529 214.848 259.045 C 217.573 259.499 220.607 258.509 222.754 256.486 C 224.096 255.206 224.797 254.112 225.334 252.378 C 225.706 251.181 225.726 250.087 225.726 228.867 C 225.726 207.172 225.726 206.594 225.314 205.273 C 224.302 201.97 221.577 199.452 218.337 198.75 C 216.892 198.44 214.951 198.482 213.61 198.853 Z" stroke="none" style="fill: rgb(0, 151, 178);"></path>
            <path class={this.state.highlight ? 'active' : 'inactive'} d="M 188.488 238.176 C 186.176 238.733 183.472 241.004 182.378 243.357 C 181.243 245.793 181.078 249.963 181.986 252.687 C 183.472 257.064 187.952 259.768 192.472 259.025 C 196.27 258.405 199.532 255.33 200.316 251.614 C 200.646 250.045 200.605 246.516 200.234 245.112 C 199.367 241.768 196.951 239.229 193.752 238.279 C 192.534 237.928 189.809 237.867 188.488 238.176 Z" stroke="none" style="fill: rgb(26, 85, 96);"></path>
            <path d="M 188.282 267.694 C 186.238 268.169 184.669 270.213 184.649 272.359 C 184.649 274.196 185.557 275.807 187.105 276.715 L 188.055 277.272 L 244.511 277.272 C 297.519 277.272 301.008 277.251 301.606 276.921 C 305.281 274.919 305.281 269.985 301.606 268.024 L 300.76 267.57 L 244.923 267.529 C 211.236 267.529 188.757 267.591 188.282 267.694 Z" stroke="none" style="fill: rgb(255, 49, 49);"></path>
          </g>
        </g>
      </g>
    );
  }

  onClick(): void {
    window.open(this.props.link, '_blank');
  }

  onHover(): void {
    this.setState({ highlight: true, color: defaultConfig.theme.fontColorHighlight });
  }

  onMouseLeave(): void {
    this.setState({ highlight: false, color: defaultConfig.theme.fontColorMedium });
  }

  getStyle(): string {
    return (`
      .sc-watermark .sc-watermark-link path.inactive {
        font-family: ${defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.props.svgWidth, 20, 10) + 'px'};
        stroke: #666;
        fill: none !important;
      }
    `);
  }
}

export default Watermark;