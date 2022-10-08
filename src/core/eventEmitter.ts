'use strict';

import Events from 'events';
import { IEventStore } from '../models/global.models';
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

  getInstance(runId: string) {
    return instance[runId];
  }
}

/* make event emitter sync and async mode*/
export class CustomEvents extends Events {
  private _emit: any;
  constructor() {
    super();
    this._emit = super.emit;
  }

  emit(...args: Array<any>): boolean {
    setTimeout(() => {
      this.emitSync(...args);
    },0);
    return true;
  }

  emitSync(...args: Array<any>): void {
    /* eslint-disable no-console */
    try {
      $SC.debug && $SC.debugEvents && console.info('Event name:', args[0]);
      $SC.debug && $SC.debugEvents && console.info('with data:', args[1]);
    }catch(ex) {
      console.error(ex);
    }

    this._emit(...args);
  };
}

export default new EventEmitterSingleTone();