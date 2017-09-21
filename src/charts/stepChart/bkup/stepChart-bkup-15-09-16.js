/*
 * SVG Step Chart 
 * @Version:1.0.0
 * @CreatedOn:13-Sep-2016
 * @Author:SmartCharts
 * @description: SVG Step Chart,that shows data as stair step and can support zoom window
 * @JSFiddle:
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

  SmartCharts.ready(function(){
    var stepChart = new SmartCharts.stepChart(settings);
  });

 */

window.SmartCharts.StepChart = function(opts)
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
    mouseDown:0,
    newDataSet:[],
    newCatgList:[]
  };

  var PAGE_CONST = {
    FIX_WIDTH:800,
    FIX_HEIGHT:500,
    hGridCount:7
  };
  

  function init()
  {
    try {
      $SC.util.mergeRecursive(PAGE_OPTIONS,opts);
      $SC.addFont();
      console.log(PAGE_OPTIONS);
      PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
      PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;


      var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                  "preserveAspectRatio='xMidYMid meet'"+
                  "currentScale='1'"+
                  "viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" "+PAGE_CONST.FIX_WIDTH+" "+PAGE_CONST.FIX_HEIGHT+"'"+
                  "version='1.1'" +
                  "width='"+PAGE_OPTIONS.width+"'"+
                  "height='"+PAGE_OPTIONS.height+"'"+
                  "id='stepChart'"+
                  "style='background:"+(PAGE_OPTIONS.bgColor||"none")+";width:100%;height:auto; max-width:"+PAGE_OPTIONS.width+"px;max-height:"+PAGE_OPTIONS.height+"px -moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'"+
                  "> <\/svg>";
				  
      document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";    
      document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend",strSVG);
      
      
      
      var svgWidth = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").getAttribute("width"));
      var svgHeight = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").getAttribute("height"));
      PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth/2),(svgHeight/2)) ;
      PAGE_DATA.chartCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;
      PAGE_DATA.marginLeft = ((-1)*PAGE_DATA.scaleX/2)+100;
      PAGE_DATA.marginRight =((-1)*PAGE_DATA.scaleX/2)+20; //(PAGE_DATA.svgCenter.x*2)*10/100; ;
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
      
      console.log(PAGE_DATA.longestSeries ,PAGE_DATA.windowRightIndex);
      
      $SC.appendWaterMark(PAGE_OPTIONS.targetElem);
      $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem,PAGE_DATA.svgCenter);
      
    }catch(ex){
      $SC.handleError(ex,"Error in StepChart");
    }

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

    strSVG += "<g id='fullSeriesContr'>";
    strSVG += "</g>";

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
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSVG);
    
    resetTextPositions();
    
    var longestFullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeries_"+PAGE_DATA.longestSeries);
    //var fullSXinterval = (PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length);
    resetSliderPos("left",(PAGE_DATA.marginLeft));
    resetSliderPos("right",(longestFullSeries.getBBox().x+longestFullSeries.getBBox().width));
    
    //bindEvents();
    bindSliderEvents();
    //showAnimatedView();
    
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr");
    fullSeries.parentNode.removeChild(fullSeries);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").appendChild(fullSeries);
  }/*End prepareChart()*/
  
  
  function createFullSeries()
  {
    var strSVG = "";
    strSVG += "<rect id='sliderLeftOffset' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= 'rgba(128,179,236,0.1)'  style='stroke-width:0.1;stroke:#717171;' \/>";
    strSVG += "<rect id='sliderRightOffset' x='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginRight)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='0' height='"+(PAGE_DATA.fullChartHeight)+"' fill= 'rgba(128,179,236,0.1)' style='stroke-width:0.1;stroke:#717171;' \/>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSVG);
    
    /* ploting actual points */
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      drawFullSeries(PAGE_OPTIONS.dataSet.series[index].data,index);
    }
    
    strSVG = "";
    strSVG += "<rect id='outerFrame' x='"+(PAGE_DATA.marginLeft)+"' y='"+((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight)+"' width='"+((PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight)+"' height='"+(PAGE_DATA.fullChartHeight)+"' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
    strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
    strSVG += "<path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
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
          var p1 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*scaleX),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+60)-(dataSet[dataCount]*scaleYfull)+(PAGE_DATA.minima*scaleYfull)));
          var p2 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*scaleX)+(scaleX),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+PAGE_DATA.fullChartHeight+60)-(dataSet[dataCount]*scaleYfull)+(PAGE_DATA.minima*scaleYfull)));
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

      //var line = [];
      strSeries = "<g id='fullSeries_"+index+"' class='fullSeries'>";
      /*line.push.apply(line,["M",arrPointsSet[0].x,arrPointsSet[0].y]);
      var point=0;
      for(var point = 0;(point+2)<arrPointsSet.length;point++)
      {
        var curve = $SC.geom.describeBezireArc(arrPointsSet[point],arrPointsSet[point+1],arrPointsSet[point+2]);
        line.push.apply(line,curve);
      }
      line.push.apply(line,["L",arrPointsSet[arrPointsSet.length-1].x,arrPointsSet[arrPointsSet.length-1].y]);*/
      strSeries +="<path id='fLine_"+index+"' stroke='"+$SC.util.getColor(index)+"' fill='none' d='"+d.join(" ")+"' stroke-width='1' opacity='1'></path>";
      strSeries += "<g>";
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr").insertAdjacentHTML("beforeend",strSeries);
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
    if(PAGE_DATA.maxima === PAGE_DATA.minima)
      PAGE_DATA.minima = 0;
    //PAGE_DATA.maxima = round(PAGE_DATA.maxima);
  }/*End prepareDataSet()*/

  function createSeries(dataSet,index,scaleX)
  {
    var d =[];
    var elemActualSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_actual_"+index);
    if(elemActualSeries)elemActualSeries.parentNode.removeChild(elemActualSeries);
    var elemSeriesArea = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_area_"+index);
    if(elemSeriesArea)elemSeriesArea.parentNode.removeChild(elemSeriesArea);
    var elemColumnSet = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #column_set_"+index);
    if(elemColumnSet)elemColumnSet.parentNode.removeChild(elemColumnSet);
    
    var interval = (PAGE_DATA.gridBoxWidth)/(dataSet.length);
    var scaleY = (PAGE_DATA.gridBoxHeight/(PAGE_DATA.maxima-PAGE_DATA.minima))||1; 
    var arrPointsSet = [],strSeries="";
   
    console.log("scaley",scaleY);
    /* ploting actual points */
    var strSeries = "<g id='series_actual_"+index+"' class='series'>";
    //if(dataSet.length > 1){
      for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
      {
        var p1 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount]*scaleY)+(PAGE_DATA.minima*scaleY)));
        var p2 = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval)+(interval),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount]*scaleY)+(PAGE_DATA.minima*scaleY)));
        if(dataCount === 0)
          d.push("M");
        else
          d.push("L");
        d.push.apply(d,[p1.x,p1.y,"L",p2.x,p2.y]);
        arrPointsSet.push(p1);
        arrPointsSet.push(p2);
        console.log(arrPointsSet);
      }
    //}
    console.log("p1",p1);
    console.log("p2",p2);
    
    strSeries +="<path stroke='"+$SC.util.getColor(index)+"' fill='none' d='"+d.join(" ")+"' stroke-width='2' opacity='1'></path>";
    strSeries += "</g>";
    //if(dataSet.length <50)
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSeries);
    PAGE_DATA.series.push(arrPointsSet);
    
    if(dataSet.length > 10){
      var area = d;
      strSeries = "<g id='series_area_"+index+"' class='series'>";
      if(dataSet.length > 2){
        area.push.apply(area,["L",arrPointsSet[arrPointsSet.length-1].x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),arrPointsSet[0].x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)],"Z");

      }
      strSeries +="<path id='area_"+index+"' fill='"+$SC.util.getColor(index)+"' d='"+area.join(" ")+"' stroke-width='2' stroke='none'opacity='0.2'></path>";
    }else {
      var strSeries = "<g id='column_set_"+index+"' class='columns'>";
      var colHalfWidth = (interval)/2;
      //scaleY = PAGE_DATA.gridBoxHeight/(PAGE_DATA.maxima); 
      for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
      {
        var p = new $SC.geom.Point(PAGE_DATA.marginLeft+(dataCount*interval)+(interval/2),((PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight)-(dataSet[dataCount]*scaleY)+(PAGE_DATA.minima*scaleY)));
        var col = [
          "M", p.x-colHalfWidth, p.y,
          "L", p.x+colHalfWidth, p.y,
          "L", p.x+colHalfWidth, (PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),
          "L", p.x-colHalfWidth,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),
          "Z"
        ];
        strSeries +="<path id='column_"+index+"_"+dataCount+"' stroke='"+$SC.util.getColor(index)+"'  fill='"+$SC.util.getColor(index)+"' d='"+col.join(" ")+"' stroke-width='1' opacity='"+((dataCount+1)*0.1)+"'></path>";
      }
    }
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSeries);

  }/*End createSeries()*/
  
  function appendGradFill(index) {
    /*Creating gradient fill for area*/
    var strSVG = "";
    strSVG += "<defs>";
    strSVG += "  <linearGradient gradientUnits = 'userSpaceOnUse' id='"+PAGE_OPTIONS.targetElem+"-linechart-gradLinear"+index+"' x1='0%' y1='0%' x2='100%' y2='0%'>";
    strSVG += "  <stop offset='0%' style='stop-color:white;stop-opacity:0.5' />";
    strSVG += "  <stop offset='100%' style='stop-color:"+$SC.util.getColor(index)+";stop-opacity:0.5' />";
    strSVG += "  </linearGradient>";
    strSVG += "</defs>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strSVG);
  }/*End appendGradFill()*/
  
  
  
  function createLegands(index){
    /*Creating series legend*/
    var strSVG = "";
    strSVG ="<g id='series_legend_"+index+"' style='cursor:pointer;'>";
    strSVG +="<rect id='legend_color_"+index+"' x='"+PAGE_DATA.marginLeft+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+130)+"' width='10' height='10' fill='"+$SC.util.getColor(index)+"' stroke='none' stroke-width='1' opacity='1'></rect>";
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
    strGrid +="<path id='gridBoxLeftBorder' d='"+d.join(" ")+"' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    strGrid +="<path id='hLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid +="<path id='vLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").insertAdjacentHTML("beforeend",strGrid);
    createVerticalLabel();
  }/*End createGrid()*/
  
  function createVerticalLabel()
  {
    var vTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextLabel");
    if(vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);
    
    //var interval = (PAGE_DATA.maxima)/(PAGE_CONST.hGridCount-1);
    var interval = (PAGE_DATA.maxima-PAGE_DATA.minima)/(PAGE_CONST.hGridCount-1);
    var strText = "<g id='vTextLabel'>";
    for(var gridCount = PAGE_CONST.hGridCount-1,i=0;gridCount>=0;gridCount--)
    {
      var value = PAGE_DATA.minima+(i++*interval);
      value = (value >= 1000?(value/1000).toFixed(2)+"K":value.toFixed(2));
      strText +="<text font-family='Lato' fill='#717171'><tspan x='"+(PAGE_DATA.marginLeft-30)+"' y='"+(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)+5)+"' font-size='15' >"+((PAGE_OPTIONS.dataSet.yAxis.prefix)?PAGE_OPTIONS.dataSet.yAxis.prefix:"")+value+"<\/tspan></text>";
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
      strText +="<text font-family='Lato' fill='black' title='"+categories[hText]+"' x='"+(PAGE_DATA.marginLeft+(hText*interval)+(interval/2))+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+20)+"' ><tspan  font-size='12' >"+categories[hText]+"<\/tspan></text>";
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
    var txtTitleGrp = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #txtTitleGrp");
    var titleBox = txtTitleGrp.getBBox();

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y",(PAGE_DATA.svgCenter.y-200));//.setAttribute("x",(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(txtTitleGrp.querySelector("#txtSubtitle").getComputedTextLength()/2)));//.setAttribute("x",(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y",(PAGE_DATA.svgCenter.y-170));
    
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
    var vTxtSubTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0,"+(PAGE_DATA.marginLeft-vLabelwidth-30)+","+(PAGE_DATA.svgCenter.y)+")");
    vTxtSubTitle.setAttribute("x",0);
    vTxtSubTitle.setAttribute("y",0);
    
    /*Set position for legend text*/
    var arrLegendText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #legendContainer text");
    var arrLegendColor = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart #legendContainer rect");
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
        
        
      }
      pointIndex++;
    },50);
  }/*End showAnimatedView()*/
  

  function bindEvents()
  {
    PAGE_DATA.windowRightIndex = (PAGE_DATA.windowRightIndex < 0)?PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length:PAGE_DATA.windowRightIndex;
    PAGE_DATA.newDataSet=[],PAGE_DATA.newCatgList=[];
    for(var i=PAGE_DATA.windowLeftIndex;i<=(PAGE_DATA.windowRightIndex);i++)
      PAGE_DATA.newCatgList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    for(var setIndex=0;setIndex<PAGE_OPTIONS.dataSet.series.length;setIndex++){
      var set = PAGE_OPTIONS.dataSet.series[setIndex].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex+1));
      if(set.length > 1)
        PAGE_DATA.newDataSet.push(set);
    }
      
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",onMouseMove);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mousemove", onMouseMove,false);

    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_legend_"+index).addEventListener("click", function(e){
        var arrSeries = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .series");
        for(var i=0;i<arrSeries.length;i++)
          arrSeries[i].style.visibility = "hidden";
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_"+e.target.id.split("_")[2]).style.visibility = "visible";
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #series_actual_"+e.target.id.split("_")[2]).style.visibility = "visible";
      },false);
    }
  }/*End bindEvents()*/
  
  function onMouseMove(e)
  {  
    try{
      var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e);
      var scaleY = (PAGE_DATA.gridBoxHeight/PAGE_DATA.maxima); 

      var gridBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #gridBox").getBBox();
      if(mousePointer.x >= gridBox.x  && mousePointer.x < (gridBox.x+PAGE_DATA.gridBoxWidth) && mousePointer.y >= gridBox.y  && mousePointer.y < (gridBox.y+PAGE_DATA.gridBoxHeight))
      {  
        var nearestPoint = nearestAmongAllSeries(mousePointer);
        var nearestPointIndex =  nearestPoint.pointIndex;
        var indx = nearestPoint.seriesIndex;

        /*Create vertical line*/
        var vLine = ["M",mousePointer.x,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),"L",mousePointer.x,PAGE_DATA.marginTop];
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine").setAttribute("d",vLine.join(" "));

        var toolTipPoint = PAGE_DATA.series[indx][nearestPointIndex];

        if(toolTipPoint)
        {
          var elms = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
          for(var i=0;i<elms.length;i++)
            elms[i].parentNode.removeChild(elms[i]);

          $SC.geom.createDot(toolTipPoint,$SC.util.getColor(indx),3,1,"tooTipPoint","stepChart");
          $SC.geom.createDot(toolTipPoint,$SC.util.getColor(indx),8,0.2,"tooTipPoint","stepChart");

          var toolTipRow1,toolTipRow2;
          if((toolTipPoint.x > (PAGE_DATA.series[indx][nearestPointIndex].x-5)) && (toolTipPoint.x < (PAGE_DATA.series[indx][nearestPointIndex].x+5)) ){
            toolTipRow1=(PAGE_OPTIONS.dataSet.xAxis.title+" "+PAGE_DATA.newCatgList[nearestPointIndex]);
            toolTipRow2=(PAGE_OPTIONS.dataSet.yAxis.title+" "+(PAGE_OPTIONS.dataSet.yAxis.prefix||"")+" "+PAGE_DATA.newDataSet[indx][nearestPointIndex]);
          }

          $SC.ui.toolTip(PAGE_OPTIONS.targetElem,toolTipPoint,$SC.util.getColor(indx),toolTipRow1,toolTipRow2);
          document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine").style.display = "block";
        }
      }else {
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #vLine").style.display = "none";
        document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
        var elms = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #stepChart .tooTipPoint");
          for(var i=0;i<elms.length;i++)
            elms[i].parentNode.removeChild(elms[i]);
      }
    }catch(ex){
      console.log(ex);
    }
  };
  
  function bindSliderEvents()
  {
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mouseup", function(e){
      e.stopPropagation();
      if(PAGE_DATA.mouseDown === 1 ){
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindLeftSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindRightSliderMove);
        document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindRightSliderMove);
        if(e.target.id === "sliderRight")
          resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
        else
          resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
        reDrawSeries();
      }
      PAGE_DATA.mouseDown = 0; 
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("mousedown", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("mousemove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("mouseup", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").removeEventListener("mousemove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("mousemove",bindRightSliderMove);
      console.log(PAGE_DATA.fullSeries[PAGE_DATA.longestSeries],PAGE_DATA.windowRightIndex);
      resetSliderPos("right",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowRightIndex].x);
      reDrawSeries();
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("mouseleave", function(e){
      e.stopPropagation();
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").removeEventListener("mousemove",bindRightSliderMove);
    });
    
    /*Events for touch devices*/
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("touchmove",bindLeftSliderMove);
    },false);

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+ PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("touchmove",bindLeftSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").removeEventListener("touchmove",bindLeftSliderMove);
      resetSliderPos("left",PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.windowLeftIndex].x);
      reDrawSeries();
    },false);
    
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("touchstart", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 1; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("touchmove",bindRightSliderMove);
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart").addEventListener("touchmove",bindRightSliderMove);
    });

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").addEventListener("touchend", function(e){
      e.stopPropagation();
      PAGE_DATA.mouseDown = 0; 
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").removeEventListener("touchmove",bindRightSliderMove);
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
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindLeftSliderMove);
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
      
      /*console.log(PAGE_DATA.windowLeftIndex);
      console.log(mousePointer.x);
      console.log(PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1].x);*/
    }
  }/*End bindLeftSliderMove()*/

  function bindRightSliderMove(e){
    e.stopPropagation();
    e.preventDefault();
    var mousePointer = $SC.ui.cursorPoint(PAGE_OPTIONS.targetElem,e.changedTouches?e.changedTouches[0]: e);
    var sliderLsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").getBBox();
    var sliderRsel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideRSel").getBBox();
    
    if(sliderRsel.x-(PAGE_DATA.fsScaleX*2) <= (sliderLsel.x) && e.movementX <= 0){
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #slideLSel").removeEventListener("mousemove",bindRightSliderMove);
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
      
      console.log(PAGE_DATA.windowRightIndex);
      console.log(mousePointer.x);
      console.log(PAGE_DATA.fullSeries[PAGE_DATA.longestSeries][PAGE_DATA.fullSeries[PAGE_DATA.longestSeries].length-1].x);
    }
  }/*End bindRightSliderMove()*/
  
  function resetSliderPos(type,x)
  {
    var sliderSel = (type === "right")?"slideRSel":"slideLSel";
    var sliderLine = (type === "right")?"sliderRight":"sliderLeft";
    var innerBarType = (type === "right")?"slideRSelInner":"slideLSelInner";
    var swipeFlag = (type === "right")?1:0;
    x = (x<=0?PAGE_DATA.marginLeft:x);
   
    var dr = ["M",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+60),"L",x,((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+60)];
    var innerBar = ["M", (type==="right"?(x+3):(x-3)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+60+(PAGE_DATA.fullChartHeight/2)-5),"L",(type==="right"?(x+3):(x-3)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+60+(PAGE_DATA.fullChartHeight/2)+5),
                    "M", (type==="right"?(x+5):(x-5)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+60+(PAGE_DATA.fullChartHeight/2)-5),"L",(type==="right"?(x+5):(x-5)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+60+(PAGE_DATA.fullChartHeight/2)+5)
                   ];
    
    var cy = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+(PAGE_DATA.fullChartHeight/2);
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+sliderSel).setAttribute("d",$SC.geom.describeEllipticalArc(x,cy,15,15,180,360,swipeFlag).d);//("cy",((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginBottom+PAGE_DATA.fullChartHeight+(PAGE_DATA.fullChartHeight/2)));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+sliderLine).setAttribute("d",dr.join(" "));
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #"+innerBarType).setAttribute("d",innerBar.join(" "));
    var fullSeries = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #fullSeriesContr #outerFrame");
    
    if(type === "left"){
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderLeftOffset");
      sliderOffset.setAttribute("width",((x-fullSeries.getBBox().x)<0?0:(x-fullSeries.getBBox().x)));
    }else {
      var sliderOffset = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #stepChart #sliderRightOffset");
      sliderOffset.setAttribute("width",((fullSeries.getBBox().width+fullSeries.getBBox().x)-x));
      sliderOffset.setAttribute("x",x);
    }

  }/*End resetSliderPos()*/
  
  
  function reDrawSeries()
  {
    var dataSet = [];
    var scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex)).length;
    for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
    {
      var set = {"data":PAGE_OPTIONS.dataSet.series[i].data.slice(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2))};
      dataSet.push(set);
    }
    console.log(dataSet); 
    console.log(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex));
    console.log(Math.ceil(PAGE_DATA.windowLeftIndex/2),Math.ceil((PAGE_DATA.windowRightIndex)/2));
    prepareDataSet(dataSet);
    createVerticalLabel();

    var catList = [];
    for(var i=PAGE_DATA.windowLeftIndex;i<=(PAGE_DATA.windowRightIndex);i++)
      catList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);

    createHorizontalLabel(catList,scaleX);
    
    PAGE_DATA.series=[];
    for(var i=0;i<dataSet.length;i++)
      createSeries(dataSet[i].data,i);
    /*for(var i=0;i<PAGE_OPTIONS.dataSet.series.length;i++)
      createSeries(PAGE_OPTIONS.dataSet.series[i].data.slice(PAGE_DATA.windowLeftIndex,(PAGE_DATA.windowRightIndex-1)),i,scaleX);*/
    resetTextPositions();
    //bindEvents();
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
      var dist =$SC.geom.getDistanceBetween(arrPointSet[p], point);
      if(dist < minDist)
      {
        minDist = dist;
        index = p;
      }
    }
    return {dist:minDist,index:index};
  }/*End getNearestPoint()*/
  
  init();
};/*End of drawPieChart3D()*/
  
