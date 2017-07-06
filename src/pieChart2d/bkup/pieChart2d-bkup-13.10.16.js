/*
 * SVG PieChart 2D
 * @Version:1.0.0
 * @CreatedOn:07-Jul-2016
 * @LastUpdated:09-Aug-2016
 * @Author:SmartChartsNXT
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
  SmartChartsNXT.ready(function(){
    var PieChart2D = new SmartChartsNXT.PieChart(settings);
  });
 */


window.SmartChartsNXT.PieChart = function(opts)
{
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
    $SC.util.mergeRecursive(PAGE_OPTIONS,opts);
    $SC.addFont();

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
    
    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";
    document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend",strSVG);

    var svgWidth = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").getAttribute("width");
    var svgHeight = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").getAttribute("height");
    PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth/2),(svgHeight/2)) ;
    PAGE_DATA.pieCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;

    prepareChart();
    $SC.appendWaterMark(PAGE_OPTIONS.targetElem,PAGE_DATA.scaleX,PAGE_DATA.scaleY);
  }/*End init()*/

  function prepareChart()
  {
    var startAngle,endAngle=0;
    prepareDataSet();
    var strSVG="";
    if(PAGE_OPTIONS.canvasBorder){
      strSVG += "<g>";
      strSVG += "  <rect x='"+((-1)*PAGE_DATA.scaleX/2)+"' y='"+((-1)*PAGE_DATA.scaleY/2)+"' width='"+((PAGE_DATA.svgCenter.x*2)+PAGE_DATA.scaleX)+"' height='"+((PAGE_DATA.svgCenter.y*2)+PAGE_DATA.scaleY)+"' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
    }
    strSVG += "<g>";
    strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='txtTitle' x='"+(100/PAGE_CONST.FIX_WIDTH*PAGE_OPTIONS.width)+"' y='"+(50/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height)+"' font-size='25'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
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
       createPie(startAngle,endAngle,$SC.util.getColor(i),i);
    }

    bindEvents();
    resetTextPos();
    divergeElements();
    convergeElements();
    $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem,PAGE_DATA.svgCenter,PAGE_DATA.scaleX,PAGE_DATA.scaleY);

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
    strSVG += "  <path class='pie"+index+"'  id='upperArcPie"+index+"'  fill='"+lighterShade+"' stroke='#eee' stroke-width='"+(PAGE_OPTIONS.outline||1)+"' style='cursor:pointer;' \/>";
    strSVG += "  <path class='pie"+index+"' id='pathToLegend"+index+"'  fill='none' stroke='#555' stroke-width='1' \/>";

    strSVG += "<defs>";
    strSVG += "  <radialGradient gradientUnits = 'userSpaceOnUse' id='"+PAGE_OPTIONS.targetElem+"piechart-gradRadialPie"+index+"' cx='50%' cy='50%' r='70%' fx='40%' fy='100%'>";
    strSVG += "    <stop offset='0%' style='stop-color:"+lighterShade+";stop-opacity:1' \/>";
    strSVG += "    <stop offset='100%' style='stop-color:"+darkShade+";stop-opacity:1' \/>";
    strSVG += "  <\/radialGradient>";
    strSVG += "<\/defs>";

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D").insertAdjacentHTML("beforeend",strSVG);

    var upperArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
    var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+index);
    upperArcPie.setAttribute("d",upperArcPath.d);
    upperArcPie.setAttribute("fill","url(#"+PAGE_OPTIONS.targetElem+"piechart-gradRadialPie"+index+")");
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
    var mouseDownPos;
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
            var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(shiftIndex*2,shiftIndex*2,pieData.midAngle), pieData.midAngle) ;
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
          mouseDownPos = {x :e.clientX,y:e.clientY};
          var elemId = e.target.getAttribute("class");
          var pieIndex = elemId.substring("pie".length);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pieHover"+pieIndex).setAttribute("d","");
          PAGE_DATA.mouseDown = 1;

        },false);

        upperArcPie.addEventListener("touchstart", function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 1;
        },false);

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
          if(PAGE_DATA.mouseDown ===1 && (mouseDownPos.x !== e.clientX && mouseDownPos.y !== e.clientY )){
            var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e);
            var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

            if(dragAngle > PAGE_DATA.dragStartAngle)
              rotateChart(2,false);
            else
              rotateChart(-2,false);
            PAGE_DATA.dragStartAngle = dragAngle;
            PAGE_DATA.mouseDrag = 1;
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
          }else{
            var mousePos = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e);
            var pieData,elemId = e.target.getAttribute("class");
            var pieIndex = elemId.substring("pie".length);

            for(var i=0;i<PAGE_DATA.pieSet.length;i++)
                if(PAGE_DATA.pieSet[i].id === elemId)
                  pieData = PAGE_DATA.pieSet[i];
            var row1 = PAGE_DATA.uniqueDataSet[pieIndex].label+", "+ PAGE_DATA.uniqueDataSet[pieIndex].value;
            var row2 = PAGE_DATA.uniqueDataSet[pieIndex].percent.toFixed(2)+"%";
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem,mousePos,$SC.util.getColor(pieIndex),row1,row2);
          }
        },false);

        upperArcPie.addEventListener("touchmove", function(e) {
          e.preventDefault(); 
          var dragStartPoint = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e.changedTouches[0]);
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
              var shiftedCentre = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(shiftIndex*2,shiftIndex*2,pieData.midAngle), pieData.midAngle) ;
              pieHoverPath = $SC.geom.describeEllipticalArc(shiftedCentre.x,shiftedCentre.y,PAGE_DATA.pieWidth+20,PAGE_DATA.pieHeight+20,pieData.upperArcPath.startAngle,pieData.upperArcPath.endAngle,0);
            }
            else
              pieHoverPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth+20,PAGE_DATA.pieHeight+20,pieData.upperArcPath.startAngle,pieData.upperArcPath.endAngle,0);
            pieHover.setAttribute("d",pieHoverPath.d);
          }
        },false);

        upperArcPie.addEventListener("mouseleave", function(e){
          var elemId = e.target.getAttribute("class");
          var pieIndex = elemId.substring("pie".length);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #pieHover"+pieIndex).setAttribute("d","");
          $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
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


  function divergeElements(){
    if(PAGE_DATA.uniqueDataSet.length >1){
      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
      { 
        var pieData = PAGE_DATA.pieSet[pieIndex],elemId = "pie"+pieIndex;
        PAGE_DATA.pieSet[pieIndex].slicedOut = false;
        var transposePoint = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious((10000),(10000),pieData.midAngle), pieData.midAngle) ;
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
              var transform = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, shiftRadiousX, pieData.midAngle) ;
              transform = new $SC.geom.Point((transform.x-PAGE_DATA.pieCenter.x),(transform.y-PAGE_DATA.pieCenter.y));
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
      var upperArcPath = $SC.geom.describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["upperArcPath"].startAngle+rotationIndex),(pieData["upperArcPath"].endAngle+rotationIndex),0);
      var upperArcPie = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #upperArcPie"+pieIndex);
      upperArcPie.setAttribute("d",upperArcPath.d);
      upperArcPie.setAttribute("fill","url(#"+PAGE_OPTIONS.targetElem+"piechart-gradRadialPie"+pieIndex+")");

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

      var textPos = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,pieData.midAngle),pieData.midAngle) ;

      var txtBoundingRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+pieIndex).getBoundingClientRect();
      var txtLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart2D #txtPie"+pieIndex).getComputedTextLength();
      var newTextPos = new $SC.geom.Point(textPos.x,textPos.y);
      if(pieData.midAngle > 180)
        newTextPos.x-=txtLen;

      var otrTextPos;
      if((pieData.midAngle > 90 && pieData.midAngle <= 180) || (pieData.midAngle > 270 && pieData.midAngle <= 360))
        var otrTextPos = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,PAGE_DATA.pieSet[Math.abs(pieIndex-1)].midAngle),PAGE_DATA.pieSet[Math.abs(pieIndex-1)].midAngle) ;
      else if((pieData.midAngle > 0 && pieData.midAngle <= 90) || (pieData.midAngle > 180 && pieData.midAngle <= 270))
        var otrTextPos = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.pieWidth+50,PAGE_DATA.pieHeight+50,PAGE_DATA.pieSet[(pieIndex+1)%PAGE_DATA.pieSet.length].midAngle),PAGE_DATA.pieSet[(pieIndex+1)%PAGE_DATA.pieSet.length].midAngle) ;

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

      var sPoint = $SC.geom.polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, $SC.geom.getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData.midAngle),pieData.midAngle) ;
      
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

  init();
};/*End of drawPieChart3D()*/
  
