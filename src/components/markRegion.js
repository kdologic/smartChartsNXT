'use strict';

import { Component } from './../viewEngin/pview';
import { OPTIONS_TYPE } from './../settings/globalEnums';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import RichTextBox from './richTextBox';
const enums = new OPTIONS_TYPE();

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
      scaleY: 0,
      xRegionsLabel: {},
      yRegionsLabel: {},
      reRender: false
    };
    this.onUpdateScale = this.onUpdateScale.bind(this);
  }

  setConfig(props) {
    let mapFn = (oldConfig) => (d, i) => {
      let conf = {
        fill: d.color || UtilCore.getColor(i),
        stroke: d.borderColor || 'none',
        opacity: d.opacity || 0.2,
        text: d.label && d.label.text !== undefined ? d.label.text : '',
        fontSize: d.label && d.label.fontSize ? d.label.fontSize : 14,
        fontColor: d.label && d.label.color ? d.label.color : '#000',
        textStyle: d.label && d.label.style ? d.label.style : {}
      };
      if (oldConfig[i]) {
        return { ...oldConfig[i], ...conf };
      }
      return conf;
    };
    let xRegions = props.xMarkRegions.map(mapFn(this.config.xRegions));
    let yRegions = props.yMarkRegions.map(mapFn(this.config.yRegions));
    this.config = { xRegions, yRegions };
  }

  afterMount() {
    this.emitter.on('onUpdateScale', this.onUpdateScale);
    if (this.state.reRender) {
      this.setState({ reRender: false });
    }
  }

  beforeUpdate(nextProps) {
    this.setConfig(nextProps);
  }

  afterUpdate() {
    if (this.state.scaleX) {
      for (let refId in this.state.xRegionsLabel) {
        let xRegion = this.state.xRegionsLabel[refId];
        let textDim = xRegion.textDim = xRegion.obj.getContentDim();
        let xRegionConfig = this.config.xRegions.filter(v => v.refId === refId);
        if (textDim.width > xRegion.width && xRegionConfig.length && xRegionConfig[0].rotateText != -90) {
          xRegionConfig[0].rotateText = -90;
          this.state.reRender = true;
        } else {
          xRegionConfig[0].rotateText = 0;
        }
      }
      for (let refId in this.state.yRegionsLabel) {
        let yRegion = this.state.yRegionsLabel[refId];
        let textDim = yRegion.textDim = yRegion.obj.getContentDim();
        let yRegionConfig = this.config.yRegions.filter(v => v.refId === refId);
        if (yRegionConfig.length && yRegionConfig[0].moveTextOutside != 1) {
          if (textDim.height > yRegion.height || (yRegion.posY < 0 && (yRegion.posY + yRegion.height) > 0)) {
            yRegionConfig[0].moveTextOutside = 1;
            this.state.reRender = true;
          } else {
            yRegionConfig[0].moveTextOutside = 0;
          }
        } else {
          yRegionConfig[0].moveTextOutside = 0;
        }
      }
      if (this.state.reRender) {
        this.setState({ reRender: false });
      }
    }
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
      let startRegionY = (this.props.yInterval.iMax - Math.max(region.from, region.to)) * scaleY;
      if (this.props.yAxisType === enums.AXIS_TYPE.LOGARITHMIC) {
        valueDiff = Math.abs(Math.log10(region.to) - Math.log10(region.from));
        startRegionY = (Math.log10(this.props.yInterval.iMax) - Math.log10(Math.max(region.from, region.to))) * scaleY;
      }
      let height = valueDiff * scaleY;
      let textHeight = height;
      let textPosY = startRegionY;
      let textPosX = 10;
      let config = this.config.yRegions[i];
      if (config.refId && this.state.yRegionsLabel[config.refId]) {
        this.state.yRegionsLabel[config.refId].width = this.props.width;
        this.state.yRegionsLabel[config.refId].height = height;
        if (config.moveTextOutside == 1) {
          textPosY -= this.state.yRegionsLabel[config.refId].textDim.height;
          textHeight = this.state.yRegionsLabel[config.refId].textDim.height;
          if (textPosY < 0) {
            textPosY = startRegionY + height;
            textHeight = this.state.yRegionsLabel[config.refId].textDim.height;
          }
        }
        this.state.yRegionsLabel[config.refId].posX = textPosX;
        this.state.yRegionsLabel[config.refId].posY = textPosY;
        if (textPosY < 0 && (textPosY + height > 0)) {
          this.state.reRender = true;
        } else {
          this.state.reRender = false;
        }
      }
      return (
        <g>
          <rect class="sc-y-mark-region" x={0} y={startRegionY} width={this.props.width} height={height} fill={config.fill} stroke={config.stroke} opacity={config.opacity} ></rect>
          {config.text &&
            <RichTextBox class={`sc-y-mark-region-text-${i}`} posX={textPosX} posY={textPosY} width={this.props.width} height={textHeight} textAlign={enums.HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={true}
              fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''}
              onRef={(ref) => {
                if (ref) {
                  config.refId = ref.contentId;
                  this.state.yRegionsLabel[ref.contentId] = {
                    obj: ref,
                    width: this.props.width,
                    height: height
                  };
                }
              }}
              onDestroyRef={(ref) => {
                if (ref) {
                  delete config.refId;
                  delete this.state.yRegionsLabel[ref.contentId];
                }
              }}>
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
      let posY = 10;
      let textWidth = undefined;
      let config = this.config.xRegions[i];
      if (config.refId && this.state.xRegionsLabel[config.refId]) {
        this.state.xRegionsLabel[config.refId].width = width;
        this.state.xRegionsLabel[config.refId].height = this.props.height;
        if (config.rotateText) {
          textWidth = Math.max(width, this.state.xRegionsLabel[config.refId].textDim.width);
          posY = this.state.xRegionsLabel[config.refId].textDim.width;
        }
      }

      return (
        <g class="sc-x-mark-region" transform={`translate(${this.props.vTransformX}, 0)`}>
          <rect x={(startFrom - 1) * scaleX} y={0} width={width} height={this.props.height} fill={config.fill} stroke={config.stroke} opacity={config.opacity} ></rect>
          {config.text &&
            <RichTextBox class={`sc-x-mark-region-text-${i}`} posX={(startFrom - 1) * scaleX} posY={posY} width={textWidth || width} contentWidth={textWidth} textAlign={enums.HORIZONTAL_ALIGN.CENTER} verticalAlignMiddle={false}
              rotation={config.rotateText} fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''}
              onRef={(ref) => {
                if (ref) {
                  config.refId = ref.contentId;
                  this.state.xRegionsLabel[ref.contentId] = {
                    obj: ref,
                    width: width,
                    height: this.props.height
                  };
                }
              }}
              onDestroyRef={(ref) => {
                if (ref) {
                  delete config.refId;
                  delete this.state.xRegionsLabel[ref.contentId];
                }
              }}>
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