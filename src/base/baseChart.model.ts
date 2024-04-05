import { IConnectedPointChartConfig } from "../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IBaseChartProps {
  opts: IConnectedPointChartConfig;
  runId: string;
  width: number;
  height: number;
};