import Point from "../../core/point";

export interface ISpeechBoxProps {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  cpoint: Point;
  anchorBaseWidth: number;
  bgColor: string;
  fillOpacity: number;
  shadow: boolean;
  strokeColor: string;
  strokeWidth: number;
  showAnchor?: boolean;
  cornerRadius?: number;
  strokeOpacity?: number;
  onRef?: (param: any) => any;
};