export interface IStarIconProps {
  id: string | number;
  x: number;
  y: number;
  width: number;
  height: number;
  arms?: number;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  onRef?: (ref: any) => void;
}