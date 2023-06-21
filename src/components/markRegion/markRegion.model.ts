import { IMarkRegion } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { IObject } from "../../viewEngin/pview.model";

export interface IMarkRegionProps {
  posX: number;
  posY: number;
  xMarkRegions: IMarkRegion[];
  yMarkRegions: IMarkRegion[];
  xAxisType: string;
  yAxisType: string;
  width: number;
  height: number;
  yInterval: number;
  paddingX: number;
  leftIndex: number;
  vTransformX: number;
};

export interface IMarkRegionConfig {
  fill: string;
  stroke: string;
  opacity: number;
  text: string;
  fontSize: number;
  fontColor: string;
  textStyle: IObject;
  refId?: string;
  rotateText?: number;
  moveTextOutside?: number;
};