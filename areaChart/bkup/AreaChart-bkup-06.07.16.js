/*
 * SVG Area Chart 
 * @CreatedOn:04-Jul-2016
 * @Author:Kausik Dey
 * @description: SVG Area Chart, that support multiple series, and zoom window
 * JSFiddle:https://jsfiddle.net/KCoder/4j4wvLjc/
 * @Sample caller code:
  var settings = {
    "width":800,
    "height":500,
    "title":"Sales Report of ABC Group",
    "subTitle":"Report for the year, 2016",
    "targetElem":"chartContainer",
    "canvasBorder":false,
    "bgColor":"white",
    "dataSet":{
      "xAxis":{
        "categories":["Jan","Feb","Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        "title":"Month"
      },
      "yAxis":{
        "title":"Total Sales",
        "prefix":"Rs."
      },
      "series":[
        {
          name: 'John',
          data: [3000, 0, 333, 555, 444, 2000, 1212, 3323, 470, 5051,6751,3000, 0, 333, 555, 444, 2000, 1212, 3323, 470, 5051, 6751,3000,7832,3229,5983,470, 5051, 6751,3000,4483,2832]//[3, 4, 3, 5, 4, 2, 1, 3, 4, 5,4]
        },
        {
          name: 'Jane',
          data: [800,400,444, 2000, 1212, 3323,444, 2000, 1212, 3323]
        }
      ]
    }
  };       

  window.onload = function(){
    drawAreaChart(settings);
  };

 */


window.drawAreaChart = function(opts)
{

  var PAGE_OPTIONS = { };

  var PAGE_DATA = {
    scaleX:0,
    scaleY:0,
    svgCenter:0,
    chartCenter:0,
    uniqueDataSet:[],
    maxima:0,
    minima:0,
    marginLeft:0,
    marginRight:0,
    marginTop:0,
    marginBottom:0,
    gridBoxWidth:0,
    gridBoxHeight:0,
    fullChartHeight:60,
    fullSeries:[],
    fsScaleX:0,
    windowLeftIndex:0,
    windowRightIndex:-1,
    longestSeries:0,
    series:[],
    mouseDown:0
  };

  var PAGE_CONST = {
    FIX_WIDTH:800,
    FIX_HEIGHT:500,
    hGridCount:7
  };
  

  function init()
  {
    _mergeRecursive(PAGE_OPTIONS,opts);
    addFont();
    console.log(PAGE_OPTIONS);
    PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
    PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;
    

    var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                "preserveAspectRatio='xMidYMid meet'"+
                "currentScale='1'"+
                "viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" 800 500'"+
                "version='1.1'" +
                "width='"+PAGE_OPTIONS.width+"'"+
                "height='"+PAGE_OPTIONS.height+"'"+
                "id='areaChart'"+
                "style='background:"+(PAGE_OPTIONS.bgColor||"white")+";width:100%;height:auto; max-width:"+PAGE_OPTIONS.width+"px;max-height:"+PAGE_OPTIONS.height+"px -moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'"+
                "> <\/svg>";
    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = strSVG;
    appendWaterMark();
    
    var svgWidth = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").getAttribute("width"));
    var svgHeight = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").getAttribute("height"));
    PAGE_DATA.svgCenter = new Point((svgWidth/2),(svgHeight/2)) ;
    PAGE_DATA.chartCenter = new Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;
    PAGE_DATA.marginLeft = ((-1)*PAGE_DATA.scaleX/2)+100,PAGE_DATA.marginRight =((-1)*PAGE_DATA.scaleX/2)+10; //(PAGE_DATA.svgCenter.x*2)*10/100; ;
    PAGE_DATA.marginTop = ((-1)*PAGE_DATA.scaleY/2)+100;
    PAGE_DATA.marginBottom = ((-1)*PAGE_DATA.scaleY/2)+150;//(PAGE_DATA.svgCenter.x*2)*15/100;
    
    
    prepareChart();
    
    var longestSeries = 0,longSeriesLen = 0;
    for(var i=0;i<PAGE_DATA.fullSeries.length;i++)
    {
      if(PAGE_DATA.fullSeries[i].length > longSeriesLen){
        longestSeries = i;
        longSeriesLen = PAGE_DATA.fullSeries[i].length;
      }
    }
    PAGE_DATA.longestSeries = longestSeries;
    PAGE_DATA.windowRightIndex = longSeriesLen-1;

  }/*End init()*/

  function prepareChart()
  {
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
    
    
    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    strSVG += "<filter id='dropshadow' height='130%'>";
    strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>"; 
    strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>"; 
    strSVG += "  <feMerge>"; 
    strSVG += "    <feMergeNode/>";
    strSVG += "    <feMergeNode in='SourceGraphic'/>";
    strSVG += "  </feMerge>";
    strSVG += "</filter>";
    
    strSVG += "<g id='fullSeriesContr'>";
    strSVG += "</g>";
    
    strSVG += "<g id='toolTipContainer'>";
    strSVG += "  <path id='toolTip'  fill='white' style='filter:url(#dropshadow)' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
    strSVG += "  <text id='txtToolTipGrp' fill='#717171' font-family='Lato' >";
    strSVG += "    <tspan id='toolTipXval' font-size='12'><\/tspan>";
    strSVG += "    <tspan id='toolTipYval' font-size='12'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strSVG);
    
    /*Set Title of chart*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    createGrid();
    createFullSeries();
    
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      createSeries(PAGE_OPTIONS.dataSet.series[index].data,index,scaleX);
      createLegands(index);
      appendGradFill(index);
    }
    
    createVerticalLabel();
    
    var catList = [],scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(0,PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
    for(var i=0;i<PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length;i++)
      catList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    createHorizontalLabel(catList,scaleX);
    
    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-30)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+55)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.xAxis.title+"<\/text>";
    strSVG +="<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft-30)+"' y='"+(PAGE_DATA.marginTop+(PAGE_DATA.gridBoxHeight/2)-5)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.yAxis.title+"<\/text>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strSVG);
    
    document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = document.getElementById(PAGE_OPTIONS.targetElem).innerHTML;
    resetTextPositions();
    
    var longestFullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeries_"+PAGE_DATA.longestSeries);
    var fullSXinterval = (PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
    resetSliderPos("left",(PAGE_DATA.marginLeft+(fullSXinterval/2)));
    resetSliderPos("right",(longestFullSeries.getBBox().x+longestFullSeries.getBBox().width));
    
    bindEvents();
    bindSliderEvents();
    showAnimatedView();
    
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeriesContr");
    fullSeries.parentNode.removeChild(fullSeries);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").appendChild(fullSeries);
  }/*End prepareChart()*/
  
  
  
  
  function createFullSeries()
  {
    var strSVG = "";
    strSVG += "<rect id='sliderLeftOffset' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= '#eee'  style='stroke-width:0.1;stroke:#717171;' \/>";
    strSVG += "<rect id='sliderRightOffset' x='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= '#eee' style='stroke-width:0.1;stroke:#717171;' \/>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSVG);
    
    /* ploting actual points */
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      drawFullSeries(PAGE_OPTIONS.dataSet.series[index].data,index);
    }
    
    strSVG = "";
    strSVG += "<rect id='outerFrame' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight)+"' height='"+(PAGE_DATA.fullChartHeight)+"' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
    strSVG += "<path id='sliderLeft' stroke='#ffa500' fill='none' d='' stroke-width='2' opacity='0.5'></path>";
    strSVG += "<path id='sliderRight' stroke='#ffa500' fill='none' d='' stroke-width='2' opacity='0.5'></path>";
    strSVG += "<path id='slideRSel' stroke='#ffa500' fill='#ffffff' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='slideLSel' stroke='#ffa500' fill='#ffffff' d='' stroke-width='1' opacity='1'></path>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSVG);
    
    
    function drawFullSeries(dataSet,index)
    {
      var d =[];
      var scaleX = PAGE_DATA.fsScaleX = (PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
      var scaleYfull = (PAGE_DATA.fullChartHeight/PAGE_DATA.maxima);
      var arrPointsSet = [],strSeries="";
      for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
      {
        var p = new Point(PAGE_DATA.marginLeft+(dataCount*scaleX)+(scaleX/2),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+60)-(dataSet[dataCount]*scaleYfull));
        arrPointsSet.push(p);
      }
    
      PAGE_DATA.fullSeries.push(arrPointsSet);

      var line = [],area=[];
      strSeries = "<g id='fullSeries_"+index+"' class='fullSeries'>";
      line.push.apply(line,["M",arrPointsSet[0].x,arrPointsSet[0].y]);
      var point=0;
      for(var point = 0;(point+2)<arrPointsSet.length;point++)
      {
        var curve = describeBezireArc(arrPointsSet[point],arrPointsSet[point+1],arrPointsSet[point+2]);
        line.push.apply(line,curve);
      }
      line.push.apply(line,["L",arrPointsSet[arrPointsSet.length-1].x,arrPointsSet[arrPointsSet.length-1].y]);
      area.push.apply(area,line);
      d = ["L",arrPointsSet[arrPointsSet.length-1].x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+60),"L",PAGE_DATA.marginLeft+(scaleX/2),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+60),"Z"];
      area.push.apply(area,d);  
      strSeries +="<path id='fLine_"+index+"' stroke='"+getColor(index)+"' fill='none' d='"+line.join(" ")+"' stroke-width='1' opacity='1'></path>";
      strSeries +="<path id='fArea_"+index+"' stroke='none' fill='url(#gradLinear"+index+")' d='"+area.join(" ")+"' stroke-width='1' opacity='1'></path>";

      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSeries);
    }/*End drawFullSeries()*/
    
  }/*End createFullChart()*/
  

  function prepareDataSet(dataSet)
  {
    var maxSet=[],minSet=[];
    dataSet = dataSet || PAGE_OPTIONS.dataSet.series;
    for(var i=0;i<dataSet.length;i++)
    {
     var maxVal = Math.max.apply(null,dataSet[i].data);
     var minVal = Math.min.apply(null,dataSet[i].data);
     maxSet.push(maxVal);
     minSet.push(minVal);
    }
    PAGE_DATA.maxima = Math.max.apply(null,maxSet);
    PAGE_DATA.minima = Math.min.apply(null,minSet);
    PAGE_DATA.maxima = round(PAGE_DATA.maxima);
  }/*End prepareDataSet()*/

  function createSeries(dataSet,index,scaleX)
  {
    var d =[];
    var elemSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #series_"+index);
    var elemActualSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #series_actual_"+index);
    if(elemSeries) elemSeries.parentNode.removeChild(elemSeries);
    if(elemActualSeries)elemActualSeries.parentNode.removeChild(elemActualSeries);
    
    if(dataSet.length < 1)
      return;
    var interval = scaleX||(PAGE_DATA.gridBoxWidth/(dataSet.length));
    var scaleY = (PAGE_DATA.gridBoxHeight/PAGE_DATA.maxima); 
    var arrPointsSet = [],strSeries="";
   
    /* ploting actual points */
    var strSeries = "<g id='series_actual_"+index+"' class='series'>";
    for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
    {
      var p = new Point(PAGE_DATA.marginLeft+(dataCount*scaleX)+(interval/2),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount]*scaleY));
      if(dataCount === 0)
        d.push("M");
      else
        d.push("L");
      d.push(p.x);
      d.push(p.y);
      arrPointsSet.push(p);
    }
    strSeries +="<path stroke='"+getColor(index)+"' fill='none' d='"+d.join(" ")+"' stroke-dasharray='1,1' stroke-width='1' opacity='1'></path>";
    strSeries += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTipContainer").insertAdjacentHTML("beforebegin",strSeries);
    PAGE_DATA.series.push(arrPointsSet);

    var line = [],area=[];
    strSeries = "<g id='series_"+index+"' class='series'>";
    line.push.apply(line,["M",arrPointsSet[0].x,arrPointsSet[0].y]);
    var point=0;
    for(var point = 0;(point+2)<arrPointsSet.length;point++)
    {
      var curve = describeBezireArc(arrPointsSet[point],arrPointsSet[point+1],arrPointsSet[point+2]);
      line.push.apply(line,curve);
      if(dataSet.length <50)
        strSeries += "<circle cx="+arrPointsSet[point+1].x+" cy="+arrPointsSet[point+1].y+" r='3' class='dot' style='fill:"+getColor(index)+"; opacity: 1; stroke-width: 1px;'></circle>";
    }
    line.push.apply(line,["L",arrPointsSet[arrPointsSet.length-1].x,arrPointsSet[arrPointsSet.length-1].y]);
    area.push.apply(area,line);
    d = ["L",arrPointsSet[arrPointsSet.length-1].x,PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight,"L",PAGE_DATA.marginLeft+(interval/2),PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight,"Z"];
    area.push.apply(area,d);  
    strSeries +="<path id='line_"+index+"' stroke='"+getColor(index)+"' fill='none' d='"+line.join(" ")+"' stroke-width='1' opacity='1'></path>";
    strSeries +="<path id='area_"+index+"' stroke='none' fill='url(#gradLinear"+index+")' d='"+area.join(" ")+"' stroke-width='1' opacity='1'></path>";
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strSeries);

  }/*End createSeries()*/
  
  function appendGradFill(index) {
    /*Creating gradient fill for area*/
    var strSVG = "";
    strSVG += "<defs>";
    strSVG += "  <linearGradient gradientUnits = 'userSpaceOnUse' id='gradLinear"+index+"' x1='0%' y1='0%' x2='100%' y2='0%'>";
    strSVG += "  <stop offset='0%' style='stop-color:white;stop-opacity:0.5' />";
    strSVG += "  <stop offset='100%' style='stop-color:"+getColor(index)+";stop-opacity:0.5' />";
    strSVG += "  <\/radialGradient>";
    strSVG += "<\/defs>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strSVG);
  }/*End appendGradFill()*/
  
  function createLegands(index){
    /*Creating series legend*/
    var strSVG = "";
    strSVG ="<g id='series_legend_"+index+"' style='cursor:pointer;'>";
    strSVG +="<rect id='legend_color_"+index+"' x='"+PAGE_DATA.marginLeft+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+130)+"' width='10' height='10' fill='"+getColor(index)+"' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG +="<text id='legend_txt_"+index+"' font-size='12' x='"+(PAGE_DATA.marginLeft+20)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+140)+"' fill='#717171' font-family='Verdana' >"+PAGE_OPTIONS.dataSet.series[index].name+"</text>";
    strSVG +="</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #legendContainer").insertAdjacentHTML("beforeend",strSVG);
  }

  function describeBezireArc(point1,point2,point3)
  {
    //var mid1 = getMid(point1,point2);
    //var mid11 = getMid(mid1,point2);
    var mid2 = getMid(point2,point3);
    //var mid21 = getMid(point2,mid2);

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
  }/*End describeBezireArc()*/
  
  
  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }/*End polarToCartesian()*/
  
  function getEllipticalRadious(rx,ry,angleInDegrees)
  {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    var r = (rx*ry)/Math.sqrt(((rx*rx)*(Math.sin(angleInRadians)*Math.sin(angleInRadians)))+((ry*ry)*(Math.cos(angleInRadians)*Math.cos(angleInRadians))));
    return r;
  }/*End getEllipticalRadious()*/
  
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

  function createGrid()
  {
    PAGE_DATA.gridBoxWidth = (PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight;
    PAGE_DATA.gridBoxHeight = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom;
    PAGE_DATA.gridHeight = (((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom)/(PAGE_CONST.hGridCount-1));
    var hGrid = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #hGrid");
    if(hGrid)  hGrid.parentNode.removeChild(hGrid);
    
    var strGrid = "";
    strGrid += "<g id='hGrid'>";
    for(var gridCount = 0;gridCount<PAGE_CONST.hGridCount;gridCount++)
    {
      var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight),"L", PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    }
    strGrid +="<path id='hLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid +="<path id='vLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid +="<rect id='gridBox' x='"+PAGE_DATA.marginLeft+"' y='"+PAGE_DATA.marginTop+"' width='"+PAGE_DATA.gridBoxWidth+"' height='"+PAGE_DATA.gridBoxHeight+"' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></rect>";
    strGrid += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strGrid);

  }/*End createGrid()*/

  function createVerticalLabel()
  {
    var vTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #vTextLabel");
    if(vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);
    
    var interval = PAGE_DATA.maxima/(PAGE_CONST.hGridCount-1);
    var strText = "<g id='vTextLabel'>";
    for(var gridCount = PAGE_CONST.hGridCount-1,i=0;gridCount>=0;gridCount--)
    {
      var value = (i++*interval);
      value = (value >= 1000?(value/1000).toFixed(1)+"K":value.toFixed(1));
      strText +="<text font-family='Lato' fill='#717171'><tspan x='"+(PAGE_DATA.marginLeft-30)+"' y='"+(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)+5)+"' font-size='15' >"+((PAGE_OPTIONS.dataSet.yAxis.prefix)?PAGE_OPTIONS.dataSet.yAxis.prefix:"")+value+"<\/tspan></text>";
    }
    strText += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strText);
    
    var overFlow = 0; 
    var vTextLabel = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #vTextLabel tspan");
    for(var i=0;i<vTextLabel.length;i++){
      if((PAGE_DATA.marginLeft-vTextLabel[i].getComputedTextLength()-50) < 0)
        overFlow = Math.abs((PAGE_DATA.marginLeft-vTextLabel[i].getComputedTextLength()-50));
    }
    if(overFlow !== 0){
      PAGE_DATA.marginLeft = PAGE_DATA.marginLeft+overFlow;
      createGrid();
    }
  }/*End createVerticalLabel()*/

  function createHorizontalLabel(categories,scaleX)
  {
    var hTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #hTextLabel");
    if(hTextLabel) hTextLabel.parentNode.removeChild(hTextLabel);
    
    var interval = scaleX||(PAGE_DATA.gridBoxWidth/(categories.length));
    
    /*if there is too much categories then discurd some categories*/
    if(interval < 30) {
      var newCategories = [],skipLen = Math.ceil(30/interval); 
      for(var i=0;i<categories.length;i+=skipLen){
        newCategories.push(categories[i]);
      }
      categories = newCategories;
      interval*=skipLen;
    }
    var strText = "<g id='hTextLabel'>";
    for(var hText =0;hText<categories.length;hText++)
    { 
      strText +="<text font-family='Lato' fill='black' title='"+categories[hText]+"' x='"+(PAGE_DATA.marginLeft+(hText*interval)+(interval/2))+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+20)+"' ><tspan  font-size='12' >"+categories[hText]+"<\/tspan></text>";
    }
    
    for(var hText =0;hText<categories.length;hText++)
    { 
      var d = ["M",(PAGE_DATA.marginLeft+(hText*interval)+(interval)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),"L",(PAGE_DATA.marginLeft+(hText*interval)+(interval)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+5)];
      strText +="<path fill='none' d='"+d.join(" ")+"' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    }
    
    strText += "</g>";
    
    /*bind hover event*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").insertAdjacentHTML("beforeend",strText);
    var hTextLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #hTextLabel text");
    var totalHTextWidth = 0;
    for(var i=0;i<hTextLabels.length;i++)
    {
      var txWidth = hTextLabels[i].getComputedTextLength();
      totalHTextWidth+=(txWidth);
    }
    
    for(var i=0;i<hTextLabels.length;i++){
      var txtWidth = hTextLabels[i].querySelector("tspan").getComputedTextLength();
      if(parseFloat(totalHTextWidth+(hTextLabels.length*5)) < parseFloat(PAGE_DATA.gridBoxWidth) )
      {
        while(txtWidth+5 > interval){
          hTextLabels[i].querySelector("tspan").textContent = hTextLabels[i].querySelector("tspan").textContent.substring(0,(hTextLabels[i].querySelector("tspan").textContent.length-4))+"...";
          txtWidth = (hTextLabels[i].querySelector("tspan").getComputedTextLength());
        }
      }
      hTextLabels[i].addEventListener("mouseenter", function(e){
        e.stopPropagation();
        var mousePointer = cursorPoint(e);
        showToolTip(mousePointer,"#555",e.target.getAttribute("title")," ");
      },false);
      
      hTextLabels[i].addEventListener("mouseleave", function(e){
        e.stopPropagation();
        showToolTip("hide");
      },false);
    }
    
  }/*End createHorizontalLabel()*/
  
  
  function resetTextPositions()
  {
    var txtTitleGrp = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtTitleGrp");
    var titleBox = txtTitleGrp.getBBox();

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y",(PAGE_DATA.svgCenter.y-200));//.setAttribute("x",(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(txtTitleGrp.querySelector("#txtSubtitle").getComputedTextLength()/2)));//.setAttribute("x",(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y",(PAGE_DATA.svgCenter.y-170));
    
    /*Reset vertical text label*/
    var arrVLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #vTextLabel");
    var vLabelwidth = arrVLabels[0].getBBox().width;
    var arrVText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #vTextLabel tspan");
    for(var i=0;i<arrVText.length;i++)
      arrVText[i].setAttribute("x",(PAGE_DATA.marginLeft-vLabelwidth-10));
    
    /*Reset horzontal text label*/
    var totalHTextWidth = 0;
    var arrHText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #hTextLabel text");
    for(var i=0;i<arrHText.length;i++)
    {
      var txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth+=(txWidth);
    }
    var interval = 50;
    if(parseFloat(totalHTextWidth+(arrHText.length*10)) > parseFloat(PAGE_DATA.gridBoxWidth) )
    {
      for(var i=0;i<arrHText.length;i++)
      {
        var cx = arrHText[i].getAttribute("x");
        var cy = arrHText[i].getAttribute("y"); 
        arrHText[i].setAttribute("transform", "matrix(0,-1,1,0,"+(parseFloat(cx)+4)+","+(parseFloat(cy)+15)+")");
        arrHText[i].setAttribute("x",0);
        arrHText[i].setAttribute("y",0);
        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        while(txWidth+15 > interval){
          arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0,(arrHText[i].querySelector("tspan").textContent.length-4))+"...";
          txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
        }
      }
    }else {
      for(var i=0;i<arrHText.length;i++)
      {
        var cx = arrHText[i].getAttribute("x");
        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("x",cx-(txWidth/2));
      }
    }
    var vTxtSubTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0,"+(PAGE_DATA.marginLeft-vLabelwidth-30)+","+(PAGE_DATA.svgCenter.y)+")");
    vTxtSubTitle.setAttribute("x",0);
    vTxtSubTitle.setAttribute("y",0);
    
    /*Set position for legend text*/
    var arrLegendText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #legendContainer text");
    var arrLegendColor = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #legendContainer rect");
    var width = 0;
    for(var i=0;i<arrLegendText.length;i++)
    {
      arrLegendColor[i].setAttribute("x",(width+PAGE_DATA.marginLeft));
      arrLegendText[i].setAttribute("x",(width+PAGE_DATA.marginLeft+20));
      width+=(arrLegendText[i].getBBox().width+50);
    }
    

  }/*End resetTextPositions()*/
  
  function showAnimatedView(){
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    var pointIndex = 0;
    /*if there is more than 80 points then skip the animation*/
    if(PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length >80)
      pointIndex = PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    var timoutId = setInterval  (function(){
      for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
      {
        createSeries(PAGE_OPTIONS.dataSet.series[index].data.slice(0,pointIndex),index,scaleX);
      }
      
      if(pointIndex === PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length){
        clearInterval(timoutId);
        reDrawSeries();
        
        appendMenu();
      }
      pointIndex++;
    },50);
  }/*End showAnimatedView()*/
  
  

  function bindEvents()
  {
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      PAGE_DATA.windowRightIndex = (PAGE_DATA.windowRightIndex < 0)?PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length:PAGE_DATA.windowRightIndex;
      var categories = [],dataList=[];
      for(var i=PAGE_DATA.windowLeftIndex;i<=(PAGE_DATA.windowRightIndex);i++)
        categories.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);
      for(var setIndex=0;setIndex<PAGE_OPTIONS.dataSet.series.length;setIndex++){
        var set = PAGE_OPTIONS.dataSet.series[setIndex].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex+1));
        if(set.length > 1)
          dataList.push(set);
      }
      var seriesArea = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #area_"+index);
      (function(indx,catList,dataSet){
        
        if(seriesArea) seriesArea.addEventListener("mousemove", function(e){
          e.stopPropagation();
          
          var mousePointer = cursorPoint(e);
          var nearestPoint = nearestAmongAllSeries(mousePointer);
          var nearestPointIndex = nearestPoint.pointIndex;
          indx = nearestPoint.seriesIndex;
  
          var scaleY = (PAGE_DATA.gridBoxHeight/PAGE_DATA.maxima); 

          /*Create vertical line*/
          var vLine = ["M",mousePointer.x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),"L",mousePointer.x,PAGE_DATA.marginTop];
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #vLine").setAttribute("d",vLine.join(" "));

          var line1Start = PAGE_DATA.series[indx][nearestPointIndex];
          if(line1Start.x <  mousePointer.x)
            var line1End = PAGE_DATA.series[indx][nearestPointIndex+1];
          else
            var line1End = PAGE_DATA.series[indx][nearestPointIndex-1];
          var line2Start = new Point(mousePointer.x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight));
          var line2End = new Point(mousePointer.x,PAGE_DATA.marginTop);
          
          if(typeof line1Start !== "undefined" && typeof line1End !== "undefined" && typeof line2Start !== "undefined" && typeof line2End !== "undefined")
            var toolTipPoint = checkLineIntersection(line1Start.x,line1Start.y,line1End.x,line1End.y,line2Start.x,line2Start.y,line2End.x,line2End.y);
       
          if(toolTipPoint && toolTipPoint.onLine1 === true && toolTipPoint.onLine2 === true)
          {
            var elms = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart .tooTipPoint");
            for(var i=0;i<elms.length;i++)
              elms[i].parentNode.removeChild(elms[i]);

            showToolTip(toolTipPoint,getColor(indx));
            createDot(toolTipPoint,getColor(indx),3,1,"tooTipPoint","areaChart");
            createDot(toolTipPoint,getColor(indx),8,0.2,"tooTipPoint","areaChart");
            
            console.log(PAGE_DATA.series[indx][nearestPointIndex]);
            console.log(toolTipPoint);
            var projectedVal = (PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight-toolTipPoint.y)/scaleY;
            if((toolTipPoint.x > (PAGE_DATA.series[indx][nearestPointIndex].x-5)) && (toolTipPoint.x < (PAGE_DATA.series[indx][nearestPointIndex].x+5)) ){
              document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipXval").textContent = (PAGE_OPTIONS.dataSet.xAxis.title+" "+catList[nearestPointIndex]);
              document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipYval").textContent = (PAGE_OPTIONS.dataSet.yAxis.title+" "+(PAGE_OPTIONS.dataSet.yAxis.prefix||"")+" "+dataSet[indx][nearestPointIndex]);
            }
            else{
              document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipXval").textContent = ("Projected");
              document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipYval").textContent = (PAGE_OPTIONS.dataSet.yAxis.title+" "+(PAGE_OPTIONS.dataSet.yAxis.prefix||"")+" "+projectedVal.toFixed(2));
            }
          }
        },false);
        
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #series_legend_"+indx).addEventListener("click", function(e){
          var arrSeries = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart .series");
          for(var i=0;i<arrSeries.length;i++)
            arrSeries[i].style.visibility = "hidden";
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTipContainer").style.visibility = "hidden";
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #series_"+e.target.id.split("_")[2]).style.visibility = "visible";
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #series_actual_"+e.target.id.split("_")[2]).style.visibility = "visible";
        },false);
        
      })(index,categories,dataList);
      
      if(seriesArea) seriesArea.addEventListener("mouseleave", function(e){
        var toolTip = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTipContainer");
        if(toolTip) toolTip.style.visibility = "hidden";
    
      },false);
    }
    
  }/*End bindEvents()*/
  
  function bindSliderEvents()
  {
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").addEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").addEventListener("mouseup", function(e){
      e.stopPropagation();
      if(PAGE_DATA.mouseDown === 1 ){
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindRightSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindRightSliderMove);
        if(e.target.id === "sliderRight")
          resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
        else
          resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
        reDrawSeries();
      }
      PAGE_DATA.mouseDown = 0; 
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").addEventListener("mousemove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").removeEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindRightSliderMove);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").removeEventListener("mousemove",bindRightSliderMove);
    });
    
    /*Events for touch devices*/
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").addEventListener("touchmove",bindLeftSliderMove);
    },false);

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("touchmove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    },false);
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("touchmove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").addEventListener("touchmove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").removeEventListener("touchmove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("touchmove",bindRightSliderMove);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
    });

    
  }/*End bindSliderEvents()*/
  
  function bindLeftSliderMove(e){
    e.stopPropagation();
    e.preventDefault();
    var mousePointer = cursorPoint(e.changedTouches?e.changedTouches[0]: e);
    
    var sliderLsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").getBBox();
    var sliderRsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").getBBox();

    if(sliderLsel.x+(PAGE_DATA.fsScaleX*2) > sliderRsel.x && e.movementX > 0){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
      return;
    }
      
    if(mousePointer.x > (PAGE_DATA.marginLeft) && mousePointer.x <((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight))
    {
      for(var j=0;j<PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1;j++)
      {
        if(mousePointer.x >= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j].x && mousePointer.x <= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j+1].x )
          if(e.movementX <= 0)
            PAGE_DATA.windowLeftIndex = j;
          else
            PAGE_DATA.windowLeftIndex = j+1;  
      }
      resetSliderPos("left",mousePointer.x);
    }
  }/*End bindLeftSliderMove()*/

  function bindRightSliderMove(e){
    e.stopPropagation();
    e.preventDefault();
    var mousePointer = cursorPoint(e.changedTouches?e.changedTouches[0]: e);
    var sliderLsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").getBBox();
    var sliderRsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideRSel").getBBox();
    
    if(sliderRsel.x-(PAGE_DATA.fsScaleX*2) <= (sliderLsel.x) && e.movementX <= 0){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #slideLSel").removeEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").removeEventListener("mousemove",bindRightSliderMove);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
      return;
    }
    if(mousePointer.x > (PAGE_DATA.marginLeft+PAGE_DATA.scaleX) && mousePointer.x <((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight) ){
      for(var j=1;j<PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length;j++)
      {
        if(mousePointer.x >= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j-1].x && mousePointer.x <= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j].x )
          if(e.movementX <= 0)
            PAGE_DATA.windowRightIndex = j-1;
          else
            PAGE_DATA.windowRightIndex = j;
      }
      if(mousePointer.x >PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1].x ){
        PAGE_DATA.windowRightIndex = PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1;
      }
      resetSliderPos("right",mousePointer.x);
    }
  }/*End bindRightSliderMove()*/
  
  function resetSliderPos(type,x)
  {
    var sliderSel = (type === "right")?"slideRSel":"slideLSel";
    var sliderLine = (type === "right")?"sliderRight":"sliderLeft";
    var swipeFlag = (type === "right")?1:0;
   
    var dr = ["M",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+60),"L",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+60)];
    var cy = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+(PAGE_DATA.fullChartHeight/2);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #"+sliderSel).setAttribute("d",describeEllipticalArc(x,cy,15,15,180,360,swipeFlag).d);//("cy",((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+(PAGE_DATA.fullChartHeight/2)));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #"+sliderLine).setAttribute("d",dr.join(" "));
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #fullSeriesContr #outerFrame");
    if(type === "left"){
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #sliderLeftOffset");
      sliderOffset.setAttribute("width",(x-fullSeries.getBBox().x));
    }else {
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #sliderRightOffset");
      sliderOffset.setAttribute("width",((fullSeries.getBBox().width+fullSeries.getBBox().x)-x));
      sliderOffset.setAttribute("x",x);
    }

  }/*End resetSliderPos()*/
  
  
  function reDrawSeries()
  {
    var dataSet = [];
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex+1)).length;
    for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
    {
      var set = {"data":PAGE_OPTIONS.dataSet.series[i].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex+1))};
      dataSet.push(set);
    }
    prepareDataSet(dataSet);
    createVerticalLabel();

    var catList = [];
    for(var i=PAGE_DATA.windowLeftIndex;i<=(PAGE_DATA.windowRightIndex);i++)
      catList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    createHorizontalLabel(catList,scaleX);
    
    PAGE_DATA.series=[];
    for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
      createSeries(PAGE_OPTIONS.dataSet.series[i].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex+1)),i,scaleX);
    resetTextPositions();
    bindEvents();
  }/*End reDrawSeries()*/

  /* Get point in global SVG space*/
  function cursorPoint(evt){
    var svg = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart");
    var pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }/*End cursorPoint()*/
  
  function round(val)
  {
    val = Math.round(val);
    var digitCount = val.toString().length;
    var nextVal = Math.pow(10,digitCount-1);
    var roundVal = Math.ceil(val/nextVal)*nextVal;
    if(val < roundVal/2)
      return roundVal/2;
    else
      return roundVal;
  }/*End round()*/

  function getMid(point1, point2)
  {
    return new Point((point1.x+point2.x)/2,(point1.y+point2.y)/2);
  }/*End getMid()*/
  
  function checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
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
  
  function nearestAmongAllSeries(pointer){
    var seriesIndex=0,distance = 9999999,pointIndex=0;
    for(var i=0;i<PAGE_DATA.series.length;i++){
      var np = getNearestPoint(PAGE_DATA.series[i],pointer);
      if(np.dist <distance){
        distance=np.dist;
        seriesIndex = i;
        pointIndex=np.index;
      }
    }
    return {pointIndex:pointIndex,seriesIndex:seriesIndex};
  }/*End nearestAmongAllSeries()*/

  function getNearestPoint(arrPointSet,point)
  {
    var minDist = 9999999,index = 0;
    for(var p=0;p<arrPointSet.length;p++)
    {
      var dist =getDistanceBetween(arrPointSet[p], point);
      if(dist < minDist)
      {
        minDist = dist;
        index = p;
      }
    }
    return {dist:minDist,index:index};
  }/*End getNearestPoint()*/
  
  function showToolTip(cPoint,color,line1,line2)
  {
    if(typeof cPoint === "string" && cPoint === "hide"){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTipContainer").style.visibility = "hidden";
      return;
    }
    if(line1)
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipXval").textContent = line1;
    if(line2)
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipYval").textContent = line2;
    
    var txtToolTipBox = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp")[0].getBBox();
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

    
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipXval").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipXval").setAttribute("y",cPoint.y-10-(txtToolTipBox.height));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipYval").setAttribute("x",cPoint.x-(txtToolTipBox.width/2)-10);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #txtToolTipGrp #toolTipYval").setAttribute("y",cPoint.y-10-(txtToolTipBox.height/2));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTip").setAttribute("d",d.join(" "));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTip").setAttribute("stroke",color); 
    

    var toolTip = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart #toolTipContainer");
    if(toolTip) toolTip.parentNode.removeChild(toolTip);
    toolTip.style.visibility = "visible";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #areaChart").appendChild(toolTip);
    
  }/*End showToolTip()*/

  function createDot(center,color,radious,opacity,cls,targetElem)
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
  }/*End createDot()*/


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
  }/*End createRect()*/
  
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
  