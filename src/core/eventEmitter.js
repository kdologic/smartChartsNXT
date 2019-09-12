'use strict';

/**
 * eventEmitter.js
 * @createdOn: 14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This is singleTone class for event emitter. For communicate through events between components.
 */

const EventEmitter = require('events');
const MAX_LIMIT = 100;
let instance = {};

class EventEmitterSingleTone {
  constructor() {
    this._type = 'EventEmitterSingleTone';
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  createInstance(runId) {
    const  event = new EventEmitter();
    /* make event emitter sync and async mode*/
    event._emit = event.emit;
    event.emitSync = (...args) => {
      /* eslint-disable no-console */
      try {
        $SC.debug && $SC.debugEvents && console.info('Event name:', args[0]);
        $SC.debug && $SC.debugEvents && console.info('with data:', args[1]);
      }catch(ex) {
        console.error(ex);
      }

      event._emit(...args);
    };
    event.emit = (...args) => {
      setTimeout(() => {
        event.emitSync(...args);
      },0);
    };
    event.setMaxListeners(MAX_LIMIT);
    return instance[runId] = event;
  }

  getInstance(runId) {
    return instance[runId];
  }
}

export default new EventEmitterSingleTone();