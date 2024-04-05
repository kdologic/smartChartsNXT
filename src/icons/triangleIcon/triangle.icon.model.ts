export interface ITriangleIconProps {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  onRef?: (ref: any) => void;
}