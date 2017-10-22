/*
 * chart.js
 * @CreatedOn: 22-Oct-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:This class will be entry point of all charts.
 */

"use strict";

import { render, h } from "./../core/pView.core";
import BaseChart from './../base/baseChart';

class Chart {
  constructor(opts){
    let vChart = render(<BaseChart opts={opts} />);
    let targetNode = document.querySelector("#" + opts.targetElem);
    targetNode.innerHTML = ''; 
    targetNode.appendChild(vChart);
  }
}

export default Chart; 