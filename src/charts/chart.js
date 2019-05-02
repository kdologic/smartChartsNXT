"use strict";

import { mountTo } from "./../viewEngin/pview";
import BaseChart from './../base/baseChart';
import UtilCore from './../core/util.core';
import UiCore from './../core/ui.core';
import eventEmitter from './../core/eventEmitter';
import Error from "./../components/errorView"; 
import fontLato from "./../styles/font-lato.css";

/**
 * chart.js
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @description:This class will be the entry point of all charts.
 */

class Chart {
  constructor(opts){
    try {
      this.runId = UtilCore.uuidv4();
      this.events = eventEmitter.createInstance(this.runId);
      this.targetNode = document.querySelector("#" + opts.targetElem);
      this.targetNode.setAttribute("runId", this.runId);
      UiCore.prependStyle(document.querySelector('head'), fontLato);
      this.core = mountTo(<BaseChart opts={opts} runId={this.runId} width={this.targetNode.offsetWidth} height={this.targetNode.offsetHeight} />, this.targetNode);
      window.addEventListener('resize', this.onResize.bind(this), false); 
      _debug && console.debug(this.core);
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
}

export default Chart; 