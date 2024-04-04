import { IXAxisConfig, IYAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

type axisType = 'x' | 'y';

export interface IAxisBarProps {
  instanceId: string;
  type: axisType;
  xAxis?: IXAxisConfig;
  yAxis?: IYAxisConfig;
  posX: number;
  posY: number;
  width: number;
  height: number;
};
