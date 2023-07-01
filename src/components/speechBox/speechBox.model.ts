import Point from "../../core/point";

export interface ISpeechBoxProps {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cpoint: Point;
  anchorBaseWidth?: number;
  bgColor: string;
  fillOpacity: number | string;
  shadow: boolean;
  strokeColor: string;
  strokeWidth: number | string;
  showAnchor?: boolean;
  cornerRadius?: number | string;
  strokeOpacity?: number | string;
  onRef?: (param: any) => any;
};