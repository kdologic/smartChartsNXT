'use strict';

import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import GeomCore from '../../core/geom.core';
import defaultConfig from '../../settings/config';
import SpeechBox from '../../components/speechBox/speechBox.components';
import Point, { DataPoint } from '../../core/point';
import StoreManager from '../../liveStore/storeManager';
import UtilCore from '../../core/util.core';
import { IDataLabelConfig, IDataLabelData, IDataLabelsProps } from './dataLabels.model';
import Store from '../../liveStore/store';
import { FLOAT, TEXT_ANCHOR } from '../../settings/globalEnums';
import { IDataLabel } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import { IVnode } from '../../viewEngin/component.model';

/**
 * dataLabels.component.tsx
 * @createdOn: 12-Jul-2020
 * @author:SmartChartsNXT
 * @description: This components will create data labels correspond to data points.
 * @extends Component
 */
class DataLabels extends Component<IDataLabelsProps> {
  private store: Store;
  private config: IDataLabelConfig;
  private allLabelsData: IDataLabelData[];

  constructor(props: IDataLabelsProps) {
    super(props);
    this.store = StoreManager.getStore((this as any).context.runId);
    this.config = {
      float: FLOAT.TOP,
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
    let globalLabels = UtilCore.deepCopy(this.store.getValue('labelsData'));
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...globalLabels[key]];
      }
    }
    this.resetConfig(this.props.opts);
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUnmount(): void {
    this.store.setValue('labelsData', {[this.props.instanceId]: []});
  }

  propsWillReceive(nextProps: IDataLabelsProps): void {
    this.state.labelsData = [];
    let globalLabels: {[key: string]: IDataLabelData[]} = UtilCore.deepCopy(this.store.getValue('labelsData'));
    this.allLabelsData = [];
    for(let key in globalLabels) {
      if(key !== this.props.instanceId) {
        this.allLabelsData = [...this.allLabelsData, ...globalLabels[key]];
      }
    }
    this.resetConfig(nextProps.opts);
  }

  resetConfig(config: IDataLabel): void {
    this.config = {
      ...this.config, ...config
    };
  }

  render(): IVnode {
    return (
      <g class={['sc-data-label-container', ...this.config.classes].join(' ')} style={{ pointerEvents: 'none' , ...this.config.style}} aria-hidden={true}>
        {this.getLabels()}
      </g>
    );
  }

  getLabels(): IVnode[] {
    let labels: IVnode[] = [];
    this.props.pointSet.forEach((point: DataPoint, i: number) => {
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

  getEachLabel(data: DataPoint, index: number) {
    let labelAlign: TEXT_ANCHOR =  TEXT_ANCHOR.MIDDLE;
    let margin: number = 20;
    let labelX: number;
    let labelY: number;
    switch (this.config.float) {
     
      case FLOAT.BOTTOM:
        labelX = data.x + this.config.offsetX;
        labelY = data.y + margin + this.config.offsetY;
        break;
      case FLOAT.LEFT:
        margin = 10;
        labelX = data.x - margin + this.config.offsetX;
        labelY = data.y + this.config.offsetY;
        labelAlign = TEXT_ANCHOR.END;
        break;
      case FLOAT.RIGHT:
        margin = 10;
        labelX = data.x + margin + this.config.offsetX;
        labelY = data.y + this.config.offsetY;
        labelAlign = TEXT_ANCHOR.START;
        break;
      case FLOAT.TOP:
      default:
        labelX = data.x + this.config.offsetX;
        labelY = data.y - margin + this.config.offsetY;
        break;
    }

    let transform = 'translate(' + labelX + ',' + labelY + ')';
    let value: number | string = data.value;
    if(typeof this.props.opts.formatter === 'function') {
      value = this.props.opts.formatter(value, index);
    }
    let label =
      <text class={`sc-d-label-${index}`} fill={this.config.textColor} opacity={this.config.textOpacity} stroke='none' transform={transform} text-rendering='geometricPrecision' style={{...this.config.style}}>
        <tspan labelIndex={index} text-anchor={labelAlign} x={0} y={0} dy='0.4em'>
          {value}
        </tspan>
      </text>;
    let labelDim: DOMRect = UiCore.getComputedBBox(label);
    ({labelX, labelY} = this.adjustLabelPosition(label, labelDim, labelX, labelY, labelAlign));
    let speechBoxX, speechBoxY;
    let speechBoxWidth = labelDim.width + (2 * this.config.xPadding);
    let speechBoxHeight = labelDim.height + (2 * this.config.yPadding);
    switch (this.config.float) {
      case FLOAT.LEFT:
        speechBoxX = labelX - (labelDim.width) - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case FLOAT.RIGHT:
        speechBoxX = labelX - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      case FLOAT.TOP:
      case FLOAT.BOTTOM:
      default:
        speechBoxX = labelX - (labelDim.width / 2) - this.config.xPadding;
        speechBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
    }
    let labelData: IDataLabelData = {
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

  adjustLabelPosition(label: IVnode, labelDim: DOMRect, labelX: number, labelY: number, labelAlign: TEXT_ANCHOR): {labelX: number, labelY: number, labelAlign: TEXT_ANCHOR}  {
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
    (label.children[0] as IVnode).attributes['text-anchor'] = labelAlign;
    return {labelX, labelY, labelAlign};
  }

  checkOverlapping(existingLabels: IDataLabelData[], label: IDataLabelData) {
    for (let existingLabel of existingLabels) {
      if(GeomCore.isRectOverlapping(existingLabel, label)) {
        return true;
      }
    }
    return false;
  }
}

export default DataLabels;