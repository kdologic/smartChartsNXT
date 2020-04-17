'use strict';

import uiCore from './../core/ui.core';
import font from './../styles/font-lato';
//import Morphing from './../plugIns/morph';
import '../plugIns/classList.shim.min';
import Chart from './../charts/chart';
import viewConfig from './../viewEngin/config';

/**
 * chart.core.js
 * @createdOn: 10-Jul-2017
 * @author: SmartChartsNXT
 * @description: SmartChartsNXT Core Library components. It's bootstrap the code,
 * by loading appropriate dependencies. Loading polyfills and shims, fonts etc.
 */

class Core {
  constructor() {
    this._debug = false;
    this.debugRenderTime = false;
    this.debugEvents = false;
    this.namespaceReadyStatus = false;
    this.Chart = Chart;
    this.loadFont();
  }

  loadFont() {
    uiCore.prependStyle(document.querySelector('head'), font);
    let intervalId = setInterval(() => {
      if (document.body) {
        clearInterval(intervalId);
        document.body.insertAdjacentHTML('beforeend', '<p id=\'sc-temp-font-loader\' aria-hidden=\'true\' style=\'visibility:hidden;position: absolute;left: -10000px;top: -10000px;font-family:Lato;\'>Loading...</p>');
        setTimeout(() => {
          this.namespaceReadyStatus = true;
          setTimeout(() => {
            let fLoader = document.getElementById('sc-temp-font-loader');
            fLoader.parentNode.removeChild(fLoader);
          }, 1000);
        });
      }
    }, 10);
  }

  set debug(isEnable = true) {
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

  ready(successBack) {
    /* Start polling for the ready state*/
    let statusCheck = setInterval(() => {
      if (this.namespaceReadyStatus) {
        clearInterval(statusCheck);
        if (typeof successBack === 'function') {
          let startTime = window.performance.now();
          try {
            successBack.call(this);
          } catch (ex) {
            this.handleError(ex);
          }

          let endTime = window.performance.now();
          /* eslint-disable-next-line no-console */
          console.info('Time elapsed for chart: %c' + (endTime - startTime) + ' Ms', 'color:green');
        }
      }
    }, 100);
  }

  handleError(ex) {
    /* eslint-disable-next-line no-console */
    ex.errorIn && console.error('SmartChartsNXT:' + ex.errorIn);
    /* eslint-disable-next-line no-console */
    console.error(ex);
  }

}

export default Core;