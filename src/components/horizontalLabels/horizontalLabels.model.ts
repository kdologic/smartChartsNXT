import { CategoryLabelType, IValueCategory, IXAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IXAxisConfigExtended extends IXAxisConfig {
  displayDateFormat: string;
  categories: IValueCategory;
};

export interface IHorizontalLabelsProps {
  opts?: IXAxisConfigExtended;
  posX: number;
  posY: number;
  maxWidth: number;
  maxHeight: number;
  categorySet?: CategoryLabelType[];
  paddingX: number;
  accessibilityId?: string;
  onRef?: (param: any) => any;
  clip?: {
    x: number;
    width: number;
  };
};

