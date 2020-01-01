'use strict';

/**
 * store.js
 * @createdOn:01-Jan-2020
 * @author:SmartChartsNXT
 * @description: This class was used to save state data in store.
 */

class Store {
  constructor(initialState={}) {
    this._state = initialState;
  }

  getState() {
    return this._state;
  }

  setStore(state) {
    this._state = state;
  }
}

export default Store;