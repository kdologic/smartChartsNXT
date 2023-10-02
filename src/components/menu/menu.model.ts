import { IMainMenu } from "../../global/global.models";
import { SAVE_AS } from "../../settings/globalEnums";

export interface IMenuProps {
  opts: IMainMenu;
  x: number;
  y: number;
  svgWidth: number;
  svgHeight: number;
  rootNode: string;
  rootContainer: string;
};

export interface IMenuItemEvents {
  click: (e: MouseEvent) => void;
  keydown: (e: KeyboardEvent) => void;
};

export interface IMenuItem {
  id: keyof IMainMenu;
  label: string;
  splitLabel?: string[];
  hotKey: number;
  topLine?: boolean;
  bottomLine?: boolean;
  type: SAVE_AS;
  events: IMenuItemEvents;
};

export interface IMenuOptions {
  menu: IMenuItem[];
}