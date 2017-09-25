/*
 * SVG Column Chart 
 * @Version:1.1.0
 * @CreatedOn:26-Aug-2016
 * @Author:SmartChartsNXT
 * @description: SVG Column Chart, that shows series of data as coulmns.
 * @JSFiddle:
 * @Sample caller code:
   SmartChartsNXT.ready(function(){
    let columnChart = new SmartChartsNXT.ColumnChart({
      "title": "Sales Report",
      "subTitle": "Report for the year, 2016",
      "targetElem": "chartContainer",
      "canvasBorder": false,
      "bgColor": "none",
      "toolTip": {
        "content": '<table>' +
        '<tr><td>on <b>{{point.label}}</b></tr>' +
        '<tr><td>{{point.series.name}} is</td></tr>' +
        '<tr><td><span style="font-size:20px;color:#4285f4;"><b>Rs. {{point.value}} </b></span></tr>' +
        '</table>'
      },
      "dataSet": {
        "xAxis": {
          "title": "Date"
        },
        "yAxis": {
          "title": "Amount",
          "prefix": "Rs. "
        },
        "series": [{
          "gradient": "linear", // [oval|linear|none]
          "color": "#03A9F4",
          "name": 'Sales',
          "data": [{
            "color": "#ff0f00",
            "label": "1-11-2016",
            "value": 36
          }, {
            "color": "#ff6600",
            "label": "2-11-2016",
            "value": 27
          }, {
            "color": "#ff9e01",
            "label": "3-11-2016",
            "value": 67
          }]
        }]
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
      }
    });
  });

*/

"use strict";

let CoordinateChart = require("./../../base/coordinateChart");
let Point = require("./../../core/point");

class ColumnChart extends CoordinateChart {

  constructor(opts) {
    super("columnChart", opts);
    let self = this;
    this.CHART_DATA = this.util.extends({
      scaleX: 0,
      scaleY: 0,
      svgCenter: 0,
      chartCenter: 0,
      maxima: 0,
      minima: 0,
      marginLeft: 0,
      marginRight: 0,
      marginTop: 0,
      marginBottom: 0,
      gridBoxWidth: 0,
      gridBoxHeight: 0,
      longestSeries: 0,
      columns: {}
    }, this.CHART_DATA);

    this.CHART_OPTIONS = this.util.extends({}, this.CHART_OPTIONS);
    this.CHART_CONST = this.util.extends({
      FIX_WIDTH: 800,
      FIX_HEIGHT: 500,
      MIN_WIDTH: 250,
      MIN_HEIGHT: 400,
      hGridCount: 9
    }, this.CHART_CONST);

    this.EVENT_BINDS = {

    };
    this.init();

    if (this.CHART_OPTIONS.animated !== false) {
      this.showAnimatedView();
    }
  }

  init() {
    try {
      super.initBase();
      //this.CHART_OPTIONS = this.util.extends(opts, this.CHART_OPTIONS);
      //let containerDiv = document.querySelector("#" + this.CHART_OPTIONS.targetElem);
      //this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = containerDiv.offsetWidth || this.CHART_CONST.FIX_WIDTH;
      //this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = containerDiv.offsetHeight || this.CHART_CONST.FIX_HEIGHT;

      // if (this.CHART_OPTIONS.width < this.CHART_CONST.MIN_WIDTH)
      //   this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = this.CHART_CONST.MIN_WIDTH;
      // if (this.CHART_OPTIONS.height < this.CHART_CONST.MIN_HEIGHT)
      //   this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = this.CHART_CONST.MIN_HEIGHT;

      // if (this.CHART_OPTIONS.events && typeof this.CHART_OPTIONS.events === "object") {
      //   for (let e in this.CHART_OPTIONS.events) {
      //     self.off(e, this.CHART_OPTIONS.events[e]);
      //     self.on(e, this.CHART_OPTIONS.events[e]);
      //   }
      // }

      // console.log(this.CHART_OPTIONS);
      // this.CHART_DATA.scaleX = this.CHART_CONST.FIX_WIDTH - this.CHART_OPTIONS.width;
      // this.CHART_DATA.scaleY = this.CHART_CONST.FIX_HEIGHT - this.CHART_OPTIONS.height;

      //fire Event onInit
      // let onInitEvent = new self.Event("onInit", {
      //   srcElement: self
      // });
      // self.dispatchEvent(onInitEvent);

      // let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
      //   "viewBox='0 0 " + this.CHART_CONST.FIX_WIDTH + " " + this.CHART_CONST.FIX_HEIGHT + "'" +
      //   "version='1.1'" +
      //   "width='" + this.CHART_OPTIONS.width + "'" +
      //   "height='" + this.CHART_OPTIONS.height + "'" +
      //   "id='columnChart'" +
      //   "style='background:" + (this.CHART_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
      //   "> <\/svg>";

      // document.getElementById(this.CHART_OPTIONS.targetElem).setAttribute("runId", this.CHART_CONST.runId);
      // document.getElementById(this.CHART_OPTIONS.targetElem).innerHTML = "";
      // document.getElementById(this.CHART_OPTIONS.targetElem).insertAdjacentHTML("beforeend", strSVG);

      this.createColumnDropShadow();

      //let svgWidth = parseInt(document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").getAttribute("width"));
      //let svgHeight = parseInt(document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").getAttribute("height"));
      //this.CHART_DATA.svgCenter = new this.geom.Point((svgWidth / 2), (svgHeight / 2));
      this.CHART_DATA.chartCenter = new this.geom.Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
      this.CHART_DATA.marginLeft = ((-1) * this.CHART_DATA.scaleX / 2) + 100, this.CHART_DATA.marginRight = ((-1) * this.CHART_DATA.scaleX / 2) + 10;
      this.CHART_DATA.marginTop = ((-1) * this.CHART_DATA.scaleY / 2) + 150;
      this.CHART_DATA.marginBottom = ((-1) * this.CHART_DATA.scaleY / 2) + 100;

      let longestSeries = 0;
      let longSeriesLen = 0;
      for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {

        if (this.CHART_OPTIONS.dataSet.series[index].data.length > longSeriesLen) {
          longestSeries = index;
          longSeriesLen = this.CHART_OPTIONS.dataSet.series[index].data.length;
        }
      }
      this.CHART_DATA.longestSeries = longestSeries;

      //this.appendWaterMark(this.CHART_OPTIONS.targetElem, this.CHART_DATA.scaleX, this.CHART_DATA.scaleY);
      //this.ui.appendMenu2(this.CHART_OPTIONS.targetElem, this.CHART_DATA.svgCenter, this.CHART_DATA.scaleX, this.CHART_DATA.scaleY, self);
      this.prepareChart();
      this.tooltip.createTooltip(this);
    } catch (ex) {
      ex.errorIn = `Error in ColumnChart with runId:${this.getRunId()}`;
      throw ex;
    }

  } /*End init()*/

  prepareChart() {
    this.prepareDataSet();

    // if (this.CHART_OPTIONS.canvasBorder) {
    //   strSVG += "<g>";
    //   strSVG += "  <rect x='" + ((-1) * this.CHART_DATA.scaleX / 2) + "' y='" + ((-1) * this.CHART_DATA.scaleY / 2) + "' width='" + ((this.CHART_DATA.svgCenter.x * 2) + this.CHART_DATA.scaleX) + "' height='" + ((this.CHART_DATA.svgCenter.y * 2) + this.CHART_DATA.scaleY) + "' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
    //   strSVG += "<\/g>";
    // }
    let strSVG = "";
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / this.CHART_CONST.FIX_WIDTH * this.CHART_OPTIONS.width) + "' y='" + (50 / this.CHART_CONST.FIX_HEIGHT * this.CHART_OPTIONS.height) + "' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";


    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    this.CHART_DATA.chartSVG.querySelector("#txtTitleGrp #txtTitle").textContent = this.CHART_OPTIONS.title;
    this.CHART_DATA.chartSVG.querySelector("#txtSubtitle").textContent = this.CHART_OPTIONS.subTitle;

    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
    this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_CONST.hGridCount - 1));

    this.grid.createGrid(this, this.CHART_DATA.chartSVG, this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop, this.CHART_DATA.gridBoxWidth, this.CHART_DATA.gridBoxHeight, this.CHART_DATA.gridHeight, this.CHART_CONST.hGridCount);

    let scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length;
    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      this.createColumns(this.CHART_OPTIONS.dataSet.series[index].data, index, scaleX);
      // if (this.CHART_OPTIONS.dataSet.series.length > 1)
      //   this.createLegands(index);
    }


    // let catList = [];
    // scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length;
    // for (let i = 0; i < this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length; i++)
    //   catList.push(this.CHART_OPTIONS.dataSet.xAxis.categories[i % this.CHART_OPTIONS.dataSet.xAxis.categories.length]);

    // createHorizontalLabel(catList, scaleX);

    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2) - 30) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 70) + "' font-size='15' >" + this.CHART_OPTIONS.dataSet.xAxis.title + "<\/text>";
    strSVG += "<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft - 30) + "' y='" + (this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2) - 5) + "' font-size='15' >" + this.CHART_OPTIONS.dataSet.yAxis.title + "<\/text>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    this.resetTextPositions();

    //bindEvents();

    //fire event afterRender
    // let aftrRenderEvent = new self.Event("afterRender", {
    //   srcElement: self
    // });
    // self.dispatchEvent(aftrRenderEvent);

  } /*End prepareChart()*/

  prepareDataSet(dataSet) {
    let maxSet = [];
    let minSet = [];
    let categories = [];
    dataSet = dataSet || this.CHART_OPTIONS.dataSet.series;

    for (let i = 0; i < dataSet.length; i++) {
      let arrData = [];
      for (let j = 0; j < dataSet[i].data.length; j++) {
        arrData.push(dataSet[i].data[j].value);
        if (categories.indexOf(dataSet[i].data[j].label) < 0)
          categories.push(dataSet[i].data[j].label);
      }
      let maxVal = Math.max.apply(null, arrData);
      let minVal = Math.min.apply(null, arrData);
      maxSet.push(maxVal);
      minSet.push(minVal);
    }
    this.CHART_OPTIONS.dataSet.xAxis.categories = categories;
    this.CHART_DATA.maxima = Math.max.apply(null, maxSet);
    this.CHART_DATA.minima = Math.min.apply(null, minSet);
    this.CHART_DATA.maxima = round(this.CHART_DATA.maxima);

    //fire Event afterParseData
    let afterParseDataEvent = new self.Event("afterParseData", {
      srcElement: self
    });
    self.dispatchEvent(afterParseDataEvent);

  } /*End prepareDataSet()*/

  createColumns(dataSet, index, scaleX) {
    let d = [];
    let interval = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length;
    let eachInterval = (interval - (interval / 5)) / this.CHART_OPTIONS.dataSet.series.length;
    let colHalfWidth = (eachInterval - 4) / 2;
    if (this.CHART_OPTIONS.overlapColumns)
      colHalfWidth = (interval - (interval / 5) - (index * 8)) / 2;

    colHalfWidth = colHalfWidth < 2 ? 2 : colHalfWidth;
    colHalfWidth = colHalfWidth > 15 ? 15 : colHalfWidth;
    let scaleY = this.CHART_DATA.gridBoxHeight / (this.CHART_DATA.maxima);
    let arrPointsSet = [];
    let strSeries = "<g id='column_set_" + index + "' class='columns'>";
    let colCenter;

    for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
      if (this.CHART_OPTIONS.overlapColumns)
        colCenter = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval / 2), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      else
        colCenter = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval / 10) + (eachInterval * index) + (eachInterval / 2), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));

      if (dataSet.length > 50)
        this.createDot(colCenter, "red", "2", null, null, "columnChart");

      let cornerRadius = 2;
      d = [
        "M", colCenter.x - colHalfWidth + (cornerRadius), colCenter.y,
        "L", colCenter.x + colHalfWidth - (cornerRadius), colCenter.y,
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, cornerRadius,
        "L", colCenter.x + colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight),
        "L", colCenter.x - colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight),
        "L", colCenter.x - colHalfWidth, colCenter.y + (cornerRadius),
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, -cornerRadius,
        "Z"
      ];
      arrPointsSet.push(colCenter);

      if (this.CHART_OPTIONS.dataSet.series.length > 1)
        let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
      else
        let color = this.CHART_OPTIONS.dataSet.series[index].data[dataCount].color || this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);

      let fill = color,
        filter = "";
      switch (this.CHART_OPTIONS.dataSet.series[index].gradient) {
        case "oval":
          appendGradFillOval(index, dataCount);
          fill = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-gradOval" + index + "_" + dataCount + ")";
          filter = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-dropshadow)";
          break;
        case "linear":
          appendGradFillLinear(index, dataCount);
          fill = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-gradLinear" + index + "_" + dataCount + ")";
          filter = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-dropshadow)";
          break;
        default:
        case "none":
          break;
      }

      strSeries += "<path id='column_" + index + "_" + dataCount + "' filter='" + filter + "'  stroke='" + color + "'  fill='" + fill + "' d='" + d.join(" ") + "' stroke-width='1' opacity='1'></path>";
      this.CHART_DATA.columns["column_" + index + "_" + dataCount] = {
        topMid: colCenter,
        path: d,
        colHalfWidth: colHalfWidth,
        label: this.CHART_OPTIONS.dataSet.xAxis.categories[dataCount % this.CHART_OPTIONS.dataSet.xAxis.categories.length],
        value: (this.CHART_OPTIONS.dataSet.yAxis.prefix ? this.CHART_OPTIONS.dataSet.yAxis.prefix + " " : "") + dataSet[dataCount].value
      };
    }
    strSeries += "</g>";
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSeries);

  } /*End createColumns()*/


  createLegands(index) {
    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    /*Creating series legend*/
    let strSVG = "";
    strSVG = "<g id='series_legend_" + index + "' style='cursor:pointer;'>";
    strSVG += "<rect id='legend_color_" + index + "' x='" + this.CHART_DATA.marginLeft + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 60) + "' width='10' height='10' fill='" + color + "' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG += "<text id='legend_txt_" + index + "' font-size='12' x='" + (this.CHART_DATA.marginLeft + 20) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 70) + "' fill='#717171' font-family='Verdana' >" + this.CHART_OPTIONS.dataSet.series[index].name + "</text>";
    strSVG += "</g>";
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #legendContainer").insertAdjacentHTML("beforeend", strSVG);
  }

  // createGrid() {
  //   this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
  //   this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
  //   this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_CONST.hGridCount - 1));
  //   let hGrid = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #hGrid");
  //   if (hGrid) hGrid.parentNode.removeChild(hGrid);

  //   let strGrid = "";
  //   strGrid += "<g id='hGrid' >";
  //   for (let gridCount = 0; gridCount < this.CHART_CONST.hGridCount; gridCount++) {
  //     let d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight), "L", this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth, this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight)];
  //     strGrid += "<path fill='none' d='" + d.join(" ") + "' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
  //   }
  //   let d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop, "L", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 10];
  //   strGrid += "<path id='gridBoxLeftBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
  //   strGrid += "<path id='hLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
  //   strGrid += "<path id='vLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
  //   strGrid += "</g>";
  //   document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strGrid);
  //   createVerticalLabel();
  // } /*End createGrid()*/

  createVerticalLabel() {
    let vTextLabel = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #vTextLabel");
    if (vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);

    let interval = (this.CHART_DATA.maxima) / (this.CHART_CONST.hGridCount - 1);
    let strText = "<g id='vTextLabel'>";
    for (let gridCount = this.CHART_CONST.hGridCount - 1, i = 0; gridCount >= 0; gridCount--) {
      let value = (i++ * interval);
      value = (value >= 1000 ? (value / 1000).toFixed(2) + "K" : value.toFixed(2));
      strText += "<text font-family='Lato' fill='black'><tspan x='" + (this.CHART_DATA.marginLeft - 55) + "' y='" + (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight) + 5) + "' font-size='12' >" + ((this.CHART_OPTIONS.dataSet.yAxis.prefix) ? this.CHART_OPTIONS.dataSet.yAxis.prefix : "") + value + "<\/tspan></text>";
      let d = ["M", this.CHART_DATA.marginLeft, (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight)), "L", (this.CHART_DATA.marginLeft - 5), (this.CHART_DATA.marginTop + (gridCount * this.CHART_DATA.gridHeight))];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strText += "</g>";
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strText);

    let overFlow = 0;
    let vTextLabel = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #vTextLabel tspan");
    for (let i = 0; i < vTextLabel.length; i++) {
      if ((this.CHART_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50) < 0)
        overFlow = Math.abs((this.CHART_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50));
    }
    if (overFlow !== 0) {
      this.CHART_DATA.marginLeft = this.CHART_DATA.marginLeft + overFlow;
      createGrid();
    }
  } /*End createVerticalLabel()*/

  createHorizontalLabel(categories, scaleX) {
    let hTextLabel = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #hTextLabel");
    if (hTextLabel) hTextLabel.parentNode.removeChild(hTextLabel);

    let interval = scaleX || (this.CHART_DATA.gridBoxWidth / (categories.length));

    /*if there is too much categories then discurd some categories*/
    if (interval < 30) {
      let newCategories = [],
        skipLen = Math.ceil(30 / interval);
      for (let i = 0; i < categories.length; i += skipLen) {
        newCategories.push(categories[i]);
      }
      categories = newCategories;
      interval *= skipLen;
    }
    let strText = "<g id='hTextLabel'>";
    for (let hText = 0; hText < categories.length; hText++) {
      strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + (this.CHART_DATA.marginLeft + (hText * interval) + (interval / 2)) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 20) + "' ><tspan  font-size='12' >" + categories[hText] + "<\/tspan></text>";
    }

    for (let hText = 0; hText < categories.length; hText++) {
      let d = ["M", (this.CHART_DATA.marginLeft + (hText * interval) + (interval)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight), "L", (this.CHART_DATA.marginLeft + (hText * interval) + (interval)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 10)];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    let d = ["M", this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight, "L", this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight];
    strText += "<path id='gridBoxBottomBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strText += "</g>";

    /*bind hover event*/
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strText);
    let hTextLabels = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #hTextLabel text");
    let totalHTextWidth = 0;
    for (let i = 0; i < hTextLabels.length; i++) {
      let txWidth = hTextLabels[i].getComputedTextLength();
      totalHTextWidth += (txWidth);
    }

    for (let i = 0; i < hTextLabels.length; i++) {
      let txtWidth = hTextLabels[i].querySelector("tspan").getComputedTextLength();
      if (parseFloat(totalHTextWidth + (hTextLabels.length * 5)) < parseFloat(this.CHART_DATA.gridBoxWidth)) {
        while (txtWidth + 5 > interval) {
          hTextLabels[i].querySelector("tspan").textContent = hTextLabels[i].querySelector("tspan").textContent.substring(0, (hTextLabels[i].querySelector("tspan").textContent.length - 4)) + "...";
          txtWidth = (hTextLabels[i].querySelector("tspan").getComputedTextLength());
        }
      }

      hTextLabels[i].addEventListener("mouseenter", function (e) {
        e.stopPropagation();
        let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
        this.ui.toolTip(this.CHART_OPTIONS.targetElem, mousePointer, "#555", e.target.getAttribute("title"));
      }, false);

      hTextLabels[i].addEventListener("mouseleave", function (e) {
        e.stopPropagation();
        this.ui.toolTip(this.CHART_OPTIONS.targetElem, "hide");
      }, false);

    }

  } /*End createHorizontalLabel()*/


  resetTextPositions() {
    let txtTitleLen = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getComputedTextLength();
    let txtSubTitleLen = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    let txtTitleGrp = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp");


    if (txtTitleLen > this.CHART_CONST.FIX_WIDTH) {
      let fontSize = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getAttribute("font-size");
      document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").setAttribute("font-size", fontSize - 5);
      txtTitleLen = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getAttribute("font-size");
      document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").setAttribute("font-size", fontSize - 3);
      txtSubTitleLen = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtTitleLen / 2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 90);

    /*Reset vertical text label*/
    let arrVLabels = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #vTextLabel");
    let vLabelwidth = arrVLabels[0].getBBox().width;
    let arrVText = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #vTextLabel tspan");
    for (let i = 0; i < arrVText.length; i++)
      arrVText[i].setAttribute("x", (this.CHART_DATA.marginLeft - vLabelwidth - 10));

    /*Reset horzontal text label*/
    let totalHTextWidth = 0;
    let arrHText = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #hTextLabel text");
    for (let i = 0; i < arrHText.length; i++) {
      let txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth += (txWidth);
    }
    let interval = 70;
    if (parseFloat(totalHTextWidth + (arrHText.length * 10)) > parseFloat(this.CHART_DATA.gridBoxWidth)) {
      for (let i = 0; i < arrHText.length; i++) {
        let cx = arrHText[i].getAttribute("x");
        let cy = arrHText[i].getAttribute("y");

        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("transform", "translate(0," + (10) + ")rotate(-45," + (cx) + "," + (cy) + ")");

        if (txWidth + 15 > interval) {
          let fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
          arrHText[i].querySelector("tspan").setAttribute("font-size", (fontSize - 2));
          txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        }
        while (txWidth + 15 > interval) {
          arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0, (arrHText[i].querySelector("tspan").textContent.length - 4)) + "...";
          txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
        }
      }
    }

    let vTxtSubTitle = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #vTextSubTitle");
    let vTxtLen = vTxtSubTitle.getComputedTextLength();
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0," + (this.CHART_DATA.marginLeft - vLabelwidth - 20) + "," + (this.CHART_DATA.svgCenter.y + vTxtLen) + ")");
    vTxtSubTitle.setAttribute("x", 0);
    vTxtSubTitle.setAttribute("y", 0);

    /*Set position for legend text*/
    let arrLegendText = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #legendContainer text");
    let arrLegendColor = document.querySelectorAll("#" + this.CHART_OPTIONS.targetElem + " #columnChart #legendContainer rect");

    let width = 0,
      row = 0;
    for (let i = 0; i < arrLegendText.length; i++) {
      arrLegendColor[i].setAttribute("x", (width + this.CHART_DATA.marginLeft - 60));
      arrLegendText[i].setAttribute("x", (width + this.CHART_DATA.marginLeft + 20 - 60));
      arrLegendColor[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 80 + (row * 20)));
      arrLegendText[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 90 + (row * 20)));
      width += (arrLegendText[i].getBBox().width + 50);

      if (width > this.CHART_CONST.FIX_WIDTH) {
        width = 0;
        row++;
        arrLegendColor[i].setAttribute("x", (width + this.CHART_DATA.marginLeft - 60));
        arrLegendText[i].setAttribute("x", (width + this.CHART_DATA.marginLeft + 20 - 60));
        arrLegendColor[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 80 + (row * 20)));
        arrLegendText[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 90 + (row * 20)));
        width += (arrLegendText[i].getBBox().width + 50);
      }

    }

  } /*End resetTextPositions()*/

  appendGradFillOval(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    let color, gradId = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #ovalGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) return;
    if (this.CHART_OPTIONS.dataSet.series.length > 1) {
      color = this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
    } else {
      color = this.CHART_OPTIONS.dataSet.series[seriesIndex].data[dataIndex].color || this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
    }

    let strSVG = "";
    strSVG += "<defs id='ovalGradDef_" + seriesIndex + "_" + dataIndex + "'>";
    strSVG += "<linearGradient  id='" + this.CHART_OPTIONS.targetElem + "-columnchart-gradOval" + seriesIndex + "_" + dataIndex + "' x1='0%' y1='0%' x2='100%' y2='0%'>  ";
    strSVG += "<stop offset='0%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "<stop offset='5%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='15%' style='stop-color:" + color + ";stop-opacity:0.5;'></stop> ";
    strSVG += "<stop offset='50%' style='stop-color:" + color + ";stop-opacity:0.1;'></stop>  ";
    strSVG += "<stop offset='85%' style='stop-color:" + color + ";stop-opacity:0.5;'></stop> ";
    strSVG += "<stop offset='95%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='100%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "</<linearGradient> ";
    strSVG += "</defs>";

    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillOval()*/

  appendGradFillLinear(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    let color, gradId = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #linearGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) return;
    if (this.CHART_OPTIONS.dataSet.series.length > 1) {
      color = this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
    } else {
      color = this.CHART_OPTIONS.dataSet.series[seriesIndex].data[dataIndex].color || this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
    }

    let strSVG = "";
    strSVG += "<defs id='linearGradDef_" + seriesIndex + "_" + dataIndex + "'>";
    strSVG += "<linearGradient  id='" + this.CHART_OPTIONS.targetElem + "-columnchart-gradLinear" + seriesIndex + "_" + dataIndex + "' x1='0%' y1='0%' x2='0%' y2='100%'>  ";
    strSVG += "<stop offset='0%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='100%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "</<linearGradient> ";
    strSVG += "</defs>";
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillLinear()*/


  showAnimatedView() {
    let scaleY = 0.0;

    let timeoutId = setInterval(function () {
      for (let col in this.CHART_DATA.columns) {
        let column = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #" + col);
        scaleYElem(column, 1, scaleY);
      }
      scaleY += 0.1;
      if (scaleY >= 1)
        clearInterval(timeoutId);
    }, 50);
  } /*End showAnimatedView()*/

  scaleYElem(elementNode, scaleX, scaleY) {
    let bbox = elementNode.getBBox();
    let cx = bbox.x + (bbox.width / 2),
      cy = bbox.y + (bbox.height); // finding center of element
    let saclestr = scaleX + ',' + scaleY;
    let tx = -cx * (scaleX - 1);
    let ty = -cy * (scaleY - 1);
    let translatestr = parseFloat(tx).toFixed(3) + ',' + parseFloat(ty).toFixed(3);

    elementNode.setAttribute('transform', 'translate(' + translatestr + ') scale(' + saclestr + ')');
  } /*End scaleYElem()*/

  bindEvents() {
    for (let sindex = 0; sindex < this.CHART_OPTIONS.dataSet.series.length; sindex++) {
      for (let dindex = 0; dindex < this.CHART_OPTIONS.dataSet.series[sindex].data.length; dindex++) {
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("mouseenter", onMouseOver);
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("mouseenter", onMouseOver, false);
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("click", onMouseOver);
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("click", onMouseOver, false);
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("mouseleave", onMouseLeave);
        document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("mouseleave", onMouseLeave, false);
      }

      let legend = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #series_legend_" + sindex);
      if (legend) {
        legend.removeEventListener("click", onLegendClick);
        legend.addEventListener("click", onLegendClick, false);
      }
    }

    window.removeEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize, true);
  } /*End bindEvents()*/


  // let timeOut = null;
  // let onWindowResize = function () {
  //   let containerDiv = document.querySelector("#" + this.CHART_OPTIONS.targetElem);
  //   if (this.CHART_CONST.runId != containerDiv.getAttribute("runId")) {
  //     window.removeEventListener('resize', onWindowResize);
  //     if (timeOut != null) {
  //       clearTimeout(timeOut);
  //     }
  //     return;
  //   }
  //   if (containerDiv.offsetWidth !== this.CHART_CONST.FIX_WIDTH || containerDiv.offsetHeight !== this.CHART_CONST.FIX_HEIGHT) {
  //     if (timeOut != null) {
  //       clearTimeout(timeOut);
  //     }
  //     callChart();

  //     function callChart() {
  //       if (containerDiv) {
  //         if (containerDiv.offsetWidth === 0 && containerDiv.offsetHeight === 0) {
  //           timeOut = setTimeout(function () {
  //             callChart();
  //           }, 100);
  //         } else {
  //           timeOut = setTimeout(function () {
  //             init();
  //           }, 500);
  //         }
  //       }
  //     }
  //   }
  // }; /*End onWindowResize()*/

  onMouseOver(e) {
    try {
      let columnId = e.target.id;
      let column = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #" + columnId);
      column.setAttribute("opacity", 0.5);
      let toolTipPoint = new Point(this.CHART_DATA.columns[columnId].topMid.x, this.CHART_DATA.columns[columnId].topMid.y + 18);
      let seriesIndex = columnId.split("_")[1];
      let index = columnId.split("_")[2];
      let color = this.CHART_OPTIONS.dataSet.series[seriesIndex].data[index].color || this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
      let toolTipRow1 = this.CHART_DATA.columns[columnId].label,
        toolTipRow2 = this.CHART_DATA.columns[columnId].value;

      /*point should be available globally*/
      let point = this.CHART_OPTIONS.dataSet.series[seriesIndex].data[index];
      point["series"] = {
        name: this.CHART_OPTIONS.dataSet.series[seriesIndex].name
      };

      if (this.CHART_OPTIONS.toolTip && this.CHART_OPTIONS.toolTip.content) {
        let toolTipContent = this.CHART_OPTIONS.toolTip.content.replace(/{{/g, "${").replace(/}}/g, "}");
        let genContent = this.util.assemble(toolTipContent, "point");
        this.ui.toolTip(this.CHART_OPTIONS.targetElem, toolTipPoint, color, genContent(point), "html");
      } else
        this.ui.toolTip(this.CHART_OPTIONS.targetElem, toolTipPoint, color, toolTipRow1, toolTipRow2);

    } catch (ex) {
      console.log(ex);
    }
  }

  onMouseLeave(e) {
    let columnId = e.target.id;
    let column = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #columnChart #" + columnId);
    column.setAttribute("opacity", 1);
    this.ui.toolTip(this.CHART_OPTIONS.targetElem, "hide");
  }

  onLegendClick(e) {
    let columnId = e.target.id;
    let seriesIndex = columnId.split("_")[2];
    let legendColor = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #legend_color_" + seriesIndex);
    let columnSet = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #column_set_" + seriesIndex);
    let color = this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);
    if (legendColor.getAttribute("fill") === "#eee") {
      legendColor.setAttribute("fill", color);
      columnSet.style.display = "block";
    } else {
      legendColor.setAttribute("fill", "#eee");
      columnSet.style.display = "none";
    }
  } /*End onLegendClick()*/


  createColumnDropShadow() {
    let strSVG = "";
    strSVG = "<filter id='" + this.CHART_OPTIONS.targetElem + "-columnchart-dropshadow' height='130%'>";
    strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>";
    strSVG += "  <feOffset dx='2' dy='0' result='offsetblur'/>";
    strSVG += "  <feMerge>";
    strSVG += "    <feMergeNode/>";
    strSVG += "    <feMergeNode in='SourceGraphic'/>";
    strSVG += "  </feMerge>";
    strSVG += "</filter>";
    document.querySelector("#" + this.CHART_OPTIONS.targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

  } /*End createColumnDropShadow()*/

  round(val) {
    val = Math.round(val);
    let digitCount = val.toString().length;
    let nextVal = Math.pow(10, digitCount - 1);
    let roundVal = Math.ceil(val / nextVal) * nextVal;
    if (val < roundVal / 2)
      return roundVal / 2;
    else
      return roundVal;
  } /*End round()*/

  // init();
  // if (this.CHART_OPTIONS.animated !== false) showAnimatedView();

} /*End of Column Chart class */

module.exports = ColumnChart;