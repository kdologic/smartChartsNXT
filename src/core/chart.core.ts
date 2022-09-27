'use strict';

import UiCore from './ui.core';
import font from '../styles/font-lato';
//import Morphing from './../plugIns/morph';
import '../plugIns/classList.shim.min';
import Chart from '../charts/chart';
import viewConfig from '../viewEngin/config';

/**
 * chart.core.ts
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: SmartChartsNXT Core Library components. It's bootstrap the code,
 * by loading appropriate dependencies. Loading polyfills and shims, fonts etc.
 */

class Core {
  private _debug: boolean = false;
  private _debugRenderTime: boolean = false;
  public debugEvents: boolean = false;
  public namespaceReadyStatus: boolean = false;
  public Chart: any; // Todo: declare proper type

  constructor() {
    this._debug = false;
    this.debugRenderTime = false;
    this.debugEvents = false;
    this.namespaceReadyStatus = false;
    this.Chart = Chart;
    this.loadFont();
  }

  loadFont() {
    UiCore.prependStyle(document.querySelector('head'), font);
    this.namespaceReadyStatus = true;
  }

  set debug(isEnable) {
    this._debug = isEnable;
    this.debugRenderTime = isEnable;
    this.debugEvents = isEnable;
    viewConfig.debug = isEnable;
  }

  get debug() {
    return this._debug;
  }

  set debugRenderTime(isEnable) {
    this._debugRenderTime = isEnable;
    viewConfig.debugRenderTime = isEnable;
  }

  get debugRenderTime() {
    return this._debugRenderTime;
  }


  /** since we add static base64 font in commonStyle area so ignore dynamic font loading now */
  // addFont(cb) {
  //   WebFonts.load({
  //     google: {
  //       families: ['Lato:400']
  //     },
  //     /* Called when all of the web fonts have either finished loading or failed to load, as long as at least one loaded successfully. */
  //     active: function () {
  //       if (typeof cb === 'function') {
  //         cb();
  //       }
  //     },
  //     inactive: function () {
  //       if (typeof cb === 'function') {
  //         cb();
  //       }
  //     }
  //   });
  // }

  /**
   * When chart will be ready with all its dependencies then it will call the success callback.
   * @param successBack 
   * @returns Promise
   */
  ready(successBack?: any) {
    if(typeof successBack === 'function') {
      this.executeChart(successBack);
      return;
    }
    return new Promise((resolve, reject) => {
      this.executeChart(resolve, reject);
    });
  }

  executeChart(chart: any, error?: any) {
    if (this.namespaceReadyStatus) {
      if (typeof chart === 'function') {
        let startTime = window.performance.now();
        try {
          chart.call(this);
        } catch (ex) {
          this.handleError(ex);
          typeof error == 'function' && error(ex);
        }
        let endTime = window.performance.now();
        /* eslint-disable-next-line no-console */
        console.info('Time elapsed for chart: %c' + (endTime - startTime) + ' Ms', 'color:green');
        return;
      }
    }else {
      /* Start polling for the ready state*/
      let intervalCount = 0;
      let statusCheck = setInterval(() => {
        if (this.namespaceReadyStatus) {
          clearInterval(statusCheck);
          this.executeChart(chart);
        }else {
          intervalCount++;
          if(intervalCount > 100) {
            this.handleError({errorIn: 'SmartchartsNXT: Module loading error'});
            typeof error == 'function' && error();
          }
        }
      }, 100);
    }
  }

  handleError(ex: any) {
    /* eslint-disable-next-line no-console */
    ex.errorIn && console.error('SmartChartsNXT:' + ex.errorIn);
    /* eslint-disable-next-line no-console */
    console.error(ex);
  }

}

export default Core;