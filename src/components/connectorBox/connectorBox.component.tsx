'use strict';

import Point from '../../core/point';
import { Component } from '../../viewEngin/pview';
import UiCore from '../../core/ui.core';
import { IConnectorBoxProps } from './connectorBox.model';
import { IVnode } from '../../viewEngin/component.model';

/**
 * connectorBox.component.tsx
 * @createdOn:22-Aug-2020
 * @author:SmartChartsNXT
 * @description:This components will create connector box which join by connector line.
 * @extends Component
 */

class ConnectorBox extends Component<IConnectorBoxProps> {
  private cpoint: Point;

  constructor(props: IConnectorBoxProps) {
    super(props);
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render(): IVnode {
    this.cpoint = this.props.cpoint;
    const showConnectorLine = this.props.showConnectorLine || typeof this.props.showConnectorLine === 'undefined';
    return (
      <g id={this.props.id || ''} class='sc-connector-box' >
        {this.props.shadow && UiCore.dropShadow('sc-connector-box-drop-shadow')}
        {showConnectorLine &&
        <path class='sc-connector-box-path' d={this.getConnectorLinePath()} fill="none" fill-opacity={0}
          stroke="#555" stroke-width={1} stroke-opacity={1}
          shape-rendering='geometricPrecision' vector-effect='non-scaling-stroke' />
        }
        <rect class='sc-connector-box-rect' transform={`translate(${this.props.x},${this.props.y})`} fill={this.props.bgColor} x={0} y={0} width={this.props.width} height={this.props.height} fill-opacity={typeof this.props.fillOpacity === 'undefined' ? 1 : this.props.fillOpacity}
          filter={this.props.shadow ? 'url(#sc-connector-box-drop-shadow)' : ''} rx={this.props.cornerRadius || 0}
          stroke={this.props.strokeColor} stroke-width={typeof this.props.strokeWidth === 'undefined' ? 1 : this.props.strokeWidth } stroke-opacity={typeof this.props.strokeOpacity === 'undefined' ? 1 : this.props.strokeOpacity}
          shape-rendering='geometricPrecision' vector-effect='non-scaling-stroke' />
      </g>
    );
  }

  getConnectorLinePath(): string {
    const cpoint = this.props.cpoint;
    const dash = 5;
    const leftCT = new Point(this.props.x, this.props.y + this.props.height/2);
    const leftCTPath = ['L', leftCT.x - dash, leftCT.y, 'h', dash];
    const rightCT = new Point(this.props.x + this.props.width, this.props.y + this.props.height/2);
    const rightCTPath = ['L', rightCT.x + dash, rightCT.y, 'h',-dash];
    const topCT = new Point(this.props.x + this.props.width/2, this.props.y);
    const topCTPath = ['L', topCT.x , topCT.y - dash, 'v', dash];
    const bottomCT = new Point(this.props.x + this.props.width/2, this.props.y + this.props.height);
    const bottomCTPath = ['L', bottomCT.x, bottomCT.y + dash, 'v', -dash];
    let path: (string | number)[] = ['M', cpoint.x, cpoint.y];
    let connectPoint: (string | number)[] = [];

    if(cpoint.x < leftCT.x) {
      connectPoint = leftCTPath;
    }else if(cpoint.x > rightCT.x) {
      connectPoint = rightCTPath;
    }else if(cpoint.x >= leftCT.x && cpoint.x <= rightCT.x) {
      if(cpoint.y < topCT.y) {
        connectPoint = topCTPath;
      }else if(cpoint.y > bottomCT.y) {
        connectPoint = bottomCTPath;
      }
    }
    path = [...path, ...connectPoint];
    return path.join(' ');
  }

}

export default ConnectorBox;