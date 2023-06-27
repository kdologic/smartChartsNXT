'use strict';

import { Component } from './../viewEngin/pview';
import eventEmitter from './../core/eventEmitter';
import UtilCore from './../core/util.core';
import MarkerIcon from './marker/markerIcon.component';

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
      icons: {},
      hotspots: {}
    };
    this.doHighlight = this.doHighlight.bind(this);
    this.normalize = this.normalize.bind(this);
  }

  propsWillReceive(newProps) {
    this.state.pointSet = newProps.opacity ? newProps.pointSet : [];
    this.state.opacity = newProps.opacity;
    this.state.icons = {};
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('highlightPointMarker', this.doHighlight);
    this.emitter.on('normalizeAllPointMarker', this.normalize);
  }

  beforeUnmount() {
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
            let category = this.props.xAxisInfo.selectedCategories[point.index];
            if (this.props.xAxisInfo.categories.parseAsDate && UtilCore.isDate(category)) {
              category = UtilCore.dateFormat(category).format('LL');
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
      <MarkerIcon index={iconType + '_' + this.props.instanceId + '_' + point.index} type={iconType} instanceId={point.index} id={point.index} x={point.x} y={point.y} width={iconWidth} height={iconHeight}
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
    if (this.state.highlightedIndex !== undefined && this.state.hotspots[this.state.highlightedIndex]) {
      this.emitter.emit('removeHotspot', { id: this.state.hotspots[this.state.highlightedIndex].id });
      delete this.state.hotspots[this.state.highlightedIndex];
    }
    this.state.highlightedIndex = null;
  }

  doHighlight(e) {
    let index = e.highlightedPoint.pointIndex;
    if (index == undefined || index == null || isNaN(index) || e.highlightedPoint.seriesIndex !== this.props.instanceId) {
      return;
    }
    if (this.props.opacity === 0) {
      let pData = {
        x: e.highlightedPoint.relX,
        y: e.highlightedPoint.relY, index
      };
      this.setState({ pointSet: [pData] });
      this.state.highlightedIndex = index;
    } else if (this.state.icons[index]) {
      this.state.highlightedIndex = index;
      this.state.icons[index].highlight();
    }

    let customMarker = this.props.customizedMarkers[index];
    let events = customMarker && customMarker.events ? customMarker.events : this.props.events;

    if (!this.state.hotspots[index] && typeof events.click === 'function') {
      let hpId = 'hp-' + UtilCore.getRandomID();
      let label = this.props.xAxisInfo.selectedCategories[index];
      let formattedLabel = label;
      if (this.props.xAxisInfo.categories.parseAsDate && UtilCore.isDate(label)) {
        label = label.valueOf();
        formattedLabel = UtilCore.dateFormat(label).format(this.props.xAxisInfo.categories.displayDateFormat || 'LL');
      }
      formattedLabel = `${(this.props.xAxisInfo.prepend || '') + formattedLabel + (this.props.xAxisInfo.append || '')}`;
      let point = {
        ...e.highlightedPoint,
        ...{ value: this.state.pointSet.filter((v) => v.index == index)[0].value },
        ...{ label, formattedLabel }
      };
      let icon = {
        type: this.props.type,
        URL: this.props.markerURL,
        width: this.props.markerWidth,
        height: this.props.markerHeight
      };
      if (this.props.customizedMarkers[index]) {
        icon = { ...icon, ...this.props.customizedMarkers[index] };
      }
      let hotspotElem = <circle id={hpId} class="sc-hotspot" cx={e.highlightedPoint.relX - e.highlightedPoint.offsetLeft} cy={e.highlightedPoint.relY} r={icon.width / 2 + 8} fill="red" fill-opacity={0.0001} style={{ 'cursor': 'pointer' }}
        events={{
          click: (event) => {
            events.click.bind({
              x: e.highlightedPoint.relX - e.highlightedPoint.offsetLeft,
              y: e.highlightedPoint.relY,
              color: this.props.fillColor,
              seriesName: this.props.seriesName,
              seriesIndex: e.highlightedPoint.seriesIndex,
              pointIndex: index,
              point: point,
              icon: icon
            })(event);
          }
        }}></circle>;
      this.state.hotspots[index] = {
        id: hpId,
        hotspot: hotspotElem
      };
    }
    if (this.state.hotspots[index]) {
      this.emitter.emit('addHotspot', this.state.hotspots[index]);
    }
  }
}

export default DataPoints;