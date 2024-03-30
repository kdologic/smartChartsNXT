import ConnectedPointBase from "../charts/connectedPointChartsType/connectedPointBase";

/**
 * global.model.ts
 * @createdOn: 08-Oct-2022
 * @author: SmartChartsNXT
 * @description: Export different data models and interfaces for chart components.
 */

export type TChartType = 'AreaChart' | 'LineChart' | 'PieChart' | 'DonutChart' | 'StepChart' | 'ColumnChart' | 'ColumnChart' | 'BarChart';

export interface IChartConfig {
  name: string;
  type: TChartType;
  minWidth: number;
  minHeight: number;
};

export interface IChartModule {
  config: IChartConfig;
  validationRules: any;
  chart: typeof ConnectedPointBase;
};

export interface IChartModules {
  [chartName: string]: IChartModule;
};

export interface IMainMenu {
  enable: boolean;
  itemSaveAsJPG: boolean;
  itemSaveAsPNG: boolean;
  itemSaveAsSVG: boolean;
  itemSaveAsPDF: boolean;
  itemPrint: boolean;
};

export interface IMenuConfig {
  mainMenu: IMainMenu;
};

export interface IDimensionBox {
  x: number,
  y: number,
  width: number,
  height: number
};

export interface IResizeEvent {
  data: {
    oldTargetWidth: number;
    oldTargetHeight: number;
    targetWidth: number;
    targetHeight: number;
  };
} 