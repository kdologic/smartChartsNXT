import { IAnnotationConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { AXIS_TYPE } from "../../settings/globalEnums";

export interface IAnnotationLabelsProps {
  annotations: IAnnotationConfig[];
  posX: number;
  posY: number;
  width: number;
  height: number;
  yInterval: number;
  yAxisType: AXIS_TYPE;
  scaleX: number;
  scaleY: number;
  baseLine: number;
  paddingX: number;
  leftIndex: number;
  vTransformX: number;
};