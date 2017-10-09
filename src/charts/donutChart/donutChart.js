/*
 * SVG Donut Chart
 * @Version:1.1.0
 * @CreatedOn:20-Sep-2016
 * @LastUpdated:12-Oct-2016
 * @Author:SmartChartsNXT
 * @description:This will generate a 2d Donut chart. Using SVG 1.1 elements and HTML 5 standard. 
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
      "animated":true,
      "dataSet":[
        {
          "label":"Chrome",
          "value":"72.6"
        },
        {
          "label":"IE",
          "value":"5.7"
          "color": "#F44336"
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
    let donutChart = new SmartChartsNXT.DonutChart(settings);
  });
 */

"use strict";

let SlicedChart = require("./../../base/slicedChart");
let Point = require("./../../core/point");

class DonutChart extends SlicedChart {
  constructor(opts) {
    super("donutChart", opts);
    let self = this;
    this.CHART_DATA = this.util.extends({
      scaleX: 0,
      scaleY: 0,
      svgCenter: 0,
      donutCenter: 0,
      uniqueDataSet: [],
      totalValue: 0,
      donutWidth: 160,
      donutHeight: 160,
      innerWidth: 80,
      innerHeight: 80,
      offsetWidth: 20, // distance of text label from left and right side 
      offsetHeight: 80, // distance of text label from top and bottom side 
      donutSet: [],
      dragStartAngle: 0,
      dragEndPoint: null,
      mouseDown: 0,
      mouseDrag: 0,
      donutWithTextSpan: 0,
      maxTextLen: 0
    }, this.CHART_DATA);

    this.CHART_OPTIONS = this.util.extends({}, this.CHART_OPTIONS);

    this.CHART_CONST = this.util.extends({
      FIX_WIDTH: 800,
      FIX_HEIGHT: 600,
      MIN_WIDTH: 300,
      MIN_HEIGHT: self.CHART_OPTIONS.showLegend ? 500 : 400
    }, this.CHART_CONST);

    this.EVENT_BINDS = {
      onWindowResizeBind: self.onWindowResize.bind(self, self.init),
      onDonutClickBind: self.onDonutClick.bind(self),
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
        if (this.CHART_OPTIONS.width <= 480) {
          this.CHART_DATA.donutWidth = this.CHART_DATA.donutHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 20 / 100;
          this.CHART_DATA.innerWidth = this.CHART_DATA.innerHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 10 / 100;
          this.CHART_DATA.donutCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y);
        } else if (this.CHART_OPTIONS.width <= 680) {
          this.CHART_DATA.donutWidth = this.CHART_DATA.donutHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 40 / 100;
          this.CHART_DATA.innerWidth = this.CHART_DATA.innerHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 20 / 100;
          this.CHART_DATA.donutCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 20);
        } else {
          this.CHART_DATA.donutWidth = this.CHART_DATA.donutHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 40 / 100;
          this.CHART_DATA.innerWidth = this.CHART_DATA.innerHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 300)) * 20 / 100;
          this.CHART_DATA.donutCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 40);
        }
      } else {
        this.CHART_DATA.donutWidth = this.CHART_DATA.donutHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 20 / 100;
        this.CHART_DATA.innerWidth = this.CHART_DATA.innerHeight = Math.min(this.CHART_OPTIONS.width, (this.CHART_OPTIONS.height - 200)) * 10 / 100;
        this.CHART_DATA.donutCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 70);
      }
      this.CHART_DATA.offsetHeight = Math.min(this.CHART_DATA.donutWidth - 10, this.CHART_DATA.offsetHeight);
      this.prepareChart();
      this.tooltip.createTooltip(this);
    } catch (ex) {
      ex.errorIn = `Error in DonutChart with runId:${this.getRunId()}`;
      throw ex;
    }
  } /*End init()*/

  initDataSet() {
    this.CHART_DATA.donutSet = [];
    this.CHART_DATA.uniqueDataSet = [];
    this.CHART_DATA.totalValue = 0;
  } /*End initDataSet()*/

  prepareChart() {
    let self = this;
    this.prepareDataSet();
    let strSVG = "";
    if (this.CHART_OPTIONS.canvasBorder) {
      strSVG += "<g>";
      strSVG += "  <rect x='" + ((-1) * this.CHART_DATA.scaleX / 2) + "' y='" + ((-1) * this.CHART_DATA.scaleY / 2) + "' width='" + ((this.CHART_DATA.svgCenter.x * 2) + this.CHART_DATA.scaleX) + "' height='" + ((this.CHART_DATA.svgCenter.y * 2) + this.CHART_DATA.scaleY) + "' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
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
    for (let i = 0; i < this.CHART_DATA.uniqueDataSet.length; i++) {
      startAngle = endAngle;
      endAngle += (this.CHART_DATA.uniqueDataSet[i].percent * 3.6);
      let color = this.CHART_DATA.uniqueDataSet[i].color;
      this.createDonut(startAngle, endAngle, color, strokeColor, i);
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
        top: self.CHART_DATA.donutCenter.y + (self.CHART_DATA.donutHeight) + self.CHART_DATA.offsetHeight + 20,
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

  createDonut(startAngle, endAngle, color, strokeColor, index) {
    let self = this;
    let percent = parseFloat((endAngle - startAngle) * 10 / 36).toFixed(2);
    let strSVG = "";
    strSVG += "  <rect class='donut" + index + "' id='colorLegend" + index + "' width='300' height='100' fill='" + color + "' style='opacity:1;' />";
    strSVG += "  <text class='donut" + index + "' id='txtDonutGrpDonut" + index + "' fill='#717171' font-family='Lato' >";
    strSVG += "  <tspan class='donut" + index + "' id='txtDonut" + index + "' x='100' y='50' font-size='16'><\/tspan></text>"; 
    strSVG += "  <path class='donut" + index + "' id='donutHover" + index + "'  fill='" + color + "' stroke='none' stroke-width='0' style='transition: fill-opacity 0.3s linear; fill-opacity:0; cursor:pointer;' \/> ";
    strSVG += "  <path class='donut" + index + "'  id='upperArcDonut" + index + "'  fill='" + color + "' stroke='#eee' stroke-width='" + (this.CHART_OPTIONS.outline || 1) + "' style='cursor:pointer;' \/>";
    strSVG += "  <path class='donut" + index + "' id='pathToLegend" + index + "'  fill='none' stroke='#555' stroke-width='1' \/>";

    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    let upperArcPath = this.describeDonutArc(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.CHART_DATA.donutWidth, this.CHART_DATA.donutHeight, this.CHART_DATA.innerWidth, this.CHART_DATA.innerHeight, startAngle, endAngle, 0);
    let upperArcDonut = this.CHART_DATA.chartSVG.querySelector("#upperArcDonut" + index);
    upperArcDonut.setAttribute("d", upperArcPath.d);
    let textLabel = this.CHART_DATA.uniqueDataSet[index]["label"];
    this.CHART_DATA.chartSVG.querySelector("#txtDonut" + index).textContent = (textLabel + " [" + percent + "%]");

    let midAngle = (startAngle + endAngle) / 2;
    let donut = {
      "id": "donut" + index,
      "upperArcPath": upperArcPath,
      "midAngle": midAngle,
      "slicedOut": self.CHART_DATA.uniqueDataSet[index].slicedOut,
      "percent": percent
    };
    this.CHART_DATA.donutSet.push(donut);
  } /*End createDonut()*/

  describeDonutArc(cx, cy, rMaxX, rMaxY, rMinX, rMinY, startAngle, endAngle, sweepFlag) {
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
    let path = {
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
    return path;
  } /*End describeDonutArc()*/

  bindEvents() {
    let mouseDownPos;
    try {
      if (this.CHART_DATA.uniqueDataSet.length <= 1) {
        return;
      }
      for (let donutIndex in this.CHART_DATA.uniqueDataSet) {
        let upperArcDonut = this.CHART_DATA.chartSVG.querySelector("#upperArcDonut" + donutIndex);
        upperArcDonut.addEventListener("mousedown", (e) => {
          e.stopPropagation();
          mouseDownPos = {
            x: e.clientX,
            y: e.clientY
          };
          let elemId = e.target.getAttribute("class");
          let donutIndex = elemId.substring("donut".length);
          this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex).setAttribute("d", "");
          this.CHART_DATA.mouseDown = 1;
        }, false);

        upperArcDonut.addEventListener("touchstart", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 1;
        }, false);

        upperArcDonut.addEventListener("mouseup", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 0;
          if (this.CHART_DATA.mouseDrag === 0) {
            let elemClass = e.target.getAttribute("class");
            let donutIndex = elemClass.substring("donut".length);
            let onDonutClick = new this.event.Event("onDonutClick", {
              srcElement: self,
              originEvent: e,
              donutIndex: donutIndex
            });
            this.event.dispatchEvent(onDonutClick);
          }
          this.CHART_DATA.mouseDrag = 0;
        }, false);

        upperArcDonut.addEventListener("touchend", (e) => {
          e.stopPropagation();
          this.CHART_DATA.mouseDown = 0;
          this.CHART_DATA.mouseDrag = 0;
        }, false);

        upperArcDonut.addEventListener("mousemove", (e) => {
          if (this.CHART_DATA.mouseDown === 1 && (mouseDownPos.x !== e.clientX && mouseDownPos.y !== e.clientY)) {
            let dragStartPoint = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
            let dragAngle = this.getAngle(this.CHART_DATA.donutCenter, dragStartPoint);

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
            let donutData, elemId = e.target.getAttribute("class");
            let donutIndex = elemId.substring("donut".length);

            for (let i = 0; i < this.CHART_DATA.donutSet.length; i++) {
              if (this.CHART_DATA.donutSet[i].id === elemId) {
                donutData = this.CHART_DATA.donutSet[i];
              }
            }
            let row1 = this.CHART_DATA.uniqueDataSet[donutIndex].label + ", " + this.CHART_DATA.uniqueDataSet[donutIndex].value;
            let row2 = this.CHART_DATA.uniqueDataSet[donutIndex].percent.toFixed(2) + "%";
            let color = this.CHART_DATA.uniqueDataSet[donutIndex].color;
            this.tooltip.updateTip(mousePos, color, row1, row2);
          }
        }, false);

        upperArcDonut.addEventListener("touchmove", (e) => {
          e.preventDefault();
          let dragStartPoint = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.changedTouches[0]);
          let dragAngle = this.getAngle(this.CHART_DATA.donutCenter, dragStartPoint);

          if (dragAngle > this.CHART_DATA.dragStartAngle) {
            this.rotateChart(2, false);
          } else {
            this.rotateChart(-2, false);
          }
          this.CHART_DATA.dragStartAngle = dragAngle;
          this.CHART_DATA.mouseDrag = 1;
        }, false);

        upperArcDonut.addEventListener("mouseenter", (e) => {
          if (this.CHART_DATA.mouseDown === 0) {
            let donutData, elemId = e.target.getAttribute("class");
            let donutIndex = elemId.substring("donut".length);

            for (let i = 0; i < this.CHART_DATA.donutSet.length; i++) {
              if (this.CHART_DATA.donutSet[i].id === elemId) {
                donutData = this.CHART_DATA.donutSet[i];
              }
            }
            let donutHover = this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex);
            let donutHoverPath;
            let hoverWidth = Math.round(this.CHART_DATA.offsetWidth * 30 / 100);
            hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
            hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
            if (donutData.slicedOut) {
              let shiftIndex = 15;
              let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
              donutHoverPath = this.describeDonutArc(shiftedCentre.x, shiftedCentre.y, this.CHART_DATA.donutWidth + hoverWidth, this.CHART_DATA.donutHeight + hoverWidth, this.CHART_DATA.innerWidth + hoverWidth, this.CHART_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
            } else {
              donutHoverPath = this.describeDonutArc(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.CHART_DATA.donutWidth + hoverWidth, this.CHART_DATA.donutHeight + hoverWidth, this.CHART_DATA.innerWidth + hoverWidth, this.CHART_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
            }
            donutHover.setAttribute("d", donutHoverPath.d);
            donutHover.style["fill-opacity"] = 0.4; 
          }
        }, false);

        upperArcDonut.addEventListener("mouseleave", (e) => {
          let elemId = e.target.getAttribute("class");
          let donutIndex = elemId.substring("donut".length);
          this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex).style["fill-opacity"] = 0; 
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

      /*Bind event for donut click */
      this.event.off("onDonutClick", this.EVENT_BINDS.onDonutClickBind);
      this.event.on("onDonutClick", this.EVENT_BINDS.onDonutClickBind);

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
      ex.errorIn = `Error in DonutChart events with runId:${this.getRunId()}`;
      throw ex;
    }
  } /*End bindEvents()*/

  onDonutClick(e) {
    if (this.CHART_DATA.uniqueDataSet.length <= 1) {
      return void 0;
    }
    let index = e.donutIndex;
    let donutData = this.CHART_DATA.donutSet[index];
    let sliceOut = this.CHART_DATA.donutSet[index].slicedOut;
    this.CHART_DATA.donutSet[index].slicedOut = !sliceOut;
    let shiftIndex = sliceOut ? 15 : 1;
    let shiftInterval = setInterval(() => {
      let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
      if (isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y)) {
        shiftedCentre = this.CHART_DATA.donutCenter;
      }
      let sPoint = this.geom.polarToCartesian(shiftedCentre.x, shiftedCentre.y, this.geom.getEllipticalRadious(this.CHART_DATA.donutWidth, this.CHART_DATA.donutHeight, donutData.midAngle), donutData.midAngle);
      let ePoint = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.donutWidth + this.CHART_DATA.offsetWidth, this.CHART_DATA.donutHeight + this.CHART_DATA.offsetHeight, donutData.midAngle), donutData.midAngle);
      ePoint.x += (donutData.midAngle > 180 ? -shiftIndex : shiftIndex);
      let lPath = ["M", sPoint.x, sPoint.y, "L", ePoint.x, ePoint.y];
      lPath.push("l", (donutData.midAngle > 180 ? -5 : 5), 0);
      this.CHART_DATA.chartSVG.querySelector("#pathToLegend" + index).setAttribute("d", lPath.join(" "));

      let upperArcDonut = this.CHART_DATA.chartSVG.querySelector("#upperArcDonut" + index);
      upperArcDonut.setAttribute("transform", "translate(" + (shiftedCentre.x - this.CHART_DATA.donutCenter.x) + "," + (shiftedCentre.y - this.CHART_DATA.donutCenter.y) + ")");

      let txtDonut = this.CHART_DATA.chartSVG.querySelector("#txtDonutGrpDonut" + index);
      txtDonut.setAttribute("transform", "translate(" + (donutData.midAngle > 180 ? -shiftIndex : shiftIndex) + ", 0)");

      let colorLegend = this.CHART_DATA.chartSVG.querySelector("#colorLegend" + index);
      colorLegend.setAttribute("transform", "translate(" + (donutData.midAngle > 180 ? -shiftIndex : shiftIndex) + ", 0)");

      shiftIndex = sliceOut ? shiftIndex - 1 : shiftIndex + 1;
      if ((!sliceOut && shiftIndex === 15) || (sliceOut && shiftIndex === -1)) {
        clearInterval(shiftInterval);
      }
    }, 10);
  } /*End onDonutClick()*/

  onLegendHover(e) {
    let donutIndex = e.legendIndex;
    let donutData = this.CHART_DATA.donutSet[donutIndex];
    let donutHover = this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex);
    let hoverWidth = Math.round(this.CHART_DATA.offsetWidth * 30 / 100);
    hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
    hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
    let donutHoverPath;
    if (donutData.slicedOut) {
      let shiftIndex = 15;
      let shiftedCentre = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
      donutHoverPath = this.describeDonutArc(shiftedCentre.x, shiftedCentre.y, this.CHART_DATA.donutWidth + hoverWidth, this.CHART_DATA.donutHeight + hoverWidth, this.CHART_DATA.innerWidth + hoverWidth, this.CHART_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
    } else {
      donutHoverPath = this.describeDonutArc(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.CHART_DATA.donutWidth + hoverWidth, this.CHART_DATA.donutHeight + hoverWidth, this.CHART_DATA.innerWidth + hoverWidth, this.CHART_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
    }
    donutHover.setAttribute("d", donutHoverPath.d);
    donutHover.style["fill-opacity"] = 0.4; 
  }

  onLegendLeave(e) {
    let donutIndex = e.legendIndex;
    this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex).style["fill-opacity"] = 0; 
  }

  onLegendClick(e) {
    let self = this;
    this.CHART_DATA.chartSVG.querySelector("#donutHover" + e.legendIndex).setAttribute("d", "");
    //fire Event onLegendClick
    let onDonutClick = new this.event.Event("onDonutClick", {
      srcElement: self,
      originEvent: e.originEvent,
      donutIndex: e.legendIndex
    });
    this.event.dispatchEvent(onDonutClick);
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
    for (let donutIndex = 0; donutIndex < this.CHART_DATA.uniqueDataSet.length; donutIndex++) {
      let donutData, elemId = "donut" + donutIndex;
      for (let i = 0; i < this.CHART_DATA.donutSet.length; i++) {
        if (this.CHART_DATA.donutSet[i].id === elemId) {
          donutData = this.CHART_DATA.donutSet[i];
        }
        this.CHART_DATA.donutSet[i].slicedOut = false;
      }

      let donutGroup = this.CHART_DATA.chartSVG.querySelectorAll(".donut" + donutIndex);
      for (let i = 0; i < donutGroup.length; i++) {
        donutGroup[i].setAttribute("transform", "");
      }
      this.CHART_DATA.chartSVG.querySelector("#donutHover" + donutIndex).setAttribute("d", "");

      let upperArcPath = this.describeDonutArc(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.CHART_DATA.donutWidth, this.CHART_DATA.donutHeight, this.CHART_DATA.innerWidth, this.CHART_DATA.innerHeight, (donutData["upperArcPath"].startAngle + rotationIndex), (donutData["upperArcPath"].endAngle + rotationIndex), 0);
      let upperArcDonut = this.CHART_DATA.chartSVG.querySelector("#upperArcDonut" + donutIndex);
      upperArcDonut.setAttribute("d", upperArcPath.d);

      let midAngle = (((donutData["upperArcPath"].startAngle + rotationIndex) + (donutData["upperArcPath"].endAngle + rotationIndex)) / 2) % 360.00;

      this.CHART_DATA.donutSet[donutIndex]["upperArcPath"] = upperArcPath;
      this.CHART_DATA.donutSet[donutIndex]["midAngle"] = (midAngle < 0 ? 360 + midAngle : midAngle);
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
      this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").getComputedTextLength();
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

    for (let donutIndex in this.CHART_DATA.uniqueDataSet) {
      let donutData = this.CHART_DATA.donutSet[donutIndex];
      let sPoint = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.donutWidth, this.CHART_DATA.donutHeight, donutData.midAngle), donutData.midAngle);
      let ePoint = this.geom.polarToCartesian(this.CHART_DATA.donutCenter.x, this.CHART_DATA.donutCenter.y, this.geom.getEllipticalRadious(this.CHART_DATA.donutWidth + this.CHART_DATA.offsetWidth, this.CHART_DATA.donutHeight + this.CHART_DATA.offsetHeight, donutData.midAngle), donutData.midAngle);
      let txtDonut = this.CHART_DATA.chartSVG.querySelector("#txtDonut" + donutIndex);
      txtDonut.setAttribute("font-size", Number(txtDonut.getAttribute("font-size")) - reduceFontSizeBy);

      let txtBoundingRect = txtDonut.getBoundingClientRect();
      let txtLen = txtDonut.getComputedTextLength();

      let lPath = ["M", sPoint.x, sPoint.y, "L", ePoint.x, ePoint.y];
      lPath.push("l", (donutData.midAngle > 180 ? -5 : 5), 0);

      let textStartPos = new Point(ePoint.x + (donutData.midAngle > 180 ? -(10 + txtLen) : 10), ePoint.y + 5);

      txtDonut.setAttribute("x", textStartPos.x);
      txtDonut.setAttribute("y", textStartPos.y);

      let colorLegend = this.CHART_DATA.chartSVG.querySelector("#colorLegend" + donutIndex);
      colorLegend.setAttribute("x", textStartPos.x);
      colorLegend.setAttribute("y", textStartPos.y + (txtBoundingRect.height / 6));
      colorLegend.setAttribute("width", txtLen);
      colorLegend.setAttribute("height", 2);
      if (maxOverFlow > 0) {
        colorLegend.style.display = "none";
      }
      this.CHART_DATA.chartSVG.querySelector("#pathToLegend" + donutIndex).setAttribute("d", lPath.join(" "));
    }
  } /*End resetTextPos()*/

  calcMaxOverflow(round) {
    let overFlow = 0;
    let maxOverFlow = 0;
    let overflowTxtIndex, maxTextLen = 0;

    for (let donutIndex = 0; donutIndex < this.CHART_DATA.donutSet.length; donutIndex++) {
      let txtLen = this.CHART_DATA.chartSVG.querySelector("#txtDonut" + donutIndex).getComputedTextLength();
      let eachTxtWidth = this.CHART_DATA.donutWidth + this.CHART_DATA.innerWidth + txtLen;
      overFlow = (eachTxtWidth > this.CHART_DATA.donutCenter.x) ? eachTxtWidth - this.CHART_DATA.donutCenter.x : 0;
      if (overFlow > maxOverFlow) {
        maxOverFlow = overFlow;
        overflowTxtIndex = donutIndex;
      }
      if (txtLen > maxTextLen) {
        maxTextLen = txtLen;
      }
    }

    this.CHART_DATA.donutWithTextSpan = this.CHART_DATA.donutWidth + this.CHART_DATA.innerWidth + maxTextLen;
    this.CHART_DATA.maxTextLen = maxTextLen;

    if (maxOverFlow > 20) {
      /*reduce text length according to the text size*/
      let content = this.CHART_DATA.chartSVG.querySelector("#txtDonut" + overflowTxtIndex).textContent.split(" ")[0].replace("...", "");
      content = content.substring(0, (content.length - 1)) + "...";
      this.CHART_DATA.chartSVG.querySelector("#txtDonut" + overflowTxtIndex).textContent = (content + " [" + this.CHART_DATA.donutSet[overflowTxtIndex].percent + "%]");
      if (round < 50) {
        maxOverFlow = this.calcMaxOverflow(round + 1);
      }
    }
    return maxOverFlow;
  } /*End calcMaxOverflow()*/


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


  prepareDataSet() {
    for (let i = 0; i < this.CHART_OPTIONS.dataSet.length; i++) {
      let found = -1;
      for (let j = 0; j < this.CHART_DATA.uniqueDataSet.length; j++) {
        if (this.CHART_OPTIONS.dataSet[i].label.toLowerCase() === this.CHART_DATA.uniqueDataSet[j].label.toLowerCase()) {
          found = j;
          break;
        }
      }
      if (found === -1) {
        this.CHART_DATA.uniqueDataSet.push({
          "label": this.CHART_OPTIONS.dataSet[i].label,
          "value": this.CHART_OPTIONS.dataSet[i].value,
          "color": this.CHART_OPTIONS.dataSet[i].color || this.util.getColor(i),
          "slicedOut": this.CHART_OPTIONS.dataSet[i].slicedOut || false
        });
      } else {
        this.CHART_DATA.uniqueDataSet[found].value = parseFloat(this.CHART_OPTIONS.dataSet[i].value) + parseFloat(this.CHART_DATA.uniqueDataSet[found].value);
      }
      this.CHART_DATA.totalValue += parseFloat(this.CHART_OPTIONS.dataSet[i].value);
    }
    for (let i = 0; i < this.CHART_DATA.uniqueDataSet.length; i++) {
      let percent = 100 * parseFloat(this.CHART_DATA.uniqueDataSet[i].value) / this.CHART_DATA.totalValue;
      this.CHART_DATA.uniqueDataSet[i]["percent"] = percent;
    }

    //fire Event afterParseData
    let afterParseDataEvent = new self.Event("afterParseData", {
      srcElement: self
    });
    self.dispatchEvent(afterParseDataEvent);
  } /*End prepareDataSet()*/

  slicedOutOnSettings() {
    for (let i = 0; i < this.CHART_DATA.donutSet.length; i++) {
      if (this.CHART_DATA.donutSet[i].slicedOut) {

        let mouseUp = document.createEvent("SVGEvents");
        mouseUp.initEvent("mouseup", true, true);
        let upperArc = this.CHART_DATA.chartSVG.querySelector("#upperArcDonut" + i);
        this.CHART_DATA.donutSet[i].slicedOut = false;
        upperArc.dispatchEvent(mouseUp);
      }
    }
  } /*End slicedOutOnSettings()*/

  showAnimatedView() {
    let sAngle = 0;
    let eAngle = 1;
    let angleCalc = {};
    for (let donutIndex = 0; donutIndex < this.CHART_DATA.uniqueDataSet.length; donutIndex++) {
      angleCalc["donut" + donutIndex] = {
        "startAngle": sAngle++,
        "endAngle": eAngle++
      };
    }
    let intervalId = setInterval(() => {
      this.CHART_DATA.donutSet = [];
      this.CHART_DATA.totalValue = 0;
      let strokeColor = this.CHART_DATA.uniqueDataSet.length > 1 ? "#eee" : "none";
      for (let donutIndex = 0; donutIndex < this.CHART_DATA.uniqueDataSet.length; donutIndex++) {
        let startAngle = angleCalc["donut" + donutIndex].startAngle;
        let endAngle = angleCalc["donut" + donutIndex].endAngle;
        let angleDiff = endAngle - startAngle;
        if (donutIndex > 0) {
          startAngle = angleCalc["donut" + (donutIndex - 1)].endAngle;
          endAngle = startAngle + angleDiff;
        }
        let actualEndAngle = (this.CHART_DATA.uniqueDataSet[donutIndex].percent * 36 / 10);
        endAngle = (endAngle + 15) > (startAngle + actualEndAngle) ? (startAngle + actualEndAngle) : (endAngle + 15);
        let donutSet = this.CHART_DATA.chartSVG.querySelectorAll(".donut" + donutIndex);
        for (let i = 0; i < donutSet.length; i++) {
          donutSet[i].parentNode.removeChild(donutSet[i]);
        }
        let color = this.CHART_DATA.uniqueDataSet[donutIndex].color;
        this.createDonut(startAngle, endAngle, color, strokeColor, donutIndex);
        angleCalc["donut" + donutIndex] = {
          "startAngle": startAngle,
          "endAngle": endAngle
        };
        this.CHART_DATA.chartSVG.querySelector("#colorLegend" + donutIndex).style.display = "none";
        this.CHART_DATA.chartSVG.querySelector("#txtDonutGrpDonut" + donutIndex).style.display = "none";
        if (endAngle >= 358) {
          clearInterval(intervalId);
          this.init();
        }
      }
    }, 50);
  } /*End showAnimatedView()*/

} /*End of Donut Chart class */

module.exports = DonutChart;