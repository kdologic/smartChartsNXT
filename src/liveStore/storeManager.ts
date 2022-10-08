'use strict';

import UtilCore from '../core/util.core';
import { IStoreCollection } from '../models/global.models';
import Store from './store';

/**
 * storeManager.ts
 * @createdOn:31-Dec-2019
 * @author:SmartChartsNXT
 * @description: This is a service class that will manage the state of multiple store.
 */

class StoreManager {
  private _storeCollection: IStoreCollection = {};
  
  constructor() { }

  createStore(storeId: string = UtilCore.uuidv4(), initialState = {}) {
    if (!storeId) {
      throw new Error('StoreManager: Invalid storeId !');
    }
    this._storeCollection[storeId] = new Store(initialState);
    return storeId;
  }

  getStore(storeId: string) {
    return this._storeCollection[storeId];
  }
}

export default new StoreManager();