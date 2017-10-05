/*
 * SVG Bubble Chart 
 * @Version:1.0.0
 * @CreatedOn:27-Sep-2016
 * @Author:SmartChartsNXT
 * @description: SVG Bubble Chart, that plots x and y data, with value in graph.
 * @JSFiddle:
 * @Sample caller code:
   window.onload = function(){
    SmartChartsNXT.ready(function(){
      var bubbleChart = new SmartChartsNXT.BubbleChart({
        "width":800,
        "height":500,
        "title":"GDP by Population and Area",
        "subTitle":"Source:www.wikipedia.org",
        "targetElem":"chartContainer",
        "canvasBorder":false,
        "bgColor":"none",
        "dataSet":{
          "xAxis":{
            "title":"Population",
            "postfix":"M "
          },
          "yAxis":{
            "title":"GDP",
            "postfix":"USD "
          },
          "series":[
            {
              name: 'GDP by Population and Area',
              data:  [
                { x: 324570000, y: 18558130, value: 9525067, label: 'US', country: 'United States' },
                { x: 1378970000, y: 11383030, value: 9572900, label: 'CH', country: 'China' },
                { x: 127110047, y: 4412600, value: 377835, label: 'JP', country: 'Japan' },
                { x: 82175700, y: 3467780, value: 357021, label: 'GE', country: 'Germany' },
                { x: 65110000, y: 2760960, value: 243610, label: 'UK', country: 'United Kingdom' },
                { x: 66763000, y: 2464790, value: 675417, label: 'FR', country: 'France' },
                { x: 1330740000, y: 2288720, value: 3287263, label: 'IN', country: 'India' },
                { x: 60665551, y: 1848690, value: 301230, label: 'IT', country: 'Italy' }
              ]
            }
          ]
        }
      });
    });
  };

*/

window.SmartChartsNXT.BubbleChart = function(opts)
{
  var PAGE_OPTIONS = { };

  var PAGE_DATA = {
    scaleX:0,
    scaleY:0,
    svgCenter:0,
    chartCenter:0,
    uniqueDataSet:[],
    maxX:0,
    minX:0,
    maxY:0,
    minY:0,
    maxVal:0,
    minVal:0,
    vTextWidth:60,
    //maxima:0,
    //minima:0,
    marginLeft:0,
    marginRight:0,
    marginTop:0,
    marginBottom:0,
    gridBoxWidth:0,
    gridBoxHeight:0,
    //longestSeries:0,
    bubbleSet:{}
  };

  var PAGE_CONST = {
    FIX_WIDTH:800,
    FIX_HEIGHT:600,
    hGridCount:11,
    vGridCount:15
  };
  

  function init()
  {
    try {
      //$SC.util.mergeRecursive(PAGE_OPTIONS,opts);
      PAGE_OPTIONS = $SC.util.extends(opts,PAGE_OPTIONS);
      $SC.addFont();
      //console.log(PAGE_OPTIONS);
      PAGE_CONST.FIX_WIDTH=PAGE_OPTIONS.width;
      PAGE_CONST.FIX_HEIGHT=PAGE_OPTIONS.height;
      
      PAGE_DATA.scaleX = PAGE_CONST.FIX_WIDTH-PAGE_OPTIONS.width;
      PAGE_DATA.scaleY = PAGE_CONST.FIX_HEIGHT-PAGE_OPTIONS.height;


      var strSVG ="<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'"+ 
                  //"preserveAspectRatio='xMidYMid meet'"+
                  "preserveAspectRatio='none'"+
                  //"currentScale='1'"+
                  //"viewBox='"+((-1)*PAGE_DATA.scaleX/2)+" "+((-1)*PAGE_DATA.scaleY/2)+" "+PAGE_CONST.FIX_WIDTH+" "+PAGE_CONST.FIX_HEIGHT+"'"+
                  "viewBox='0 0 "+PAGE_CONST.FIX_WIDTH+" "+PAGE_CONST.FIX_HEIGHT+"'"+
                  "version='1.1'" +
                  "width='"+PAGE_OPTIONS.width+"'"+
                  "height='"+PAGE_OPTIONS.height+"'"+
                  "id='bubbleChart'"+
                  "style='background:"+(PAGE_OPTIONS.bgColor||"none")+";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'"+
                  //"style='background:"+(PAGE_OPTIONS.bgColor||"none")+";width:100%;height:auto; max-width:"+PAGE_OPTIONS.width+"px;max-height:"+PAGE_OPTIONS.height+"px -moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'"+
                  "> <\/svg>";
				  
      document.getElementById(PAGE_OPTIONS.targetElem).innerHTML = "";    
      document.getElementById(PAGE_OPTIONS.targetElem).insertAdjacentHTML("beforeend",strSVG);
      
      
      
      createBubbleDropShadow();
      
      var svgWidth = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").getAttribute("width"));
      var svgHeight = parseInt(document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").getAttribute("height"));
      PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth/2),(svgHeight/2)) ;
      PAGE_DATA.chartCenter = new $SC.geom.Point(PAGE_DATA.svgCenter.x,PAGE_DATA.svgCenter.y+50) ;
      PAGE_DATA.marginLeft = ((-1)*PAGE_DATA.scaleX/2)+100,
      PAGE_DATA.marginRight =((-1)*PAGE_DATA.scaleX/2)+20;
      PAGE_DATA.marginTop = ((-1)*PAGE_DATA.scaleY/2)+100;
      PAGE_DATA.marginBottom = ((-1)*PAGE_DATA.scaleY/2)+100;
      
      $SC.appendWaterMark(PAGE_OPTIONS.targetElem,PAGE_DATA.scaleX,PAGE_DATA.scaleY);
      $SC.ui.appendMenu2(PAGE_OPTIONS.targetElem,PAGE_DATA.svgCenter,PAGE_DATA.scaleX,PAGE_DATA.scaleY);
      prepareChart();
      
    }catch(ex){
      $SC.handleError(ex,"Error in BubbleChart");
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

    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strSVG);
    
    /*Set Title of chart*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #txtTitleGrp #txtTitle").textContent = PAGE_OPTIONS.title;
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #txtSubtitle").textContent = PAGE_OPTIONS.subTitle;

    
    createGrid();
    
    var scaleX = (PAGE_DATA.gridBoxWidth-PAGE_DATA.gridWidth)/PAGE_DATA.maxX;
    var scaleY = (PAGE_DATA.gridBoxHeight-PAGE_DATA.gridHeight)/PAGE_DATA.maxY;
    //console.log("Gridboxwidth"+PAGE_DATA.gridBoxWidth,"max"+PAGE_DATA.maxX+"scaleX",scaleX,"scaleY",scaleY);
    for(var index=0;index<PAGE_OPTIONS.dataSet.series.length;index++)
    {
      createBubbles(PAGE_OPTIONS.dataSet.series[index].data,index,scaleX,scaleY);
      //createLegands(index);
      appendGradFill(index);
    }
    
    
    /*var catList = [],scaleX = PAGE_DATA.gridBoxWidth/PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;
    for(var i=0;i<PAGE_OPTIONS.dataSet.series[PAGE_DATA.longestSeries].data.length;i++)
      catList.push(PAGE_OPTIONS.dataSet.xAxis.categories[i%PAGE_OPTIONS.dataSet.xAxis.categories.length]);*/

    createHorizontalLabel();
    
    /*Creating horizontal and vertical subtitles*/
    strSVG = "<text id='hTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft+(PAGE_DATA.gridBoxWidth/2)-30)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+25)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.xAxis.title+"<\/text>";
    strSVG +="<text id='vTextSubTitle' fill='#717171' font-family='Lato'  x='"+(PAGE_DATA.marginLeft-30)+"' y='"+(PAGE_DATA.marginTop+(PAGE_DATA.gridBoxHeight/2)-5)+"' font-size='18' >"+PAGE_OPTIONS.dataSet.yAxis.title+"<\/text>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strSVG);
    
    resetTextPositions();
    
    bindEvents();
    
    //showAnimatedView();
    
  }/*End prepareChart()*/
  

  function prepareDataSet(dataSet)
  {
    var maxXSet=[],minXSet=[],maxYSet=[],minYSet=[],maxValSet=[],minValSet=[];
    dataSet = dataSet || PAGE_OPTIONS.dataSet.series;
    for(var i=0;i<dataSet.length;i++)
    {
      var xSet=[],ySet=[],val=[];
      for(var j=0;j<dataSet[i].data.length;j++){
        xSet.push(dataSet[i].data[j].x);
        ySet.push(dataSet[i].data[j].y);
        val.push(dataSet[i].data[j].value);
      }
      
      maxXSet.push(Math.max.apply(null,xSet));
      minXSet.push(Math.min.apply(null,xSet));
      maxYSet.push(Math.max.apply(null,ySet));
      minYSet.push(Math.min.apply(null,ySet));
      maxValSet.push(Math.max.apply(null,val));
      minValSet.push(Math.min.apply(null,val));
    }
    
 
    //PAGE_DATA.longestSeries = 0;
    PAGE_DATA.maxX = Math.max.apply(null,maxXSet);
    PAGE_DATA.minX = Math.min.apply(null,minXSet);
    PAGE_DATA.maxY = Math.max.apply(null,maxYSet);
    PAGE_DATA.minY = Math.min.apply(null,minYSet);
    PAGE_DATA.maxVal = Math.max.apply(null,maxValSet);
    PAGE_DATA.minVal = Math.min.apply(null,minValSet);
    
    //console.log(PAGE_DATA.maxX,PAGE_DATA.minX,PAGE_DATA.maxY,PAGE_DATA.minY,PAGE_DATA.maxVal );
  }/*End prepareDataSet()*/

  function createBubbles(dataSet,index,scaleX,scaleY)
  {
    var scaleVal = PAGE_DATA.maxVal/PAGE_DATA.gridBoxHeight;
    var intervalX = (PAGE_DATA.maxX)/(PAGE_CONST.vGridCount-1);
    var intervalY = (PAGE_DATA.maxY)/(PAGE_CONST.hGridCount-2);
    
    //console.log("intervalX:",intervalX,"SCALEX:",scaleX);
    var strSeries = "<g id='bubble_set_"+index+"' class='bubble-set'>";
    
    for(var dataCount = 0;dataCount<dataSet.length;dataCount++)
    {
      var cx = PAGE_DATA.marginLeft+((dataSet[dataCount].x-PAGE_DATA.minX+intervalX)*scaleX),
          cy=PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight-((dataSet[dataCount].y-PAGE_DATA.minY+intervalY)*scaleY),
          r = (dataSet[dataCount].value/scaleVal)/2;
          r = r>30?30:r;
          r = r<3?3:r;
      PAGE_DATA.bubbleSet["bubble_"+index+"_"+dataCount] = {"cx":cx,"cy":cy,"r":r};
      
      strSeries += "<circle id='bubble_"+index+"_"+dataCount+"' cx='"+cx+"' cy='"+cy+"' r='"+r+"' fill='url(#"+PAGE_OPTIONS.targetElem+"-bubblechart-gradRadial"+index+")' filter='url(#"+PAGE_OPTIONS.targetElem+"-bubblechart-dropshadow)'  fill-opacity='1' />";
      //$SC.geom.createDot(new $SC.geom.Point(cx,cy),"#000",2);
    }
    strSeries += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strSeries);
    
    if((-PAGE_DATA.minX+intervalX)*scaleX > 0){
      var dBaseLine = ["M",(PAGE_DATA.marginLeft+(-PAGE_DATA.minX+intervalX)*scaleX),PAGE_DATA.marginTop,(PAGE_DATA.marginLeft+(-PAGE_DATA.minX+intervalX)*scaleX),PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight];
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vBaseLine").setAttribute("d",dBaseLine.join(" "));
    }
    if(-((-PAGE_DATA.minY+intervalY)*scaleY) < 0){
      dBaseLine = ["M",PAGE_DATA.marginLeft,(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight-((-PAGE_DATA.minY+intervalY)*scaleY)),(PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight-((-PAGE_DATA.minY+intervalY)*scaleY))];
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #hBaseLine").setAttribute("d",dBaseLine.join(" "));
    }
    

  }/*End createColumns()*/
  
  function appendGradFill(index) {
    /*Creating radial gradient fill for bubble*/
    var strSVG = "  <defs>";
        strSVG += "    <radialGradient  id='"+PAGE_OPTIONS.targetElem+"-bubblechart-gradRadial"+index+"'";
        strSVG += "      gradientUnits='objectBoundingBox' fx='30%' fy='30%'>";
        strSVG += "      <stop offset='0%' style='stop-color:#fff; stop-opacity: 0.2;'><\/stop>";
        strSVG += "      <stop offset='100%' style='stop-color: "+$SC.util.getColor(index+1)+"; stop-opacity: 0.9;'><\/stop>";
        strSVG += "    <\/radialGradient>";
        strSVG += "  <\/defs>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strSVG);
  }/*End appendGradFill()*/
  
  
  
  function createLegands(index){
    /*Creating series legend*/
    var strSVG = "";
    strSVG ="<g id='series_legend_"+index+"' style='cursor:pointer;'>";
    strSVG +="<rect id='legend_color_"+index+"' x='"+PAGE_DATA.marginLeft+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+50)+"' width='10' height='10' fill='"+$SC.util.getColor(index)+"' stroke='none' stroke-width='1' opacity='1'></rect>";
    strSVG +="<text id='legend_txt_"+index+"' font-size='12' x='"+(PAGE_DATA.marginLeft+20)+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+60)+"' fill='#717171' font-family='Verdana' >"+PAGE_OPTIONS.dataSet.series[index].name+"</text>";
    strSVG +="</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #legendContainer").insertAdjacentHTML("beforeend",strSVG);
  }

  function createGrid()
  {
    PAGE_DATA.gridBoxWidth = (PAGE_DATA.svgCenter.x*2)-PAGE_DATA.marginLeft-PAGE_DATA.marginRight;
    PAGE_DATA.gridBoxHeight = (PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom;
    PAGE_DATA.gridHeight = (((PAGE_DATA.svgCenter.y*2)-PAGE_DATA.marginTop-PAGE_DATA.marginBottom)/(PAGE_CONST.hGridCount-1));
    PAGE_DATA.gridWidth = (PAGE_DATA.gridBoxWidth/PAGE_CONST.vGridCount);
    var gridBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #gridBox");
    if(gridBox)  gridBox.parentNode.removeChild(gridBox);
    
    var strGrid = "";
    strGrid += "<g id='gridBox' >";
    strGrid += "<g id='hGrid' >";
    for(var gridCount = 0;gridCount<PAGE_CONST.hGridCount;gridCount++)
    {
      var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight),"L", PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
      var d = ["M",PAGE_DATA.marginLeft,(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)),"L",(PAGE_DATA.marginLeft-5),(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight))];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strGrid += "</g>";
    strGrid += "<g id='vGrid' >";
    for(var gridCount = 0;gridCount<PAGE_CONST.vGridCount;gridCount++)
    {
      var d = ["M", PAGE_DATA.marginLeft+(gridCount*PAGE_DATA.gridWidth), PAGE_DATA.marginTop,"L", PAGE_DATA.marginLeft+(gridCount*PAGE_DATA.gridWidth), PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#D8D8D8' stroke-width='1' stroke-opacity='1'></path>";
      var d = ["M",(PAGE_DATA.marginLeft+(gridCount*PAGE_DATA.gridWidth)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight),"L",(PAGE_DATA.marginLeft+(gridCount*PAGE_DATA.gridWidth)),(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+10)];
      strGrid +="<path fill='none' d='"+d.join(" ")+"' stroke='#333' stroke-width='1' opacity='1'></path>";
    }
    strGrid += "</g>";
    
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop,"L", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+10];
    strGrid +="<path id='gridBoxLeftBorder' d='"+d.join(" ")+"' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    var d = ["M", PAGE_DATA.marginLeft, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight,"L", PAGE_DATA.marginLeft+PAGE_DATA.gridBoxWidth, PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight];
    strGrid +="<path id='gridBoxBottomBorder' d='"+d.join(" ")+"' fill='none' stroke='#333' stroke-width='1' opacity='1'></path>";
    
    strGrid +="<path id='hBaseLine' fill='none' stroke-dasharray='5, 5' stroke='#222' stroke-width='1' opacity='1'></path>";
    strGrid +="<path id='vBaseLine' fill='none' stroke-dasharray='5, 5' stroke='#222' stroke-width='1' opacity='1'></path>";
    
    strGrid +="<path id='hLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid +="<path id='vLine' fill='none' stroke='#D8D8D8' stroke-width='1' opacity='1'></path>";
    strGrid += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strGrid);
    createVerticalLabel();
  }/*End createGrid()*/

  function createVerticalLabel()
  {
    var vTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vTextLabel");
    if(vTextLabel) vTextLabel.parentNode.removeChild(vTextLabel);
    
    var interval = (PAGE_DATA.maxY)/(PAGE_CONST.hGridCount-2);
    var strText = "<g id='vTextLabel'>";
    for(var gridCount = PAGE_CONST.hGridCount-1,i=0;gridCount>=0;gridCount--)
    {
      var value = (i++*interval)+PAGE_DATA.minY-interval;
      value = (Math.abs(value) >= 1000?(value/1000).toFixed(2)+"K":value.toFixed(2));
      strText +="<text font-family='Lato' fill='#717171'><tspan x='"+(PAGE_DATA.marginLeft-PAGE_DATA.vTextWidth-5)+"' y='"+(PAGE_DATA.marginTop+(gridCount*PAGE_DATA.gridHeight)+5)+"' font-size='15' >"+((PAGE_OPTIONS.dataSet.yAxis.prefix)?PAGE_OPTIONS.dataSet.yAxis.prefix:"")+value+"<\/tspan></text>";
      
    }
    strText += "</g>";
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strText);
    
    var overFlow = 0; 
    var vTextLabelBox = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vTextLabel").getBBox();
    if((vTextLabelBox.width+5) > PAGE_DATA.vTextWidth)
      overFlow = (vTextLabelBox.width+5)- PAGE_DATA.vTextWidth;
    
    if(overFlow !== 0){
      PAGE_DATA.marginLeft = PAGE_DATA.marginLeft+(overFlow);
      PAGE_DATA.vTextWidth=(vTextLabelBox.width+5);
      createGrid();
      bindEvents();
    }
  }/*End createVerticalLabel()*/

  function createHorizontalLabel()
  {
    var hTextLabel = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #hTextLabel");
    if(hTextLabel) hTextLabel.parentNode.removeChild(hTextLabel);
    
    var interval = (PAGE_DATA.maxX)/(PAGE_CONST.vGridCount-1);
    
    var strText = "<g id='hTextLabel'>";
    for(var gridCount = 0,i=0;gridCount<PAGE_CONST.vGridCount;gridCount++)
    {
      var value = (i++*interval)+PAGE_DATA.minX-interval;
      value = (Math.abs(value) >= 1000?(value/1000).toFixed(2)+"K":value.toFixed(2));
      strText +="<text font-family='Lato' fill='black' x='"+(PAGE_DATA.marginLeft+(gridCount*PAGE_DATA.gridWidth))+"' y='"+(PAGE_DATA.marginTop+PAGE_DATA.gridBoxHeight+35)+"' ><tspan  font-size='12' >"+value+"<\/tspan></text>";
    }
    strText += "</g>";
    
    /*bind hover event*/
    document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart").insertAdjacentHTML("beforeend",strText);
    var hTextLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #hTextLabel text");
    var totalHTextWidth = 0;
    for(var i=0;i<hTextLabels.length;i++)
    {
      var txWidth = hTextLabels[i].getComputedTextLength();
      totalHTextWidth+=(txWidth);
    }
    
  }/*End createHorizontalLabel()*/
  
  
  function resetTextPositions()
  {
    var txtTitleGrp = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #txtTitleGrp");
    var titleBox = txtTitleGrp.getBBox();

    txtTitleGrp.querySelector("#txtTitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(titleBox.width/2)));
    txtTitleGrp.querySelector("#txtTitle").setAttribute("y",(PAGE_DATA.svgCenter.y-250));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("x",(PAGE_DATA.svgCenter.x-(txtTitleGrp.querySelector("#txtSubtitle").getComputedTextLength()/2)));
    txtTitleGrp.querySelector("#txtSubtitle").setAttribute("y",(PAGE_DATA.svgCenter.y-220));
    
    /*Reset vertical text label*/
    var arrVLabels = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vTextLabel");
    var vLabelwidth = arrVLabels[0].getBBox().width;
    var arrVText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vTextLabel tspan");
    for(var i=0;i<arrVText.length;i++)
      arrVText[i].setAttribute("x",(PAGE_DATA.marginLeft-vLabelwidth-10));
    
    /*Reset horzontal text label*/
    var totalHTextWidth = 0;
    var arrHText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #hTextLabel text");
    for(var i=0;i<arrHText.length;i++)
    {
      var txWidth = arrHText[i].getComputedTextLength();
      totalHTextWidth+=(txWidth);
    }
    if(parseFloat(totalHTextWidth+(arrHText.length*10)) > parseFloat(PAGE_DATA.gridBoxWidth) )
    {
      for(var i=0;i<arrHText.length;i++)
      {
        var cx = arrHText[i].getAttribute("x");
        var cy = arrHText[i].getAttribute("y"); 
        arrHText[i].setAttribute("transform", "rotate(45,"+cx+","+cy+")");
      }
    }else {
      for(var i=0;i<arrHText.length;i++)
      {
        var cx = arrHText[i].getAttribute("x");
        txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
        arrHText[i].setAttribute("x",cx-(txWidth/2));
      }
    }
    var vTxtSubTitle = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #vTextSubTitle");
    vTxtSubTitle.setAttribute("transform", "matrix(0,-1,1,0,"+(PAGE_DATA.marginLeft-vLabelwidth-20)+","+(PAGE_DATA.svgCenter.y)+")");
    vTxtSubTitle.setAttribute("x",20);
    vTxtSubTitle.setAttribute("y",0);
    
    /*Set position for legend text*/
    var arrLegendText = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #legendContainer text");
    var arrLegendColor = document.querySelectorAll("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #legendContainer rect");
    var width = 0;
    for(var i=0;i<arrLegendText.length;i++)
    {
      arrLegendColor[i].setAttribute("x",(width+PAGE_DATA.marginLeft));
      arrLegendText[i].setAttribute("x",(width+PAGE_DATA.marginLeft+20));
      width+=(arrLegendText[i].getBBox().width+50);
    }
    
  }/*End resetTextPositions()*/
  
  function showAnimatedView(){
    var scaleY = 0.0;
    
    var timeoutId = setInterval  (function(){
      for(var col in PAGE_DATA.columns)
      {
        var column = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #"+col);
        scaleYElem(column,1,scaleY);
      }
      scaleY+=0.1;
      if(scaleY >=1)
        clearInterval(timeoutId);
    },50);
  }/*End showAnimatedView()*/
  
  function scaleYElem(elementNode,scaleX,scaleY){
    var bbox=elementNode.getBBox();
    var cx=bbox.x+(bbox.width/2),
        cy=bbox.y+(bbox.height);   // finding center of element
    var saclestr=scaleX+','+scaleY;
    var tx=-cx*(scaleX-1);
    var ty=-cy*(scaleY-1);                        
    var translatestr=parseFloat(tx).toFixed(3)+','+parseFloat(ty).toFixed(3);

    elementNode.setAttribute('transform','translate('+translatestr+') scale('+saclestr+')');
  }/*End scaleYElem()*/

  function bindEvents()
  {
    for(var series=0;series<PAGE_OPTIONS.dataSet.series.length;series++)
    {
      for(var bbleIndex=0;bbleIndex<PAGE_OPTIONS.dataSet.series[series].data.length;bbleIndex++)
      {
        var bubble = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #bubble_"+series+"_"+bbleIndex);
        if(bubble) {
          bubble.addEventListener("mouseenter",onMouseOver);
          bubble.addEventListener("mouseleave",onMouseLeave);
        }
        
      }
    }
    
    window.removeEventListener('resize',onWindowResize);
    window.addEventListener('resize',onWindowResize ,true);
    
    
    
  }/*End bindEvents()*/
  
  var timeOut = null;
  function onWindowResize(){
    if (timeOut != null)
        clearTimeout(timeOut);

    timeOut = setTimeout(function(){
      var containerDiv = document.querySelector("#"+PAGE_OPTIONS.targetElem);
      console.log(containerDiv.offsetWidth);
      opts.width = containerDiv.offsetWidth;
      PAGE_CONST.FIX_WIDTH = containerDiv.offsetWidth;
      init();
    }, 100);

  }
  
  function assemble(literal, params) {
    return new Function(params, "return `"+literal+"`;"); // TODO: Proper escaping
  }
  
  function onMouseOver(e)
  {  
    try{
      var bubbleId = e.target.id; 
      var seriesIndex = bubbleId.split("_")[1];
      var bbleIndex = bubbleId.split("_")[2];
      
      /*point should be available globally*/
      var point = PAGE_OPTIONS.dataSet.series[seriesIndex].data[bbleIndex];
      var toolTipPoint = new $SC.geom.Point(PAGE_DATA.bubbleSet[bubbleId].cx,(PAGE_DATA.bubbleSet[bubbleId].cy-PAGE_DATA.bubbleSet[bubbleId].r+15));
      if(PAGE_OPTIONS.toolTip && PAGE_OPTIONS.toolTip.content){
        var toolTipContent = PAGE_OPTIONS.toolTip.content.replace(/{{/g,"${").replace(/}}/g,"}");
        var genContent = assemble(toolTipContent,"point");
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,toolTipPoint,$SC.util.getColor(seriesIndex+1),genContent(point),"html");
        
      }else {
        $SC.ui.toolTip(PAGE_OPTIONS.targetElem,toolTipPoint,$SC.util.getColor(seriesIndex+1),point.label,point.value);
      }
    }catch(ex){
      console.log(ex);
    }
  };
  
  function onMouseLeave(e)
  {
    var bubbleId = e.target.id; 
    var bubble = document.querySelector("#"+PAGE_OPTIONS.targetElem+" #bubbleChart #"+bubbleId);
    //column.setAttribute("opacity",1);
    $SC.ui.toolTip(PAGE_OPTIONS.targetElem,"hide");
  };
  
    

  function createBubbleDropShadow(){
      var strSVG = "";
      strSVG =  "<filter id='"+PAGE_OPTIONS.targetElem+"-bubblechart-dropshadow' height='130%'>";
      strSVG += "  <feGaussianBlur in='SourceGraphic' stdDeviation='1'/>"; 
      strSVG += "  <feOffset dx='2' dy='2' result='offsetblur'/>"; 
      strSVG += "  <feMerge>"; 
      strSVG += "    <feMergeNode/>";
      strSVG += "    <feMergeNode in='SourceGraphic'/>";
      strSVG += "  </feMerge>";
      strSVG += "</filter>";
      document.querySelector("#"+PAGE_OPTIONS.targetElem+" svg").insertAdjacentHTML("beforeend",strSVG);
   
  };/*End appendDropShadow()*/
  
  init();
};/*End of drawPieChart3D()*/
  
