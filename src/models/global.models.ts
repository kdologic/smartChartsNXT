import ConnectedPointBase from "../charts/connectedPointChartsType/connectedPointBase";
import { A11yWriter } from "../core/a11y";
import { CustomEvents } from "../core/eventEmitter";
import Store from "../liveStore/store";

/**
 * chart.model.ts
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

export interface IEventStore {
  [runId: string]: CustomEvents;
}

export interface IStoreCollection {
  [key: string]: Store;
}

export interface IA11yWriterStore {
  [key: string]: A11yWriter;
};

export interface IBoundingBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
