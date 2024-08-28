import { CategoryLabelType, IAnnotationConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";
import { AXIS_TYPE } from "../../global/global.enums";

export interface IAnnotationLabelsProps {
  annotations: IAnnotationConfig[];
  posX: number;
  posY: number;
  width: number;
  height: number;
  yInterval: number;
  yAxisType: AXIS_TYPE;
  paddingX: number;
  leftIndex: number;
  vTransformX: number;
  allCategorySet: CategoryLabelType[];
};