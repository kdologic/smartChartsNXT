/**
 * chart.core.js
 * @createdOn:10-Jul-2017
 * @author: SmartChartsNXT
 * @version: 1.1.0
 * @description:SmartChartsNXT Core Library components. It's bootstrap the code, 
 * by loading appropriate dependencies. Loading ployfills and shims, fonts etc. 
 */

"use strict";

let polyfills = require("./../shims/polyfills");
let WebFonts = require("./../plugIns/webFontsLoader");

import Chart from './../charts/chart';

const PRE_LOADER_IMG = "<svg width='135' height='140' viewBox='0 0 135 140' xmlns='http://www.w3.org/2000/svg' fill='#555'> <rect y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='30' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='60' width='15' height='140' rx='6'> <animate attributeName='height' begin='0s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='90' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='120' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect></svg>";

class Core {
  constructor() {
    this.nameSpaceReadyStatus = false;
    // this.Chart = function(opts) {
    //     return new CHART_MODULES[opts.type](opts);
    // };
    this.Chart = Chart;
    this.initCore();
  }

  initCore() {
    this.addFont((event) => {
      this.nameSpaceReadyStatus = true;
    });
  } /*End initLib()*/

  addFont(cb) {
    WebFonts.load({
      google: {
        families: ['Lato:400,700']
      },
      /* Called when all of the web fonts have either finished loading or failed to load, as long as at least one loaded successfully. */
      active: function () {
        if (typeof cb === "function") {
          cb();
        }
      },
      inactive: function () {
        if (typeof cb === "function") {
          cb();
        }
      }
    });
  } /*End addFont()*/

  ready(successBack) {
    /* strat polling for the ready state*/
    let statusCheck = setInterval(() => {
      if (this.nameSpaceReadyStatus) {
        clearInterval(statusCheck);
        if (typeof successBack === "function") {
          let startTime = window.performance.now();
          try {
            successBack.call(this);
          } catch (ex) {
            this.handleError(ex);
          }

          let endTitme = window.performance.now();
          console.log("Time elapsed for chart: %c" + (endTitme - startTime) + " Ms", "color:green");
        }
      }
    }, 100);
  } /*End ready()*/

  handleError(ex, msg) {
    console.error("SmartChartsNXT:" + (ex.errorIn || ""));
    ex.stack && console.log(ex.stack);
  } /*End handleError()*/

}

module.exports = Core;