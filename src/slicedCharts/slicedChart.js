/*
 * Sliced Chart
 * @Version:1.1.0
 * @CreatedOn:28-Aug-2017
 * @Author:SmartChartsNXT
 * @Description: Coordinate Chart inherits properties from BaseChart, It's parent of all Coordinate base charts. 
 */

"use strict";

let BaseChart = require("./../base/baseChart");
let Tooltip = require("./../components/tooltip");

class SlicedChart extends BaseChart {

  constructor(chartType, opts) {
    super(chartType, opts);
    
    this.tooltip = new Tooltip(); 
  }
}

module.exports = CoordinateChart;