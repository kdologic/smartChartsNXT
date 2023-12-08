import Store from "../liveStore/store";
import { GRADIENT, PATTERN } from "../global/global.enums";
import { A11yWriter } from "./a11y";
import { CustomEvents } from "./eventEmitter";
import Point from "./point";

export interface IEventStore {
  [runId: string]: CustomEvents;
}

export interface IStoreCollection {
  [key: string]: Store;
}

export interface IA11yWriterStore {
  [key: string]: A11yWriter;
};

export interface IFillOptions {
  pattern?: PATTERN;
  gradient?: GRADIENT;
  image?: string;
};

export interface IYIntervalType {
  iVal: (pow?: number) => number;
  iCount: number;
  iMax: number;
  iMin: number;
};

export interface IEllipticalArc {
  d: string,
  arc: string,
  start: Point,
  end: Point,
  center: Point,
  rx: number,
  ry: number,
  startAngle: number,
  endAngle: number
};

export interface ILineIntersection {
  x: number | null,
  y: number | null,
  onLine1: boolean,
  onLine2: boolean
};

export interface IRemoveNodeInfo {
  parentNode: Node;
  node: Node;
};

export interface ISaveAsOptions {
  type: string;
  emitter: CustomEvents;
  width: number;
  height: number;
  srcElem: string;
};

export type TransformMatrix = (string | number)[][];

export type IPathSegment  = (number | string)[];


