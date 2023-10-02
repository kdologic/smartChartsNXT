export interface ITextBoxProps {
  class?: string;
  posX: number;
  posY: number;
  width?: number;
  height?: number;
  bgColor?: string;
  textColor?: string;
  bgOpacity?: number;
  borderRadius?: number;
  padding?: number;
  stroke?: string;
  strokeWidth?: number;
  textAnchor?: string;
  fontWeight?: string;
  text: string;
  wrapText?: boolean;
  transform?: string;
  style?: { [key: string]: any };
};