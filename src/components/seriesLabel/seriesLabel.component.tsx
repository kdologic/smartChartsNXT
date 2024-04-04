'use strict';

import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import defaultConfig from '../../settings/config';
import Point, { DataPoint } from '../../core/point';
import StoreManager from '../../liveStore/storeManager';
import UtilCore from '../../core/util.core';
import GeomCore from '../../core/geom.core';
import ConnectorBox from '../connectorBox/connectorBox.component';
import { ISeriesLabelProps } from './seriesLabel.model';
import Store from '../../liveStore/store';
import { ISeriesLabelConfig } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import Rect from '../../core/rect';
import { IVnode } from '../../viewEngin/component.model';
import { FLOAT, TEXT_ANCHOR } from '../../global/global.enums';

/**
 * seriesLabel.component.tsx
 * @createdOn: 16-Aug-2020
 * @author:SmartChartsNXT
 * @description: This components will create series label corresponding to each series.
 * @extends Component
 */
class SeriesLabel extends Component<ISeriesLabelProps> {
  private store: Store;
  private config: ISeriesLabelConfig;
  private pointSet: DataPoint[];
  private allLabelsData: Rect[];

  constructor(props: ISeriesLabelProps) {
    super(props);
    this.store = StoreManager.getStore((this as any).context.runId);
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
      xPadding: 5,
      yPadding: 5,
      shadow: true,
      style: {}
    };
    this.state = {
      labelsData: []
    };
    const allPointsSet: { [key: string]: DataPoint[] } = this.store.getValue('pointsData');
    this.pointSet = [];
    for (let key in allPointsSet) {
      if (key === this.props.seriesId) {
        this.pointSet = [...allPointsSet[key]];
      }
    }
    this.allLabelsData = [];
    const globalLabels: { [key: string]: Rect[] } = UtilCore.deepCopy(this.store.getValue('seriesLabelData'));
    for (let key in globalLabels) {
      if (key !== this.props.instanceId) {
        this.allLabelsData = [...globalLabels[key]];
      }
    }
    this.resetConfig(this.props);
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUnmount(): void {
    this.store.setValue('seriesLabelData', { [this.props.instanceId]: [] });
  }

  propsWillReceive(nextProps: ISeriesLabelProps): void {
    this.state.labelsData = [];
    const allPointsSet: { [key: string]: DataPoint[] } = this.store.getValue('pointsData');
    this.pointSet = [];
    for (let key in allPointsSet) {
      if (key === this.props.seriesId) {
        this.pointSet = [...allPointsSet[key]];
      }
    }
    const globalLabels: { [key: string]: Rect[] } = UtilCore.deepCopy(this.store.getValue('seriesLabelData'));
    this.allLabelsData = [];
    for (let key in globalLabels) {
      if (key !== this.props.instanceId) {
        this.allLabelsData = [...this.allLabelsData, ...globalLabels[key]];
      }
    }
    this.resetConfig(nextProps);
  }

  resetConfig(props: ISeriesLabelProps): void {
    this.config = {
      ...this.config,
      ...{ textColor: props.textColor, borderColor: props.borderColor },
      ...props.opts
    };
  }

  render(): IVnode {
    const hasPoint = this.pointSet instanceof Array && this.pointSet.length;
    return (
      <g class={['sc-series-label-container', ...this.config.classes].join(' ')} transform={`translate(${this.props.posX}, ${this.props.posY})`} style={{ pointerEvents: 'none', ...this.config.style }}>
        {!!hasPoint && this.getLabel()}
      </g>
    );
  }

  getLabel(): IVnode[] {
    let labels: IVnode[] = [];
    const index: number = this.pointSet.length - 1;
    const point: DataPoint = this.pointSet[index];
    const label: IVnode = this.getSingleLabel(index, point, point, FLOAT.TOP);

    if (label) {
      labels.push(label);
    }
    this.store.setValue('seriesLabelData', { [this.props.instanceId]: this.state.labelsData });
    return labels;
  }

  getSingleLabel(index: number, data: DataPoint, anchorPoint: DataPoint, float: FLOAT): IVnode {
    let { labelX, labelY, labelAlign } = this.calculateLabelPosition(data, float);
    const transform: string = 'translate(' + labelX + ',' + labelY + ')';
    let value = this.props.seriesName;
    let label =
      <text class={`sc-d-label-${index}`} fill={this.config.textColor} opacity={this.config.textOpacity} stroke='none' transform={transform} text-rendering='geometricPrecision' font-size={12} font-weight="bold" style={{ ...this.config.style }}>
        <tspan labelIndex={index} text-anchor={labelAlign} x={0} y={0} dy='0.4em'>
          {value}
        </tspan>
      </text>;
    let labelDim: DOMRect = UiCore.getComputedBBox(label);
    ({ labelX, labelY } = this.adjustLabelPosition(label, labelDim, labelX, labelY, labelAlign));

    let connectorBoxWidth = labelDim.width + (2 * this.config.xPadding);
    let connectorBoxHeight = labelDim.height + (2 * this.config.yPadding);
    if (this.config.textOnly) {
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
      case FLOAT.LEFT: {
        connectorBoxX = labelX - (labelDim.width) - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      }
      case FLOAT.RIGHT: {
        connectorBoxX = labelX - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      }
      case FLOAT.TOP:
      case FLOAT.BOTTOM:
      default: {
        connectorBoxX = labelX - (labelDim.width / 2) - this.config.xPadding;
        connectorBoxY = labelY - (labelDim.height / 2) - this.config.yPadding;
        break;
      }
    }
    const labelData: Rect = {
      x: connectorBoxX,
      y: connectorBoxY,
      width: connectorBoxWidth,
      height: connectorBoxHeight,
      index
    };
    const isOverlappingGlobal: boolean = this.checkOverlapping(this.allLabelsData, labelData);
    if (!this.config.labelOverlap && isOverlappingGlobal) {
      if (float === FLOAT.TOP) {
        return this.getSingleLabel(index, data, anchorPoint, FLOAT.BOTTOM);
      } else if (float === FLOAT.BOTTOM && this.pointSet[index - 1]) {
        return this.getSingleLabel(index - 1, this.pointSet[index - 1], anchorPoint, FLOAT.TOP);
      }
    }
    this.state.labelsData.push(labelData);
    if (anchorPoint.x > this.props.clip.x + this.props.clip.width) {
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

  calculateLabelPosition(data: DataPoint, float: FLOAT): { labelX: number, labelY: number, labelAlign: TEXT_ANCHOR } {
    let labelAlign: TEXT_ANCHOR = TEXT_ANCHOR.MIDDLE;
    let marginX: number = 40, marginY: number = 20;
    if (!this.config.showConnectorLine) {
      marginX = 10;
      marginY = 5;
    }
    let labelX, labelY;
    switch (float) {
      case FLOAT.BOTTOM: {
        labelX = data.x - marginX;
        labelY = data.y + marginY;
        break;
      }
      case FLOAT.LEFT: {
        marginX = 10;
        labelX = data.x - marginX;
        labelY = data.y;
        labelAlign = TEXT_ANCHOR.END;
        break;
      }
      case FLOAT.RIGHT: {
        marginX = 10;
        labelX = data.x + marginX;
        labelY = data.y;
        labelAlign = TEXT_ANCHOR.START;
        break;
      }
      case FLOAT.TOP:
      default: {
        labelX = data.x - marginX;
        labelY = data.y - marginY;
        break;
      }
    }
    return { labelX, labelY, labelAlign };
  }

  adjustLabelPosition(label: IVnode, labelDim: DOMRect, labelX: number, labelY: number, labelAlign: TEXT_ANCHOR): { labelX: number, labelY: number, labelAlign: TEXT_ANCHOR } {
    if (labelX - (labelDim.width / 2) < this.config.xPadding + this.props.clip.x) {
      labelX = this.config.xPadding + this.props.clip.x + (labelDim.width / 2) + this.config.borderWidth;
    }
    if (labelX + (labelDim.width / 2) > this.props.clip.x + this.props.clip.width) {
      labelX = labelX - (labelX + (labelDim.width / 2) - (this.props.clip.x + this.props.clip.width)) - this.config.borderWidth - this.config.xPadding;
    }
    if (labelY - (labelDim.height / 2) < this.config.yPadding + this.props.clip.y) {
      labelY = (labelDim.height / 2) + this.config.yPadding + this.props.clip.y + this.config.borderWidth;
    }
    if (labelY + (labelDim.height / 2) + this.config.yPadding > this.props.clip.height) {
      labelY = labelY - (labelY + (labelDim.height / 2) + this.config.yPadding + this.config.borderWidth - this.props.clip.height);
    }
    label.attributes.transform = 'translate(' + labelX + ',' + labelY + ')';
    (label.children[0] as IVnode).attributes['text-anchor'] = labelAlign;
    return { labelX, labelY, labelAlign };
  }

  checkOverlapping(existingLabels: Rect[], label: Rect): boolean {
    for (let existingLabel of existingLabels) {
      if (GeomCore.isRectOverlapping(existingLabel, label)) {
        return true;
      }
    }
    return false;
  }
}

export default SeriesLabel;