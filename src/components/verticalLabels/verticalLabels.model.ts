import { IYAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IVerticalLabelsProps {
  instanceId: string;
  opts?: IYAxisConfig;
  priority: string;
  posX: number;
  posY: number;
  maxVal: number;
  minVal: number;
  valueInterval: (param: number) => number;
  labelCount: number;
  intervalLen: number;
  maxWidth: number;
  accessibilityId: string;
  onRef?: (param: any) => any;
};

export interface IVerticalLabelHoverEvent {
  event: MouseEvent;
  labelText: string;
};