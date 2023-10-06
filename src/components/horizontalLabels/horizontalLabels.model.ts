import { CategoryLabelType, IClipArea, IXAxisConfig } from "../../charts/connectedPointChartsType/connectedPointChartsType.model";

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
  clip?: IClipArea;
};

export interface IHorizontalLabelHoverEvent {
  event: MouseEvent;
  labelText: string;
};

