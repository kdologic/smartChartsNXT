'use strict';

import { Component } from './../viewEngin/pview';
import { OPTIONS_TYPE as ENUMS } from './../settings/globalEnums';
import eventEmitter from './../core/eventEmitter';
import { CircleIcon, TriangleIcon, DiamondIcon, StarIcon, CustomIcon } from './../icons/iconCollection';

/**
 * dataPoints.js
 * @createdOn:09-Mar-2018
 * @author:SmartChartsNXT
 * @description: This components will plot data points in chart area.
 * @extends Component
 */

class DataPoints extends Component {

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      highlightedIndex: null,
      pointSet: this.props.opacity ? this.props.pointSet : [],
      opacity: this.props.opacity,
      icons:{}
    };
    this.doHighlight = this.doHighlight.bind(this);
    this.normalize = this.normalize.bind(this);
  }

  propsWillReceive(newProps) {
    this.state.pointSet = newProps.opacity ? newProps.pointSet : [];
    this.state.opacity = newProps.opacity;
    this.state.icons = {};
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('highlightPointMarker', this.doHighlight);
    this.emitter.on('normalizeAllPointMarker', this.normalize);
  }

  componentWillUnmount() {
    this.emitter.removeListener('highlightPointMarker', this.doHighlight);
    this.emitter.removeListener('normalizeAllPointMarker', this.normalize);
    this.state.icons = {};
  }

  render() {
    return (
      <g class='sc-data-points'>
        {
          this.state.pointSet.map((point) => {
            if(point.isHidden) {
              return (<g class='sc-icon sc-hide'></g>);
            }
            return this.drawPoint(point);
          })
        }
      </g>
    );
  }

  drawPoint(point) {
    switch (this.props.type) {
      case ENUMS.ICON_TYPE.CIRCLE:
      default:
        return (
          <CircleIcon instanceId={point.index} id={point.index} x={point.x} y={point.y} r={this.props.markerWidth/2} fillColor={this.props.fillColor} highlighted={point.highlighted} strokeColor="#fff"
            onRef={ref => {
                    this.state.icons[point.index] = ref;
                  }}>
          </CircleIcon>
        );
      case ENUMS.ICON_TYPE.TRIANGLE:
        return (
          <TriangleIcon instanceId={point.index} id={point.index} x={point.x} y={point.y} width={this.props.markerWidth} height={this.props.markerHeight} fillColor={this.props.fillColor} highlighted={point.highlighted} strokeColor="#fff"
            onRef={ref => {
                    this.state.icons[point.index] = ref;
                  }}>
          </TriangleIcon>
        );
      case ENUMS.ICON_TYPE.DIAMOND:
        return (
          <DiamondIcon instanceId={point.index} id={point.index} x={point.x} y={point.y} width={this.props.markerWidth} height={this.props.markerHeight} fillColor={this.props.fillColor} highlighted={point.highlighted} strokeColor="#fff"
            onRef={ref => {
                    this.state.icons[point.index] = ref;
                  }}>
          </DiamondIcon>
        );
        case ENUMS.ICON_TYPE.STAR:
          return (
            <StarIcon instanceId={point.index} id={point.index} x={point.x} y={point.y} width={this.props.markerWidth} height={this.props.markerHeight} fillColor={this.props.fillColor} highlighted={point.highlighted} strokeColor="#fff"
              onRef={ref => {
                      this.state.icons[point.index] = ref;
                    }}>
            </StarIcon>
          );
        case ENUMS.ICON_TYPE.CUSTOM:
          return (
            <CustomIcon instanceId={point.index} id={point.index} x={point.x} y={point.y} width={this.props.markerWidth + 5} height={this.props.markerHeight + 5} fillColor={this.props.fillColor} URL={this.props.markerURL} highlighted={point.highlighted} strokeColor="#fff"
              onRef={ref => {
                      this.state.icons[point.index] = ref;
                    }}>
            </CustomIcon>
          );
    }
  }

  normalize(e) {
    if (this.props.instanceId !== e.seriesIndex || !this.state.icons[this.state.highlightedIndex]) {
      return;
    }
    if (this.props.opacity === 0) {
      this.setState({ pointSet: [] });
    } else {
      if(this.state.highlightedIndex !== undefined && this.state.highlightedIndex !== null) {
        this.state.icons[this.state.highlightedIndex].normalize();
      }
    }
    this.state.highlightedIndex = null;
  }

  doHighlight(e) {
    let index = e.highlightedPoint.pointIndex;
    if (index == undefined || index == null || isNaN(index) || e.highlightedPoint.seriesIndex !== this.props.instanceId || !this.state.icons[index]) {
      return;
    }
    if (this.props.opacity === 0) {
      let pData = { x: e.highlightedPoint.relX, y: e.highlightedPoint.relY, index};
      this.setState({ pointSet: [pData] });
    }
    this.state.highlightedIndex = index;
    this.state.icons[index].highlight();
  }
}

export default DataPoints;