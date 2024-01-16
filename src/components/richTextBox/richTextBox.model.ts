import { HORIZONTAL_ALIGN } from "../../global/global.enums";

export interface IRichTextBoxProps {
  class: string;
  posX: number;
  posY: number;
  width?: number;
  contentWidth?: number;
  height?: number;
  textAlign: HORIZONTAL_ALIGN;
  verticalAlignMiddle?: boolean;
  rotation?: number;
  fontSize: string | number;
  textColor: string;
  overflow?: string;
  style?: Record<string, any>;
  text: string;
  onRef?: (ref: any) => any;
  onDestroyRef?: (ref: any) => any;
};

export interface IStyleConfig {
  display: string;
  position: string;
  fontFamily: string;
  fontSize: string;
}

export interface IDimension {
  width: number;
  height: number;
}