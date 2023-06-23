import { CategoryLabelType, IGridConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IGridProps {
  opts?: IGridConfig;
  posX: number;
  posY: number;
  width: number;
  height: number;
  yAxisType: string;
  vTransformX: number;
};

export interface IUpdateHorizontalGridEvent { 
  isPrimary: boolean,
  intervalLen: number,
  intervalValue: number,
  zeroBaseIndex: number,
  values: number,
  count: number
};

export interface IUpdateVerticalGridEvent {
  intervalLen: number, 
  count: number, 
  values: CategoryLabelType[]
};