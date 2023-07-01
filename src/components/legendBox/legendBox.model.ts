import { ILegendsConfig, IMarkerIcon } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { ALIGNMENT, DISPLAY, FLOAT } from "../../settings/globalEnums";

export interface ILegendBoxProps {
  legendSet: ILegendOptions[]; // Replace 'any' with the actual type of 'legendSet'
  float: FLOAT;
  left: number;
  top: number;
  opts: ILegendsConfig;
  display: DISPLAY;
  type: ALIGNMENT;
  background: string;
  hoverColor: string;
  hideIcon: boolean;
  hideLabel: boolean;
  hideValue: boolean;
  toggleType: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  opacity?: number;
  onRef?: (param: any) => any;
};

export interface ILegendOptions {
  index?: number;
  label: string;
  color: string;
  icon: IMarkerIcon;
  isToggled: boolean;
  value?: number;
  totalWidth?: number;
  labelLength?: number;
  transform?: string;
  bgFillOpacity?: number;
  strokeOpacity?: number;
  defaultIconStroke?: number | string;
  iconHighlight?: boolean;
};

export interface ILegendLengthData {
  totalWidth: number[]; 
  labelLength: number[];
  max?: {
    width: number, 
    labelLength: number
  }
};