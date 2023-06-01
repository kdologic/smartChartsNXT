export type GradientType = "linearGradient" | "radialGradient";
export type GradientUnitsType = "userSpaceOnUse | objectBoundingBox";
export interface IGradientStop { [key: string]: any };
export interface IGradient {
  tagName: GradientType;
  id?: string;
  attrs: {
    [key: string]: any;
    gradientUnits: GradientUnitsType;
  };
  stops: IGradientStop[];
};