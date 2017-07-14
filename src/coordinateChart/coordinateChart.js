/*
 * Coordinate Chart
 * @Version:1.1.0
 * @CreatedOn:12-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: Coordinate Chart inherits properties from BaseChart, It's parent of all Coordinate base charts. 
 */

"use strict";

let BaseChart = require("./../base/baseChart");
let Grid = require("./../components/grid");
let VerticalLabels = require("./../components/verticalLabels");
let HorizonalLabels = require("./../components/horizontalLabels");
let HorizontalScroller = require("./../components/horizontalScroller");

class CoordinateChart extends BaseChart {

  constructor(chartType, opts) {
    super(chartType, opts);
    this.grid = new Grid(this.CHART_OPTIONS.targetElem, this.chartType);
    this.vLabel = new VerticalLabels(); 
    this.hLabel = new HorizonalLabels(); 
    this.hScroller = new HorizontalScroller();
  }
}

module.exports = CoordinateChart;