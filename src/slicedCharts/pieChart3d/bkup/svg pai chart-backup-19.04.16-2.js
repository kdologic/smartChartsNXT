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
    
    function init()
    {
      $.extend(true,PAGE_OPTIONS,opts);
      
      var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink' version='1.1' width='"+PAGE_OPTIONS.width+"' height='"+PAGE_OPTIONS.height+"' id='pieChart3D'  style='cursor: w-resize;'> <\/svg>";
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
      strSVG += "  <rect width='"+(PAGE_DATA.svgCenter.x*2)+"' height='"+(PAGE_DATA.svgCenter.y*2)+"' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
      strSVG += "<\/g>";
      strSVG += "<g>";
      strSVG += "  <text id='txtTitleGrp' fill='#717171' font-family='Verdana' >";
      strSVG += "    <tspan id='txtTitle' x='100' y='50' font-size='25'><\/tspan>";
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
      strSVG += "<g class='pie' id='pie"+index+"' stroke-width='0' style='cursor:pointer;'>";
      strSVG += "  <path id='lowerArcPie"+index+"' fill='"+color+"' stroke='"+darkShade+"' stroke-width='0' \/> ";
      strSVG += "  <path id='sideBPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"'\/>";
      strSVG += "  <path id='sideCPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' \/>";
      strSVG += "  <path id='sideAPie"+index+"'  fill='"+darkShade+"' stroke='"+darkShade+"' \/>";
      strSVG += "  <rect id='txtContainer"+index+"' width='300' height='100' fill='"+lighterShade+"' style='opacity:1;' />";
      strSVG += "  <text id='txtPieGrpPie"+index+"' fill='#717171' font-family='Verdana' >";
      strSVG += "  <tspan id='txtPie"+index+"' x='100' y='50' font-size='12'><\/tspan></text>";
      //strSVG += "  <path id='txtPathPie"+index+"'  stroke-width='0.7' style='fill: none; stroke: rgb(216, 220, 197); stroke-opacity: 1;'\/>";
      strSVG += "  <path id='upperArcPie"+index+"'  fill='"+lighterShade+"' stroke='"+darkShade+"' \/>";
      strSVG += "  <text id='txtPercentPie"+index+"' fill='#717171' font-family='Verdana' fill='#000' style='opacity:0.5;' >"+percent+"%</text>";
      strSVG += "<\/g>";

      strSVG += "<defs>";
      strSVG += "  <radialGradient gradientUnits = 'userSpaceOnUse' id='gradRadialPie"+index+"' cx='50%' cy='50%' r='70%' fx='40%' fy='100%'>";
      strSVG += "    <stop offset='0%' style='stop-color:"+lighterShade+";stop-opacity:1' \/>";
      strSVG += "    <stop offset='100%' style='stop-color:"+darkShade+";stop-opacity:1' \/>";
      strSVG += "  <\/radialGradient>";
      strSVG += "<\/defs>";

      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(strSVG);
      
      var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
      var lowerArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,(PAGE_DATA.pieCenter.y+PAGE_DATA.pieThickness),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,startAngle,endAngle,0);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#upperArcPie"+index).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#lowerArcPie"+index).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideAPie"+index).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideBPie"+index).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideCPie"+index).attr("d", describeArcFill(upperArcPath, lowerArcPath));//.attr("fill","url(#gradLinearPie"+index+")");
      var textLabel = PAGE_DATA.uniqueDataSet[index]["label"];
      textLabel = (textLabel.length > 20?textLabel.substring(0,20)+"...":textLabel);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#txtPie"+index).text(textLabel+", "+PAGE_DATA.uniqueDataSet[index]["value"]);
     
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
      
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie").each(function(){
        $(this).off("click");
        $(this).on("click",function(e){
          e.preventDefault();
          //e.stopPropagation();
          var pieData,elemId = $(this).attr("id"),sliceOut;
          for(var i=0;i<PAGE_DATA.pieSet.length;i++)
            if(PAGE_DATA.pieSet[i].id === elemId)
            {
              pieData = PAGE_DATA.pieSet[i];
              sliceOut = PAGE_DATA.pieSet[i].slicedOut;
              PAGE_DATA.pieSet[i].slicedOut = !PAGE_DATA.pieSet[i].slicedOut;
            }

          var index = elemId.substring("pie".length);
          var shiftIndex = sliceOut?15:1;
          var shiftInterval = setInterval(function(){
            var shiftedCentre = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious((shiftIndex*2),shiftIndex,pieData.midAngle), pieData.midAngle) ;
            var upperArcPath = describeEllipticalArc(shiftedCentre.x,shiftedCentre.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData["upperArcPath"].startAngle,pieData["upperArcPath"].endAngle,0);
            var lowerArcPath = describeEllipticalArc(shiftedCentre.x,(shiftedCentre.y+20),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,pieData["lowerArcPath"].startAngle,pieData["lowerArcPath"].endAngle,0);
            if(shiftIndex === 0)
            {
              var upperArcPath = pieData.upperArcPath;
              var lowerArcPath = pieData.lowerArcPath;
            }
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#upperArcPie"+index).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#lowerArcPie"+index).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideAPie"+index).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideBPie"+index).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
            $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideCPie"+index).attr("d", describeArcFill(upperArcPath, lowerArcPath));
            
            shiftIndex = sliceOut?shiftIndex-1:shiftIndex+1;
            resetTextPos();
            if((!sliceOut && shiftIndex === 15)||(sliceOut && shiftIndex === -1))
              clearInterval(shiftInterval);
          },10);
          
        });
        
        $(this).off("mouseenter");
        $(this).on("mouseenter",function(e){
          e.stopPropagation();
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").off("mousemove");
          var mousePointer = new Point(e.pageX,e.pageY);
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#infoPopupBox").attr("x",mousePointer.x).attr("y",mousePointer.y);
          var strSVG = "";
          $(e.target).parents(".pie").append(strSVG);
        });
        
        $(this).off("mouseleave");
        $(this).on("mouseleave",function(e){
          e.stopPropagation();
          //$("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#infoPopupBox").hide();
          bindRotationEvent();
        });
      });
      
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
      //var rotationIndex = 1;
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie").each(function(){
        var elemId = $(this).attr("id");
        var pieData,index = elemId.substring("pie".length);
        for(var i=0;i<PAGE_DATA.pieSet.length;i++){
          if(PAGE_DATA.pieSet[i].id === elemId)
          {
            pieData = PAGE_DATA.pieSet[i];
          }
          PAGE_DATA.pieSet[i].slicedOut = false;
        }
        
        var upperArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y,PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["upperArcPath"].startAngle+rotationIndex),(pieData["upperArcPath"].endAngle+rotationIndex),0);
        var lowerArcPath = describeEllipticalArc(PAGE_DATA.pieCenter.x,(PAGE_DATA.pieCenter.y+PAGE_DATA.pieThickness),PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,(pieData["lowerArcPath"].startAngle+rotationIndex),(pieData["lowerArcPath"].endAngle+rotationIndex),0);
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#upperArcPie"+index).attr("d",upperArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#lowerArcPie"+index).attr("d",lowerArcPath.d).attr("fill","url(#gradRadialPie"+index+")");
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideAPie"+index).attr("d", describeRect(upperArcPath.center, upperArcPath.start,lowerArcPath.start, lowerArcPath.center));
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideBPie"+index).attr("d", describeRect(upperArcPath.center ,upperArcPath.end,lowerArcPath.end, lowerArcPath.center));
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#sideCPie"+index).attr("d", describeArcFill(upperArcPath, lowerArcPath));//.attr("fill","url(#gradLinearPie"+index+")");
        //$("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#txtPie"+index).text(PAGE_DATA.uniqueDataSet[index]["label"]+", "+PAGE_DATA.uniqueDataSet[index]["value"]);
        var midAngle = (((pieData["upperArcPath"].startAngle+rotationIndex)+(pieData["upperArcPath"].endAngle+rotationIndex))/2)%360.00;

        PAGE_DATA.pieSet[index]["upperArcPath"] = upperArcPath;
        PAGE_DATA.pieSet[index]["lowerArcPath"] = lowerArcPath;
        PAGE_DATA.pieSet[index]["midAngle"] = (midAngle<0?360+midAngle:midAngle);
        resetTextPos();
        //console.log(PAGE_DATA.pieSet[index]);
      });
      resetOrdering();  
     
    }/*End rotateChart()*/
    
    function resetTextPos()
    {
      var titleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtTitle").getBBox();
      var subTitleBoundBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #txtTitleGrp #txtSubtitle").getBBox();
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtTitle").attr("x",(PAGE_DATA.svgCenter.x-(titleBoundBox.width/2))).attr("y",50);
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#txtTitleGrp").find("#txtSubtitle").attr("x",(PAGE_DATA.svgCenter.x-(subTitleBoundBox.width/2))).attr("y",75);
    
      $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find(".pie").each(function(){
        var elemId = $(this).attr("id");
        var pieData,index = elemId.substring("pie".length);
        for(var i=0;i<PAGE_DATA.pieSet.length;i++){
          if(PAGE_DATA.pieSet[i].id === elemId)
          {
            pieData = PAGE_DATA.pieSet[i];
          }
        }
          
        var textPos = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth+100,PAGE_DATA.pieHeight+50,pieData.midAngle), pieData.midAngle) ;
        var txtBoundingRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #pieChart3D #pie"+index+" #txtPie"+index).getBBox();//getBoundingClientRect();
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#txtContainer"+index).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y+(txtBoundingRect.height/2)).attr("width",txtBoundingRect.width).attr("height",5);
        
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#txtPie"+index).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y);
        $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#pie"+index).find("#txtPercentPie"+index).attr("x",textPos.x-(txtBoundingRect.width/2)).attr("y",textPos.y+(txtBoundingRect.height/2)+25).attr("width",txtBoundingRect.width).attr("height",5);
      });
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
    
    /*function rainbow(numOfSteps, step) {
      // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
      // Adam Cole, 2011-Sept-14
      // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
      var r, g, b;
      var h = step / numOfSteps;
      var i = ~~(h * 6);
      var f = h * 6 - i;
      var q = 1 - f;
      switch(i % 6){
          case 0: r = 1; g = f; b = 0; break;
          case 1: r = q; g = 1; b = 0; break;
          case 2: r = 0; g = 1; b = f; break;
          case 3: r = 0; g = q; b = 1; break;
          case 4: r = f; g = 0; b = 1; break;
          case 5: r = 1; g = 0; b = q; break;
      }
      var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
      return (c);
    }/*End rainbow()*/
    
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
    
    /* usage shadeBlendConvert()
     * url:http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
     *  var color1 = "rgb(114,93,20)";
        var color2 = "rgb(114,93,20,0.37423)";
        c = shadeBlendConvert(0.3,color1); // rgb(114,93,20) + [30% Lighter] => rgb(156,142,91)
        c = shadeBlendConvert(0.42,color2,"c"); //rgb(114,93,20,0.37423) + [42% Lighter] + [Convert] => #5fada177
        c = shadeBlendConvert(-0.13,color2,color8); // rgb(114,93,20,0.37423) + rgb(75,200,112,0.98631) + [13% Blend] => rgb(109,107,32,0.4538)
     */
    
    /*function shadeBlendConvert(p, from, to) {
      if(typeof(p)!="number"||p<-1||p>1||typeof(from)!="string"||(from[0]!='r'&&from[0]!='#')||(typeof(to)!="string"&&typeof(to)!="undefined"))return null; //ErrorCheck
      if(!this.sbcRip)this.sbcRip=function(d){
          var l=d.length,RGB=new Object();
          if(l>9){
              d=d.split(",");
              if(d.length<3||d.length>4)return null;//ErrorCheck
              RGB[0]=i(d[0].slice(4)),RGB[1]=i(d[1]),RGB[2]=i(d[2]),RGB[3]=d[3]?parseFloat(d[3]):-1;
          }else{
              if(l==8||l==6||l<4)return null; //ErrorCheck
              if(l<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(l>4?d[4]+""+d[4]:""); //3 digit
              d=i(d.slice(1),16),RGB[0]=d>>16&255,RGB[1]=d>>8&255,RGB[2]=d&255,RGB[3]=l==9||l==5?r(((d>>24&255)/255)*10000)/10000:-1;
          }
          return RGB;}
      var i=parseInt,r=Math.round,h=from.length>9,h=typeof(to)=="string"?to.length>9?true:to=="c"?!h:false:h,b=p<0,p=b?p*-1:p,to=to&&to!="c"?to:b?"#000000":"#FFFFFF",f=sbcRip(from),t=sbcRip(to);
      if(!f||!t)return null; //ErrorCheck
      if(h)return "rgb("+r((t[0]-f[0])*p+f[0])+","+r((t[1]-f[1])*p+f[1])+","+r((t[2]-f[2])*p+f[2])+(f[3]<0&&t[3]<0?")":","+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*10000)/10000:t[3]<0?f[3]:t[3])+")");
      else return "#"+(0x100000000+(f[3]>-1&&t[3]>-1?r(((t[3]-f[3])*p+f[3])*255):t[3]>-1?r(t[3]*255):f[3]>-1?r(f[3]*255):255)*0x1000000+r((t[0]-f[0])*p+f[0])*0x10000+r((t[1]-f[1])*p+f[1])*0x100+r((t[2]-f[2])*p+f[2])).toString(16).slice(f[3]>-1||t[3]>-1?1:3);
    }/*End shadeBlendConvert()*/
    
    function resetOrdering()
    {
      var pieSet = PAGE_DATA.pieSet.slice(0);
      pieSet.sort(function(a, b) {
        return parseFloat(a.midAngle) - parseFloat(b.midAngle);
      });
      
      var top = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,0), 0) ;
      //var right = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,90), 90) ;
      var bottom = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,180), 180) ;
      //var left = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,270), 270) ;
      //console.log("top:"+top.x+"-"+top.y+", right:"+right.x+"-"+right.y+", bottom:"+bottom.x+"-"+bottom.y+",  left:"+left.x+"-"+left.y);
      try {
        var lowerMidPie,upperMidPie;
        for(var pieId = 0;pieId < pieSet.length ;pieId++)
        {
          
          for(var angle = parseFloat(pieSet[pieId]["upperArcPath"].startAngle);angle <= parseFloat(pieSet[pieId]["upperArcPath"].endAngle);angle+=0.5)
          {
            var eachPoint = polarToCartesian(PAGE_DATA.pieCenter.x,PAGE_DATA.pieCenter.y, getEllipticalRadious(PAGE_DATA.pieWidth,PAGE_DATA.pieHeight,angle), angle) ;
            if(Math.round(parseFloat(top.x)) === Math.round(parseFloat(eachPoint.x)) && Math.round(parseFloat(top.y)) === Math.round(parseFloat(eachPoint.y)))
              upperMidPie = pieId;
            if(Math.round(parseFloat(bottom.x)) === Math.round(parseFloat(eachPoint.x)) && Math.round(parseFloat(bottom.y)) === Math.round(parseFloat(eachPoint.y)))
              lowerMidPie = pieId;
          }
         
        }
        console.log("lower mid pie:"+lowerMidPie);
        console.log("upper mid pie:"+upperMidPie);
        console.log("pieSet---------------------->");
        console.log(pieSet);
        reAppend(pieSet,upperMidPie);
        
        for(var pieId = 0;pieId < lowerMidPie ;pieId++)
        { 
          if(pieId !== upperMidPie)
            reAppend(pieSet,pieId);
        }
          
        for(var pieId = pieSet.length-1 ;pieId > lowerMidPie ;pieId--)
        {
          if(pieId !== upperMidPie)
            reAppend(pieSet,pieId);
        }
        
        reAppend(pieSet,lowerMidPie);
        bindEvents();
        function reAppend(arrPieSet,index)
        {
          var pie = $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+arrPieSet[index].id);//.find("#upperArcPie"+arrPieSet[index].id.substring("pei".length));
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").find("#"+arrPieSet[index].id);//.find("#upperArcPie"+arrPieSet[index].id.substring("pei".length)).remove();
          $("#"+PAGE_OPTIONS.targetElem).find("#pieChart3D").append(pie);//.find("#"+arrPieSet[index].id)
        }
      }catch(ex){
        console.log(ex);
      }
    }/*End resetOrdering()*/
    

    
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
