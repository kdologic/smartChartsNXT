'use strict';

import utilCore from './../core/util.core';
import Store from './store';

/**
 * storeManager.js
 * @createdOn:31-Dec-2019
 * @author:SmartChartsNXT
 * @description: This is a service class that will manage the state of multiple store.
 */

let _storeCollection = {};

class StoreManager {

  constructor() { }

  createStore(storeId = utilCore.uuidv4(), initialState = {}) {
    if (!storeId) {
      throw new Error('StoreManager: Invalid storeId !');
    }
    _storeCollection[storeId] = new Store(initialState);
    return storeId;
  }

  getStore(storeId) {
    return _storeCollection[storeId];
  }
}

export default new StoreManager();