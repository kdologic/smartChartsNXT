'use strict';

import { Component } from './../viewEngin/pview';
import eventEmitter from './../core/eventEmitter';
import dateFormat from 'dateformat';
import utilCore from './../core/util.core';
import MarkerIcon from './markerIcon';

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
      icons: {}
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
      <g class='sc-data-points' aria-hidden={false}>
        {
          this.state.pointSet.map((point) => {
            if (point.isHidden) {
              return (<g class='sc-icon sc-hide'></g>);
            }
            let category = this.props.xAxisInfo.categories[point.index];
            if (this.props.xAxisInfo.parseAsDate && utilCore.isDate(category)) {
              category = dateFormat(category, 'longDate');
            }
            let ariaLabel = `${point.index + 1}. ${(this.props.xAxisInfo.prepend || '') + category + (this.props.xAxisInfo.append || '')}, ${(this.props.yAxisInfo.prepend || '') + (point.value || 0).toFixed(2) + (this.props.yAxisInfo.append || '')}. ${this.props.seriesName}.`;
            return (
              <g role='img' aria-label={ariaLabel}>
                {this.drawPoint(point)}
              </g>);
          })
        }
      </g>
    );
  }

  drawPoint(point) {
    let iconType = this.props.type;
    let iconURL = this.props.markerURL;
    let iconWidth = this.props.markerWidth;
    let iconHeight = this.props.markerHeight;
    if (this.props.customizedMarkers[point.index]) {
      let marker = this.props.customizedMarkers[point.index];
      iconType = marker.type;
      iconURL = marker.URL;
      iconWidth = marker.width;
      iconHeight = marker.height;
    }
    return (
      <MarkerIcon type={iconType} instanceId={point.index} id={point.index} x={point.x} y={point.y} width={iconWidth} height={iconHeight}
        fillColor={this.props.fillColor} highlighted={point.highlighted} strokeColor="#fff" URL={iconURL || ''}
        onRef={ref => {
          this.state.icons[point.index] = ref;
        }}>
      </MarkerIcon>
    );
  }

  normalize(e) {
    if (this.props.instanceId !== e.seriesIndex || !this.state.icons[this.state.highlightedIndex]) {
      return;
    }
    if (this.props.opacity === 0) {
      this.setState({ pointSet: [] });
    } else {
      if (this.state.highlightedIndex !== undefined && this.state.highlightedIndex !== null) {
        this.state.icons[this.state.highlightedIndex].normalize();
      }
    }
    this.state.highlightedIndex = null;
  }

  doHighlight(e) {
    let index = e.highlightedPoint.pointIndex;
    if (index == undefined || index == null || isNaN(index) || e.highlightedPoint.seriesIndex !== this.props.instanceId) {
      return;
    }
    if (this.props.opacity === 0) {
      let pData = { x: e.highlightedPoint.relX, y: e.highlightedPoint.relY, index };
      this.setState({ pointSet: [pData] });
    }else {
      this.state.highlightedIndex = index;
      this.state.icons[index].highlight();
    }
  }
}

export default DataPoints;