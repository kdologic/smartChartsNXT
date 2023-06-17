import { IHorizontalScrollerConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { IVnode } from "../../viewEngin/component.model";

export interface IHorizontalScrollerProps {
  opts?: IHorizontalScrollerConfig;
  posX: number;
  posY: number;
  width: number;
  height: number;
  leftOffset: number;
  rightOffset: number;
  offsetColor: string;
  offsetClipId: string;
  windowClipId: string;
  getRangeVal: () => void;
  extChildren?: IVnode;
};

export interface IHScrollOffsetModel  {
  leftOffset: number;
  rightOffset: number;
  windowWidth: number;
  leftOffsetPercent: number;
  rightOffsetPercent: number;
};
