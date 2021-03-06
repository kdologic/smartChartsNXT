/*
 * SVG PieChart 3D
 * @CreatedOn:27-Apr-2016
 * @LastUpdated:06-Jun-2016
 * @Author:Kausik Dey
 * @description:This will generate a 3d pie chart. Using SVG 1.1 elements and HTML 5 stndard 
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
 */


(function(){
  if(typeof window.jQuery === "undefined"){
    document.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js" ><\/script>');
  }
  window.drawPieChart3D = function(opts)
  {
    if(typeof window.jQuery === "undefined"){
      setTimeout(function(){
          drawPieChart3D(opts);
      },100);
      return;
    }
    
    var PAGE_OPTIONS = {};
    
    var PAGE_DATA = {
      scaleX:0,
      scaleY:0,
      svgCenter:0,
      pieCenter:0,
      pieThickness:20,
      uniqueDataSet:[],
      totalValue:0,
      pieWidth:200,
      pieHeight:100,
      pieSet:[],
      dragStartAngle:0,
      dragEndPoint:null,
      mouseDown: 0,
      mouseDrag:0
    };
    
    var PAGE_CONST = {
      FIX_WIDTH:800,
      FIX_HEIGHT:500
    };
    
    function init()
    {
      $.extend(true,PAGE_OPTIONS,opts);
      PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
      PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;
      var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                  "preserveAspectRatio='xMidYMid meet'"+
                  "currentScale='1'"+
                  "viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" 800 500'"+
                  "version='1.1'" +
                  "width='"+PAGE_OPTIONS.width+"'"+
                  "height='"+PAGE_OPTIONS.height+"'"+
                  "id='pieChart3D'"+
                  "style='width:100%;height:auto; max-width:"+PAGE_OPTIONS.width+"px;max-height:"+PAGE_OPTIONS.height+"px'> <\/svg>"; 
      $("#"+PAGE_OPTIONS.targetElem).append(strSVG);
      var svgWidth = parseInt($("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").attr("width"));
      var svgHeight = parseInt($("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").attr("height"));
      PAGE_DATA.svgCenter = new Point((svgWidth/2),(svgHeight/2)) ;
      PAGE_DATA.pieCenter = new Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;
      
      prepareChart();
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
      strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Verdana' >";
      strSVG += "    <tspan id='txtTitle' x='"+(100/PAGE_CONST.FIX_WIDTH*PAGE_OPTIONS.width)+"' y='"+(50/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height)+"' font-size='25'><\/tspan>";
      strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='15'><\/tspan>";
      strSVG += "  <\/text>";
      strSVG += "<\/g>";
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(strSVG);
      
      /*Set Title of chart*/
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtTitle").text(PAGE_OPTIONS.title);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtSubtitle").text(PAGE_OPTIONS.subTitle);
      
    
      for(var i=0;i<PAGE_DATA.uniqueDataSet.length;i++)
      {
         startAngle = endAngle;
         endAngle += (PAGE_DATA.uniqueDataSet[i].percent*360/100);
         createPie(startAngle,endAngle,getColor(i),i);
      }
      $("#"+PAGE_OPTIONS.targetElem).html($("#"+PAGE_OPTIONS.targetElem).html());
      resetOrdering();  
      bindEvents();
      resetTextPos();
      divergeElements();
      convergeElements();
      makeUnselectable($("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("text"));
      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
        makeUnselectable($("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex));
      
    }/*End prepareChart()*/
    
    function createPie(startAngle,endAngle,color,index)
    {
      var percent = parseFloat((endAngle-startAngle)*100/360).toFixed(2);
      var darkShade = colorLuminance(color,-0.2);
      var lighterShade = colorLuminance(color,0.2);
      var strSVG="";
      strSVG += "  <path class='pie"+index+"' id='lowerArcPie"+index+"' fill='"+color+"' stroke='"+darkShade+"' stroke-width='0' style='cursor:pointer;' \/> ";
      strSVG += "  <path class='pie"+index+"' id='sideBPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' style='cursor:pointer;'\/>";
      strSVG += "  <path class='pie"+index+"' id='sideCPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' style='cursor:pointer;' \/>";
      strSVG += "  <path class='pie"+index+"' id='sideAPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' style='cursor:pointer;'\/>";
      strSVG += "  <rect class='pie"+index+"' id='txtContainer"+index+"' width='300' height='100' fill='"+lighterShade+"' style='opacity:1;' />";
      strSVG += "  <text class='pie"+index+"' id='txtPieGrpPie"+index+"' fill='#717171' font-family='Verdana' >";
      strSVG += "  <tspan class='pie"+index+"' id='txtPie"+index+"' x='100' y='50' font-size='12'><\/tspan></text>";
      strSVG += "  <path class='pie"+index+"' id='upperArcPie"+index+"'  fill='"+lighterShade+"' stroke='#eee' stroke-width='"+(PAGE_OPTIONS.outline||1)+"' style='cursor:pointer;' \/>";//"+lighterShade+"'
      strSVG += "  <text class='pie"+index+"' id='txtPercentPie"+index+"' fill='#717171' font-family='Verdana' fill='#000' style='opacity:0.5;' >"+percent+"%</text>";

      strSVG += "<defs>";
      strSVG += "  <radialGradient gradientUnits = 'userSpaceOnUse' id='gradRadialPie"+index+"' cx='50%' cy='50%' r='70%' fx='40%' fy='100%'>";
      strSVG += "    <stop offset='0%' style='stop-color:"+lighterShade+";stop-opacity:1' \/>";
      strSVG += "    <stop offset='100%' style='stop-color:"+darkShade+";stop-opacity:1' \/>";
      strSVG += "  <\/radialGradient>";
      strSVG += "<\/defs>";

      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(strSVG);
      
      var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
      var lowerArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,(PAGE_DATA.pieCenter.y+PAGE_DATA.pieThickness),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+index).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#lowerArcPie"+index).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideAPie"+index).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideBPie"+index).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideCPie"+index).attr("d", describeArcFill(upperArcPath, lowerArcPath));//.attr("fill","url(#gradLinearPie"+index+")");
      var textLabel = PAGE_DATA.uniqueDataSet[index]["label"];
      textLabel = (textLabel.length > 20?textLabel.substring(0,20)+"...":textLabel);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtPie"+index).text(textLabel+", "+PAGE_DATA.uniqueDataSet[index]["value"]);
     
      var midAngle = (startAngle+endAngle)/2;
      var pie = {
        "id":"pie"+index,
        "upperArcPath":upperArcPath,
        "lowerArcPath": lowerArcPath,
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
            var pieData,elemId = $(e.target).attr("class"),sliceOut;
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
              var shiftedCentre = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious((shiftIndex*2),shiftIndex,pieData.midAngle), pieData.midAngle) ;
              var upperArcPath = describeEllipticalArc(shiftedCentre.x,shiftedCentre.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData["upperArcPath"].startAngle,pieData["upperArcPath"].endAngle,0);
              var lowerArcPath = describeEllipticalArc(shiftedCentre.x,(shiftedCentre.y+20),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData["lowerArcPath"].startAngle,pieData["lowerArcPath"].endAngle,0);
              if(shiftIndex === 0)
              {
                var upperArcPath = pieData.upperArcPath;
                var lowerArcPath = pieData.lowerArcPath;
              }
              $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+index).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
              $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#lowerArcPie"+index).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
              $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideAPie"+index).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
              $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideBPie"+index).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
              $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideCPie"+index).attr("d", describeArcFill(upperArcPath, lowerArcPath));

              shiftIndex = sliceOut?shiftIndex-1:shiftIndex+1;
              resetTextPos();
              if((!sliceOut && shiftIndex === 15)||(sliceOut && shiftIndex === -1))
                clearInterval(shiftInterval);
            },10);
          }/*End onClick()*/

          
          
          
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).off("mousedown");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("mousedown", function(e){
              e.stopPropagation();
              PAGE_DATA.mouseDown = 1;
              
            });
            
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).off("touchstart");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("touchstart", function(e){
              e.stopPropagation();
              PAGE_DATA.mouseDown = 1;
              
            });
            
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).off("mouseup");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("mouseup", function(e){
              e.stopPropagation();
              PAGE_DATA.mouseDown = 0;
              if(PAGE_DATA.mouseDrag === 0)
                onClick(e);
              PAGE_DATA.mouseDrag = 0;
            });
            
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).off("touchend");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("touchend", function(e){
              e.stopPropagation();
              PAGE_DATA.mouseDown = 0;
              PAGE_DATA.mouseDrag = 0;
            });
            
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("mousemove", function(e){
              if(PAGE_DATA.mouseDown ===1){
                var dragStartPoint = cursorPoint(e);
                var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

                if(dragAngle > PAGE_DATA.dragStartAngle)
                  rotateChart(2,false);
                else
                  rotateChart(-2,false);
                PAGE_DATA.dragStartAngle = dragAngle;
                PAGE_DATA.mouseDrag = 1;
              }
            });
            
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).off("touchmove");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).on("touchmove", function(e) {
              e.preventDefault(); 
              var dragStartPoint = cursorPoint(e.originalEvent.changedTouches[0]);
              var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

              if(dragAngle > PAGE_DATA.dragStartAngle)
                rotateChart(2,false);
              else
                rotateChart(-2,false);
              PAGE_DATA.dragStartAngle = dragAngle;
              PAGE_DATA.mouseDrag = 1;
            });
          

        }
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").off("mouseup");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").on("mouseup",function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          PAGE_DATA.mouseDrag = 0;
        });
        
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").off("touchend");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").on("touchend",function(e){
          e.stopPropagation();
          PAGE_DATA.mouseDown = 0;
          PAGE_DATA.mouseDrag = 0;
        });
      }
      catch(ex){console.log(ex);}
    }/*End bindEvents()*/
    
    function divergeElements(){
      if(PAGE_DATA.uniqueDataSet.length >1){
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
          var transposePoint = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious((10000),(10000),pieData.midAngle), pieData.midAngle) ;

          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).css({"transform": "translate("+(transposePoint.x-PAGE_DATA.pieCenter.x)+"px,"+(transposePoint.y-PAGE_DATA.pieCenter.y)+"px)"});
        }
      }
    }/*End divergeElemnts()*/
    
    function convergeElements(){
      if(PAGE_DATA.uniqueDataSet.length >1){
        for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
        {
          var shiftRadiousX = (PAGE_DATA.svgCenter.x*2);
          var shiftRadiousY  = (PAGE_DATA.svgCenter.y*2);
          var pieData,elemId = "pie"+pieIndex;
          for(var i=0;i<PAGE_DATA.pieSet.length;i++){
            if(PAGE_DATA.pieSet[i].id === elemId)
              pieData = PAGE_DATA.pieSet[i];
          }
          (function(shiftRadiousX,shiftRadiousY,pieData,pieIndex)
          { 
            var reverseFlag = 0,replaceUnit = 5;
            setTimeout(function()
            {
              var intervalId = setInterval(function()
              {
                var transform = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, shiftRadiousX, pieData.midAngle) ;
                transform = new Point((transform.x-PAGE_DATA.pieCenter.x),(transform.y-PAGE_DATA.pieCenter.y));
                $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).css({"transform": "translate("+transform.x+"px,"+transform.y+"px)"});
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
                  $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).css({"transform": ""});
                }
              },5);
            },(pieIndex*400));
          })(shiftRadiousX,shiftRadiousY,pieData,pieIndex);
        }
      }
    }/*End convergeElements()*/
    
    
    function cursorPoint(evt){
      var svg = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D");
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
        
        var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["upperArcPath"].startAngle+rotationIndex),(pieData["upperArcPath"].endAngle+rotationIndex),0);
        var lowerArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,(PAGE_DATA.pieCenter.y+PAGE_DATA.pieThickness),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["lowerArcPath"].startAngle+rotationIndex),(pieData["lowerArcPath"].endAngle+rotationIndex),0);
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#upperArcPie"+pieIndex).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+pieIndex+")");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#lowerArcPie"+pieIndex).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+pieIndex+")");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideAPie"+pieIndex).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideBPie"+pieIndex).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#sideCPie"+pieIndex).attr("d", describeArcFill(upperArcPath, lowerArcPath));
        var midAngle = (((pieData["upperArcPath"].startAngle+rotationIndex)+(pieData["upperArcPath"].endAngle+rotationIndex))/2)%360.00;

        PAGE_DATA.pieSet[pieIndex]["upperArcPath"] = upperArcPath;
        PAGE_DATA.pieSet[pieIndex]["lowerArcPath"] = lowerArcPath;
        PAGE_DATA.pieSet[pieIndex]["midAngle"] = (midAngle<0?360+midAngle:midAngle);
        if(!ignorOrdering)
          resetTextPos();
      }
      if(!ignorOrdering)
        resetOrdering();  
     
    }/*End rotateChart()*/
    
    function resetOrdering()
    {
      try {
        var viewPoint = new Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y*2);
        createDot(viewPoint);
        var renderingOrder = {
          upperArc:[],
          sideArc:[],
          lowerArc:[]
        };
        for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
        {
          var arcBottom,arcTop,distanceBottom,distanceTop;
          var pieElems = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart3D .pie"+pieIndex);
          for(var i=0;i<pieElems.length;i++)
          {
            if(pieElems[i].nodeName ==="tspan")continue;
              
            arcBottom = getArcBottomCenter(pieElems[i].getBBox());
            arcTop = getArcTopCenter(pieElems[i].getBBox());
            
            distanceBottom = (viewPoint.y - arcBottom.y);
            distanceTop = arcTop.y;
            var isInside;
            
            var lowerArcTriangle = [],arrLowerArcPath = $("#"+PAGE_OPTIONS.targetElem).find("#lowerArcPie"+(pieIndex)).attr("d").split(" ");
            lowerArcTriangle.push(new Point(arrLowerArcPath[1],arrLowerArcPath[2]));
            lowerArcTriangle.push(new Point(arrLowerArcPath[9],arrLowerArcPath[10]));
            lowerArcTriangle.push(new Point(arrLowerArcPath[12],arrLowerArcPath[13]));
            
            if($(pieElems[i]).attr("id").match("sideB"))
            {
              var polygonA = [],arrSideBPath = $(pieElems[i]).attr("d").split(" ");
              polygonA.push(new Point(arrSideBPath[1],arrSideBPath[2]));
              polygonA.push(new Point(arrSideBPath[4],arrSideBPath[5]));
              polygonA.push(new Point(arrSideBPath[7],arrSideBPath[8]));
              polygonA.push(new Point(arrSideBPath[10],arrSideBPath[11]));
              var sideBUpperEdgeCenter = new Point((parseFloat(polygonA[0].x)+parseFloat(polygonA[1].x))/2,(parseFloat(polygonA[0].y)+parseFloat(polygonA[1].y))/2);
              isInside =is_in_triangle(sideBUpperEdgeCenter.x,sideBUpperEdgeCenter.y,lowerArcTriangle[0].x,lowerArcTriangle[0].y,lowerArcTriangle[1].x,lowerArcTriangle[1].y,lowerArcTriangle[2].x,lowerArcTriangle[2].y);
            }else if($(pieElems[i]).attr("id").match("sideA"))
            {
              var polygonA = [],arrSideAPath = $(pieElems[i]).attr("d").split(" ");
              polygonA.push(new Point(arrSideAPath[1],arrSideAPath[2]));
              polygonA.push(new Point(arrSideAPath[4],arrSideAPath[5]));
              polygonA.push(new Point(arrSideAPath[7],arrSideAPath[8]));
              polygonA.push(new Point(arrSideAPath[10],arrSideAPath[11]));
              var sideAUpperEdgeCenter = new Point((parseFloat(polygonA[0].x)+parseFloat(polygonA[1].x))/2,(parseFloat(polygonA[0].y)+parseFloat(polygonA[1].y))/2);
              isInside =is_in_triangle(sideAUpperEdgeCenter.x,sideAUpperEdgeCenter.y,lowerArcTriangle[0].x,lowerArcTriangle[0].y,lowerArcTriangle[1].x,lowerArcTriangle[1].y,lowerArcTriangle[2].x,lowerArcTriangle[2].y);
            }
            
            if($(pieElems[i]).attr("id").match("upperArcPie"))
              renderingOrder.upperArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
            else if($(pieElems[i]).attr("id").match("lowerArcPie"))
              renderingOrder.lowerArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
            else if($(pieElems[i]).attr("id").match("sideA") || $(pieElems[i]).attr("id").match("sideB"))
              renderingOrder.sideArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop,"isInside":isInside});
            else if($(pieElems[i]).attr("id").match("sideC"))
              renderingOrder.sideArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
          }
        }
        for(var i=0;i<renderingOrder.sideArc.length;i++)
        {
          var pieId = renderingOrder.sideArc[i].elemId.substring(8);
          var upperArcBotm;
          for(var j=0;j<renderingOrder.upperArc.length;j++)
          {
            if(renderingOrder.upperArc[j].elemId === "upperArcPie"+pieId)
              upperArcBotm = renderingOrder.upperArc[j].distBottom;
          }
          renderingOrder.sideArc[i].upperArcBottom = upperArcBotm;
        }
       
        renderingOrder.upperArc.sort(function(a, b) {
          return parseFloat(a.distBottom) - parseFloat(b.distBottom);
        });
        renderingOrder.lowerArc.sort(function(a, b) {
          return parseFloat(a.distBottom) - parseFloat(b.distBottom);
        });
        renderingOrder.sideArc.sort(function(a, b) {
          if(parseFloat(a.distBottom) !== parseFloat(b.distBottom))
            return parseFloat(a.distBottom) - parseFloat(b.distBottom);
          else if(parseFloat(a.upperArcBottom) !== parseFloat(b.upperArcBottom))
            return parseFloat(a.upperArcBottom) - parseFloat(b.upperArcBottom);
          else
            return parseFloat(a.isInside) - parseFloat(b.isInside);
        });
        
        
        function reDraw(elemId)
        {
          var elem = $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+elemId);
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+elemId).remove();
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(elem);
        }
        
        for(var i=renderingOrder.lowerArc.length-1;i>=0;i--)
          reDraw(renderingOrder.lowerArc[i].elemId);
        for(var i=renderingOrder.sideArc.length-1;i>=0;i--)
          reDraw(renderingOrder.sideArc[i].elemId);
        for(var i=renderingOrder.upperArc.length-1;i>=0;i--)
          reDraw(renderingOrder.upperArc[i].elemId);
        
        bindEvents();
        
      }catch(ex){
        console.log(ex);
      }
    }/*End resetOrdering()*/
    
    function is_in_triangle (px,py,ax,ay,bx,by,cx,cy)
    {
      /*credit: http://www.blackpawn.com/texts/pointinpoly/default.html*/
      var v0 = [cx-ax,cy-ay];
      var v1 = [bx-ax,by-ay];
      var v2 = [px-ax,py-ay];

      var dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
      var dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
      var dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
      var dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
      var dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);

      var invDenom = 1/ (dot00 * dot11 - dot01 * dot01);

      var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

      return ((u >= 0) && (v >= 0) && (u + v < 1))?1:0;
    }
    
    function getArcCenter(bBox)
    {
      return {x:(bBox.x+(bBox.width/2)),y:(bBox.y+(bBox.height/2))};
    }

    function getArcBottomCenter(bBox)
    {
      return {x:(bBox.x+(bBox.width/2)),y:(bBox.y+bBox.height)};
    }
    
    function getArcTopCenter(bBox)
    {
      return {x:(bBox.x+(bBox.width/2)),y:bBox.y};
    }
    
    function createDot(center,color)
    {
      var svg = document.getElementsByTagName('svg')[0]; //Get svg element
      var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
      newElement.setAttribute("cx",center.x); //Set path's data
      newElement.setAttribute("cy",center.y); //Set path's data
      newElement.setAttribute("r",3); //Set path's data
      newElement.setAttribute("class","dot"); //Set path's data
      newElement.style.fill = color; //Set stroke colour
      newElement.style.strokeWidth = "1px"; //Set stroke width
      svg.appendChild(newElement);
    }

    function createRect(left,top,width,height,color)
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
    }
    
    function resetTextPos()
    {
      //var titleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtTitle").getBBox();
      var titleWidth = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtTitle").getComputedTextLength();
      //var subTitleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtSubtitle").getBBox();
      var subTitleWidth = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtSubtitle").getComputedTextLength();
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtTitle").attr("x",(PAGE_DATA.svgCenter.x-(titleWidth/2))).attr("y",(PAGE_DATA.svgCenter.y-(200)));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtSubtitle").attr("x",(PAGE_DATA.svgCenter.x-(subTitleWidth/2))).attr("y",(PAGE_DATA.svgCenter.y-(175)));
      
      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
      {
        var pieData,elemId = "pie"+pieIndex;
        for(var i=0;i<PAGE_DATA.pieSet.length;i++){
          if(PAGE_DATA.pieSet[i].id === elemId)
          {
            pieData = PAGE_DATA.pieSet[i];
          }
        }
        var textPos = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth+100,PAGE_DATA.pieHeight+50,pieData.midAngle), pieData.midAngle) ;
        var txtBoundingRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtPie"+pieIndex).getBoundingClientRect();//.getBBox();
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtContainer"+pieIndex).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y+(txtBoundingRect.height/2)).attr("width",txtBoundingRect.width).attr("height",5);
        
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtPie"+pieIndex).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y);
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtPercentPie"+pieIndex).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y+(txtBoundingRect.height/2)+25).attr("width",txtBoundingRect.width).attr("height",5);
      }
    }/*End resetTextPos()*/
    
    function getDistanceBetween(point1, point2)
    {
        var dist = Math.sqrt((point1.x-point2.x)*(point1.x-point2.x)+(point1.y-point2.y)*(point1.y-point2.y))||0;
        return dist;
    }/*End getDistanceBetween()*/
    
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
    
    function describeRect(p1,p2,p3,p4){

      var d = [
          "M", p1.x, p1.y, 
          "L", p2.x, p2.y,
          "L", p3.x, p3.y,
          "L", p4.x, p4.y,
          "Z"
      ].join(" ");

      return d;
    }/*End describeRect()*/
    
    function describeArcFill(arc1,arc2){
      var revArc2 = describeEllipticalArc(arc2["center"].x,arc2["center"].y,arc2.rx,arc2.ry,arc2.endAngle,arc2.startAngle,1);
      var d = [
        "M", arc1["start"].x, arc1["start"].y,
        "A", arc1["arc"],
        "L", arc2["end"].x, arc2["end"].y,
        "A", revArc2["arc"],
        "Z"
      ].join(" ");
      
      return d;
    }/*End describeArcFill()*/
    
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
    
    function makeUnselectable(node) {
      $(node).css({"-moz-tap-highlight-color": "rgba(0, 0, 0, 0)","-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)","-webkit-user-select": "none","-khtml-user-select": "none","-moz-user-select":"none","-ms-user-select": "none","-o-user-select": "none","user-select": "none"});
   
    }/*End makeUnselectable()*/
    
    init();
  };/*End of drawPieChart3D()*/
  
})(window.jQuery);
