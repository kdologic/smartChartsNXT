/*
 * SVG PieChart 2D
 * @Version:1.0.0
 * @CreatedOn:07-Jul-2016
 * @LastUpdated:07-Jul-2016
 * @Author:SmartCharts
 * @description:This will generate a 2d pie chart. Using SVG 1.1 elements and HTML 5 standard 
 * @JSFiddle:
 * @Sample caller code:
 * var settings = {
      "width":800,
      "height":600,
      "title":"Browser Statistics and Trends",
      "outline":2,
      "canvasBorder":true,
      "subTitle":"As of Q1, 2016",
      "targetElem":"chartContainer",
      "bgColor":"gray",
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
          "value":"3.6"
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
 */


window.PieChart2D = function(opts)
{
  if(typeof window.jQuery === "undefined"){
    setTimeout(function(){
        PieChart2D(opts);
    },100);
    return;
  }

  var PAGE_OPTIONS = {};

  var PAGE_DATA = {
    scaleX:0,
    scaleY:0,
    svgCenter:0,
    pieCenter:0,
    uniqueDataSet:[],
    totalValue:0,
    pieWidth:160,
    pieHeight:160,
    pieSet:[],
    dragStartAngle:0,
    dragEndPoint:null,
    mouseDown: 0,
    mouseDrag:0
  };

  var PAGE_CONST = {
    FIX_WIDTH:800,
    FIX_HEIGHT:600
  };

  function init()
  {
    _mergeRecursive(PAGE_OPTIONS,opts);
    addFont();

    PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
    PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;
    //PAGE_DATA.pieThickness = PAGE_OPTIONS.depth || 20;

    var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                "preserveAspectRatio='xMidYMid meet'"+
                "currentScale='1'"+
                "viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" "+PAGE_CONST.FIX_WIDTH+" "+PAGE_CONST.FIX_HEIGHT+"'"+
                "version='1.1'" +
                "width='"+PAGE_OPTIONS.width+"'"+
                "height='"+PAGE_OPTIONS.height+"'"+
                "id='pieChart2D'"+
                "style='background:"+(PAGE_OPTIONS.bgColor||"none")+";width:100%;height:auto; max-width:"+PAGE_OPTIONS.width+"px;max-height:"+PAGE_OPTIONS.height+"px;-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'> <\/svg>"; 
    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = strSVG;

    var svgWidth = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").getAttribute("width");
    var svgHeight = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").getAttribute("height");
    PAGE_DATA.svgCenter = new Point((svgWidth/2),(svgHeight/2)) ;
    PAGE_DATA.pieCenter = new Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;

    prepareChart();
    appendWaterMark();
  }/*End init()*/

  function prepareChart()
  {
    var startAngle,endAngle=0;
    prepareDataSet();
    var strSVG="";
    if(PAGE_OPTIONS.canvasBorder){
      strSVG += "<g>";
      strSVG += "  <rect x='"+((-1)*PAGE_DATA.scaleX/2)+"' y='"+((-1)*PAGE_DATA.scaleY/2)+"' width='"+((PAGE_DATA.svgCenter.x*2)+PAGE_DATA.scaleX)+"' height='"+((PAGE_DATA.svgCenter.y*2)+PAGE_DATA.scaleY)+"' style='fill:white;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='"+(100/PAGE_CONST.FIX_WIDTH*PAGE_OPTIONS.width)+"' y='"+(50/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height)+"' font-size='25'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
    strSVG += "  <\/text>";

          strSVG += "  <path id='path1' stroke='red' fill='none' d='' />";
          strSVG += "  <path id='path2' stroke='blue'  fill='none' d='' />";

    strSVG += "<\/g>";

    strSVG += "<filter id='dropshadow' height='130%'>";
    strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>"; 
    strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>"; 
    strSVG += "  <feMerge>"; 
    strSVG += "    <feMergeNode/>";
    strSVG += "    <feMergeNode in='SourceGraphic'/>";
    strSVG += "  </feMerge>";
    strSVG += "</filter>";


    strSVG += "<g id='toolTipContainer'>";
    strSVG += "  <path id='toolTip'  fill='white' style='filter:url(#dropshadow)' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
    strSVG += "  <text id='txtToolTipGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='toolTipRow1' font-size='14'><\/tspan>";
    strSVG += "    <tspan id='toolTipRow2' font-weight='bold' font-size='14'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").insertAdjacentHTML("beforeend",strSVG);

    /*Set Title of chart*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    for(var i=0;i<PAGE_DATA.uniqueDataSet.length;i++)
    {
       startAngle = endAngle;
       endAngle += (PAGE_DATA.uniqueDataSet[i].percent*360/100);
       createPie(startAngle,endAngle,getColor(i),i);
    }

    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = document.getElementById(PAGE_OPTIONS.targetElem).innerHTML;

    bindEvents();
    resetTextPos();
    divergeElements();
    convergeElements();
    appendMenu();

  }/*End prepareChart()*/

  function createPie(startAngle,endAngle,color,index)
  {
    var percent = parseFloat((endAngle-startAngle)*100/360).toFixed(2);
    var darkShade = colorLuminance(color,-0.2);
    var lighterShade = colorLuminance(color,0.2);
    var strSVG="";
    strSVG += "  <rect class='pie"+index+"' id='colorLegend"+index+"' width='300' height='100' fill='"+lighterShade+"' style='opacity:1;' />";
    strSVG += "  <text class='pie"+index+"' id='txtPieGrpPie"+index+"' fill='#717171' font-family='Lato' >";
    strSVG += "  <tspan class='pie"+index+"' id='txtPie"+index+"' x='100' y='50' font-size='16'><\/tspan></text>";
    strSVG += "  <path class='pie"+index+"' id='pieHover"+index+"' fill-opacity='0.25' fill='"+color+"' stroke='none' stroke-width='0' style='cursor:pointer;' \/> ";
    strSVG += "  <path class='pie"+index+"' filter='url(#dropshadow)' id='upperArcPie"+index+"'  fill='"+lighterShade+"' stroke='#eee' stroke-width='"+(PAGE_OPTIONS.outline||1)+"' style='cursor:pointer;' \/>";
    strSVG += "  <path class='pie"+index+"' id='pathToLegend"+index+"'  fill='none' stroke='#555' stroke-width='1' \/>";

    strSVG += "<defs>";
    strSVG += "  <radialGradient gradientUnits = 'userSpaceOnUse' id='gradRadialPie"+index+"' cx='50%' cy='50%' r='70%' fx='40%' fy='100%'>";
    strSVG += "    <stop offset='0%' style='stop-color:"+lighterShade+";stop-opacity:1' \/>";
    strSVG += "    <stop offset='100%' style='stop-color:"+darkShade+";stop-opacity:1' \/>";
    strSVG += "  <\/radialGradient>";
    strSVG += "<\/defs>";

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").insertAdjacentHTML("beforeend",strSVG);

    var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
    var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+index);
    upperArcPie.setAttribute("d",upperArcPath.d);
    upperArcPie.setAttribute("fill","url(#gradRadialPie"+index+")");
    var textLabel = PAGE_DATA.uniqueDataSet[index]["label"];
    textLabel = (textLabel.length > 15?textLabel.substring(0,12)+"...":textLabel);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+index).textContent = (textLabel+" ["+percent+"%]");

    var midAngle = (startAngle+endAngle)/2;
    var pie = {
      "id":"pie"+index,
      "upperArcPath":upperArcPath,
      "midAngle": midAngle,
      "slicedOut":false,
      "percent":percent
    };
    PAGE_DATA.pieSet.push(pie);
  }/*End createPie()*/

  function bindEvents()
  {
    try {
      if(PAGE_DATA.uniqueDataSet.length <=1 )return;

      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
      {

        function onClick(e){
          var pieData,elemId = e.target.getAttribute("class"),sliceOut;
          var index = elemId.substring("pie".length);

          for(var i=0;i<PAGE_DATA.pieSet.length;i++)
          {
              if(PAGE_DATA.pieSet[i].id === elemId)
              {
                pieData = PAGE_DATA.pieSet[i];
                sliceOut = PAGE_DATA.pieSet[i].slicedOut;
                PAGE_DATA.pieSet[i].slicedOut = !PAGE_DATA.pieSet[i].slicedOut;
              }
          }
          var shiftIndex = sliceOut?15:1;
          var shiftInterval = setInterval(function()
          {
            var shiftedCentre = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(shiftIndex*2,shiftIndex*2,pieData.midAngle), pieData.midAngle) ;
            if(isNaN(shiftedCentre.x) || isNaN(shiftedCentre.y) )
              shiftedCentre = PAGE_DATA.pieCenter;

            var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+index);
            //upperArcPie.setAttribute("d",upperArcPath.d);
            upperArcPie.setAttribute("transform", "translate("+(shiftedCentre.x-PAGE_DATA.pieCenter.x)+","+(shiftedCentre.y-PAGE_DATA.pieCenter.y)+")");
            var txtPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPieGrpPie"+index);
            txtPie.setAttribute("transform", "translate("+(shiftedCentre.x-PAGE_DATA.pieCenter.x)+","+(shiftedCentre.y-PAGE_DATA.pieCenter.y)+")");

            var pathToLegend = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pathToLegend"+index);
            pathToLegend.setAttribute("transform", "translate("+(shiftedCentre.x-PAGE_DATA.pieCenter.x)+","+(shiftedCentre.y-PAGE_DATA.pieCenter.y)+")");

            var colorLegend = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #colorLegend"+index);
            colorLegend.setAttribute("transform", "translate("+(shiftedCentre.x-PAGE_DATA.pieCenter.x)+","+(shiftedCentre.y-PAGE_DATA.pieCenter.y)+")");

            shiftIndex = sliceOut?shiftIndex-1:shiftIndex+1;
            if((!sliceOut && shiftIndex === 15)||(sliceOut && shiftIndex === -1))
              clearInterval(shiftInterval);
          },10);
        }/*End onClick()*/

        var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+pieIndex);
        upperArcPie.addEventListener("mousedown", function(e){
          e.stopPropagation();
          var elemId = e.target.getAttribute("class");
          var pieIndex = elemId.substring("pie".length);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pieHover"+pieIndex).setAttribute("d","");
          PAGE_DATA.mouseDown = 1;

        });

        upperArcPie.addEventListener("touchstart", function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 1;
        });

        upperArcPie.addEventListener("mouseup", function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          if(PAGE_DATA.mouseDrag === 0)
            onClick(e);
          PAGE_DATA.mouseDrag = 0;
        },false);

        upperArcPie.addEventListener("touchend", function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          PAGE_DATA.mouseDrag = 0;
        },false);

        upperArcPie.addEventListener("mousemove", function(e){
          if(PAGE_DATA.mouseDown ===1){
            var dragStartPoint = cursorPoint(e);
            var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

            if(dragAngle > PAGE_DATA.dragStartAngle)
              rotateChart(2,false);
            else
              rotateChart(-2,false);
            PAGE_DATA.dragStartAngle = dragAngle;
            PAGE_DATA.mouseDrag = 1;
            showToolTip("hide");
          }else{
            var mousePos = cursorPoint(e);
            var pieData,elemId = e.target.getAttribute("class");
            var pieIndex = elemId.substring("pie".length);

            for(var i=0;i<PAGE_DATA.pieSet.length;i++)
                if(PAGE_DATA.pieSet[i].id === elemId)
                  pieData = PAGE_DATA.pieSet[i];
            var row1 = PAGE_DATA.uniqueDataSet[pieIndex].label+", "+ PAGE_DATA.uniqueDataSet[pieIndex].value;
            var row2 = PAGE_DATA.uniqueDataSet[pieIndex].percent.toFixed(2)+"%";
            showToolTip(mousePos,getColor(pieIndex),row1,row2);
          }
        },false);

        upperArcPie.addEventListener("touchmove", function(e) {
          e.preventDefault(); 
          var dragStartPoint = cursorPoint(e.originalEvent.changedTouches[0]);
          var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

          if(dragAngle > PAGE_DATA.dragStartAngle)
            rotateChart(2,false);
          else
            rotateChart(-2,false);
          PAGE_DATA.dragStartAngle = dragAngle;
          PAGE_DATA.mouseDrag = 1;
        },false);

        upperArcPie.addEventListener("mouseenter", function(e){
          if(PAGE_DATA.mouseDown === 0){
            var pieData,elemId = e.target.getAttribute("class");
            var pieIndex = elemId.substring("pie".length);

            for(var i=0;i<PAGE_DATA.pieSet.length;i++)
                if(PAGE_DATA.pieSet[i].id === elemId)
                  pieData = PAGE_DATA.pieSet[i];
            var pieHover = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pieHover"+pieIndex); 
            var pieHoverPath ;
            if(pieData.slicedOut)
            {
              var shiftIndex = 15;
              var shiftedCentre = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(shiftIndex*2,shiftIndex*2,pieData.midAngle), pieData.midAngle) ;
              pieHoverPath = describeEllipticalArc(shiftedCentre.x,shiftedCentre.y,PAGE_DATA.pieWidth+20,PAGE_DATA.pieHeight+20,pieData.upperArcPath.startAngle,pieData.upperArcPath.endAngle,0);
            }
            else
              pieHoverPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth+20,PAGE_DATA.pieHeight+20,pieData.upperArcPath.startAngle,pieData.upperArcPath.endAngle,0);
            pieHover.setAttribute("d",pieHoverPath.d);
          }
        },false);

        upperArcPie.addEventListener("mouseleave", function(e){
          var elemId = e.target.getAttribute("class");
          var pieIndex = elemId.substring("pie".length);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pieHover"+pieIndex).setAttribute("d","");
          showToolTip("hide");
        },false);

      }

      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").addEventListener("mouseup",function(e){
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      },false);

      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").addEventListener("touchend",function(e){
        e.stopPropagation();
        PAGE_DATA.mouseDown = 0;
        PAGE_DATA.mouseDrag = 0;
      },false);
    }
    catch(ex){console.log(ex);}
  }/*End bindEvents()*/


  function showToolTip(cPoint,color,line1,line2)
  {
    if(typeof cPoint === "string" && cPoint === "hide"){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #toolTipContainer").style.display = "none";
      return;
    }
    cPoint.y-= 20;
    if(line1)
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow1").textContent = line1;
    if(line2)
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow2").textContent = line2;

    var txtToolTipBox = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp")[0].getBBox();
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

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow1").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow1").setAttribute("y",cPoint.y-10-(txtToolTipBox.height));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow2").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtToolTipGrp #toolTipRow2").setAttribute("y",cPoint.y-10-(txtToolTipBox.height/2));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #toolTip").setAttribute("d",d.join(" "));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #toolTip").setAttribute("stroke",color); 

    var toolTip = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #toolTipContainer");
    if(toolTip) toolTip.parentNode.removeChild(toolTip);
    toolTip.style.display = "block";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").appendChild(toolTip);

  }/*End showToolTip()*/

  function divergeElements(){
    if(PAGE_DATA.uniqueDataSet.length >1){
      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
      { 
        var pieData = PAGE_DATA.pieSet[pieIndex],elemId = "pie"+pieIndex;
        PAGE_DATA.pieSet[pieIndex].slicedOut = false;
        var transposePoint = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious((10000),(10000),pieData.midAngle), pieData.midAngle) ;
        var pieGroup = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart2D .pie"+pieIndex);
        for(var i=0;i<pieGroup.length;i++)
          pieGroup[i].setAttribute("transform","translate("+(transposePoint.x-PAGE_DATA.pieCenter.x)+","+(transposePoint.y-PAGE_DATA.pieCenter.y)+")"); 
      }
    }
  }/*End divergeElemnts()*/

  function convergeElements(){
    if(PAGE_DATA.uniqueDataSet.length >1){
      for(var pieIndex = 0;pieIndex < PAGE_DATA.pieSet.length;pieIndex++)
      {
        var shiftRadiousX = (PAGE_DATA.svgCenter.x*2);
        var shiftRadiousY  = (PAGE_DATA.svgCenter.y*2);
        var pieData = PAGE_DATA.pieSet[pieIndex],elemId = "pie"+pieIndex;

        (function(shiftRadiousX,shiftRadiousY,pieData,pieIndex)
        { 
          var reverseFlag = 0,replaceUnit = 5;
          setTimeout(function()
          {
            var intervalId = setInterval(function()
            {
              var transform = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, shiftRadiousX, pieData.midAngle) ;
              transform = new Point((transform.x-PAGE_DATA.pieCenter.x),(transform.y-PAGE_DATA.pieCenter.y));
              var pieGroup = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart2D .pie"+pieIndex);
              for(var i=0;i<pieGroup.length;i++)
                pieGroup[i].setAttribute("transform","translate("+transform.x+","+transform.y+")"); 

              if((Math.abs(Math.round(transform.x)) <= 5 && Math.abs(Math.round(transform.y)) <= 5) && reverseFlag === 0){
                reverseFlag = 1;
                replaceUnit = -4.5;
              }
              if((Math.abs(Math.round(transform.x)) >= 70 || Math.abs(Math.round(transform.y)) >= 70) && reverseFlag === 1){
                reverseFlag = 2;
                replaceUnit = 1;
              }
              shiftRadiousX -=(replaceUnit*1.5);
              shiftRadiousY -=(replaceUnit*1.5);

              if(Math.round(transform.x) === 0 && Math.round(transform.y) === 0){
                clearInterval(intervalId);
                var pieGroup = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart2D .pie"+pieIndex);
                for(var i=0;i<pieGroup.length;i++)
                  pieGroup[i].setAttribute("transform",""); 
              }
            },5);
          },(pieIndex*200));
        })(shiftRadiousX,shiftRadiousY,pieData,pieIndex);
      }
    }
  }/*End convergeElements()*/


  function cursorPoint(evt){
    var svg = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }/*End cursorPoint()*/

  function getAngle(point1,point2)
  {
    var deltaX = point2.x - point1.x;
    var deltaY = point2.y - point1.y;
    var rad = Math.atan2(deltaY, deltaX);
    var deg = rad*180.0/Math.PI;
    deg = (deg <0)?deg+450:deg+90;
    return deg%360;
  }

  function rotateChart(rotationIndex,ignorOrdering)
  {
    for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
    {
      var pieData,elemId = "pie"+pieIndex;
      for(var i=0;i<PAGE_DATA.pieSet.length;i++){
        if(PAGE_DATA.pieSet[i].id === elemId)
        {
          pieData = PAGE_DATA.pieSet[i];
        }
        PAGE_DATA.pieSet[i].slicedOut = false;
      }

      var pieGroup = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart2D .pie"+pieIndex);
      for(var i=0;i<pieGroup.length;i++)
        pieGroup[i].setAttribute("transform","");
      var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["upperArcPath"].startAngle+rotationIndex),(pieData["upperArcPath"].endAngle+rotationIndex),0);
      var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+pieIndex);
      upperArcPie.setAttribute("d",upperArcPath.d);
      upperArcPie.setAttribute("fill","url(#gradRadialPie"+pieIndex+")");

      var midAngle = (((pieData["upperArcPath"].startAngle+rotationIndex)+(pieData["upperArcPath"].endAngle+rotationIndex))/2)%360.00;

      PAGE_DATA.pieSet[pieIndex]["upperArcPath"] = upperArcPath;
      PAGE_DATA.pieSet[pieIndex]["midAngle"] = (midAngle<0?360+midAngle:midAngle);
      if(!ignorOrdering)
        resetTextPos();
    }

  }/*End rotateChart()*/

  function resetTextPos()
  {
    var txtTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtTitleGrp #txtTitle");
    var titleWidth = txtTitle.getComputedTextLength();
    var txtSubTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtTitleGrp #txtSubtitle");
    var subTitleWidth = txtSubTitle.getComputedTextLength();
    txtTitle.setAttribute("x",(PAGE_DATA.svgCenter.x-(titleWidth/2)));
    txtTitle.setAttribute("y",(PAGE_DATA.svgCenter.y-(250)));
    txtSubTitle.setAttribute("x",(PAGE_DATA.svgCenter.x-(subTitleWidth/2)));
    txtSubTitle.setAttribute("y",(PAGE_DATA.svgCenter.y-(225)));


    for(var pieIndex = 0;pieIndex < PAGE_DATA.pieSet.length;pieIndex++)
    {
      var pieData = PAGE_DATA.pieSet[pieIndex];

      var textPos = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,pieData.midAngle),pieData.midAngle) ;

      var txtBoundingRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+pieIndex).getBoundingClientRect();
      var txtLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+pieIndex).getComputedTextLength();
      var newTextPos = new Point(textPos.x,textPos.y);
      if(pieData.midAngle > 180)
        newTextPos.x-=txtLen;

      var otrTextPos;
      if((pieData.midAngle > 90 && pieData.midAngle <= 180) || (pieData.midAngle > 270 && pieData.midAngle <= 360))
        var otrTextPos = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,PAGE_DATA.pieSet[Math.abs(pieIndex-1)].midAngle),PAGE_DATA.pieSet[Math.abs(pieIndex-1)].midAngle) ;
      else if((pieData.midAngle > 0 && pieData.midAngle <= 90) || (pieData.midAngle > 180 && pieData.midAngle <= 270))
        var otrTextPos = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,PAGE_DATA.pieSet[(pieIndex+1)%PAGE_DATA.pieSet.length].midAngle),PAGE_DATA.pieSet[(pieIndex+1)%PAGE_DATA.pieSet.length].midAngle) ;

      if(Math.abs(otrTextPos.y - newTextPos.y) < 50 )
        if(pieData.midAngle > 90 && pieData.midAngle < 270)
          newTextPos.y = (otrTextPos.y+50);
        else
          newTextPos.y = (otrTextPos.y-50);


      var colorLegend = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #colorLegend"+pieIndex);
      colorLegend.setAttribute("x",newTextPos.x);
      colorLegend.setAttribute("y",newTextPos.y+(txtBoundingRect.height/2));
      colorLegend.setAttribute("width",txtLen);
      colorLegend.setAttribute("height",5);

      var txtPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+pieIndex);
      txtPie.setAttribute("x",newTextPos.x);
      txtPie.setAttribute("y",newTextPos.y);

      var sPoint = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData.midAngle),pieData.midAngle) ;
      
      if(pieData.midAngle > 180 )
      {
        var lPath = ["M", textPos.x+5, newTextPos.y];
        lPath.push("L", textPos.x+15, newTextPos.y);
        lPath.push("L",sPoint.x,sPoint.y);
      }else {
        var lPath = ["M", textPos.x-5, newTextPos.y];
        lPath.push("L", textPos.x-15, newTextPos.y);
        lPath.push("L",sPoint.x,sPoint.y);
      }


      var pathToLegend = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pathToLegend"+pieIndex);
      pathToLegend.setAttribute("d",lPath.join(" "));

    }
  }/*End resetTextPos()*/

  var Point = function(x,y)
  {
    var obj = this;
    this.x = x;
    this.y = y;
    this.toString = function()
    {
      return "x:"+obj.x+", y:"+obj.y;
    };
  };

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }/*End polarToCartesian()*/


  function describeEllipticalArc(cx, cy, rx,ry, startAngle, endAngle, sweepFlag){
    var fullArc=false;  
    if(startAngle%360 === endAngle%360)  {
      endAngle--;
      fullArc = true;
    }

    var start = polarToCartesian(cx, cy, getEllipticalRadious(rx,ry,endAngle), endAngle);
    var end = polarToCartesian(cx, cy, getEllipticalRadious(rx,ry,startAngle), startAngle); 
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
      "center":new Point(cx,cy),
      "rx":rx,
      "ry":ry,
      "startAngle":startAngle,
      "endAngle":endAngle
    };
    return path;       
  }

  function getEllipticalRadious(rx,ry,angleInDegrees)
  {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    var r = (rx*ry)/Math.sqrt(((rx*rx)*(Math.sin(angleInRadians)*Math.sin(angleInRadians)))+((ry*ry)*(Math.cos(angleInRadians)*Math.cos(angleInRadians))));
    return r;
  }/*End getEllipticalRadious()*/

  function getColor(index){
    var Colors = {};
    Colors.names = {
      blue1:"#1982C8",
      goldenYellow:"#F3CA19",
      green1:"#31B76D",
      bluelight:"#95CEFF",
      maroon:"#991919",
      rust:"#F56B19",
      babyPink:"#F15C80",
      biscuit:"#F7A35C",
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
  };

  function colorLuminance(hex, lum) {

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


  function prepareDataSet()
  {
    for(var i=0;i<PAGE_OPTIONS.dataSet.length;i++)
    {
      var found=-1;
      for(var j=0;j<PAGE_DATA.uniqueDataSet.length;j++)
      {
        if(PAGE_OPTIONS.dataSet[i].label.toLowerCase() === PAGE_DATA.uniqueDataSet[j].label.toLowerCase()) 
        {
          found = j;
          break;  
        }
      }
      if(found === -1) {
        PAGE_DATA.uniqueDataSet.push({"label":PAGE_OPTIONS.dataSet[i].label,"value":PAGE_OPTIONS.dataSet[i].value});
      }else {
        PAGE_DATA.uniqueDataSet[j]={"label":PAGE_OPTIONS.dataSet[i].label,"value":parseFloat(PAGE_OPTIONS.dataSet[i].value)+parseFloat(PAGE_DATA.uniqueDataSet[j].value)};
      }
      PAGE_DATA.totalValue += parseFloat(PAGE_OPTIONS.dataSet[i].value);
    }
    for(var i=0;i<PAGE_DATA.uniqueDataSet.length;i++)
    {
      var percent = 100*parseFloat(PAGE_DATA.uniqueDataSet[i].value)/PAGE_DATA.totalValue;
      PAGE_DATA.uniqueDataSet[i]["percent"] = percent;
    }
  }/*End prepareDataSet()*/


  var _mergeRecursive = function(obj1, obj2) 
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
  };
  
  function describeRoundedRect(x, y, width, height, radius) {
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
  }/*End describeRoundedRect()*/
  
  function appendMenu(){
    var strSVG="";
    strSVG += "<g id='smartCharts-menu'>";
    
    strSVG += "<filter id='dropshadow' width='150%' height='150%'>";
    strSVG += "  <feGaussianBlur in='StrokePaint' stdDeviation='1'/> <!-- stdDeviation is how much to blur -->";
    strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/> <!-- how much to offset -->";
    strSVG += "  <feMerge> ";
    strSVG += "    <feMergeNode/> <!-- this contains the offset blurred image -->";
    strSVG += "    <feMergeNode in='SourceGraphic'/> <!-- this contains the element that the filter is applied to -->";
    strSVG += "  </feMerge>";
    strSVG += "</filter>";
    strSVG += "  <path id='smartCharts-menu-icon' filter='url(#dropshadow)' d='"+describeRoundedRect(((PAGE_DATA.svgCenter.x*2)-50),20,35,30,5).join(" ")+"' fill='white' stroke-width='0.5' stroke='#717171' />";
    strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-45)+"' y1='30' x2='"+((PAGE_DATA.svgCenter.x*2)-20)+"' y2='30' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-45)+"' y1='35' x2='"+((PAGE_DATA.svgCenter.x*2)-20)+"' y2='35' style='stroke:#333;stroke-width:1' />";
    strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-45)+"' y1='40' x2='"+((PAGE_DATA.svgCenter.x*2)-20)+"' y2='40' style='stroke:#333;stroke-width:1' />";
    strSVG += "<\/g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
    
    /*Bind menu events*/
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu #smartCharts-menu-icon").addEventListener("click", function(e){
      e.stopPropagation();
      e.preventDefault();
      var offSetX = 150,offSetY = 60, intervalId;
      var menuSidePanel = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu-panel");
      if(menuSidePanel.length > 0)
      {
        menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
      }else {
        strSVG = "  <g id='smartCharts-menu-panel'>";
        strSVG += "  <rect class='menu-panel-elem' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX)+"' y='"+(offSetY)+"' width='"+(offSetX)+"' height='"+(PAGE_DATA.svgCenter.y*2-offSetY-2)+"' fill='white' stroke-width='1' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-elem' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX)+"' y='"+(offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#EEF' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <text fill='#717171' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX+25)+"' y='"+(offSetY+32)+"' font-family='Lato' >Download As...</text>";
        
        strSVG += "  <rect class='menu-panel-menu' save-as='jpeg' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX)+"' y='"+(2*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-menu' save-as='png' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX)+"' y='"+(3*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";
        strSVG += "  <rect class='menu-panel-menu' save-as='svg' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX)+"' y='"+(4*offSetY)+"' width='"+(offSetX-1)+"' height='"+(offSetY)+"' fill='#fff' stroke-width='0' stroke='#333' \/>";

        
        strSVG += "  <text fill='#717171' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX+25)+"' y='"+(2*offSetY+32)+"' font-family='Lato' >JPEG</text>";
        strSVG += "  <text fill='#717171' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX+25)+"' y='"+(3*offSetY+32)+"' font-family='Lato' >PNG</text>";
        strSVG += "  <text fill='#717171' x='"+((PAGE_DATA.svgCenter.x*2)-offSetX+25)+"' y='"+(4*offSetY+32)+"' font-family='Lato' >SVG</text>";

        strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-offSetX+15)+"' y1='"+(3*offSetY)+"' x2='"+(PAGE_DATA.svgCenter.x*2-15)+"' y2='"+(3*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-offSetX+15)+"' y1='"+(4*offSetY)+"' x2='"+(PAGE_DATA.svgCenter.x*2-15)+"' y2='"+(4*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-offSetX+15)+"' y1='"+(5*offSetY)+"' x2='"+(PAGE_DATA.svgCenter.x*2-15)+"' y2='"+(5*offSetY)+"' style='stroke:#eee;stroke-width:1' />";
        strSVG += "  <line x1='"+((PAGE_DATA.svgCenter.x*2)-offSetX+15)+"' y1='"+(6*offSetY)+"' x2='"+(PAGE_DATA.svgCenter.x*2-15)+"' y2='"+(6*offSetY)+"' style='stroke:#eee;stroke-width:1' />";

        strSVG += "  <\/g>";
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
        
        /*submenu bind event*/
        var menuPanel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu-panel");
        var submenus = menuPanel.querySelectorAll(".menu-panel-menu");
        for(var i=0;i<submenus.length;i++){
          submenus[i].addEventListener("click", function(e){
          e.stopPropagation();
          e.preventDefault();
            var saveAsType = e.target.getAttribute("save-as");
            opts = {width:PAGE_OPTIONS.width, height:PAGE_OPTIONS.height, srcElem:"#"+PAGE_OPTIONS.targetElem+" svg", type:saveAsType, 
              saveSuccess:function(){
                document.querySelector("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu").style.visibility = "visible";
              }
            };
            var menuSidePanel = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu-panel");
            if(menuSidePanel.length > 0)
              menuSidePanel[0].parentNode.removeChild(menuSidePanel[0]);
            document.querySelector("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu").style.visibility = "hidden";
            saveAsImage(opts);
          
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
          menuPanel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #smartCharts-menu-panel");
          if(menuPanel)
            menuPanel.style["transform"] = "translate("+(slideOffset)+"px,"+0+"px)";
          else 
            clearInterval(intervalId);
          if(slideOffset === 0)
            clearInterval(intervalId);
        },50);
      }
    },false);
  }/*End appendMenu()*/
  
  
  function saveAsImage(opts){
    /*opts = {width:800, height:500, srcElem:"", type:"jpeg", saveSuccess:null};*/
    var svgString = new XMLSerializer().serializeToString(document.querySelector(opts.srcElem));
    svgString = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
    var img = new Image();
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    
    img.onload = function() {
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
      link.download = "smartChart."+opts.type;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if(typeof opts.saveSuccess === "function")
        opts.saveSuccess.call(this);
    };

  }/*End saveAsImage()*/
  function appendWaterMark(){
    var strSVG = "<g id='smartCharts-watermark'>";
    strSVG += "   <text fill='#717171' x='"+(5)+"' y='"+(10)+"' font-size='10' font-family='Lato' style='cursor: pointer;' onclick=\"window.open('http://www.smartcharts.cf')\">Powered by SmartCharts</text>";
    strSVG += "   </g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
  }/*End appendWaterMark()*/

  function addFont(){
    var fontLink =document.createElement("link");
    fontLink.href = "https://fonts.googleapis.com/css?family=Lato:400,700";
    fontLink.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(fontLink);
  }/*End addFont()*/

  init();
};/*End of drawPieChart3D()*/
  
