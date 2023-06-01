import { ICON_TYPE } from "../../settings/globalEnums"

export interface IMarkerIconProps {
  index: string;
  type: ICON_TYPE;
  instanceId: string;
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  highlighted: boolean;
  strokeColor: string;
  URL: string;
  onRef: (ref: any) => void;
}
