"use strict";

import Point from "./../core/point";
import UtilCore from "./../core/util.core";
import eventEmitter from "./../core/eventEmitter";
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import CommonStyles from "./../styles/commonStyles";
import Watermark from "./../components/watermark"; 
import Menu from "./../components/menu"; 
import utilCore from "./../core/util.core";

/**
 * baseChart.js
 * @createdOn: 10-May-2017
 * @author: SmartChartsNXT
 * @description:This is base chart with defaulf config and this will initiate loading of a specific chart type. 
 */

/** ------- Requireing all chart types ------- */
const CHART_MODULES = {
    AreaChart: {
      config: require("./../charts/areaChart/config").default,
      chart: require("./../charts/areaChart/areaChart").default
    },
    // LineChart: require("./../charts/lineChart/lineChart"),
    // StepChart: require("./../charts/stepChart/stepChart"),
    PieChart: {
      config: require("./../charts/pieChart/config").default,
      chart: require("./../charts/pieChart/pieChart").default
    },
    DonutChart: {
      config: require("./../charts/donutChart/config").default,
      chart: require("./../charts/donutChart/donutChart").default
    }
    // ColumnChart: require("./../charts/columnChart/columnChart")
};

class BaseChart extends Component {
  constructor(props) {
    try {
      super(props); 
      this.chartType = this.props.opts.type;
      this.CHART_OPTIONS = UtilCore.extends(this.props.opts, { width: 1, height: 1});
      this.CHART_DATA = {scaleX: 0, scaleY: 0};
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600
      };
      this.emitter = eventEmitter.getInstance(this.props.runId);
      this.state = {
        width: this.props.width || this.CHART_CONST.FIX_WIDTH, 
        height: this.props.height || this.CHART_CONST.FIX_HEIGHT,
        menuIconPadding: -35,
        menuIconWidth: 10,
        menuExpanded: false,
        menuIconFocused: false
      };
      this.titleId = utilCore.getRandomID();
      this.descId = utilCore.getRandomID();
      this.blurFilterId = utilCore.getRandomID();
      this.loadConfig(CHART_MODULES[this.chartType].config.call(this)); 
      this.initCanvasSize(this.state.width, this.state.height); 
    } catch (ex) {
      ex.errorIn = `Error in ${props.opts.type} base constructor : ${ex.message}`;
      throw ex;
    }

    this.onMenuIconFocusIn = this.onMenuIconFocusIn.bind(this); 
    this.onMenuIconFocusOut = this.onMenuIconFocusOut.bind(this);
    this.onMenuIconMouseIn = this.onMenuIconMouseIn.bind(this);
    this.onMenuIconMouseOut = this.onMenuIconMouseOut.bind(this);
    this.showMenuPopup = this.showMenuPopup.bind(this);
    this.hideMenuPopup = this.hideMenuPopup.bind(this);
  }

  passContext() {
    return {
      runId: this.props.runId,
      chartName: this.CHART_DATA.chartName,
      chartType: this.chartType, 
      rootSvgId: this.getChartId(),
      rootContainerId: this.CHART_OPTIONS.targetElem, 
      svgWidth: this.CHART_DATA.svgWidth,
      svgHeight: this.CHART_DATA.svgHeight,
      svgCenter: this.CHART_DATA.svgCenter
    };
  }

  loadConfig(config) {
    for (let key in config) {
      try {
        this.CHART_DATA[key] = config[key];
      } catch (ex) { throw ex; }
    }
  }

  componentDidMount() {
    this.emitter.on("menuClosed", this.hideMenuPopup);
  }

  componentWillUnmount() {
    this.emitter.removeListener("menuClosed", this.hideMenuPopup);
  }
  
  render() {
    this.initCanvasSize(this.state.width, this.state.height); 
    let Chart = CHART_MODULES[this.chartType].chart;
    return (
      <svg xmlns='http://www.w3.org/2000/svg'
        role="application"
        version={1.1}
        width={this.CHART_OPTIONS.width}
        height={this.CHART_OPTIONS.height}
        viewbox={`0, 0, ${this.CHART_OPTIONS.width}, ${this.CHART_OPTIONS.height}`}
        id={this.getChartId()}
        class="smartcharts-nxt"
        aria-labelledby={this.titleId}
        aria-describedby={this.descId}
        style={{
          background: this.CHART_OPTIONS.bgColor || '#fff',
          MozTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitUserSelect: 'none',
          HtmlUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          OUserSelect: 'none',
          UserSelect: 'none'
        }} >

        <title id={this.titleId}>{(this.CHART_OPTIONS.title||"")+" "+(this.CHART_OPTIONS.subtitle||"")} </title>
        <desc id={this.descId}>{(this.CHART_OPTIONS.description||this.CHART_DATA.chartName)+" -created using SmartChartsNXT chart library."}</desc>

        <CommonStyles></CommonStyles>
        
        <g class="sc-canvas-border-container">
          <rect x='1' y='1' class="sc-canvas-border" vector-effect='non-scaling-stroke'
            width={this.CHART_OPTIONS.width - 2}
            height={this.CHART_OPTIONS.height - 2}
            shape-rendering='optimizeSpeed'
            fill-opacity={1}
            fill={'transparent'}
            strokeWidth={1}
            stroke={this.CHART_OPTIONS.canvasBorder ? defaultConfig.theme.fontColorDark : 'none'}
            style={{pointerEvents: 'none'}}
          />
        </g>

        {this.CHART_OPTIONS.watermark !== false && 
          <Watermark svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} posX={10} posY={12} link="http://www.smartcharts.cf">Powered by SmartChartsNXT</Watermark>
        }

        {this.CHART_OPTIONS.showMenu !== false &&
          this.getMenuIcon(this.CHART_DATA.svgWidth, 0)
        }
        
        <g id={`${this.getChartId()}_cont`}>
          <Chart chartOptions={UtilCore.extends({}, this.CHART_OPTIONS)} chartData={UtilCore.extends({}, this.CHART_DATA)} chartConst={UtilCore.extends({}, this.CHART_CONST)} ></Chart>
        </g>

        {this.CHART_OPTIONS.showMenu !== false && this.state.menuExpanded &&
          <Menu x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} targetNode={`#${this.getChartId()}_cont`}></Menu>
        }
      </svg>
     );
  }

  getRunId() {
    return this.props.runId;
  }

  initCanvasSize(width, height, minWidth = this.CHART_DATA.minWidth, minHeight = this.CHART_DATA.minHeight) {
    this.CHART_DATA.svgWidth = this.CHART_OPTIONS.width = UtilCore.clamp(minWidth, Math.max(minWidth, width), width);
    this.CHART_DATA.svgHeight = this.CHART_OPTIONS.height = UtilCore.clamp(minHeight, Math.max(minHeight, height), height);
    this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));
  }

  getChartId() {
    return `${this.chartType}_${this.getRunId()}`; 
  }

  getMenuIcon(posX, posY) {
    return (
      <g class="sc-menu-icon" transform={`translate(${posX},${posY})`} role="menu">
        <style>
          {`
            .sc-menu-icon-bg {
              fill-opacity: 0.1;
              stroke-opacity: 1;
              transform: scale(1);
              transition-duration: .15s;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-property: transform, opacity;
              cursor:pointer;
            }
            .sc-menu-icon-bg:hover, .sc-menu-icon-bg:focus {
              fill-opacity: 0.7;
              transform: scale(1.5);
            }
            .sc-menu-icon-bg:hover .inner-dot {
              fill: #fff;
              stroke: #fff;
            }
            .sc-menu-icon .dot-group.active {
              stroke: #fff;
              fill: #fff;
            }
          `}
        </style>
        <circle  class="sc-menu-icon-bg do-focus-highlight" cx="0" cy ="0" r="34" fill="#000" stroke-width='1' pointer-events='all' tabindex="0"
          role="button" aria-label="chart options" aria-haspopup="true" aria-expanded={this.state.menuExpanded} aria-controls="#id of menu list items"
          events={{
            click: this.showMenuPopup,
            keypress: this.showMenuPopup,
            mouseenter: this.onMenuIconMouseIn,
            mouseleave: this.onMenuIconMouseOut,
            focusin: this.onMenuIconFocusIn,
            focusout: this.onMenuIconFocusOut
          }}
        />
        <g class={"dot-group" + (this.state.menuExpanded ? " active":"")} fill="#000" stroke="#000" stroke-width='2' transform="rotate(-45, -15, 15)"
          vector-effect="non-scaling-stroke" pointer-events='none' style={{"cursor":'pointer'}} >
          <circle class="inner-dot" cx="-15" cy ="5" r="1" />
          <circle class="inner-dot" cx="-15" cy ="15" r="1" />
          <circle class="inner-dot" cx="-15" cy ="25" r="1" />
        </g>
      </g>
    );
  }

  showMenuPopup(e) {
    if(e.type =='click' || (e.type == 'keypress' && (e.which === 13 || e.which === 32))) {
      this.setState({menuExpanded: true});
    }
  }

  hideMenuPopup(e) {
    this.setState({menuExpanded: false});
    setTimeout(() =>{
      this.ref.node.querySelector('.sc-menu-icon-bg').focus(); 
    }, 0);
  }

  onMenuIconFocusIn(e) {
    this.state.menuIconFocused = true;
    this.ref.node.querySelector('.dot-group').classList.add('active'); 
  }

  onMenuIconFocusOut(e) {
    this.state.menuIconFocused = false; 
    this.ref.node.querySelector('.dot-group').classList.remove('active'); 
  }

  onMenuIconMouseIn(e) {
    this.ref.node.querySelector('.dot-group').classList.add('active'); 
  }

  onMenuIconMouseOut(e) {
    if(!this.state.menuIconFocused) {
      this.ref.node.querySelector('.dot-group').classList.remove('active'); 
    }
  }

  getMenuIconWidth() {
    return this.CHART_DATA.svgWidth < 500 ? 3 : this.state.menuIconWidth - (2 * this.state.menuIconPadding); 
  }
}

export default BaseChart;