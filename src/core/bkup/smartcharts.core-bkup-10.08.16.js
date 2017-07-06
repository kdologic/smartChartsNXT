/*
 * SmartCharts.core.js
 * @CreatedOn: 06-Jul-2016
 * @LastUpdated: 10-Aug-2016
 * @Author: SmartCharts
 * @Version: 1.0.0
 * @description:SmartCharts Core Library components. That contains common functionality.
 */

window.SmartCharts = new function(){
  window.$SC = this;
  this.libPath = "./lib"; 
  
  var CHART_MAP = {
  "PieChart3D":this.libPath+"/pieChart3d/pieChart3d.js",
	"PieChart":this.libPath+"/pieChart2d/pieChart2d.js",
  "AreaChart":this.libPath+"/areaChart/AreaChart.js",
	"LineChart":this.libPath+"/lineChart/lineChart.js"
  };
  
  function initCore(){
    $SC.ui = {};
    $SC.geom = {};
    $SC.util = {};
    
    //appendChartTypeNamespace();
  }/*End initLib()*/
  
  initCore();
  
  function appendChartTypeNamespace()
  {
    for(var chartType in CHART_MAP){
      (function(cType){
        $SC[chartType] = function(opts){
          loadLib(CHART_MAP[cType],function(){
            $SC[cType].call(this,opts);
          });
        };
      })(chartType);
    }
  }/*End appendChartTypeNamespace()*/
  
  var loadLib = function(libURL,onSuccess,onError){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          try{
           eval(xhr.responseText);
           if(typeof onSuccess === "function")
             onSuccess.call(this);
         }catch(ex){
           
           if(typeof onError === "function")
             onError.call(this);
           $SC.handleError(ex,"Error in load Library ["+libURL+"]");
         }
        }
    };
    xhr.open("GET", libURL, true);
    xhr.send();
  };
  
  
  
  this.ready = function(successBack)
  {
    if(typeof successBack === "function")
      successBack.call(this);
    
  };/*End ready()*/
  
  this.handleError = function(ex,msg){
    console.log(ex);
    console.error("SmartCharts:"+msg);
  };/*End handleError()*/
  
  this.addFont = function (){
    var fontLink =document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
    fontLink.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(fontLink);
  };/*End addFont()*/
  
  this.appendWaterMark = function (targetElem){
    var strSVG = "<g id='smartCharts-watermark'>";
    strSVG += "   <text fill='#717171' x='"+(5)+"' y='"+(10)+"' font-size='10' font-family='Lato' style='cursor: pointer;' onclick=\"window.open('http://www.smartcharts.cf')\">Powered by SmartCharts</text>";
    strSVG += "   </g>";
    document.querySelector("#"+targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
  };/*End appendWaterMark()*/
  
  
  /*-----------SmartCharts UI functions------------- */
  
  this.ui.dropShadow = function(parentID){
    var shadow = document.querySelectorAll("#"+parentID+" svg #smartCharts-dropshadow");
    if(shadow.length < 1 ){
      var strSVG = "";
      strSVG =  "<filter id='smartCharts-dropshadow' height='130%'>";
      strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>"; 
      strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>"; 
      strSVG += "  <feMerge>"; 
      strSVG += "    <feMergeNode/>";
      strSVG += "    <feMergeNode in='SourceGraphic'/>";
      strSVG += "  </feMerge>";
      strSVG += "</filter>";
      document.querySelector("#"+parentID+" svg").insertAdjacentHTML("beforeend",strSVG);
    }
    return "url(#smartCharts-dropshadow)";
  };/*End appendDropShadow()*/
  
  /*function used to show/hide tooltip*/
  this.ui.toolTip = function(targetElem,cPoint,color,line1,line2)
  {
    if(typeof cPoint === "string" && cPoint === "hide"){
      var toolTip = document.querySelector("#"+targetElem+" svg #toolTipContainer");
      if(toolTip)toolTip.style.display = "none";
      return;
    }
    /*Prevent call-by-sharing*/
    if(cPoint)
      cPoint = new $SC.geom.Point(cPoint.x,cPoint.y); 
    
    cPoint.y-= 20;
    var toolTip = document.querySelector("#"+targetElem+" svg #toolTipContainer");
    if(!toolTip){
      var strSVG = "<g id='toolTipContainer'>";
      strSVG += "  <path id='toolTip'  filter='"+$SC.ui.dropShadow(targetElem)+"' fill='white' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
      strSVG += "  <text id='txtToolTipGrp' fill='#717171' font-family='Lato' >";
      strSVG += "    <tspan id='toolTipRow1' font-size='14'><\/tspan>";
      strSVG += "    <tspan id='toolTipRow2' font-weight='bold' font-size='14'><\/tspan>";
      strSVG += "  <\/text>";
      strSVG += "<\/g>";
      document.querySelector("#"+targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
      toolTip = document.querySelector("#"+targetElem+" svg #toolTipContainer");
    }
    
    if(line1)
      toolTip.querySelector("#txtToolTipGrp #toolTipRow1").textContent = line1;
    if(line2)
      toolTip.querySelector("#txtToolTipGrp #toolTipRow2").textContent = line2;

    var txtToolTipBox = document.querySelectorAll("#"+targetElem+" svg #txtToolTipGrp")[0].getBoundingClientRect();
    var padding = 20;
    var d = [
      "M",
      cPoint.x,
      cPoint.y,
      "L",
      cPoint.x-10,
      cPoint.y-10,
      "L", //bottom-left corner
      cPoint.x-(txtToolTipBox.width/2)-10-padding,
      cPoint.y-10,
      "L",//top-left corner
      cPoint.x-(txtToolTipBox.width/2)-10-padding,
      cPoint.y-txtToolTipBox.height-10-padding,
      "L",//top-right corner
      cPoint.x+(txtToolTipBox.width/2)+10+padding,
      cPoint.y-txtToolTipBox.height-10-padding,
      "L",//bottom-right corner
      cPoint.x+(txtToolTipBox.width/2)+10+padding,
      cPoint.y-10,
      "L",//bottom center
      cPoint.x+10,
      cPoint.y-10,
      "Z"
    ];
    
    var toolTipGrp = toolTip.querySelector("#txtToolTipGrp");
    toolTipGrp.querySelector("#toolTipRow1").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    toolTipGrp.querySelector("#toolTipRow1").setAttribute("y",cPoint.y-10-(txtToolTipBox.height));
    toolTipGrp.querySelector("#toolTipRow2").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    toolTipGrp.querySelector("#toolTipRow2").setAttribute("y",cPoint.y-10-(txtToolTipBox.height/2));
    document.querySelector("#"+targetElem+" svg #toolTip").setAttribute("d",d.join(" "));
    document.querySelector("#"+targetElem+" svg #toolTip").setAttribute("stroke",color); 

    if(toolTip) toolTip.parentNode.removeChild(toolTip);
    toolTip.style.display = "block";
    document.querySelector("#"+targetElem+" svg").appendChild(toolTip);
    
  };/*End showToolTip()*/
  
  /* Get point in global SVG space*/
  this.ui.cursorPoint = function(targetElem, evt){
    var svg = document.querySelector("#"+targetElem+" svg");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };/*End cursorPoint()*/
  
  this.ui.appendMenu = function (targetElem,svgCenter){
    var strSVG="";
    strSVG += "<g id='smartCharts-menu'>";
    strSVG += "  <path id='smartCharts-menu-icon' d='"+$SC.geom.describeRoundedRect(((svgCenter.x*2)-50),20,35,30,5).join(" ")+"' filter='"+$SC.ui.dropShadow(targetElem)+"' fill='white' stroke-width='0.5' stroke='#717171' />";
    strSVG += "  <line x1='"+((svgCenter.x*2)-45)+"' y1='30' x2='"+((svgCenter.x*2)-20)+"' y2='30' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='"+((svgCenter.x*2)-45)+"' y1='35' x2='"+((svgCenter.x*2)-20)+"' y2='35' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='"+((svgCenter.x*2)-45)+"' y1='40' x2='"+((svgCenter.x*2)-20)+"' y2='40' style='stroke:#333;stroke-width:1' />";
    strSVG += "<\/g>";
    document.querySelector("#"+targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
    
    /*Bind menu events*/
    
    document.querySelector("#"+targetElem+" #smartCharts-menu #smartCharts-menu-icon").addEventListener("click", function(e){
      e.stopPropagation();
      e.preventDefault();
      var offSetX = 150,offSetY = 60, intervalId;
      var menuSidePanel = document.querySelectorAll("#"+targetElem+" #smartCharts-menu-panel");
      if(menuSidePanel.length > 0)
      {
        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
      }else {
        strSVG = "  <g id='smartCharts-menu-panel'>";
        strSVG += "  <rect class='menu-panel-elem' x='"+((svgCenter.x*2)-offSetX)+"' y='"+(offSetY)+"' width='"+(offSetX)+"' height='"+(svgCenter.y*2-offSetY-2)+"' fill='white' stroke-width='1' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-elem' x='"+((svgCenter.x*2)-offSetX)+"' y='"+(offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#EEF' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <text fill='#717171' x='"+((svgCenter.x*2)-offSetX+25)+"' y='"+(offSetY+32)+"' font-family='Lato' >Download As...</text>";
        
        strSVG += "  <rect class='menu-panel-menu' save-as='jpeg' x='"+((svgCenter.x*2)-offSetX)+"' y='"+(2*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-menu' save-as='png' x='"+((svgCenter.x*2)-offSetX)+"' y='"+(3*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-menu' save-as='svg' x='"+((svgCenter.x*2)-offSetX)+"' y='"+(4*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";

        
        strSVG += "  <text fill='#717171' x='"+((svgCenter.x*2)-offSetX+25)+"' y='"+(2*offSetY+32)+"' font-family='Lato' >JPEG</text>";
        strSVG += "  <text fill='#717171' x='"+((svgCenter.x*2)-offSetX+25)+"' y='"+(3*offSetY+32)+"' font-family='Lato' >PNG</text>";
        strSVG += "  <text fill='#717171' x='"+((svgCenter.x*2)-offSetX+25)+"' y='"+(4*offSetY+32)+"' font-family='Lato' >SVG</text>";

        strSVG += "  <line x1='"+((svgCenter.x*2)-offSetX+15)+"' y1='"+(3*offSetY)+"' x2='"+(svgCenter.x*2-15)+"' y2='"+(3*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((svgCenter.x*2)-offSetX+15)+"' y1='"+(4*offSetY)+"' x2='"+(svgCenter.x*2-15)+"' y2='"+(4*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((svgCenter.x*2)-offSetX+15)+"' y1='"+(5*offSetY)+"' x2='"+(svgCenter.x*2-15)+"' y2='"+(5*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((svgCenter.x*2)-offSetX+15)+"' y1='"+(6*offSetY)+"' x2='"+(svgCenter.x*2-15)+"' y2='"+(6*offSetY)+"' style='stroke:#eee;stroke-width:1' />";

        strSVG += "  <\/g>";
        document.querySelector("#"+targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
        
        /*submenu bind event*/
        var menuPanel = document.querySelector("#"+targetElem+" #smartCharts-menu-panel");
        var submenus = menuPanel.querySelectorAll(".menu-panel-menu");
        for(var i=0;i<submenus.length;i++){
          submenus[i].addEventListener("click", function(e){
          e.stopPropagation();
          e.preventDefault();
            var saveAsType = e.target.getAttribute("save-as");
            var opts = {width:svgCenter.x*2, height:svgCenter.y*2, srcElem:"#"+targetElem+" svg", type:saveAsType, 
              saveSuccess:function(){
                document.querySelector("#"+targetElem+" #smartCharts-menu").style.visibility = "visible";
              }
            };
            var menuSidePanel = document.querySelectorAll("#"+targetElem+" #smartCharts-menu-panel");
            if(menuSidePanel.length > 0)
              menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
            document.querySelector("#"+targetElem+" #smartCharts-menu").style.visibility = "hidden";
            $SC.util.saveAsImage(opts);
          
          },false);
          
          submenus[i].addEventListener("mouseenter", function(e){
            e.target.setAttribute("fill","#d7d7ed");
          },false);
          submenus[i].addEventListener("mouseleave", function(e){
            e.target.setAttribute("fill","#fff");
          },false);
        }
        
        menuPanel.style["transform"] = "translate("+offSetX+"px,"+0+"px)";
        
        var slideOffset = offSetX;
        var shiftBy = 1.1;
        intervalId = setInterval(function(){
          if(slideOffset < 0)
            slideOffset = Math.round(slideOffset)+4;
          else{
            shiftBy += Math.pow(1.1,2);
            slideOffset-=shiftBy;
          }
          menuPanel = document.querySelector("#"+targetElem+" #smartCharts-menu-panel");
          if(menuPanel)
            menuPanel.style["transform"] = "translate("+(slideOffset)+"px,"+0+"px)";
          else 
            clearInterval(intervalId);
          if(slideOffset === 0)
            clearInterval(intervalId);
        },50);
      }
    },false);
  };/*End appendMenu()*/
  
  
  /*-----------SmartCharts Utility functions------------- */
  
  this.util.mergeRecursive = function(obj1, obj2) 
  {
    //iterate over all the properties in the object which is being consumed
    for (var p in obj2) {
      // Property in destination object set; update its value.
      if ( obj2.hasOwnProperty(p) && typeof obj1[p] !== "undefined" ) {
        _mergeRecursive(obj1[p], obj2[p]);
      } else {
        //We don't have that level in the heirarchy so add it
        obj1[p] = obj2[p];
      }
    }
  };/*End mergeRecursive()*/
  
  this.util.getColor = function(index){
    var Colors = {};
    Colors.names = {
      bluelight:"#95CEFF",
      maroon:"#991919",
      rust:"#F56B19",
      babyPink:"#F15C80",
      green1:"#31B76D",
      biscuit:"#F7A35C",
      blue1:"#1982C8",
      goldenYellow:"#F3CA19",
      lime: "#00ff00",
      navy: "#000080",
      olive: "#808000",
      red: "#ff0000",
      orange: "#ffa500",
      pink: "#ffc0cb",
      yellow: "#ffff00",
      brown: "#a52a2a",
      violet: "#800080",
      magenta: "#ff00ff",
      darkmaroon: "#800000",
      gold: "#ffd700"
    };
    var result;
    var count = 0;
    index = index%20;
    for (var prop in Colors.names)
        if (index === count++)
           result = Colors.names[prop];

    return result;
  };/*End getColor()*/
  
  this.util.colorLuminance = function(hex, lum) {
    /* validate hex string*/
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
    if (hex.length < 6) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    lum = lum || 0;
    /* convert to decimal and change luminosity*/
    var rgb = "#", c, i;
    for (i = 0; i < 3; i++) {
      c = parseInt(hex.substr(i*2,2), 16);
      c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
      rgb += ("00"+c).substr(c.length);
    }
    return rgb;
  }/*End colorLuminance()*/
  
  this.util.saveAsImage = function(opts){
    /*opts = {width:800, height:500, srcElem:"", type:"jpeg || png || svg", saveSuccess:null};*/
    
    var svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
    
    var img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    
    img.onload = function() {
      var today = new Date();
      if(opts.type !== "svg"){
        var canvas = document.createElement("canvas");
        canvas.width = opts.width;
        canvas.height=opts.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
      }
      
      var imgAsURL = (opts.type === "svg")?"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgString) : canvas.toDataURL("image/"+opts.type);
      var link = document.createElement("a");
      link.href = imgAsURL;
      link.download = "smartChart_"+today.getFullYear()+"-"+(today.getMonth()+1)+"-"+today.getDate()+"."+opts.type;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if(typeof opts.saveSuccess === "function")
        opts.saveSuccess.call(this);
    };

  };/*End saveAsImage()*/
  
  
  /*---------------Related mathematical shapes---------------------------*/
  
  this.geom.describeRoundedRect = function (x, y, width, height, radius) {
    return [
      "M" , (x+radius) , y
      , "h" , (width - (2*radius))
      , "a" , radius , radius , " 0 0 1 ", radius , radius
      , "v" , (height - (2 * radius))
      , "a" , radius , radius , " 0 0 1 " , -radius , radius
      , "h" , ((2*radius) - width)
      , "a" , radius , radius , " 0 0 1 " , -radius , -radius
      , "v" , ((2*radius) - height)
      , "a" , radius , radius , " 0 0 1 " , radius , -radius
      , "z"
    ];
  };/*End describeRoundedRect()*/
  
  this.geom.describeBezireArc = function(point1,point2,point3)
  {
    //var mid1 = getMidPoint(point1,point2);
    //var mid11 = getMidPoint(mid1,point2);
    var mid2 = $SC.geom.getMidPoint(point2,point3);
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
  };/*End describeBezireArc()*/
  
  this.geom.createDot = function(center,color,radious,opacity,cls,targetElem)
  {
    var svg;
    if(targetElem)
      svg = document.getElementById(targetElem);
    else
      svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
    newElement.setAttribute("cx",center.x); //Set path's data
    newElement.setAttribute("cy",center.y); //Set path's data
    newElement.setAttribute("r",radious||3); //Set path's data
    newElement.setAttribute("class",cls||"dot"); //Set path's data
    newElement.style.fill = color; //Set stroke colour
    newElement.style.opacity = opacity||1;
    newElement.style.strokeWidth = "1px"; //Set stroke width
    svg.appendChild(newElement);
  };/*End createDot()*/


  this.geom.createRect = function(left,top,width,height,color)
  {
    var svg = document.getElementsByTagName('svg')[0]; //Get svg element
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
    newElement.setAttribute("x",left); //Set path's data
    newElement.setAttribute("y",top); //Set path's data
    newElement.setAttribute("width",width); //Set path's data
    newElement.setAttribute("height",height); //Set path's data
    newElement.style.fill = "none"; //Set stroke colour
    newElement.setAttribute("class","bbox"); //Set path's data
    newElement.style.stroke = color;
    newElement.style.strokeWidth = "1px"; //Set stroke width
    svg.appendChild(newElement);
  };/*End createRect()*/
  
  

  this.geom.getDistanceBetween = function(point1, point2)
  {
      var dist = Math.sqrt((point1.x-point2.x)*(point1.x-point2.x)+(point1.y-point2.y)*(point1.y-point2.y))||0;
      return dist;
  };/*End getDistanceBetween()*/

  this.geom.Point = function(x,y)
  {
    var obj = this;
    this.x = x;
    this.y = y;
    this.toString = function()
    {
      return "x:"+obj.x+", y:"+obj.y;
    };
  };
  
  this.geom.polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };/*End polarToCartesian()*/
  
  this.geom.getMidPoint = function(point1, point2)
  {
    return new $SC.geom.Point((point1.x+point2.x)/2,(point1.y+point2.y)/2);
  };/*End getMidPoint()*/
  
  this.geom.getEllipticalRadious = function(rx,ry,angleInDegrees)
  {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    var r = (rx*ry)/Math.sqrt(((rx*rx)*(Math.sin(angleInRadians)*Math.sin(angleInRadians)))+((ry*ry)*(Math.cos(angleInRadians)*Math.cos(angleInRadians))));
    return r;
  };/*End getEllipticalRadious()*/
  
  this.geom.describeEllipticalArc = function(cx, cy, rx,ry, startAngle, endAngle, sweepFlag){
    var fullArc=false;  
    if(startAngle%360 === endAngle%360)  {
      endAngle--;
      fullArc = true;
    }

    var start = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx,ry,endAngle), endAngle);
    var end = $SC.geom.polarToCartesian(cx, cy, $SC.geom.getEllipticalRadious(rx,ry,startAngle), startAngle); 
    var largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

    var d = [
        "M", start.x, start.y, 
        "A", rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
    ];

    if(fullArc)
      d.push("L",start.x,start.y);
    d.push("L", cx, cy, "Z");
    var path = {
      "d":d.join(" "),
      "arc": [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(" "),
      "start":start,
      "end":end,
      "center":new $SC.geom.Point(cx,cy),
      "rx":rx,
      "ry":ry,
      "startAngle":startAngle,
      "endAngle":endAngle
    };
    return path;       
  };/*End describeEllipticalArc()*/
  
  this.geom.checkLineIntersection = function(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
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
  }/*End checkLineIntersection()*/;
  
  
};/*End of class*/