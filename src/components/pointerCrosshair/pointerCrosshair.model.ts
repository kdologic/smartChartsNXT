import { ICrosshairLineOptions, IPointerCrosshairConfig, IXAxisConfig, IYAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IPointerCrosshairProps {
  hLineStart: number;
  hLineEnd: number;
  vLineStart: number;
  vLineEnd: number;
  opts?: IPointerCrosshairConfig;
  xAxis: IXAxisConfig;
  yAxis: IYAxisConfig;
  onRef?: (param: any) => any;
};

export interface ICrosshairLineOptionsExtended extends ICrosshairLineOptions {
  strokeWidth?: number;
  labelMinWidth?: number;
  labelMinHeight?: number;
  dashArray?: number; 
}

export interface IPointerCrosshairConfigExtended extends IPointerCrosshairConfig {
  vertical: ICrosshairLineOptionsExtended;
  horizontal: ICrosshairLineOptionsExtended;
};