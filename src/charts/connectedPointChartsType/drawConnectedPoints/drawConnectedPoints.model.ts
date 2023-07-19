import { IFillOptions } from "../../../core/core.model";
import { LINE_STYLE } from "../../../settings/globalEnums";
import { IDataLabel, IMarkerIcon, ISeriesLabel, ITooltipConfig, IXAxisConfig, IYAxisConfig } from "../connectedPointChartsType.model";

export interface IDrawConnectedPointsProps {
  dataSet: (number | null)[];
  index: number;
  instanceId: string;
  name: string;
  posX: number;
  posY: number;
  paddingX: number;
  width: number;
  height: number;
  maxSeriesLen: number;
  areaFillColor: string;
  lineFillColor: string;
  fillOptions: IFillOptions;
  lineDropShadow: boolean;
  strokeOpacity: number;
  opacity: number;
  spline: boolean;
  marker: IMarkerIcon;
  customizedMarkers: IMarkerIcon[];
  centerSinglePoint: boolean;
  lineStrokeWidth: number;
  lineStyle: LINE_STYLE;
  lineDashArray: number;
  areaStrokeWidth: number;
  maxVal: number;
  minVal: number;
  dataPoints: boolean;
  dataLabels: IDataLabel | false;
  seriesLabel: ISeriesLabel;
  animated: boolean;
  shouldRender: boolean;
  tooltipOpt: ITooltipConfig;
  xAxisInfo: IXAxisConfig;
  yAxisInfo: IYAxisConfig;
  totalSeriesCount: number;
  totalDataCount: number;
  accessibility: boolean;
  accessibilityText: string;
  emitScale: boolean;
  scaleX: number;
  scaleY: number;
  baseLine: number;
  clipId?: string;
  clip: {
    x: number;
    width: number;
    offsetLeft: number;
    offsetRight: number;
  };
  onRef?: (param: any) => any;
};

export enum HIGHLIGHT_EVENT_TYPE {
  HIGHLIGHT = 'highlight',
  NORMALIZE = 'normalize'
}

export interface IHighlightConfigEvent {
  type: HIGHLIGHT_EVENT_TYPE;
  instanceId: string;
  strokeOpacity: number;
  opacity: number;
};