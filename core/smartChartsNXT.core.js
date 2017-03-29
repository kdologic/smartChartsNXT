/*
 * smartChartsNXT.core.js
 * @CreatedOn: 06-Jul-2016
 * @LastUpdated: 29-Dec-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.1
 * @description:SmartChartsNXT Core Library components. That contains common functionality.
 */

window.SmartChartsNXT = new function () {
  window.$SC = this;
  this.libPath = "/lib";


  var CHART_MAP = {
    "PieChart3D": this.libPath + "/pieChart3d/pieChart3d.js",
    "PieChart": this.libPath + "/pieChart2d/pieChart2d.js",
    "AreaChart": this.libPath + "/areaChart/areaChart.js",
    "LineChart": this.libPath + "/lineChart/lineChart.js",
    "ColumnChart": this.libPath + "/columnChart/columnChart.js",
    "StepChart": this.libPath + "/stepChart/stepChart.js",
    "DonutChart": this.libPath + "/donutChart/donutChart.js"
  };

  function initCore() {
    $SC.ui = {};
    $SC.geom = {};
    $SC.util = {};

    addFont();
    appendChartTypeNamespace();
  } /*End initLib()*/

  initCore();
  var preLoaderImg = "<svg width='135' height='140' viewBox='0 0 135 140' xmlns='http://www.w3.org/2000/svg' fill='#555'> <rect y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='30' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='60' width='15' height='140' rx='6'> <animate attributeName='height' begin='0s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='90' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='120' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect></svg>";

  function appendChartTypeNamespace() {
    for (var chartType in CHART_MAP) {
      (function (cType) {
        $SC[chartType] = function (opts) {
          var targetElem = document.querySelector("#" + opts.targetElem);
          /*Show loader before showing the chart*/
          var strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
            "viewBox='0 0 " + targetElem.offsetWidth + " " + targetElem.offsetHeight + "'" +
            "version='1.1'" +
            "width='" + targetElem.offsetWidth + "'" +
            "height='" + targetElem.offsetHeight + "'" +
            "id='preLoader_" + opts.targetElem + "'" +
            "style='background:none;-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
            "><g id='container' transform='translate(" + ((targetElem.offsetWidth / 2) - 27) + "," + ((targetElem.offsetHeight / 2) - 25) + ") scale(0.4,0.4)'></g> <\/svg>";

          document.getElementById(opts.targetElem).innerHTML = "";
          document.getElementById(opts.targetElem).insertAdjacentHTML("beforeend", strSVG);
          document.querySelector("#" + opts.targetElem + " #preLoader_" + opts.targetElem + " #container").insertAdjacentHTML("beforeend", preLoaderImg);

          loadLib(CHART_MAP[cType], function () {
            callChart();

            function callChart() {
              if (opts.targetElem) {

                if (targetElem.offsetWidth === 0 && targetElem.offsetHeight === 0) {
                  setTimeout(function () {
                    callChart();
                  }, 500);
                } else {
                  $SC[cType].call(this, opts);
                }
              }
            }

          });
        };
      })(chartType);
    }
  } /*End appendChartTypeNamespace()*/


  var loadLib = function (libURL, onSuccess, onError) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        try {
          eval(xhr.responseText);
          if (typeof onSuccess === "function")
            onSuccess.call(this);
        } catch (ex) {
          if (typeof onError === "function")
            onError.call(this);
          $SC.handleError(ex, "Error in load Library [" + libURL + "]");
        }
      }
    };
    xhr.open("GET", libURL, true);
    xhr.send();
  };



  this.ready = function (successBack) {
    if (typeof successBack === "function") {
      successBack.call(this);
    }

  }; /*End ready()*/

  this.handleError = function (ex, msg) {
    console.log(ex);
    console.error("SmartChartsNXT:" + msg);
  }; /*End handleError()*/

  /*Depricated will remove soon*/
  this.addFont = function () {
    var fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
    fontLink.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(fontLink);
  }; /*End addFont()*/

  function addFont() {
    var fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
    fontLink.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(fontLink);
  }; /*End addFont()*/

  this.appendWaterMark = function (targetElem, scaleX, scaleY) {
    var strSVG = "<g id='smartCharts-watermark'>";
    strSVG += "  <text fill='#717171' x='" + (10 - (scaleX / 4)) + "' y='" + (25 - (scaleY / 2)) + "' font-size='10' font-family='Lato' style='cursor: pointer;' onclick=\"window.open('http://www.smartcharts.cf')\">Powered by SmartChartsNXT</text>";
    strSVG += "  </g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);
  }; /*End appendWaterMark()*/


  /*-----------SmartChartsNXT UI functions------------- */

  this.ui.dropShadow = function (parentID) {
    var shadow = document.querySelectorAll("#" + parentID + " svg #" + parentID + "-smartCharts-dropshadow");
    if (shadow.length < 1) {
      var strSVG = "";
      strSVG = "<filter id='" + parentID + "-smartCharts-dropshadow' height='130%'>";
      strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>";
      strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>";
      strSVG += "  <feMerge>";
      strSVG += "    <feMergeNode/>";
      strSVG += "    <feMergeNode in='SourceGraphic'/>";
      strSVG += "  </feMerge>";
      strSVG += "</filter>";
      document.querySelector("#" + parentID + " svg").insertAdjacentHTML("beforeend", strSVG);
    }
    return "url(#" + parentID + "-smartCharts-dropshadow)";
  }; /*End appendDropShadow()*/

  /*function used to show/hide tooltip*/
  this.ui.toolTip = function (targetElem, cPoint, color, line1, line2) {
    if (typeof cPoint === "string" && cPoint === "hide") {
      var toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");
      if (toolTip) toolTip.style.display = "none";
      return;
    }
    var containerDiv = document.querySelector("#" + targetElem);
    var svgWidth = containerDiv.offsetWidth,
      svgHeight = containerDiv.offsetHeight;
    var strContents = "";

    /*Prevent call-by-sharing*/
    if (cPoint)
      cPoint = new $SC.geom.Point(cPoint.x, cPoint.y);

    if (line2 === "html") {
      strContents += line1;
    } else {
      strContents += "<table>";
      strContents += "<tr><td>" + line1 + "</td></tr>";
      if (line2)
        strContents += "<tr><td><b>" + line2 + "</b></td></tr>";
      strContents += "</table>";
    }

    var toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");
    if (toolTip) toolTip.parentNode.removeChild(toolTip);

    var strSVG = "<g id='toolTipContainer' pointer-events='none'>";
    strSVG += "  <path id='toolTip'  filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
    strSVG += "  <g id='txtToolTipGrp' fill='#717171' font-family='Lato' >";

    strSVG += "<foreignobject id='toolTipHTML'>";
    strSVG += "<body xmlns='http://www.w3.org/1999/xhtml'>";
    strSVG += strContents;
    strSVG += "</body>";

    strSVG += "  </g>";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);
    toolTip = document.querySelector("#" + targetElem + " svg #toolTipContainer");

    var lineHeight = 20;
    var padding = 10;
    padding = 10;
    var temp = document.createElement("div");
    temp.innerHTML = strContents;
    temp.style.display = "inline-block";
    temp.style.visibility = 'hidden';
    document.getElementsByTagName("body")[0].appendChild(temp);
    var containBox = {
      width: temp.offsetWidth + 6,
      height: temp.offsetHeight
    };
    if (temp) temp.parentNode.removeChild(temp);
    var txtWidth = containBox.width;
    lineHeight = containBox.height;

    cPoint.y -= 20;
    var topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - lineHeight - 10 - padding);
    var width = txtWidth + (2 * padding),
      height = lineHeight + (2 * padding);
    var d = [
      "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
      "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
      "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
      "L", cPoint.x + 10, cPoint.y,
      "L", cPoint.x, cPoint.y + 10,
      "L", cPoint.x - 10, cPoint.y,
      "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
      "Z"
    ];
    if (topLeft.x + width > svgWidth) {
      cPoint.x -= 20;
      cPoint.y += 20;
      topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - (lineHeight) - 10 - (padding));
      topLeft.x -= (width / 2);
      topLeft.y += (height / 2);
      d = [
        "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
        "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
        "L", cPoint.x, cPoint.y - 10,
        "L", cPoint.x + 10, cPoint.y,
        "L", cPoint.x, cPoint.y + 10,
        "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
        "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
        "Z"
      ];
    } else if (topLeft.y < 0) {
      cPoint.y += 40;
      topLeft = new $SC.geom.Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y);
      d = [
        "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
        "L", cPoint.x - 10, cPoint.y,
        "L", cPoint.x, cPoint.y - 10,
        "L", cPoint.x + 10, cPoint.y,
        "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
        "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
        "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
        "Z"
      ];
    }

    var toolTipGrp = toolTip.querySelector("#txtToolTipGrp");
    var tooTipHTML = toolTipGrp.querySelector("#toolTipHTML"),
      textPos;
    if (tooTipHTML) {
      textPos = new $SC.geom.Point(topLeft.x + 5, topLeft.y + 5);
      tooTipHTML.setAttribute("x", textPos.x);
      tooTipHTML.setAttribute("y", textPos.y);
      tooTipHTML.setAttribute("width", containBox.width + padding);
      tooTipHTML.setAttribute("height", containBox.height + padding);
    }
    document.querySelector("#" + targetElem + " svg #toolTip").setAttribute("d", d.join(" "));
    document.querySelector("#" + targetElem + " svg #toolTip").setAttribute("stroke", color);

    toolTip.style.display = "block";

  }; /*End showToolTip()*/


  /* Get point in global SVG space*/
  this.ui.cursorPoint = function (targetElem, evt) {
    var svg = document.querySelector("#" + targetElem + " svg");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX;
    pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }; /*End cursorPoint()*/


  this.ui.appendMenu2 = function (targetElem, svgCenter, scaleX, scaleY) {
    scaleX = scaleX || 1;
    scaleY = scaleY || 1;
    var strSVG = "";
    strSVG += "<g id='smartCharts-menu2'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='" + $SC.geom.describeRoundedRect(((svgCenter.x * 2) - 50 + (scaleX / 2)), (25 - (scaleY / 2)), 35, 30, 5).join(" ") + "' filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke-width='0.5' stroke='#717171' style='cursor:pointer;' />";
    strSVG += " <g class='vBarIcon'>";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (32 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (32 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (39 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (39 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += "  <line  x1='" + ((svgCenter.x * 2) - 45 + (scaleX / 2)) + "' y1='" + (46 - (scaleY / 2)) + "' x2='" + ((svgCenter.x * 2) - 20 + (scaleX / 2)) + "' y2='" + (46 - (scaleY / 2)) + "' style='stroke:#333;stroke-width:1;cursor:pointer;' />";
    strSVG += " </g>";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

    document.querySelector("#" + targetElem + " #smartCharts-menu2").addEventListener("click", onMenuClick);

    function onMenuClick(e) {
      e.stopPropagation();
      e.preventDefault();
      var strSVG = "<g id='smartsCharts-loader-container'>";
      strSVG += "<rect x='0' y='0' width='" + (svgCenter.x * 2) + "' height='" + (svgCenter.y * 2) + "' fill='#777' stroke='none' stroke-width='0' opacity='0.5'/>";
      strSVG += "<g id='loader-icon' style='display:none;' transform='translate(" + svgCenter.x + "," + (svgCenter.y - 40) + ") scale(0.6,0.6)'><rect x='0' y='0' width='100' height='100' fill='none' class='bk'></rect><g transform='translate(-20,-20)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='90 50 50' to='0 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g><g transform='translate(20,20) rotate(15 50 50)'><path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#fff'><animateTransform attributeName='transform' type='rotate' from='0 50 50' to='90 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path></g>";
      strSVG += "</g></g>";
      document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

      var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
      if (menuSidePanel.length > 0) {
        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
      } else {
        var menuItemWidth = 100,
          menuHeight = 30,
          offSetX = 10,
          offSetY = 20; //offSetX = ((svgCenter.x)-350+(scaleX/2)),offSetY = (25-(scaleY/2));
        strSVG = "  <g id='smartCharts-menu-panel'>"; //(svgCenter.x*2)-50-offSetX
        strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + $SC.geom.describeRoundedRect(offSetX, offSetY, ((svgCenter.x * 2) - (2 * offSetX)), menuHeight, menuHeight / 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

        strSVG += " <rect class='main-menu-item save-as' x='" + (offSetX + 15) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += " <text class='main-menu-item save-as' fill='#555' x='" + (offSetX + 30) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;'>Save As...</text>";

        strSVG += " <rect class='main-menu-item print' x='" + (offSetX + menuItemWidth + 17) + "' y='" + offSetY + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += " <text class='main-menu-item print' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + 20) + "' font-family='Lato' style='cursor:pointer;' >Print</text>";


        strSVG += " <g class='main-menu-item crossIcon'> ";
        var d = $SC.geom.describeRoundedRect(((svgCenter.x * 2) - (2 * offSetX) - 28), offSetY + 1, 28, 28, 5);
        strSVG += " <path  fill='red' d='" + d.join(" ") + "' stroke-width='1' stroke='none' fill-opacity='0.5' style='cursor:pointer;'/>";
        strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 28) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 3) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
        strSVG += "  <line  x1='" + (((svgCenter.x * 2) - (2 * offSetX) - 25)) + "' y1='" + (offSetY + 3) + "' x2='" + ((svgCenter.x * 2) - (2 * offSetX) - 3) + "' y2='" + (offSetY + 28) + "' stroke-width='2' stroke='#be0d0d' style='cursor:pointer;' />";
        strSVG += " </g>";

        strSVG += "  </g>";
        document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

        var menuPanel = document.querySelector("#" + targetElem + " svg #smartCharts-menu-panel");
        menuPanel.setAttribute("transform", "translate(" + ((svgCenter.x * 2) - offSetX) + ",0)");

        /*Slide menu left direction*/
        var slideOffset = ((svgCenter.x * 2) - offSetX);
        var shiftBy = 0,
          shiftOffset = 8;
        var intervalId = setInterval(function () {
          if (slideOffset < 0) {
            shiftBy += shiftOffset;
            slideOffset += shiftBy;
            shiftOffset /= 2;
          } else {
            shiftBy += shiftOffset;
            slideOffset -= shiftBy;
            if (slideOffset < 0) {
              shiftBy = 0;
            }
          }
          if (menuPanel)
            menuPanel.setAttribute("transform", "translate(" + (slideOffset) + ",0)");
          else
            clearInterval(intervalId);
          if (slideOffset === 0 || shiftOffset < 0.1) {
            menuPanel.setAttribute("transform", "translate(0,0)");
            clearInterval(intervalId);
          }
        }, 60);

        var closeMenu = document.querySelector("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.crossIcon");
        closeMenu.addEventListener("click", function () {
          var loader = document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container");
          loader.parentNode.removeChild(loader);
          var menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
          menuPanel.parentNode.removeChild(menuPanel);
        }, false);

        var printMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.print");
        for (var i = 0; i < printMenu.length; i++) {
          printMenu[i].addEventListener("click", function () {
            e.stopPropagation();
            e.preventDefault();

            document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";
            var opts = {
              width: svgCenter.x * 2,
              height: svgCenter.y * 2,
              srcElem: "#" + targetElem + " svg",
              saveSuccess: function () {
                document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);
              }
            };
            var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
            if (menuSidePanel.length > 0)
              menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
            document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
            $SC.util.printChart(opts);

          }, false);
        }


        var saveAsMenu = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel .main-menu-item.save-as");
        for (var s = 0; s < saveAsMenu.length; s++) {
          saveAsMenu[s].addEventListener("click", onSaveAs, false);
        }


        function onSaveAs(e) {
          e.stopPropagation();
          e.preventDefault();
          var subMenuOffsetY = 100;
          var saveAsMenu = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu");
          if (saveAsMenu.length > 0) {
            saveAsMenu[0].parentNode.removeChild(saveAsMenu[0]);
            return;
          }

          var otherMenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel .sub-menu");
          for (var i = 0; i < otherMenus.length; i++)
            otherMenus[0].parentNode.removeChild(otherMenus[0]);

          var subMenuCurveX = (offSetX + (menuItemWidth * 4) + 23);
          if (svgCenter.x <= 250)
            subMenuCurveX = (offSetX + (menuItemWidth * 2) + 19);


          var submenuOffsetPath = [
            "M", (offSetX + 15), (offSetY + menuHeight),
            "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight),
            "L", (offSetX + menuItemWidth + 15), (offSetY + menuHeight + (subMenuOffsetY / 2)),
            "L", subMenuCurveX, (offSetY + menuHeight + subMenuOffsetY),
            "L", (offSetX + 15), (offSetY + menuHeight + subMenuOffsetY),
            "Z"
          ];


          strSVG = "  <g id='smartCharts-saveas-submenu' class='sub-menu'>";
          strSVG += "  <path id='smartCharts-menu-container'  stroke='#09cef3'  fill='white' d='" + $SC.geom.describeRoundedRect(offSetX + 15, (offSetY + menuHeight + subMenuOffsetY), (svgCenter.x <= 250 ? (menuItemWidth * 2) + 4 : (menuItemWidth * 4)), (svgCenter.x <= 250 ? (menuHeight * 3) : menuHeight), 2).join(" ") + "' stroke-width='1' fill-opacity='0.95'></path>";

          strSVG += "  <path stroke='#09cef3'  fill='#555' d='" + submenuOffsetPath.join(" ") + "' stroke-width='0' fill-opacity='0.4'></path>";

          strSVG += " <rect class='sub-menu-item' save-as='jpeg' x='" + (offSetX + 15) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
          strSVG += " <text class='sub-menu-item' save-as='jpeg' fill='#555' x='" + (offSetX + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >JPG</text>";

          strSVG += " <rect class='sub-menu-item' save-as='png' x='" + (offSetX + menuItemWidth + 17) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
          strSVG += " <text class='sub-menu-item' save-as='png' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PNG</text>";

          if (svgCenter.x <= 250) {
            strSVG += " <rect class='sub-menu-item' save-as='svg' x='" + (offSetX + 15) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
            strSVG += " <text class='sub-menu-item' save-as='svg' fill='#555' x='" + (offSetX + 45) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;'>SVG</text>";

            strSVG += " <rect class='sub-menu-item' save-as='pdf' x='" + (offSetX + menuItemWidth + 17) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
            strSVG += " <text class='sub-menu-item' save-as='pdf' fill='#555' x='" + (offSetX + menuItemWidth + 45) + "' y='" + (offSetY + (3 * menuHeight) + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PDF</text>";
          } else {
            strSVG += " <rect class='sub-menu-item' save-as='svg' x='" + (offSetX + (menuItemWidth * 2) + 19) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
            strSVG += " <text class='sub-menu-item' save-as='svg' fill='#555' x='" + (offSetX + (menuItemWidth * 2) + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;'>SVG</text>";

            strSVG += " <rect class='sub-menu-item' save-as='pdf' x='" + (offSetX + menuItemWidth * 3 + 21) + "' y='" + (offSetY + menuHeight + subMenuOffsetY) + "' width='" + menuItemWidth + "' height='" + menuHeight + "' fill='#09cef3' stroke-width='1' stroke='none' fill-opacity='1' style='cursor:pointer;'/>";
            strSVG += " <text class='sub-menu-item' save-as='pdf' fill='#555' x='" + (offSetX + (menuItemWidth * 3) + 45) + "' y='" + (offSetY + menuHeight + subMenuOffsetY + 20) + "' font-family='Lato' style='cursor:pointer;' >PDF</text>";
          }
          strSVG += "  </g>";

          document.querySelector("#" + targetElem + " svg #smartCharts-menu-panel").insertAdjacentHTML("beforeend", strSVG);

          var saveAsSubmenus = document.querySelectorAll("#" + targetElem + " svg #smartCharts-menu-panel #smartCharts-saveas-submenu .sub-menu-item");
          for (var i = 0; i < saveAsSubmenus.length; i++) {
            saveAsSubmenus[i].addEventListener("click", function (e) {
              e.stopPropagation();
              e.preventDefault();

              document.querySelector("#" + targetElem + " svg #smartsCharts-loader-container #loader-icon").style.display = "block";

              var saveAsType = e.target.getAttribute("save-as");
              var opts = {
                width: svgCenter.x * 2,
                height: svgCenter.y * 2,
                srcElem: "#" + targetElem + " svg",
                type: saveAsType,
                saveSuccess: function () {
                  document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "visible";
                  var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
                  if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);
                }
              };
              var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
              if (menuSidePanel.length > 0)
                menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
              document.querySelector("#" + targetElem + " #smartCharts-menu2").style.visibility = "hidden";
              $SC.util.saveAsImage(opts);

            }, false);
          }
        } /*End onSaveAs()*/ ;

      }

    }; /*End onMenuClick()*/

  }; /*End appendMenu2()*/


  this.ui.appendMenu = function (targetElem, svgCenter) {
    var strSVG = "";
    strSVG += "<g id='smartCharts-menu'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='" + $SC.geom.describeRoundedRect(((svgCenter.x * 2) - 50), 20, 35, 30, 5).join(" ") + "' filter='" + $SC.ui.dropShadow(targetElem) + "' fill='white' stroke-width='0.5' stroke='#717171' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='30' x2='" + ((svgCenter.x * 2) - 20) + "' y2='30' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='35' x2='" + ((svgCenter.x * 2) - 20) + "' y2='35' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='" + ((svgCenter.x * 2) - 45) + "' y1='40' x2='" + ((svgCenter.x * 2) - 20) + "' y2='40' style='stroke:#333;stroke-width:1' />";
    strSVG += "</g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

    /*Bind menu events*/

    document.querySelector("#" + targetElem + " #smartCharts-menu ").addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      var offSetX = 150,
        offSetY = 60,
        intervalId;
      var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
      if (menuSidePanel.length > 0) {
        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
      } else {
        strSVG = "  <g id='smartCharts-menu-panel'>";
        strSVG += "  <rect class='menu-panel-elem' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (offSetY) + "' width='" + (offSetX) + "' height='" + (svgCenter.y * 2 - offSetY - 2) + "' fill='white' stroke-width='1' stroke='#333' />";
        strSVG += "  <rect class='menu-panel-elem' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#EEF' stroke-width='0' stroke='#333' />";
        strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (offSetY + 32) + "' font-family='Lato' >Download As...</text>";

        strSVG += "  <rect class='menu-panel-menu' save-as='jpeg' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (2 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";
        strSVG += "  <rect class='menu-panel-menu' save-as='png' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (3 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";
        strSVG += "  <rect class='menu-panel-menu' save-as='svg' x='" + ((svgCenter.x * 2) - offSetX) + "' y='" + (4 * offSetY) + "' width='" + (offSetX - 1) + "' height='" + (offSetY) + "' fill='#fff' stroke-width='0' stroke='#333' />";


        strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (2 * offSetY + 32) + "' font-family='Lato' >JPEG</text>";
        strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (3 * offSetY + 32) + "' font-family='Lato' >PNG</text>";
        strSVG += "  <text fill='#717171' x='" + ((svgCenter.x * 2) - offSetX + 25) + "' y='" + (4 * offSetY + 32) + "' font-family='Lato' >SVG</text>";

        strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (3 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (3 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (4 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (4 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (5 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (5 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='" + ((svgCenter.x * 2) - offSetX + 15) + "' y1='" + (6 * offSetY) + "' x2='" + (svgCenter.x * 2 - 15) + "' y2='" + (6 * offSetY) + "' style='stroke:#eee;stroke-width:1' />";

        strSVG += "  </g>";
        document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);

        /*submenu bind event*/
        var menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
        var submenus = menuPanel.querySelectorAll(".menu-panel-menu");
        for (var i = 0; i < submenus.length; i++) {
          submenus[i].addEventListener("click", function (e) {
            e.stopPropagation();
            e.preventDefault();
            var saveAsType = e.target.getAttribute("save-as");
            var opts = {
              width: svgCenter.x * 2,
              height: svgCenter.y * 2,
              srcElem: "#" + targetElem + " svg",
              type: saveAsType,
              saveSuccess: function () {
                document.querySelector("#" + targetElem + " #smartCharts-menu").style.visibility = "visible";
              }
            };
            var menuSidePanel = document.querySelectorAll("#" + targetElem + " #smartCharts-menu-panel");
            if (menuSidePanel.length > 0)
              menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
            document.querySelector("#" + targetElem + " #smartCharts-menu").style.visibility = "hidden";
            $SC.util.saveAsImage(opts);

          }, false);

          submenus[i].addEventListener("mouseenter", function (e) {
            e.target.setAttribute("fill", "#d7d7ed");
          }, false);
          submenus[i].addEventListener("mouseleave", function (e) {
            e.target.setAttribute("fill", "#fff");
          }, false);
        }

        menuPanel.style["transform"] = "translate(" + offSetX + "px," + 0 + "px)";

        var slideOffset = offSetX;
        var shiftBy = 1.1;
        intervalId = setInterval(function () {
          if (slideOffset < 0)
            slideOffset = Math.round(slideOffset) + 4;
          else {
            shiftBy += Math.pow(1.1, 2);
            slideOffset -= shiftBy;
          }
          menuPanel = document.querySelector("#" + targetElem + " #smartCharts-menu-panel");
          if (menuPanel)
            menuPanel.style["transform"] = "translate(" + (slideOffset) + "px," + 0 + "px)";
          else
            clearInterval(intervalId);
          if (slideOffset === 0)
            clearInterval(intervalId);
        }, 50);
      }
    }, false);
  }; /*End appendMenu()*/


  /*-----------SmartChartsNXT Utility functions------------- */

  this.util.mergeRecursive = function (obj1, obj2) {
    //iterate over all the properties in the object which is being consumed
    for (var p in obj2) {
      // Property in destination object set; update its value.
      if (obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined") {
        $SC.util.mergeRecursive(obj1[p], obj2[p]);
      } else {
        //We don't have that level in the heirarchy so add it
        obj1[p] = obj2[p];
      }
    }
  }; /*End mergeRecursive()*/

  this.util.extends = function (source1, source2) {

    /*
     * Properties from the Souce1 object will be copied to Source2 Object.
     * Note: This method will return a new merged object, Source1 and Source2 original values will not be replaced.
     * */
    var mergedJSON = Object.create(source2); // Copying Source2 to a new Object

    for (var attrname in source1) {
      if (mergedJSON.hasOwnProperty(attrname)) {
        if (source1[attrname] != null && source1[attrname].constructor == Object) {
          /*
           * Recursive call if the property is an object,
           * Iterate the object and set all properties of the inner object.
           */
          mergedJSON[attrname] = $SC.util.mergeRecursive(source1[attrname], mergedJSON[attrname]);
        }

      } else { //else copy the property from source1
        mergedJSON[attrname] = source1[attrname];

      }
    }

    return mergedJSON;
  }; /*End mergeRecursive()*/



  this.util.getColor = function (index, ranbowFlag) {
    var Colors = {};
    Colors.names = {
      "light-blue": "#95CEFF",
      "light-orange": "#ff9e01",
      "olive-green": "#b0de09",
      "coral": "#FF7F50",
      "light-seagreen": "#20B2AA",
      "gold": "#ffd700",
      "light-slategray": "#778899",
      "rust": "#F56B19",
      "mat-violet": "#B009DE",
      "violet": "#DE09B0",
      "dark-Orange": "#FF8C00",
      "mat-blue": "#09b0de",
      "mat-green": "#09DEB0",
      "ruscle-red": "#d9534f",
      "dark-turquoise": "#00CED1",
      "orchid": "#DA70D6",
      "length": 16
    };
    Colors.rainbow = {
      "red": "#ff0f00",
      "dark-orange": "#ff6600",
      "light-orange": "#ff9e01",
      "dark-yello": "#fcd202",
      "light-yellow": "#f8ff01",
      "olive-green": "#b0de09",
      "green": "#04d215",
      "sky-blue": "#0d8ecf",
      "light-blue": "#0d52d1",
      "blue": "#2a0cd0",
      "violet": "#8a0ccf",
      "pink": "#cd0d74",
      "length": 12
    };
    var result;
    var count = 0;
    if (ranbowFlag) {
      index = index % 12;
      Colors.rainbow.length;
      for (var prop in Colors.rainbow)
        if (index === count++)
          result = Colors.rainbow[prop];
    } else {
      index = index % Colors.names.length;
      for (var prop in Colors.names)
        if (index === count++)
          result = Colors.names[prop];
    }

    return result;
  }; /*End getColor()*/

  this.util.colorLuminance = function (hex, lum) {
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
  }; /*End colorLuminance()*/

  this.util.saveAsImage = function (opts) {
    /*opts = {width:800, height:500, srcElem:"", type:"jpeg || png || svg", saveSuccess:null};*/
    var svgString;
    var loaderContainter = document.querySelector(opts.srcElem + " #smartsCharts-loader-container");
    if (loaderContainter) loaderContainter.parentNode.removeChild(loaderContainter);

    var bgColor = document.querySelector(opts.srcElem).style.background;

    if ((opts.type === "jpeg" || opts.type === "pdf") && (bgColor === "none" || bgColor.match(/transparent/gi))) {
      document.querySelector(opts.srcElem).style.background = "#FFF";
      svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
      document.querySelector(opts.srcElem).style.background = "none";
    } else {
      svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
    }
    document.querySelector(opts.srcElem).appendChild(loaderContainter);

    var img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));

    img.onload = function () {
      var today = new Date();
      var tzoffset = (today).getTimezoneOffset() * 60000; //offset in milliseconds
      today = (new Date(Date.now() - tzoffset));

      if (opts.type !== "svg") {
        var canvas = document.createElement("canvas");
        canvas.width = opts.width;
        canvas.height = opts.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      }
      if (opts.printFlag === true) {
        var iframe = document.createElement("iframe");
        iframe.name = "chartFrame";
        iframe.id = "chartFrame";
        iframe.width = opts.width;
        iframe.height = opts.height;
        document.body.appendChild(iframe);
        iframe = document.querySelector('#chartFrame');
        iframe.contentWindow.document.write("<body><img style='width:100%;height:auto;' src='" + canvas.toDataURL("image/jpeg") + "' /></body.");
        window.frames["chartFrame"].focus();
        window.frames["chartFrame"].print();
        iframe.parentNode.removeChild(iframe);
        if (typeof opts.saveSuccess === "function")
          opts.saveSuccess.call(this);

      } else if (opts.type === "pdf") {
        var head = document.getElementsByTagName("head")[0];
        var pdfLib = document.createElement("script");
        pdfLib.type = "text/javascript";
        pdfLib.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.2.61/jspdf.min.js";
        pdfLib.onload = function () {
          var imgAsURL = canvas.toDataURL("image/jpeg");
          var doc = new jsPDF("l", "pt", "a4");
          doc.addImage(imgAsURL, 'JPEG', 0, 0);
          doc.output('save', 'smartCharts_' + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type);
          if (typeof opts.saveSuccess === "function")
            opts.saveSuccess.call(this);
        };
        head.appendChild(pdfLib);

      } else {
        var imgAsURL = (opts.type === "svg") ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString) : canvas.toDataURL("image/" + opts.type);
        var link = document.createElement("a");
        link.href = imgAsURL;
        link.download = "smartCharts_" + today.toISOString().split(".")[0].replace("T", "_") + "." + opts.type;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (typeof opts.saveSuccess === "function")
          opts.saveSuccess.call(this);
      }
    };

  }; /*End saveAsImage()*/

  this.util.printChart = function (opts) {
    /*opts = {width:800, height:500, srcElem:"", saveSuccess:null};*/
    opts.printFlag = true;
    opts.type = "pdf";
    $SC.util.saveAsImage(opts);
  }; /*End printChart()*/

  this.util.assemble = function (literal, params) {
    return new Function(params, "return `" + literal + "`;"); // TODO: Proper escaping
  } /*End assemble()*/

  /*---------------Related mathematical shapes---------------------------*/

  this.geom.describeRoundedRect = function (x, y, width, height, radius) {
    return [
      "M", (x + radius), y, "h", (width - (2 * radius)), "a", radius, radius, " 0 0 1 ", radius, radius, "v", (height - (2 * radius)), "a", radius, radius, " 0 0 1 ", -radius, radius, "h", ((2 * radius) - width), "a", radius, radius, " 0 0 1 ", -radius, -radius, "v", ((2 * radius) - height), "a", radius, radius, " 0 0 1 ", radius, -radius, "z"
    ];
  }; /*End describeRoundedRect()*/

  this.geom.describeBezireArc = function (point1, point2, point3) {
    //var mid1 = getMidPoint(point1,point2);
    //var mid11 = getMidPoint(mid1,point2);
    var mid2 = $SC.geom.getMidPoint(point2, point3);
    //var mid21 = getMidPoint(point2,mid2);

    var c = [
      "C",
      point2.x,
      point2.y,
      point2.x,
      point2.y,
      mid2.x,
      mid2.y
    ];
    return c;
  }; /*End describeBezireArc()*/

  this.geom.createDot = function (center, color, radious, opacity, cls, targetElem, stroke, strokeWidth) {
    var svg;
    if (targetElem)
      svg = document.getElementById(targetElem);
    else
      svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.setAttribute("cx", center.x); //Set center x 
    newElement.setAttribute("cy", center.y); //Set center y 
    newElement.setAttribute("r", radious || 3); //Set radious
    newElement.setAttribute("class", cls || "dot"); //Set class
    newElement.setAttribute("stroke", stroke || "none"); //Set border color
    newElement.setAttribute("fill", color); //Set fill colour
    newElement.setAttribute("opacity", opacity || 1);
    newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
    svg.appendChild(newElement);
  }; /*End createDot()*/


  this.geom.createRect = function (left, top, width, height, color, cls, opacity, stroke, strokeWidth) {
    var svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
    newElement.setAttribute("x", left); //Set left position
    newElement.setAttribute("y", top); //Set top position
    newElement.setAttribute("width", width); //Set width
    newElement.setAttribute("height", height); //Set height
    newElement.setAttribute("stroke", stroke || "none"); //Set border color
    newElement.setAttribute("fill", color); //Set fill colour
    newElement.setAttribute("opacity", opacity || 1);
    newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
    newElement.setAttribute("class", cls || "bbox"); //Set class
    svg.appendChild(newElement);
  }; /*End createRect()*/



  this.geom.getDistanceBetween = function (point1, point2) {
    var dist = Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y)) || 0;
    return dist;
  }; /*End getDistanceBetween()*/

  this.geom.Point = function (x, y) {
    var obj = this;
    this.x = x;
    this.y = y;
    this.toString = function () {
      return "x:" + obj.x + ", y:" + obj.y;
    };
  };

  this.geom.polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }; /*End polarToCartesian()*/

  this.geom.getMidPoint = function (point1, point2) {
    return new $SC.geom.Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
  }; /*End getMidPoint()*/

  this.geom.getEllipticalRadious = function (rx, ry, angleInDegrees) {
    var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    var r = (rx * ry) / Math.sqrt(((rx * rx) * (Math.sin(angleInRadians) * Math.sin(angleInRadians))) + ((ry * ry) * (Math.cos(angleInRadians) * Math.cos(angleInRadians))));
    return r;
  }; /*End getEllipticalRadious()*/

  this.geom.describeEllipticalArc = function (cx, cy, rx, ry, startAngle, endAngle, sweepFlag) {
    var fullArc = false;
    if (startAngle % 360 === endAngle % 360) {
      endAngle--;
      fullArc = true;
    }

    var start = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx, ry, endAngle), endAngle);
    var end = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx, ry, startAngle), startAngle);
    var largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    var d = [
      "M", start.x, start.y,
      "A", rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
    ];

    if (fullArc)
      d.push("L", start.x, start.y);
    d.push("L", cx, cy, "Z");
    var path = {
      "d": d.join(" "),
      "arc": [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(" "),
      "start": start,
      "end": end,
      "center": new $SC.geom.Point(cx, cy),
      "rx": rx,
      "ry": ry,
      "startAngle": startAngle,
      "endAngle": endAngle
    };
    return path;
  }; /*End describeEllipticalArc()*/

  this.geom.checkLineIntersection = function (line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
    /* if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point*/
    var denominator, a, b, numerator1, numerator2, result = {
      x: null,
      y: null,
      onLine1: false,
      onLine2: false
    };
    denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
    if (denominator === 0) {
      return result;
    }
    a = line1StartY - line2StartY;
    b = line1StartX - line2StartX;
    numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
    numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
    a = numerator1 / denominator;
    b = numerator2 / denominator;

    /* if we cast these lines infinitely in both directions, they intersect here:*/
    result.x = line1StartX + (a * (line1EndX - line1StartX));
    result.y = line1StartY + (a * (line1EndY - line1StartY));
    /*
    /* it is worth noting that this should be the same as:
    x = line2StartX + (b * (line2EndX - line2StartX));
    y = line2StartX + (b * (line2EndY - line2StartY));
    */
    /* if line1 is a segment and line2 is infinite, they intersect if:*/
    if (a > 0 && a < 1) {
      result.onLine1 = true;
    }
    /* if line2 is a segment and line1 is infinite, they intersect if:*/
    if (b > 0 && b < 1) {
      result.onLine2 = true;
    }
    /* if line1 and line2 are segments, they intersect if both of the above are true*/
    return result;
  } /*End checkLineIntersection()*/ ;


}; /*End of class*/