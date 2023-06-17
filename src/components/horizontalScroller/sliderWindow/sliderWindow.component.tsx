import UtilCore from "../../../core/util.core";
import { Component } from "../../../viewEngin/component";
import { ISliderWindowProps } from "./sliderWindow.model";

/**
 * sliderWindow.component.tsx
 * @createdOn:17-Jun-2023
 * @author:SmartChartsNXT
 * @description: This components will create a window area for slider do view scope
 * @extends Component
 */

class SliderWindow extends Component {
  private titleId: string;

  constructor(props: ISliderWindowProps) {
    super(props);
    this.state = { ...this.props };
    this.titleId = UtilCore.getRandomID();
  }

  propsWillReceive(nextProps: ISliderWindowProps) {
    this.state = Object.assign({}, this.state, nextProps);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
  }

  render() {
    return (
      <g class='sc-slider-window-cont' transform={`translate(${this.state.posX},${this.state.posY})`} >
        <rect class='sc-hScroll-window' aria-labelledby={this.titleId} x={0} y={0} width={this.state.width} height={this.state.height} fill={this.props.offsetColor} storke='none' stroke-width='1' pointer-events='all' tabindex='0'
          fill-opacity={this.props.fillOpacity} style='transition: fill-opacity 0.3s linear;cursor: grab; cursor: -moz-grab; cursor: -webkit-grab;' events={this.state.events}>
        </rect>
        <title id={this.titleId}> Slider Window (use arrow left or right to slide) </title>
        <rect class={(this.props.focusedIn ? 'focus-in' : '')} x={0} y={0} rx={5} ry={5} width={this.props.width} height={this.props.height} pointer-events='none' stroke='none' fill='none' stroke-width='1' />
      </g>
    );
  }
}

export default SliderWindow;