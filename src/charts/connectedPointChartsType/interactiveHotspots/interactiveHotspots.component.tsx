'use strict';

import { Component } from '../../../viewEngin/pview';
import eventEmitter, { CustomEvents } from '../../../core/eventEmitter';
import { IAddHotspotEvent, IInteractiveHotspotsProps, IRemoveHotspotEvent } from './interactiveHotspots.model';
import { IVnode } from '../../../viewEngin/component.model';

/**
 * interactiveHotspots.component.tsx
 * @createdOn: 27-Dec-2020
 * @author: SmartChartsNXT
 * @description: This components will create hotspot area in which is interactive.
 * @extends Component
 */

class InteractiveHotspots extends Component<IInteractiveHotspotsProps> {
  private emitter: CustomEvents;

  constructor(props: IInteractiveHotspotsProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.state = {
      hotspots: {}
    };

    this.onAddHotspot = this.onAddHotspot.bind(this);
    this.onRemoveHotspot = this.onRemoveHotspot.bind(this);
  }

  beforeMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined);
  }

  afterMount(): void {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    this.emitter.on('addHotspot', this.onAddHotspot);
    this.emitter.on('removeHotspot', this.onRemoveHotspot);
  }

  beforeUnmount(): void {
    this.emitter.removeListener('addHotspot', this.onAddHotspot);
    this.emitter.removeListener('removeHotspot', this.onRemoveHotspot);
  }

  render(): IVnode {
    return (
      <g class='sc-interactive-hotspot-container' role="region">
        { this.getHotspots() }
      </g>
    );
  }

  getHotspots(): IVnode[] {
    let hotspots = [];
    for (let spot in this.state.hotspots) {
      hotspots.push(this.state.hotspots[spot]);
    }
    return hotspots;
  }

  onAddHotspot(eventData: IAddHotspotEvent): void {
    if (eventData.id && eventData.hotspot) {
      this.state.hotspots[eventData.id] = eventData.hotspot;
    }
    this.update();
  }

  onRemoveHotspot(eventData: IRemoveHotspotEvent): void {
    if (eventData.id && this.state.hotspots[eventData.id]) {
      delete this.state.hotspots[eventData.id];
      this.update();
    }
  }

}

export default InteractiveHotspots;