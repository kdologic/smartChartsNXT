'use strict';

import { IVnode } from '../../viewEngin/component.model';
import { Component } from '../../viewEngin/pview';
import { ITriangleIconProps } from './triangle.icon.model';

/**
 * triangle.icon.component.tsx
 * @createdOn:24-Apr-2020
 * @author:SmartChartsNXT
 * @description: Create triangle shape icon.
 */

class TriangleIcon extends Component<ITriangleIconProps> {
  constructor(props: ITriangleIconProps) {
    super(props);
    this.state = {
      highlighted: this.props.highlighted ? 0.5 : 0
    };
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  afterUpdate(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  beforeUpdate(nextProps: ITriangleIconProps): void {
    if(this.props.highlighted !== nextProps.highlighted) {
      this.state.highlighted = nextProps.highlighted ? 0.5 : 0;
    }
  }

  render(): IVnode {
    return (
      <g class={`sc-icon-triangle-${this.props.id || 0}`} transform={`translate(${this.props.x - (this.props.width/2)},${this.props.y - (this.props.height/2)})`}>
        <path d={this.getTrianglePath(-8, -12, this.props.width + 8, this.props.height + 8).join(' ')} class='sc-outer-highlighter' fill={this.props.fillColor} stroke-width='1' stroke='#fff' fill-opacity={this.state.highlighted} stroke-opacity={this.state.highlighted} style={{ 'transition': 'fill-opacity 0.2s linear' }} />
        <path d={this.getTrianglePath(0, 0, this.props.width, this.props.height).join(' ')} class='sc-outer-offset' fill={this.props.fillColor} opacity='1' stroke-width='0'/>
        <path d={this.getTrianglePath(2, 2, this.props.width-2, this.props.height-2).join(' ')} class='sc-inner-triangle' fill={'#fff'} opacity='1' stroke-width='0'/>
      </g>
    );
  }

  getTrianglePath(x: number, y: number, width: number, height: number): (string | number)[] {
    const sx: number = x/2;
    const sy: number = y/2;
    let d: (string | number)[] = [
      'M', sx + width/2, sy,
      'L', sx + width, sy + height,
      'L', sx, sy + height,
      'Z'
    ];
    return d;
  }

  normalize(): void {
    this.setState({highlighted : 0});
  }

  highlight(): void {
    this.setState({highlighted : 0.5});
  }
}

export default TriangleIcon;