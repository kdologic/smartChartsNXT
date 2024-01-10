import { Dayjs } from "dayjs";
import { IFillOptions } from "../../core/core.model";
import { IMenuConfig, TChartType } from "../../global/global.models";
import { ALIGNMENT, AXIS_TYPE, FLOAT, HORIZONTAL_ALIGN, ICON_TYPE, LINE_STYLE, TEXT_ANCHOR, TOOLTIP_POSITION, VERTICAL_ALIGN } from "../../global/global.enums";
import { IGlobalDefs } from "../../styles/globalDefs/globalDefs.model";
import { IObject } from "../../viewEngin/pview.model";

export interface IConnectedPointChartProps {
  chartOptions: IConnectedPointChartConfig;
  chartData?: IObject;
  chartConst?: IObject;
  globalRenderAll?: boolean;
};

export interface IConnectedPointChartConfig {
  type: TChartType;
  targetElem: string;
  width: number;
  height: number;
  a11y?: {
    description: string;
  };
  canvasBorder?: boolean;
  bgColor?: string;
  title?: ITitleConfig
  subtitle?: ISubtitleConfig;
  defs?: IGlobalDefs,
  creditsWatermark?: IWatermarkConfig;
  menu?: IMenuConfig;
  gridBox?: IGridConfig;
  pointerCrosshair?: IPointerCrosshairConfig;
  horizontalScroller?: IHorizontalScrollerConfig;
  legends?: ILegendsConfig;
  tooltip?: ITooltipConfig;
  annotationLabels?: IAnnotationConfig[];
  dataSet: IConnectedPointDataSet;
  zoomWindow?: IZoomWindowConfig;
};

export interface IConnectedPointDataSet {
  xAxis?: IXAxisConfigExtended;
  yAxis?: IYAxisConfig;
  series: ISeriesConfig[];
};

export interface ITitleConfig {
  text?: string;
  top?: number;
  left?: number | string;
  width?: number | string;
  height?: number | string;
  textAlign?: HORIZONTAL_ALIGN;
  textColor?: string;
  style?: {
    [key: string]: any;
  };
  responsive?: {
    reducer?: (chartWidth: number, chartHeight: number) => { text?: string };
  };
};

export interface ISubtitleConfig {
  text?: string;
  top?: number;
  left?: number | string;
  width?: number | string;
  height?: number | string;
  textAlign?: HORIZONTAL_ALIGN;
  textColor?: string;
  style?: {
    [key: string]: any;
  };
  responsive?: {
    reducer?: (chartWidth: number, chartHeight: number) => { text?: string };
  };
};

export interface IGridConfig {
  vertical?: IGridOptions;
  horizontal?: IGridOptions;
  bgColor?: string;
  fillOptions?: IFillOptions;
  bgOpacity?: number;
};

export interface IGridOptions {
  enable?: boolean;
  lineStyle?: string;
  lineColor?: string;
  lineThickness?: number;
  lineOpacity?: number;
};

export interface IPointerCrosshairConfig {
  vertical: ICrosshairLineOptions,
  horizontal: ICrosshairLineOptions
};

export interface ICrosshairLineOptions {
  style?: string;
  spread?: string;
  lineColor?: string;
  lineWidth?: number;
  lineOpacity?: number;
  labelTextColor?: string;
  labelBackgroundColor?: string;
  labelOpacity?: number;
};

export interface ILegendsConfig {
  enable?: boolean;
  top?: number;
  left?: number;
  maxWidth?: string;
  alignment?: ALIGNMENT;
  type?: ALIGNMENT;
  display?: string;
  float?: FLOAT;
  textColor?: string;
  bgColor?: string;
  hoverColor?: string;
  fontSize?: number;
  fontFamily?: string;
  itemBorderWidth?: number;
  itemBorderColor?: string;
  itemBorderOpacity?: number;
  itemBorderRadius?: number;
  borderColor?: string;
  strokeColor?: string;
  borderWidth?: number;
  strokeWidth?: number;
  borderOpacity?: number;
  strokeOpacity?: number;
  opacity?: number;
  toggleType?: boolean;
  hideIcon?: boolean;
  hideLabel?: boolean;
  hideValue?: boolean;
};

export interface IHorizontalScrollerConfig {
  enable?: boolean;
  width?: number;
  height?: number;
  chartInside?: boolean;
};

export interface IXAxisConfig {
  type: AXIS_TYPE;
  title?: string;
  categories?: IValueCategory;
  selectedCategories?: CategoryLabelType[];
  prepend?: string;
  append?: string;
  displayDateFormat?: string;
  labelRotate?: number;
  intervalThreshold?: number;
  titleColor?: string;
  tickOpacity?: number;
  tickColor?: string;
  tickSpan?: number;
  labelAlign?: VERTICAL_ALIGN;
  labelOpacity?: number;
  labelColor?: string;
  axisColor?: string;
  fontSize?: number;
  fontFamily?: string;
  positionOpposite?: boolean;
  markRegions?: IMarkRegion[];
};

export interface IXAxisConfigExtended extends Omit<IXAxisConfig, 'categories'> {
  categories: string[] | IValueCategory;
  displayDateFormat: string;
};

export interface IYAxisConfig {
  type?: AXIS_TYPE;
  title?: string;
  prepend?: string;
  append?: string;
  labelRotate?: number;
  titleColor?: string;
  tickOpacity?: number;
  tickColor?: string;
  tickSpan?: number;
  labelAlign?: HORIZONTAL_ALIGN | TEXT_ANCHOR;
  labelOpacity?: number;
  labelColor?: string;
  axisColor?: string;
  fontSize?: number;
  fontFamily?: string;
  zeroBase?: boolean;
  positionOpposite?: boolean;
  markRegions?: IMarkRegion[];
};

export interface ISeriesConfig {
  index: number;
  visible?: boolean;
  name: string;
  a11y?: {
    description?: string;
  };
  lineWidth?: number;
  lineOpacity?: number;
  lineColor?: string;
  lineStyle?: LINE_STYLE;
  lineDashArray?: string;
  areaColor?: string;
  areaOpacity?: number;
  yAxisLinkIndex?: number;
  fillOptions?: IFillOptions;
  marker?: IMarkerIcon;
  customizedMarkers: IMarkerIcon[];
  spline?: boolean;
  dropShadow?: boolean;
  animated?: boolean;
  seriesLabel?: ISeriesLabelConfig;
  dataLabels?: IDataLabel;
  data: ISeriesData;
  valueSet: number[];
  turboData: any;
  dataDimIndex: any;
  dataDimValue: any;
};

export interface ISeriesLabelConfig {
  enable?: boolean;
  labelOverlap?: boolean;
  textOnly?: boolean;
  showConnectorLine?: boolean;
  textColor?: string;
  textOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  xPadding?: number;
  yPadding?: number;
  shadow?: boolean;
  classes?: string[];
  style?: { [key: string]: any };
};

export interface IDataLabel {
  enable?: boolean;
  float?: FLOAT;
  labelOverlap?: boolean;
  textColor?: string;
  textOpacity?: number;
  bgColor?: string;
  bgOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  filter?: (val: any, index: number) => boolean;
  formatter?: (val: any, index: number) => string;
  anchorBaseWidth?: number;
  xPadding?: number;
  yPadding?: number;
  offsetX?: number;
  offsetY?: number;
  shadow?: boolean;
  classes?: string[];
  style?: { [key: string]: any };
};

export interface IMarkRegion {
  from: number;
  to: number;
  color?: string;
  borderColor?: string;
  opacity?: number;
  label?: {
    text?: string;
    fontSize?: number;
    color?: string;
    style?: IObject;
  };
};

export interface IMarkerIcon {
  enable?: boolean;
  type?: ICON_TYPE;
  width?: number;
  height?: number;
  URL?: string;
  events?: {
    click: (e: Event) => void;
  }
};

export interface ITooltipConfig {
  enable?: boolean;
  followPointer?: boolean;
  grouped?: boolean;
  pointerVicinity?: number;
  anchorWidth?: number;
  anchorHeight?: number;
  position?: TOOLTIP_POSITION;
  top?: number;
  left?: number;
  content?: {
    header?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
    body?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
    footer?: (pointSet: IHighlightedPoint[], index: number, tipConfig: ITooltipConfig) => string;
  };
  headerTextColor?: string;
  headerBgColor?: string;
  textColor?: string;
  bgColor?: string;
  footerTextColor?: string;
  footerBgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  xPadding?: number;
  yPadding?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  dropShadow?: boolean;
};

export interface IAnnotationOptions {
  isDraggable?: boolean;
  isCollapsible?: boolean;
  offsetX?: number;
  offsetY?: number;
  float?: FLOAT;
  textColor?: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  xPadding?: number;
  yPadding?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  maxWidth?: number;
  minHeight?: number;
  dropShadow?: boolean;
  rotate?: number;
};

export interface IAnnotationLabel {
  text?: string;
  speechBubble?: boolean;
  shape?: string;
  image?: string;
  width?: string;
  height?: string;
  contentWidth?: number;
  contentHeight?: number;
  x: number;
  y: number;
  isMinimized?: boolean;
  topOffset?: number;
  leftOffset?: number
  nextTopOffset?: number;
  nextLeftOffset?: number;
};

export interface IAnnotationConfig {
  options: IAnnotationOptions;
  labels: IAnnotationLabel[];
}

export interface IValueCategory {
  value?: string[];
  startFrom?: string | number;
  increaseBy?: number;
  parseAsDate?: boolean;
  parseDateFormat?: string;
  displayDateFormat?: string;
};

export type CategoryLabelType = string | number | Dayjs;

export interface ILabelValue {
  label?: CategoryLabelType;
  value: number;
  index?: number;
  marker?: IMarkerIcon
};

export interface ILabelValueArr extends Array<string | number> {
  0: string;
  1: number;
};

export type IConnectedPointData = number | ILabelValueArr | ILabelValue | null;

export interface ISeriesData extends Array<IConnectedPointData> { };

export interface IZoomWindowConfig {
  leftIndex?: number;
  rightIndex?: number;
};

export interface IWatermarkConfig {
  enable?: boolean;
};

export interface IHighlightedPoint {
  x: number;
  y: number;
  label: CategoryLabelType;
  formattedLabel: string;
  value: number;
  formattedValue: string;
  seriesName: string;
  seriesIndex: number;
  seriesColor?: string;
  pointIndex: number;
  lineColor: string;
  areaColor: string;
  dist: number;
};

export interface IBoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export interface IClipArea {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  offsetLeft?: number;
  offsetRight?: number;
};
