'use strict';

import { Component } from './../../viewEngin/pview';
import eventEmitter from './../../core/eventEmitter';

/**
 * interactiveHotspots.js
 * @createdOn: 27-Dec-2020
 * @author: SmartChartsNXT
 * @description: This components will create hotspot area in which is interactive.
 * @extends Component
 */

class InteractiveHotspots extends Component {

  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
    this.state = {
      hotspots: {}
    };

    this.onAddHotspot = this.onAddHotspot.bind(this);
    this.onRemoveHotspot = this.onRemoveHotspot.bind(this);
  }

  beforeMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('addHotspot', this.onAddHotspot);
    this.emitter.on('removeHotspot', this.onRemoveHotspot);
  }

  beforeUnmount() {
    this.emitter.removeListener('addHotspot', this.onAddHotspot);
    this.emitter.removeListener('removeHotspot', this.onRemoveHotspot);
  }

  render() {
    return (
      <g class='sc-interactive-hotspot-container' role="region">
        { this.getHotspots() }
      </g>
    );
  }

  getHotspots() {
    let hotspots = [];
    for(let spot in this.state.hotspots) {
      hotspots.push(this.state.hotspots[spot]);
    }
    return hotspots;
  }

  onAddHotspot(e) {
    if(e.id && e.hotspot) {
      this.state.hotspots[e.id] = e.hotspot;
    }
    this.update();
  }

  onRemoveHotspot(e) {
    if(e.id && this.state.hotspots[e.id]) {
      delete this.state.hotspots[e.id];
      this.update();
    }
  }

}

export default InteractiveHotspots;