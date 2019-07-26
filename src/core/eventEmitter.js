'use strict';

/**
 * eventEmitter.js
 * @createdOn: 14-Mar-2018
 * @author: SmartChartsNXT
 * @description: This is singleTone class for event emitter. For communicate through events between components.
 */

const EventEmitter = require('events');
const MAX_LIMIT = 25;
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
    const  inst = new EventEmitter();
    inst.setMaxListeners(MAX_LIMIT);
    return instance[runId] = inst;
  }

  getInstance(runId) {
    return instance[runId];
  }
}

export default new EventEmitterSingleTone();