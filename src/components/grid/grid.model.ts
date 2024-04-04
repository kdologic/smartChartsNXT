import { CategoryLabelType, IGridConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IGridProps {
  opts?: IGridConfig;
  posX: number;
  posY: number;
  width: number;
  height: number;
  yAxisType: string;
  vTransformX: number;
  vGridCount?: number;
  vGridInterval?: number;
  hGridCount?: number;
  hGridInterval?: number;
};

export interface IUpdateHorizontalGridEvent { 
  isPrimary: boolean,
  intervalLen: number,
  intervalValue: (param: number) => number,
  zeroBaseIndex: number,
  values: number,
  count: number
};

export interface IUpdateVerticalGridEvent {
  intervalLen: number, 
  count: number, 
  values: CategoryLabelType[]
};