/** 
 * pieChart.js
 * SVG Pie Chart 2D
 * @createdOn:07-Jul-2016
 * @version:2.0.0
 * @author:SmartChartsNXT
 * @description:This will generate a 2d Pie chart. Using SVG 1.1 elements and HTML 5 standard. 
 * @JSFiddle:
 * 
 * @Sample caller code:
  SmartChartsNXT.ready(function () {
    let PieChart2D = new SmartChartsNXT.Chart({
      "type": "PieChart",
      "title": "Browser Market Share Worldwide ",
      "subtitle": "As of Q3, 2017",
      "minRadius": 30,
      "maxRadius": 100,
      "titleStyle": {
        "fillColor":"#717171",
        "borderColor":"none",
        "fontFamily": "Lato",
        "maxFontSize": "25"
      },
      "subtitleStyle": {
        "fillColor":"#717171",
        "borderColor":"none",
        "fontFamily": "Lato",
        "maxFontSize": "18"
      },
      "outline": 2,
      "canvasBorder": true,
      "targetElem": "chartContainer",
      "bgColor": "white",
      "legends":{
        "enable" : true,
        "top": 200,
        "left": 10, 
        "alignment": "horizontal",
        "float": "bottom",
        "color": "#000",
        "bgColor": "#eee",
        "hoverColor":"#999",
        "fontSize": 14, 
        "fontFamily": "Lato", 
        "borderColor": "none",
        "borderWidth": 3,
        "borderOpacity": 1,
        "opacity": 0.9,
        "toggleType": false,
      },
      "animated": false,
      "tooltip": {
        "content": function() {
          return '<table>' +
          '<tr><td><b>'+this.label+'</b> has global usage </td></tr>' +
          '<tr><td> of <b>'+this.value+'% </b>Worldwide.</td></tr>' +
          '</table>';
        }
      },
      "dataSet": [
        {
          "label": "Chrome",
          "value": "54.53",
          "color": "#F44336"
        },
        {
          "label": "IE",
          "value": "3.7",
          "color": "#4682b4"
        },
        {
          "label": "Safari",
          "value": "14.61"
        },
        {
          "label": "Firefox",
          "value": "6.07",
          "color": "#FFC107",
          "slicedOut": false
        }] 
    });
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
import PieSet from './sliceSet';

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
        innerRadius: 0,
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
      this.minWidth = this.CHART_DATA.minWidth; 
      this.minHeight = this.CHART_DATA.minHeight; 
      
      this.init();
    } catch (ex) {
      ex.errorIn = `Error in PieChart with runId:${this.props.runId}`;
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

  componentDidMount() {
    if(this.firstRender){
      this.firstRender = false; 
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
          {(!this.CHART_OPTIONS.legends || (this.CHART_OPTIONS.legends && this.CHART_OPTIONS.legends.enable !== false)) &&
            <Draggable>
              <LegendBox legendSet={this.getLegendData()} float={this.legendBoxFloat} left={10} top={10} opts={this.CHART_OPTIONS.legends || {}} 
                display="block" canvasWidth={this.CHART_OPTIONS.width} canvasHeight={this.CHART_OPTIONS.height} type={this.legendBoxType} background='#eee'
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
          innerWidth={this.CHART_DATA.innerRadius} innerHeight={this.CHART_DATA.innerRadius} 
          offsetWidth={this.CHART_DATA.offsetWidth} offsetHeight={this.CHART_DATA.offsetHeight}
          areaWidth={this.pieAreaWidth} areaHeight={this.pieAreaHeight}
          strokeColor={this.CHART_DATA.uniqueDataSet.length > 1 ? '#eee' : "none"} strokeWidth={this.CHART_OPTIONS.outline || 1} 
          gradient={this.CHART_OPTIONS.radialGradient || [{offset:0, opacity:0.06},{offset:83, opacity:0.2},{offset:95, opacity:0}]}
          updateTip={this.updateTooltip.bind(this)} hideTip={this.hideTip.bind(this)} 
          animated={this.CHART_OPTIONS.animated === 'undefined' ? true : this.CHART_OPTIONS.animated}
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
  
  getStyle() {
    return (`
      *{
        outline:none;
      }
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

  updateTooltip(originPoint, pointData) {
    if(!this.childObj.tooltip) {
      return; 
    }
    if (this.CHART_OPTIONS.tooltip && this.CHART_OPTIONS.tooltip.content)
    {
      this.childObj.tooltip.updateTip(originPoint, pointData);
    } else {
      let row1 = pointData.label + ", " + pointData.value;
      let row2 = pointData.percent.toFixed(2) + "%";
      this.childObj.tooltip.updateTip(originPoint, pointData, row1, row2);
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
    this.ref.node.querySelector(`.slice-grp-${index}`).dispatchEvent(e); 
  }

  onLegendLeave(index) {
    let e = new CustomEvent('sliceLeave'); 
    this.ref.node.querySelector(`.slice-grp-${index}`).dispatchEvent(e); 
  }

  onLegendClick(index) {
    let e = new CustomEvent('toggleSlide'); 
    this.ref.node.querySelector(`.slice-grp-${index}`).dispatchEvent(e); 
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