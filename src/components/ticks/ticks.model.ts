export type TICK_TYPE = 'vertical' | 'horizontal';

export interface ITicksProps {
  posX: number;
  posY: number;
  span: number;
  tickInterval: number;
  tickCount: number;
  opacity: number;
  stroke: string;
  color?: string;
  type: TICK_TYPE;
};