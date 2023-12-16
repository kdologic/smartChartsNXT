export interface ICustomIconProps {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  URL?: string;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  onRef?: (ref: any) => void;
}