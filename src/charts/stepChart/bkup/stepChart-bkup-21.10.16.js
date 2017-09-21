/*
 * SVG Step Chart 
 * @Version:1.0.0
 * @CreatedOn:13-Sep-2016
 * @Author:SmartChartsNXT
 * @description: SVG Step Chart, that support multiple series, and zoom window.
 * @JSFiddle:
 * @Sample caller code:
      
  SmartChartsNXT.ready(function(){
    var stepChart = new SmartChartsNXT.StepChart({
      "title":"Multi Series Step Chart",
      "subTitle":"Report for the year, 2016",
      "targetElem":"chartContainer",
      "canvasBorder":false,
      "bgColor":"none",
      "noRiser":false,
      "showAreaOffset":true,
      "toolTip":{
        "content":'<table>'+
              '<tr><td>In the month of <b>{{point.label}}</b> </td></tr>' +
              '<tr><td>Total Sales produced </td></tr>'+
              '<tr><td>by {{point.series.name}} is <b>Rs. {{point.value}}</b></tr>' +
              '</table>'
      },
      "dataSet":{
        "xAxis":{
          "title":"Months"
        },
        "yAxis":{
          "title":"Total Sales",
          "prefix":"Rs. "
        },
        "series":[
          {
            color:"#e91e63",
            name: 'John',
            lineWidth:'1',
            data: [
              {label:"Jan",value:"6446"},{label:"Feb",value:"333"},{label:"Mar",value:"470"},{label:"Apr",value:"8472"},
              {label:"May",value:"1212"},{label:"Jun",value:"6446"},{label:"Jul",value:"8472"},{label:"Aug",value:"114"},
              {label:"Sep",value:"432"},{label:"Oct",value:"3543"},{label:"Nov",value:"114"},{label:"Dec",value:"333"}
            ]
          },
          {
            color:"#009688",
            name: 'Kate',
            data: [
              {label:"Jan",value:"1212"},{label:"Feb",value:"3323"},{label:"Mar",value:"470"},{label:"Apr",value:"8472"},
              {label:"May",value:"5051"},{label:"Jun",value:"6446"},{label:"Jul",value:"3543"},{label:"Aug",value:"556"},
              {label:"Sep",value:"432"},{label:"Oct",value:"3000"},{label:"Nov",value:"114"},{label:"Dec",value:"333"}
            ]
          }
        ]
      },
      zoomWindow:{
        leftIndex:2,
        rightIndex:8
      }
    });
  });

 */

window.SmartChartsNXT.StepChart = function(opts)
{
  var PAGE_OPTIONS = { };

  var PAGE_DATA = {
    scaleX:0,
    scaleY:0,
    svgCenter:0,
    chartCenter:0,
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
    fcMarginTop:80,
    windowLeftIndex:0,
    windowRightIndex:-1,
    longestSeries:0,
    series:[],
    mouseDown:0,
    newDataSet:[],
    newCatgList:[]
  };

  var PAGE_CONST = {
    FIX_WIDTH:800,
    FIX_HEIGHT:600,
    MIN_WIDTH:250,
    MIN_HEIGHT:400,
    hGridCount:9
  };
  

  function init()
  {
    try {
      
      PAGE_OPTIONS = $SC.util.extends(opts,PAGE_OPTIONS);
      var containerDiv = document.querySelector("#"+PAGE_OPTIONS.targetElem);
      PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = containerDiv.offsetWidth||PAGE_CONST.FIX_WIDTH;
      PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = containerDiv.offsetHeight || PAGE_CONST.FIX_HEIGHT;
      
      if(PAGE_OPTIONS.width < PAGE_CONST.MIN_WIDTH)
        PAGE_OPTIONS.width = PAGE_CONST.FIX_WIDTH = PAGE_CONST.MIN_WIDTH;
      if(PAGE_OPTIONS.height < PAGE_CONST.MIN_HEIGHT)
        PAGE_OPTIONS.height = PAGE_CONST.FIX_HEIGHT = PAGE_CONST.MIN_HEIGHT;
      
      
      console.log(PAGE_OPTIONS);
      PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
      PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;


      var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                  "viewBox='0 0 "+PAGE_CONST.FIX_WIDTH+" "+PAGE_CONST.FIX_HEIGHT+"'"+
                  "version='1.1'" +
                  "width='"+PAGE_OPTIONS.width+"'"+
                  "height='"+PAGE_OPTIONS.height+"'"+
                  "id='stepChart'"+
                  "style='background:"+(PAGE_OPTIONS.bgColor||"none")+";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'"+
                  "> <\/svg>";
				  
      document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";    
      document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend",strSVG);
      initDataSet();
      

      var svgWidth = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").getAttribute("width"));
      var svgHeight = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").getAttribute("height"));
      PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth/2),(svgHeight/2)) ;
      PAGE_DATA.chartCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;
      PAGE_DATA.marginLeft = ((-1)*PAGE_DATA.scaleX/2)+100;
      PAGE_DATA.marginRight =((-1)*PAGE_DATA.scaleX/2)+20; 
      PAGE_DATA.marginTop = ((-1)*PAGE_DATA.scaleY/2)+120;
      PAGE_DATA.marginBottom = ((-1)*PAGE_DATA.scaleY/2)+170;
      
      var longestSeries = 0,longSeriesLen = 0;
      for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
      {
        if(PAGE_OPTIONS.dataSet.series[index].data.length > longSeriesLen){
          longestSeries = index;
          longSeriesLen = PAGE_OPTIONS.dataSet.series[index].data.length;
        }
      }
      
      PAGE_DATA.longestSeries = longestSeries;
      
      
      if(PAGE_OPTIONS.zoomWindow){
        if(PAGE_OPTIONS.zoomWindow.leftIndex && PAGE_OPTIONS.zoomWindow.leftIndex >=0 && (PAGE_OPTIONS.zoomWindow.leftIndex*2) < (longSeriesLen*2)-1)
          PAGE_DATA.windowLeftIndex = PAGE_OPTIONS.zoomWindow.leftIndex*2;
        if(PAGE_OPTIONS.zoomWindow.rightIndex && (PAGE_OPTIONS.zoomWindow.rightIndex*2) > (PAGE_OPTIONS.zoomWindow.leftIndex*2) && (PAGE_OPTIONS.zoomWindow.rightIndex*2) <= (longSeriesLen*2)-1 )
          PAGE_DATA.windowRightIndex = PAGE_OPTIONS.zoomWindow.rightIndex*2;
        else
          PAGE_DATA.windowRightIndex = (longSeriesLen*2)-1;
      }else
        PAGE_DATA.windowRightIndex = (longSeriesLen*2)-1;
      
      
      prepareChart();
      
      $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem,PAGE_DATA.svgCenter);
      $SC.appendWaterMark(PAGE_OPTIONS.targetElem,PAGE_DATA.scaleX,PAGE_DATA.scaleY);
      
    }catch(ex){
      $SC.handleError(ex,"Error in StepChart");
    }

  }/*End init()*/
  
  function initDataSet(){
    PAGE_DATA.fullSeries = [];
    PAGE_DATA.series = [];
    PAGE_DATA.newDataSet=[];
    PAGE_DATA.newCatgList=[];
    PAGE_DATA.windowLeftIndex=0;
    PAGE_DATA.windowRightIndex=-1;
    
  }/*End initDataSet()*/

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
    strSVG += "    <tspan id='txtTitle' x='"+(100/PAGE_CONST.FIX_WIDTH*PAGE_OPTIONS.width)+"' y='"+(50/PAGE_CONST.FIX_HEIGHT*PAGE_OPTIONS.height)+"' font-size='20'><\/tspan>";
    strSVG += "    <tspan id='txtSubtitle' x='125' y='80' font-size='13'><\/tspan>";
    strSVG += "  <\/text>";
    strSVG += "<\/g>";
    
    
    strSVG += "<g id='legendContainer'>";
    strSVG += "<\/g>";

    strSVG += "<g id='fullSeriesContr'>";
    strSVG += "</g>";
    
    strSVG +="<path id='hLine' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strSVG +="<path id='vLine' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSVG);
    
    /*Set Title of chart*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    createGrid();
    createFullSeries();
    
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      createSeries(PAGE_OPTIONS.dataSet.series[index].data,index,scaleX);
      if(PAGE_OPTIONS.dataSet.series.length > 1)
        createLegands(index);
      appendGradFill(index);
    }
    
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(0,PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
    createHorizontalLabel(PAGE_OPTIONS.dataSet.xAxis.categories,scaleX);
    
    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-30)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+70)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.xAxis.title+"<\/text>";
    strSVG +="<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft-30)+"' y='"+(PAGE_DATA.marginTop+(PAGE_DATA.gridBoxHeight/2)-5)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.yAxis.title+"<\/text>";
    
    var zoomOutBox = {
      top:PAGE_DATA.marginTop-40,
      left:PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth-40,
      width:40,
      height:40
    };
    
    strSVG += "<g id='zoomOutBoxCont' style='display:none;'>";
    strSVG += "  <rect id='zoomOutBox' x='"+zoomOutBox.left+"' y='"+zoomOutBox.top+"' width='"+zoomOutBox.width+"' height='"+zoomOutBox.height+"' pointer-events='all' stroke='#717171' fill='none' stroke-width='0' \/>";
    strSVG += "  <circle r='10' cx='"+(zoomOutBox.left+(zoomOutBox.width/2))+"' cy='"+(zoomOutBox.top+(zoomOutBox.height/2))+"' pointer-events='none' stroke-width='1' fill='none' stroke='#333'/>";
    strSVG += "  <line x1='"+(zoomOutBox.left+(zoomOutBox.width/2)-4)+"' y1='"+(zoomOutBox.top+(zoomOutBox.height/2))+"' x2='"+(zoomOutBox.left+(zoomOutBox.width/2)+4)+"' y2='"+(zoomOutBox.top+(zoomOutBox.height/2))+"' pointer-events='none' stroke-width='1' fill='none' stroke='#333'/>";
    var lineStart = $SC.geom.polarToCartesian((zoomOutBox.left+(zoomOutBox.width/2)), (zoomOutBox.top+(zoomOutBox.height/2)), 10, 135);
    var lineEnd = $SC.geom.polarToCartesian((zoomOutBox.left+(zoomOutBox.width/2)), (zoomOutBox.top+(zoomOutBox.height/2)), 20, 135);
    strSVG += "  <line x1='"+lineStart.x+"' y1='"+lineStart.y+"' x2='"+lineEnd.x+"' y2='"+lineEnd.y+"' pointer-events='none' stroke-width='2' fill='none' stroke='#333'/>";
    strSVG += "</g>";
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSVG);
    
    resetTextPositions();
    
    resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
    resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
    
    bindEvents();
    bindSliderEvents();
    
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr");
    fullSeries.parentNode.removeChild(fullSeries);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").appendChild(fullSeries);
    
    reDrawSeries(); 
    
  }/*End prepareChart()*/
  
  
  function createFullSeries()
  {
    var strSVG = "";
    strSVG += "<rect id='sliderLeftOffset' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= 'rgba(128,179,236,0.1)'  style='stroke-width:0.1;stroke:#717171;' \/>";
    strSVG += "<rect id='sliderRightOffset' x='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= 'rgba(128,179,236,0.1)' style='stroke-width:0.1;stroke:#717171;' \/>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSVG);
    
    /* ploting actual points */
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      drawFullSeries(PAGE_OPTIONS.dataSet.series[index].data,index);
    }
    
    var outerContPath = [
      "M",(PAGE_DATA.marginLeft),((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop+10),
      "L",(PAGE_DATA.marginLeft),((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop),
      "L", (PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth),((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop),
      "L", (PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth),((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop+10)
    ];
    
    strSVG = "";
    strSVG += "<path stroke='#333' fill='none' d='"+outerContPath.join(" ")+"' stroke-width='1' opacity='1'></path>";
    strSVG += "<rect id='outerFrame' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop)+"' width='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight)+"' height='"+(PAGE_DATA.fullChartHeight)+"' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
    strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<g id='sliderLeftHandle'>";
    strSVG += "  <path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "  <path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "</g>";
    strSVG += "<g id='sliderRightHandle'>";
    strSVG += "  <path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "  <path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSVG);
    
    
    function drawFullSeries(dataSet,index)
    {
      var d =[];
      var scaleX = PAGE_DATA.fsScaleX = (PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
      var scaleYfull = (PAGE_DATA.fullChartHeight/PAGE_DATA.maxima);
      var arrPointsSet = [],strSeries="";
      
      if(dataSet.length > 1){
        for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
        {
          var p1 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*scaleX),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+PAGE_DATA.fcMarginTop)-(dataSet[dataCount].value*scaleYfull)+(PAGE_DATA.minima*scaleYfull)));
          var p2 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*scaleX)+(scaleX),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+PAGE_DATA.fcMarginTop)-(dataSet[dataCount].value*scaleYfull)+(PAGE_DATA.minima*scaleYfull)));
          if(dataCount === 0)
            d.push("M");
          else
            d.push("L");
          d.push.apply(d,[p1.x,p1.y,"L",p2.x,p2.y]);
          arrPointsSet.push(p1);
          arrPointsSet.push(p2);
        }
      }
      
      PAGE_DATA.fullSeries.push(arrPointsSet);
      var color = PAGE_OPTIONS.dataSet.series[index].color||$SC.util.getColor(index);
      
      strSeries = "<g id='fullSeries_"+index+"' class='fullSeries'>";
      strSeries +="<path id='fLine_"+index+"' stroke='"+color+"' fill='none' d='"+d.join(" ")+"' stroke-width='1' opacity='1'></path>";
      strSeries +="<g>";
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSeries);
    }/*End drawFullSeries()*/
    
  }/*End createFullChart()*/
  

  function prepareDataSet(dataSet)
  {
    var maxSet=[],minSet=[],categories=[];
    dataSet = dataSet || PAGE_OPTIONS.dataSet.series;
    
    for(var i=0;i<dataSet.length;i++)
    {
     var arrData = [];
     for(var j=0;j<dataSet[i].data.length;j++){
       arrData.push(dataSet[i].data[j].value);
       if(categories.indexOf(dataSet[i].data[j].label)< 0)
         categories.push(dataSet[i].data[j].label);
     }
     var maxVal = Math.max.apply(null,arrData);
     var minVal = Math.min.apply(null,arrData);
     maxSet.push(maxVal);
     minSet.push(minVal);
    }
    PAGE_OPTIONS.dataSet.xAxis.categories = categories;
    PAGE_DATA.maxima = Math.max.apply(null,maxSet);
    PAGE_DATA.minima = Math.min.apply(null,minSet);
    PAGE_DATA.maxima = round(PAGE_DATA.maxima);
  }/*End prepareDataSet()*/


  function createSeries(dataSet,index,scaleX)
  {
    var d =[];
    var elemSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_area_"+index);
    var elemActualSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_actual_"+index);
    if(elemSeries) elemSeries.parentNode.removeChild(elemSeries);
    if(elemActualSeries)elemActualSeries.parentNode.removeChild(elemActualSeries);
    
    if(dataSet.length < 1)
      return;
    var interval = scaleX||(PAGE_DATA.gridBoxWidth/(dataSet.length));
    var scaleY = (PAGE_DATA.gridBoxHeight/PAGE_DATA.maxima); 
    var arrPointsSet = [],strSeries="", area=[];;
    
    /* ploting actual points */
    var strSeries = "<g id='series_actual_"+index+"' class='series' pointer-events='none'>";
    for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
    {
      var p1 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount].value*scaleY)));
      var p2 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval)+(interval),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount].value*scaleY)));
      if(dataCount === 0){
        d.push("M");
        area.push("M");
      }
      else if(PAGE_OPTIONS.noRiser){
        d.push("M");
        area.push("L");
      }else {
        d.push("L");
        area.push("L");
      }
      
      d.push.apply(d,[p1.x,p1.y,"L",p2.x,p2.y]);
      area.push.apply(area,[p1.x,p1.y,"L",p2.x,p2.y]);
      arrPointsSet.push(p1);
      arrPointsSet.push(p2);
    }
    
    PAGE_DATA.series.push(arrPointsSet);
    var color = PAGE_OPTIONS.dataSet.series[index].color||$SC.util.getColor(index);
    var strokeWidth = PAGE_OPTIONS.dataSet.series[index].lineWidth||2;
    
    strSeries +="<path stroke='"+color+"' fill='none' d='"+d.join(" ")+"' stroke-width='"+strokeWidth+"' opacity='1'></path>";
    strSeries += "</g>";
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSeries);

    
    if(PAGE_OPTIONS.noAreaOffset) color = "none";
    if(dataSet.length > 10){
      strSeries = "<g id='series_area_"+index+"' class='series' pointer-events='none'>";
      if(dataSet.length > 2){
        area.push.apply(area,["L",arrPointsSet[arrPointsSet.length-1].x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),arrPointsSet[0].x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)],"Z");

      }
      strSeries +="<path id='area_"+index+"' fill='"+color+"' d='"+area.join(" ")+"' stroke-width='"+strokeWidth+"' stroke='none'opacity='0.1'></path>";
    }else {
      var strSeries = "<g id='series_area_"+index+"' class='columns series' pointer-events='none'>";
      var colHalfWidth = (interval)/2;
      for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
      {
        var p = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval)+(interval/2),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount].value*scaleY)));
        var col = [
          "M", p.x-colHalfWidth, p.y,
          "L", p.x+colHalfWidth, p.y,
          "L", p.x+colHalfWidth, (PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),
          "L", p.x-colHalfWidth,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),
          "Z"
        ];
        strSeries +="<path id='column_"+index+"_"+dataCount+"' stroke='"+color+"'  fill='"+color+"' d='"+col.join(" ")+"' stroke-width='1' opacity='"+((dataCount+1)*0.1)+"'></path>";
      }
    }
    strSeries += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSeries);

  }/*End createSeries()*/
  
  function appendGradFill(index) {
    /*Creating gradient fill for area*/
    var color = PAGE_OPTIONS.dataSet.series[index].color||$SC.util.getColor(index);
    var strSVG = "";
    strSVG += "<defs>";
    strSVG += "  <linearGradient gradientUnits = 'userSpaceOnUse' id='"+PAGE_OPTIONS.targetElem+"-stepchart-gradLinear"+index+"' x1='0%' y1='0%' x2='100%' y2='0%'>";
    strSVG += "  <stop offset='0%' style='stop-color:white;stop-opacity:0.5' />";
    strSVG += "  <stop offset='100%' style='stop-color:"+color+";stop-opacity:0.5' />";
    strSVG += "  </linearGradient>";
    strSVG += "</defs>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSVG);
  }/*End appendGradFill()*/
  
  function createLegands(index){
    /*Creating series legend*/
    var color = PAGE_OPTIONS.dataSet.series[index].color||$SC.util.getColor(index);
    var strSVG = "";
    strSVG ="<g id='series_legend_"+index+"' style='cursor:pointer;'>";
    strSVG +="<rect id='legend_color_"+index+"' x='"+PAGE_DATA.marginLeft+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+130)+"' width='10' height='10' fill='"+color+"' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG +="<text id='legend_txt_"+index+"' font-size='12' x='"+(PAGE_DATA.marginLeft+20)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+140)+"' fill='#717171' font-family='Verdana' >"+PAGE_OPTIONS.dataSet.series[index].name+"</text>";
    strSVG +="</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #legendContainer").insertAdjacentHTML("beforeend",strSVG);
  }

  
  function createGrid()
  {
    PAGE_DATA.gridBoxWidth = (PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight;
    PAGE_DATA.gridBoxHeight = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom;
    PAGE_DATA.gridHeight = (((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom)/(PAGE_CONST.hGridCount-1));
    var hGrid = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #hGrid");
    if(hGrid)  hGrid.parentNode.removeChild(hGrid);
    
    var strGrid = "";
    strGrid += "<g id='hGrid' >";
    for(var gridCount = 0;gridCount<PAGE_CONST.hGridCount;gridCount++)
    {
      var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight),"L", PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
    }
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop,"L", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+10];
    strGrid += "<rect id='gridRect' x='"+PAGE_DATA.marginLeft+"' y='"+PAGE_DATA.marginTop+"' width='"+PAGE_DATA.gridBoxWidth+"' height='"+PAGE_DATA.gridBoxHeight+"' pointer-events='all' style='fill:none;stroke-width:0;stroke:#717171;' \/>";
    strGrid += "<path id='gridBoxLeftBorder' d='"+d.join(" ")+"' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strGrid += "</g>";  
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strGrid);
    
    createVerticalLabel();
  }/*End createGrid()*/
  
  function createVerticalLabel()
  {
    var vTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextLabel");
    if(vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);
    
    var interval = (PAGE_DATA.maxima)/(PAGE_CONST.hGridCount-1);
    var strText = "<g id='vTextLabel'>";
    for(var gridCount = PAGE_CONST.hGridCount-1,i=0;gridCount>=0;gridCount--)
    {
      var value = (i++*interval);
      value = (value >= 1000?(value/1000).toFixed(2)+"K":value.toFixed(2));
      strText +="<text font-family='Lato' fill='black'><tspan x='"+(PAGE_DATA.marginLeft-55)+"' y='"+(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)+5)+"' font-size='12' >"+((PAGE_OPTIONS.dataSet.yAxis.prefix)?PAGE_OPTIONS.dataSet.yAxis.prefix:"")+value+"<\/tspan></text>";
      var d = ["M",PAGE_DATA.marginLeft,(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)),"L",(PAGE_DATA.marginLeft-5),(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight))];
      strText +="<path fill='none' d='"+d.join(" ")+"' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strText += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strText);
    
    var overFlow = 0; 
    var vTextLabel = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextLabel tspan");
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
    var hTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #hTextLabel");
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
      strText +="<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='"+categories[hText]+"' x='"+(PAGE_DATA.marginLeft+(hText*interval)+(interval/2))+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+20)+"' ><tspan  font-size='12' >"+categories[hText]+"<\/tspan></text>";
    }
    
    for(var hText =0;hText<categories.length;hText++)
    { 
      var d = ["M",(PAGE_DATA.marginLeft+(hText*interval)+(interval)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),"L",(PAGE_DATA.marginLeft+(hText*interval)+(interval)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+10)];
      strText +="<path fill='none' d='"+d.join(" ")+"' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight,"L", PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight];
    strText +="<path id='gridBoxBottomBorder' d='"+d.join(" ")+"' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strText += "</g>";
    
    /*bind hover event*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strText);
    var hTextLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #hTextLabel text");
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
        var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e);
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,mousePointer,"#555",e.target.getAttribute("title"));
      },false);
      
      hTextLabels[i].addEventListener("mouseleave", function(e){
        e.stopPropagation();
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
      },false);
      
    }
    
  }/*End createHorizontalLabel()*/

  
  function resetTextPositions()
  {
    var txtTitleLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtTitle").getComputedTextLength();
    var txtSubTitleLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    var txtTitleGrp = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp");

    
    if(txtTitleLen > PAGE_CONST.FIX_WIDTH){
      var fontSize = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtTitle").getAttribute("font-size");
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtTitle").setAttribute("font-size",fontSize-5);
      txtTitleLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtTitle").getComputedTextLength();
      fontSize = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtSubtitle").getAttribute("font-size");
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtSubtitle").setAttribute("font-size",fontSize-3);
      txtSubTitleLen = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp #txtSubtitle").getComputedTextLength();
    }

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(txtTitleLen/2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y",70);
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(txtSubTitleLen/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y",90);
    
    /*Reset vertical text label*/
    var arrVLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextLabel");
    var vLabelwidth = arrVLabels[0].getBBox().width;
    var arrVText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextLabel tspan");
    for(var i=0;i<arrVText.length;i++)
      arrVText[i].setAttribute("x",(PAGE_DATA.marginLeft-vLabelwidth-10));
    
    /*Reset horzontal text label*/
    var totalHTextWidth = 0;
    var arrHText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #hTextLabel text");
    for(var i=0;i<arrHText.length;i++)
    {
      var txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth+=(txWidth);
    }
    var interval = 70;
    if(parseFloat(totalHTextWidth+(arrHText.length*10)) > parseFloat(PAGE_DATA.gridBoxWidth) )
    {
      for(var i=0;i<arrHText.length;i++)
      {
        var cx = arrHText[i].getAttribute("x");
        var cy = arrHText[i].getAttribute("y"); 
        
        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("transform", "translate(0,"+(10)+")rotate(-45,"+(cx)+","+(cy)+")");
        
        if(txWidth+15 > interval){
          var fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
          arrHText[i].querySelector("tspan").setAttribute("font-size",(fontSize-2));
          txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        }
        while(txWidth+15 > interval){
          arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0,(arrHText[i].querySelector("tspan").textContent.length-4))+"...";
          txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
        }
      }
    }
    
    var vTxtSubTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0,"+(PAGE_DATA.marginLeft-vLabelwidth-30)+","+(PAGE_DATA.svgCenter.y)+")");
    vTxtSubTitle.setAttribute("x",0);
    vTxtSubTitle.setAttribute("y",0);
    
    /*Set position for legend text*/
    var arrLegendText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #legendContainer text");
    var arrLegendColor = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #legendContainer rect");
    var width = 0,row=0;
    for(var i=0;i<arrLegendText.length;i++)
    {
      arrLegendColor[i].setAttribute("x",(width+PAGE_DATA.marginLeft-60));
      arrLegendText[i].setAttribute("x",(width+PAGE_DATA.marginLeft+20-60));
      arrLegendColor[i].setAttribute("y",(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+PAGE_DATA.fullChartHeight+10+(row*20)));
      arrLegendText[i].setAttribute("y",(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+PAGE_DATA.fullChartHeight+20+(row*20)));
      width+=(arrLegendText[i].getBBox().width+50);
      
      if(width > PAGE_CONST.FIX_WIDTH){
        width=0;row++;
        arrLegendColor[i].setAttribute("x",(width+PAGE_DATA.marginLeft-60));
        arrLegendText[i].setAttribute("x",(width+PAGE_DATA.marginLeft+20-60));
        arrLegendColor[i].setAttribute("y",(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+PAGE_DATA.fullChartHeight+10+(row*20)));
        arrLegendText[i].setAttribute("y",(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+PAGE_DATA.fullChartHeight+20+(row*20)));
        width+=(arrLegendText[i].getBBox().width+50);
      };
      
    }
    
  }/*End resetTextPositions()*/
  
  function showAnimatedView(){
    var dataSet = [];
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2)).length;
    var pointIndex = 0;
    
    for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
    {
      var set = {"data":PAGE_OPTIONS.dataSet.series[i].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2))};
      dataSet.push(set);
    }
    prepareDataSet(dataSet);
    PAGE_DATA.series=[];
    
    var maxLen=0;
    for(var i=0;i<dataSet.length;i++){
      var len = dataSet[i].data.length;
      if(len > maxLen) maxLen = len; 
    }
    
    /*if there is more than 80 points then skip the animation*/
    if(maxLen>50)
      pointIndex = maxLen;
    var timoutId = setInterval  (function(){
      
      for(var index=0;index<dataSet.length;index++)
      {
        createSeries(dataSet[index].data.slice(0,pointIndex),index,scaleX);
      }
      
      if(pointIndex === maxLen){
        clearInterval(timoutId);
        reDrawSeries();
      }
      pointIndex++;
    },50);
  }/*End showAnimatedView()*/
  

  function bindEvents()
  {
    PAGE_DATA.windowRightIndex = (PAGE_DATA.windowRightIndex < 0)?PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length:PAGE_DATA.windowRightIndex;
    PAGE_DATA.newDataSet=[],PAGE_DATA.newCatgList=[];
    
    for(var i=Math.ceil(PAGE_DATA.windowLeftIndex/2);i<Math.ceil((PAGE_DATA.windowRightIndex)/2);i++)
      PAGE_DATA.newCatgList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    for(var setIndex=0;setIndex<PAGE_OPTIONS.dataSet.series.length;setIndex++){
      var set = PAGE_OPTIONS.dataSet.series[setIndex].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2));
      PAGE_DATA.newDataSet.push(set);
    }
    
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      var legend = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_legend_"+index);
      if(legend){
        legend.removeEventListener("click", onLegendClick);
        legend.addEventListener("click", onLegendClick ,false);
      }
    }
    
    var gridRect = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #gridRect");
    if(gridRect){
      gridRect.removeEventListener("mousemove", onMouseMove);
      gridRect.addEventListener("mousemove", onMouseMove,false);
      gridRect.removeEventListener("click", onMouseMove);
      gridRect.addEventListener("click", onMouseMove,false);
      gridRect.removeEventListener("mousleave", onMouseLeave);
      gridRect.addEventListener("mouseleave", onMouseLeave,false);
    }
    
    var zoomOutBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBox");
    if(zoomOutBox) {
      zoomOutBox.removeEventListener("click", onZoomOut);
      zoomOutBox.addEventListener("click", onZoomOut,false);
    }
    
    window.removeEventListener('resize',onWindowResize);
    window.addEventListener('resize',onWindowResize ,true);
    
  }/*End bindEvents()*/
  
  var timeOut = null;
  function onWindowResize(){
    var containerDiv = document.querySelector("#"+PAGE_OPTIONS.targetElem);
    if(containerDiv.offsetWidth !== PAGE_CONST.FIX_WIDTH || containerDiv.offsetHeight !== PAGE_CONST.FIX_HEIGHT )
    {
      if (timeOut != null)
          clearTimeout(timeOut);
      timeOut = setTimeout(function(){
        init();
      }, 100);
    }
  }/*End onWindowResize()*/
  
  function onMouseMove(e){
    try{
      e.stopPropagation();
      
      var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e);
      var gridBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #hGrid").getBBox();
      if(mousePointer.x >= gridBox.x  && mousePointer.x < (gridBox.x+PAGE_DATA.gridBoxWidth) && mousePointer.y >= gridBox.y  && mousePointer.y < (gridBox.y+PAGE_DATA.gridBoxHeight))
      { 
        var multiSeriesPoints = [];
        for(var i=0;i<PAGE_DATA.series.length;i++)  {
          if(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_area_"+i).style.display === "none")
            continue;
          for(var j=0;j<PAGE_DATA.series[i].length-1;j++) {
            if(mousePointer.x > PAGE_DATA.series[i][j].x && mousePointer.x < PAGE_DATA.series[i][j+1].x ){
                multiSeriesPoints.push({seriesIndex:i,pointIndex:j+1,point:PAGE_DATA.series[i][j+1]});
            }
          }
          if(mousePointer.x < PAGE_DATA.series[i][0].x)
            multiSeriesPoints.push({seriesIndex:i,pointIndex:0,point:PAGE_DATA.series[i][0]});
        }
        if(multiSeriesPoints.length === 0)
          return;
        
        var toolTipPoint,npIndex,indx;
        for(var i=0;i<multiSeriesPoints.length;i++){
          if(mousePointer.y > multiSeriesPoints[i].point.y || PAGE_DATA.series.length ===1){
            toolTipPoint = multiSeriesPoints[i].point;
            npIndex = multiSeriesPoints[i].pointIndex;
            indx = multiSeriesPoints[i].seriesIndex;
          }
        }
        if(!indx && multiSeriesPoints.length > 0 ){
          toolTipPoint = multiSeriesPoints[0].point;
          npIndex = multiSeriesPoints[0].pointIndex;
          indx = multiSeriesPoints[0].seriesIndex;
        }
        
        var toolTipPoint = PAGE_DATA.series[indx][npIndex];
        if(npIndex%2 === 0)
          toolTipPoint = new $SC.geom.Point((PAGE_DATA.series[indx][npIndex].x+PAGE_DATA.series[indx][npIndex+1].x)/2,toolTipPoint.y);
        else
          toolTipPoint = new $SC.geom.Point((PAGE_DATA.series[indx][npIndex].x+PAGE_DATA.series[indx][npIndex-1].x)/2,toolTipPoint.y);
        
        /*Create vertical line*/
        var vLinePath = ["M",toolTipPoint.x,toolTipPoint.y,"L",toolTipPoint.x,PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight];
        var vLine = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine");
        if(vLine){
          vLine.setAttribute("d",vLinePath.join(" "));
          vLine.parentNode.removeChild(vLine);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").appendChild(vLine);
        }
        if(toolTipPoint)
        {
          var elms = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
          for(var i=0;i<elms.length;i++)
            elms[i].parentNode.removeChild(elms[i]);
          
          var color = PAGE_OPTIONS.dataSet.series[indx].color||$SC.util.getColor(indx);
          $SC.geom.createDot(toolTipPoint,"#FFF",6,1,"tooTipPoint","stepChart",color);
          $SC.geom.createDot(toolTipPoint,color,4,1,"tooTipPoint","stepChart");

          var toolTipRow1,toolTipRow2;
          toolTipRow1=(PAGE_OPTIONS.dataSet.xAxis.title+" "+PAGE_DATA.newCatgList[Math.ceil((npIndex-1)/2)]);
          toolTipRow2=(PAGE_OPTIONS.dataSet.yAxis.title+" "+(PAGE_OPTIONS.dataSet.yAxis.prefix||"")+" "+PAGE_DATA.newDataSet[indx][Math.ceil((npIndex-1)/2)].value);
          
          /*point should be available globally*/
          var point = PAGE_DATA.newDataSet[indx][Math.ceil((npIndex-1)/2)];
          point["series"] = {
            name:PAGE_OPTIONS.dataSet.series[indx].name
          };
           
          
          if(PAGE_OPTIONS.toolTip && PAGE_OPTIONS.toolTip.content){
            var toolTipContent = PAGE_OPTIONS.toolTip.content.replace(/{{/g,"${").replace(/}}/g,"}");
            var genContent = $SC.util.assemble(toolTipContent,"point");
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem,toolTipPoint,color,genContent(point),"html");
          }else
            $SC.ui.toolTip(PAGE_OPTIONS.targetElem,toolTipPoint,color,toolTipRow1,toolTipRow2);
          
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine").style.display = "block";
        }
      }
    }catch(ex){
      console.log(ex);
    }
  }/*End onMouseMove()*/
  
  function onMouseLeave(){
    $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
    document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
    var elms = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
      for(var i=0;i<elms.length;i++)
        elms[i].parentNode.removeChild(elms[i]);

    var vLine = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine");
    if(vLine) vLine.style.display = "none";

  }/*End onMouseLeave()*/
  
  function onLegendClick(e)
  {
    var seriesIndex = e.target.id.split("_")[2];
    var legendColor = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #legend_color_"+seriesIndex);
    var area = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #series_area_"+seriesIndex);
    var actualArea = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #series_actual_"+seriesIndex);
    var color = PAGE_OPTIONS.dataSet.series[seriesIndex].color||$SC.util.getColor(seriesIndex);
    
    if(legendColor.getAttribute("fill") === "#eee"){
      legendColor.setAttribute("fill",color);
      area.style.display = "block";
      if(actualArea) actualArea.style.display = "block";
    }
    else{
      legendColor.setAttribute("fill","#eee");
      area.style.display = "none";
      if(actualArea) actualArea.style.display = "none";
    }
  }/*End onLegendClick()*/
  
  function bindSliderEvents()
  {
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mouseup", function(e){
      e.stopPropagation();
      if(PAGE_DATA.mouseDown === 1 ){
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("mousemove",bindRightSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindRightSliderMove);
        if(e.target.id === "sliderRight")
          resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
        else
          resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
        reDrawSeries();
      }
      PAGE_DATA.mouseDown = 0; 
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mousemove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").removeEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindRightSliderMove);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").removeEventListener("mousemove",bindRightSliderMove);
    });
    
    /*Events for touch devices*/
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("touchmove",bindLeftSliderMove);
    },false);

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("touchmove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    },false);
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("touchmove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("touchmove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").removeEventListener("touchmove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("touchmove",bindRightSliderMove);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
    });

    
  }/*End bindSliderEvents()*/
  
  function bindLeftSliderMove(e){
    e.stopPropagation();
    e.preventDefault();
    var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e.changedTouches?e.changedTouches[0]: e);
    
    var sliderLsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").getBBox();
    var sliderRsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").getBBox();

    if(sliderLsel.x+(PAGE_DATA.fsScaleX*2) > sliderRsel.x && e.movementX > 0){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftHandle").removeEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
      return;
    }
      
    if(mousePointer.x > (PAGE_DATA.marginLeft) && mousePointer.x <((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight))
    {
      for(var j=0;j<PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1;j++)
      {
        if(mousePointer.x >= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j].x && mousePointer.x <= PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][j+1].x )
        {
          if(e.movementX <= 0)
            PAGE_DATA.windowLeftIndex = j;
          else
            PAGE_DATA.windowLeftIndex = j+1; 
        }
      }
      resetSliderPos("left",mousePointer.x);
    }
  }/*End bindLeftSliderMove()*/

  function bindRightSliderMove(e){
    e.stopPropagation();
    e.preventDefault();
    var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e.changedTouches?e.changedTouches[0]: e);
    var sliderLsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").getBBox();
    var sliderRsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").getBBox();
    
    if(sliderRsel.x-(PAGE_DATA.fsScaleX*2) <= (sliderLsel.x) && e.movementX <= 0){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightHandle").removeEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindRightSliderMove);
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
  
  function onZoomOut(e){
    e.stopPropagation();
    e.preventDefault();
    PAGE_DATA.windowLeftIndex = 0;
    PAGE_DATA.windowRightIndex = (PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length*2)-1;
    resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
    resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
    reDrawSeries();
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBoxCont").style.display = "none";
  }/*End onZoomOut()*/
  
  function resetSliderPos(type,x)
  {
    var sliderSel = (type === "right")?"slideRSel":"slideLSel";
    var sliderLine = (type === "right")?"sliderRight":"sliderLeft";
    var innerBarType = (type === "right")?"slideRSelInner":"slideLSelInner";
    var swipeFlag = (type === "right")?1:0;
    x = (x<=0?PAGE_DATA.marginLeft:x);
   
    var dr = ["M",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+PAGE_DATA.fcMarginTop),"L",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fcMarginTop)];
    var innerBar = ["M", (type==="right"?(x+3):(x-3)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+(PAGE_DATA.fullChartHeight/2)-5),"L",(type==="right"?(x+3):(x-3)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+(PAGE_DATA.fullChartHeight/2)+5),
                    "M", (type==="right"?(x+5):(x-5)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+(PAGE_DATA.fullChartHeight/2)-5),"L",(type==="right"?(x+5):(x-5)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fcMarginTop+(PAGE_DATA.fullChartHeight/2)+5)
                   ];
    
    var cy = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+(PAGE_DATA.fullChartHeight/2)+PAGE_DATA.fcMarginTop;
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+sliderSel).setAttribute("d",$SC.geom.describeEllipticalArc(x,cy,15,15,180,360,swipeFlag).d);//("cy",((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+(PAGE_DATA.fullChartHeight/2)));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+sliderLine).setAttribute("d",dr.join(" "));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+innerBarType).setAttribute("d",innerBar.join(" "));
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr #outerFrame");
    
    if(type === "left"){
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftOffset");
      sliderOffset.setAttribute("width",((x-fullSeries.getBBox().x)<0?0:(x-fullSeries.getBBox().x)));
    }else {
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightOffset");
      var width = ((fullSeries.getBBox().width+fullSeries.getBBox().x)-x);
      width = width<0?0:width;
      sliderOffset.setAttribute("width",width);
      sliderOffset.setAttribute("x",x);
    }
    
    if(type === "left"){
      if(PAGE_DATA.windowLeftIndex > 0)
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBoxCont").style.display = "block";
      else
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBoxCont").style.display = "none";
    }else if(type === "right"){
      if(PAGE_DATA.windowRightIndex < ((PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length*2)-1)){
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBoxCont").style.display = "block";
      }
      else{
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #zoomOutBoxCont").style.display = "none";
      }
    }
  }/*End resetSliderPos()*/
  

  function reDrawSeries()
  {
    var dataSet = [];
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2)).length;
    for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
    {
      var set = {"data":PAGE_OPTIONS.dataSet.series[i].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2))};
      dataSet.push(set);
    }
    
    prepareDataSet(dataSet);
    createVerticalLabel();

    createHorizontalLabel(PAGE_OPTIONS.dataSet.xAxis.categories,scaleX);
    
    PAGE_DATA.series=[];
    for(var i=0;i<dataSet.length;i++)
      createSeries(dataSet[i].data,i,scaleX);
    
    resetTextPositions();
    bindEvents();
    onMouseLeave();
  }/*End reDrawSeries()*/
  
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

  
  init();
  showAnimatedView();
};/*End of StepChart()*/
  
