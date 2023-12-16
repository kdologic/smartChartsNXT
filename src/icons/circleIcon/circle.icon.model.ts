export interface ICircleIconProps {
  id: string | number;
  x: number;
  y: number;
  r: number;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  onRef?: (ref: any) => any;
}