/*
 * SVG Pie Chart 2D
 * @Version:1.1.0
 * @CreatedOn:07-Jul-2016
 * @Author:SmartChartsNXT
 * @description:This will generate a 2d Pie chart. Using SVG 1.1 elements and HTML 5 standard. 
 * @JSFiddle:
 * @Sample caller code:
 * let settings = {
      "title":"Browser Statistics and Trends",
      "outline":2,
      "canvasBorder":true,
      "subTitle":"As of Q1, 2016",
      "targetElem":"chartContainer",
      "bgColor":"gray",
      "showLegend":true,
      "animated":false,
      "dataSet":[
        {
          "label":"Chrome",
          "value":"72.6"
        },
        {
          "label":"IE",
          "value":"5.7"
        },
        {
          "label":"Safari",
          "value":"3.6",
          "slicedOut":true
        },
        {
          "label":"Firefox",
          "value":"16.9"
        },
        {
          "label":"Opera",
          "value":"1.2"
        }
      ]
    }; 
  SmartChartsNXT.ready(function(){
    let pieChart = new SmartChartsNXT.PieChart(settings);
  });
 */
"use strict";

let SlicedChart = require("./../../base/slicedChart");
let Point = require("./../../core/point");

class PieChart extends SlicedChart {

  constructor(opts) {
    super("pieChart", opts);
    let self = this;
    this.CHART_DATA = this.util.extends({
      scaleX: 0,
      scaleY: 0,
      svgCenter: 0,
      pieCenter: 0,
      uniqueDataSet: [],
      totalValue: 0,
      pieWidth: 160,
      pieHeight: 160,
      offsetWidth: 20, // distance of text label from left and right side 
      offsetHeight: 80, // distance of text label from top and bottom side 
      pieSet: [],
      dragStartAngle: 0,
      dragEndPoint: null,
      mouseDown: 0,
      mouseDrag: 0,
      pieWithTextSpan: 0,
      maxTextLen: 0
    }, this.CHART_DATA);

    this.CHART_OPTIONS = this.util.extends({}, this.CHART_OPTIONS);

    this.CHART_CONST = this.util.extends({
      FIX_WIDTH: 800,
      FIX_HEIGHT: 600,
      MIN_WIDTH: 300,
      MIN_HEIGHT: 500
    }, this.CHART_CONST);

    this.EVENT_BINDS = {
      onWindowResizeBind: self.onWindowResize.bind(self, self.init),
      onPieClickBind: self.onPieClick.bind(self),
      onLegendHoverBind: self.onLegendHover.bind(self),
      onLegendLeaveBind: self.onLegendLeave.bind(self),
      onLegendClickBind: self.onLegendClick.bind(self)
    };

    this.init();
    if (this.CHART_OPTIONS.animated !== false) {
      this.showAnimatedView();
    }
  }

  init() {
    try {
      super.initBase();
      this.initDataSet();

      if (this.CHART_OPTIONS.showLegend) {
        this.CHART_CONST.MIN_WIDTH = 300;
      }

      if (this.CHART_OPTIONS.showLegend) {
        if (this.CHART_OPTIONS.width <= 480) {
          this.CHART_DATA.pieWidth = this.CHART_DATA.pieHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 20 / 100;
          this.CHART_DATA.pieCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y);
        } else if (this.CHART_OPTIONS.width <= 680) {
          this.CHART_DATA.pieWidth = this.CHART_DATA.pieHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 40 / 100;
          this.CHART_DATA.pieCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 20);
        } else {
          this.CHART_DATA.pieWidth = this.CHART_DATA.pieHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 40 / 100;
          this.CHART_DATA.pieCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 40);
        }
      } else {
        this.CHART_DATA.pieWidth = this.CHART_DATA.pieHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 20 / 100;
        this.CHART_DATA.pieCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 70);
      }

      this.prepareChart();
      this.tooltip.createTooltip(this);
    } catch (ex) {
      ex.errorIn = `Error in PieChart with runId:${this.getRunId()}`;
      throw ex;
    }


  } /*End init()*/

  initDataSet() {
    this.CHART_DATA.pieSet = [];
    this.CHART_DATA.uniqueDataSet = [];
    this.CHART_DATA.totalValue = 0;
  } /*End initDataSet()*/

  prepareChart() {
    let self = this;
    this.prepareDataSet();
    let strSVG = "";
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / this.CHART_CONST.FIX_WIDTH * this.CHART_OPTIONS.width) + "' y='" + (50 / this.CHART_CONST.FIX_HEIGHT * this.CHART_OPTIONS.height) + "' font-size='25'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").textContent = this.CHART_OPTIONS.title;
    this.CHART_DATA.chartSVG.querySelector("#txtSubtitle").textContent = this.CHART_OPTIONS.subTitle;

    let startAngle;
    let endAngle = 0;
    let strokeColor = this.CHART_DATA.uniqueDataSet.length > 1 ? "#eee" : "none";
    for (let i in this.CHART_DATA.uniqueDataSet) {
      startAngle = endAngle;
      endAngle += (this.CHART_DATA.uniqueDataSet[i].percent * 3.6);
      let color = this.CHART_DATA.uniqueDataSet[i].color;
      this.createPie(startAngle, endAngle, color, strokeColor, i);
    }

    this.resetTextPos();
    if (this.CHART_OPTIONS.showLegend) {
      let lSet = [];
      this.CHART_DATA.uniqueDataSet.map((data, index) => {
        lSet.push({
          label: data.label,
          value: data.value,
          color: data.color
        });
      });
      this.legendBox.createLegends(this, "legendContainer", {
        left: 10,
        top: self.CHART_DATA.pieCenter.y + (self.CHART_DATA.pieHeight) + self.CHART_DATA.offsetHeight + 20,
        width: self.CHART_DATA.width - this.left,
        legendSet: lSet,
        type: "horizontal",
        border: false,
        background: "#eee"
      });
    }
    this.bindEvents();
    this.slicedOutOnSettings();
    this.render();

  } /*End prepareChart()*/


  createPie(startAngle, endAngle, color, strokeColor, index) {
    let percent = this.CHART_DATA.uniqueDataSet[index].percent.toFixed(2);
    let strSVG = "";
    strSVG += "  <rect class='pie" + index + "' id='colorLegend" + index + "' width='300' height='100' fill='" + color + "' style='opacity:1;' />";
    strSVG += "  <text class='pie" + index + "' id='txtPieGrpPie" + index + "' fill='#717171' font-family='Lato' >";
    strSVG += "  <tspan class='pie" + index + "' id='txtPie" + index + "' x='100' y='50' font-size='16'><\/tspan></text>";
    strSVG += "  <path class='pie" + index + "' id='pieHover" + index + "'  fill='" + color + "' stroke='none' stroke-width='0' style='transition: fill-opacity 0.3s linear; fill-opacity:0; cursor:pointer;' \/> ";
    strSVG += "  <path class='pie" + index + "'  id='upperArcPie" + index + "'  fill='" + color + "' stroke='" + strokeColor + "' stroke-width='" + (this.CHART_OPTIONS.outline || 1) + "' style='cursor:pointer;' \/>";
    strSVG += "  <path class='pie" + index + "' id='pathToLegend" + index + "'  fill='none' stroke='#555' stroke-width='1' \/>";

    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
    let upperArcPath = this.geom.describeEllipticalArc(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.CHART_DATA.pieWidth, this.CHART_DATA.pieHeight, startAngle, endAngle, 0);
    this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + index).setAttribute("d", upperArcPath.d);
    let textLabel = this.CHART_DATA.uniqueDataSet[index]["label"];
    this.CHART_DATA.chartSVG.querySelector("#txtPie" + index).textContent = (textLabel + " [" + percent + "%]");

    let midAngle = (startAngle + endAngle) / 2;
    let self = this;
    let pie = {
      "id": "pie" + index,
      "upperArcPath": upperArcPath,
      "midAngle": midAngle,
      "slicedOut": self.CHART_DATA.uniqueDataSet[index].slicedOut,
      "percent": percent
    };
    this.CHART_DATA.pieSet.push(pie);
  } /*End createPie()*/

  describePieArc(cx, cy, rMaxX, rMaxY, rMinX, rMinY, startAngle, endAngle, sweepFlag) {
    let fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }

    let outerArcStart = this.geom.polarToCartesian(cx, cy, this.geom.getEllipticalRadious(rMaxX, rMaxY, endAngle), endAngle);
    let outerArcEnd = this.geom.polarToCartesian(cx, cy, this.geom.getEllipticalRadious(rMaxX, rMaxY, startAngle), startAngle);
    let innerArcStart = this.geom.polarToCartesian(cx, cy, this.geom.getEllipticalRadious(rMinX, rMinY, endAngle), endAngle);
    let innerArcEnd = this.geom.polarToCartesian(cx, cy, this.geom.getEllipticalRadious(rMinX, rMinY, startAngle), startAngle);
    let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    let d = [
      "M", outerArcStart.x, outerArcStart.y,
      "A", rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y,
      "L", innerArcEnd.x, innerArcEnd.y,
      "A", rMinX, rMinY, 0, largeArcFlag, Math.abs(sweepFlag - 1), innerArcStart.x, innerArcStart.y,
      "Z"
    ];

    if (fullArc) {
      d.push("L", outerArcStart.x, outerArcStart.y);
    }
    return {
      "d": d.join(" "),
      "outerArc": [rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y].join(" "),
      "outerArcStart": outerArcStart,
      "outerArcEnd": outerArcEnd,
      "innerArc": [rMinX, rMinY, 0, largeArcFlag, sweepFlag, innerArcStart.x, innerArcStart.y].join(" "),
      "innerArcStart": innerArcStart,
      "innerArcEnd": innerArcEnd,
      "center": new Point(cx, cy),
      "rMaxX": rMaxX,
      "rMaxY": rMaxY,
      "startAngle": startAngle,
      "endAngle": endAngle
    };

  } /*End describePieArc()*/

  bindEvents() {
    let mouseDownPos;
    let self = this;
    try {
      for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
        let upperArcPie = this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + pieIndex);
        upperArcPie.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          mouseDownPos = {
            x: e.clientX,
            y: e.clientY
          };
          let elemId = e.target.getAttribute("class");
          let pieIndex = elemId.substring("pie".length);
          this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex).setAttribute("d", "");
          this.CHART_DATA.mouseDown = 1;

        }, false);

        upperArcPie.addEventListener("touchstart", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 1;
        }, false);

        upperArcPie.addEventListener("mouseup", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 0;
          if (this.CHART_DATA.mouseDrag === 0) {
            let elemClass = e.target.getAttribute("class");
            let pieIndex = elemClass.substring("pie".length);
            //fire Event onLegendClick
            let onPieClick = new this.event.Event("onPieClick", {
              srcElement: self,
              originEvent: e,
              pieIndex: pieIndex
            });
            this.event.dispatchEvent(onPieClick);
          }
          this.CHART_DATA.mouseDrag = 0;
        }, false);

        upperArcPie.addEventListener("touchend", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 0;
          this.CHART_DATA.mouseDrag = 0;
        }, false);

        upperArcPie.addEventListener("mousemove", (e) => {
          if (this.CHART_DATA.uniqueDataSet.length <= 1) {
            return;
          }
          if (this.CHART_DATA.mouseDown === 1 && (mouseDownPos.x !== e.clientX && mouseDownPos.y !== e.clientY)) {
            let dragStartPoint = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
            let dragAngle = this.getAngle(this.CHART_DATA.pieCenter, dragStartPoint);

            if (dragAngle > this.CHART_DATA.dragStartAngle) {
              this.rotateChart(2, false);
            } else {
              this.rotateChart(-2, false);
            }
            this.CHART_DATA.dragStartAngle = dragAngle;
            this.CHART_DATA.mouseDrag = 1;
            this.tooltip.hide();
          } else {
            let mousePos = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
            let pieData, elemId = e.target.getAttribute("class");
            let pieIndex = elemId.substring("pie".length);

            for (let i in this.CHART_DATA.pieSet) {
              if (this.CHART_DATA.pieSet[i].id === elemId) {
                pieData = this.CHART_DATA.pieSet[i];
              }
            }
            let row1 = this.CHART_DATA.uniqueDataSet[pieIndex].label + ", " + this.CHART_DATA.uniqueDataSet[pieIndex].value;
            let row2 = this.CHART_DATA.uniqueDataSet[pieIndex].percent.toFixed(2) + "%";
            let color = (this.CHART_OPTIONS.dataSet[pieIndex].color ? this.CHART_OPTIONS.dataSet[pieIndex].color : this.util.getColor(pieIndex));
            this.tooltip.updateTip(mousePos, color, row1, row2);
          }
        }, false);

        upperArcPie.addEventListener("touchmove", (e) => {
          e.preventDefault();
          let dragStartPoint = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.changedTouches[0]);
          let dragAngle = this.getAngle(this.CHART_DATA.pieCenter, dragStartPoint);

          if (dragAngle > this.CHART_DATA.dragStartAngle) {
            this.rotateChart(2, false);
          } else {
            this.rotateChart(-2, false);
          }
          this.CHART_DATA.dragStartAngle = dragAngle;
          this.CHART_DATA.mouseDrag = 1;
        }, false);

        upperArcPie.addEventListener("mouseenter", (e) => {
          if (this.CHART_DATA.mouseDown === 0) {
            let pieData, elemId = e.target.getAttribute("class");
            let pieIndex = elemId.substring("pie".length);

            for (let i = 0; i < this.CHART_DATA.pieSet.length; i++) {
              if (this.CHART_DATA.pieSet[i].id === elemId) {
                pieData = this.CHART_DATA.pieSet[i];
              }
            }
            let pieHover = this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex);
            let pieHoverPath;
            let hoverWidth = Math.round(this.CHART_DATA.offsetWidth * 30 / 100);
            hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
            hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
            if (pieData.slicedOut) {
              let shiftIndex = 15;
              let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, pieData.midAngle), pieData.midAngle);
              pieHoverPath = this.describePieArc(shiftedCentre.x, shiftedCentre.y, this.CHART_DATA.pieWidth + hoverWidth, this.CHART_DATA.pieHeight + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, pieData.upperArcPath.startAngle, pieData.upperArcPath.endAngle, 0);
            } else {
              pieHoverPath = this.describePieArc(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.CHART_DATA.pieWidth + hoverWidth, this.CHART_DATA.pieHeight + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, pieData.upperArcPath.startAngle, pieData.upperArcPath.endAngle, 0);
            }
            pieHover.setAttribute("d", pieHoverPath.d);
            pieHover.style["fill-opacity"] = 0.4;
          }
        }, false);

        upperArcPie.addEventListener("mouseleave", (e) => {
          let elemId = e.target.getAttribute("class");
          let pieIndex = elemId.substring("pie".length);
          this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex).style["fill-opacity"] = 0;
          this.tooltip.hide();
        }, false);

      } /*End of for loop*/

      this.CHART_DATA.chartSVG.addEventListener("mouseup", (e) => {
        e.stopPropagation();
        this.CHART_DATA.mouseDown = 0;
        this.CHART_DATA.mouseDrag = 0;
      }, false);

      this.CHART_DATA.chartSVG.addEventListener("touchend", (e) => {
        e.stopPropagation();
        this.CHART_DATA.mouseDown = 0;
        this.CHART_DATA.mouseDrag = 0;
      }, false);

      /*Bind event for pie click */
      this.event.off("onPieClick", this.EVENT_BINDS.onPieClickBind);
      this.event.on("onPieClick", this.EVENT_BINDS.onPieClickBind);

      /*Add event for legends */
      this.event.off("onLegendHover", this.EVENT_BINDS.onLegendHoverBind);
      this.event.on("onLegendHover", this.EVENT_BINDS.onLegendHoverBind);
      this.event.off("onLegendLeave", this.EVENT_BINDS.onLegendLeaveBind);
      this.event.on("onLegendLeave", this.EVENT_BINDS.onLegendLeaveBind);
      this.event.off("onLegendClick", this.EVENT_BINDS.onLegendClickBind);
      this.event.on("onLegendClick", this.EVENT_BINDS.onLegendClickBind);

      /*Add events for resize chart window */
      window.removeEventListener('resize', this.EVENT_BINDS.onWindowResizeBind);
      window.addEventListener('resize', this.EVENT_BINDS.onWindowResizeBind, true);

    } catch (ex) {
      ex.errorIn = `Error in PieChart events with runId:${this.getRunId()}`;
      throw ex;
    }
  } /*End bindEvents()*/

  onPieClick(e) {
    if (this.CHART_DATA.uniqueDataSet.length <= 1) {
      return void 0;
    }
    let index = e.pieIndex;
    let pieData = this.CHART_DATA.pieSet[index];
    let sliceOut = this.CHART_DATA.pieSet[index].slicedOut;
    this.CHART_DATA.pieSet[index].slicedOut = !sliceOut;
    let shiftIndex = sliceOut ? 15 : 1;
    let shiftInterval = setInterval(() => {
      let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, pieData.midAngle), pieData.midAngle);
      if (isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y)) {
        shiftedCentre = this.CHART_DATA.pieCenter;
      }
      let sPoint = this.geom.polarToCartesian(shiftedCentre.x, shiftedCentre.y, this.geom.getEllipticalRadious(this.CHART_DATA.pieWidth, this.CHART_DATA.pieHeight, pieData.midAngle), pieData.midAngle);
      let ePoint = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.pieWidth + this.CHART_DATA.offsetWidth, this.CHART_DATA.pieHeight + this.CHART_DATA.offsetHeight, pieData.midAngle), pieData.midAngle);
      ePoint.x += (pieData.midAngle > 180 ? -shiftIndex : shiftIndex);
      let lPath = ["M", sPoint.x, sPoint.y, "L", ePoint.x, ePoint.y];
      lPath.push("l", (pieData.midAngle > 180 ? -5 : 5), 0);
      this.CHART_DATA.chartSVG.querySelector("#pathToLegend" + index).setAttribute("d", lPath.join(" "));

      let upperArcPie = this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + index);
      upperArcPie.setAttribute("transform", "translate(" + (shiftedCentre.x - this.CHART_DATA.pieCenter.x) + "," + (shiftedCentre.y - this.CHART_DATA.pieCenter.y) + ")");

      let txtPie = this.CHART_DATA.chartSVG.querySelector("#txtPieGrpPie" + index);
      txtPie.setAttribute("transform", "translate(" + (pieData.midAngle > 180 ? -shiftIndex : shiftIndex) + ", 0)");

      let colorLegend = this.CHART_DATA.chartSVG.querySelector("#colorLegend" + index);
      colorLegend.setAttribute("transform", "translate(" + (pieData.midAngle > 180 ? -shiftIndex : shiftIndex) + ", 0)");

      shiftIndex = sliceOut ? shiftIndex - 1 : shiftIndex + 1;
      if ((!sliceOut && shiftIndex === 15) || (sliceOut && shiftIndex === -1)) {
        clearInterval(shiftInterval);
      }
    }, 10);
  } /*End onPieClick()*/

  onLegendHover(e) {
    let pieIndex = e.legendIndex;
    let pieData = this.CHART_DATA.pieSet[pieIndex];
    let pieHover = this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex);
    let hoverWidth = Math.round(this.CHART_DATA.offsetWidth * 30 / 100);
    hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
    hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
    let pieHoverPath;
    if (pieData.slicedOut) {
      let shiftIndex = 15;
      let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, pieData.midAngle), pieData.midAngle);
      pieHoverPath = this.describePieArc(shiftedCentre.x, shiftedCentre.y, this.CHART_DATA.pieWidth + hoverWidth, this.CHART_DATA.pieHeight + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, pieData.upperArcPath.startAngle, pieData.upperArcPath.endAngle, 0);
    } else {
      pieHoverPath = this.describePieArc(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.CHART_DATA.pieWidth + hoverWidth, this.CHART_DATA.pieHeight + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, this.CHART_DATA.offsetWidth + hoverWidth, pieData.upperArcPath.startAngle, pieData.upperArcPath.endAngle, 0);
    }
    pieHover.setAttribute("d", pieHoverPath.d);
    pieHover.style["fill-opacity"] = 0.4;
  }

  onLegendLeave(e) {
    let pieIndex = e.legendIndex;
    this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex).style["fill-opacity"] = 0;
  }

  onLegendClick(e) {
    let self = this;
    this.CHART_DATA.chartSVG.querySelector("#pieHover" + e.legendIndex).setAttribute("d", "");
    //fire Event onLegendClick
    let onPieClick = new this.event.Event("onPieClick", {
      srcElement: self,
      originEvent: e.originEvent,
      pieIndex: e.legendIndex
    });
    this.event.dispatchEvent(onPieClick);
  }

  getAngle(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    let rad = Math.atan2(deltaY, deltaX);
    let deg = rad * 180.0 / Math.PI;
    deg = (deg < 0) ? deg + 450 : deg + 90;
    return deg % 360;
  }

  rotateChart(rotationIndex, ignorOrdering) {
    for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
      let pieData;
      let elemId = "pie" + pieIndex;
      pieData = this.CHART_DATA.pieSet[pieIndex];
      this.CHART_DATA.pieSet[pieIndex].slicedOut = false;

      let pieGroup = this.CHART_DATA.chartSVG.querySelectorAll(".pie" + pieIndex);
      for (let i = 0; i < pieGroup.length; i++) {
        pieGroup[i].setAttribute("transform", "");
      }
      this.CHART_DATA.chartSVG.querySelector("#pieHover" + pieIndex).setAttribute("d", "");

      let upperArcPath = this.geom.describeEllipticalArc(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.CHART_DATA.pieWidth, this.CHART_DATA.pieHeight, (pieData["upperArcPath"].startAngle + rotationIndex), (pieData["upperArcPath"].endAngle + rotationIndex), 0);
      let upperArcPie = this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + pieIndex).setAttribute("d", upperArcPath.d);
      let midAngle = (((pieData["upperArcPath"].startAngle + rotationIndex) + (pieData["upperArcPath"].endAngle + rotationIndex)) / 2) % 360.00;

      this.CHART_DATA.pieSet[pieIndex]["upperArcPath"] = upperArcPath;
      this.CHART_DATA.pieSet[pieIndex]["midAngle"] = (midAngle < 0 ? 360 + midAngle : midAngle);
      if (!ignorOrdering) {
        this.resetTextPos();
      }
    }

  } /*End rotateChart()*/

  resetTextPos() {
    let txtTitleLen = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").getComputedTextLength();
    let txtSubTitleLen = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtSubtitle").getComputedTextLength();
    let txtTitleGrp = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp");

    if (txtTitleLen > this.CHART_CONST.FIX_WIDTH) {
      let fontSize = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").getAttribute("font-size");
      this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").setAttribute("font-size", fontSize - 5);
      txtTitleLen = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtSubtitle").getAttribute("font-size");
      this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtSubtitle").setAttribute("font-size", fontSize - 3);
      txtSubTitleLen = this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtTitleLen / 2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 80);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 100);

    let maxOverFlow = this.calcMaxOverflow(0);
    let reduceFontSizeBy = 0;
    switch (true) {
      case maxOverFlow >= 10 && maxOverFlow < 15:
        reduceFontSizeBy = 3;
        break;
      case maxOverFlow >= 15 && maxOverFlow < 20:
        reduceFontSizeBy = 4;
        break;
      case maxOverFlow >= 20 && maxOverFlow < 25:
        reduceFontSizeBy = 5;
        break;
      case maxOverFlow >= 25:
        reduceFontSizeBy = 6;
        break;
    }

    for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
      let pieData = this.CHART_DATA.pieSet[pieIndex];
      let sPoint = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.pieWidth, this.CHART_DATA.pieHeight, pieData.midAngle), pieData.midAngle);
      let ePoint = this.geom.polarToCartesian(this.CHART_DATA.pieCenter.x, this.CHART_DATA.pieCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.pieWidth + this.CHART_DATA.offsetWidth, this.CHART_DATA.pieHeight + this.CHART_DATA.offsetHeight, pieData.midAngle), pieData.midAngle);
      let txtPie = this.CHART_DATA.chartSVG.querySelector("#txtPie" + pieIndex);
      txtPie.setAttribute("font-size", Number(txtPie.getAttribute("font-size")) - reduceFontSizeBy);

      let txtBoundingRect = txtPie.getBoundingClientRect();
      let txtLen = txtPie.getComputedTextLength();

      let lPath = ["M", sPoint.x, sPoint.y, "L", ePoint.x, ePoint.y];
      lPath.push("l", (pieData.midAngle > 180 ? -5 : 5), 0);

      let textStartPos = new Point(ePoint.x + (pieData.midAngle > 180 ? -(10 + txtLen) : 10), ePoint.y + 5);

      txtPie.setAttribute("x", textStartPos.x);
      txtPie.setAttribute("y", textStartPos.y);

      let colorLegend = this.CHART_DATA.chartSVG.querySelector("#colorLegend" + pieIndex);
      colorLegend.setAttribute("x", textStartPos.x);
      colorLegend.setAttribute("y", textStartPos.y + (txtBoundingRect.height / 6));
      colorLegend.setAttribute("width", txtLen);
      colorLegend.setAttribute("height", 2);
      if (maxOverFlow > 0) {
        colorLegend.style.display = "none";
      }
      this.CHART_DATA.chartSVG.querySelector("#pathToLegend" + pieIndex).setAttribute("d", lPath.join(" "));
    }
  } /*End resetTextPos()*/

  calcMaxOverflow(round) {
    let overFlow = 0;
    let maxOverFlow = 0;
    let overflowTxtIndex;
    let maxTextLen = 0;

    for (let pieIndex = 0; pieIndex < this.CHART_DATA.pieSet.length; pieIndex++) {
      let txtLen = this.CHART_DATA.chartSVG.querySelector("#txtPie" + pieIndex).getComputedTextLength();
      let eachTxtWidth = this.CHART_DATA.pieWidth + this.CHART_DATA.offsetWidth + txtLen;
      overFlow = (eachTxtWidth > this.CHART_DATA.pieCenter.x) ? eachTxtWidth - this.CHART_DATA.pieCenter.x : 0;
      if (overFlow > maxOverFlow) {
        maxOverFlow = overFlow;
        overflowTxtIndex = pieIndex;
      }
      if (txtLen > maxTextLen) {
        maxTextLen = txtLen;
      }
    }

    this.CHART_DATA.pieWithTextSpan = this.CHART_DATA.pieWidth + this.CHART_DATA.offsetWidth + maxTextLen;
    this.CHART_DATA.maxTextLen = maxTextLen;

    if (maxOverFlow > 20) {
      /*reduce text length according to the text size*/
      let txtPie = this.CHART_DATA.chartSVG.querySelector("#txtPie" + overflowTxtIndex);
      let content = txtPie.textContent.split(" ")[0].replace("...", "");
      content = content.substring(0, (content.length - 1)) + "...";
      txtPie.textContent = (content + " [" + this.CHART_DATA.pieSet[overflowTxtIndex].percent + "%]");
      if (round < 50) {
        maxOverFlow = this.calcMaxOverflow(round + 1);
      }
    }
    return maxOverFlow;
  } /*End calcMaxOverflow()*/


  prepareDataSet() {
    let self = this;
    for (let i in this.CHART_OPTIONS.dataSet) {
      let found = -1;
      for (let j in this.CHART_DATA.uniqueDataSet) {
        if (this.CHART_OPTIONS.dataSet[i].label.toLowerCase() === this.CHART_DATA.uniqueDataSet[j].label.toLowerCase()) {
          found = j;
          break;
        }
      }
      if (found === -1) {
        this.CHART_DATA.uniqueDataSet.push({
          "label": self.CHART_OPTIONS.dataSet[i].label,
          "value": self.CHART_OPTIONS.dataSet[i].value,
          "color": this.CHART_OPTIONS.dataSet[i].color || this.util.getColor(i),
          "slicedOut": self.CHART_OPTIONS.dataSet[i].slicedOut || false
        });
      } else {
        this.CHART_DATA.uniqueDataSet[found].value = parseFloat(this.CHART_OPTIONS.dataSet[i].value) + parseFloat(this.CHART_DATA.uniqueDataSet[found].value);
      }
      this.CHART_DATA.totalValue += parseFloat(this.CHART_OPTIONS.dataSet[i].value);
    }
    for (let i in this.CHART_DATA.uniqueDataSet) {
      let percent = 100 * parseFloat(this.CHART_DATA.uniqueDataSet[i].value) / this.CHART_DATA.totalValue;
      this.CHART_DATA.uniqueDataSet[i]["percent"] = percent;
    }

    //fire Event afterParseData
    let afterParseDataEvent = new this.event.Event("afterParseData", {
      srcElement: self
    });
    this.event.dispatchEvent(afterParseDataEvent);
  } /*End prepareDataSet()*/

  slicedOutOnSettings() {
    for (let i = 0; i < this.CHART_DATA.pieSet.length; i++) {
      if (this.CHART_DATA.pieSet[i].slicedOut) {
        let mouseUp = document.createEvent("SVGEvents");
        mouseUp.initEvent("mouseup", true, true);
        let upperArc = this.CHART_DATA.chartSVG.querySelector("#upperArcPie" + i);
        this.CHART_DATA.pieSet[i].slicedOut = false;
        upperArc.dispatchEvent(mouseUp);
      }
    }
  } /*End slicedOutOnSettings()*/

  colorLuminance(hex, lum) {
    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    let rgb = "#",
      c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  } /*End colorLuminance()*/

  showAnimatedView() {
    let sAngle = 0;
    let eAngle = 1;
    let angleCalc = {};
    let self = this;
    for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
      angleCalc["pie" + pieIndex] = {
        "startAngle": sAngle++,
        "endAngle": eAngle++
      };
    }
    let intervalId = setInterval(() => {
      this.CHART_DATA.pieSet = [];
      this.CHART_DATA.totalValue = 0;
      for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
        let startAngle = angleCalc["pie" + pieIndex].startAngle;
        let endAngle = angleCalc["pie" + pieIndex].endAngle;
        let angleDiff = endAngle - startAngle;
        if (pieIndex > 0) {
          startAngle = angleCalc["pie" + (pieIndex - 1)].endAngle;
          endAngle = startAngle + angleDiff;
        }
        let actualEndAngle = (this.CHART_DATA.uniqueDataSet[pieIndex].percent * 36 / 10);
        endAngle = (endAngle + 15) > (startAngle + actualEndAngle) ? (startAngle + actualEndAngle) : (endAngle + 15);
        let pieSet = this.CHART_DATA.chartSVG.querySelectorAll(".pie" + pieIndex);
        for (let i = 0; i < pieSet.length; i++) {
          pieSet[i].parentNode.removeChild(pieSet[i]);
        }

        let color = this.CHART_DATA.uniqueDataSet[pieIndex].color;
        let strokeColor = this.CHART_DATA.uniqueDataSet.length > 1 ? "#eee" : "none";
        self.createPie(startAngle, endAngle, color, strokeColor, pieIndex);
        angleCalc["pie" + pieIndex] = {
          "startAngle": startAngle,
          "endAngle": endAngle
        };
        this.CHART_DATA.chartSVG.querySelector("#colorLegend" + pieIndex).style.display = "none";
        this.CHART_DATA.chartSVG.querySelector("#txtPieGrpPie" + pieIndex).style.display = "none";
        if (endAngle >= 358) {
          clearInterval(intervalId);
          this.init();
        }
      }
    }, 50);
  } /*End showAnimatedView()*/

} /*End of PieChart class */

module.exports = PieChart;