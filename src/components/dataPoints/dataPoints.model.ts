import { IMarkerIcon, IXAxisConfig, IYAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { DataPoint } from "../../core/point";
import { ICON_TYPE } from "../../global/global.enums";

export interface IDataPointsProps {
  instanceId: string;
  pointSet: DataPoint[];
  seriesName: string;
  xAxisInfo: IXAxisConfig;
  yAxisInfo: IYAxisConfig;
  type: ICON_TYPE;
  markerWidth: number;
  markerHeight: number;
  markerURL: string;
  customizedMarkers: IMarkerIcon[];
  fillColor: string;
  opacity: number;
  events: { [eventName: string]: () => void };
  onRef?: (param: any) => any;
};

export interface INormalizeAllPointMarkerEvent {
  seriesIndex: number;
};

export interface IHighlightPointMarkerEvent {
  event: MouseEvent | KeyboardEvent,
  highlightedPoint: {
    x: number,
    y: number,
    relX: number,
    relY: number,
    dist: number,
    pointIndex: null | number,
    seriesIndex: number,
    offsetLeft: number
  }
};