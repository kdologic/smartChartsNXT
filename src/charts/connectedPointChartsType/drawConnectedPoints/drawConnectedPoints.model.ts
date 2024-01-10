import { IFillOptions } from "../../../core/core.model";
import { LINE_STYLE } from "../../../global/global.enums";
import { IClipArea, IDataLabel, IMarkerIcon, ISeriesLabelConfig, ITooltipConfig, IXAxisConfig, IYAxisConfig } from "../connectedPointChartsType.model";

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
  strokeOpacity?: number;
  opacity: number;
  spline: boolean;
  marker: IMarkerIcon;
  customizedMarkers: IMarkerIcon[] | [];
  centerSinglePoint: boolean;
  lineStrokeWidth: number;
  lineStyle: LINE_STYLE;
  lineDashArray: string;
  areaStrokeWidth: number;
  maxVal: number;
  minVal: number;
  dataPoints: boolean;
  dataLabels: IDataLabel | false;
  seriesLabel: ISeriesLabelConfig | false;
  animated: boolean;
  shouldRender: boolean;
  tooltipOpt?: ITooltipConfig;
  xAxisInfo: IXAxisConfig;
  yAxisInfo: IYAxisConfig;
  totalSeriesCount?: number;
  totalDataCount?: number;
  accessibility: boolean;
  accessibilityText?: string;
  emitScale: boolean;
  scaleX: number;
  scaleY: number;
  baseLine: number;
  clipId?: string;
  clip?: IClipArea;
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