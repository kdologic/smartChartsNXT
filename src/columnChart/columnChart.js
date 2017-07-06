/*
 * SVG Column Chart 
 * @Version:1.0.0
 * @CreatedOn:26-Aug-2016
 * @Author:SmartChartsNXT
 * @description: SVG Column Chart, that shows series of data as coulmns.
 * @JSFiddle:
 * @Sample caller code:
   SmartChartsNXT.ready(function(){
    var columnChart = new SmartChartsNXT.ColumnChart({
      "title":"Grouped Sales Report",
      "subTitle":"Report for the year, 2016",
      "targetElem":"chartContainer",
      "canvasBorder":false,
      "bgColor":"none",
      "overlapColumns":false,
      "animated":false,
      "toolTip":{
        "content":'<table>'+
          '<tr><td>on <b>{{point.label}}</b></tr>' +
          '<tr><td>{{point.series.name}} is</td></tr>' +
          '<tr><td><span style="font-size:20px;color:#4285f4;"><b>Rs. {{point.value}} </b></span></tr>'+
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
            "gradient":"none", // [oval|linear|none]
            "color":"#c62828",
            "name": "Sales",
            "data":  generateData(10,50,10)
          },
          {
            "gradient":"none", 
            "color":"#FF9800",
            "name": "Expense",
            "data":generateData(10,30,10)
          }
        ]
      }
    });
  });

*/

window.SmartChartsNXT.ColumnChart = function (opts) {
  var PAGE_OPTIONS = {};
  var self = this;
  var PAGE_DATA = {
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
  };

  var PAGE_CONST = {
    FIX_WIDTH: 800,
    FIX_HEIGHT: 500,
    MIN_WIDTH: 250,
    MIN_HEIGHT: 400,
    hGridCount: 9,
    runId: "columncart_" + Math.round(Math.random() * 1000000001)
  };


  function init() {
    try {
      PAGE_OPTIONS = $SC.util.extends(opts, PAGE_OPTIONS);
      var containerDiv = document.querySelector("#" + PAGE_OPTIONS.targetElem);
      PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = containerDiv.offsetWidth || PAGE_CONST.FIX_WIDTH;
      PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = containerDiv.offsetHeight || PAGE_CONST.FIX_HEIGHT;

      if (PAGE_OPTIONS.width < PAGE_CONST.MIN_WIDTH)
        PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = PAGE_CONST.MIN_WIDTH;
      if (PAGE_OPTIONS.height < PAGE_CONST.MIN_HEIGHT)
        PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = PAGE_CONST.MIN_HEIGHT;

      if (PAGE_OPTIONS.events && typeof PAGE_OPTIONS.events === "object") {
        for (var e in PAGE_OPTIONS.events) {
          self.off(e, PAGE_OPTIONS.events[e]);
          self.on(e, PAGE_OPTIONS.events[e]);
        }
      }

      console.log(PAGE_OPTIONS);
      PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH - PAGE_OPTIONS.width;
      PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT - PAGE_OPTIONS.height;

      //fire Event onInit
      var onInitEvent = new self.Event("onInit", {
        srcElement: self
      });
      self.dispatchEvent(onInitEvent);

      var strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
        "viewBox='0 0 " + PAGE_CONST.FIX_WIDTH + " " + PAGE_CONST.FIX_HEIGHT + "'" +
        "version='1.1'" +
        "width='" + PAGE_OPTIONS.width + "'" +
        "height='" + PAGE_OPTIONS.height + "'" +
        "id='columnChart'" +
        "style='background:" + (PAGE_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
        "> <\/svg>";

      document.getElementById(PAGE_OPTIONS.targetElem).setAttribute("runId", PAGE_CONST.runId);
      document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";
      document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend", strSVG);

      createColumnDropShadow();

      var svgWidth = parseInt(document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").getAttribute("width"));
      var svgHeight = parseInt(document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").getAttribute("height"));
      PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth / 2), (svgHeight / 2));
      PAGE_DATA.chartCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x, PAGE_DATA.svgCenter.y + 50);
      PAGE_DATA.marginLeft = ((-1) * PAGE_DATA.scaleX / 2) + 100, PAGE_DATA.marginRight = ((-1) * PAGE_DATA.scaleX / 2) + 10;
      PAGE_DATA.marginTop = ((-1) * PAGE_DATA.scaleY / 2) + 150;
      PAGE_DATA.marginBottom = ((-1) * PAGE_DATA.scaleY / 2) + 100;

      var longestSeries = 0,
        longSeriesLen = 0;
      for (var index = 0; index < PAGE_OPTIONS.dataSet.series.length; index++) {

        if (PAGE_OPTIONS.dataSet.series[index].data.length > longSeriesLen) {
          longestSeries = index;
          longSeriesLen = PAGE_OPTIONS.dataSet.series[index].data.length;
        }
      }

      PAGE_DATA.longestSeries = longestSeries;

      $SC.appendWaterMark(PAGE_OPTIONS.targetElem, PAGE_DATA.scaleX, PAGE_DATA.scaleY);
      $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem, PAGE_DATA.svgCenter, PAGE_DATA.scaleX, PAGE_DATA.scaleY, self);
      prepareChart();

    } catch (ex) {
      $SC.handleError(ex, "Error in ColumnChart");
    }

  } /*End init()*/

  function prepareChart() {
    prepareDataSet();

    var strSVG = "";
    if (PAGE_OPTIONS.canvasBorder) {
      strSVG += "<g>";
      strSVG += "  <rect x='" + ((-1) * PAGE_DATA.scaleX / 2) + "' y='" + ((-1) * PAGE_DATA.scaleY / 2) + "' width='" + ((PAGE_DATA.svgCenter.x * 2) + PAGE_DATA.scaleX) + "' height='" + ((PAGE_DATA.svgCenter.y * 2) + PAGE_DATA.scaleY) + "' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / PAGE_CONST.FIX_WIDTH * PAGE_OPTIONS.width) + "' y='" + (50 / PAGE_CONST.FIX_HEIGHT * PAGE_OPTIONS.height) + "' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";


    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;


    createGrid();
    var scaleX = PAGE_DATA.gridBoxWidth / PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    for (var index = 0; index < PAGE_OPTIONS.dataSet.series.length; index++) {
      createColumns(PAGE_OPTIONS.dataSet.series[index].data, index, scaleX);
      if (PAGE_OPTIONS.dataSet.series.length > 1)
        createLegands(index);
    }


    var catList = [],
      scaleX = PAGE_DATA.gridBoxWidth / PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    for (var i = 0; i < PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length; i++)
      catList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i % PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    createHorizontalLabel(catList, scaleX);

    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='" + (PAGE_DATA.marginLeft + (PAGE_DATA.gridBoxWidth / 2) - 30) + "' y='" + (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 70) + "' font-size='15' >" + PAGE_OPTIONS.dataSet.xAxis.title + "<\/text>";
    strSVG += "<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='" + (PAGE_DATA.marginLeft - 30) + "' y='" + (PAGE_DATA.marginTop + (PAGE_DATA.gridBoxHeight / 2) - 5) + "' font-size='15' >" + PAGE_OPTIONS.dataSet.yAxis.title + "<\/text>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);

    resetTextPositions();

    bindEvents();

    //fire event afterRender
    var aftrRenderEvent = new self.Event("afterRender", {
      srcElement: self
    });
    self.dispatchEvent(aftrRenderEvent);

  } /*End prepareChart()*/


  function prepareDataSet(dataSet) {
    var maxSet = [],
      minSet = [],
      categories = [];
    dataSet = dataSet || PAGE_OPTIONS.dataSet.series;

    for (var i = 0; i < dataSet.length; i++) {
      var arrData = [];
      for (var j = 0; j < dataSet[i].data.length; j++) {
        arrData.push(dataSet[i].data[j].value);
        if (categories.indexOf(dataSet[i].data[j].label) < 0)
          categories.push(dataSet[i].data[j].label);
      }
      var maxVal = Math.max.apply(null, arrData);
      var minVal = Math.min.apply(null, arrData);
      maxSet.push(maxVal);
      minSet.push(minVal);
    }
    PAGE_OPTIONS.dataSet.xAxis.categories = categories;
    PAGE_DATA.maxima = Math.max.apply(null, maxSet);
    PAGE_DATA.minima = Math.min.apply(null, minSet);
    PAGE_DATA.maxima = round(PAGE_DATA.maxima);

    //fire Event afterParseData
    var afterParseDataEvent = new self.Event("afterParseData", {
      srcElement: self
    });
    self.dispatchEvent(afterParseDataEvent);

  } /*End prepareDataSet()*/

  function createColumns(dataSet, index, scaleX) {
    var d = [];
    var interval = PAGE_DATA.gridBoxWidth / PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    var eachInterval = (interval - (interval / 5)) / PAGE_OPTIONS.dataSet.series.length;
    var colHalfWidth = (eachInterval - 4) / 2;
    if (PAGE_OPTIONS.overlapColumns)
      colHalfWidth = (interval - (interval / 5) - (index * 8)) / 2;

    colHalfWidth = colHalfWidth < 2 ? 2 : colHalfWidth;
    colHalfWidth = colHalfWidth > 15 ? 15 : colHalfWidth;
    var scaleY = PAGE_DATA.gridBoxHeight / (PAGE_DATA.maxima);
    var arrPointsSet = [],
      strSeries = "";
    var strSeries = "<g id='column_set_" + index + "' class='columns'>";

    for (var dataCount = 0; dataCount < dataSet.length; dataCount++) {
      if (PAGE_OPTIONS.overlapColumns)
        var colCenter = new $SC.geom.Point(PAGE_DATA.marginLeft + (dataCount * interval) + (interval / 2), ((PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));
      else
        var colCenter = new $SC.geom.Point(PAGE_DATA.marginLeft + (dataCount * interval) + (interval / 10) + (eachInterval * index) + (eachInterval / 2), ((PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight) - (dataSet[dataCount].value * scaleY)));

      if (dataSet.length > 50)
        $SC.geom.createDot(colCenter, "red", "2", null, null, "columnChart");

      var cornerRadius = 2;
      d = [
        "M", colCenter.x - colHalfWidth + (cornerRadius), colCenter.y,
        "L", colCenter.x + colHalfWidth - (cornerRadius), colCenter.y,
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, cornerRadius,
        "L", colCenter.x + colHalfWidth, (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight),
        "L", colCenter.x - colHalfWidth, (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight),
        "L", colCenter.x - colHalfWidth, colCenter.y + (cornerRadius),
        "a", cornerRadius, cornerRadius, " 0 0 1 ", cornerRadius, -cornerRadius,
        "Z"
      ];
      arrPointsSet.push(colCenter);

      if (PAGE_OPTIONS.dataSet.series.length > 1)
        var color = PAGE_OPTIONS.dataSet.series[index].color || $SC.util.getColor(index);
      else
        var color = PAGE_OPTIONS.dataSet.series[index].data[dataCount].color || PAGE_OPTIONS.dataSet.series[index].color || $SC.util.getColor(index);

      var fill = color,
        filter = "";
      switch (PAGE_OPTIONS.dataSet.series[index].gradient) {
        case "oval":
          appendGradFillOval(index, dataCount);
          fill = "url(#" + PAGE_OPTIONS.targetElem + "-columnchart-gradOval" + index + "_" + dataCount + ")";
          filter = "url(#" + PAGE_OPTIONS.targetElem + "-columnchart-dropshadow)";
          break;
        case "linear":
          appendGradFillLinear(index, dataCount);
          fill = "url(#" + PAGE_OPTIONS.targetElem + "-columnchart-gradLinear" + index + "_" + dataCount + ")";
          filter = "url(#" + PAGE_OPTIONS.targetElem + "-columnchart-dropshadow)";
          break;
        default:
        case "none":
          break;
      }

      strSeries += "<path id='column_" + index + "_" + dataCount + "' filter='" + filter + "'  stroke='" + color + "'  fill='" + fill + "' d='" + d.join(" ") + "' stroke-width='1' opacity='1'></path>";
      PAGE_DATA.columns["column_" + index + "_" + dataCount] = {
        topMid: colCenter,
        path: d,
        colHalfWidth: colHalfWidth,
        label: PAGE_OPTIONS.dataSet.xAxis.categories[dataCount % PAGE_OPTIONS.dataSet.xAxis.categories.length],
        value: (PAGE_OPTIONS.dataSet.yAxis.prefix ? PAGE_OPTIONS.dataSet.yAxis.prefix + " " : "") + dataSet[dataCount].value
      };
    }
    strSeries += "</g>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSeries);

  } /*End createColumns()*/


  function createLegands(index) {
    var color = PAGE_OPTIONS.dataSet.series[index].color || $SC.util.getColor(index);
    /*Creating series legend*/
    var strSVG = "";
    strSVG = "<g id='series_legend_" + index + "' style='cursor:pointer;'>";
    strSVG += "<rect id='legend_color_" + index + "' x='" + PAGE_DATA.marginLeft + "' y='" + (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 60) + "' width='10' height='10' fill='" + color + "' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG += "<text id='legend_txt_" + index + "' font-size='12' x='" + (PAGE_DATA.marginLeft + 20) + "' y='" + (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 70) + "' fill='#717171' font-family='Verdana' >" + PAGE_OPTIONS.dataSet.series[index].name + "</text>";
    strSVG += "</g>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #legendContainer").insertAdjacentHTML("beforeend", strSVG);
  }

  function createGrid() {
    PAGE_DATA.gridBoxWidth = (PAGE_DATA.svgCenter.x * 2) - PAGE_DATA.marginLeft - PAGE_DATA.marginRight;
    PAGE_DATA.gridBoxHeight = (PAGE_DATA.svgCenter.y * 2) - PAGE_DATA.marginTop - PAGE_DATA.marginBottom;
    PAGE_DATA.gridHeight = (((PAGE_DATA.svgCenter.y * 2) - PAGE_DATA.marginTop - PAGE_DATA.marginBottom) / (PAGE_CONST.hGridCount - 1));
    var hGrid = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #hGrid");
    if (hGrid) hGrid.parentNode.removeChild(hGrid);

    var strGrid = "";
    strGrid += "<g id='hGrid' >";
    for (var gridCount = 0; gridCount < PAGE_CONST.hGridCount; gridCount++) {
      var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop + (gridCount * PAGE_DATA.gridHeight), "L", PAGE_DATA.marginLeft + PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop + (gridCount * PAGE_DATA.gridHeight)];
      strGrid += "<path fill='none' d='" + d.join(" ") + "' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
    }
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop, "L", PAGE_DATA.marginLeft, PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 10];
    strGrid += "<path id='gridBoxLeftBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strGrid += "<path id='hLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid += "<path id='vLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid += "</g>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strGrid);
    createVerticalLabel();
  } /*End createGrid()*/

  function createVerticalLabel() {
    var vTextLabel = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #vTextLabel");
    if (vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);

    var interval = (PAGE_DATA.maxima) / (PAGE_CONST.hGridCount - 1);
    var strText = "<g id='vTextLabel'>";
    for (var gridCount = PAGE_CONST.hGridCount - 1, i = 0; gridCount >= 0; gridCount--) {
      var value = (i++ * interval);
      value = (value >= 1000 ? (value / 1000).toFixed(2) + "K" : value.toFixed(2));
      strText += "<text font-family='Lato' fill='black'><tspan x='" + (PAGE_DATA.marginLeft - 55) + "' y='" + (PAGE_DATA.marginTop + (gridCount * PAGE_DATA.gridHeight) + 5) + "' font-size='12' >" + ((PAGE_OPTIONS.dataSet.yAxis.prefix) ? PAGE_OPTIONS.dataSet.yAxis.prefix : "") + value + "<\/tspan></text>";
      var d = ["M", PAGE_DATA.marginLeft, (PAGE_DATA.marginTop + (gridCount * PAGE_DATA.gridHeight)), "L", (PAGE_DATA.marginLeft - 5), (PAGE_DATA.marginTop + (gridCount * PAGE_DATA.gridHeight))];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strText += "</g>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strText);

    var overFlow = 0;
    var vTextLabel = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #vTextLabel tspan");
    for (var i = 0; i < vTextLabel.length; i++) {
      if ((PAGE_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50) < 0)
        overFlow = Math.abs((PAGE_DATA.marginLeft - vTextLabel[i].getComputedTextLength() - 50));
    }
    if (overFlow !== 0) {
      PAGE_DATA.marginLeft = PAGE_DATA.marginLeft + overFlow;
      createGrid();
    }
  } /*End createVerticalLabel()*/

  function createHorizontalLabel(categories, scaleX) {
    var hTextLabel = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #hTextLabel");
    if (hTextLabel) hTextLabel.parentNode.removeChild(hTextLabel);

    var interval = scaleX || (PAGE_DATA.gridBoxWidth / (categories.length));

    /*if there is too much categories then discurd some categories*/
    if (interval < 30) {
      var newCategories = [],
        skipLen = Math.ceil(30 / interval);
      for (var i = 0; i < categories.length; i += skipLen) {
        newCategories.push(categories[i]);
      }
      categories = newCategories;
      interval *= skipLen;
    }
    var strText = "<g id='hTextLabel'>";
    for (var hText = 0; hText < categories.length; hText++) {
      strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + (PAGE_DATA.marginLeft + (hText * interval) + (interval / 2)) + "' y='" + (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 20) + "' ><tspan  font-size='12' >" + categories[hText] + "<\/tspan></text>";
    }

    for (var hText = 0; hText < categories.length; hText++) {
      var d = ["M", (PAGE_DATA.marginLeft + (hText * interval) + (interval)), (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight), "L", (PAGE_DATA.marginLeft + (hText * interval) + (interval)), (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 10)];
      strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight, "L", PAGE_DATA.marginLeft + PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight];
    strText += "<path id='gridBoxBottomBorder' d='" + d.join(" ") + "' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strText += "</g>";

    /*bind hover event*/
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strText);
    var hTextLabels = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #hTextLabel text");
    var totalHTextWidth = 0;
    for (var i = 0; i < hTextLabels.length; i++) {
      var txWidth = hTextLabels[i].getComputedTextLength();
      totalHTextWidth += (txWidth);
    }

    for (var i = 0; i < hTextLabels.length; i++) {
      var txtWidth = hTextLabels[i].querySelector("tspan").getComputedTextLength();
      if (parseFloat(totalHTextWidth + (hTextLabels.length * 5)) < parseFloat(PAGE_DATA.gridBoxWidth)) {
        while (txtWidth + 5 > interval) {
          hTextLabels[i].querySelector("tspan").textContent = hTextLabels[i].querySelector("tspan").textContent.substring(0, (hTextLabels[i].querySelector("tspan").textContent.length - 4)) + "...";
          txtWidth = (hTextLabels[i].querySelector("tspan").getComputedTextLength());
        }
      }

      hTextLabels[i].addEventListener("mouseenter", function (e) {
        e.stopPropagation();
        var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e);
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem, mousePointer, "#555", e.target.getAttribute("title"));
      }, false);

      hTextLabels[i].addEventListener("mouseleave", function (e) {
        e.stopPropagation();
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem, "hide");
      }, false);

    }

  } /*End createHorizontalLabel()*/


  function resetTextPositions() {
    var txtTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getComputedTextLength();
    var txtSubTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    var txtTitleGrp = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp");


    if (txtTitleLen > PAGE_CONST.FIX_WIDTH) {
      var fontSize = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getAttribute("font-size");
      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").setAttribute("font-size", fontSize - 5);
      txtTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getAttribute("font-size");
      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").setAttribute("font-size", fontSize - 3);
      txtSubTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x", (PAGE_DATA.svgCenter.x - (txtTitleLen / 2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (PAGE_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 90);

    /*Reset vertical text label*/
    var arrVLabels = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #vTextLabel");
    var vLabelwidth = arrVLabels[0].getBBox().width;
    var arrVText = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #vTextLabel tspan");
    for (var i = 0; i < arrVText.length; i++)
      arrVText[i].setAttribute("x", (PAGE_DATA.marginLeft - vLabelwidth - 10));

    /*Reset horzontal text label*/
    var totalHTextWidth = 0;
    var arrHText = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #hTextLabel text");
    for (var i = 0; i < arrHText.length; i++) {
      var txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth += (txWidth);
    }
    var interval = 70;
    if (parseFloat(totalHTextWidth + (arrHText.length * 10)) > parseFloat(PAGE_DATA.gridBoxWidth)) {
      for (var i = 0; i < arrHText.length; i++) {
        var cx = arrHText[i].getAttribute("x");
        var cy = arrHText[i].getAttribute("y");

        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("transform", "translate(0," + (10) + ")rotate(-45," + (cx) + "," + (cy) + ")");

        if (txWidth + 15 > interval) {
          var fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
          arrHText[i].querySelector("tspan").setAttribute("font-size", (fontSize - 2));
          txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        }
        while (txWidth + 15 > interval) {
          arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0, (arrHText[i].querySelector("tspan").textContent.length - 4)) + "...";
          txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
        }
      }
    }

    var vTxtSubTitle = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #vTextSubTitle");
    var vTxtLen = vTxtSubTitle.getComputedTextLength();
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0," + (PAGE_DATA.marginLeft - vLabelwidth - 20) + "," + (PAGE_DATA.svgCenter.y + vTxtLen) + ")");
    vTxtSubTitle.setAttribute("x", 0);
    vTxtSubTitle.setAttribute("y", 0);

    /*Set position for legend text*/
    var arrLegendText = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #legendContainer text");
    var arrLegendColor = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #columnChart #legendContainer rect");

    var width = 0,
      row = 0;
    for (var i = 0; i < arrLegendText.length; i++) {
      arrLegendColor[i].setAttribute("x", (width + PAGE_DATA.marginLeft - 60));
      arrLegendText[i].setAttribute("x", (width + PAGE_DATA.marginLeft + 20 - 60));
      arrLegendColor[i].setAttribute("y", (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 80 + (row * 20)));
      arrLegendText[i].setAttribute("y", (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 90 + (row * 20)));
      width += (arrLegendText[i].getBBox().width + 50);

      if (width > PAGE_CONST.FIX_WIDTH) {
        width = 0;
        row++;
        arrLegendColor[i].setAttribute("x", (width + PAGE_DATA.marginLeft - 60));
        arrLegendText[i].setAttribute("x", (width + PAGE_DATA.marginLeft + 20 - 60));
        arrLegendColor[i].setAttribute("y", (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 80 + (row * 20)));
        arrLegendText[i].setAttribute("y", (PAGE_DATA.marginTop + PAGE_DATA.gridBoxHeight + 90 + (row * 20)));
        width += (arrLegendText[i].getBBox().width + 50);
      }

    }

  } /*End resetTextPositions()*/

  function appendGradFillOval(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    var color, gradId = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #ovalGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) return;
    if (PAGE_OPTIONS.dataSet.series.length > 1) {
      color = PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
    } else {
      color = PAGE_OPTIONS.dataSet.series[seriesIndex].data[dataIndex].color || PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
    }

    var strSVG = "";
    strSVG += "<defs id='ovalGradDef_" + seriesIndex + "_" + dataIndex + "'>";
    strSVG += "<linearGradient  id='" + PAGE_OPTIONS.targetElem + "-columnchart-gradOval" + seriesIndex + "_" + dataIndex + "' x1='0%' y1='0%' x2='100%' y2='0%'>  ";
    strSVG += "<stop offset='0%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "<stop offset='5%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='15%' style='stop-color:" + color + ";stop-opacity:0.5;'></stop> ";
    strSVG += "<stop offset='50%' style='stop-color:" + color + ";stop-opacity:0.1;'></stop>  ";
    strSVG += "<stop offset='85%' style='stop-color:" + color + ";stop-opacity:0.5;'></stop> ";
    strSVG += "<stop offset='95%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='100%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "</<linearGradient> ";
    strSVG += "</defs>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillOval()*/

  function appendGradFillLinear(seriesIndex, dataIndex) {
    /*Creating gradient fill for area*/
    var color, gradId = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #linearGradDef_" + seriesIndex + "_" + dataIndex);
    if (gradId) return;
    if (PAGE_OPTIONS.dataSet.series.length > 1) {
      color = PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
    } else {
      color = PAGE_OPTIONS.dataSet.series[seriesIndex].data[dataIndex].color || PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
    }

    var strSVG = "";
    strSVG += "<defs id='linearGradDef_" + seriesIndex + "_" + dataIndex + "'>";
    strSVG += "<linearGradient  id='" + PAGE_OPTIONS.targetElem + "-columnchart-gradLinear" + seriesIndex + "_" + dataIndex + "' x1='0%' y1='0%' x2='0%' y2='100%'>  ";
    strSVG += "<stop offset='0%' style='stop-color:#fff;'></stop>  ";
    strSVG += "<stop offset='100%' style='stop-color:" + color + ";'></stop> ";
    strSVG += "</<linearGradient> ";
    strSVG += "</defs>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart").insertAdjacentHTML("beforeend", strSVG);
  } /*End appendGradFillLinear()*/


  function showAnimatedView() {
    var scaleY = 0.0;

    var timeoutId = setInterval(function () {
      for (var col in PAGE_DATA.columns) {
        var column = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #" + col);
        scaleYElem(column, 1, scaleY);
      }
      scaleY += 0.1;
      if (scaleY >= 1)
        clearInterval(timeoutId);
    }, 50);
  } /*End showAnimatedView()*/

  function scaleYElem(elementNode, scaleX, scaleY) {
    var bbox = elementNode.getBBox();
    var cx = bbox.x + (bbox.width / 2),
      cy = bbox.y + (bbox.height); // finding center of element
    var saclestr = scaleX + ',' + scaleY;
    var tx = -cx * (scaleX - 1);
    var ty = -cy * (scaleY - 1);
    var translatestr = parseFloat(tx).toFixed(3) + ',' + parseFloat(ty).toFixed(3);

    elementNode.setAttribute('transform', 'translate(' + translatestr + ') scale(' + saclestr + ')');
  } /*End scaleYElem()*/

  function bindEvents() {
    for (var sindex = 0; sindex < PAGE_OPTIONS.dataSet.series.length; sindex++) {
      for (var dindex = 0; dindex < PAGE_OPTIONS.dataSet.series[sindex].data.length; dindex++) {
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("mouseenter", onMouseOver);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("mouseenter", onMouseOver, false);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("click", onMouseOver);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("click", onMouseOver, false);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).removeEventListener("mouseleave", onMouseLeave);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #column_" + sindex + "_" + dindex).addEventListener("mouseleave", onMouseLeave, false);
      }

      var legend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #series_legend_" + sindex);
      if (legend) {
        legend.removeEventListener("click", onLegendClick);
        legend.addEventListener("click", onLegendClick, false);
      }
    }

    window.removeEventListener('resize', onWindowResize);
    window.addEventListener('resize', onWindowResize, true);
  } /*End bindEvents()*/


  var timeOut = null;
  var onWindowResize = function () {
    var containerDiv = document.querySelector("#" + PAGE_OPTIONS.targetElem);
    if (PAGE_CONST.runId != containerDiv.getAttribute("runId")) {
      window.removeEventListener('resize', onWindowResize);
      if (timeOut != null) {
        clearTimeout(timeOut);
      }
      return;
    }
    if (containerDiv.offsetWidth !== PAGE_CONST.FIX_WIDTH || containerDiv.offsetHeight !== PAGE_CONST.FIX_HEIGHT) {
      if (timeOut != null) {
        clearTimeout(timeOut);
      }
      callChart();

      function callChart() {
        if (containerDiv) {
          if (containerDiv.offsetWidth === 0 && containerDiv.offsetHeight === 0) {
            timeOut = setTimeout(function () {
              callChart();
            }, 100);
          } else {
            timeOut = setTimeout(function () {
              init();
            }, 500);
          }
        }
      }
    }
  }; /*End onWindowResize()*/

  function onMouseOver(e) {
    try {
      var columnId = e.target.id;
      var column = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #" + columnId);
      column.setAttribute("opacity", 0.5);
      var toolTipPoint = new $SC.geom.Point(PAGE_DATA.columns[columnId].topMid.x, PAGE_DATA.columns[columnId].topMid.y + 18);
      var seriesIndex = columnId.split("_")[1];
      var index = columnId.split("_")[2];
      var color = PAGE_OPTIONS.dataSet.series[seriesIndex].data[index].color || PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
      var toolTipRow1 = PAGE_DATA.columns[columnId].label,
        toolTipRow2 = PAGE_DATA.columns[columnId].value;

      /*point should be available globally*/
      var point = PAGE_OPTIONS.dataSet.series[seriesIndex].data[index];
      point["series"] = {
        name: PAGE_OPTIONS.dataSet.series[seriesIndex].name
      };

      if (PAGE_OPTIONS.toolTip && PAGE_OPTIONS.toolTip.content) {
        var toolTipContent = PAGE_OPTIONS.toolTip.content.replace(/{{/g, "${").replace(/}}/g, "}");
        var genContent = $SC.util.assemble(toolTipContent, "point");
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem, toolTipPoint, color, genContent(point), "html");
      } else
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem, toolTipPoint, color, toolTipRow1, toolTipRow2);

    } catch (ex) {
      console.log(ex);
    }
  }

  function onMouseLeave(e) {
    var columnId = e.target.id;
    var column = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #columnChart #" + columnId);
    column.setAttribute("opacity", 1);
    $SC.ui.toolTip(PAGE_OPTIONS.targetElem, "hide");
  }

  function onLegendClick(e) {
    var columnId = e.target.id;
    var seriesIndex = columnId.split("_")[2];
    var legendColor = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #legend_color_" + seriesIndex);
    var columnSet = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #column_set_" + seriesIndex);
    var color = PAGE_OPTIONS.dataSet.series[seriesIndex].color || $SC.util.getColor(seriesIndex);
    if (legendColor.getAttribute("fill") === "#eee") {
      legendColor.setAttribute("fill", color);
      columnSet.style.display = "block";
    } else {
      legendColor.setAttribute("fill", "#eee");
      columnSet.style.display = "none";
    }
  } /*End onLegendClick()*/


  function createColumnDropShadow() {
    var strSVG = "";
    strSVG = "<filter id='" + PAGE_OPTIONS.targetElem + "-columnchart-dropshadow' height='130%'>";
    strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>";
    strSVG += "  <feOffset dx='2' dy='0' result='offsetblur'/>";
    strSVG += "  <feMerge>";
    strSVG += "    <feMergeNode/>";
    strSVG += "    <feMergeNode in='SourceGraphic'/>";
    strSVG += "  </feMerge>";
    strSVG += "</filter>";
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

  } /*End appendDropShadow()*/

  function round(val) {
    val = Math.round(val);
    var digitCount = val.toString().length;
    var nextVal = Math.pow(10, digitCount - 1);
    var roundVal = Math.ceil(val / nextVal) * nextVal;
    if (val < roundVal / 2)
      return roundVal / 2;
    else
      return roundVal;
  } /*End round()*/

  init();
  if (PAGE_OPTIONS.animated !== false) showAnimatedView();
}; /*End of drawPieChart3D()*/