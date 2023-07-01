import { ICON_TYPE } from "../../settings/globalEnums"

export interface IMarkerIconProps {
  index: number | string;
  type: ICON_TYPE;
  instanceId: number | string;
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  URL: string;
  onRef?: (ref: any) => void;
}
