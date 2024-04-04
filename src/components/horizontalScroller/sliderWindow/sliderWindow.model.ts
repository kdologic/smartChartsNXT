export interface ISliderWindowProps {
  posX: number;
  posY: number;
  width: number;
  height: number;
  offsetColor: string;
  fillOpacity: number;
  focusedIn: boolean;
  onRef?: (param: any) => any;
  events: {
    mousedown: (event: MouseEvent) => void;
    touchstart: (event: TouchEvent) => void;
    mouseenter: (event: MouseEvent) => void;
    mouseleave: (event: MouseEvent) => void;
    focusin: (event: FocusEvent) => void;
    focusout: (event: FocusEvent) => void;
    keydown: (event: KeyboardEvent) => void;
  };
};