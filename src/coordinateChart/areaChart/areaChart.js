/*
 * SVG Area Chart 
 * @Version:1.1.0
 * @CreatedOn:31-05-2016
 * @Author:SmartChartsNXT
 * @description: SVG Area Chart, that support multiple series, and zoom window.
 * @JSFiddle:
 * @Sample caller code:
 
  SmartChartsNXT.ready(function(){
    let areaChart = new SmartChartsNXT.AreaChart({
      "title":"Multi Series Chart",
      "subTitle":"Area Chart",
      "targetElem":"chartContainer",
      "canvasBorder":false,
      "bgColor":"none",
      "animated":false,
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
            "data": generateData(10,50,45)
          },
          {
            "lineWidth":2,
            "color":"#F44336",
            "noPointMarker":false,
            "markerRadius":3.5,
            "smoothedLine":false,
            "showGradient":true,
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

let CoordinateChart = require("./../coordinateChart");

class AreaChart extends CoordinateChart {

  constructor(opts) {
    super("areaChart", opts);
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
      hScrollBoxHeight: 60,
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
      newCatgList: []
    }, this.CHART_DATA);

    this.CHART_CONST = this.util.extends({
      hGridCount: 9
    }, this.CHART_CONST);

    this.timeOut = null;
    this.EVENT_BINDS = {
      onLegendClickBind: self.onLegendClick.bind(self),
      onMouseMoveBind: self.onMouseMove.bind(self),
      onMouseLeaveBind: self.onMouseLeave.bind(self),
      onZoomOutBind: self.onZoomOut.bind(self),
      onWindowResizeBind: self.onWindowResize.bind(self),
      onHTextLabelHoverBind: self.onHTextLabelHover.bind(self),
      onHTextLabelMouseLeaveBind: self.onHTextLabelMouseLeave.bind(self)
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
      this.CHART_DATA.chartCenter = new this.geom.Point(this.CHART_DATA.svgCenter.x, this.CHART_DATA.svgCenter.y + 50);
      this.CHART_DATA.marginLeft = ((-1) * this.CHART_DATA.scaleX / 2) + 100;
      this.CHART_DATA.marginRight = ((-1) * this.CHART_DATA.scaleX / 2) + 20;
      this.CHART_DATA.marginTop = ((-1) * this.CHART_DATA.scaleY / 2) + 120;
      this.CHART_DATA.marginBottom = ((-1) * this.CHART_DATA.scaleY / 2) + 170;

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

    } catch (ex) {
      this.handleError(ex, "Error in AreaChart");
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
    if (this.CHART_OPTIONS.canvasBorder) {
      strSVG += "<g>";
      strSVG += "  <rect x='" + ((-1) * this.CHART_DATA.scaleX / 2) + "' y='" + ((-1) * this.CHART_DATA.scaleY / 2) + "' width='" + ((this.CHART_DATA.svgCenter.x * 2) + this.CHART_DATA.scaleX) + "' height='" + ((this.CHART_DATA.svgCenter.y * 2) + this.CHART_DATA.scaleY) + "' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / this.CHART_CONST.FIX_WIDTH * this.CHART_OPTIONS.width) + "' y='" + (50 / this.CHART_CONST.FIX_HEIGHT * this.CHART_OPTIONS.height) + "' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";


    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='scrollerCont'>";
    strSVG += "</g>";

    strSVG += "<path id='hLine' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='vLine' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtTitle").textContent = this.CHART_OPTIONS.title;
    this.CHART_DATA.objChart.querySelector("#txtSubtitle").textContent = this.CHART_OPTIONS.subTitle;

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      this.appendGradFill(index);
    }

    this.CHART_DATA.gridBoxWidth = (this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight;
    this.CHART_DATA.gridBoxHeight = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom;
    this.CHART_DATA.gridHeight = (((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginTop - this.CHART_DATA.marginBottom) / (this.CHART_CONST.hGridCount - 1));

    this.grid.createGrid(this.CHART_DATA.marginLeft, this.CHART_DATA.marginTop, this.CHART_DATA.gridBoxWidth, this.CHART_DATA.gridBoxHeight, this.CHART_DATA.gridHeight, this.CHART_CONST.hGridCount);
    this.prepareFullSeriesDataset();
    this.hScroller.createScrollBox(this,
      this.CHART_DATA.objChart,
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

    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft + (this.CHART_DATA.gridBoxWidth / 2) - 30) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 70) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.xAxis.title + "<\/text>";
    strSVG += "<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='" + (this.CHART_DATA.marginLeft - 30) + "' y='" + (this.CHART_DATA.marginTop + (this.CHART_DATA.gridBoxHeight / 2) - 5) + "' font-size='18' >" + this.CHART_OPTIONS.dataSet.yAxis.title + "<\/text>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSVG);


    if (this.CHART_DATA.objChart.querySelector("#scrollerCont #outerFrame")) {
      this.bindSliderEvents();
      this.createZoomOutBox();
      this.resetSliderPos("left", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowLeftIndex].x);
      this.resetSliderPos("right", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowRightIndex].x);
    }

    this.reDrawSeries();
  } /*End prepareChart()*/

  prepareFullSeriesDataset() {
    let scaleX = this.CHART_DATA.fsScaleX = (this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length);
    let scaleYfull = (this.CHART_DATA.hScrollBoxHeight / this.CHART_DATA.maxima);

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      let arrPointsSet = [];
      let dataSet = this.CHART_OPTIONS.dataSet.series[index].data;
      for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
        let p = new this.geom.Point(this.CHART_DATA.marginLeft + (dataCount * scaleX) + (scaleX / 2), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight) - (dataSet[dataCount].value * scaleYfull));
        arrPointsSet.push(p);
      }
      this.CHART_DATA.fullSeries.push(arrPointsSet);
    }
  } /* End prepareFullSeriesDataset() */


  // createFullSeries() {
  //   let strSVG = "";
  //   strSVG += "<g id='fullSeriesChartCont'></g>";
  //   strSVG += "<rect id='sliderLeftOffset' x='" + (this.CHART_DATA.marginLeft) + "' y='" + ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight) + "' width='0' height='" + (this.CHART_DATA.hScrollBoxHeight) + "' fill= 'rgba(128,179,236,0.5)'  fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";
  //   strSVG += "<rect id='sliderRightOffset' x='" + ((this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginRight) + "' y='" + ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight) + "' width='0' height='" + (this.CHART_DATA.hScrollBoxHeight) + "' fill = 'rgba(128,179,236,0.5)' fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";

  //   let outerContPath = [
  //     "M", (this.CHART_DATA.marginLeft), ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight + 10),
  //     "L", (this.CHART_DATA.marginLeft), ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight),
  //     "L", (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth), ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight),
  //     "L", (this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth), ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight + 10)
  //   ];

  //   strSVG += "<path stroke='#333' fill='none' d='" + outerContPath.join(" ") + "' stroke-width='1' opacity='1'></path>";
  //   strSVG += "<rect id='outerFrame' x='" + (this.CHART_DATA.marginLeft) + "' y='" + ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight) + "' width='" + ((this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginLeft - this.CHART_DATA.marginRight) + "' height='" + (this.CHART_DATA.hScrollBoxHeight) + "' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
  //   strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
  //   strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";

  //   strSVG += "<g id='sliderLeftHandle' style='cursor: ew-resize;'>";
  //   strSVG += "  <rect id='sliderLSelFrame' x=''  y='" + this.CHART_DATA.svgCenter.y + "' width='10' height='" + this.CHART_DATA.svgCenter.y + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
  //   strSVG += "  <path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
  //   strSVG += "  <path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
  //   strSVG += "</g>";

  //   strSVG += "<g id='sliderRightHandle' style='cursor: ew-resize;'>";
  //   strSVG += "  <rect id='sliderRSelFrame' x=''  y='" + this.CHART_DATA.svgCenter.y + "' width='10' height='" + this.CHART_DATA.svgCenter.y + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
  //   strSVG += "  <path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
  //   strSVG += "  <path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
  //   strSVG += "</g>";
  //   this.CHART_DATA.objChart.querySelector("#scrollerCont").insertAdjacentHTML("beforeend", strSVG);

  // } /*End createFullSeries()*/

  drawFullSeries(arrPointsSet, index) {
    let line = [];
    let area = [];
    let d;
    let strSeries = "<g id='fullSeries_" + index + "' class='fullSeries'>";
    line.push.apply(line, ["M", arrPointsSet[0].x, arrPointsSet[0].y]);
    let point = 0;
    for (let point = 0;
      (point + 2) < arrPointsSet.length; point++) {
      if (this.CHART_OPTIONS.dataSet.series[index].smoothedLine) {
        let curve = this.geom.describeBezireArc(arrPointsSet[point], arrPointsSet[point + 1], arrPointsSet[point + 2]);
        line.push.apply(line, curve);
      } else {
        line.push.apply(line, ["L", arrPointsSet[point].x, arrPointsSet[point].y]);
      }
    }

    if (!this.CHART_OPTIONS.dataSet.series[index].smoothedLine && arrPointsSet.length > 1) {
      line.push.apply(line, ["L", arrPointsSet[arrPointsSet.length - 2].x, arrPointsSet[arrPointsSet.length - 2].y]);
    }
    line.push.apply(line, ["L", arrPointsSet[arrPointsSet.length - 1].x, arrPointsSet[arrPointsSet.length - 1].y]);
    area.push.apply(area, line);
    d = ["L", arrPointsSet[arrPointsSet.length - 1].x, (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight), "L", this.CHART_DATA.marginLeft + (this.CHART_DATA.fsScaleX / 2), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight), "Z"];
    area.push.apply(area, d);

    strSeries += "<path id='fLine_" + index + "' stroke='#000' fill='none' d='" + line.join(" ") + "' stroke-width='1' opacity='0.6'></path>";
    strSeries += "<path id='fArea_" + index + "' stroke='none' fill='#000' d='" + area.join(" ") + "' stroke-width='1' opacity='0.4'></path>";

    let hChartScrollerCont = this.CHART_DATA.objChart.querySelector("#scrollerCont #hChartScrollerCont");
    if (hChartScrollerCont) {
      hChartScrollerCont.insertAdjacentHTML("beforeend", strSeries);
    }
  } /*End drawFullSeries()*/

  createZoomOutBox() {
    let zoomOutBox = {
      top: this.CHART_DATA.marginTop - 40,
      left: this.CHART_DATA.marginLeft + this.CHART_DATA.gridBoxWidth - 40,
      width: 40,
      height: 40
    };

    let strSVG = "<g id='zoomOutBoxCont' style='display:none;'>";
    strSVG += "  <rect id='zoomOutBox' x='" + zoomOutBox.left + "' y='" + zoomOutBox.top + "' width='" + zoomOutBox.width + "' height='" + zoomOutBox.height + "' pointer-events='all' stroke='#717171' fill='none' stroke-width='0' \/>";
    strSVG += "  <circle r='10' cx='" + (zoomOutBox.left + (zoomOutBox.width / 2)) + "' cy='" + (zoomOutBox.top + (zoomOutBox.height / 2)) + "' pointer-events='none' stroke-width='1' fill='none' stroke='#333'/>";
    strSVG += "  <line x1='" + (zoomOutBox.left + (zoomOutBox.width / 2) - 4) + "' y1='" + (zoomOutBox.top + (zoomOutBox.height / 2)) + "' x2='" + (zoomOutBox.left + (zoomOutBox.width / 2) + 4) + "' y2='" + (zoomOutBox.top + (zoomOutBox.height / 2)) + "' pointer-events='none' stroke-width='1' fill='none' stroke='#333'/>";

    let lineStart = this.geom.polarToCartesian((zoomOutBox.left + (zoomOutBox.width / 2)), (zoomOutBox.top + (zoomOutBox.height / 2)), 10, 135);
    let lineEnd = this.geom.polarToCartesian((zoomOutBox.left + (zoomOutBox.width / 2)), (zoomOutBox.top + (zoomOutBox.height / 2)), 20, 135);
    strSVG += "  <line x1='" + lineStart.x + "' y1='" + lineStart.y + "' x2='" + lineEnd.x + "' y2='" + lineEnd.y + "' pointer-events='none' stroke-width='2' fill='none' stroke='#333'/>";
    strSVG += "</g>";

    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSVG);
  } /*End createZoomOutBox() */

  prepareDataSet(dataSet) {
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
    let elemSeries = this.CHART_DATA.objChart.querySelector("#series_" + index);
    let elemActualSeries = this.CHART_DATA.objChart.querySelector("#series_actual_" + index);
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
    let strSeries = "";

    /* ploting actual points */
    strSeries = "<g id='series_actual_" + index + "' class='series' pointer-events='none' >";
    for (let dataCount = 0; dataCount < dataSet.length; dataCount++) {
      let p = new this.geom.Point(this.CHART_DATA.marginLeft + (dataCount * scaleX) + (interval / 2), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY));
      d.push(!dataCount ? "M" : "L");
      d.push(p.x);
      d.push(p.y);
      arrPointsSet.push(p);
    }

    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    let strokeWidth = this.CHART_OPTIONS.dataSet.series[index].lineWidth || 1;
    let areaOpacity = this.CHART_OPTIONS.dataSet.series[index].areaOpacity || 0.3;
    areaOpacity = this.CHART_OPTIONS.dataSet.series[index].showGradient ? 1 : areaOpacity;
    let fill = this.CHART_OPTIONS.dataSet.series[index].showGradient ? "url(#" + this.CHART_OPTIONS.targetElem + "-areachart-gradLinear" + index + ")" : color;

    if (this.CHART_OPTIONS.dataSet.series[index].smoothedLine) {
      strSeries += "<path stroke='" + color + "' fill='none' d='" + d.join(" ") + "' stroke-dasharray='1,1' stroke-width='1' opacity='1'></path>";
    } else {
      strSeries += "<path stroke='" + color + "' fill='none' d='" + d.join(" ") + "' stroke-width='" + strokeWidth + "' opacity='1'></path>";
    }
    strSeries += "</g>";
    if (dataSet.length < 50) {
      this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSeries);
    }
    this.CHART_DATA.series.push(arrPointsSet);

    let line = [];
    let area = [];
    strSeries = "<g id='series_" + index + "' class='series' pointer-events='none' >";

    line.push.apply(line, ["M", arrPointsSet[0].x, arrPointsSet[0].y]);
    let point = 0;
    for (let point = 0;
      (point + 2) < arrPointsSet.length; point++) {
      if (this.CHART_OPTIONS.dataSet.series[index].smoothedLine) {
        let curve = this.geom.describeBezireArc(arrPointsSet[point], arrPointsSet[point + 1], arrPointsSet[point + 2]);
        line.push.apply(line, curve);
      } else {
        line.push.apply(line, ["L", arrPointsSet[point].x, arrPointsSet[point].y]);
      }
    }

    if (!this.CHART_OPTIONS.dataSet.series[index].smoothedLine && arrPointsSet.length > 1) {
      line.push.apply(line, ["L", arrPointsSet[arrPointsSet.length - 2].x, arrPointsSet[arrPointsSet.length - 2].y]);
    }
    line.push.apply(line, ["L", arrPointsSet[arrPointsSet.length - 1].x, arrPointsSet[arrPointsSet.length - 1].y]);

    area.push.apply(area, line);
    d = ["L", arrPointsSet[arrPointsSet.length - 1].x, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight, "L", this.CHART_DATA.marginLeft + (interval / 2), this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight, "Z"];
    area.push.apply(area, d);

    strSeries += "<path id='area_" + index + "' stroke='none' fill='" + fill + "' d='" + area.join(" ") + "' stroke-width='1' opacity='" + areaOpacity + "'></path>";
    strSeries += "<path id='line_" + index + "' stroke='" + color + "' fill='none' d='" + line.join(" ") + "' stroke-width='" + strokeWidth + "' opacity='1'></path>";

    let radius = this.CHART_OPTIONS.dataSet.series[index].markerRadius || 4;
    if (!this.CHART_OPTIONS.dataSet.series[index].noPointMarker) {
      for (let point = 0; point + 2 < arrPointsSet.length; point++) {
        if (dataSet.length < 30) {
          strSeries += "<circle cx=" + arrPointsSet[point + 1].x + " cy=" + arrPointsSet[point + 1].y + " r='" + radius + "' class='dot' style='fill:" + color + "; opacity: 1; stroke-width: 1px;'></circle>";
          strSeries += "<circle cx=" + arrPointsSet[point + 1].x + " cy=" + arrPointsSet[point + 1].y + " r='2' class='dot' style='fill:white; opacity: 1; stroke-width: 1px;'></circle>";
        }
      }
    }
    strSeries += "</g>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSeries);

  } /*End createSeries()*/

  appendGradFill(index) {
    /*Creating gradient fill for area*/
    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    let areaOpacity = this.CHART_OPTIONS.dataSet.series[index].areaOpacity || 0.5;
    let strSVG = "";
    strSVG += "<defs>";
    strSVG += "  <linearGradient gradientUnits = 'userSpaceOnUse' id='" + this.CHART_OPTIONS.targetElem + "-areachart-gradLinear" + index + "' x1='0%' y1='0%' x2='100%' y2='0%'>";
    strSVG += "  <stop offset='0%' style='stop-color:white;stop-opacity:" + areaOpacity + "' />";
    strSVG += "  <stop offset='100%' style='stop-color:" + color + ";stop-opacity:" + areaOpacity + "' />";
    strSVG += "  </linearGradient>";
    strSVG += "</defs>";
    this.CHART_DATA.objChart.insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFill()*/

  createLegands(index) {
    let seriesLegend = this.CHART_DATA.objChart.querySelector("#legendContainer #series_legend_" + index);
    if (seriesLegend) {
      seriesLegend.parentNode.removeChild(seriesLegend);
    }

    /*Creating series legend*/
    let color = this.CHART_OPTIONS.dataSet.series[index].color || this.util.getColor(index);
    let strSVG = "";
    strSVG = "<g id='series_legend_" + index + "' style='cursor:pointer;'>";
    strSVG += "<rect id='legend_color_" + index + "' x='" + this.CHART_DATA.marginLeft + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 130) + "' width='10' height='10' fill='" + color + "' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG += "<text id='legend_txt_" + index + "' font-size='12' x='" + (this.CHART_DATA.marginLeft + 20) + "' y='" + (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + 140) + "' fill='#717171' font-family='Verdana' >" + this.CHART_OPTIONS.dataSet.series[index].name + "</text>";
    strSVG += "</g>";
    this.CHART_DATA.objChart.querySelector("#legendContainer").insertAdjacentHTML("beforeend", strSVG);
  }

  resetTextPositions(categories) {
    let txtTitleLen = this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtTitle").getComputedTextLength();
    let txtSubTitleLen = this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtSubtitle").getComputedTextLength();
    let txtTitleGrp = this.CHART_DATA.objChart.querySelector("#txtTitleGrp");


    if (txtTitleLen > this.CHART_CONST.FIX_WIDTH) {
      let fontSize = this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtTitle").getAttribute("font-size");
      this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtTitle").setAttribute("font-size", fontSize - 5);
      this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtSubtitle").getAttribute("font-size");
      this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtSubtitle").setAttribute("font-size", fontSize - 3);
      txtSubTitleLen = this.CHART_DATA.objChart.querySelector("#txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtTitleLen / 2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (this.CHART_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 90);

    // /*Adjust vertical text label size*/
    // let arrVTextLabels = this.CHART_DATA.objChart.querySelectorAll("#vTextLabel text");
    // for (let i = 0; i < arrVTextLabels.length; i++) {
    //   let txtWidth = arrVTextLabels[i].getComputedTextLength();
    //   if (txtWidth > this.CHART_DATA.vLabelWidth - 10) {
    //     let fontSize = arrVTextLabels[i].querySelector("tspan").getAttribute("font-size");
    //     arrVTextLabels.forEach(elem => {
    //       elem.querySelector("tspan").setAttribute("font-size", (fontSize - 1));
    //     });
    //     i = 0;
    //   }
    // }

    /*Adjust horzontal text label size*/
    let totalHTextWidth = 0;
    let arrHText = this.CHART_DATA.objChart.querySelectorAll("#hTextLabel text");
    for (let i = 0; i < arrHText.length; i++) {
      let txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth += (txWidth);
    }
    let interval = this.CHART_DATA.gridBoxWidth / categories.length;
    if (parseFloat(totalHTextWidth + (arrHText.length * 10)) > parseFloat(this.CHART_DATA.gridBoxWidth)) {
      for (let i = 0; i < arrHText.length; i++) {
        let cx = arrHText[i].getAttribute("x");
        let cy = arrHText[i].getAttribute("y");

        let txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("transform", "translate(-" + interval / 2 + "," + (10) + ")rotate(-45," + (cx) + "," + (cy) + ")");

        if (txWidth + 15 > this.CHART_DATA.hLabelHeight) {
          let fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
          if (fontSize > 9) {
            arrHText.forEach(function (elem) {
              elem.querySelector("tspan").setAttribute("font-size", (fontSize - 1));
            });
          }
          txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        }
        while (txWidth + 15 > this.CHART_DATA.hLabelHeight) {
          arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0, (arrHText[i].querySelector("tspan").textContent.length - 4)) + "...";
          txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
        }
      }
    }

    let vTxtSubTitle = this.CHART_DATA.objChart.querySelector("#vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0," + (this.CHART_DATA.marginLeft - this.CHART_DATA.vLabelWidth - 10) + "," + (this.CHART_DATA.svgCenter.y) + ")");
    vTxtSubTitle.setAttribute("x", 0);
    vTxtSubTitle.setAttribute("y", 0);

    /*Set position for legend text*/
    let arrLegendText = this.CHART_DATA.objChart.querySelectorAll("#legendContainer text");
    let arrLegendColor = this.CHART_DATA.objChart.querySelectorAll("#legendContainer rect");
    let width = 0;
    let row = 0;
    for (let i = 0; i < arrLegendText.length; i++) {
      arrLegendColor[i].setAttribute("x", (width + this.CHART_DATA.marginLeft - 60));
      arrLegendText[i].setAttribute("x", (width + this.CHART_DATA.marginLeft + 20 - 60));
      arrLegendColor[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + this.CHART_DATA.hScrollBoxHeight + 10 + (row * 20)));
      arrLegendText[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + this.CHART_DATA.hScrollBoxHeight + 20 + (row * 20)));
      width += (arrLegendText[i].getBBox().width + 50);

      if (width > this.CHART_CONST.FIX_WIDTH) {
        width = 0;
        row++;
        arrLegendColor[i].setAttribute("x", (width + this.CHART_DATA.marginLeft - 60));
        arrLegendText[i].setAttribute("x", (width + this.CHART_DATA.marginLeft + 20 - 60));
        arrLegendColor[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + this.CHART_DATA.hScrollBoxHeight + 10 + (row * 20)));
        arrLegendText[i].setAttribute("y", (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + this.CHART_DATA.hScrollBoxHeight + 20 + (row * 20)));
        width += (arrLegendText[i].getBBox().width + 50);
      }

    }

  } /*End resetTextPositions()*/

  bindEvents() {
    let self = this;
    this.CHART_DATA.windowRightIndex = (this.CHART_DATA.windowRightIndex < 0) ? this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length : this.CHART_DATA.windowRightIndex;
    this.CHART_DATA.newDataSet = [], this.CHART_DATA.newCatgList = [];

    for (let i = this.CHART_DATA.windowLeftIndex; i <= this.CHART_DATA.windowRightIndex; i++) {
      this.CHART_DATA.newCatgList.push(this.CHART_OPTIONS.dataSet.xAxis.categories[i % this.CHART_OPTIONS.dataSet.xAxis.categories.length]);
    }

    for (let setIndex = 0; setIndex < this.CHART_OPTIONS.dataSet.series.length; setIndex++) {
      let set = this.CHART_OPTIONS.dataSet.series[setIndex].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex + 1);
      this.CHART_DATA.newDataSet.push(set);
    }

    for (let index = 0; index < this.CHART_OPTIONS.dataSet.series.length; index++) {
      let legend = this.CHART_DATA.objChart.querySelector("#series_legend_" + index);
      if (legend) {
        legend.removeEventListener("click", this.EVENT_BINDS.onLegendClickBind);
        legend.addEventListener("click", this.EVENT_BINDS.onLegendClickBind, false);
      }
    }

    let gridRect = this.CHART_DATA.objChart.querySelector("#gridRect");
    if (gridRect) {
      gridRect.removeEventListener("mousemove", this.EVENT_BINDS.onMouseMoveBind);
      gridRect.addEventListener("mousemove", this.EVENT_BINDS.onMouseMoveBind, false);
      gridRect.removeEventListener("click", this.EVENT_BINDS.onMouseMoveBind);
      gridRect.addEventListener("click", this.EVENT_BINDS.onMouseMoveBind, false);
      gridRect.removeEventListener("mousleave", this.EVENT_BINDS.onMouseLeaveBind);
      gridRect.addEventListener("mouseleave", this.EVENT_BINDS.onMouseLeaveBind, false);
    }

    let zoomOutBox = this.CHART_DATA.objChart.querySelector("#zoomOutBox");
    if (zoomOutBox) {
      zoomOutBox.removeEventListener("click", this.EVENT_BINDS.onZoomOutBind);
      zoomOutBox.addEventListener("click", this.EVENT_BINDS.onZoomOutBind, false);
    }

    /*Add event for Horizontal Text label hover */
    this.event.off("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.on("onHTextLabelHover", this.EVENT_BINDS.onHTextLabelHoverBind);
    this.event.off("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);
    this.event.on("onHTextLabelMouseLeave", this.EVENT_BINDS.onHTextLabelMouseLeaveBind);

    window.removeEventListener('resize', this.EVENT_BINDS.onWindowResizeBind);
    window.addEventListener('resize', this.EVENT_BINDS.onWindowResizeBind, true);
  } /*End bindEvents()*/


  onHTextLabelHover(e) {
    let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.originEvent);
    this.ui.toolTip(this.CHART_OPTIONS.targetElem, mousePointer, "#555", e.originEvent.target.getAttribute("title"));
  } /*End onHTextLabelHover() */

  onHTextLabelMouseLeave(e) {
    this.ui.toolTip(this.CHART_OPTIONS.targetElem, "hide");
  } /*End onHTextLabelMouseLeave()*/

  onWindowResize() {
    let self = this;
    let containerDiv = document.querySelector("#" + this.CHART_OPTIONS.targetElem);
    if (this.runId != containerDiv.getAttribute("runId")) {
      window.removeEventListener('resize', self.onWindowResize);
      if (timeOut != null) {
        clearTimeout(timeOut);
      }
      return;
    }
    if (containerDiv.offsetWidth !== this.CHART_CONST.FIX_WIDTH || containerDiv.offsetHeight !== this.CHART_CONST.FIX_HEIGHT) {
      if (self.timeOut != null) {
        clearTimeout(self.timeOut);
      }
      callChart();

      function callChart() {
        if (containerDiv) {
          if (containerDiv.offsetWidth === 0 && containerDiv.offsetHeight === 0) {
            self.timeOut = setTimeout(function () {
              callChart();
            }, 100);
          } else {
            self.timeOut = setTimeout(function () {
              self.init();
            }, 500);
          }
        }
      }
    }
  } /*End onWindowResize()*/

  onMouseMove(e) {
    try {
      e.stopPropagation();
      let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e);
      let gridBox = this.CHART_DATA.objChart.querySelector("#hGrid").getBBox();
      if (mousePointer.x >= gridBox.x && mousePointer.x < (gridBox.x + this.CHART_DATA.gridBoxWidth) && mousePointer.y >= gridBox.y && mousePointer.y < (gridBox.y + this.CHART_DATA.gridBoxHeight)) {
        let multiSeriesPoints = [];
        for (let i = 0; i < this.CHART_DATA.series.length; i++) {
          if (!this.CHART_DATA.objChart.querySelector("#series_" + i) || this.CHART_DATA.objChart.querySelector("#series_" + i).style.display === "none") {
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

        toolTipPoint = this.CHART_DATA.series[indx][npIndex];

        /*Create vertical line*/
        let vLinePath = ["M", toolTipPoint.x, toolTipPoint.y, "L", toolTipPoint.x, this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight];
        let vLine = this.CHART_DATA.objChart.querySelector("#vLine");
        if (vLine) {
          vLine.setAttribute("d", vLinePath.join(" "));
          vLine.parentNode.removeChild(vLine);
          this.CHART_DATA.objChart.appendChild(vLine);
        }

        if (toolTipPoint) {
          let elms = this.CHART_DATA.objChart.querySelectorAll(".tooTipPoint");
          for (let i = 0; i < elms.length; i++) {
            elms[i].parentNode.removeChild(elms[i]);
          }

          let color = this.CHART_OPTIONS.dataSet.series[indx].color || this.util.getColor(indx);
          let radius = this.CHART_OPTIONS.dataSet.series[indx].markerRadius || 4;
          this.geom.createDot(toolTipPoint, "#FFF", (radius + 2), 1, "tooTipPoint", "areaChart", color);
          this.geom.createDot(toolTipPoint, color, radius, 1, "tooTipPoint", "areaChart");

          let toolTipRow1, toolTipRow2;
          toolTipRow1 = (this.CHART_OPTIONS.dataSet.xAxis.title + " " + this.CHART_DATA.newCatgList[npIndex]);
          toolTipRow2 = (this.CHART_OPTIONS.dataSet.yAxis.title + " " + (this.CHART_OPTIONS.dataSet.yAxis.prefix || "") + " " + this.CHART_DATA.newDataSet[indx][npIndex].value);

          /*point should be available globally*/
          let point = this.CHART_DATA.newDataSet[indx][npIndex];
          point["series"] = {
            name: this.CHART_OPTIONS.dataSet.series[indx].name
          };

          if (this.CHART_OPTIONS.toolTip && this.CHART_OPTIONS.toolTip.content) {
            let toolTipContent = this.CHART_OPTIONS.toolTip.content.replace(/{{/g, "${").replace(/}}/g, "}");
            let genContent = this.util.assemble(toolTipContent, "point");
            this.ui.toolTip(this.CHART_OPTIONS.targetElem, toolTipPoint, color, genContent(point), "html");
          } else {
            this.ui.toolTip(this.CHART_OPTIONS.targetElem, toolTipPoint, color, toolTipRow1, toolTipRow2);
          }

          this.CHART_DATA.objChart.querySelector("#vLine").style.display = "block";
        }
      }
    } catch (ex) {
      this.handleError(ex);
    }
  } /*End onMouseMove()*/

  onMouseLeave() {
    this.ui.toolTip(this.CHART_OPTIONS.targetElem, "hide");
    this.CHART_DATA.objChart.querySelectorAll(".tooTipPoint");
    let elms = this.CHART_DATA.objChart.querySelectorAll(".tooTipPoint");
    for (let i = 0; i < elms.length; i++) {
      elms[i].parentNode.removeChild(elms[i]);
    }

    let vLine = this.CHART_DATA.objChart.querySelector("#vLine");
    if (vLine) {
      vLine.style.display = "none";
    }

  } /*End onMouseLeave()*/

  onLegendClick(e) {
    let seriesIndex = e.target.id.split("_")[2];
    let legendColor = this.CHART_DATA.objChart.querySelector("#legend_color_" + seriesIndex);
    let area = this.CHART_DATA.objChart.querySelector("#series_" + seriesIndex);
    let actualArea = this.CHART_DATA.objChart.querySelector("#series_actual_" + seriesIndex);
    let color = this.CHART_OPTIONS.dataSet.series[seriesIndex].color || this.util.getColor(seriesIndex);

    if (legendColor.getAttribute("fill") === "#eee") {
      legendColor.setAttribute("fill", color);
      area.style.display = "block";
      if (actualArea) {
        actualArea.style.display = "block";
      }
    } else {
      legendColor.setAttribute("fill", "#eee");
      area.style.display = "none";
      if (actualArea) {
        actualArea.style.display = "none";
      }
    }
  } /*End onLegendClick()*/

  bindSliderEvents() {
    let sliderLeftHandle = this.CHART_DATA.objChart.querySelector("#sliderLeftHandle");
    let sliderRightHandle = this.CHART_DATA.objChart.querySelector("#sliderRightHandle");
    let eventMouseDown = new Event("mousedown");
    let eventMouseUp = new Event("mouseup");
    let eventTouchStart = new Event("touchstart");
    let eventTouchEnd = new Event("touchend");
    let eventTouchCancel = new Event("touchcancel");
    let self = this;
    let leftSliderMoveBind = this.bindLeftSliderMove.bind(this);
    let rightSliderMoveBind = this.bindRightSliderMove.bind(this);

    sliderLeftHandle.addEventListener("mousedown", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 1;
      sliderLeftHandle.addEventListener("mousemove", leftSliderMoveBind);
      self.CHART_DATA.objChart.addEventListener("mousemove", leftSliderMoveBind);
    });

    sliderLeftHandle.addEventListener("mouseup", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 0;
      sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
      self.CHART_DATA.objChart.removeEventListener("mousemove", leftSliderMoveBind);
      self.resetSliderPos("left", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowLeftIndex].x);
      self.reDrawSeries();
    });

    sliderLeftHandle.addEventListener("mouseleave", function (e) {
      e.stopPropagation();
      sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
    });

    sliderLeftHandle.addEventListener("mouseenter", function (e) {
      e.stopPropagation();
      if (self.CHART_DATA.mouseDown === 1) {
        sliderRightHandle.dispatchEvent(eventMouseUp);
        sliderRightHandle.dispatchEvent(eventTouchEnd);
        sliderRightHandle.dispatchEvent(eventTouchCancel);
        sliderLeftHandle.dispatchEvent(eventMouseDown);
        sliderLeftHandle.dispatchEvent(eventTouchStart);
      }
    });


    this.CHART_DATA.objChart.addEventListener("mouseup", function (e) {
      e.stopPropagation();
      if (self.CHART_DATA.mouseDown === 1) {
        sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
        self.CHART_DATA.objChart.removeEventListener("mousemove", leftSliderMoveBind);
        sliderLeftHandle.removeEventListener("mousemove", rightSliderMoveBind);
        self.CHART_DATA.objChart.removeEventListener("mousemove", rightSliderMoveBind);
        if (e.target.id === "sliderRight") {
          self.resetSliderPos("right", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowRightIndex].x);
        } else {
          self.resetSliderPos("left", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowLeftIndex].x);
        }
        self.reDrawSeries();
      }
      self.CHART_DATA.mouseDown = 0;
    });

    sliderRightHandle.addEventListener("mousedown", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 1;
      sliderRightHandle.addEventListener("mousemove", rightSliderMoveBind);
      self.CHART_DATA.objChart.addEventListener("mousemove", rightSliderMoveBind);
    });

    sliderRightHandle.addEventListener("mouseup", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 0;
      sliderRightHandle.removeEventListener("mousemove", rightSliderMoveBind);
      self.CHART_DATA.objChart.removeEventListener("mousemove", rightSliderMoveBind);
      self.resetSliderPos("right", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowRightIndex].x);
      self.reDrawSeries();
    });

    sliderRightHandle.addEventListener("mouseleave", function (e) {
      e.stopPropagation();
      sliderRightHandle.removeEventListener("mousemove", rightSliderMoveBind);
    });

    sliderRightHandle.addEventListener("mouseenter", function (e) {
      e.stopPropagation();
      if (self.CHART_DATA.mouseDown === 1) {
        sliderLeftHandle.dispatchEvent(eventMouseUp);
        sliderLeftHandle.dispatchEvent(eventTouchEnd);
        sliderLeftHandle.dispatchEvent(eventTouchCancel);
        sliderRightHandle.dispatchEvent(eventMouseDown);
        sliderRightHandle.dispatchEvent(eventTouchStart);
      }
    });

    /*Events for touch devices*/

    sliderLeftHandle.addEventListener("touchstart", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 1;
      sliderLeftHandle.addEventListener("touchmove", leftSliderMoveBind);
      self.CHART_DATA.objChart.addEventListener("touchmove", leftSliderMoveBind);
    }, false);

    sliderLeftHandle.addEventListener("touchend", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 0;
      sliderLeftHandle.removeEventListener("touchmove", leftSliderMoveBind);
      self.CHART_DATA.objChart.removeEventListener("touchmove", leftSliderMoveBind);
      self.resetSliderPos("left", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowLeftIndex].x);
      self.reDrawSeries();
    }, false);

    sliderRightHandle.addEventListener("touchstart", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 1;
      sliderRightHandle.addEventListener("touchmove", rightSliderMoveBind);
      self.CHART_DATA.objChart.addEventListener("touchmove", rightSliderMoveBind);
    });

    sliderRightHandle.addEventListener("touchend", function (e) {
      e.stopPropagation();
      self.CHART_DATA.mouseDown = 0;
      sliderRightHandle.removeEventListener("touchmove", rightSliderMoveBind);
      self.CHART_DATA.objChart.removeEventListener("touchmove", rightSliderMoveBind);
      self.resetSliderPos("right", self.CHART_DATA.fullSeries[self.CHART_DATA.longestSeries][self.CHART_DATA.windowRightIndex].x);
      self.reDrawSeries();
    });


  } /*End bindSliderEvents()*/

  bindLeftSliderMove(e) {
    e.stopPropagation();
    e.preventDefault();
    let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.changedTouches ? e.changedTouches[0] : e);
    let sliderLsel = this.CHART_DATA.objChart.querySelector("#slideLSel").getBBox();
    let sliderRsel = this.CHART_DATA.objChart.querySelector("#slideRSel").getBBox();
    let sliderPosX = mousePointer.x < sliderRsel.x ? mousePointer.x : sliderRsel.x;
    if (e.type === "touchmove") {
      if (mousePointer.x > sliderRsel.x) {
        let eventMouseEnter = new Event("mouseenter");
        this.resetSliderPos("left", sliderPosX);
        this.resetSliderPos("right", mousePointer.x);
        this.reDrawSeries();
        this.CHART_DATA.objChart.querySelector("#sliderRightHandle").dispatchEvent(eventMouseEnter);
        return;
      }
    }

    if (mousePointer.x > (this.CHART_DATA.marginLeft) && mousePointer.x < ((this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginRight)) {
      for (let j = 0; j < this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length - 1; j++) {
        if (mousePointer.x >= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j].x && mousePointer.x <= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j + 1].x) {
          if (e.movementX <= 0) {
            this.CHART_DATA.windowLeftIndex = j;
          } else {
            this.CHART_DATA.windowLeftIndex = j + 1;
          }
        }
      }
      this.reDrawSeries();
      this.resetSliderPos("left", mousePointer.x);
    }
  } /*End bindLeftSliderMove()*/

  bindRightSliderMove(e) {
    e.stopPropagation();
    e.preventDefault();
    let mousePointer = this.ui.cursorPoint(this.CHART_OPTIONS.targetElem, e.changedTouches ? e.changedTouches[0] : e);
    let sliderLsel = this.CHART_DATA.objChart.querySelector("#slideLSel").getBBox();
    let sliderRsel = this.CHART_DATA.objChart.querySelector("#slideRSel").getBBox();
    let sliderPosX = mousePointer.x > sliderLsel.x + sliderLsel.width ? mousePointer.x : sliderLsel.x + sliderLsel.width;
    if (e.type === "touchmove") {
      if (sliderRsel.x < sliderLsel.x + sliderLsel.width) {
        let eventMouseEnter = new Event("mouseenter");
        this.resetSliderPos("right", sliderPosX);
        this.resetSliderPos("left", mousePointer.x);
        this.reDrawSeries();
        this.CHART_DATA.objChart.querySelector("#sliderLeftHandle").dispatchEvent(eventMouseEnter);
        return;
      }
    }

    if (mousePointer.x > (this.CHART_DATA.marginLeft + this.CHART_DATA.scaleX) && mousePointer.x < ((this.CHART_DATA.svgCenter.x * 2) - this.CHART_DATA.marginRight)) {
      for (let j = 1; j < this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length; j++) {
        if (mousePointer.x >= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j - 1].x && mousePointer.x <= this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][j].x) {
          if (e.movementX <= 0) {
            this.CHART_DATA.windowRightIndex = j - 1;
          } else {
            this.CHART_DATA.windowRightIndex = j;
          }
        }
      }
      if (mousePointer.x > this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length - 1].x) {
        this.CHART_DATA.windowRightIndex = this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries].length - 1;
      }
      this.reDrawSeries();
      this.resetSliderPos("right", mousePointer.x);
    }
  } /*End bindRightSliderMove()*/

  resetSliderPos(type, x) {
    let sliderSel = (type === "right") ? "slideRSel" : "slideLSel";
    let sliderLine = (type === "right") ? "sliderRight" : "sliderLeft";
    let innerBarType = (type === "right") ? "slideRSelInner" : "slideLSelInner";
    let selFrame = (type === "right") ? "sliderRSelFrame" : "sliderLSelFrame";
    let swipeFlag = (type === "right") ? 1 : 0;
    x = (x <= 0 ? this.CHART_DATA.marginLeft : x);

    let dr = [
      "M", x, ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hScrollBoxHeight + this.CHART_DATA.hLabelHeight),
      "L", x, ((this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + this.CHART_DATA.hLabelHeight)
    ];
    let innerBar = [
      "M", (type === "right" ? (x + 3) : (x - 3)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + (this.CHART_DATA.hScrollBoxHeight / 2) - 5),
      "L", (type === "right" ? (x + 3) : (x - 3)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + (this.CHART_DATA.hScrollBoxHeight / 2) + 5),
      "M", (type === "right" ? (x + 5) : (x - 5)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + (this.CHART_DATA.hScrollBoxHeight / 2) - 5),
      "L", (type === "right" ? (x + 5) : (x - 5)), (this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight + this.CHART_DATA.hLabelHeight + (this.CHART_DATA.hScrollBoxHeight / 2) + 5)
    ];

    let cy = (this.CHART_DATA.svgCenter.y * 2) - this.CHART_DATA.marginBottom + (this.CHART_DATA.hScrollBoxHeight / 2) + this.CHART_DATA.hLabelHeight;
    let sldrSel = this.CHART_DATA.objChart.querySelector("#" + sliderSel);
    let sldrLine = this.CHART_DATA.objChart.querySelector("#" + sliderLine);
    let inrBarType = this.CHART_DATA.objChart.querySelector("#" + innerBarType);
    let lSelFrame = this.CHART_DATA.objChart.querySelector("#" + selFrame);
    if (sldrSel) {
      sldrSel.setAttribute("d", this.geom.describeEllipticalArc(x, cy, 15, 15, 180, 360, swipeFlag).d);
    }
    if (sldrLine) {
      sldrLine.setAttribute("d", dr.join(" "));
    }
    if (inrBarType) {
      inrBarType.setAttribute("d", innerBar.join(" "));
    }
    if (lSelFrame) {
      let xPos = type === "right" ? x + lSelFrame.getAttribute("width") : x - lSelFrame.getAttribute("width");
      lSelFrame.setAttribute("x", xPos);
    }

    let fullSeries = this.CHART_DATA.objChart.querySelector("#scrollerCont #outerFrame");
    if (fullSeries) {
      if (type === "left") {
        let sliderOffset = this.CHART_DATA.objChart.querySelector("#sliderLeftOffset");
        sliderOffset.setAttribute("width", ((x - fullSeries.getBBox().x) < 0 ? 0 : (x - fullSeries.getBBox().x)));
      } else {
        let sliderOffset = this.CHART_DATA.objChart.querySelector("#sliderRightOffset");
        sliderOffset.setAttribute("width", ((fullSeries.getBBox().width + fullSeries.getBBox().x) - x));
        sliderOffset.setAttribute("x", x);
      }
    }


    /*If zoomOutBox is exist then show/hide that accordingly */
    let zoomOutBoxCont = this.CHART_DATA.objChart.querySelector("#zoomOutBoxCont");
    if (zoomOutBoxCont) {
      if (type === "left") {
        zoomOutBoxCont.style.display = this.CHART_DATA.windowLeftIndex > 0 ? "block" : "none";
      } else if (type === "right") {
        zoomOutBoxCont.style.display = (this.CHART_DATA.windowRightIndex < ((this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length * 2) - 1)) ? "block" : "none";
      }
    }

  } /*End resetSliderPos()*/


  reDrawSeries() {
    let dataSet = [];
    let scaleX = this.CHART_DATA.gridBoxWidth / this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex + 1).length;
    for (let i = 0; i < this.CHART_OPTIONS.dataSet.series.length; i++) {
      let set = {
        "data": this.CHART_OPTIONS.dataSet.series[i].data.slice(this.CHART_DATA.windowLeftIndex, this.CHART_DATA.windowRightIndex + 1)
      };
      dataSet.push(set);
    }

    this.prepareDataSet(dataSet);
    this.vLabel.createVerticalLabel(this,
      this.CHART_DATA.objChart,
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
      this.CHART_DATA.objChart,
      this.CHART_DATA.marginLeft,
      this.CHART_DATA.marginTop + this.CHART_DATA.gridBoxHeight,
      this.CHART_DATA.gridBoxWidth,
      this.CHART_DATA.hLabelHeight,
      this.CHART_OPTIONS.dataSet.xAxis.categories,
      scaleX
    );

    this.CHART_DATA.series = [];
    for (let i = 0; i < dataSet.length; i++) {
      this.createSeries(dataSet[i].data, i, scaleX);
      if (this.CHART_OPTIONS.dataSet.series.length > 1) {
        this.createLegands(i);
      }
    }

    this.resetTextPositions(this.CHART_OPTIONS.dataSet.xAxis.categories);
    this.bindEvents();
    this.onMouseLeave();
    this.render();
  } /*End reDrawSeries()*/


  onZoomOut(e) {
    e.stopPropagation();
    e.preventDefault();
    this.CHART_DATA.windowLeftIndex = 0;
    this.CHART_DATA.windowRightIndex = (this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length) - 1;
    this.resetSliderPos("left", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowLeftIndex].x);
    this.resetSliderPos("right", this.CHART_DATA.fullSeries[this.CHART_DATA.longestSeries][this.CHART_DATA.windowRightIndex].x);
    this.reDrawSeries();
    this.CHART_DATA.objChart.querySelector("#zoomOutBoxCont").style.display = "none";
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


} /*End of AreaChart()*/


module.exports = AreaChart;