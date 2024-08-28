'use strict';

import { IVnode } from '../../viewEngin/component.model';
import { Component } from '../../viewEngin/pview';
import { ITicksProps } from './ticks.model';
import Store from '../../liveStore/store';
import storeManager from '../../liveStore/storeManager';

/**
 * tick.component.tsx
 * @createdOn:08-Feb-2018
 * @author:SmartChartsNXT
 * @description: This components will create a tick mark for the chart.
 */

class Ticks extends Component<ITicksProps> {
  private storeData: Store;

  constructor(props: ITicksProps) {
    super(props);
    this.storeData = storeManager.getStore((this as any).context.runId);
  }

  render(): IVnode {
    return (
      <g class='sc-tick-mark' transform={`translate(${this.props.posX},${this.props.posY})`} >
        {this.props.type === 'vertical' ? this.drawTickLinesVertical() : this.drawTickLinesHorizontal()}
      </g>
    );
  }

  drawTickLinesVertical(): IVnode[] {
    let ticks = [];
    for (let tickCount = 0; tickCount < this.props.tickCount; tickCount++) {
      ticks.push(<line instanceId={`tick-${tickCount}`} class={`sc-tick sc-tick-line-${tickCount}`} transform={`translate(0, ${this.props.tickCount === 1 ? this.props.tickInterval : -(tickCount * this.props.tickInterval)})`}
        x1={0} y1={0} x2={this.props.span} y2={0} fill='none' stroke={this.props.stroke || this.props.color || '#000'}
        stroke-width='0.5' stroke-opacity={this.props.opacity} shape-rendering='crispedges' />);
    }
    return ticks;
  }

  drawTickLinesHorizontal(): IVnode[] {
    let ticks = [];
    const xPositionWithDynamicScaleFn = this.storeData.getValue('xPositionWithDynamicScaleFn');
    for (let tickCount = 0; tickCount < this.props.tickCount; tickCount++) {
      let xPos = xPositionWithDynamicScaleFn(tickCount, this.props.categorySet[tickCount], true);
      ticks.push(<line instanceId={`tick-${tickCount}`} class={`sc-tick-line-${tickCount}`}
        x1={xPos} y1={this.props.span} x2={xPos} y2={0} fill='none' stroke={this.props.stroke || this.props.color || '#000'}
        stroke-width='0.5' stroke-opacity={this.props.opacity} shape-rendering='crispedges' />);
    }
    return ticks;
  }

}

export default Ticks;