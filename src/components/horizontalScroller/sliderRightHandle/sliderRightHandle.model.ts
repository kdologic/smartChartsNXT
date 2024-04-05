export interface ISliderRightHandleProps {
  leftOffset: number;
  windowWidth: number;
  offsetPercent: number;
  width: number;
  height: number;
  handlerColor: string;
  innerBarColor: string;
  focusedIn: boolean;
  onRef?: (param: any) => any;
  events: {
    handlerEvent: {
      mousedown: (event: MouseEvent) => void;
      touchstart: (event: TouchEvent) => void;
      mouseenter: (event: MouseEvent) => void;
      mouseleave: (event: MouseEvent) => void;
      focusin: (event: FocusEvent) => void;
      focusout: (event: FocusEvent) => void;
      keydown: (event: KeyboardEvent) => void;
    };
    offsetEvent: {
      click: (event: MouseEvent) => void;
    };
  };
};