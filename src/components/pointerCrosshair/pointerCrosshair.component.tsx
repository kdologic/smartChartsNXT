'use strict';

import Point from '../../core/point';
import { Component } from '../../viewEngin/pview';
import defaultConfig from '../../settings/config';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import UiCore from '../../core/ui.core';
import SpeechBox from '../../components/speechBox/speechBox.components';
import Style from '../../viewEngin/style';
import { IPointerCrosshairConfigExtended, IPointerCrosshairProps } from './pointerCrosshair.model';
import { IHighlightedPoint, IPointerCrosshairConfig } from '../../charts/connectedPointChartsType/connectedPointChartsType.model';
import { CROSSHAIR_SPREAD, HORIZONTAL_ALIGN, VERTICAL_ALIGN } from '../../global/global.enums';
import { IVnode } from '../../viewEngin/component.model';

/**
 * pointerCrosshair.component.tsx
 * @createdOn:21-Apr-2018
 * @author:SmartChartsNXT
 * @description: This components will create a vertical and horizontal cross line to follow the pointer or touch location.
 * @extends Component
 */

class PointerCrosshair extends Component<IPointerCrosshairProps> {
  private emitter: CustomEvents;
  private config: IPointerCrosshairConfigExtended;
  constructor(props: IPointerCrosshairProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.config = { vertical: {}, horizontal: {} };
    this.setConfig(this.props.opts || this.config);
    this.state = {
      vx1: 0,
      vy1: 0,
      vx2: 0,
      vy2: 0,
      hx1: 0,
      hy1: 0,
      hx2: 0,
      hy2: 0,
      overflow: 0,
      labelTextPadding: 5,
      verticalLabelText: '',
      verticalLabelWidth: this.config.vertical.labelMinWidth,
      horizontalLabelHeight: this.config.vertical.labelMinHeight,
      horizontalLabelText: '',
      horizontalLabelWidth: this.config.horizontal.labelMinWidth,
      verticalLabelHeight: this.config.horizontal.labelMinHeight,
      isHorizontalCrosshairVisible: false,
      isVerticalCrosshairVisible: false
    };
    this.setVCrosshair = this.setVCrosshair.bind(this);
    this.setHCrosshair = this.setHCrosshair.bind(this);
  }

  setConfig(opts: IPointerCrosshairConfig): void {
    ['vertical', 'horizontal'].forEach((type: keyof IPointerCrosshairConfig) => {
      opts[type] = (opts[type] || {});
      this.config[type] = {
        ...this.config[type], ...{
          spread: (opts[type].spread || (type === 'vertical' ? CROSSHAIR_SPREAD.FULL : CROSSHAIR_SPREAD.NONE)).toLocaleLowerCase(),
          lineColor: opts[type].lineColor || '#000',
          strokeWidth: Number(opts[type].lineWidth) || 1,
          lineOpacity: Number(opts[type].lineOpacity) || 1,
          labelTextColor: opts[type].labelTextColor || '#fff',
          labelBackgroundColor: opts[type].labelBackgroundColor || '#000',
          labelOpacity: Number(opts[type].labelOpacity) || 1,
          dashArray: (opts[type].style || 'dashed').toLocaleLowerCase() === 'dashed' ? 3 : 0,
          labelMinWidth: 100,
          labelMinHeight: 30
        }
      };
    });
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('setVerticalCrosshair', this.setVCrosshair);
    this.emitter.on('setHorizontalCrosshair', this.setHCrosshair);
  }

  beforeUnmount(): void {
    this.emitter.removeListener('setVerticalCrosshair', this.setVCrosshair);
    this.emitter.removeListener('setHorizontalCrosshair', this.setHCrosshair);
  }

  propsWillReceive(nextProps: IPointerCrosshairProps): void {
    this.setConfig(nextProps.opts || this.config);
  }

  render(): IVnode {
    return (
      <g class='sc-pointer-crosshair' style={{ 'pointerEvents': 'none' }}>
        <Style>
          {{
            '.sc-crosshair-group': {
              transition: 'transform 0.3s cubic-bezier(.03,.26,.32,1)'
            },
            '.sc-crosshair-group.sc-h-crosshair': {
              transform: `translate(0, ${this.state.hy1}px)`
            },
            '.sc-crosshair-group.sc-v-crosshair': {
              transform: `translate(${this.state.vx1}px,0)`
            }
          }}
        </Style>
        <g>
          {this.config.horizontal.spread !== CROSSHAIR_SPREAD.NONE && this.state.isHorizontalCrosshairVisible &&
            <g class='sc-crosshair-group sc-h-crosshair' transform={`translate(0, ${this.state.hy1})`}>
              <line x1={this.state.hx1} y1={0} x2={this.state.hx2} y2={0}
                fill='none' stroke={this.config.horizontal.lineColor} stroke-width={this.config.horizontal.strokeWidth} opacity={this.config.horizontal.lineOpacity} stroke-dasharray={this.config.horizontal.dashArray} shape-rendering='optimizeSpeed' />
              {this.getHorizontalSpeechBox()}
              {this.getHorizontalLabelText()}
            </g>
          }
        </g>
        <g>
          {this.config.vertical.spread !== CROSSHAIR_SPREAD.NONE && this.state.isVerticalCrosshairVisible &&
            <g class='sc-crosshair-group sc-v-crosshair' transform={`translate(${this.state.vx1},0)`}>
              <line x1={0} y1={this.state.vy1} x2={0} y2={this.state.vy2}
                fill='none' stroke={this.config.vertical.lineColor} stroke-width={this.config.vertical.strokeWidth} opacity={this.config.vertical.lineOpacity} stroke-dasharray={this.config.vertical.dashArray} shape-rendering='optimizeSpeed' />
              {this.getVerticalSpeechBox()}
              {this.getVerticalLabelText()}
            </g>
          }
        </g>
      </g>
    );
  }

  getVerticalSpeechBox(): IVnode {
    if (this.props.xAxis.positionOpposite === true) {
      let posY = this.state.vy1 + 5;
      if (this.props.xAxis.labelAlign === VERTICAL_ALIGN.TOP) {
        posY = this.state.vy1 - this.state.verticalLabelHeight - 5;
      }
      return (
        <SpeechBox x={this.state.boxLeft} y={posY} width={this.state.verticalLabelWidth} height={this.state.verticalLabelHeight} cpoint={new Point(0, this.state.vy1)}
          anchorBaseWidth={5} bgColor={this.config.vertical.labelBackgroundColor} fillOpacity={this.config.vertical.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} >
        </SpeechBox>
      );

    } else {
      let posY = this.state.vy2 + 5;
      if (this.props.xAxis.labelAlign === VERTICAL_ALIGN.TOP) {
        posY = this.state.vy2 - this.state.verticalLabelHeight - 5;
      }
      return (
        <SpeechBox x={this.state.boxLeft} y={posY} width={this.state.verticalLabelWidth} height={this.state.verticalLabelHeight} cpoint={new Point(0, this.state.vy2)}
          anchorBaseWidth={5} bgColor={this.config.vertical.labelBackgroundColor} fillOpacity={this.config.vertical.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} >
        </SpeechBox>
      );
    }
  }

  getHorizontalSpeechBox(): IVnode {
    if (this.props.yAxis.positionOpposite === true) {
      let posX = this.state.hx2 + 5;
      if (this.props.yAxis.labelAlign === HORIZONTAL_ALIGN.RIGHT) {
        posX = this.state.hx2 - this.state.horizontalLabelWidth - 5;
      }
      return (
        <SpeechBox x={posX} y={-this.state.horizontalLabelHeight / 2} width={this.state.horizontalLabelWidth} height={this.state.horizontalLabelHeight} cpoint={new Point(this.state.hx2, 0)}
          anchorBaseWidth={5} bgColor={this.config.horizontal.labelBackgroundColor} fillOpacity={this.config.horizontal.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} >
        </SpeechBox>);
    } else {
      let posX = this.state.hx1 - this.state.horizontalLabelWidth - 5;
      if (this.props.yAxis.labelAlign === HORIZONTAL_ALIGN.LEFT) {
        posX = this.state.hx1 + 5;
      }
      return (
        <SpeechBox x={posX} y={-this.state.horizontalLabelHeight / 2} width={this.state.horizontalLabelWidth} height={this.state.horizontalLabelHeight} cpoint={new Point(this.state.hx1, 0)}
          anchorBaseWidth={5} bgColor={this.config.horizontal.labelBackgroundColor} fillOpacity={this.config.horizontal.labelOpacity} shadow={true} strokeColor='none' strokeWidth={0} >
        </SpeechBox>);
    }
  }

  getVerticalLabelText(): IVnode {
    if (this.props.xAxis.positionOpposite === true) {
      let posY = this.state.vy1 + 25;
      if (this.props.xAxis.labelAlign === VERTICAL_ALIGN.TOP) {
        posY = this.state.vy1 - 15;
      }
      return (
        <text fill={this.config.vertical.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
          <tspan x={-this.state.overflow} y={posY}>{this.state.verticalLabelText}</tspan>
        </text>
      );
    } else {
      let posY = this.state.vy2 + 25;
      if (this.props.xAxis.labelAlign === VERTICAL_ALIGN.TOP) {
        posY = this.state.vy2 - 15;
      }
      return (
        <text fill={this.config.vertical.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
          <tspan x={-this.state.overflow} y={posY}>{this.state.verticalLabelText}</tspan>
        </text>
      );
    }
  }

  getHorizontalLabelText(): IVnode {
    if (this.props.yAxis.positionOpposite === true) {
      let posX = this.state.hx2 + (this.state.horizontalLabelWidth / 2) + 5;
      if (this.props.yAxis.labelAlign === HORIZONTAL_ALIGN.RIGHT) {
        posX = this.state.hx2 - (this.state.horizontalLabelWidth / 2) - 5;
      }
      return (
        <text fill={this.config.horizontal.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
          <tspan x={posX} y={5}>{this.state.horizontalLabelText}</tspan>
        </text>
      );
    } else {
      let posX = this.state.hx1 + (this.state.horizontalLabelWidth / 2) + 5;
      if (this.props.yAxis.labelAlign === HORIZONTAL_ALIGN.RIGHT) {
        posX = this.state.hx1 - (this.state.horizontalLabelWidth / 2) - 5;
      }
      return (
        <text fill={this.config.horizontal.labelTextColor} font-family={defaultConfig.theme.fontFamily} text-rendering='geometricPrecision' text-anchor='middle' stroke='none'>
          <tspan x={posX} y={5}>{this.state.horizontalLabelText}</tspan>
        </text>
      );
    }

  }

  setVCrosshair(data: IHighlightedPoint[]): void {
    if (!data || this.config.vertical.spread === CROSSHAIR_SPREAD.NONE) {
      this.setState({ isVerticalCrosshairVisible: false, verticalLabelText: '' });
      return;
    }
    this.state.verticalLabelText = '' + data[0].formattedLabel;
    let textWidth = UiCore.getComputedTextWidth(this.getVerticalLabelText()) + (2 * this.state.labelTextPadding);
    let topY = this.config.vertical.spread === CROSSHAIR_SPREAD.FULL ? this.props.vLineStart : Math.min(...data.map(d => d.y));
    let vState = {
      isVerticalCrosshairVisible: true,
      vx1: data[0].x,
      vy1: topY,
      vx2: data[0].x,
      vy2: this.props.vLineEnd,
      verticalLabelWidth: textWidth > this.config.vertical.labelMinWidth ? textWidth : this.config.vertical.labelMinWidth,
      overflow: 0,
      boxLeft: 0
    };
    if (this.props.xAxis.positionOpposite === true) {
      vState.vy1 = this.props.vLineStart;
      vState.vy2 = this.config.vertical.spread === CROSSHAIR_SPREAD.FULL ? this.props.vLineEnd : Math.min(...data.map(d => d.y));
    }
    vState.boxLeft = -(vState.verticalLabelWidth / 2);
    if (vState.vx1 - (vState.verticalLabelWidth / 2) < 0) {
      let overflow = vState.vx1 - (vState.verticalLabelWidth / 2) - 5;
      vState.boxLeft = vState.boxLeft - overflow;
      vState.overflow = overflow;
    }
    if (vState.vx1 + (vState.verticalLabelWidth / 2) > (this as any).context.svgWidth) {
      let overflow = (vState.vx1 + (vState.verticalLabelWidth / 2)) - (this as any).context.svgWidth + 5;
      vState.boxLeft = vState.boxLeft - overflow;
      vState.overflow = overflow;
    }
    this.setState(vState);
  }

  setHCrosshair(data: IHighlightedPoint[]): void {
    if (!data || this.config.horizontal.spread === CROSSHAIR_SPREAD.NONE) {
      this.setState({ isHorizontalCrosshairVisible: false, horizontalLabelText: '' });
      return;
    }
    this.state.horizontalLabelText = '' + data[0].formattedValue;
    let textWidth = UiCore.getComputedTextWidth(this.getHorizontalLabelText()) + (2 * this.state.labelTextPadding);
    let topY = Math.min(...data.map(d => d.y));
    let hState = {
      isHorizontalCrosshairVisible: true,
      hx1: this.props.hLineStart,
      hy1: topY,
      hx2: this.config.horizontal.spread === CROSSHAIR_SPREAD.FULL ? this.props.hLineEnd : data[0].x,
      hy2: topY,
      horizontalLabelWidth: textWidth
    };
    if (this.props.yAxis.positionOpposite) {
      hState.hx1 = this.config.horizontal.spread === CROSSHAIR_SPREAD.FULL ? this.props.hLineStart : data[0].x;
      hState.hx2 = this.props.hLineEnd;
    }
    this.setState(hState);
  }

}
export default PointerCrosshair;