import { IVnode } from "../../viewEngin/component.model";

export interface IWatermarkProps {
  svgWidth: number;
  svgHeight: number;
  posX: number;
  posY: number;
  link: string;
  title: string;
  extChildren?: IVnode;
}