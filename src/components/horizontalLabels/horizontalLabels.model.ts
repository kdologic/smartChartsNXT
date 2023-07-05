import { CategoryLabelType, IXAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

export interface IHorizontalLabelsProps {
  opts?: IXAxisConfig;
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

export interface IHorizontalLabelHoverEvent {
  event: MouseEvent;
  labelText: string;
};

