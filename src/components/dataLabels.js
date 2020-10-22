'use strict';

import { Component } from './../viewEngin/pview';
import uiCore from './../core/ui.core';
import geomCore from './../core/geom.core';
import defaultConfig from './../settings/config';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import SpeechBox from './../components/speechBox';
import Point from '../core/point';
import StoreManager from './../liveStore/storeManager';
import utilCore from './../core/util.core';


/**
 * dataLabels.js
 * @createdOn: 12-Jul-2020
 * @author:SmartChartsNXT
 * @description: This components will create data labels correspond to data points.
 * @extends Component
 */
class DataLabels extends Component {

  constructor(props) {
    super(props);
    this.store = StoreManager.getStore(this.context.runId);
    this.config = {
      float: ENUMS.FLOAT.TOP,
      classes: [],
      labelOverlap: false,
      textColor: defaultConfig.theme.fontColorDark,
      textOpacity: 1,
      bgColor: defaultConfig.theme.bgColorLight,
      bgOpacity: 0.5,
      borderColor: defaultConfig.theme.bgColorMedium,
      borderWidth: 1,
      borderRadius: 5,
      opacity: 1,
      xPadding: 5,
      yPadding: 5,
      offsetX: 0,
      offsetY: 0,
      shadow: true,
      anchorBaseWidth: 5,
      style: {}
    };
    this.state = {
      labelsData: []
    };
    if(typeof this.store.getValue('labelsData') === 'undefined') {
      this.store.setValue('labelsData', {});
    }
    this.allLabelsData = [];
    let globalLabels = utilCore.deepCopy(this.store.getValue('labelsData'));
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...globalLabels[key]];
      }
    }
    this.resetConfig(this.props.opts);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUnmount() {
    this.store.setValue('labelsData', {[this.props.instanceId]: []});
  }

  propsWillReceive(nextProps) {
    this.state.labelsData = [];
    let globalLabels = utilCore.deepCopy(this.store.getValue('labelsData'));
    this.allLabelsData = [];
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...this.allLabelsData, ...globalLabels[key]];
      }
    }
    this.resetConfig(nextProps.opts);
  }

  resetConfig(config) {
    this.config = {
      ...this.config, ...config
    };
  }

  render() {
    return (
      <g class={['sc-data-label-container', ...this.config.classes].join(' ')} style={{ pointerEvents: 'none' , ...this.config.style}} aria-hidden={true}>
        {this.getLabels()}
      </g>
    );
  }

  getLabels() {
    let labels = [];
    this.props.pointSet.map((point, i) => {
      if(typeof this.props.opts.filter === 'function' && !this.props.opts.filter(point.value, i)) {
        return;
      }
      let label = this.getEachLabel(point, i);
      if(label) {
        labels.push(label);
      }
    });
    this.store.setValue('labelsData', {[this.props.instanceId]: this.state.labelsData});
    return labels;
  }

  getEachLabel(data, index) {
    let labelAlign = 'middle';
    let margin = 20;
    let labelX, labelY;
    switch (this.config.float) {
      default:
      case ENUMS.FLOAT.TOP:
        labelX = data.x + this.config.offsetX;
        labelY = data.y - margin + this.config.offsetY;
        break;
      case ENUMS.FLOAT.BOTTOM:
        labelX = data.x + this.config.offsetX;
        labelY = data.y + margin + this.config.offsetY;
        break;
      case ENUMS.FLOAT.LEFT:
        margin = 10;
        labelX = data.x - margin + this.config.offsetX;
        labelY = data.y + this.config.offsetY;
        labelAlign = 'end';
        break;
      case ENUMS.FLOAT.RIGHT:
        margin = 10;
        labelX = data.x + margin + this.config.offsetX;
        labelY = data.y + this.config.offsetY;
        labelAlign = 'start';
        break;
    }

    let transform = 'translate(' + labelX + ',' + labelY + ')';
    let value = data.value;
    if(typeof this.props.opts.formatter === 'function') {
      value = this.props.opts.formatter(value, index);
    }
    let label =
      <text class={`sc-d-label-${index}`} fill={this.config.textColor} opacity={this.config.textOpacity} stroke='none' transform={transform} text-rendering='geometricPrecision' style={{...this.config.style}}>
        <tspan labelIndex={index} text-anchor={labelAlign} x={0} y={0} dy='0.4em'>
          {value}
        </tspan>
      </text>;
    let labelDim = uiCore.getComputedBBox(label);
    ({labelX, labelY, labelAlign} = this.adjustLabelPosition(label, labelDim, labelX, labelY, labelAlign));
    let speechBoxX, speechBoxY;
    let speechBoxWidth = labelDim.width + (2 * this.config.xPadding);
    let speechBoxHeight = labelDim.height + (2 * this.config.yPadding);
    switch (this.config.float) {
      default:
      case ENUMS.FLOAT.TOP:
      case ENUMS.FLOAT.BOTTOM:
        speechBoxX = labelX - (labelDim.width / 2) - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case ENUMS.FLOAT.LEFT:
        speechBoxX = labelX - (labelDim.width) - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case ENUMS.FLOAT.RIGHT:
        speechBoxX = labelX - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
    }
    let labelData = {
      x: speechBoxX,
      y: speechBoxY,
      width: speechBoxWidth,
      height: speechBoxHeight,
      index
    };
    let isOverlapping = this.checkOverlapping(this.state.labelsData, labelData);
    let isOverlappingGlobal = this.checkOverlapping(this.allLabelsData, labelData);

    if(!this.config.labelOverlap && (isOverlapping || isOverlappingGlobal)) {
      return (null);
    }
    this.state.labelsData.push(labelData);

    return (
      <g class='sc-data-label'>
        <SpeechBox x={speechBoxX} y={speechBoxY} width={speechBoxWidth} height={speechBoxHeight} cpoint={new Point(data.x, data.y)}
          bgColor={this.config.bgColor} fillOpacity={this.config.bgOpacity} shadow={this.config.shadow} strokeColor={this.config.borderColor} strokeWidth={this.config.borderWidth}
          anchorBaseWidth={this.config.anchorBaseWidth} cornerRadius={this.config.borderRadius}>
        </SpeechBox>
        {label}
      </g>
    );
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

export default DataLabels;