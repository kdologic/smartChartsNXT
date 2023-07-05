export interface IInteractivePlaneProps {
  posX: number;
  posY: number;
  width: number;
  height: number;
  onRef?: (param: any) => any;
};

export interface IInteractiveMouseEvent {
  event: MouseEvent,
  mousePos: DOMPoint
}

export interface IInteractiveKeyboardEvent {
  event: KeyboardEvent
}