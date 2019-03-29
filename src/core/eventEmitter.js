"use strict";

/**
 * eventEmitter.js
 * @createdOn: 14-Mar-2018
 * @author: SmartChartsNXT
 * @description:This is singleTone class for event emitter. For propagate events between components. 
 */

const EventEmitter = require('events');
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
    return instance[runId] = new EventEmitter();
  }

  getInstance(runId) {
    return instance[runId]; 
  }
}

export default new EventEmitterSingleTone();