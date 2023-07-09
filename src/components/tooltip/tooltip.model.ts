import { IHighlightedPoint, ITooltipConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import Point from "../../core/point";
import { TOOLTIP_ALIGN } from "../../settings/globalEnums";

export interface ITooltipProps {
  instanceId: string;
  instanceCount: number;
  opts: ITooltipConfig;
  grouped: boolean;
  svgWidth: number;
  svgHeight: number;
  onRef?: (param: any) => any;
};

export interface ITooltipConfigExtended extends ITooltipConfig {
  strokeWidth?: number;
  anchorBaseWidth?: number;
};

export interface ITooltipInstances {
  tipId: string;
  originPoint: Point;
  cPoint: Point;
  topLeft: Point;
  transform: string;
  tooltipContent: string;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
  strokeColor: string;
  opacity: number;
};

export interface IUpdateTooltipEvent {
  instanceId: string;
  originPoint: Point;
  pointData?: IHighlightedPoint[];
  preAlign?: TOOLTIP_ALIGN; 
  content?: {
    header?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
    body?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
    footer?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
  };
  line1?: string;
  line2?: string;
};