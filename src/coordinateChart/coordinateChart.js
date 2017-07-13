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

class CoordinateChart extends BaseChart {

  constructor(chartType, opts) {
    super(chartType, opts);
    this.grid = new Grid(this.CHART_OPTIONS.targetElem, this.chartType);
    this.vLabel = new VerticalLabels(); 
    this.hLabel = new HorizonalLabels(); 
  }

  // createHorizontalLabel(categories, scaleX) {
  //   let self = this;
  //   let hTextLabel = this.CHART_DATA.objChart.querySelector("#hTextLabel");
  //   if (hTextLabel) {
  //     hTextLabel.parentNode.removeChild(hTextLabel);
  //   }
  //   let interval = scaleX || (this.CHART_DATA.gridBoxWidth / categories.length);
  //   /*if there is too much categories then discard some categories*/
  //   if (interval < 30) {
  //     let newCategories = [];
  //     let skipLen = Math.ceil(30 / interval);

  //     for (let i = 0; i < categories.length; i += skipLen) {
  //       newCategories.push(categories[i]);
  //     }
  //     categories = newCategories;
  //     interval *= skipLen;
  //   }
  //   let strText = "<g id='hTextLabel'>";
  //   for (let hText = 0; hText < categories.length; hText++) {
  //     let xPos = (this.CHART_DATA.marginLeft + (hText * interval) + (interval / 2));
  //     let yPos = (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 20);
  //     if (xPos > (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth)) {
  //       break;
  //     }
  //     strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + xPos + "' y='" + yPos + "' >";
  //     strText += "  <tspan  font-size='12' >" + categories[hText] + "<\/tspan>";
  //     strText += "</text>";
  //   }

  //   for (let hText = 0; hText < categories.length; hText++) {
  //     let xPos = (this.CHART_DATA.marginLeft + (hText * interval) + (interval));
  //     let yPos = (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight);
  //     if (xPos > (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth)) {
  //       break;
  //     }
  //     let d = ["M", xPos, yPos, "L", xPos, (yPos + 10)];
  //     strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
  //   }
  //   strText += "</g>";

  //   /*bind hover event*/
  //   this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strText);
  //   let hTextLabels = this.CHART_DATA.objChart.querySelectorAll("#hTextLabel text");

  //   for (let i = 0; i < hTextLabels.length; i++) {
  //     hTextLabels[i].addEventListener("mouseenter", function (e) {
  //       e.stopPropagation();
  //       let mousePointer = self.ui.cursorPoint(self.CHART_OPTIONS.targetElem, e);
  //       self.ui.toolTip(self.CHART_OPTIONS.targetElem, mousePointer, "#555", e.target.getAttribute("title"));
  //     }, false);

  //     hTextLabels[i].addEventListener("mouseleave", function (e) {
  //       e.stopPropagation();
  //       self.ui.toolTip(self.CHART_OPTIONS.targetElem, "hide");
  //     }, false);
  //   }

  // } /*End createHorizontalLabel()*/

}

module.exports = CoordinateChart;