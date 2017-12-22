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

class Chart {
  constructor(opts){
    try {
      const runId = UtilCore.uuidv4();
      this.targetNode = document.querySelector("#" + opts.targetElem);
      this.targetNode.setAttribute("runId", runId);
      this.renderChartBind = this.renderChart.bind(this, opts, runId, this.targetNode);
      this.renderChartBind(); 
      window.addEventListener('resize', this.renderChartBind, false); 
    }catch(ex) {
      this.showErrorScreen(opts, ex, ex.errorIn);
      throw ex; 
    }
  }

  renderChart(opts, runId, targetNode) {
    if(this.chartNode) {
      opts.animated = false; 
    }
    this.chartNode = mountTo(<BaseChart opts={opts} runid={runId} width={targetNode.offsetWidth} height={targetNode.offsetHeight} />, targetNode);
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

  showErrorScreen(opts, ex, mgs) {
    return; 
    let container = document.querySelector("#" + opts.targetElem);
    let width = container.offsetWidth;
    let height = container.offsetHeight;

    let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
      "version='1.1'" +
      "width='" + width + "'" +
      "height='" + height + "'" +
      "id='" + opts.type + "-error'" +
      "style='background:#eee;-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
      "> <\/svg>";

    container.innerHTML = "";
    container.insertAdjacentHTML("beforeend", strSVG);
    let shadowId = this.ui.dropShadow(opts.type + "-error");
    let svgContainer = container.querySelector("#" + opts.type + "-error");
    let upperBoxPath = [
      "M", 0, 0,
      "H", width,
      "V", 50
    ];
    let lowerBoxPath = [
      "M", 0, height,
      "H", width,
      "v", -40
    ];
    let zigzagPath = [];
    for (let i = width, counter = 0; i >= 0; i -= 10, counter++) {
      zigzagPath.push("l", -10, (counter % 2 === 0 ? -10 : 10));
    }
    zigzagPath.push("Z");
    upperBoxPath.push.apply(upperBoxPath, zigzagPath);
    lowerBoxPath.push.apply(lowerBoxPath, zigzagPath);
    strSVG = "<path id='upperBox' d='" + upperBoxPath.join(" ") + "' filter = '" + shadowId + "' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>";
    strSVG += "<path id='lowerBox' d='" + lowerBoxPath.join(" ") + "' filter = '" + shadowId + "' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>";
    svgContainer.insertAdjacentHTML("beforeend", strSVG);

    strSVG = "<circle cx='" + (width / 2) + "' cy='" + (height / 2 - 80) + "' r='25' fill='#717171'/>";
    strSVG += "<text id='errorTextGroup' fill='#fff' x='" + (width / 2 - 5) + "' y='" + ((height / 2) - 70) + "' font-weight='bold' font-size='35' >i<\/text>";
    strSVG += "<g>";
    strSVG += "  <text id='errorTextGroup' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan class='err-text' id='errtxt1' x='" + 0 + "' y='" + height / 2 + "' font-size='26'>Oops! Something went wrong. <\/tspan>";
    strSVG += "    <tspan class='err-text' id='errtxt2' x='" + 0 + "' y='" + ((height / 2) + 30) + "' font-size='16'>See the javascript console for technical details.<\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    svgContainer.insertAdjacentHTML("beforeend", strSVG);
    let arrErrText = svgContainer.querySelectorAll("#errorTextGroup .err-text");
    (function adjustFontSize() {
      let overFlow = false;
      for (let j = 0; j < arrErrText.length; j++) {
        let eTextLen = arrErrText[j].getComputedTextLength();
        arrErrText[j].setAttribute("x", (width - eTextLen) / 2);
        if (eTextLen > width) {
          overFlow = true;
          break;
        }
      }
      if (overFlow) {
        for (let j = 0; j < arrErrText.length; j++) {
          arrErrText[j].setAttribute("font-size", arrErrText[j].getAttribute("font-size") - 1);
        }
        adjustFontSize();
      }
    })();
  }
}

export default Chart; 