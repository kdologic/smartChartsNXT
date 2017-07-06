/*
 * SVG Donut Chart
 * @Version:1.0.0
 * @CreatedOn:20-Sep-2016
 * @LastUpdated:12-Oct-2016
 * @Author:SmartChartsNXT
 * @description:This will generate a 2d Donut chart. Using SVG 1.1 elements and HTML 5 standard. 
 * @JSFiddle:
 * @Sample caller code:
 * var settings = {
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
    var donutChart = new SmartChartsNXT.DonutChart(settings);
  });
 */


window.SmartChartsNXT.DonutChart = function (opts) {
  var PAGE_OPTIONS = {};
  var self = this;
  var PAGE_DATA = {
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
    donutSet: [],
    dragStartAngle: 0,
    dragEndPoint: null,
    mouseDown: 0,
    mouseDrag: 0,
    donutWithTextSpan: 0,
    maxTextLen: 0
  };

  var PAGE_CONST = {
    FIX_WIDTH: 800,
    FIX_HEIGHT: 600,
    MIN_WIDTH: 300,
    MIN_HEIGHT: 400,
    runId: "donutchart_" + Math.round(Math.random() * 1000000001)
  };

  function init() {
    PAGE_OPTIONS = $SC.util.extends(opts, PAGE_OPTIONS);
    var containerDiv = document.querySelector("#" + PAGE_OPTIONS.targetElem);
    PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = containerDiv.offsetWidth || PAGE_CONST.FIX_WIDTH;
    PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = containerDiv.offsetHeight || PAGE_CONST.FIX_HEIGHT;

    if (PAGE_OPTIONS.width < PAGE_CONST.MIN_WIDTH)
      PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = PAGE_CONST.MIN_WIDTH;
    if (PAGE_OPTIONS.height < PAGE_CONST.MIN_HEIGHT)
      PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = PAGE_CONST.MIN_HEIGHT;

    if (PAGE_OPTIONS.showLegend) {
      PAGE_CONST.MIN_WIDTH = 300;
    }

    if (PAGE_OPTIONS.events && typeof PAGE_OPTIONS.events === "object") {
      for (var e in PAGE_OPTIONS.events) {
        self.off(e, PAGE_OPTIONS.events[e]);
        self.on(e, PAGE_OPTIONS.events[e]);
      }
    }

    PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH - PAGE_OPTIONS.width;
    PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT - PAGE_OPTIONS.height;

    if (PAGE_OPTIONS.showLegend) {
      if (PAGE_OPTIONS.width <= 480) {
        PAGE_DATA.donutWidth = PAGE_DATA.donutHeight = Math.min((PAGE_OPTIONS.width * 7 / 10) / 2, (PAGE_OPTIONS.height - 200)) * 20 / 100;
        PAGE_DATA.innerWidth = PAGE_DATA.innerHeight = Math.min((PAGE_OPTIONS.width * 7 / 10) / 2, (PAGE_OPTIONS.height - 200)) * 10 / 100;
      } else {
        PAGE_DATA.donutWidth = PAGE_DATA.donutHeight = Math.min((PAGE_OPTIONS.width * 7 / 10) / 2, (PAGE_OPTIONS.height - 200)) * 40 / 100;
        PAGE_DATA.innerWidth = PAGE_DATA.innerHeight = Math.min((PAGE_OPTIONS.width * 7 / 10) / 2, (PAGE_OPTIONS.height - 200)) * 20 / 100;
      }
    } else {
      PAGE_DATA.donutWidth = PAGE_DATA.donutHeight = Math.min(PAGE_OPTIONS.width, PAGE_OPTIONS.height) * 20 / 100;
      PAGE_DATA.innerWidth = PAGE_DATA.innerHeight = Math.min(PAGE_OPTIONS.width, PAGE_OPTIONS.height) * 10 / 100;
    }

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
      "id='donutChart'" +
      "style='background:" + (PAGE_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
      "> <\/svg>";

    document.getElementById(PAGE_OPTIONS.targetElem).setAttribute("runId", PAGE_CONST.runId);
    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";
    document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend", strSVG);

    var svgWidth = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").getAttribute("width");
    var svgHeight = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").getAttribute("height");
    PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth / 2), (svgHeight / 2));

    if (PAGE_OPTIONS.showLegend)
      PAGE_DATA.donutCenter = new $SC.geom.Point((svgWidth * 7 / 10) / 2, PAGE_DATA.svgCenter.y + 50);
    else
      PAGE_DATA.donutCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x, PAGE_DATA.svgCenter.y + 50);


    console.log(PAGE_DATA);
    initDataSet();
    prepareChart();

    $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem, PAGE_DATA.svgCenter, PAGE_DATA.scaleX, PAGE_DATA.scaleY, self);
    $SC.appendWaterMark(PAGE_OPTIONS.targetElem, PAGE_DATA.scaleX, PAGE_DATA.scaleY);
  } /*End init()*/

  function initDataSet() {
    PAGE_DATA.donutSet = [];
    PAGE_DATA.uniqueDataSet = [];
    PAGE_DATA.totalValue = 0;
  } /*End initDataSet()*/

  function prepareChart() {
    var startAngle, endAngle = 0;
    prepareDataSet();
    var strSVG = "";
    if (PAGE_OPTIONS.canvasBorder) {
      strSVG += "<g>";
      strSVG += "  <rect x='" + ((-1) * PAGE_DATA.scaleX / 2) + "' y='" + ((-1) * PAGE_DATA.scaleY / 2) + "' width='" + ((PAGE_DATA.svgCenter.x * 2) + PAGE_DATA.scaleX) + "' height='" + ((PAGE_DATA.svgCenter.y * 2) + PAGE_DATA.scaleY) + "' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / PAGE_CONST.FIX_WIDTH * PAGE_OPTIONS.width) + "' y='" + (50 / PAGE_CONST.FIX_HEIGHT * PAGE_OPTIONS.height) + "' font-size='25'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    for (var i = 0; i < PAGE_DATA.uniqueDataSet.length; i++) {
      startAngle = endAngle;
      endAngle += (PAGE_DATA.uniqueDataSet[i].percent * 36 / 10);
      var color = (PAGE_OPTIONS.dataSet[i].color ? PAGE_OPTIONS.dataSet[i].color : $SC.util.getColor(i));
      createDonut(startAngle, endAngle, color, i);
    }

    resetTextPos();
    if (PAGE_OPTIONS.showLegend) createLegands();
    bindEvents();
    slicedOutOnSettings();

    //fire event afterRender
    var aftrRenderEvent = new self.Event("afterRender", {
      srcElement: self
    });
    self.dispatchEvent(aftrRenderEvent);

  } /*End prepareChart()*/



  function createDonut(startAngle, endAngle, color, index) {
    var percent = parseFloat((endAngle - startAngle) * 100 / 360).toFixed(2);
    var strSVG = "";
    strSVG += "  <rect class='donut" + index + "' id='colorLegend" + index + "' width='300' height='100' fill='" + color + "' style='opacity:1;' />";
    strSVG += "  <text class='donut" + index + "' id='txtDonutGrpDonut" + index + "' fill='#717171' font-family='Lato' >";
    strSVG += "  <tspan class='donut" + index + "' id='txtDonut" + index + "' x='100' y='50' font-size='16'><\/tspan></text>";
    strSVG += "  <path class='donut" + index + "' id='donutHover" + index + "' fill-opacity='0.4' fill='" + color + "' stroke='none' stroke-width='0' style='cursor:pointer;' \/> ";
    strSVG += "  <path class='donut" + index + "'  id='upperArcDonut" + index + "'  fill='" + color + "' stroke='#eee' stroke-width='" + (PAGE_OPTIONS.outline || 1) + "' style='cursor:pointer;' \/>";
    strSVG += "  <path class='donut" + index + "' id='pathToLegend" + index + "'  fill='none' stroke='#555' stroke-width='1' \/>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").insertAdjacentHTML("beforeend", strSVG);

    var upperArcPath = describeDonutArc(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, PAGE_DATA.donutWidth, PAGE_DATA.donutHeight, PAGE_DATA.innerWidth, PAGE_DATA.innerHeight, startAngle, endAngle, 0);
    var upperArcDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #upperArcDonut" + index);
    upperArcDonut.setAttribute("d", upperArcPath.d);
    var textLabel = PAGE_DATA.uniqueDataSet[index]["label"];
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + index).textContent = (textLabel + " [" + percent + "%]");

    var midAngle = (startAngle + endAngle) / 2;
    var donut = {
      "id": "donut" + index,
      "upperArcPath": upperArcPath,
      "midAngle": midAngle,
      "slicedOut": PAGE_DATA.uniqueDataSet[index].slicedOut,
      "percent": percent
    };
    PAGE_DATA.donutSet.push(donut);
  } /*End createDonut()*/

  function describeDonutArc(cx, cy, rMaxX, rMaxY, rMinX, rMinY, startAngle, endAngle, sweepFlag) {
    var fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }

    var outerArcStart = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rMaxX, rMaxY, endAngle), endAngle);
    var outerArcEnd = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rMaxX, rMaxY, startAngle), startAngle);
    var innerArcStart = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rMinX, rMinY, endAngle), endAngle);
    var innerArcEnd = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rMinX, rMinY, startAngle), startAngle);
    var largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    var d = [
      "M", outerArcStart.x, outerArcStart.y,
      "A", rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y,
      "L", innerArcEnd.x, innerArcEnd.y,
      "A", rMinX, rMinY, 0, largeArcFlag, Math.abs(sweepFlag - 1), innerArcStart.x, innerArcStart.y,
      "Z"
    ];

    if (fullArc)
      d.push("L", outerArcStart.x, outerArcStart.y);
    var path = {
      "d": d.join(" "),
      "outerArc": [rMaxX, rMaxY, 0, largeArcFlag, sweepFlag, outerArcEnd.x, outerArcEnd.y].join(" "),
      "outerArcStart": outerArcStart,
      "outerArcEnd": outerArcEnd,
      "innerArc": [rMinX, rMinY, 0, largeArcFlag, sweepFlag, innerArcStart.x, innerArcStart.y].join(" "),
      "innerArcStart": innerArcStart,
      "innerArcEnd": innerArcEnd,
      "center": new $SC.geom.Point(cx, cy),
      "rMaxX": rMaxX,
      "rMaxY": rMaxY,
      "startAngle": startAngle,
      "endAngle": endAngle
    };
    return path;


  } /*End describeDonutArc()*/


  function createLegands() {
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer").innerHTML = "";

    /*Creating series legend*/
    var lengendBBox = {
      left: PAGE_DATA.donutCenter.x + PAGE_DATA.donutWithTextSpan,
      top: (PAGE_DATA.donutCenter.y - PAGE_DATA.donutHeight - 50)
    };

    var strSVG = "";
    for (var index = 0; index < PAGE_DATA.uniqueDataSet.length; index++) {
      var color = (PAGE_OPTIONS.dataSet[index].color ? PAGE_OPTIONS.dataSet[index].color : $SC.util.getColor(index));
      strSVG += "<g id='series_legend_" + index + "' class='donut_legend" + index + "'style='cursor:pointer;'>";
      strSVG += "<rect id='legend_color_" + index + "' class='donut_legend" + index + "' x='" + lengendBBox.left + "' y='" + (lengendBBox.top + (index * 45)) + "' width='15' height='15' fill='" + color + "' stroke='none' stroke-width='1' opacity='1'></rect>";
      strSVG += "<text id='legend_txt_" + index + "' class='donut_legend" + index + "' font-size='16' x='" + (lengendBBox.left + 20) + "' y='" + (lengendBBox.top + (index * 45) + 14) + "' fill='#717171' font-family='Lato' >" + PAGE_DATA.uniqueDataSet[index]["label"] + "</text>";
      strSVG += "<text id='legend_value_" + index + "' class='donut_legend" + index + "' font-size='16' x='" + (lengendBBox.left + PAGE_DATA.maxTextLen) + "' y='" + (lengendBBox.top + (index * 45) + 15) + "' fill='#717171' font-family='Lato' >" + PAGE_DATA.uniqueDataSet[index]["value"] + "</text>";
      strSVG += "</g>";
    }
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer").insertAdjacentHTML("beforeend", strSVG);

    var legendContainer = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer");
    var legendBox = legendContainer.getBoundingClientRect();
    var remainingWidth = (PAGE_OPTIONS.width - lengendBBox.left);

    if (legendBox.width > remainingWidth) {
      var maxTxtLen = 0;
      for (var index = 0; index < PAGE_DATA.uniqueDataSet.length; index++) {
        var eachLegendGrp = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer #series_legend_" + index);
        var lgntTxt = eachLegendGrp.querySelector("#legend_txt_" + index);
        var lgntVal = eachLegendGrp.querySelector("#legend_value_" + index);
        lgntTxt.setAttribute("font-size", 12);
        lgntVal.setAttribute("font-size", 12);
        var txtLen = lgntTxt.getComputedTextLength();
        if (txtLen > maxTxtLen) maxTxtLen = txtLen;
      }
      for (var index = 0; index < PAGE_DATA.uniqueDataSet.length; index++) {
        var lgntVal = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer #legend_value_" + index);
        lgntVal.setAttribute("x", (lengendBBox.left + maxTxtLen + 30));
      }
      legendBox = legendContainer.getBoundingClientRect();
      if (legendBox.width > remainingWidth) {
        for (var index = 0; index < PAGE_DATA.uniqueDataSet.length; index++) {
          var lgntVal = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #legendContainer #legend_value_" + index);
          lgntVal.setAttribute("x", (lengendBBox.left + 20));
          lgntVal.setAttribute("y", (lengendBBox.top + (index * 45) + 35));
        }
      }
    }
    for (var donutIndex = 0; donutIndex < PAGE_DATA.uniqueDataSet.length; donutIndex++) {
      var donutLegend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #series_legend_" + donutIndex);
      donutLegend.addEventListener("mouseover", function (e) {
        var elemId = e.target.getAttribute("class");
        var donutIndex = elemId.substring("donut_legend".length);
        var donutData;

        for (var i = 0; i < PAGE_DATA.donutSet.length; i++)
          if (PAGE_DATA.donutSet[i].id === ("donut" + donutIndex))
            donutData = PAGE_DATA.donutSet[i];
        var donutHover = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #donutHover" + donutIndex);
        var donutHoverPath;
        var hoverWidth = Math.round(PAGE_DATA.innerWidth * 30 / 100);
        hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
        hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
        if (donutData.slicedOut) {

          var shiftIndex = 15;
          var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
          donutHoverPath = describeDonutArc(shiftedCentre.x, shiftedCentre.y, PAGE_DATA.donutWidth + hoverWidth, PAGE_DATA.donutHeight + hoverWidth, PAGE_DATA.innerWidth + hoverWidth, PAGE_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
        } else
          donutHoverPath = describeDonutArc(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, PAGE_DATA.donutWidth + hoverWidth, PAGE_DATA.donutHeight + hoverWidth, PAGE_DATA.innerWidth + hoverWidth, PAGE_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
        donutHover.setAttribute("d", donutHoverPath.d);
      }, false);

      donutLegend.addEventListener("mouseleave", function (e) {
        var elemId = e.target.getAttribute("class");
        var donutIndex = elemId.substring("donut_legend".length);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #donutHover" + donutIndex).setAttribute("d", "");
      }, false);
    }

  } /*End createLegands()*/

  function bindEvents() {
    var mouseDownPos;
    try {
      if (PAGE_DATA.uniqueDataSet.length <= 1) return;

      for (var donutIndex = 0; donutIndex < PAGE_DATA.uniqueDataSet.length; donutIndex++) {

        function onClick(e) {
          var donutData, elemId = e.target.getAttribute("class"),
            sliceOut;
          var index = elemId.substring("donut".length);

          for (var i = 0; i < PAGE_DATA.donutSet.length; i++) {
            if (PAGE_DATA.donutSet[i].id === elemId) {
              donutData = PAGE_DATA.donutSet[i];
              sliceOut = PAGE_DATA.donutSet[i].slicedOut;
              PAGE_DATA.donutSet[i].slicedOut = !PAGE_DATA.donutSet[i].slicedOut;
            }
          }
          var shiftIndex = sliceOut ? 15 : 1;
          var shiftInterval = setInterval(function () {
            var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
            if (isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y))
              shiftedCentre = PAGE_DATA.donutCenter;

            var upperArcDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #upperArcDonut" + index);
            upperArcDonut.setAttribute("transform", "translate(" + (shiftedCentre.x - PAGE_DATA.donutCenter.x) + "," + (shiftedCentre.y - PAGE_DATA.donutCenter.y) + ")");
            var txtDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonutGrpDonut" + index);
            txtDonut.setAttribute("transform", "translate(" + (shiftedCentre.x - PAGE_DATA.donutCenter.x) + "," + (shiftedCentre.y - PAGE_DATA.donutCenter.y) + ")");

            var pathToLegend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #pathToLegend" + index);
            pathToLegend.setAttribute("transform", "translate(" + (shiftedCentre.x - PAGE_DATA.donutCenter.x) + "," + (shiftedCentre.y - PAGE_DATA.donutCenter.y) + ")");

            var colorLegend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #colorLegend" + index);
            colorLegend.setAttribute("transform", "translate(" + (shiftedCentre.x - PAGE_DATA.donutCenter.x) + "," + (shiftedCentre.y - PAGE_DATA.donutCenter.y) + ")");

            shiftIndex = sliceOut ? shiftIndex - 1 : shiftIndex + 1;
            if ((!sliceOut && shiftIndex === 15) || (sliceOut && shiftIndex === -1))
              clearInterval(shiftInterval);
          }, 10);
        } /*End onClick()*/

        var upperArcDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #upperArcDonut" + donutIndex);
        upperArcDonut.addEventListener("mousedown", function (e) {
          e.stopPropagation();
          mouseDownPos = {
            x: e.clientX,
            y: e.clientY
          };
          var elemId = e.target.getAttribute("class");
          var donutIndex = elemId.substring("donut".length);
          document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #donutHover" + donutIndex).setAttribute("d", "");
          PAGE_DATA.mouseDown = 1;

        }, false);

        upperArcDonut.addEventListener("touchstart", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 1;
        }, false);

        upperArcDonut.addEventListener("mouseup", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          if (PAGE_DATA.mouseDrag === 0)
            onClick(e);
          PAGE_DATA.mouseDrag = 0;
        }, false);

        upperArcDonut.addEventListener("touchend", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          PAGE_DATA.mouseDrag = 0;
        }, false);

        upperArcDonut.addEventListener("mousemove", function (e) {
          if (PAGE_DATA.mouseDown === 1 && (mouseDownPos.x !== e.clientX && mouseDownPos.y !== e.clientY)) {
            var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e);
            var dragAngle = getAngle(PAGE_DATA.donutCenter, dragStartPoint);

            if (dragAngle > PAGE_DATA.dragStartAngle)
              rotateChart(2, false);
            else
              rotateChart(-2, false);
            PAGE_DATA.dragStartAngle = dragAngle;
            PAGE_DATA.mouseDrag = 1;
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem, "hide");
          } else {
            var mousePos = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e);
            var donutData, elemId = e.target.getAttribute("class");
            var donutIndex = elemId.substring("donut".length);

            for (var i = 0; i < PAGE_DATA.donutSet.length; i++)
              if (PAGE_DATA.donutSet[i].id === elemId)
                donutData = PAGE_DATA.donutSet[i];
            var row1 = PAGE_DATA.uniqueDataSet[donutIndex].label + ", " + PAGE_DATA.uniqueDataSet[donutIndex].value;
            var row2 = PAGE_DATA.uniqueDataSet[donutIndex].percent.toFixed(2) + "%";
            var color = (PAGE_OPTIONS.dataSet[donutIndex].color ? PAGE_OPTIONS.dataSet[donutIndex].color : $SC.util.getColor(donutIndex));
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem, mousePos, color, row1, row2);
          }
        }, false);

        upperArcDonut.addEventListener("touchmove", function (e) {
          e.preventDefault();
          var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e.changedTouches[0]);
          var dragAngle = getAngle(PAGE_DATA.donutCenter, dragStartPoint);

          if (dragAngle > PAGE_DATA.dragStartAngle)
            rotateChart(2, false);
          else
            rotateChart(-2, false);
          PAGE_DATA.dragStartAngle = dragAngle;
          PAGE_DATA.mouseDrag = 1;
        }, false);

        upperArcDonut.addEventListener("mouseenter", function (e) {
          if (PAGE_DATA.mouseDown === 0) {
            var donutData, elemId = e.target.getAttribute("class");
            var donutIndex = elemId.substring("donut".length);

            for (var i = 0; i < PAGE_DATA.donutSet.length; i++)
              if (PAGE_DATA.donutSet[i].id === elemId)
                donutData = PAGE_DATA.donutSet[i];
            var donutHover = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #donutHover" + donutIndex);
            var donutHoverPath;
            var hoverWidth = Math.round(PAGE_DATA.innerWidth * 30 / 100);
            hoverWidth = (hoverWidth > 20) ? 20 : hoverWidth;
            hoverWidth = (hoverWidth < 8) ? 8 : hoverWidth;
            if (donutData.slicedOut) {
              var shiftIndex = 15;
              var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(shiftIndex * 2, shiftIndex * 2, donutData.midAngle), donutData.midAngle);
              donutHoverPath = describeDonutArc(shiftedCentre.x, shiftedCentre.y, PAGE_DATA.donutWidth + hoverWidth, PAGE_DATA.donutHeight + hoverWidth, PAGE_DATA.innerWidth + hoverWidth, PAGE_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
            } else
              donutHoverPath = describeDonutArc(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, PAGE_DATA.donutWidth + hoverWidth, PAGE_DATA.donutHeight + hoverWidth, PAGE_DATA.innerWidth + hoverWidth, PAGE_DATA.innerHeight + hoverWidth, donutData.upperArcPath.startAngle, donutData.upperArcPath.endAngle, 0);
            donutHover.setAttribute("d", donutHoverPath.d);
          }
        }, false);

        upperArcDonut.addEventListener("mouseleave", function (e) {
          var elemId = e.target.getAttribute("class");
          var donutIndex = elemId.substring("donut".length);
          document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #donutHover" + donutIndex).setAttribute("d", "");
          $SC.ui.toolTip(PAGE_OPTIONS.targetElem, "hide");
        }, false);


      } /*End of for loop*/

      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").addEventListener("mouseup", function (e) {
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      }, false);

      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart").addEventListener("touchend", function (e) {
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      }, false);

      window.onresize = onWindowResize;
    } catch (ex) {
      console.log(ex);
    }
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


  function getAngle(point1, point2) {
    var deltaX = point2.x - point1.x;
    var deltaY = point2.y - point1.y;
    var rad = Math.atan2(deltaY, deltaX);
    var deg = rad * 180.0 / Math.PI;
    deg = (deg < 0) ? deg + 450 : deg + 90;
    return deg % 360;
  }

  function rotateChart(rotationIndex, ignorOrdering) {
    for (var donutIndex = 0; donutIndex < PAGE_DATA.uniqueDataSet.length; donutIndex++) {
      var donutData, elemId = "donut" + donutIndex;
      for (var i = 0; i < PAGE_DATA.donutSet.length; i++) {
        if (PAGE_DATA.donutSet[i].id === elemId) {
          donutData = PAGE_DATA.donutSet[i];
        }
        PAGE_DATA.donutSet[i].slicedOut = false;
      }

      var donutGroup = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #donutChart .donut" + donutIndex);
      for (var i = 0; i < donutGroup.length; i++)
        donutGroup[i].setAttribute("transform", "");

      var upperArcPath = describeDonutArc(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, PAGE_DATA.donutWidth, PAGE_DATA.donutHeight, PAGE_DATA.innerWidth, PAGE_DATA.innerHeight, (donutData["upperArcPath"].startAngle + rotationIndex), (donutData["upperArcPath"].endAngle + rotationIndex), 0);
      var upperArcDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #upperArcDonut" + donutIndex);
      upperArcDonut.setAttribute("d", upperArcPath.d);

      var midAngle = (((donutData["upperArcPath"].startAngle + rotationIndex) + (donutData["upperArcPath"].endAngle + rotationIndex)) / 2) % 360.00;

      PAGE_DATA.donutSet[donutIndex]["upperArcPath"] = upperArcPath;
      PAGE_DATA.donutSet[donutIndex]["midAngle"] = (midAngle < 0 ? 360 + midAngle : midAngle);
      if (!ignorOrdering)
        resetTextPos();
    }

  } /*End rotateChart()*/

  function resetTextPos() {
    var txtTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtTitle").getComputedTextLength();
    var txtSubTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    var txtTitleGrp = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp");


    if (txtTitleLen > PAGE_CONST.FIX_WIDTH) {
      var fontSize = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtTitle").getAttribute("font-size");
      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtTitle").setAttribute("font-size", fontSize - 5);
      txtTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtSubtitle").getAttribute("font-size");
      document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtSubtitle").setAttribute("font-size", fontSize - 3);
      txtSubTitleLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x", (PAGE_DATA.svgCenter.x - (txtTitleLen / 2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y", 80);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x", (PAGE_DATA.svgCenter.x - (txtSubTitleLen / 2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y", 100);


    var maxOverFlow = calcMaxOverflow(0);

    function calcMaxOverflow(round) {
      var overFlow = 0,
        maxOverFlow = 0,
        overflowTxtIndex, maxTextLen = 0;

      for (var donutIndex = 0; donutIndex < PAGE_DATA.donutSet.length; donutIndex++) {
        var txtLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex).getComputedTextLength();
        var eachTxtWidth = PAGE_DATA.donutWidth + PAGE_DATA.innerWidth + txtLen;
        overFlow = (eachTxtWidth > PAGE_DATA.donutCenter.x) ? eachTxtWidth - PAGE_DATA.donutCenter.x : 0;
        if (overFlow > maxOverFlow) {
          maxOverFlow = overFlow;
          overflowTxtIndex = donutIndex;
        }
        if (txtLen > maxTextLen)
          maxTextLen = txtLen;
      }

      PAGE_DATA.donutWithTextSpan = PAGE_DATA.donutWidth + PAGE_DATA.innerWidth + maxTextLen;
      PAGE_DATA.maxTextLen = maxTextLen;

      if (maxOverFlow > 20) {
        /*reduce text length according to the text size*/
        var content = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + overflowTxtIndex).textContent.split(" ")[0].replace("...", "");
        content = content.substring(0, (content.length - 1)) + "...";
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + overflowTxtIndex).textContent = (content + " [" + PAGE_DATA.donutSet[overflowTxtIndex].percent + "%]");
        if (round < 50)
          maxOverFlow = calcMaxOverflow(round + 1);
      }
      return maxOverFlow;
    } /*End calcMaxOverflow()*/

    for (var donutIndex = 0; donutIndex < PAGE_DATA.donutSet.length; donutIndex++) {
      var donutData = PAGE_DATA.donutSet[donutIndex];

      var textPos = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.donutWidth + PAGE_DATA.innerWidth - (maxOverFlow / 2), PAGE_DATA.donutHeight + PAGE_DATA.innerWidth - (maxOverFlow / 2), donutData.midAngle), donutData.midAngle);

      var txtBoundingRect = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex).getBoundingClientRect();
      var txtLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex).getComputedTextLength();
      var newTextPos = new $SC.geom.Point(textPos.x, textPos.y);
      if (donutData.midAngle > 180)
        newTextPos.x -= txtLen;

      var otrTextPos;
      if ((donutData.midAngle > 90 && donutData.midAngle <= 180) || (donutData.midAngle > 270 && donutData.midAngle <= 360))
        otrTextPos = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.donutWidth + PAGE_DATA.innerWidth - (maxOverFlow / 2), PAGE_DATA.donutHeight + PAGE_DATA.innerWidth - (maxOverFlow / 2), PAGE_DATA.donutSet[Math.abs(donutIndex - 1)].midAngle), PAGE_DATA.donutSet[Math.abs(donutIndex - 1)].midAngle);
      else if ((donutData.midAngle > 0 && donutData.midAngle <= 90) || (donutData.midAngle > 180 && donutData.midAngle <= 270))
        otrTextPos = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.donutWidth + PAGE_DATA.innerWidth - (maxOverFlow / 2), PAGE_DATA.donutHeight + PAGE_DATA.innerWidth - (maxOverFlow / 2), PAGE_DATA.donutSet[(donutIndex + 1) % PAGE_DATA.donutSet.length].midAngle), PAGE_DATA.donutSet[(donutIndex + 1) % PAGE_DATA.donutSet.length].midAngle);

      if (Math.abs(otrTextPos.y - newTextPos.y) < 50)
        if (donutData.midAngle > 90 && donutData.midAngle < 270)
          newTextPos.y = (otrTextPos.y + 50);
        else
          newTextPos.y = (otrTextPos.y - 50);


      var txtDonut = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex);
      txtDonut.setAttribute("x", newTextPos.x);
      txtDonut.setAttribute("y", newTextPos.y);
      if (maxOverFlow > 0) {
        txtDonut.setAttribute("font-size", 12);
        var newTxtLen = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex).getComputedTextLength();
        txtBoundingRect = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonut" + donutIndex).getBoundingClientRect();
        if (donutData.midAngle > 180)
          textPos.x -= (txtLen - newTxtLen);
        txtLen = newTxtLen;


      }

      var indent = Math.round(PAGE_DATA.innerWidth * 20 / 100);
      indent = (indent > 15) ? 15 : indent;
      indent = (indent < 5) ? 5 : indent;

      var colorLegend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #colorLegend" + donutIndex);
      colorLegend.setAttribute("x", newTextPos.x);
      colorLegend.setAttribute("y", newTextPos.y + (txtBoundingRect.height / 2));
      colorLegend.setAttribute("width", txtLen);
      colorLegend.setAttribute("height", indent / 2);
      if (maxOverFlow > 0) colorLegend.style.display = "none";

      var sPoint = $SC.geom.polarToCartesian(PAGE_DATA.donutCenter.x, PAGE_DATA.donutCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.donutWidth, PAGE_DATA.donutHeight, donutData.midAngle), donutData.midAngle);

      if (donutData.midAngle > 180) {
        var lPath = ["M", textPos.x + 5, newTextPos.y];
        lPath.push("L", textPos.x + indent + 5, newTextPos.y);
        lPath.push("L", sPoint.x, sPoint.y);
      } else {
        var lPath = ["M", textPos.x - 5, newTextPos.y];
        lPath.push("L", textPos.x - indent - 5, newTextPos.y);
        lPath.push("L", sPoint.x, sPoint.y);
      }

      var pathToLegend = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #pathToLegend" + donutIndex);
      pathToLegend.setAttribute("d", lPath.join(" "));

    }
  } /*End resetTextPos()*/


  function colorLuminance(hex, lum) {

    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    var rgb = "#",
      c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i * 2, 2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00" + c).substr(c.length);
    }
    return rgb;
  } /*End colorLuminance()*/


  function prepareDataSet() {
    for (var i = 0; i < PAGE_OPTIONS.dataSet.length; i++) {
      var found = -1;
      for (var j = 0; j < PAGE_DATA.uniqueDataSet.length; j++) {
        if (PAGE_OPTIONS.dataSet[i].label.toLowerCase() === PAGE_DATA.uniqueDataSet[j].label.toLowerCase()) {
          found = j;
          break;
        }
      }
      if (found === -1) {
        PAGE_DATA.uniqueDataSet.push({
          "label": PAGE_OPTIONS.dataSet[i].label,
          "value": PAGE_OPTIONS.dataSet[i].value,
          "slicedOut": PAGE_OPTIONS.dataSet[i].slicedOut || false
        });
      } else {
        PAGE_DATA.uniqueDataSet[found] = {
          "label": PAGE_OPTIONS.dataSet[i].label,
          "value": parseFloat(PAGE_OPTIONS.dataSet[i].value) + parseFloat(PAGE_DATA.uniqueDataSet[j].value)
        };
      }
      PAGE_DATA.totalValue += parseFloat(PAGE_OPTIONS.dataSet[i].value);
    }
    for (var i = 0; i < PAGE_DATA.uniqueDataSet.length; i++) {
      var percent = 100 * parseFloat(PAGE_DATA.uniqueDataSet[i].value) / PAGE_DATA.totalValue;
      PAGE_DATA.uniqueDataSet[i]["percent"] = percent;
    }

    //fire Event afterParseData
    var afterParseDataEvent = new self.Event("afterParseData", {
      srcElement: self
    });
    self.dispatchEvent(afterParseDataEvent);
  } /*End prepareDataSet()*/

  function slicedOutOnSettings() {
    for (var i = 0; i < PAGE_DATA.donutSet.length; i++) {
      if (PAGE_DATA.donutSet[i].slicedOut) {

        var mouseUp = document.createEvent("SVGEvents");
        mouseUp.initEvent("mouseup", true, true);
        var upperArc = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #upperArcDonut" + i);
        PAGE_DATA.donutSet[i].slicedOut = false;
        upperArc.dispatchEvent(mouseUp);
      }
    }
  } /*End slicedOutOnSettings()*/

  function showAnimatedView() {
    var sAngle = 0,
      eAngle = 1,
      angleCalc = {};
    for (var donutIndex = 0; donutIndex < PAGE_DATA.uniqueDataSet.length; donutIndex++) {
      angleCalc["donut" + donutIndex] = {
        "startAngle": sAngle++,
        "endAngle": eAngle++
      };
    }
    var intervalId = setInterval(function () {
      PAGE_DATA.donutSet = [];
      PAGE_DATA.totalValue = 0;
      for (var donutIndex = 0; donutIndex < PAGE_DATA.uniqueDataSet.length; donutIndex++) {
        var startAngle = angleCalc["donut" + donutIndex].startAngle;
        var endAngle = angleCalc["donut" + donutIndex].endAngle;
        var angleDiff = endAngle - startAngle;
        if (donutIndex > 0) {
          startAngle = angleCalc["donut" + (donutIndex - 1)].endAngle;
          endAngle = startAngle + angleDiff;
        }
        var actualEndAngle = (PAGE_DATA.uniqueDataSet[donutIndex].percent * 36 / 10);
        endAngle = (endAngle + 15) > (startAngle + actualEndAngle) ? (startAngle + actualEndAngle) : (endAngle + 15);
        var donutSet = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #donutChart .donut" + donutIndex);
        for (var i = 0; i < donutSet.length; i++) donutSet[i].parentNode.removeChild(donutSet[i]);

        var color = (PAGE_OPTIONS.dataSet[donutIndex].color ? PAGE_OPTIONS.dataSet[donutIndex].color : $SC.util.getColor(donutIndex));
        createDonut(startAngle, endAngle, color, donutIndex);
        angleCalc["donut" + donutIndex] = {
          "startAngle": startAngle,
          "endAngle": endAngle
        };
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #colorLegend" + donutIndex).style.display = "none";
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #donutChart #txtDonutGrpDonut" + donutIndex).style.display = "none";
        if (endAngle >= 358) {
          clearInterval(intervalId);
          init();
        }
      }
    }, 50);
  } /*End showAnimatedView()*/

  init();
  if (PAGE_OPTIONS.animated !== false) showAnimatedView();
}; /*End of drawDonutChart3D()*/