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
      "overlapColumns": false, //Only applicable for multi series 
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
      vLabelWidth: 70,
      hLabelHeight: 80,
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
      onMouseOverBind: self.onMouseOver.bind(self),
      onMouseLeaveBind: self.onMouseLeave.bind(self),
      onLegendClickBind: self.onLegendClick.bind(self),
      onHTextLabelHoverBind: self.onHTextLabelHover.bind(self),
      onHTextLabelMouseLeaveBind: self.onHTextLabelMouseLeave.bind(self),
      onWindowResizeBind: self.onWindowResize.bind(self, self.init)
    };
    this.init();

    if (this.CHART_OPTIONS.animated !== false) {
      this.showAnimatedView();
    }
  }

  init() {
    try {
      super.initBase();
      this.createColumnDropShadow();
      
      this.CHART_DATA.chartCenter = new Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
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

      this.prepareChart();
      this.render();
      this.tooltip.createTooltip(this);
    } catch (ex) {
      ex.errorIn = `Error in ColumnChart with runId:${this.getRunId()}`;
      throw ex;
    }

  } /*End init()*/

  prepareChart() {
    let self = this; 
    this.prepareDataSet();

    let strSVG = "";
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / this.CHART_CONST.FIX_WIDTH * this.CHART_OPTIONS.width) + "' y='" + (50 / this.CHART_CONST.FIX_HEIGHT * this.CHART_OPTIONS.height) + "' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    strSVG += "<g id='verticalLabelContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='horizontalLabelContainer'>";
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
      this.CHART_OPTIONS.dataSet.xAxis.categories
    );


    let scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length;
    let legendSet = []; 
    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      this.createColumns(this.CHART_OPTIONS.dataSet.series[index].data, index, scaleX);
      if (this.CHART_OPTIONS.dataSet.series.length > 1) {
        legendSet.push({
          label: this.CHART_OPTIONS.dataSet.series[index].name,
          value: "",
          color: this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index)
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

    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2) - 30) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 70) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.xAxis.title + "<\/text>";
    strSVG += "<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft - 30) + "' y='" + (this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2) - 5) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.yAxis.title + "<\/text>";
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

    this.resetTextPositions();
    this.bindEvents();

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
        if (categories.indexOf(dataSet[i].data[j].label) < 0) {
          categories.push(dataSet[i].data[j].label);
        }
      }
      let maxVal = Math.max.apply(null, arrData);
      let minVal = Math.min.apply(null, arrData);
      maxSet.push(maxVal);
      minSet.push(minVal);
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

  createColumns(dataSet, index, scaleX) {
    let d = [];
    let interval = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length;
    let colMaxWidth = (interval-8) > 25 ? 25 : (interval-8);
    let eachInterval = (interval - (interval / 5)) / this.CHART_OPTIONS.dataSet.series.length;
    let colHalfWidth = (colMaxWidth - (index*8))/2;
    if(this.CHART_OPTIONS.dataSet.series.length > 1 && !this.CHART_OPTIONS.overlapColumns){
      colHalfWidth = (eachInterval - 4) / 2;
    }
    colHalfWidth = colHalfWidth < 2 ? 2 : colHalfWidth;
    let scaleY = this.CHART_DATA.gridBoxHeight / (this.CHART_DATA.maxima);
    let arrPointsSet = [];
    let strSeries = "<g id='column_set_" + index + "' class='columns'>";
    let colCenter;

    for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
      if (this.CHART_OPTIONS.overlapColumns) {
        colCenter = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval / 2), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      } else {
        colCenter = new Point(this.CHART_DATA.marginLeft + (dataCount * interval) + (interval / 10) + (eachInterval * index) + (eachInterval / 2), ((this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      }
      if (dataSet.length > 50) {
        this.createDot(colCenter, "red", "2", null, null, this.CHART_DATA.chartSVG);
      }

      let cornerRadius = 2;
      d = [
        "M", colCenter.x - colHalfWidth + (cornerRadius), colCenter.y,
        "L", colCenter.x + colHalfWidth - (cornerRadius), colCenter.y,
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, cornerRadius,
        "L", colCenter.x + colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight -1 ),
        "L", colCenter.x - colHalfWidth, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight -1 ),
        "L", colCenter.x - colHalfWidth, colCenter.y + (cornerRadius),
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, -cornerRadius,
        "Z"
      ];
      arrPointsSet.push(colCenter);
      let color;
      if (this.CHART_OPTIONS.dataSet.series.length > 1) {
        color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
      } else {
        color = this.CHART_OPTIONS.dataSet.series[index].data[dataCount].color || this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
      }

      let fill = color;
      let filter = "";
      switch (this.CHART_OPTIONS.dataSet.series[index].gradient) {
        case "oval":
          this.appendGradFillOval(index, dataCount);
          fill = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-gradOval" + index + "_" + dataCount + ")";
          filter = "url(#" + this.CHART_OPTIONS.targetElem + "-columnchart-dropshadow)";
          break;
        case "linear":
          this.appendGradFillLinear(index, dataCount);
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
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSeries);

  } /*End createColumns()*/

  resetTextPositions() {
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
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 90);

    /*Reset position of vertical Sub title */
    let vTxtSubTitle = this.CHART_DATA.chartSVG.querySelector("#vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0," + (this.CHART_DATA.marginLeft - this.CHART_DATA.vLabelWidth - 10) + "," + (this.CHART_DATA.svgCenter.y) + ")");
    vTxtSubTitle.setAttribute("x", 0);
    vTxtSubTitle.setAttribute("y", 0);
  } /*End resetTextPositions()*/

  appendGradFillOval(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    let color, gradId = this.CHART_DATA.chartSVG.querySelector("#ovalGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) {
      return;
    }
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

    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillOval()*/

  appendGradFillLinear(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    let color, gradId = this.CHART_DATA.chartSVG.querySelector("#linearGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) {
      return;
    }
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
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillLinear()*/


  showAnimatedView() {
    let scaleY = 0.0;
    let timeoutId = setInterval(() => {
      for (let col in this.CHART_DATA.columns) {
        let column = this.CHART_DATA.chartSVG.querySelector("#" + col);
        this.scaleYElem(column, 1, scaleY);
      }
      scaleY += 0.1;
      if (scaleY >= 1) {
        clearInterval(timeoutId);
      }
    }, 50);
  } /*End showAnimatedView()*/

  scaleYElem(elementNode, scaleX, scaleY) {
    let bbox = elementNode.getBBox();
    let cx = bbox.x + (bbox.width / 2);
    let cy = bbox.y + (bbox.height); // finding center of element
    let saclestr = scaleX + ',' + scaleY;
    let tx = -cx * (scaleX - 1);
    let ty = -cy * (scaleY - 1);
    let translatestr = parseFloat(tx).toFixed(3) + ',' + parseFloat(ty).toFixed(3);
    elementNode.setAttribute('transform', 'translate(' + translatestr + ') scale(' + saclestr + ')');
  } /*End scaleYElem()*/

  bindEvents() {
    /*Bind events for column and click hover */
    for (let sindex = 0; sindex < this.CHART_OPTIONS.dataSet.series.length; sindex++) {
      for (let dindex = 0; dindex < this.CHART_OPTIONS.dataSet.series[sindex].data.length; dindex++) {
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).removeEventListener("mouseenter", this.EVENT_BINDS.onMouseOverBind);
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).addEventListener("mouseenter", this.EVENT_BINDS.onMouseOverBind, false);
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).removeEventListener("click", this.EVENT_BINDS.onMouseOverBind);
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).addEventListener("click", this.EVENT_BINDS.onMouseOverBind, false);
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).removeEventListener("mouseleave", this.EVENT_BINDS.onMouseLeaveBind);
        this.CHART_DATA.chartSVG.querySelector("#column_" + sindex + "_" + dindex).addEventListener("mouseleave", this.EVENT_BINDS.onMouseLeaveBind, false);
      }
    }

    /*Add events for legends to show/hide a series */
    this.event.off("onLegendClick", this.EVENT_BINDS.onLegendClickBind);
    this.event.on("onLegendClick", this.EVENT_BINDS.onLegendClickBind);

    /*Add events for Horizontal Text label hover */
    this.event.off("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.on("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.off("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);
    this.event.on("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);

    /*Add events for resize chart window */
    window.removeEventListener('resize', this.EVENT_BINDS.onWindowResizeBind);
    window.addEventListener('resize', this.EVENT_BINDS.onWindowResizeBind, true);
  } /*End bindEvents()*/

  onMouseOver(e) {
    try {
      let columnId = e.target.id;
      this.CHART_DATA.chartSVG.querySelector("#" + columnId).setAttribute("opacity", 0.5);
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
        this.tooltip.updateTip(toolTipPoint, color, genContent(point), "html");
      } else {
        this.tooltip.updateTip(toolTipPoint, color, toolTipRow1, toolTipRow2);
      }

    } catch (ex) {
      ex.errorIn = `Error in ColumnChart mouseover with runId:${this.getRunId()}`;
      throw ex;
    }
  }

  onMouseLeave(e) {
    this.CHART_DATA.chartSVG.querySelector("#" + e.target.id).setAttribute("opacity", 1);
    this.tooltip.hide();
  }

  onLegendClick(e) {
    let seriesIndex = e.legendIndex;
    let color = e.legendData.color;
    let doShow = e.toggeled ? "none" : "block";
    let legendColor = this.CHART_DATA.chartSVG.querySelector("#legend_color_" + seriesIndex);
    let columnSet = this.CHART_DATA.chartSVG.querySelector("#column_set_" + seriesIndex);
    if(columnSet) {
      columnSet.style.display = doShow; 
    }
  } /*End onLegendClick()*/

  onHTextLabelHover(e) {
    let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.originEvent);
    this.tooltip.updateTip(mousePointer, "#555", e.originEvent.target.getAttribute("title"));
  } /*End onHTextLabelHover() */

  onHTextLabelMouseLeave(e) {
    this.tooltip.hide();
  } /*End onHTextLabelMouseLeave()*/


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
    this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);

  } /*End createColumnDropShadow()*/

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

} /*End of Column Chart class */

module.exports = ColumnChart;