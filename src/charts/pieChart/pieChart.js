/** 
 * pieChart.js
 * SVG Pie Chart 2D
 * @version:1.1.0
 * @createdOn:07-Jul-2016
 * @author:SmartChartsNXT
 * @description:This will generate a 2d Pie chart. Using SVG 1.1 elements and HTML 5 standard. 
 * @JSFiddle:
 * 
 * 
 * @Sample caller code:
 * let settings = {
    "title":"Browser Statistics and Trends",
    "outline":2,
    "canvasBorder":true,
    "subtitle":"As of Q1, 2016",
    "targetElem":"chartContainer",
    "bgColor":"gray",
    "legends": {
      "enable" : true
    },
    "animated":false,
    "tooltip": {
      "content": function() {
        return '<table>' +
        '<tr><td><b>'+this.label+'</b> has global usage </td></tr>' +
        '<tr><td> of <b>'+this.value+'% </b>Worldwide.</td></tr>' +
        '</table>';
      }
    },
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
        "value":"3.6",
        "slicedOut":true
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
    let pieChart = new SmartChartsNXT.Chart(settings);
  });
 */

"use strict";

import Point from "./../../core/point";
import { Component } from "./../../viewEngin/pview";
import defaultConfig from "./../../settings/config";
import UtilCore from './../../core/util.core';
import UiCore from './../../core/ui.core';
import Draggable from './../../components/draggable'; 
import LegendBox from './../../components/legendBox';
import Tooltip from './../../components/tooltip';
import PieSet from './pieSet'; 

class PieChart extends Component {
  constructor(props) {
    super(props);
    try {
      let self = this;
      this.CHART_DATA = UtilCore.extends({
        scaleX: 0,
        scaleY: 0,
        svgWidth:0,
        svgHeight:0,
        svgCenter: 0,
        pieCenter: 0,
        uniqueDataSet: [],
        totalValue: 0,
        pieRadius: 0,
        offsetWidth: 20, // distance of text label from left and right side 
        offsetHeight: 70, // distance of text label from top and bottom side 
        pieSet: [],
        dragStartAngle: 0,
        dragEndPoint: null,
        mouseDown: 0,
        mouseDrag: 0,
        pieWithTextSpan: 0,
        maxTextLen: 0
      }, this.props.chartData);

      this.CHART_OPTIONS = UtilCore.extends({
        minRadius: 30, 
        maxRadius: 200
      }, this.props.chartOptions);

      this.CHART_CONST = UtilCore.extends({} , this.props.chartConst);
      
      this.padding = 5; 
      this.firstRender = true; 
      this.childObj={}; 
      this.legendBoxType = this.props.chartOptions.legends ? this.props.chartOptions.legends.alignment : 'horizontal';
      this.legendBoxFloat = this.props.chartOptions.legends ? this.props.chartOptions.legends.float : 'bottom';
      
      let legend = this.props.chartOptions.legends;
      this.minWidth = (!legend || legend.enable !== false) && (legend.type === 'left' || legend.type === 'right') ? 500 : 400;
      this.minHeight = (!legend || legend.enable !== false) && (legend.type === 'top' || legend.type === 'bottom') ? 500 : 400;
      
      this.init();
      // if (this.CHART_OPTIONS.animated !== false) {
      //   this.showAnimatedView();
      // }
    } catch (ex) {
      ex.errorIn = `Error in PieChart with runId:${this.props.runId}`;
      //this.showErrorScreen(opts, ex, ex.errorIn);
      throw ex;
    }
  }

  init() {
    this.initDataSet();
    this.prepareDataSet(); 
  } 

  initDataSet() {
    this.CHART_DATA.pieSet = [];
    this.CHART_DATA.uniqueDataSet = [];
    this.CHART_DATA.totalValue = 0;
  } 

  // componentWillMount() {
  //   this.props.setMinCanvasSize(this.minWidth, this.minHeight); 
  // }

  componentDidMount() {
    if(this.firstRender){
      this.firstRender = false; 
      //this.props.setMinCanvasSize(this.minWidth, this.minHeight); 
      this.calcPieDimensions(); 
      this.update(); 
    }
  }

  render() {
    return (
      <g>
        <style>
          {this.getStyle()}
        </style> 
        <g>
          <Draggable>
            <text class='txt-title-grp' text-rendering='geometricPrecision'>
              <tspan text-anchor='middle' class='txt-title' x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight - 30)}>{this.CHART_OPTIONS.title}</tspan>
              <tspan text-anchor='middle' class='txt-subtitle'x={(this.CHART_DATA.svgWidth/2)} y={(this.CHART_DATA.offsetHeight)}>{this.CHART_OPTIONS.subtitle}</tspan>
            </text>
          </Draggable>
        </g>
        <g class='legend-container'>
          {
            (this.CHART_OPTIONS.legends && this.CHART_OPTIONS.legends.enable === false) ? null :
            <Draggable>
              <LegendBox legendSet={this.getLegendData()} float={this.legendBoxFloat} left={10} top={10} opts={this.CHART_OPTIONS.legends || {}} 
                canvasWidth={this.CHART_OPTIONS.width} canvasHeight={this.CHART_OPTIONS.height} type={this.legendBoxType} background='#eee'
                onLegendClick={this.onLegendClick.bind(this)} onLegendHover={this.onLegendHover.bind(this)} onLegendLeave={this.onLegendLeave.bind(this)}
                onRef={ref => this.childObj.legendBox = ref}
              /> 
            </Draggable>
          }
        </g>
        {!this.firstRender && 
        <PieSet dataSet={this.CHART_DATA.uniqueDataSet} rootNodeId={this.CHART_OPTIONS.targetElem}
          cx ={this.CHART_DATA.pieCenter.x} cy={this.CHART_DATA.pieCenter.y} 
          width={this.CHART_DATA.pieRadius} height={this.CHART_DATA.pieRadius} 
          offsetWidth={this.CHART_DATA.offsetWidth} offsetHeight={this.CHART_DATA.offsetHeight}
          pieAreaWidth={this.pieAreaWidth} pieAreaHeight={this.pieAreaHeight}
          strokeColor={this.CHART_DATA.uniqueDataSet.length > 1 ? '#eee' : "none"} strokeWidth={this.CHART_OPTIONS.outline || 1} 
          updateTip={this.updateTooltip.bind(this)} hideTip={this.hideTip.bind(this)}
        /> 
        }
        {!this.firstRender && 
          (this.CHART_OPTIONS.tooltip && this.CHART_OPTIONS.tooltip.enable === false) ? null :
          <Tooltip onRef={ref => this.childObj.tooltip = ref} opts={this.CHART_OPTIONS.tooltip || {}} 
            rootNodeId={this.CHART_OPTIONS.targetElem} svgWidth={this.CHART_OPTIONS.width} svgHeight={this.CHART_OPTIONS.height} 
          />
        }
      </g> 
    );
  }

  calcPieDimensions() {
    let extraMargin = 100;
    let legendBBox = this.childObj.legendBox ? this.childObj.legendBox.getBBox() : {width: 0, height: 0, x: 0, y: 0};
    let headerBBox = this.ref.node.querySelector('.txt-title-grp').getBoundingClientRect();
    switch(this.legendBoxFloat) {
      case 'top': 
        this.pieAreaWidth = this.CHART_DATA.svgWidth - this.padding;
        this.pieAreaHeight = this.CHART_DATA.svgHeight - headerBBox.bottom - extraMargin;
        this.CHART_DATA.pieCenter = new Point(this.pieAreaWidth / 2, headerBBox.bottom + ((this.pieAreaHeight + extraMargin) / 2));
        this.CHART_DATA.pieRadius = Math.min(this.pieAreaWidth - this.CHART_DATA.offsetWidth, this.pieAreaHeight - this.CHART_DATA.offsetHeight) / 2;
        break; 
      case 'bottom': 
        this.pieAreaWidth = this.CHART_DATA.svgWidth - this.padding;
        this.pieAreaHeight = (legendBBox.y || this.CHART_DATA.svgHeight) - headerBBox.bottom - extraMargin;
        this.CHART_DATA.pieCenter = new Point(this.pieAreaWidth / 2, headerBBox.bottom + ((this.pieAreaHeight + extraMargin) / 2));
        this.CHART_DATA.pieRadius = (Math.min(this.pieAreaWidth - this.CHART_DATA.offsetWidth, this.pieAreaHeight - this.CHART_DATA.offsetHeight) - extraMargin) / 2;
        break; 
      case 'left': 
        this.pieAreaWidth = this.CHART_DATA.svgWidth - legendBBox.x - legendBBox.width - extraMargin; 
        this.pieAreaHeight = this.CHART_DATA.svgHeight - headerBBox.bottom - extraMargin;
        this.CHART_DATA.pieCenter = new Point(legendBBox.x + legendBBox.width + ((this.pieAreaWidth + extraMargin) / 2), headerBBox.bottom + ((this.pieAreaHeight + extraMargin) / 2));
        this.CHART_DATA.pieRadius = Math.min(this.pieAreaWidth - this.CHART_DATA.offsetWidth - (2*extraMargin), this.pieAreaHeight - this.CHART_DATA.offsetHeight) / 2;
        break; 
      case 'right': 
        this.pieAreaWidth = legendBBox.x - extraMargin; 
        this.pieAreaHeight = this.CHART_DATA.svgHeight - headerBBox.bottom - extraMargin;
        this.CHART_DATA.pieCenter = new Point(this.pieAreaWidth / 2, headerBBox.bottom + ((this.pieAreaHeight + extraMargin) / 2));
        this.CHART_DATA.pieRadius = Math.min(this.pieAreaWidth - this.CHART_DATA.offsetWidth - (2*extraMargin), this.pieAreaHeight - this.CHART_DATA.offsetHeight) / 2;
        break; 
    }
    this.CHART_DATA.pieRadius = ((v) => v < this.CHART_OPTIONS.minRadius ? this.CHART_OPTIONS.minRadius : v)(this.CHART_DATA.pieRadius);
    
  }

  getStyle() {
    return (`
      .txt-title-grp .txt-title {
        font-family: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fontFamily) || defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 20, (this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.maxFontSize) || 25)};
        fill: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.fillColor) || defaultConfig.theme.fontColorDark};
        stroke: ${(this.CHART_OPTIONS.titleStyle && this.CHART_OPTIONS.titleStyle.borderColor) || 'none'};
      }
      .txt-title-grp .txt-subtitle {
        font-family: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fontFamily) || defaultConfig.theme.fontFamily};
        font-size: ${UiCore.getScaledFontSize(this.CHART_OPTIONS.width, 30, (this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.maxFontSize) || 18)};
        fill: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.fillColor) || defaultConfig.theme.fontColorDark};
        stroke: ${(this.CHART_OPTIONS.subtitleStyle && this.CHART_OPTIONS.subtitleStyle.borderColor) || 'none'};
      }
    `);
  }

  prepareDataSet() {
    let self = this;
    for (let i in this.CHART_OPTIONS.dataSet) {
      let found = -1;
      for (let j in this.CHART_DATA.uniqueDataSet) {
        if (this.CHART_OPTIONS.dataSet[i].label.toLowerCase() === this.CHART_DATA.uniqueDataSet[j].label.toLowerCase()) {
          found = j;
          break;
        }
      }
      if (found === -1) {
        this.CHART_DATA.uniqueDataSet.push({
          "label": self.CHART_OPTIONS.dataSet[i].label,
          "value": self.CHART_OPTIONS.dataSet[i].value,
          "color": this.CHART_OPTIONS.dataSet[i].color || UtilCore.getColor(i),
          "slicedOut": self.CHART_OPTIONS.dataSet[i].slicedOut || false
        });
      } else {
        this.CHART_DATA.uniqueDataSet[found].value = parseFloat(this.CHART_OPTIONS.dataSet[i].value) + parseFloat(this.CHART_DATA.uniqueDataSet[found].value);
      }
      this.CHART_DATA.totalValue += parseFloat(this.CHART_OPTIONS.dataSet[i].value);
    }
    for (let i in this.CHART_DATA.uniqueDataSet) {
      let percent = 100 * parseFloat(this.CHART_DATA.uniqueDataSet[i].value) / this.CHART_DATA.totalValue;
      this.CHART_DATA.uniqueDataSet[i]["percent"] = percent;
    }

    // //fire Event afterParseData
    // let afterParseDataEvent = new this.event.Event("afterParseData", {
    //   srcElement: self
    // });
    // this.event.dispatchEvent(afterParseDataEvent);
  } 

  updateTooltip(originPoint, index, pointData) {
    if(!this.childObj.tooltip) {
      return; 
    }
    if (this.CHART_OPTIONS.tooltip && this.CHART_OPTIONS.tooltip.content)
    {
      this.childObj.tooltip.updateTip(originPoint, index, pointData);
    } else {
      let row1 = pointData.label + ", " + pointData.value;
      let row2 = pointData.percent.toFixed(2) + "%";
      this.childObj.tooltip.updateTip(originPoint, index, pointData, row1, row2);
    }
  }

  hideTip() {
    this.childObj.tooltip && this.childObj.tooltip.hide(); 
  }

  getLegendData() {
    return this.CHART_DATA.uniqueDataSet.map((data, index) => {
      let lSet = {}; 
      ({label:lSet.label, value:lSet.value, color:lSet.color} = data);
      return lSet; 
    });
  }

  onLegendHover(index) {
    let e = new CustomEvent('sliceHover'); 
    this.ref.node.querySelector(`.pie-grp-${index}`).dispatchEvent(e); 
  }

  onLegendLeave(index) {
    let e = new CustomEvent('sliceLeave'); 
    this.ref.node.querySelector(`.pie-grp-${index}`).dispatchEvent(e); 
  }

  onLegendClick(index) {
    let e = new CustomEvent('toggleSlide'); 
    this.ref.node.querySelector(`.pie-grp-${index}`).dispatchEvent(e); 
  }
  
  // showAnimatedView() {
  //   let sAngle = 0;
  //   let eAngle = 1;
  //   let angleCalc = {};
  //   let self = this;
  //   for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
  //     angleCalc["pie" + pieIndex] = {
  //       "startAngle": sAngle++,
  //       "endAngle": eAngle++
  //     };
  //   }
  //   let intervalId = setInterval(() => {
  //     this.CHART_DATA.pieSet = [];
  //     this.CHART_DATA.totalValue = 0;
  //     for (let pieIndex in this.CHART_DATA.uniqueDataSet) {
  //       let startAngle = angleCalc["pie" + pieIndex].startAngle;
  //       let endAngle = angleCalc["pie" + pieIndex].endAngle;
  //       let angleDiff = endAngle - startAngle;
  //       if (pieIndex > 0) {
  //         startAngle = angleCalc["pie" + (pieIndex - 1)].endAngle;
  //         endAngle = startAngle + angleDiff;
  //       }
  //       let actualEndAngle = (this.CHART_DATA.uniqueDataSet[pieIndex].percent * 36 / 10);
  //       endAngle = (endAngle + 15) > (startAngle + actualEndAngle) ? (startAngle + actualEndAngle) : (endAngle + 15);
  //       let pieSet = this.CHART_DATA.chartSVG.querySelectorAll(".pie" + pieIndex);
  //       for (let i = 0; i < pieSet.length; i++) {
  //         pieSet[i].parentNode.removeChild(pieSet[i]);
  //       }

  //       let color = this.CHART_DATA.uniqueDataSet[pieIndex].color;
  //       let strokeColor = this.CHART_DATA.uniqueDataSet.length > 1 ? "#eee" : "none";
  //       self.createPie(startAngle, endAngle, color, strokeColor, pieIndex);
  //       angleCalc["pie" + pieIndex] = {
  //         "startAngle": startAngle,
  //         "endAngle": endAngle
  //       };
  //       this.CHART_DATA.chartSVG.querySelector("#colorLegend" + pieIndex).style.display = "none";
  //       this.CHART_DATA.chartSVG.querySelector("#txtPieGrpPie" + pieIndex).style.display = "none";
  //       if (endAngle >= 358) {
  //         clearInterval(intervalId);
  //         this.init();
  //       }
  //     }
  //   }, 50);
  // } 

} 

export default PieChart;