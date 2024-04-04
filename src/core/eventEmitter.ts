'use strict';

import Events from 'events';
import { IEventStore } from './core.model';
const MAX_LIMIT = 100;
let instance: IEventStore = {};

/**
 * eventEmitter.ts
 * @createdOn: 14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This is singleTone class for event emitter. For communicate through events between components.
 */

class EventEmitterSingleTone {
  private _type: string;

  constructor() {
    this._type = 'EventEmitterSingleTone';
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  createInstance(runId: string): CustomEvents {
    const event: CustomEvents = new CustomEvents();
    event.setMaxListeners(MAX_LIMIT);
    return instance[runId] = event;
  }

  getInstance(runId: string): CustomEvents {
    return instance[runId];
  }
}

/* make event emitter sync and async mode*/
export class CustomEvents extends Events {
  private _emit: (eventName: string | symbol, ...args: any[]) => boolean;
  constructor() {
    super();
    this._emit = super.emit;
  }

  emit(eventName: string | symbol, ...args: Array<any>): boolean {
    setTimeout(() => {
      this.emitSync(eventName, ...args);
    },0);
    return true;
  }

  emitSync(eventName: string | symbol, ...args: Array<any>): void {
    /* eslint-disable no-console */
    try {
      $SC.debug && $SC.debugEvents && console.info('Event name:', eventName);
      $SC.debug && $SC.debugEvents && console.info('with data:', args[0]);
    }catch(ex) {
      console.error(ex);
    }

    this._emit(eventName, ...args);
  };
}

export default new EventEmitterSingleTone();