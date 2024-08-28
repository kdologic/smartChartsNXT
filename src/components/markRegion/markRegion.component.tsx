'use strict';

import { Component } from '../../viewEngin/pview';
import { AXIS_TYPE, HORIZONTAL_ALIGN, VERTICAL_ALIGN } from '../../global/global.enums';
import UtilCore from '../../core/util.core';
import RichTextBox from '../richTextBox/richTextBox.component';
import { IMarkRegionConfig, IMarkRegionProps } from './markRegion.model';
import { IMarkRegion } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import Store from '../../liveStore/store';
import storeManager from '../../liveStore/storeManager';

/**
 * markRegion.component.tsx
 * @createdOn:12-Dec-2020
 * @author:SmartChartsNXT
 * @description: This components will create different color regions behind the grid to highlight significant area with label support.
 */

class MarkRegion extends Component<IMarkRegionProps> {
  private rid: string;
  private clipPathId: string;
  private config: { xRegions: IMarkRegionConfig[], yRegions: IMarkRegionConfig[] };
  private storeData: Store;

  constructor(props: IMarkRegionProps) {
    super(props);
    this.storeData = storeManager.getStore((this as any).context.runId);
    this.rid = UtilCore.getRandomID();
    this.clipPathId = 'sc-clip-' + this.rid;
    this.config = {
      xRegions: [],
      yRegions: []
    };
    this.setConfig(props);
    this.state = {
      xRegionsLabel: {},
      yRegionsLabel: {},
      reRender: false
    };
  }

  setConfig(props: IMarkRegionProps) {
    let mapFn = (oldConfig: IMarkRegionConfig[]) => (d: IMarkRegion, i: number) => {
      let conf: IMarkRegionConfig = {
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
    if (this.state.reRender) {
      this.setState({ reRender: false });
    }
  }

  beforeUpdate(nextProps: IMarkRegionProps) {
    this.setConfig(nextProps);
  }

  afterUpdate() {
    if (this.storeData.getValue('scaleX')) {
      for (let refId in this.state.xRegionsLabel) {
        let xRegion = this.state.xRegionsLabel[refId];
        let textDim = xRegion.textDim = xRegion.obj.getContentDim();
        let xRegionConfig = this.config.xRegions.filter(v => v.refId === refId);
        if (textDim.width > xRegion.width && xRegionConfig.length && xRegionConfig[0].rotateText !== -90) {
          xRegionConfig[0].rotateText = -90;
          this.state.reRender = true;
        } else {
          xRegionConfig[0].rotateText = 0;
        }
      }
      for (let refId in this.state.yRegionsLabel) {
        let yRegion = this.state.yRegionsLabel[refId];
        yRegion.textDim = yRegion.obj.getContentDim();
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
    let scaleY = this.storeData.getValue('scaleY');
    return this.props.yMarkRegions.map((region: IMarkRegion, i: number) => {
      let config = this.config.yRegions[i];
      region.from = region.from || 0;
      region.to = region.to || 0;
      let valueDiff = Math.abs(region.to - region.from);
      let startRegionY = (this.props.yInterval.iMax - Math.max(region.from, region.to)) * scaleY;
      if (this.props.yAxisType === AXIS_TYPE.LOGARITHMIC) {
        valueDiff = Math.abs(Math.log10(region.to) - Math.log10(region.from));
        startRegionY = (Math.log10(this.props.yInterval.iMax) - Math.log10(Math.max(region.from, region.to))) * scaleY;
      }
      let height = valueDiff * scaleY;
      let textHeight = height;
      let textPosY = startRegionY;
      const defaultPosX = 10;
      let textPosX = defaultPosX;
      if (config.refId && this.state.yRegionsLabel[config.refId]) {
        textHeight = (this.state.yRegionsLabel[config.refId].textDim?.height || height);
        this.state.yRegionsLabel[config.refId].width = this.props.width;
        this.state.yRegionsLabel[config.refId].height = height;
        if (region.label.verticalTextAlign === VERTICAL_ALIGN.BOTTOM) {
          textPosY = startRegionY + height;
        } else if (region.label.verticalTextAlign === VERTICAL_ALIGN.TOP) {
          textPosY = startRegionY - textHeight;
        } else {
          textPosY = startRegionY + (height / 2) - (textHeight / 2);
        }
        if (region.label.horizontalTextAlign === HORIZONTAL_ALIGN.CENTER) {
          textPosX = -defaultPosX;
        } else if (region.label.horizontalTextAlign === HORIZONTAL_ALIGN.RIGHT) {
          textPosX = -defaultPosX * 2;
        } else {
          textPosX = defaultPosX;
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
            <RichTextBox class={`sc-y-mark-region-text-${i}`} posX={textPosX} posY={textPosY} width={this.props.width} height={textHeight} textAlign={region.label.horizontalTextAlign || HORIZONTAL_ALIGN.LEFT} verticalAlignMiddle={true}
              fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''}
              onRef={(ref: RichTextBox) => {
                if (ref) {
                  config.refId = ref.contentId;
                  this.state.yRegionsLabel[ref.contentId] = {
                    obj: ref,
                    width: this.props.width,
                    height: height
                  };
                }
              }}
              onDestroyRef={(ref: RichTextBox) => {
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

  getXRegionValueFromIndex(region: IMarkRegion) {
    if (!region.from) {
      region.from = 1
    }
    if (!region.to) {
      region.to = this.props.allCategorySet.length
    }
    if (region.from > region.to) {
      let from = region.from;
      region.from = region.to;
      region.to = from;
    }
    let allCategories = this.props.allCategorySet;
    let startFromPosX = 0;
    let endToPosX = 0;
    const parseAsNumber = this.storeData.getValue('parseAsNumber');
    const xPositionWithDynamicScaleFn = this.storeData.getValue('xPositionWithDynamicScaleFn');
    if (parseAsNumber) {
      if (region.from > allCategories.length || region.to > allCategories.length) {
        return {
          startFromPosX,
          endToPosX
        };
      }
      let extractRegionCategoryValue = (regionIndexValue: number) => {
        let value = 0;
        let regionLowerCategoryValue = allCategories[Math.floor(regionIndexValue) - 1] as number;
        let regionFractionalPart = (regionIndexValue - Math.floor(regionIndexValue));
        if (regionFractionalPart > 0) {
          let regionUpperCategoryValue = allCategories[Math.ceil(regionIndexValue) - 1] as number;
          let valueDiff = regionUpperCategoryValue - regionLowerCategoryValue;
          value = regionLowerCategoryValue + (valueDiff * regionFractionalPart);
        } else {
          value = regionLowerCategoryValue;
        }
        return value;
      }
      let startFromValue = extractRegionCategoryValue(region.from);
      let endToValue = extractRegionCategoryValue(region.to);
      startFromPosX = xPositionWithDynamicScaleFn(region.from, startFromValue);
      endToPosX = xPositionWithDynamicScaleFn(region.to, endToValue);
    } else {
      startFromPosX = xPositionWithDynamicScaleFn(region.from - this.props.leftIndex);
      endToPosX = xPositionWithDynamicScaleFn(region.to - this.props.leftIndex);
    }
    return {
      startFromPosX,
      endToPosX
    };
  }

  getXMarkRegions() {
    return this.props.xMarkRegions.map((region: IMarkRegion, i: number) => {
      const defaultPosY = 10;
      let { startFromPosX, endToPosX } = this.getXRegionValueFromIndex(region);
      let width = endToPosX - startFromPosX;
      let posX = startFromPosX;
      let posY = defaultPosY;
      let textWidth = undefined;
      let textHeight = undefined;
      let config = this.config.xRegions[i];
      if (config.refId && this.state.xRegionsLabel[config.refId]) {
        this.state.xRegionsLabel[config.refId].width = width;
        this.state.xRegionsLabel[config.refId].height = this.props.height;
        textHeight = this.state.xRegionsLabel[config.refId].textDim?.height || 0;
        if (config.rotateText) {
          textWidth = Math.max(width, this.state.xRegionsLabel[config.refId].textDim?.width || 0);
          if (region.label.horizontalTextAlign === HORIZONTAL_ALIGN.CENTER) {
            posX = startFromPosX + (width / 2) + (this.state.xRegionsLabel[config.refId].textDim?.height / 2);
          }
          if (region.label.horizontalTextAlign === HORIZONTAL_ALIGN.RIGHT) {
            posX = startFromPosX + width + this.state.xRegionsLabel[config.refId].textDim?.height;
          }
        }
        switch (region.label.verticalTextAlign) {
          case VERTICAL_ALIGN.CENTER: {
            if (config.rotateText) {
              posY = (this.props.height / 2) - (textWidth / 2);
            } else {
              posY = (this.props.height / 2) - (textHeight / 2);
            }
            break;
          }
          case VERTICAL_ALIGN.BOTTOM: {
            posY = this.props.height - 20;
            break;
          }
          default:
          case VERTICAL_ALIGN.TOP: {
            posY = defaultPosY;
            if (config.rotateText) {
              posY = textWidth;
            }
          }
        }
      }

      return (
        <g class="sc-x-mark-region" transform={`translate(${this.props.vTransformX}, 0)`}>
          <rect x={startFromPosX} y={0} width={width} height={this.props.height} fill={config.fill} stroke={config.stroke} opacity={config.opacity} ></rect>
          {config.text &&
            <RichTextBox class={`sc-x-mark-region-text-${i}`} posX={posX} posY={posY} width={textWidth || width} contentWidth={textWidth} textAlign={region.label.horizontalTextAlign || HORIZONTAL_ALIGN.CENTER}
              verticalAlignMiddle={false} rotation={config.rotateText} fontSize={config.fontSize} textColor={config.fontColor} style={config.textStyle} text={config.text || ''}
              onRef={(ref: RichTextBox) => {
                if (ref) {
                  config.refId = ref.contentId;
                  this.state.xRegionsLabel[ref.contentId] = {
                    obj: ref,
                    width: width,
                    height: this.props.height
                  };
                }
              }}
              onDestroyRef={(ref: RichTextBox) => {
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
}

export default MarkRegion;