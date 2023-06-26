import UtilCore from "../../../core/util.core";
import { Component } from "../../../viewEngin/component";
import { ISliderLeftHandleProps } from "./sliderLeftHandle.model";

/**
 * sliderLeftHandle.component.tsx
 * @createdOn:17-Jun-2023
 * @author:SmartChartsNXT
 * @description: This components will create a left handle to move slider
 * @extends Component
 */

class SliderLeftHandle extends Component<ISliderLeftHandleProps> {
  private titleId: string;
  private gradId: string;

  constructor(props: ISliderLeftHandleProps) {
    super(props);
    this.state = { ...this.props };
    this.titleId = UtilCore.getRandomID();
    this.gradId = UtilCore.getRandomID();
  }

  propsWillReceive(nextProps: ISliderLeftHandleProps) {
    this.state = { ...this.state, ...nextProps };
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    this.calcSliderPaths();
    return (
      <g class='sc-slider-left-handle' transform={`translate(${this.state.leftOffset},0)`} >
        <defs>
          <filter xmlns='http://www.w3.org/2000/svg' id={this.gradId} height='130%' width='130%'>
            <feGaussianBlur in='SourceAlpha' stdDeviation='1'></feGaussianBlur>
            <feOffset dx='0' dy='1' result='offsetblur'></feOffset>
            <feComponentTransfer>
              <feFuncA type='linear' slope='0.7'></feFuncA>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode></feMergeNode>
              <feMergeNode in='SourceGraphic'></feMergeNode>
            </feMerge>
          </filter>
        </defs>
        <rect class='sc-slider-left-offset' x={-this.state.leftOffset} y='0' width={this.state.leftOffset} height={this.props.height} events={this.props.events.offsetEvent} fill='rgba(102,133,194,0.3)' fill-opacity='0' >
          <title> Click to move window here  </title>
        </rect>
        <rect class={(this.props.focusedIn ? 'focus-in' : '')} x={-this.props.height / 2} y={0} rx={5} ry={5} width={this.props.height} height={this.props.height} pointer-events='none' stroke='none' fill='none' stroke-width='1' />
        <g style={{ 'cursor': 'ew-resize' }} events={this.props.events.handlerEvent} role='slider' aria-labelledby={this.titleId} aria-orientation='horizontal' aria-valuemin='0' aria-valuemax='100' aria-valuenow={Math.round(this.state.offsetPercent)} tabindex='0'>
          <title id={this.titleId}> Left Slider Handle (use arrow key left or right to slide) </title>
          <circle class='sc-slider-left-sel' cx={0} cy={this.props.height / 2} r={15} fill={this.props.handlerColor} stroke='none' filter={`url(#${this.gradId})`}></circle>
          <path class='sc-slider-left-sel-inner' stroke={this.props.innerBarColor} fill='none' d={this.state.sliderLeftSelInner} pointer-events='none' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>
        </g>
      </g>
    );
  }

  calcSliderPaths(): void {
    const innerBarLeft = [
      'M', -2, (this.props.height / 2) - 5,
      'L', -2, (this.props.height / 2) + 5,
      'M', 2, (this.props.height / 2) - 5,
      'L', 2, (this.props.height / 2) + 5
    ];

    this.state = {
      ...this.state,
      sliderLeftSelInner: innerBarLeft.join(' ')
    };
  }
}

export default SliderLeftHandle;