import { IClipArea, IDataLabel } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { DataPoint } from "../../core/point";
import { FLOAT } from "../../global/global.enums";

export interface IDataLabelsProps {
  instanceId: string;
  pointSet: DataPoint[];
  opts: IDataLabel;
  clip: IClipArea;
  onRef?: (param: any) => any;
};

export interface IDataLabelConfig {
  float: FLOAT;
  classes: string[];
  labelOverlap: boolean;
  textColor: string;
  textOpacity: number;
  bgColor: string;
  bgOpacity: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  opacity: number;
  xPadding: number;
  yPadding: number;
  offsetX: number;
  offsetY: number;
  shadow: boolean;
  anchorBaseWidth: number;
  style: Record<string, any>;
};

export interface IDataLabelData {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
};
