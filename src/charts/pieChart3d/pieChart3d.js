/*
 * SVG PieChart 3D
 * @CreatedOn:27-Apr-2016
 * @LastUpdated:30-Jun-2016
 * @Author:SmartChartsNXT
 * @description:This will generate a 3d pie chart. Using SVG 1.1 elements and HTML 5 standard. 
 * JSFiddle:https://jsfiddle.net/KCoder/yuq10f1z/
 * @Sample caller code:
 * var settings = {
      "width":500,
      "height":300,
      "depth":20,
      "outline":0.5,
      "canvasBorder":true,
      "title":"Sales Report of ABC Group",
      "subTitle":"Report for the month of March, 2016",
      "targetElem":"chartContainer",
      "dataSet":[
        {
          "label":"Ashimt Dutta",
          "value":"110"
        },
        {
          "label":"Naren Mitra",
          "value":"547"
        },
        {
          "label":"Rames Tiwari",
          "value":"270"
        },
        {
          "label":"Rimi Sen",
          "value":"90"
        },
        {
          "label":"Jogesh Xing",
          "value":"180"
        },
      ]
    }; 
    SmartChartsNXT.ready(function(){
      var PieChart3D = new SmartChartsNXT.PieChart3D(settings);
    });
 */



window.SmartChartsNXT.PieChart3D = function (opts) {

  var PAGE_OPTIONS = {};
  var self = this;
  var PAGE_DATA = {
    scaleX: 0,
    scaleY: 0,
    svgCenter: 0,
    pieCenter: 0,
    pieThickness: 20,
    uniqueDataSet: [],
    totalValue: 0,
    pieWidth: 200,
    pieHeight: 100,
    pieSet: [],
    dragStartAngle: 0,
    dragEndPoint: null,
    mouseDown: 0,
    mouseDrag: 0
  };

  var PAGE_CONST = {
    FIX_WIDTH: 800,
    FIX_HEIGHT: 500
  };

  function init() {
    PAGE_OPTIONS = $SC.util.extends(opts, PAGE_OPTIONS);

    PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH - PAGE_OPTIONS.width;
    PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT - PAGE_OPTIONS.height;
    PAGE_DATA.pieThickness = PAGE_OPTIONS.depth || 20;

    if (PAGE_OPTIONS.events && typeof PAGE_OPTIONS.events === "object") {
      for (var e in PAGE_OPTIONS.events) {
        self.off(e, PAGE_OPTIONS.events[e]);
        self.on(e, PAGE_OPTIONS.events[e]);
      }
    }

    //fire Event onInit
    var onInitEvent = new self.Event("onInit", {
      srcElement: self
    });
    self.dispatchEvent(onInitEvent);

    var strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
      "preserveAspectRatio='xMidYMid meet'" +
      "currentScale='1'" +
      "viewBox='" + ((-1) * PAGE_DATA.scaleX / 2) + " " + ((-1) * PAGE_DATA.scaleY / 2) + " 800 500'" +
      "version='1.1'" +
      "width='" + PAGE_OPTIONS.width + "'" +
      "height='" + PAGE_OPTIONS.height + "'" +
      "id='pieChart3D'" +
      "style='background:" + (PAGE_OPTIONS.bgColor || "none") + ";width:100%;height:auto; max-width:" + PAGE_OPTIONS.width + "px;max-height:" + PAGE_OPTIONS.height + "px;-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'> <\/svg>";

    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";
    document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend", strSVG);

    $SC.appendWaterMark(PAGE_OPTIONS.targetElem, PAGE_DATA.scaleX, PAGE_DATA.scaleY);

    var svgWidth = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D").getAttribute("width");
    var svgHeight = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D").getAttribute("height");
    PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth / 2), (svgHeight / 2));
    PAGE_DATA.pieCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x, PAGE_DATA.svgCenter.y + 50);

    prepareChart();
  } /*End init()*/

  function prepareChart() {
    var startAngle, endAngle = 0;
    prepareDataSet();

    var strSVG = "";
    if (PAGE_OPTIONS.canvasBorder) {
      strSVG += "<g>";
      strSVG += "  <rect x='" + ((-1) * PAGE_DATA.scaleX / 2) + "' y='" + ((-1) * PAGE_DATA.scaleY / 2) + "' width='" + ((PAGE_DATA.svgCenter.x * 2) + PAGE_DATA.scaleX) + "' height='" + ((PAGE_DATA.svgCenter.y * 2) + PAGE_DATA.scaleY) + "' style='fill:white;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Verdana' >";
    strSVG += "    <tspan id='txtTitle' x='" + (100 / PAGE_CONST.FIX_WIDTH * PAGE_OPTIONS.width) + "' y='" + (50 / PAGE_CONST.FIX_HEIGHT * PAGE_OPTIONS.height) + "' font-size='25'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D").insertAdjacentHTML("beforeend", strSVG);

    /*Set Title of chart*/
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    for (var i = 0; i < PAGE_DATA.uniqueDataSet.length; i++) {
      startAngle = endAngle;
      endAngle += (PAGE_DATA.uniqueDataSet[i].percent * 360 / 100);
      createPie(startAngle, endAngle, $SC.util.getColor(i), i);
    }

    resetOrdering();
    bindEvents();
    resetTextPos();
    divergeElements();
    convergeElements();

    //fire event afterRender
    var aftrRenderEvent = new self.Event("afterRender", {
      srcElement: self
    });
    self.dispatchEvent(aftrRenderEvent);

    $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem, PAGE_DATA.svgCenter, PAGE_DATA.scaleX, PAGE_DATA.scaleY, self);
  } /*End prepareChart()*/

  function createPie(startAngle, endAngle, color, index) {
    var percent = parseFloat((endAngle - startAngle) * 100 / 360).toFixed(2);
    var darkShade = $SC.util.colorLuminance(color, -0.2);
    var lighterShade = $SC.util.colorLuminance(color, 0.2);

    var strSVG = "";
    strSVG += "  <path class='pie" + index + "' id='lowerArcPie" + index + "' fill='" + color + "' stroke='" + darkShade + "' stroke-width='0' style='cursor:pointer;' \/> ";
    strSVG += "  <path class='pie" + index + "' id='sideBPie" + index + "'  fill='" + darkShade + "' stroke='" + darkShade + "' style='cursor:pointer;'\/>";
    strSVG += "  <path class='pie" + index + "' id='sideCPie" + index + "'  fill='" + darkShade + "' stroke='" + darkShade + "' style='cursor:pointer;' \/>";
    strSVG += "  <path class='pie" + index + "' id='sideAPie" + index + "'  fill='" + darkShade + "' stroke='" + darkShade + "' style='cursor:pointer;'\/>";
    strSVG += "  <rect class='pie" + index + "' id='txtContainer" + index + "' width='300' height='100' fill='" + lighterShade + "' style='opacity:1;' />";
    strSVG += "  <text class='pie" + index + "' id='txtPieGrpPie" + index + "' fill='#717171' font-family='Verdana' >";
    strSVG += "  <tspan class='pie" + index + "' id='txtPie" + index + "' x='100' y='50' font-size='12'><\/tspan></text>";
    strSVG += "  <path class='pie" + index + "' id='upperArcPie" + index + "'  fill='" + lighterShade + "' stroke='#eee' stroke-width='" + (PAGE_OPTIONS.outline || 1) + "' style='cursor:pointer;' \/>"; //"+lighterShade+"'
    strSVG += "  <text class='pie" + index + "' id='txtPercentPie" + index + "' fill='#717171' font-family='Verdana' fill='#000' style='opacity:0.5;' >" + percent + "%</text>";

    strSVG += "<defs>";
    strSVG += "  <radialGradient gradientUnits = 'userSpaceOnUse' id='" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + index + "' cx='50%' cy='50%' r='70%' fx='40%' fy='100%'>";
    strSVG += "    <stop offset='0%' style='stop-color:" + lighterShade + ";stop-opacity:1' \/>";
    strSVG += "    <stop offset='100%' style='stop-color:" + darkShade + ";stop-opacity:1' \/>";
    strSVG += "  <\/radialGradient>";
    strSVG += "<\/defs>";

    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D").insertAdjacentHTML("beforeend", strSVG);

    var upperArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #upperArcPie" + index);
    var lowerArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #lowerArcPie" + index);
    var sideAPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideAPie" + index);
    var sideBPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideBPie" + index);
    var sideCPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideCPie" + index);
    var upperArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, startAngle, endAngle, 0);
    var lowerArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x, (PAGE_DATA.pieCenter.y + PAGE_DATA.pieThickness), PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, startAngle, endAngle, 0);
    upperArcPie.setAttribute("d", upperArcPath.d);
    upperArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + index + ")");
    lowerArcPie.setAttribute("d", lowerArcPath.d);
    lowerArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + index + ")");
    sideAPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.start, lowerArcPath.start, lowerArcPath.center));
    sideBPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.end, lowerArcPath.end, lowerArcPath.center));
    sideCPie.setAttribute("d", describeArcFill(upperArcPath, lowerArcPath));

    var textLabel = PAGE_DATA.uniqueDataSet[index]["label"];
    textLabel = (textLabel.length > 20 ? textLabel.substring(0, 20) + "..." : textLabel);
    document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtPie" + index).textContent = (textLabel + ", " + PAGE_DATA.uniqueDataSet[index]["value"]);

    var midAngle = (startAngle + endAngle) / 2;
    var pie = {
      "id": "pie" + index,
      "upperArcPath": upperArcPath,
      "lowerArcPath": lowerArcPath,
      "midAngle": midAngle,
      "slicedOut": false,
      "percent": percent
    };
    PAGE_DATA.pieSet.push(pie);
  } /*End createPie()*/

  function bindEvents() {
    var mouseDownPos;
    try {
      if (PAGE_DATA.uniqueDataSet.length <= 1) return;

      for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
        function onClick(e) {

          var pieData, elemId = e.target.className.baseVal,
            sliceOut;
          var index = elemId.substring("pie".length);
          for (var i = 0; i < PAGE_DATA.pieSet.length; i++) {
            if (PAGE_DATA.pieSet[i].id === elemId) {
              pieData = PAGE_DATA.pieSet[i];
              sliceOut = PAGE_DATA.pieSet[i].slicedOut;
              PAGE_DATA.pieSet[i].slicedOut = !PAGE_DATA.pieSet[i].slicedOut;
            }
          }
          var shiftIndex = sliceOut ? 15 : 1;
          var shiftInterval = setInterval(function () {
            var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious((shiftIndex * 2), shiftIndex, pieData.midAngle), pieData.midAngle);
            var upperArcPath = $SC.geom.describeEllipticalArc(shiftedCentre.x, shiftedCentre.y, PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, pieData["upperArcPath"].startAngle, pieData["upperArcPath"].endAngle, 0);
            var lowerArcPath = $SC.geom.describeEllipticalArc(shiftedCentre.x, (shiftedCentre.y + PAGE_DATA.pieThickness), PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, pieData["lowerArcPath"].startAngle, pieData["lowerArcPath"].endAngle, 0);
            if (shiftIndex === 0) {
              var upperArcPath = pieData.upperArcPath;
              var lowerArcPath = pieData.lowerArcPath;
            }

            var upperArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #upperArcPie" + index);
            var lowerArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #lowerArcPie" + index);
            var sideAPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideAPie" + index);
            var sideBPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideBPie" + index);
            var sideCPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideCPie" + index);

            upperArcPie.setAttribute("d", upperArcPath.d);
            upperArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + index + ")");
            lowerArcPie.setAttribute("d", lowerArcPath.d);
            lowerArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + index + ")");
            sideAPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.start, lowerArcPath.start, lowerArcPath.center));
            sideBPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.end, lowerArcPath.end, lowerArcPath.center));
            sideCPie.setAttribute("d", describeArcFill(upperArcPath, lowerArcPath));

            shiftIndex = sliceOut ? shiftIndex - 1 : shiftIndex + 1;
            resetTextPos();
            if ((!sliceOut && shiftIndex === 15) || (sliceOut && shiftIndex === -1))
              clearInterval(shiftInterval);
          }, 10);
        } /*End onClick()*/

        var upperArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #upperArcPie" + pieIndex);
        upperArcPie.addEventListener("mousedown", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 1;
          mouseDownPos = {
            x: e.clientX,
            y: e.clientY
          };
        }, false);

        upperArcPie.addEventListener("touchstart", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 1;

        }, false);

        upperArcPie.addEventListener("mouseup", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          if (PAGE_DATA.mouseDrag === 0)
            onClick(e);
          PAGE_DATA.mouseDrag = 0;
        }, false);

        upperArcPie.addEventListener("touchend", function (e) {
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          PAGE_DATA.mouseDrag = 0;
        }, false);

        upperArcPie.addEventListener("mousemove", function (e) {
          if (PAGE_DATA.mouseDown === 1 && (mouseDownPos.x !== e.clientX && mouseDownPos.y !== e.clientY)) {
            var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e);
            var dragAngle = getAngle(PAGE_DATA.pieCenter, dragStartPoint);

            if (dragAngle > PAGE_DATA.dragStartAngle)
              rotateChart(2, false);
            else
              rotateChart(-2, false);
            PAGE_DATA.dragStartAngle = dragAngle;
            PAGE_DATA.mouseDrag = 1;
          }
        }, false);

        upperArcPie.addEventListener("touchmove", function (e) {
          e.preventDefault();
          var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem, e.changedTouches[0]);
          var dragAngle = getAngle(PAGE_DATA.pieCenter, dragStartPoint);

          if (dragAngle > PAGE_DATA.dragStartAngle)
            rotateChart(2, false);
          else
            rotateChart(-2, false);
          PAGE_DATA.dragStartAngle = dragAngle;
          PAGE_DATA.mouseDrag = 1;
        }, false);
      }

      var pieChart = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D");
      pieChart.addEventListener("mouseup", function (e) {
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      });

      pieChart.addEventListener("touchend", function (e) {
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      });
    } catch (ex) {
      $SC.handleError(ex);
    }
  } /*End bindEvents()*/

  function divergeElements() {
    if (PAGE_DATA.uniqueDataSet.length > 1) {
      for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
        var pieData, elemId = "pie" + pieIndex;
        for (var i = 0; i < PAGE_DATA.pieSet.length; i++) {
          if (PAGE_DATA.pieSet[i].id === elemId) {
            pieData = PAGE_DATA.pieSet[i];
          }
          PAGE_DATA.pieSet[i].slicedOut = false;
        }
        var transposePoint = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious((10000), (10000), pieData.midAngle), pieData.midAngle);

        var pieGroup = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #pieChart3D .pie" + pieIndex);
        for (var i = 0; i < pieGroup.length; i++) {
          pieGroup[i].setAttribute("transform", "translate(" + (transposePoint.x - PAGE_DATA.pieCenter.x) + "," + (transposePoint.y - PAGE_DATA.pieCenter.y) + ")");
        }
      }
    }
  } /*End divergeElemnts()*/

  function convergeElements() {
    if (PAGE_DATA.uniqueDataSet.length > 1) {
      for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
        var shiftRadiousX = (PAGE_DATA.svgCenter.x * 2);
        var shiftRadiousY = (PAGE_DATA.svgCenter.y * 2);
        var pieData, elemId = "pie" + pieIndex;
        for (var i = 0; i < PAGE_DATA.pieSet.length; i++) {
          if (PAGE_DATA.pieSet[i].id === elemId)
            pieData = PAGE_DATA.pieSet[i];
        }
        (function (shiftRadiousX, shiftRadiousY, pieData, pieIndex) {
          var reverseFlag = 0,
            replaceUnit = 5;
          setTimeout(function () {
            var intervalId = setInterval(function () {
              var transform = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, shiftRadiousX, pieData.midAngle);
              transform = new $SC.geom.Point((transform.x - PAGE_DATA.pieCenter.x), (transform.y - PAGE_DATA.pieCenter.y));
              var pieGroup = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #pieChart3D .pie" + pieIndex);
              for (var i = 0; i < pieGroup.length; i++) {
                pieGroup[i].setAttribute("transform", "translate(" + transform.x + "," + transform.y + ")");
              }
              if ((Math.abs(Math.round(transform.x)) <= 5 && Math.abs(Math.round(transform.y)) <= 5) && reverseFlag === 0) {
                reverseFlag = 1;
                replaceUnit = -4.5;
              }
              if ((Math.abs(Math.round(transform.x)) >= 70 || Math.abs(Math.round(transform.y)) >= 70) && reverseFlag === 1) {
                reverseFlag = 2;
                replaceUnit = 1;
              }
              shiftRadiousX -= (replaceUnit * 1.5);
              shiftRadiousY -= (replaceUnit * 1.5);

              if (Math.round(transform.x) === 0 && Math.round(transform.y) === 0) {
                clearInterval(intervalId);
                document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D .pie" + pieIndex).setAttribute("transform", "");
              }
            }, 5);
          }, (pieIndex * 400));
        })(shiftRadiousX, shiftRadiousY, pieData, pieIndex);
      }
    }
  } /*End convergeElements()*/


  function getAngle(point1, point2) {
    var deltaX = point2.x - point1.x;
    var deltaY = point2.y - point1.y;
    var rad = Math.atan2(deltaY, deltaX);
    var deg = rad * 180.0 / Math.PI;
    deg = (deg < 0) ? deg + 450 : deg + 90;
    return deg % 360;
  }

  function rotateChart(rotationIndex, ignorOrdering) {
    for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
      var pieData, elemId = "pie" + pieIndex;
      var upperArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #upperArcPie" + pieIndex);
      var lowerArcPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #lowerArcPie" + pieIndex);
      var sideAPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideAPie" + pieIndex);
      var sideBPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideBPie" + pieIndex);
      var sideCPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #sideCPie" + pieIndex);

      for (var i = 0; i < PAGE_DATA.pieSet.length; i++) {
        if (PAGE_DATA.pieSet[i].id === elemId) {
          pieData = PAGE_DATA.pieSet[i];
        }
        PAGE_DATA.pieSet[i].slicedOut = false;
      }

      var upperArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, (pieData["upperArcPath"].startAngle + rotationIndex), (pieData["upperArcPath"].endAngle + rotationIndex), 0);
      var lowerArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x, (PAGE_DATA.pieCenter.y + PAGE_DATA.pieThickness), PAGE_DATA.pieWidth, PAGE_DATA.pieHeight, (pieData["lowerArcPath"].startAngle + rotationIndex), (pieData["lowerArcPath"].endAngle + rotationIndex), 0);
      upperArcPie.setAttribute("d", upperArcPath.d);
      upperArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + pieIndex + ")");
      lowerArcPie.setAttribute("d", lowerArcPath.d);
      lowerArcPie.setAttribute("fill", "url(#" + PAGE_OPTIONS.targetElem + "piechart3d-gradRadialPie" + pieIndex + ")");
      sideAPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.start, lowerArcPath.start, lowerArcPath.center));
      sideBPie.setAttribute("d", describeRect(upperArcPath.center, upperArcPath.end, lowerArcPath.end, lowerArcPath.center));
      sideCPie.setAttribute("d", describeArcFill(upperArcPath, lowerArcPath));

      var midAngle = (((pieData["upperArcPath"].startAngle + rotationIndex) + (pieData["upperArcPath"].endAngle + rotationIndex)) / 2) % 360.00;

      PAGE_DATA.pieSet[pieIndex]["upperArcPath"] = upperArcPath;
      PAGE_DATA.pieSet[pieIndex]["lowerArcPath"] = lowerArcPath;
      PAGE_DATA.pieSet[pieIndex]["midAngle"] = (midAngle < 0 ? 360 + midAngle : midAngle);
      if (!ignorOrdering)
        resetTextPos();
    }
    if (!ignorOrdering)
      resetOrdering();

  } /*End rotateChart()*/

  function resetOrdering() {
    try {
      var viewPoint = new $SC.geom.Point(PAGE_DATA.svgCenter.x, PAGE_DATA.svgCenter.y * 2);

      var renderingOrder = {
        upperArc: [],
        sideArc: [],
        lowerArc: []
      };

      for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
        var arcBottom, arcTop, distanceBottom, distanceTop;
        var pieElems = document.querySelectorAll("#" + PAGE_OPTIONS.targetElem + " #pieChart3D .pie" + pieIndex);
        for (var i = 0; i < pieElems.length; i++) {
          if (pieElems[i].nodeName === "tspan") continue;

          arcBottom = getArcBottomCenter(pieElems[i].getBBox());
          arcTop = getArcTopCenter(pieElems[i].getBBox());

          distanceBottom = (viewPoint.y - arcBottom.y);
          distanceTop = arcTop.y;
          var isInside;

          var lowerArcTriangle = [],
            arrLowerArcPath = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #lowerArcPie" + pieIndex).getAttribute("d").split(" ");
          lowerArcTriangle.push(new $SC.geom.Point(arrLowerArcPath[1], arrLowerArcPath[2]));
          lowerArcTriangle.push(new $SC.geom.Point(arrLowerArcPath[9], arrLowerArcPath[10]));
          lowerArcTriangle.push(new $SC.geom.Point(arrLowerArcPath[12], arrLowerArcPath[13]));

          if (pieElems[i].getAttribute("id").match("sideB")) {
            var polygonA = [],
              arrSideBPath = pieElems[i].getAttribute("d").split(" ");
            polygonA.push(new $SC.geom.Point(arrSideBPath[1], arrSideBPath[2]));
            polygonA.push(new $SC.geom.Point(arrSideBPath[4], arrSideBPath[5]));
            polygonA.push(new $SC.geom.Point(arrSideBPath[7], arrSideBPath[8]));
            polygonA.push(new $SC.geom.Point(arrSideBPath[10], arrSideBPath[11]));
            var sideBUpperEdgeCenter = new $SC.geom.Point((parseFloat(polygonA[0].x) + parseFloat(polygonA[1].x)) / 2, (parseFloat(polygonA[0].y) + parseFloat(polygonA[1].y)) / 2);
            isInside = is_in_triangle(sideBUpperEdgeCenter.x, sideBUpperEdgeCenter.y, lowerArcTriangle[0].x, lowerArcTriangle[0].y, lowerArcTriangle[1].x, lowerArcTriangle[1].y, lowerArcTriangle[2].x, lowerArcTriangle[2].y);
          } else if (pieElems[i].getAttribute("id").match("sideA")) {
            var polygonA = [],
              arrSideAPath = pieElems[i].getAttribute("d").split(" ");
            polygonA.push(new $SC.geom.Point(arrSideAPath[1], arrSideAPath[2]));
            polygonA.push(new $SC.geom.Point(arrSideAPath[4], arrSideAPath[5]));
            polygonA.push(new $SC.geom.Point(arrSideAPath[7], arrSideAPath[8]));
            polygonA.push(new $SC.geom.Point(arrSideAPath[10], arrSideAPath[11]));
            var sideAUpperEdgeCenter = new $SC.geom.Point((parseFloat(polygonA[0].x) + parseFloat(polygonA[1].x)) / 2, (parseFloat(polygonA[0].y) + parseFloat(polygonA[1].y)) / 2);
            isInside = is_in_triangle(sideAUpperEdgeCenter.x, sideAUpperEdgeCenter.y, lowerArcTriangle[0].x, lowerArcTriangle[0].y, lowerArcTriangle[1].x, lowerArcTriangle[1].y, lowerArcTriangle[2].x, lowerArcTriangle[2].y);
          }

          if (pieElems[i].getAttribute("id").match("upperArcPie"))
            renderingOrder.upperArc.push({
              elemId: pieElems[i].getAttribute("id"),
              distBottom: distanceBottom,
              distTop: distanceTop
            });
          else if (pieElems[i].getAttribute("id").match("lowerArcPie"))
            renderingOrder.lowerArc.push({
              elemId: pieElems[i].getAttribute("id"),
              distBottom: distanceBottom,
              distTop: distanceTop
            });
          else if (pieElems[i].getAttribute("id").match("sideA") || pieElems[i].getAttribute("id").match("sideB"))
            renderingOrder.sideArc.push({
              elemId: pieElems[i].getAttribute("id"),
              distBottom: distanceBottom,
              distTop: distanceTop,
              "isInside": isInside
            });
          else if (pieElems[i].getAttribute("id").match("sideC"))
            renderingOrder.sideArc.push({
              elemId: pieElems[i].getAttribute("id"),
              distBottom: distanceBottom,
              distTop: distanceTop
            });
        }
      }
      for (var i = 0; i < renderingOrder.sideArc.length; i++) {
        var pieId = renderingOrder.sideArc[i].elemId.substring(8);
        var upperArcBotm, upperArcTop;
        for (var j = 0; j < renderingOrder.upperArc.length; j++) {
          if (renderingOrder.upperArc[j].elemId === "upperArcPie" + pieId) {
            upperArcBotm = renderingOrder.upperArc[j].distBottom;
            upperArcTop = renderingOrder.upperArc[j].distTop;
          }
        }
        renderingOrder.sideArc[i].upperArcBottom = upperArcBotm;
        renderingOrder.sideArc[i].upperArcTop = upperArcTop;
      }

      renderingOrder.upperArc.sort(function (a, b) {
        return parseFloat(a.distBottom) - parseFloat(b.distBottom);
      });
      renderingOrder.lowerArc.sort(function (a, b) {
        return parseFloat(a.distBottom) - parseFloat(b.distBottom);
      });
      renderingOrder.sideArc.sort(function (a, b) {
        if (parseFloat(a.distBottom) !== parseFloat(b.distBottom))
          return parseFloat(a.distBottom) - parseFloat(b.distBottom);
        else if (parseFloat(a.upperArcTop) !== parseFloat(b.upperArcTop))
          return parseFloat(b.upperArcTop) - parseFloat(a.upperArcTop);
        else if (parseFloat(a.upperArcBottom) !== parseFloat(b.upperArcBottom))
          return parseFloat(a.upperArcBottom) - parseFloat(b.upperArcBottom);
        else
          return parseFloat(a.isInside) - parseFloat(b.isInside);
      });


      function reDraw(elemId) {
        var elem = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #" + elemId);
        if (elem) elem.parentNode.removeChild(elem);
        document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D").appendChild(elem);
      }

      for (var i = renderingOrder.lowerArc.length - 1; i >= 0; i--)
        reDraw(renderingOrder.lowerArc[i].elemId);
      for (var i = renderingOrder.sideArc.length - 1; i >= 0; i--)
        reDraw(renderingOrder.sideArc[i].elemId);
      for (var i = renderingOrder.upperArc.length - 1; i >= 0; i--)
        reDraw(renderingOrder.upperArc[i].elemId);

    } catch (ex) {
      $SC.handleError(ex);
    }
  } /*End resetOrdering()*/

  function is_in_triangle(px, py, ax, ay, bx, by, cx, cy) {
    /*credit: http://www.blackpawn.com/texts/pointinpoly/default.html*/
    var v0 = [cx - ax, cy - ay];
    var v1 = [bx - ax, by - ay];
    var v2 = [px - ax, py - ay];

    var dot00 = (v0[0] * v0[0]) + (v0[1] * v0[1]);
    var dot01 = (v0[0] * v1[0]) + (v0[1] * v1[1]);
    var dot02 = (v0[0] * v2[0]) + (v0[1] * v2[1]);
    var dot11 = (v1[0] * v1[0]) + (v1[1] * v1[1]);
    var dot12 = (v1[0] * v2[0]) + (v1[1] * v2[1]);

    var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);

    var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    return ((u >= 0) && (v >= 0) && (u + v < 1)) ? 1 : 0;
  }

  function getArcCenter(bBox) {
    return {
      x: (bBox.x + (bBox.width / 2)),
      y: (bBox.y + (bBox.height / 2))
    };
  }

  function getArcBottomCenter(bBox) {
    return {
      x: (bBox.x + (bBox.width / 2)),
      y: (bBox.y + bBox.height)
    };
  }

  function getArcTopCenter(bBox) {
    return {
      x: (bBox.x + (bBox.width / 2)),
      y: bBox.y
    };
  }

  function resetTextPos() {
    var titleWidth = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtTitleGrp #txtTitle").getComputedTextLength();
    var subTitleWidth = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtTitleGrp #txtSubtitle").getComputedTextLength();

    var txtTitle = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtTitleGrp #txtTitle");
    txtTitle.setAttribute("x", (PAGE_DATA.svgCenter.x - (titleWidth / 2)));
    txtTitle.setAttribute("y", (PAGE_DATA.svgCenter.y - (200)));

    var txtSubtitle = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtTitleGrp #txtSubtitle");
    txtSubtitle.setAttribute("x", (PAGE_DATA.svgCenter.x - (subTitleWidth / 2)));
    txtSubtitle.setAttribute("y", (PAGE_DATA.svgCenter.y - (175)));


    for (var pieIndex = 0; pieIndex < PAGE_DATA.uniqueDataSet.length; pieIndex++) {
      var pieData, elemId = "pie" + pieIndex;
      for (var i = 0; i < PAGE_DATA.pieSet.length; i++) {
        if (PAGE_DATA.pieSet[i].id === elemId) {
          pieData = PAGE_DATA.pieSet[i];
        }
      }
      var textPos = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x, PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.pieWidth + 100, PAGE_DATA.pieHeight + 50, pieData.midAngle), pieData.midAngle);
      var txtPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtPie" + pieIndex);
      var txtPercentPie = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtPercentPie" + pieIndex);
      var txtBoundingRect = txtPie.getBoundingClientRect(); //.getBBox();
      var txtContainer = document.querySelector("#" + PAGE_OPTIONS.targetElem + " #pieChart3D #txtContainer" + pieIndex);
      txtContainer.setAttribute("x", textPos.x - (txtBoundingRect.width / 2));
      txtContainer.setAttribute("y", textPos.y + (txtBoundingRect.height / 2));
      txtContainer.setAttribute("width", txtBoundingRect.width);
      txtContainer.setAttribute("height", 5);

      txtPie.setAttribute("x", textPos.x - (txtBoundingRect.width / 2));
      txtPie.setAttribute("y", textPos.y);

      txtPercentPie.setAttribute("x", textPos.x - (txtBoundingRect.width / 2));
      txtPercentPie.setAttribute("y", textPos.y + (txtBoundingRect.height / 2) + 25);
      txtPercentPie.setAttribute("width", txtBoundingRect.width);
      txtPercentPie.setAttribute("height", 5);
    }
  } /*End resetTextPos()*/


  function describeRect(p1, p2, p3, p4) {

    var d = [
      "M", p1.x, p1.y,
      "L", p2.x, p2.y,
      "L", p3.x, p3.y,
      "L", p4.x, p4.y,
      "Z"
    ].join(" ");

    return d;
  } /*End describeRect()*/

  function describeArcFill(arc1, arc2) {
    var revArc2 = $SC.geom.describeEllipticalArc(arc2["center"].x, arc2["center"].y, arc2.rx, arc2.ry, arc2.endAngle, arc2.startAngle, 1);
    var d = [
      "M", arc1["start"].x, arc1["start"].y,
      "A", arc1["arc"],
      "L", arc2["end"].x, arc2["end"].y,
      "A", revArc2["arc"],
      "Z"
    ].join(" ");

    return d;
  } /*End describeArcFill()*/


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
          "value": PAGE_OPTIONS.dataSet[i].value
        });
      } else {
        PAGE_DATA.uniqueDataSet[j] = {
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

  init();
}; /*End of PieChart3D()*/