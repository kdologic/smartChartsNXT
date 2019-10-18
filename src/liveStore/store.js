'use strict';

/**
 * store.js
 * @createdOn:16-Oct-2019
 * @author:SmartChartsNXT
 * @description: This components will manage the data as central storage.
 */

 let _store = {};

 class StoreManager {

  constructor(runId) {
    
  }

  createStore(runId, initialState = {}){
    _store[runId] = {};
  }

 }

 export default StoreManager;