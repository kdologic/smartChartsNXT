import Point from "../../core/point";

export interface IConnectorBoxProps {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cpoint: Point;
  bgColor: string;
  fillOpacity: number;
  shadow: boolean;
  strokeColor: string;
  strokeOpacity?: number;
  strokeWidth: number;
  cornerRadius: number;
  showConnectorLine: boolean;
  onRef?: (param: any) => any;
};