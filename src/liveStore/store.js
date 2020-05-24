'use strict';

/**
 * store.js
 * @createdOn:01-Jan-2020
 * @author:SmartChartsNXT
 * @description: This class was used to save state data in store.
 */

class Store {
  constructor(initialState = {}) {
    this._state = initialState;
  }

  getState() {
    return this._state;
  }

  setStore(state) {
    this._state = state;
  }

  getValue(key) {
    return this._state[key];
  }

  setValue(key, value) {
    return this._state[key] = value;
  }

  removeValue(key) {
    if(typeof key != 'undefined') {
      delete this._state[key];
    }
  }
}

export default Store;