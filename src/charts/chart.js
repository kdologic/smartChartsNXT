/**
 * chart.js
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @version: 1.0.0
 * @description:This class will be entry point of all charts.
 */

"use strict";

import { mountTo } from "./../viewEngin/pview";
import BaseChart from './../base/baseChart';
import UtilCore from './../core/util.core';
import Error from "./../components/errorView"; 

class Chart {
  constructor(opts){
    try {
      this.runId = UtilCore.uuidv4();
      this.targetNode = document.querySelector("#" + opts.targetElem);
      this.targetNode.setAttribute("runId", this.runId);
      this.renderChartBind = this.renderChart.bind(this, opts, this.runId, this.targetNode);
      this.renderChartBind(); 
      window.addEventListener('resize', this.renderChartBind, false); 
    }catch(ex) {
      this.showErrorScreen(opts, ex, ex.errorIn);
      throw ex; 
    }
  }

  renderChart(opts, runId, targetNode) {
    try {
      if(this.chartNode) {
        opts.animated = false; 
      }
      this.chartNode = mountTo(<BaseChart opts={opts} runid={runId} width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, targetNode);
    }catch(ex) {
      throw ex; 
    }
  }

  showErrorScreen(opts, ex, errorIn) {
    mountTo(<Error width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} chartType={opts.type} runId={this.runId}></Error>, this.targetNode);
  }

  // onWindowResize(callBackInit) {
  //   let self = this;
  //   let containerDiv = this.targetNode; 
  //   if (this.timeOut != null) {
  //     clearTimeout(this.timeOut);
  //   }
  //   callChart();

  //   function callChart() {
  //     if (containerDiv) {
  //       if (containerDiv.offsetWidth === 0 && containerDiv.offsetHeight === 0) {
  //         self.timeOut = setTimeout(() => {
  //           callChart();
  //         }, 100);
  //       } else {
  //         self.timeOut = setTimeout(() => {
  //           if (typeof callBackInit === "function") {
  //             callBackInit.call(self);
  //           }
  //         }, 500);
  //       }
  //     }
  //   }
  // } 
}

export default Chart; 