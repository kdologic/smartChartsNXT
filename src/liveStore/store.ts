'use strict';

import UtilCore from '../core/util.core';

/**
 * store.ts
 * @createdOn:01-Jan-2020
 * @author:SmartChartsNXT
 * @description: This class was used to save state data in store.
 */

export class Store {
  private _state: any;

  constructor(initialState: any = {}) {
    this._state = initialState;
  }

  getState() {
    return this._state;
  }

  setStore(state: any) {
    this._state = state;
  }

  getValue(key: string) {
    return this._state[key];
  }

  setValue(key: string, value: any) {
    if(typeof this._state[key] === 'object' && typeof value === 'object') {
      this._state[key] = UtilCore.extends({}, this._state[key], value);
    }else {
      this._state[key] = value;
    }
  }

  removeValue(key: string) {
    if(typeof key != 'undefined') {
      delete this._state[key];
    }
  }
}

export default Store;