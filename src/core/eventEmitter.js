/**
 * eventEmitter.js
 * @createdOn: 14-Mar-2018
 * @author: SmartChartsNXT
 * @version: 2.0.0
 * @description:This is singleTone class for event emitter. For propagate events between components. 
 */

"use strict";

let events = require('events');
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
    instance[runId] = new events.EventEmitter();
  }

  getInstance(runId) {
    return instance[runId]; 
  }
}

export default new EventEmitterSingleTone();

// class EventEmitterSingleTone {
//   constructor() {
//     if (!instance) {
//       instance = new events.EventEmitter();
//     }

//     this._type = 'EventEmitterSingleTone';
//     return instance;
//   }

//   get type() {
//     return this._type;
//   }

//   set type(value) {
//     this._type = value;
//   }
// }

// export default new EventEmitterSingleTone();
