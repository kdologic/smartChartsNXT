/*
 * Coordinate Chart
 * @Version:1.1.0
 * @CreatedOn:12-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: Coordinate Chart inherits properties from BaseChart, It's parent of all Coordinate base charts. 
 */

"use strict";

let BaseChart = require("./../base/baseChart");

class CoordinateChart extends BaseChart {

  constructor(chartType, opts) {
      super(chartType, opts);
  }

  createGrid() {
    let d;
    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
    this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_CONST.hGridCount - 1));
    let hGrid = this.CHART_DATA.objChart.querySelector("#hGrid");
    if (hGrid) {
      hGrid.parentNode.removeChild(hGrid);
    }

    let strGrid = "";
    strGrid += "<g id='hGrid' >";
    for (let gridCount = 0; gridCount < this.CHART_CONST.hGridCount - 1; gridCount++) {
      d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight), "L", this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth, this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight)];
      strGrid += "<path fill='none' d='" + d.join(" ") + "' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
    }
    d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop, "L", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 10];
    strGrid += "<rect id='gridRect' x='" + this.CHART_DATA.marginLeft + "' y='" + this.CHART_DATA.marginTop + "' width='" + this.CHART_DATA.gridBoxWidth + "' height='" + this.CHART_DATA.gridBoxHeight + "' pointer-events='all' style='fill:none;stroke-width:0;stroke:#717171;' \/>";
    strGrid += "<path id='gridBoxLeftBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 1, "L", this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 1];
    strGrid += "<path id='gridBoxBottomBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strGrid += "</g>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strGrid);
    this.createVerticalLabel();
  } /*End createGrid()*/

  createVerticalLabel() {
    let vTextLabel = this.CHART_DATA.objChart.querySelector("#vTextLabel");
    if (vTextLabel) {
      vTextLabel.parentNode.removeChild(vTextLabel);
    }

    let interval = (this.CHART_DATA.maxima) / (this.CHART_CONST.hGridCount - 1);
    let strText = "<g id='vTextLabel'>";
    for (let gridCount = this.CHART_CONST.hGridCount - 1, i = 0; gridCount >= 0; gridCount--) {
      let value = (i++ * interval);
      value = (value >= 1000 ? (value / 1000).toFixed(2) + "K" : value.toFixed(2));
      strText += "<text font-family='Lato' fill='black'><tspan x='" + (this.CHART_DATA.marginLeft - 55) + "' y='" + (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight) + 5) + "' font-size='12' >" + ((this.CHART_OPTIONS.dataSet.yAxis.prefix) ? this.CHART_OPTIONS.dataSet.yAxis.prefix : "") + value + "<\/tspan></text>";
      let d = ["M", this.CHART_DATA.marginLeft, (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight)) + (i === 1 ? 1 : 0), "L", (this.CHART_DATA.marginLeft - 5), (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight) + (i === 1 ? 1 : 0))];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strText += "</g>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strText);

    let overFlow = 0;
    vTextLabel = this.CHART_DATA.objChart.querySelectorAll("#vTextLabel tspan");
    for (let i = 0; i < vTextLabel.length; i++) {
      if ((this.CHART_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50) < 0) {
        overFlow = Math.abs((this.CHART_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50));
      }
    }
    if (overFlow !== 0) {
      this.CHART_DATA.marginLeft = this.CHART_DATA.marginLeft + overFlow;
      this.createGrid();
    }
  } /*End createVerticalLabel()*/

  createHorizontalLabel(categories, scaleX) {
    let self = this;
    let hTextLabel = this.CHART_DATA.objChart.querySelector("#hTextLabel");
    if (hTextLabel) {
      hTextLabel.parentNode.removeChild(hTextLabel);
    }
    let interval = scaleX || (this.CHART_DATA.gridBoxWidth / categories.length);
    /*if there is too much categories then discard some categories*/
    if (interval < 30) {
      let newCategories = [];
      let skipLen = Math.ceil(30 / interval);

      for (let i = 0; i < categories.length; i += skipLen) {
        newCategories.push(categories[i]);
      }
      categories = newCategories;
      interval *= skipLen;
    }
    let strText = "<g id='hTextLabel'>";
    for (let hText = 0; hText < categories.length; hText++) {
      let xPos = (this.CHART_DATA.marginLeft + (hText * interval) + (interval / 2));
      let yPos = (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 20);
      if (xPos > (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth)) {
        break;
      }
      strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + xPos + "' y='" + yPos + "' >";
      strText += "  <tspan  font-size='12' >" + categories[hText] + "<\/tspan>";
      strText += "</text>";
    }

    for (let hText = 0; hText < categories.length; hText++) {
      let xPos = (this.CHART_DATA.marginLeft + (hText * interval) + (interval));
      let yPos = (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight);
      if (xPos > (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth)) {
        break;
      }
      let d = ["M", xPos, yPos, "L", xPos, (yPos + 10)];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strText += "</g>";

    /*bind hover event*/
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strText);
    let hTextLabels = this.CHART_DATA.objChart.querySelectorAll("#hTextLabel text");

    for (let i = 0; i < hTextLabels.length; i++) {
      hTextLabels[i].addEventListener("mouseenter", function (e) {
        e.stopPropagation();
        let mousePointer = self.ui.cursorPoint(self.CHART_OPTIONS.targetElem, e);
        self.ui.toolTip(self.CHART_OPTIONS.targetElem, mousePointer, "#555", e.target.getAttribute("title"));
      }, false);

      hTextLabels[i].addEventListener("mouseleave", function (e) {
        e.stopPropagation();
        self.ui.toolTip(self.CHART_OPTIONS.targetElem, "hide");
      }, false);
    }

  } /*End createHorizontalLabel()*/

}

module.exports = CoordinateChart; 