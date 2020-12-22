'use strict';

import { Component } from './../viewEngin/pview';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import RichTextBox from './richTextBox';

/**
 * markRegion.js
 * @createdOn:12-Dec-2020
 * @author:SmartChartsNXT
 * @description: This components will create different color regions behind the grid to highlight significant area with label support.
 */

class MarkRegion extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.config = {
      xRegions: [],
      yRegions: []
    };
    this.setConfig(props);
    this.state = {
      scaleX: 0,
      scaleY: 0
    };
    this.onUpdateScale = this.onUpdateScale.bind(this);
  }

  setConfig(props) {
    let mapFn = (d, i) => ({
      fill: d.color || UtilCore.getColor(i),
      stroke: d.borderColor || 'none',
      opacity: d.opacity || 0.2,
      text: d.label && d.label.text !== undefined ? d.label.text : '',
      fontSize: d.label && d.label.fontSize ? d.label.fontSize : 14,
      fontColor: d.label && d.label.color ? d.label.color : '#000',
      textStyle: d.label && d.label.style ? d.label.style : {}
    });
    let xRegions = props.xMarkRegions.map(mapFn);
    let yRegions = props.yMarkRegions.map(mapFn);
    this.config = { xRegions, yRegions };
  }

  propsWillReceive(nextProps) {
    this.setConfig(nextProps);
  }

  afterMount() {
    this.emitter.on('onUpdateScale', this.onUpdateScale);
  }

  render() {
    return (
      <g class="sc-mark-region" transform={`translate(${this.props.posX},${this.props.posY})`} clip-path={`url(#${this.clipPathId})`} >
        <defs>
          <clipPath id={this.clipPathId}>
            <rect x={0} y={0} width={this.props.width} height={this.props.height} />
          </clipPath>
        </defs>
        {this.getYMarkRegions()}
        {this.getXMarkRegions()}
      </g>
    );
  }

  getYMarkRegions() {
    let scaleY = this.state.scaleY;
    return this.props.yMarkRegions.map((region, i) => {
      region.from = region.from || 0;
      region.to = region.to || 0;
      let valueDiff = Math.abs(region.to - region.from);
      let height = valueDiff * scaleY;
      let config = this.config.yRegions[i];
      return (
        <g>
          <rect class="sc-y-mark-region" x={0} y={(this.props.yInterval.iMax - Math.max(region.from, region.to)) * scaleY} width={this.props.width} height={height} fill={config.fill} stroke={config.stroke} opacity={config.opacity} ></rect>
          {config.text &&
            <RichTextBox class={`sc-y-mark-region-text-${i}`} posX={10} posY={(this.props.yInterval.iMax - Math.max(region.from, region.to)) * scaleY} width={this.props.width} height={height} textAlign={ENUMS.HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={true}
              fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''} >
            </RichTextBox>
          }
        </g>
      );
    });
  }

  getXMarkRegions() {
    let scaleX = this.state.scaleX;
    return this.props.xMarkRegions.map((region, i) => {
      region.from = region.from || 0;
      region.to = region.to || 0;
      let startFrom = Math.min(region.from, region.to) - this.props.leftIndex;
      let valueDiff = Math.abs(region.to - region.from);
      if (startFrom < 0) {
        valueDiff += startFrom;
        startFrom = 0;
        valueDiff = valueDiff < 0 ? 0 : valueDiff;
      }
      let width = valueDiff * scaleX;
      let config = this.config.xRegions[i];
      return (
        <g class="sc-x-mark-region" transform={`translate(${this.props.vTransformX}, 0)`}>
          <rect x={(startFrom - 1) * scaleX} y={0} width={width} height={this.props.height} fill={config.fill} stroke={config.stroke} opacity={config.opacity} ></rect>
          {config.text &&
            <RichTextBox class={`sc-x-mark-region-text-${i}`} posX={(startFrom - 1) * scaleX} posY={10} width={width} height={this.props.height} textAlign={ENUMS.HORIZONTAL_ALIGN.CENTER} verticalAlignMiddle={false}
              fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''} >
            </RichTextBox>
          }
        </g>
      );
    });
  }

  onUpdateScale(e) {
    this.setState({
      scaleX: e.scaleX,
      scaleY: e.scaleY
    });
  }
}

export default MarkRegion;