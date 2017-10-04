/*
 * SVG Step Chart 
 * @Version:1.1.0
 * @CreatedOn:13-Sep-2016
 * @Author:SmartChartsNXT
 * @description: SVG Step Chart, that support multiple series, and zoom window.
 * @JSFiddle:
 * @Sample caller code::
 
  SmartChartsNXT.ready(function(){
    let stepChart = new SmartChartsNXT.StepChart({
      "title":"Multi Series Chart",
      "subTitle":"Step Chart",
      "targetElem":"chartContainer",
      "canvasBorder":false,
      "bgColor":"none",
      "showLegend":true, 
      "noRiser":false,
      "showAreaOffset":true,
      "animated": true,
      "hideHorizontalScroller":false,
      "toolTip":{
        "content":'<table>'+
              '<tr><td><b>{{point.series.name}}</b> has produces </td></tr>' +
              '<tr><td>a total Sales of <b>Rs. {{point.value}} </b></td></tr>'+
              '<tr><td>on <b>{{point.label}}</b></tr>' +
              '</table>'
      },
      "dataSet":{
        "xAxis":{
          "title":"Date"
        },
        "yAxis":{
          "title":"Total Sales",
          "prefix":"Rs. "
        },
        "series":[
          {
            "lineWidth":2,
            "color":"#FFC107",
            "name": 'Raphael',
            "data": [
              {label:"Jan",value:"2311"},{label:"Feb",value:"553"},{label:"Mar",value:"196"},{label:"Apr",value:"4422"},
              {label:"May",value:"3312"},{label:"Jun",value:"663"},{label:"Jul",value:"9663"},{label:"Aug",value:"114"},
              {label:"Sep",value:"2231"},{label:"Oct",value:"55"},{label:"Nov",value:"274"},{label:"Dec",value:"3467"}
            ]
          },
          {
            "lineWidth":2,
            "color":"#F44336",
            "areaOpacity":"0.5",
            "name": 'Wilson',
            "data": [
              {label:"Jan",value:"6446"},{label:"Feb",value:"333"},{label:"Mar",value:"470"},{label:"Apr",value:"8472"},
              {label:"May",value:"1212"},{label:"Jun",value:"6446"},{label:"Jul",value:"8472"},{label:"Aug",value:"114"},
              {label:"Sep",value:"432"},{label:"Oct",value:"3543"},{label:"Nov",value:"114"},{label:"Dec",value:"333"}
            ]
          }
        ]
      },
      events: {
          afterRender: function (e) {
            console.log(e, "event after rendering complete");
          },
          onInit: function (e) {
            console.log(e, "event onInit");
          },
          afterParseData: function (e) {
            console.log(e, "event afterParseData");
          },
          beforeSave: function (e) {
            console.log(e, "event beforeSave");
          },
          afterSave: function (e) {
            console.log(e, "event afterSave");
          },
            beforePrint: function (e) {
            console.log(e, "event beforePrint");
          },
          afterPrint: function (e) {
            console.log(e, "event afterPrint");
          }
        },
        zoomWindow:{
          "leftIndex":10,
          "rightIndex":20
        }
    });
  });

 */

"use strict";

let CoordinateChart = require("./../../base/coordinateChart");
let Point = require("./../../core/point");
let HorizontalScroller = require("./../../components/horizontalScroller");
let ZoomOutBox = require("./../../components/zoomOutBox");

class StepChart extends CoordinateChart {

  constructor(opts) {
    super("stepChart", opts);
    let self = this;
    this.CHART_DATA = this.util.extends({
      chartCenter: 0,
      maxima: 0,
      minima: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0,
      gridBoxWidth: 0,
      gridBoxHeight: 0,
      hScrollBoxHeight: opts.hideHorizontalScroller ? 0 : 60,
      fullSeries: [],
      fsScaleX: 0,
      vLabelWidth: 70,
      hLabelHeight: 80,
      windowLeftIndex: 0,
      windowRightIndex: -1,
      longestSeries: 0,
      series: [],
      mouseDown: 0,
      newDataSet: [],
      newCatgList: [],
      zoomOutBoxWidth: 40,
      zoomOutBoxHeight: 40
    }, this.CHART_DATA);

    this.CHART_OPTIONS = this.util.extends({}, this.CHART_OPTIONS);
    this.CHART_CONST = this.util.extends({
      FIX_WIDTH: 800,
      FIX_HEIGHT: 600,
      MIN_WIDTH: 250,
      MIN_HEIGHT: 400,
      hGridCount: 9
    }, this.CHART_CONST);

    this.EVENT_BINDS = {
      onLegendClickBind: self.onLegendClick.bind(self),
      onMouseMoveBind: self.onMouseMove.bind(self),
      onMouseLeaveBind: self.onMouseLeave.bind(self),
      onZoomOutBind: self.onZoomOut.bind(self),
      onWindowResizeBind: self.onWindowResize.bind(self, self.init),
      onHTextLabelHoverBind: self.onHTextLabelHover.bind(self),
      onHTextLabelMouseLeaveBind: self.onHTextLabelMouseLeave.bind(self),
      onLeftSliderMoveBind: self.onLeftSliderMove.bind(self),
      onRightSliderMoveBind: self.onRightSliderMove.bind(self),
      onHorizontalScrollBind: self.onHorizontalScroll.bind(self)
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
      this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
      this.CHART_DATA.marginLeft = ((-1) * this.CHART_DATA.scaleX / 2) + 100;
      this.CHART_DATA.marginRight = ((-1) * this.CHART_DATA.scaleX / 2) + 20;
      this.CHART_DATA.marginTop = ((-1) * this.CHART_DATA.scaleY / 2) + 120;
      this.CHART_DATA.marginBottom = ((-1) * this.CHART_DATA.scaleY / 2) + this.CHART_DATA.hScrollBoxHeight + 90;

      let longestSeries = 0;
      let longSeriesLen = 0;
      for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {

        if (this.CHART_OPTIONS.dataSet.series[index].data.length > longSeriesLen) {
          longestSeries = index;
          longSeriesLen = this.CHART_OPTIONS.dataSet.series[index].data.length;
        }
      }
      this.CHART_DATA.longestSeries = longestSeries;

      /* Will set initial zoom window */
      if (this.CHART_OPTIONS.zoomWindow) {
        if (this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.leftIndex >= 0 && this.CHART_OPTIONS.zoomWindow.leftIndex < longSeriesLen - 1) {
          this.CHART_DATA.windowLeftIndex = this.CHART_OPTIONS.zoomWindow.leftIndex;
        }
        if (this.CHART_OPTIONS.zoomWindow.rightIndex && this.CHART_OPTIONS.zoomWindow.rightIndex > this.CHART_OPTIONS.zoomWindow.leftIndex && this.CHART_OPTIONS.zoomWindow.rightIndex <= longSeriesLen - 1) {
          this.CHART_DATA.windowRightIndex = this.CHART_OPTIONS.zoomWindow.rightIndex;
        } else {
          this.CHART_DATA.windowRightIndex = (longSeriesLen) - 1;
        }
      } else {
        this.CHART_DATA.windowRightIndex = (longSeriesLen) - 1;
      }

      this.prepareChart();
      this.tooltip.createTooltip(this);
    } catch (ex) {
      ex.errorIn = `Error in StepChart with runId:${this.getRunId()}`;
      throw ex;
    }

  } /*End init()*/

  initDataSet() {
    this.CHART_DATA.fullSeries = [];
    this.CHART_DATA.series = [];
    this.CHART_DATA.newDataSet = [];
    this.CHART_DATA.newCatgList = [];
    this.CHART_DATA.windowLeftIndex = 0;
    this.CHART_DATA.windowRightIndex = -1;
  } /*End initDataSet()*/

  prepareChart() {
    this.prepareDataSet();
    let strSVG = "";
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / this.CHART_CONST.FIX_WIDTH * this.CHART_OPTIONS.width) + "' y='" + (50 / this.CHART_CONST.FIX_HEIGHT * this.CHART_OPTIONS.height) + "' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";


    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='verticalLabelContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='horizontalLabelContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='scrollerCont'>";
    strSVG += "</g>";

    strSVG += "<path id='hLine' fill='none' stroke='#333' stroke-width='1' opacity='1' pointer-events='none'></path>";
    strSVG += "<path id='vLine' fill='none' stroke='#333' stroke-width='1' opacity='1' pointer-events='none'></path>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").textContent = this.CHART_OPTIONS.title;
    this.CHART_DATA.chartSVG.querySelector("#txtSubtitle").textContent = this.CHART_OPTIONS.subTitle;

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      this.appendGradFill(index);
    }

    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
    this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_CONST.hGridCount - 1));

    this.grid.createGrid(this, this.CHART_DATA.chartSVG, this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop, this.CHART_DATA.gridBoxWidth, this.CHART_DATA.gridBoxHeight, this.CHART_DATA.gridHeight, this.CHART_CONST.hGridCount);

    if (!this.CHART_OPTIONS.hideHorizontalScroller) {
      this.prepareFullSeriesDataset();
      this.hScroller = new HorizontalScroller(this,
        this.CHART_DATA.chartSVG,
        "scrollerCont",
        this.CHART_DATA.marginLeft,
        this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight,
        this.CHART_DATA.gridBoxWidth,
        this.CHART_DATA.hScrollBoxHeight
      );

      /* ploting full series actual points */
      for (let index = 0; index < this.CHART_DATA.fullSeries.length; index++) {
        this.drawFullSeries(this.CHART_DATA.fullSeries[index], index);
      }
    }

    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2) - 30) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 70) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.xAxis.title + "<\/text>";
    strSVG += "<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft - 30) + "' y='" + (this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2) - 5) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.yAxis.title + "<\/text>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);


    if (this.hScroller) {
      this.zoomOutBox = new ZoomOutBox(
        this,
        this.CHART_DATA.chartSVG,
        this.CHART_DATA.marginTop - this.CHART_DATA.zoomOutBoxHeight,
        this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth - this.CHART_DATA.zoomOutBoxWidth,
        this.CHART_DATA.zoomOutBoxWidth,
        this.CHART_DATA.zoomOutBoxHeight
      );
    }

    this.reDrawSeries();

    if (this.hScroller) {
      this.hScroller.resetSliderPos("left", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowLeftIndex].x);
      this.hScroller.resetSliderPos("right", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowRightIndex].x);
    }
  } /*End prepareChart()*/

  prepareFullSeriesDataset() {
    let scaleX = this.CHART_DATA.fsScaleX = (this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length);
    let scaleYfull = (this.CHART_DATA.hScrollBoxHeight / this.CHART_DATA.maxima);

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      let arrPointsSet = [];
      let d = [];
      let dataSet = this.CHART_OPTIONS.dataSet.series[index].data;
      for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
        let p1 = new Point(this.CHART_DATA.marginLeft + (dataCount * scaleX), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight) - (dataSet[dataCount].value * scaleYfull) + (this.CHART_DATA.minima * scaleYfull)));
        let p2 = new Point(this.CHART_DATA.marginLeft + (dataCount * scaleX) + (scaleX), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight) - (dataSet[dataCount].value * scaleYfull) + (this.CHART_DATA.minima * scaleYfull)));
        d.push(!dataCount ? "M" : "L");
        d.push.apply(d, [p1.x, p1.y, "L", p2.x, p2.y]);
        arrPointsSet.push(p1);
        arrPointsSet.push(p2);
      }
      this.CHART_DATA.fullSeries.push(arrPointsSet);
    }
  } /* End prepareFullSeriesDataset() */

  drawFullSeries(arrPointsSet, index) {
    let line = [];
    let strSeries = "<g id='fullSeries_" + index + "' class='fullSeries'>";
    line.push.apply(line, ["M", arrPointsSet[0].x, arrPointsSet[0].y]);
    for (var dataCount = 1; dataCount < arrPointsSet.length; dataCount++) {
      line.push.apply(line, ["L", arrPointsSet[dataCount].x, arrPointsSet[dataCount].y]);
    }
    strSeries += "<path id='fLine_" + index + "' stroke='#000' fill='none' d='" + line.join(" ") + "' stroke-width='1' opacity='0.6'></path>";
    strSeries += "<g>";
    let hChartScrollerCont = this.CHART_DATA.chartSVG.querySelector("#scrollerCont #hChartScrollerCont");
    if (hChartScrollerCont) {
      hChartScrollerCont.insertAdjacentHTML("beforeend", strSeries);
    }
  } /*End drawFullSeries()*/

  prepareDataSet(dataSet) {
    let self = this;
    let maxSet = [];
    let minSet = [];
    let categories = [];
    dataSet = dataSet || this.CHART_OPTIONS.dataSet.series;

    for (let i = 0; i < dataSet.length; i++) {
      let arrData = [];
      for (let j = 0; j < dataSet[i].data.length; j++) {
        arrData.push(dataSet[i].data[j].value);
        if (j > categories.length - 1) {
          categories.push(dataSet[i].data[j].label);
        }
      }
      let maxVal = Math.max.apply(null, arrData);
      let minVal = Math.min.apply(null, arrData);
      maxSet.push(maxVal);
      minSet.push(minVal);
      dataSet[i].color = dataSet[i].color || this.util.getColor(i);
    }
    this.CHART_OPTIONS.dataSet.xAxis.categories = categories;
    this.CHART_DATA.maxima = Math.max.apply(null, maxSet);
    this.CHART_DATA.minima = Math.min.apply(null, minSet);
    this.CHART_DATA.maxima = this.round(this.CHART_DATA.maxima);

    //fire Event afterParseData
    let afterParseDataEvent = new this.event.Event("afterParseData", {
      srcElement: self
    });
    this.event.dispatchEvent(afterParseDataEvent);
  } /*End prepareDataSet()*/

  createSeries(dataSet, index, scaleX) {
    let d = [];
    let area = [];
    let elemSeries = this.CHART_DATA.chartSVG.querySelector("#series_area_" + index);
    let elemActualSeries = this.CHART_DATA.chartSVG.querySelector("#series_actual_" + index);
    if (elemSeries) {
      elemSeries.parentNode.removeChild(elemSeries);
    }
    if (elemActualSeries) {
      elemActualSeries.parentNode.removeChild(elemActualSeries);
    }

    if (dataSet.length < 1) {
      return void 0;
    }

    let interval = scaleX || (this.CHART_DATA.gridBoxWidth / (dataSet.length));
    let scaleY = (this.CHART_DATA.gridBoxHeight / this.CHART_DATA.maxima);
    let arrPointsSet = [];

    /* ploting actual points */
    let strSeries = "<g id='series_actual_" + index + "' class='series' pointer-events='none'>";
    for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
      let p1 = new Point(this.CHART_DATA.marginLeft + (dataCount * interval), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      let p2 = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      if (dataCount === 0) {
        d.push("M");
        area.push("M");
      } else if (this.CHART_OPTIONS.noRiser) {
        d.push("M");
        area.push("L");
      } else {
        d.push("L");
        area.push("L");
      }

      d.push.apply(d, [p1.x, p1.y, "L", p2.x, p2.y]);
      area.push.apply(area, [p1.x, p1.y, "L", p2.x, p2.y]);
      arrPointsSet.push(p1);
      arrPointsSet.push(p2);
    }

    this.CHART_DATA.series.push(arrPointsSet);
    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    let strokeWidth = this.CHART_OPTIONS.dataSet.series[index].lineWidth || 2;
    let areaOpacity = this.CHART_OPTIONS.dataSet.series[index].areaOpacity || 0.2;

    strSeries += "<path stroke='" + color + "' fill='none' d='" + d.join(" ") + "' stroke-width='" + strokeWidth + "' opacity='1'></path>";
    strSeries += "</g>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSeries);

    if (this.CHART_OPTIONS.noAreaOffset) {
      color = "none";
    }
    if (dataSet.length > 10) {
      strSeries = "<g id='series_area_" + index + "' class='series' pointer-events='none'>";
      if (dataSet.length > 2) {
        area.push.apply(area, ["L", arrPointsSet[arrPointsSet.length - 1].x, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight), arrPointsSet[0].x, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight)], "Z");
      }
      strSeries += "<path id='area_" + index + "' fill='" + color + "' d='" + area.join(" ") + "' stroke-width='" + strokeWidth + "' stroke='none'opacity='" + areaOpacity + "'></path>";
    } else {
      strSeries = "<g id='series_area_" + index + "' class='columns series' pointer-events='none'>";
      let colHalfWidth = (interval) / 2;
      for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
        let p = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval / 2), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
        let col = [
          "M", p.x - colHalfWidth, p.y,
          "L", p.x + colHalfWidth, p.y,
          "L", p.x + colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight),
          "L", p.x - colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight),
          "Z"
        ];
        strSeries += "<path id='column_" + index + "_" + dataCount + "' stroke='" + color + "'  fill='" + color + "' d='" + col.join(" ") + "' stroke-width='1' opacity='" + ((dataCount + 1) * 0.1) + "'></path>";
      }
    }
    strSeries += "</g>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSeries);
  } /*End createSeries()*/

  appendGradFill(index) {
    /*Creating gradient fill for area*/
    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    let areaOpacity = this.CHART_OPTIONS.dataSet.series[index].areaOpacity || 0.5;
    let strSVG = "";
    strSVG += "<defs>";
    strSVG += "  <linearGradient gradientUnits = 'userSpaceOnUse' id='" + this.CHART_OPTIONS.targetElem + "-stepchart-gradLinear" + index + "' x1='0%' y1='0%' x2='100%' y2='0%'>";
    strSVG += "  <stop offset='0%' style='stop-color:white;stop-opacity:" + areaOpacity + "' />";
    strSVG += "  <stop offset='100%' style='stop-color:" + color + ";stop-opacity:" + areaOpacity + "' />";
    strSVG += "  </linearGradient>";
    strSVG += "</defs>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFill()*/

  resetTextPositions(categories) {
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
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 90);

    let vTxtSubTitle = this.CHART_DATA.chartSVG.querySelector("#vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0," + (this.CHART_DATA.marginLeft - this.CHART_DATA.vLabelWidth - 10) + "," + (this.CHART_DATA.svgCenter.y) + ")");
    vTxtSubTitle.setAttribute("x", 0);
    vTxtSubTitle.setAttribute("y", 0);

  } /*End resetTextPositions()*/

  bindEvents() {
    let gridRect = this.CHART_DATA.chartSVG.querySelector("#gridRect");
    if (gridRect) {
      gridRect.removeEventListener("mousemove", this.EVENT_BINDS.onMouseMoveBind);
      gridRect.addEventListener("mousemove", this.EVENT_BINDS.onMouseMoveBind, false);
      gridRect.removeEventListener("click", this.EVENT_BINDS.onMouseMoveBind);
      gridRect.addEventListener("click", this.EVENT_BINDS.onMouseMoveBind, false);
      gridRect.removeEventListener("mousleave", this.EVENT_BINDS.onMouseLeaveBind);
      gridRect.addEventListener("mouseleave", this.EVENT_BINDS.onMouseLeaveBind, false);
    }

    /*Add events for onZoomOut */
    this.event.off("onZoomOut", this.EVENT_BINDS.onZoomOutBind);
    this.event.on("onZoomOut", this.EVENT_BINDS.onZoomOutBind);

    /*Add events for Horizontal Text label hover */
    this.event.off("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.on("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.off("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);
    this.event.on("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);

    /*Add events for Horizontal chart scroller */
    this.event.off("onLeftSliderMove", this.EVENT_BINDS.onLeftSliderMoveBind);
    this.event.on("onLeftSliderMove", this.EVENT_BINDS.onLeftSliderMoveBind);
    this.event.off("onRightSliderMove", this.EVENT_BINDS.onRightSliderMoveBind);
    this.event.on("onRightSliderMove", this.EVENT_BINDS.onRightSliderMoveBind);
    this.event.off("onHorizontalScroll", this.EVENT_BINDS.onHorizontalScrollBind);
    this.event.on("onHorizontalScroll", this.EVENT_BINDS.onHorizontalScrollBind);

    /*Add events for legends to show/hide a series */
    this.event.off("onLegendClick", this.EVENT_BINDS.onLegendClickBind);
    this.event.on("onLegendClick", this.EVENT_BINDS.onLegendClickBind);

    /*Add events for resize chart window */
    window.removeEventListener('resize', this.EVENT_BINDS.onWindowResizeBind);
    window.addEventListener('resize', this.EVENT_BINDS.onWindowResizeBind, true);

  } /*End bindEvents()*/


  onHTextLabelHover(e) {
    let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.originEvent);
    this.tooltip.updateTip(mousePointer, "#555", e.originEvent.target.getAttribute("title"));
  } /*End onHTextLabelHover() */

  onHTextLabelMouseLeave(e) {
    this.tooltip.hide();
  } /*End onHTextLabelMouseLeave()*/

  onMouseMove(e) {
    try {
      e.stopPropagation();
      let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
      let gridBox = this.CHART_DATA.chartSVG.querySelector("#hGrid").getBBox();
      if (mousePointer.x >= gridBox.x && mousePointer.x < (gridBox.x + this.CHART_DATA.gridBoxWidth) && mousePointer.y >= gridBox.y && mousePointer.y < (gridBox.y + this.CHART_DATA.gridBoxHeight)) {
        let multiSeriesPoints = [];
        for (let i = 0; i < this.CHART_DATA.series.length; i++) {
          if (!this.CHART_DATA.chartSVG.querySelector("#series_area_" + i) || this.CHART_DATA.chartSVG.querySelector("#series_area_" + i).style.display === "none") {
            continue;
          }
          for (let j = 0; j < this.CHART_DATA.series[i].length - 1; j++) {
            if (mousePointer.x > this.CHART_DATA.series[i][j].x && mousePointer.x < this.CHART_DATA.series[i][j + 1].x) {
              multiSeriesPoints.push({
                seriesIndex: i,
                pointIndex: j + 1,
                point: this.CHART_DATA.series[i][j + 1]
              });
            }
          }
          if (mousePointer.x < this.CHART_DATA.series[i][0].x) {
            multiSeriesPoints.push({
              seriesIndex: i,
              pointIndex: 0,
              point: this.CHART_DATA.series[i][0]
            });
          }
        }
        if (multiSeriesPoints.length === 0) {
          return;
        }

        let toolTipPoint, npIndex, indx;
        for (let i = 0; i < multiSeriesPoints.length; i++) {
          if (mousePointer.y > multiSeriesPoints[i].point.y || this.CHART_DATA.series.length === 1) {
            toolTipPoint = multiSeriesPoints[i].point;
            npIndex = multiSeriesPoints[i].pointIndex;
            indx = multiSeriesPoints[i].seriesIndex;
          }
        }
        if (!indx && multiSeriesPoints.length > 0) {
          toolTipPoint = multiSeriesPoints[0].point;
          npIndex = multiSeriesPoints[0].pointIndex;
          indx = multiSeriesPoints[0].seriesIndex;
        }

        if (npIndex % 2 === 0) {
          toolTipPoint = new Point((this.CHART_DATA.series[indx][npIndex].x + this.CHART_DATA.series[indx][npIndex + 1].x) / 2, toolTipPoint.y);
        } else {
          toolTipPoint = new Point((this.CHART_DATA.series[indx][npIndex].x + this.CHART_DATA.series[indx][npIndex - 1].x) / 2, toolTipPoint.y);
        }

        /*Create vertical line*/
        let vLinePath = ["M", toolTipPoint.x, toolTipPoint.y, "L", toolTipPoint.x, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight];
        let vLine = this.CHART_DATA.chartSVG.querySelector("#vLine");
        if (vLine) {
          vLine.setAttribute("d", vLinePath.join(" "));
          vLine.parentNode.removeChild(vLine);
          this.CHART_DATA.chartSVG.appendChild(vLine);
        }

        if (toolTipPoint) {
          let elms = this.CHART_DATA.chartSVG.querySelectorAll(".tooTipPoint");
          for (let i = 0; i < elms.length; i++) {
            elms[i].parentNode.removeChild(elms[i]);
          }

          let color = this.CHART_OPTIONS.dataSet.series[indx].color || this.util.getColor(indx);
          let radius = this.CHART_OPTIONS.dataSet.series[indx].markerRadius || 4;
          this.geom.createDot(toolTipPoint, "#FFF", (radius + 2), 1, "tooTipPoint", "stepChart", color);
          this.geom.createDot(toolTipPoint, color, radius, 1, "tooTipPoint", "stepChart");

          let toolTipRow1, toolTipRow2;
          toolTipRow1 = (this.CHART_OPTIONS.dataSet.xAxis.title + " " + this.CHART_DATA.newCatgList[Math.ceil((npIndex - 1) / 2)]);
          toolTipRow2 = (this.CHART_OPTIONS.dataSet.yAxis.title + " " + (this.CHART_OPTIONS.dataSet.yAxis.prefix || "") + " " + this.CHART_DATA.newDataSet[indx].data[Math.ceil((npIndex - 1) / 2)].value);
          
          /*point should be available globally*/
          var point = this.CHART_DATA.newDataSet[indx].data[Math.ceil((npIndex - 1) / 2)];
          point["series"] = {
            name: this.CHART_OPTIONS.dataSet.series[indx].name
          };

          if (this.CHART_OPTIONS.toolTip && this.CHART_OPTIONS.toolTip.content) {
            let toolTipContent = this.CHART_OPTIONS.toolTip.content.replace(/{{/g, "${").replace(/}}/g, "}");
            let genContent = this.util.assemble(toolTipContent, "point");
            this.tooltip.updateTip(toolTipPoint, color, genContent(point), "html");
          } else {
            this.tooltip.updateTip(toolTipPoint, color, toolTipRow1, toolTipRow2);
          }

          this.CHART_DATA.chartSVG.querySelector("#vLine").style.display = "block";
        }
      }
    } catch (ex) {
      ex.errorIn = `Error in StepChart with runId:${this.getRunId()}`;
      throw ex;
    }
  } /*End onMouseMove()*/

  onMouseLeave() {
    this.tooltip.hide();
    this.CHART_DATA.chartSVG.querySelectorAll(".tooTipPoint");
    let elms = this.CHART_DATA.chartSVG.querySelectorAll(".tooTipPoint");
    for (let i = 0; i < elms.length; i++) {
      elms[i].parentNode.removeChild(elms[i]);
    }

    let vLine = this.CHART_DATA.chartSVG.querySelector("#vLine");
    if (vLine) {
      vLine.style.display = "none";
    }

  } /*End onMouseLeave()*/

  onLegendClick(e) {
    let seriesIndex = e.legendIndex;
    let areaBorder = this.CHART_DATA.chartSVG.querySelector("#series_" + seriesIndex);
    let areaActual = this.CHART_DATA.chartSVG.querySelector("#series_actual_" + seriesIndex);
    let color = e.legendData.color;
    let doShow = e.toggeled ? "none" : "block";
    if (areaBorder) {
      areaBorder.style.display = doShow;
    }
    if (areaActual) {
      areaActual.style.display = doShow;
    }
  } /*End onLegendClick()*/

  onHorizontalScroll(e) {
    if (this.CHART_DATA.windowLeftIndex > 0 || this.CHART_DATA.windowRightIndex < this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length - 1) {
      this.zoomOutBox.show();
    } else {
      this.zoomOutBox.hide();
    }
  }

  onLeftSliderMove(e) {
    let sliderPos = e.sliderPosition;
    for (let j = 0; j < this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length - 1; j++) {
      if (sliderPos.x >= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j].x && sliderPos.x <= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j + 1].x) {
        this.CHART_DATA.windowLeftIndex = j;
      }
    }
    this.reDrawSeries();
  } /*End onLeftSliderMove()*/

  onRightSliderMove(e) {
    let sliderPos = e.sliderPosition;
    for (let j = 1; j < this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length; j++) {
      if (sliderPos.x >= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j - 1].x && sliderPos.x <= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j].x) {
        this.CHART_DATA.windowRightIndex = j;
      }
    }
    this.reDrawSeries();
  } /*End onRightSliderMove()*/

  reDrawSeries() {
    let self = this;
    this.CHART_DATA.newDataSet = [];
    this.CHART_DATA.newCatgList = [];
    let scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.slice(Math.ceil(this.CHART_DATA.windowLeftIndex / 2), Math.ceil((this.CHART_DATA.windowRightIndex) / 2)).length;
    for (let i = this.CHART_DATA.windowLeftIndex; i <= this.CHART_DATA.windowRightIndex; i++) {
      this.CHART_DATA.newCatgList.push(this.CHART_OPTIONS.dataSet.xAxis.categories[i % this.CHART_OPTIONS.dataSet.xAxis.categories.length]);
    }

    for (let setIndex = 0; setIndex < this.CHART_OPTIONS.dataSet.series.length; setIndex++) {
      let set = {};
      for (let key in this.CHART_OPTIONS.dataSet.series[setIndex]) {
        if (key === "data") {
          set["data"] = this.CHART_OPTIONS.dataSet.series[setIndex].data.slice(Math.ceil(this.CHART_DATA.windowLeftIndex / 2), Math.ceil((this.CHART_DATA.windowRightIndex) / 2));
        } else {
          set[key] = JSON.parse(JSON.stringify(this.CHART_OPTIONS.dataSet.series[setIndex][key]));
        }
      }
      this.CHART_DATA.newDataSet.push(set);
    }
    this.prepareDataSet(this.CHART_DATA.newDataSet);

    this.vLabel.createVerticalLabel(this,
      "verticalLabelContainer",
      this.CHART_DATA.marginLeft,
      this.CHART_DATA.marginTop,
      this.CHART_DATA.maxima,
      0,
      this.CHART_DATA.vLabelWidth,
      this.CHART_DATA.gridHeight,
      this.CHART_CONST.hGridCount,
      this.CHART_OPTIONS.dataSet.yAxis.prefix
    );

    this.hLabel.createHorizontalLabel(this,
      "horizontalLabelContainer",
      this.CHART_DATA.marginLeft,
      this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight,
      this.CHART_DATA.gridBoxWidth,
      this.CHART_DATA.hLabelHeight,
      this.CHART_OPTIONS.dataSet.xAxis.categories,
      scaleX
    );

    this.CHART_DATA.series = [];
    let legendSet = [];
    for (let i = 0; i < this.CHART_DATA.newDataSet.length; i++) {
      this.createSeries(this.CHART_DATA.newDataSet[i].data, i, scaleX);
      if (this.CHART_OPTIONS.showLegend) {
        legendSet.push({
          label: self.CHART_DATA.newDataSet[i].name,
          value: "",
          color: self.CHART_DATA.newDataSet[i].color
        });
        this.legendBox.createLegends(this, "legendContainer", {
          left: self.CHART_DATA.marginLeft,
          top: self.CHART_DATA.marginTop - 35,
          legendSet: legendSet,
          type: "horizontal",
          border: false,
          isToggleType: true
        });
      }
    }

    this.resetTextPositions(this.CHART_OPTIONS.dataSet.xAxis.categories);
    this.bindEvents();
    this.onMouseLeave();
    this.render();
  } /*End reDrawSeries()*/


  onZoomOut(e) {
    this.CHART_DATA.windowLeftIndex = 0;
    this.CHART_DATA.windowRightIndex = (this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length * 2) - 1;
    this.hScroller.resetSliderPos("left", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowLeftIndex].x);
    this.hScroller.resetSliderPos("right", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowRightIndex].x);
    this.reDrawSeries();
  } /*End onZoomOut()*/

  round(val) {
    val = Math.round(val);
    let digitCount = val.toString().length;
    let nextVal = Math.pow(10, digitCount - 1);
    let roundVal = Math.ceil(val / nextVal) * nextVal;
    if (val < roundVal / 2) {
      return roundVal / 2;
    } else {
      return roundVal;
    }
  } /*End round()*/

  showAnimatedView() {
    let dataSet = [];
    let self = this;
    let scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex).length;
    let pointIndex = 0;

    for (let i = 0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
      let set = {
        "data": this.CHART_OPTIONS.dataSet.series[i].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex)
      };
      dataSet.push(set);
    }
    this.prepareDataSet(dataSet);
    this.CHART_DATA.series = [];

    let maxLen = 0;
    for (let i = 0; i < dataSet.length; i++) {
      let len = dataSet[i].data.length;
      if (len > maxLen) {
        maxLen = len;
      }
    }

    /*if there is more than 50 points then skip the animation*/
    if (maxLen > 50) {
      pointIndex = maxLen;
    }
    let timoutId = setInterval(function () {

      for (let index = 0; index < dataSet.length; index++) {
        self.createSeries(dataSet[index].data.slice(0, pointIndex), index, scaleX);
      }

      if (pointIndex === maxLen) {
        clearInterval(timoutId);
        self.reDrawSeries();
      }
      pointIndex++;
    }, 50);
  } /*End showAnimatedView()*/


} /*End of StepChart()*/


module.exports = StepChart;