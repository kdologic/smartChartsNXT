export type PatternUnitsType = "userSpaceOnUse | objectBoundingBox";
export interface IPatternChild {[key: string]: any};
export interface IPattern {
  tagName: "pattern",
  id: string,
  attrs: {
    [key: string]: any,
    patternUnits: PatternUnitsType
  };
  children: IPatternChild[];
};
export interface IDefImageFill {
  id?: string,
  src: string,
  width: number | string,
  height: number | string
};