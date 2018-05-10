/**
 * chart.js
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @version: 2.0.0
 * @description:This class will be entry point of all charts.
 */

"use strict";

import { mountTo } from "./../viewEngin/pview";
import BaseChart from './../base/baseChart';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import Error from "./../components/errorView"; 

class Chart {
  constructor(opts){
    try {
      this.runId = UtilCore.uuidv4();
      eventEmitter.createInstance(this.runId);
      this.targetNode = document.querySelector("#" + opts.targetElem);
      this.targetNode.setAttribute("runId", this.runId);
      this.core = mountTo(<BaseChart opts={opts} runId={this.runId} width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} />, this.targetNode);
      window.addEventListener('resize', this.onResize.bind(this), false); 
      console.log(this.core);
    }catch(ex) {
      this.showErrorScreen(opts, ex, ex.errorIn);
      throw ex; 
    }
  }

  onResize() {
    this.core.self.setState({width: this.targetNode.offsetWidth, height: this.targetNode.offsetHeight});
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