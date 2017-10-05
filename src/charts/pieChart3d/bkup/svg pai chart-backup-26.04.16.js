(function(){
  if(typeof window.jQuery === "undefined"){
    document.write('<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js" ><\/script>');
  }
  window.drawPieChart = function(opts)
  {
    if(typeof window.jQuery === "undefined"){
      setTimeout(function(){
          drawPieChart(opts);
      },100);
      return;
    }
    
    
    var PAGE_OPTIONS = {
      /*"width":800,
      "height":500,
      "title":"Sales Report of ABC Group",
      "subTitle":"Report for the month of March, 2016",
      "targetElem":"chartContainer",
      "dataSet":[
        {
          "label":"Sumit Bag",
          "value":"372"
        },
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
        }
        
      ]*/
    };
    
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
      dragEndPoint:null
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
                  //"viewBox='"+scaleX+" "+scaleY+" "+(PAGE_CONST.FIX_WIDTH+((-1)*2*scaleX))+" "+(PAGE_CONST.FIX_HEIGHT+((-1)*2*scaleY))+"'"+
              //"viewBox='"+(PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width)+" "+(PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height)+" "+PAGE_OPTIONS.width+" "+PAGE_OPTIONS.height+"'"+
                  "viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" 800 500'"+
                  "version='1.1'" +
                  "width='"+PAGE_OPTIONS.width+"'"+
                  "height='"+PAGE_OPTIONS.height+"'"+
                  "id='pieChart3D'"+
                  "style='cursor:w-resize;'> <\/svg>";
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
      //console.log(PAGE_DATA.uniqueDataSet);
      
      var strSVG="";
      strSVG += "<g>";
      strSVG += "  <rect x='"+((-1)*PAGE_DATA.scaleX/2)+"' y='"+((-1)*PAGE_DATA.scaleY/2)+"' width='"+((PAGE_DATA.svgCenter.x*2)+PAGE_DATA.scaleX)+"' height='"+((PAGE_DATA.svgCenter.y*2)+PAGE_DATA.scaleY)+"' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
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
         createPie(startAngle,endAngle,getColor(i),i);//rainbow(PAGE_DATA.uniqueDataSet.length,i)
      }
      $("#"+PAGE_OPTIONS.targetElem).html($("#"+PAGE_OPTIONS.targetElem).html());
      resetOrdering();  
      bindEvents();
      resetTextPos();
      makeUnselectable($("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D"));
      
    }/*End prepareChart()*/
    
    function createPie(startAngle,endAngle,color,index)
    {
      //console.log(color);
      //console.log("startAngle:"+startAngle+", endAngl:"+endAngle);
      var percent = parseFloat((endAngle-startAngle)*100/360).toFixed(2);
      var darkShade = colorLuminance(color,-0.2);
      //var lighterShade = colorLuminance(color,0.1);
      var lighterShade = colorLuminance(color,0.2);
      //console.log("dark shade:"+darkShade+", light Shade:"+lighterShade);
      var strSVG="";
      //strSVG += "<g class='pie' id='pie"+index+"' stroke-width='0' style='cursor:pointer;'>";
      strSVG += "  <path class='pie"+index+"' id='lowerArcPie"+index+"' fill='"+color+"' stroke='"+darkShade+"' stroke-width='0' \/> ";
      strSVG += "  <path class='pie"+index+"' id='sideBPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"'\/>";
      strSVG += "  <path class='pie"+index+"' id='sideCPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' \/>";
      strSVG += "  <path class='pie"+index+"' id='sideAPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' \/>";
      strSVG += "  <rect class='pie"+index+"' id='txtContainer"+index+"' width='300' height='100' fill='"+lighterShade+"' style='opacity:1;' />";
      strSVG += "  <text class='pie"+index+"' id='txtPieGrpPie"+index+"' fill='#717171' font-family='Verdana' >";
      strSVG += "  <tspan class='pie"+index+"' id='txtPie"+index+"' x='100' y='50' font-size='12'><\/tspan></text>";
      //strSVG += "  <path id='txtPathPie"+index+"'  stroke-width='0.7' style='fill: none; stroke: rgb(216, 220, 197); stroke-opacity: 1;'\/>";
      strSVG += "  <path class='pie"+index+"' id='upperArcPie"+index+"'  fill='"+lighterShade+"' stroke='none' \/>";//"+lighterShade+"'
      strSVG += "  <text class='pie"+index+"' id='txtPercentPie"+index+"' fill='#717171' font-family='Verdana' fill='#000' style='opacity:0.5;' >"+percent+"%</text>";
      //strSVG += "<\/g>";

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
      //console.log("startAngle:"+startAngle+" end angle:"+endAngle+' mid:'+midAngle);
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
      if(PAGE_DATA.uniqueDataSet.length <=1 )
        return;
      
      for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
      {
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).off("click");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).on("click", function(){
          var pieData,elemId = $(this).attr("class"),sliceOut;
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
        });
        
        
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).off("mouseenter");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).on("mouseenter", function(e){
          e.stopPropagation();
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").off("mousemove");
          var mousePointer = new Point(e.pageX,e.pageY);
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#infoPopupBox").attr("x",mousePointer.x).attr("y",mousePointer.y);
          var strSVG = "";
          $(e.target).parents(".pie").append(strSVG);
        });
        
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).off("mouseleave");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie"+pieIndex).on("mouseleave",function(e){
          e.stopPropagation();
          //$("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#infoPopupBox").hide();
          bindRotationEvent();
        });
    
      }
      
      function bindRotationEvent()
      {
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").off("mousemove");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").on("mousemove", function(e) {
         
          if (e.which === 1) {
            var dragStartPoint = new Point(e.pageX,e.pageY);
            var dragAngle = getAngle(PAGE_DATA.pieCenter,dragStartPoint);

            if(dragAngle > PAGE_DATA.dragStartAngle)
              rotateChart(2);
            else
              rotateChart(-2);
            PAGE_DATA.dragStartAngle = dragAngle;
          }
        });
      }/*End bindRotationEvent()*/
        
      bindRotationEvent();
    }/*End bindEvents()*/
    
    function getAngle(point1,point2)
    {
      var deltaX = point2.x - point1.x;
      var deltaY = point2.y - point1.y;
      var rad = Math.atan2(deltaY, deltaX);
      var deg = rad*180.0/Math.PI;
      deg = (deg <0)?deg+450:deg+90;
      return deg%360;
    }
    
    function rotateChart(rotationIndex)
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
        resetTextPos();
      }
     
      resetOrdering();  
     
    }/*End rotateChart()*/
    
    function resetOrdering()
    {
      try {
        var viewPoint = new Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y*2);
        var renderingOrder = {
          upperArc:[],
          sideArc:[],
          lowerArc:[]
        };
        
        //$(".pie").remove();
        for(var pieIndex = 0;pieIndex < PAGE_DATA.uniqueDataSet.length;pieIndex++)
        {
          var arcBottom,arcTop,distanceBottom,distanceTop;
          var pieElems = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #pieChart3D .pie"+pieIndex);
         
          for(var i=0;i<pieElems.length;i++)
          {
            arcBottom = getArcBottomCenter(pieElems[i].getBBox());
            arcTop = getArcTopCenter(pieElems[i].getBBox());
            
            distanceBottom = (viewPoint.y - arcBottom.y);
            distanceTop = arcTop.y;
            
            if($(pieElems[i]).attr("id").match("upperArcPie"))
              renderingOrder.upperArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
            else if($(pieElems[i]).attr("id").match("lowerArcPie"))
              renderingOrder.lowerArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
            else if($(pieElems[i]).attr("id").match("side"))
              renderingOrder.sideArc.push({elemId:$(pieElems[i]).attr("id"),distBottom:distanceBottom,distTop:distanceTop});
            
            //console.log(arcBottom);
            //console.log(distanceBottom);
            
            //createDot(arcBottom,$(pieElems[i]).attr("stroke"));
            
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
            return parseFloat(a.distTop) - parseFloat(b.distTop);
        });
        
        
        console.log(renderingOrder);
        for(var i=renderingOrder.lowerArc.length-1;i>=0;i--)
          reDraw(renderingOrder.lowerArc[i].elemId);
        for(var i=renderingOrder.sideArc.length-1;i>=0;i--)
          reDraw(renderingOrder.sideArc[i].elemId);
        for(var i=renderingOrder.upperArc.length-1;i>=0;i--)
          reDraw(renderingOrder.upperArc[i].elemId);
        
        
        bindEvents();
        
        function reDraw(elemId)
        {
          var elem = $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+elemId);
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+elemId).remove();
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(elem);
        }
        
      }catch(ex){
        console.log(ex);
      }
    }/*End resetOrdering()*/
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
      var titleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtTitle").getBBox();
      var subTitleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtSubtitle").getBBox();
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtTitle").attr("x",(PAGE_DATA.svgCenter.x-(titleBoundBox.width/2))).attr("y",(50/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtSubtitle").attr("x",(PAGE_DATA.svgCenter.x-(subTitleBoundBox.width/2))).attr("y",(75/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height));
      
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
        var txtBoundingRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtPie"+pieIndex).getBBox();//getBoundingClientRect();
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
        lime: "#00ff00",
        gold: "#ffd700",
        maroon: "#800000",
        navy: "#000080",
        olive: "#808000",
        red: "#ff0000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        yellow: "#ffff00",
        brown: "#a52a2a",
        violet: "#800080",
        magenta: "#ff00ff",
        khaki: "#f0e68c",
        aqua: "#00ffff",
        azure: "#f0ffff",
        beige: "#f5f5dc",
        blue: "#0000ff",
        cyan: "#00ffff",
        darkblue: "#00008b",
        darkcyan: "#008b8b",
        darkgrey: "#a9a9a9",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkorchid: "#9932cc",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        green: "#008000",
        indigo: "#4b0082",
        lightblue: "#add8e6",
        lightcyan: "#e0ffff",
        lightgreen: "#90ee90",
        lightgrey: "#d3d3d3",
        lightpink: "#ffb6c1",
        lightyellow: "#ffffe0"
      };
      var result;
      var count = 0;
      //var index = Math.round(Math.random()*40);
      //console.log(index);
      for (var prop in Colors.names)
          if (index === count++)
             result = Colors.names[prop];
         
      //console.log(result);
      return result;
    };
    
    function colorLuminance(hex, lum) {

      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '');
      if (hex.length < 6) {
        hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      }
      lum = lum || 0;

      // convert to decimal and change luminosity
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
      $(node).find("text").css({"-webkit-user-select": "none","-khtml-user-select": "none","-moz-user-select":"none","-ms-user-select": "none","-o-user-select": "none","user-select": "none"});
   
    }/*End makeUnselectable()*/
    
    
    init();
  };/*End of drawPieChart()*/
})(window.jQuery);
