/*
 * Coordinate Chart
 * @Version:1.1.0
 * @CreatedOn:12-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: Coordinate Chart inherits properties from BaseChart, It's parent of all Coordinate base charts. 
 */

"use strict";

let BaseChart = require("./baseChart");
let Grid = require("./../components/grid");
let VerticalLabels = require("./../components/verticalLabels");
let HorizonalLabels = require("./../components/horizontalLabels");
let Tooltip = require("./../components/tooltip");
let LegendBox = require("./../components/legendBox");

class CoordinateChart extends BaseChart {

  constructor(chartType, opts) {
    super(chartType, opts);
    this.grid = new Grid(this.CHART_OPTIONS.targetElem, this.chartType);
    this.vLabel = new VerticalLabels(); 
    this.hLabel = new HorizonalLabels(); 
    this.tooltip = new Tooltip(); 
    this.legendBox = new LegendBox(); 
  }
}

module.exports = CoordinateChart;