/*
 * smartChartsNXT.core.js
 * @CreatedOn: 06-Jul-2016
 * @LastUpdated: 27-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.0.2
 * @description:SmartChartsNXT Core Library components. That contains common functionality.
 */

/*
NOTE :-------------- >
  It can be loaded ONLY from localhost/server.
  To load this we have to attach the core library in to our doc. 
  for example: 
  <script src="/smartChartsNXT/core/smartChartsNXT.core.js" type="text/javascript"></script>
*/


window.SmartChartsNXT = new function () {
  window.$SC = this;
  var self = this;
  
  this.libPath = "/smartChartsNXT";
  this.coreLibPath = "/smartChartsNXT/core";
  this.nameSpaceReadyStatus = false;

  var CORE_LIBS = {
    "uiCore": "/sc.ui.core.js",
    "geomCore": "/sc.geom.core.js",
    "utilCore": "/sc.util.core.js",
    "dataParser": "/dataParser.js",
    "eventCore": "/event.core.js"
  };

  var CHART_MAP = {
    "PieChart3D": this.libPath + "/pieChart3d/pieChart3d.js",
    "PieChart": this.libPath + "/pieChart2d/pieChart2d.js",
    "AreaChart": this.libPath + "/areaChart/areaChart.js",
    "LineChart": this.libPath + "/lineChart/lineChart.js",
    "ColumnChart": this.libPath + "/columnChart/columnChart.js",
    "StepChart": this.libPath + "/stepChart/stepChart.js",
    "DonutChart": this.libPath + "/donutChart/donutChart.js"
  };


  /*This method will load other dependent libs then callback  */
  function loadDependencies(callback) {
    var libCount = Object.keys(CORE_LIBS).length;
    var loadCount = 0;

    function commonCallback(res) {
      if (res.error)
        $SC.handleError(res.error, res.msg);
      loadCount++;
      if (loadCount === libCount)
        callback.call(this);
    }

    for (var lib in CORE_LIBS) {
      asyncLoad($SC.coreLibPath + CORE_LIBS[lib], commonCallback, commonCallback);
    }
  } /*End loadDependencies() */

  /*load js files asynchronously*/
  function asyncLoad(url, successCB, errorCB) {
    var doc = document,
      spt = 'script',
      elem = doc.createElement(spt),
      script = doc.getElementsByTagName(spt)[0];
    elem.src = url;
    if (successCB) {
      /*successback */
      elem.addEventListener('load', function (e) {
        successCB.call(null, e);
      }, false);
    }
    if (errorCB) {
      /*errorback */
      elem.addEventListener('error', function (e) {
        errorCB.call(null, {
          error: "Load dependency error some feature may not work",
          msg: "error with loading dependency :" + url
        });
      }, false);
    }
    script.parentNode.insertBefore(elem, script);
  } /*End asyncLoad()*/


  function initCore() {
    addFont(function () {
      appendChartTypeNamespace();
      self.nameSpaceReadyStatus = true;
    });
  } /*End initLib()*/


  loadDependencies(function () {
    initCore();
  });

  var preLoaderImg = "<svg width='135' height='140' viewBox='0 0 135 140' xmlns='http://www.w3.org/2000/svg' fill='#555'> <rect y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='30' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='60' width='15' height='140' rx='6'> <animate attributeName='height' begin='0s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='90' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.25s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.25s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect> <rect x='120' y='10' width='15' height='120' rx='6'> <animate attributeName='height' begin='0.5s' dur='1s' values='120;110;100;90;80;70;60;50;40;140;120' calcMode='linear' repeatCount='indefinite' /> <animate attributeName='y' begin='0.5s' dur='1s' values='10;15;20;25;30;35;40;45;50;0;10' calcMode='linear' repeatCount='indefinite' /> </rect></svg>";

  /*Load a particular chart type on demand*/
  function appendChartTypeNamespace() {
    for (var chartType in CHART_MAP) {

      /*continue if the the chart is already loaded*/
      if ($SC[chartType])
        continue;

      (function (cType) {
        $SC[chartType] = function (opts) {
          var newObj = this;

          //adding core feature into prototype chain
          setPrototype(newObj);
          
          var targetElem = document.querySelector("#" + opts.targetElem);

          /*------Show loader before showing the chart----------*/
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

          /*Parse opts if data format is XML --- THIS PART IS SKIPED NOW
          if (opts.sourceDatatype && opts.sourceDatatype.toLowerCase() === "xml")
            opts.dataSet = $SC.DataParser.parseXmlToJson(opts.dataSet);*/

          //bind callChart to preserve the context of new object
          loadChartLib(CHART_MAP[cType], callChart.bind(newObj), function (data) {
            //onError:SOME ERROR HANDLER
          });

          /* this method recursively check for the DOM readyness, if DOM was loaded then 
           * call will be pass into actual chart constructor
           */
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
          } /*End callChart() */

        };
      })(chartType);
    }
  } /*End appendChartTypeNamespace()*/


  var loadChartLib = function (libURL, onSuccess, onError) {
    asyncLoad(libURL, onSuccess, onError);
  };

  this.ready = function (successBack) {
    /* strat polling for the ready state*/
    var statusCheck = setInterval(function () {
      if (self.nameSpaceReadyStatus) {
        clearInterval(statusCheck);
        if (typeof successBack === "function") {
          successBack.call(window.SmartChartsNXT);
        }
      }
    }, 100);
  }; /*End ready()*/

  function setPrototype(obj){
    var proto = {}; 
    for(key in $SC){
      if(!CHART_MAP[key])
        proto[key] = $SC[key]; 
    }
    obj.__proto__ = Object.create(proto); 
  }/*End setInheritance() */



  /*Depricated will remove soon*/
  // this.addFont = function () {
  //   var fontLink = document.createElement("link");
  //   fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
  //   fontLink.rel = "stylesheet";
  //   document.getElementsByTagName("head")[0].appendChild(fontLink);
  // }; /*End addFont()*/

  function addFont(cb) {
    var fontLink = document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
    fontLink.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(fontLink);
    if (cb) {
      fontLink.addEventListener('load', function (e) {
        cb(null, e);
      }, false);
    }
  } /*End addFont()*/

  this.appendWaterMark = function (targetElem, scaleX, scaleY) {
    var strSVG = "<g id='smartCharts-watermark'>";
    strSVG += "  <text fill='#717171' x='" + (10 - (scaleX / 4)) + "' y='" + (25 - (scaleY / 2)) + "' font-size='10' font-family='Lato' style='cursor: pointer;' onclick=\"window.open('http://www.smartcharts.cf')\">Powered by SmartChartsNXT</text>";
    strSVG += "  </g>";
    document.querySelector("#" + targetElem + " svg").insertAdjacentHTML("beforeend", strSVG);
  }; /*End appendWaterMark()*/


  this.handleError = function (ex, msg) {
    console.log(ex);
    console.error("SmartChartsNXT:" + msg);
  }; /*End handleError()*/


}; /*End of class*/