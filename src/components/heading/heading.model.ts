import { ISubtitleConfig, ITitleConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { HORIZONTAL_ALIGN } from "../../settings/globalEnums";

export interface IHeadingProps {
  instanceId: string;
  type: HeadingTypeMap; 
  opts: ITitleConfig | ISubtitleConfig;
  posX: number;
  posY: number;
  textAlign?: HORIZONTAL_ALIGN;
  textColor?: string;
  width: string;
};

export enum HeadingTypeMap {
  h1 = '32',
  h2 = '24',
  h3 = '18.72',
  h4 = '16',
  h5 = '13.28',
  h6 = '10.72',
}

export interface IHeadingConfig {
  top?: number;
  left?: number;
  width: number;
  height: number;
  style: {
    [key: string]: any;
  };
  offsetTop: number;
  offsetLeft: number;
  fontSize: string;
  textColor: string;
  textAlign: string;
  responsive?: {
    reducer?: (chartWidth: number, chartHeight: number) => { text?: string };
  };
};