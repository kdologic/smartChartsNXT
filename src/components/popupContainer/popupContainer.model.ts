export interface IPopupContainerProps {
  posX?: number;
  posY?: number;
  onRef?: (ref: any) => any;
}

export interface IPopupConfig {
  x?: number;
  y?: number;
  draggedX?: number;
  draggedY?: number,
  width?: number;
  height?: number;
  title?: string;
  body?: string;
  fontSize?: string;
  fontColor?: string;
  style?: Record<string, any>;
  isDraggable?: boolean;
  isModal?: boolean;
  isAnimated?: boolean;
  textVerticalAlignMiddle?: boolean;
  clipId?: string;
}