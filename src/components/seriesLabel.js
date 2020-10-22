'use strict';

import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';
import defaultConfig from './../settings/config';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import Point from '../core/point';
import StoreManager from './../liveStore/storeManager';
import utilCore from './../core/util.core';
import geomCore from './../core/geom.core';
import ConnectorBox from './connectorBox';


/**
 * seriesLabel.js
 * @createdOn: 16-Aug-2020
 * @author:SmartChartsNXT
 * @description: This components will create series label corresponding to each series.
 * @extends Component
 */
class SeriesLabel extends Component {

  constructor(props) {
    super(props);
    this.store = StoreManager.getStore(this.context.runId);
    this.config = {
      classes: [],
      labelOverlap: false,
      textOnly: false,
      showConnectorLine: true,
      textColor: this.props.textColor || defaultConfig.theme.fontColorDark,
      textOpacity: 1,
      bgColor: defaultConfig.theme.bgColorLight,
      bgOpacity: 0.5,
      borderColor: this.props.borderColor || defaultConfig.theme.bgColorMedium,
      borderWidth: 1,
      borderRadius: 5,
      opacity: 1,
      xPadding: 5,
      yPadding: 5,
      defaultMargin: 20,
      shadow: true,
      style: {}
    };
    this.state = {
      labelsData: []
    };
    let allPointsSet = this.store.getValue('pointsData');
    this.pointSet = [];
    for(let key in allPointsSet) {
      if(key === this.props.seriesId) {
        this.pointSet = [...allPointsSet[key]];
      }
    }
    this.allLabelsData = [];
    let globalLabels = utilCore.deepCopy(this.store.getValue('seriesLabelData'));
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...globalLabels[key]];
      }
    }
    this.resetConfig(this.props);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUnmount() {
    this.store.setValue('seriesLabelData', {[this.props.instanceId]: []});
  }

  propsWillReceive(nextProps) {
    this.state.labelsData = [];
    let allPointsSet = this.store.getValue('pointsData');
    this.pointSet = [];
    for(let key in allPointsSet) {
      if(key === this.props.seriesId) {
        this.pointSet = [...allPointsSet[key]];
      }
    }
    let globalLabels = utilCore.deepCopy(this.store.getValue('seriesLabelData'));
    this.allLabelsData = [];
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...this.allLabelsData, ...globalLabels[key]];
      }
    }
    this.resetConfig(nextProps);
  }

  resetConfig(props) {
    this.config = {
      ...this.config,
      ...{textColor : props.textColor, borderColor: props.borderColor},
      ...props.opts
    };
  }

  render() {
    return (
      <g class={['sc-series-label-container', ...this.config.classes].join(' ')} transform={`translate(${this.props.posX}, ${this.props.posY})`} style={{ pointerEvents: 'none' , ...this.config.style}}>
        {this.pointSet instanceof Array && this.pointSet.length && this.getLabel() }
      </g>
    );
  }

  getLabel() {
    let labels = [];
    let index = this.pointSet.length - 1;
    let point = this.pointSet[index];
    let label = this.getSingleLabel(index, point, point, ENUMS.FLOAT.TOP);

    if(label) {
      labels.push(label);
    }
    this.store.setValue('seriesLabelData', {[this.props.instanceId]: this.state.labelsData});
    return labels;
  }

  getSingleLabel(index, data, anchorPoint, float) {
    let { labelX, labelY, labelAlign } = this.calculateLabelPosition(data, float);
    let transform = 'translate(' + labelX + ',' + labelY + ')';
    let value = this.props.seriesName;
    let label =
      <text class={`sc-d-label-${index}`} fill={this.config.textColor} opacity={this.config.textOpacity} stroke='none' transform={transform} text-rendering='geometricPrecision' font-size={12} font-weight="bold" style={{...this.config.style}}>
        <tspan labelIndex={index} text-anchor={labelAlign} x={0} y={0} dy='0.4em'>
          {value}
        </tspan>
      </text>;
    let labelDim = uiCore.getComputedBBox(label);
    ({labelX, labelY, labelAlign} = this.adjustLabelPosition(label, labelDim, labelX, labelY, labelAlign));

    let connectorBoxWidth = labelDim.width + (2 * this.config.xPadding);
    let connectorBoxHeight = labelDim.height + (2 * this.config.yPadding);
    if(this.config.textOnly) {
      connectorBoxWidth = labelDim.width;
      connectorBoxHeight = labelDim.height;
      this.config.xPadding = this.config.yPadding = 0;
      this.config.bgColor = 'none';
      this.config.bgOpacity = 0;
      this.config.borderColor = 'none';
      this.config.borderWidth = 0;
    }
    let connectorBoxX, connectorBoxY;
    switch (float) {
      default:
      case ENUMS.FLOAT.TOP:
      case ENUMS.FLOAT.BOTTOM:
        connectorBoxX = labelX - (labelDim.width / 2) - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case ENUMS.FLOAT.LEFT:
        connectorBoxX = labelX - (labelDim.width) - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case ENUMS.FLOAT.RIGHT:
        connectorBoxX = labelX - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
    }
    let labelData = {
      x: connectorBoxX,
      y: connectorBoxY,
      width: connectorBoxWidth,
      height: connectorBoxHeight,
      index
    };
    let isOverlappingGlobal = this.checkOverlapping(this.allLabelsData, labelData);
    if(!this.config.labelOverlap && isOverlappingGlobal) {
      if(float === ENUMS.FLOAT.TOP) {
        return this.getSingleLabel(index, data, anchorPoint, ENUMS.FLOAT.BOTTOM);
      }else if(float === ENUMS.FLOAT.BOTTOM && this.pointSet[index-1]) {
        return this.getSingleLabel(index - 1, this.pointSet[index-1], anchorPoint, ENUMS.FLOAT.TOP);
      }
    }
    this.state.labelsData.push(labelData);
    if(anchorPoint.x > this.props.clip.x + this.props.clip.width) {
      anchorPoint = this.pointSet[index - 1];
    }

    return (
      <g class='sc-data-label'>
        <ConnectorBox x={connectorBoxX} y={connectorBoxY} width={connectorBoxWidth} height={connectorBoxHeight} cpoint={new Point(anchorPoint.x, anchorPoint.y)}
          bgColor={this.config.bgColor} fillOpacity={this.config.bgOpacity} shadow={this.config.shadow} strokeColor={this.config.borderColor} strokeWidth={this.config.borderWidth}
          cornerRadius={this.config.borderRadius} showConnectorLine={this.config.showConnectorLine}>
        </ConnectorBox>
        {label}
      </g>
    );
  }

  calculateLabelPosition(data, float) {
    let labelAlign = 'middle';
    let marginX= 40, marginY = 20;
    if(!this.config.showConnectorLine) {
      marginX = 10;
      marginY = 5;
    }
    let labelX, labelY;
    switch (float) {
      default:
      case ENUMS.FLOAT.TOP:
        labelX = data.x - marginX;
        labelY = data.y - marginY;
        break;
      case ENUMS.FLOAT.BOTTOM:
        labelX = data.x - marginX;
        labelY = data.y + marginY;
        break;
      case ENUMS.FLOAT.LEFT:
        marginX = 10;
        labelX = data.x - marginX;
        labelY = data.y;
        labelAlign = 'end';
        break;
      case ENUMS.FLOAT.RIGHT:
        marginX = 10;
        labelX = data.x + marginX;
        labelY = data.y;
        labelAlign = 'start';
        break;
    }
    return {labelX, labelY, labelAlign};
  }

  adjustLabelPosition(label, labelDim, labelX, labelY, labelAlign) {
    if(labelX - (labelDim.width/2) < this.config.xPadding + this.props.clip.x) {
      labelX = this.config.xPadding + this.props.clip.x + (labelDim.width/2) + this.config.borderWidth;
    }
    if(labelX + (labelDim.width/2) >  this.props.clip.x + this.props.clip.width) {
      labelX = labelX - (labelX + (labelDim.width/2) - (this.props.clip.x + this.props.clip.width)) - this.config.borderWidth - this.config.xPadding;
    }
    if(labelY - (labelDim.height/2) < this.config.yPadding + this.props.clip.y ) {
      labelY = (labelDim.height/2) + this.config.yPadding + this.props.clip.y + this.config.borderWidth;
    }
    if(labelY + (labelDim.height/2) + this.config.yPadding  >  this.props.clip.height ) {
      labelY = labelY - (labelY + (labelDim.height/2) + this.config.yPadding + this.config.borderWidth - this.props.clip.height);
    }
    label.attributes.transform = 'translate(' + labelX + ',' + labelY + ')';
    label.children[0].attributes['text-anchor'] = labelAlign;
    return {labelX, labelY, labelAlign};
  }

  checkOverlapping(existingLabels, label) {
    for (let i = 0; i < existingLabels.length; i++) {
      let existingLabel = existingLabels[i];
      if(geomCore.isRectOverlapping(existingLabel, label)) {
        return true;
      }
    }
    return false;
  }
}

export default SeriesLabel;