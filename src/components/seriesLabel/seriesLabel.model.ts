import { IClipArea, ISeriesLabelConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface ISeriesLabelProps {
  instanceId: string;
  seriesName: string;
  seriesId: string;
  opts: ISeriesLabelConfig;
  posX: number;
  posY: number;
  textColor?: string;
  borderColor?: string;
  clip: IClipArea;
  onRef?: (param: any) => any;
}
