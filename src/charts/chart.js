"use strict";

import { mountTo } from "./../viewEngin/pview";
import BaseChart from './../base/baseChart';
import UtilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import Error from "./../components/errorView"; 

/**
 * chart.js
 * @createdOn: 22-Oct-2017
 * @author: SmartChartsNXT
 * @description:This class will be the entry point of all charts.
 */

//const PRE_LOADER_IMG = 
class Chart {
  constructor(opts){
    try {
      this.runId = UtilCore.uuidv4();
      this.events = eventEmitter.createInstance(this.runId);
      this.targetNode = document.querySelector("#" + opts.targetElem);
      this.targetNode.setAttribute("runId", this.runId);
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

function Loader(props) {
  return (
  <svg width='135' height='140' viewBox='0 0 135 140' xmlns='http://www.w3.org/2000/svg' fill='#555'>
    <rect y='10' width='15' height='120' rx='6'> 
      <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> 
      <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> 
    </rect> 
    <rect x='30' y='10' width='15' height='120' rx='6'> 
      <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> 
      <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> 
    </rect> 
    <rect x='60' width='15' height='140' rx='6'> 
      <animate attributeName='height' begin='0s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> 
      <animate attributeName='y' begin='0s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' />
    </rect> 
    <rect x='90' y='10' width='15' height='120' rx='6'> 
      <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> 
      <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> 
    </rect> 
    <rect x='120' y='10' width='15' height='120' rx='6'> 
      <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> 
      <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> 
    </rect>
    <text x="15" y="140" style="font-family:Lato;">Loading...</text>
  </svg>);
}

export default Chart; 