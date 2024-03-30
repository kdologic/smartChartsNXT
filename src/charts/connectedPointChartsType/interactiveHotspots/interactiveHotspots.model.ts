import { IVnode } from "../../../viewEngin/component.model";

export interface IInteractiveHotspotsProps {
  onRef?: (param: any) => any;
};

export interface IAddHotspotEvent {
  id: string | number;
  hotspot: IVnode
};

export interface IRemoveHotspotEvent {
  id: string | number;
};