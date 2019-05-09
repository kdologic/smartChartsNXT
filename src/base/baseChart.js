"use strict";

import Point from "./../core/point";
import UtilCore from "./../core/util.core";
import eventEmitter from "./../core/eventEmitter";
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import CommonStyles from "./../styles/commonStyles";
import Watermark from "./../components/watermark"; 
import Menu from "./../components/menu"; 

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
    }
    //,
    // LineChart: require("./../charts/lineChart/lineChart"),
    // StepChart: require("./../charts/stepChart/stepChart"),
    // PieChart: {
    //   config: require("./../charts/pieChart/config").default,
    //   chart: require("./../charts/pieChart/pieChart").default
    // },
    // DonutChart: {
    //   config: require("./../charts/donutChart/config").default,
    //   chart: require("./../charts/donutChart/donutChart").default
    // }
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
        showLoader: false,
        menuIconPadding: -35,
        menuIconWidth: 10,
        menuExpanded: false,
        menuIconFocused: false
      };
      this.titleId = UtilCore.getRandomID();
      this.descId = UtilCore.getRandomID();
      this.blurFilterId = UtilCore.getRandomID();
      this.menuIconGradId = UtilCore.getRandomID();

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
    this.showAfterSave = this.showAfterSave.bind(this);
    this.hideBeforeSave = this.hideBeforeSave.bind(this);
    this.onShowLoader = this.onShowLoader.bind(this);
    this.onHideLoader = this.onHideLoader.bind(this); 
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
    this.emitter.on('beforePrint', this.hideBeforeSave);
    this.emitter.on('afterPrint', this.showAfterSave);
    this.emitter.on('beforeSave', this.hideBeforeSave);
    this.emitter.on('afterSave', this.showAfterSave);
    this.emitter.on('showLoader', this.onShowLoader);
    this.emitter.on('hideLoader', this.onHideLoader);
  }

  componentWillUnmount() {
    this.emitter.removeListener("menuClosed", this.hideMenuPopup);
    this.emitter.removeListener('beforePrint', this.hideBeforeSave);
    this.emitter.removeListener('afterPrint', this.showAfterSave);
    this.emitter.removeListener('beforeSave', this.hideBeforeSave);
    this.emitter.removeListener('afterSave', this.showAfterSave);
    this.emitter.removeListener('showLoader', this.onShowLoader);
    this.emitter.removeListener('hideLoader', this.onHideLoader);
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
          fontFamily: defaultConfig.theme.fontFamily,
          background: 'transparent',
          MozTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
          WebkitUserSelect: 'none',
          HtmlUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          OUserSelect: 'none',
          UserSelect: 'none'
        }} >

        <text class='sc-title' id={this.titleId} style="display:none;">{(this.CHART_OPTIONS.title||"")+" "+(this.CHART_OPTIONS.subtitle||"")}</text>
        <desc id={this.descId}>{(this.CHART_OPTIONS.description||this.CHART_DATA.chartName)+" -created using SmartChartsNXT chart library."}</desc>
        
        <CommonStyles></CommonStyles>

        <g class="sc-canvas-border-container">
          <rect x='1' y='1' class="sc-canvas-border" vector-effect='non-scaling-stroke'
            width={this.CHART_OPTIONS.width - 2}
            height={this.CHART_OPTIONS.height - 2}
            shape-rendering='optimizeSpeed'
            fill-opacity={1}
            fill={this.CHART_OPTIONS.bgColor || "#fff"}
            strokeWidth={1}
            stroke={this.CHART_OPTIONS.canvasBorder ? defaultConfig.theme.fontColorDark : 'none'}
            style={{pointerEvents: 'none'}}
          />
        </g>

        {this.CHART_OPTIONS.watermark !== false && 
          <Watermark svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} posX={10} posY={12} link="http://www.smartcharts.cf" title="Javascript chart created using SmartChartsNXT Library">SmartChartsNXT</Watermark>
        }

        {this.CHART_OPTIONS.showMenu !== false &&
          this.getMenuIcon(this.CHART_DATA.svgWidth, 0, )
        }
        
        <g id={`${this.getChartId()}_cont`}>
          <Chart chartOptions={UtilCore.extends({}, this.CHART_OPTIONS)} chartData={UtilCore.extends({}, this.CHART_DATA)} chartConst={UtilCore.extends({}, this.CHART_CONST)} ></Chart>
        </g>

        {this.CHART_OPTIONS.showMenu !== false && this.state.menuExpanded &&
          <Menu x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} targetNode={`#${this.getChartId()}_cont`}></Menu>
        }

        { this.loader() }
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
      <g class="sc-menu-icon" transform={`translate(${posX},${posY})`}>
        <style>
          {`
            .sc-menu-icon-bg {
              fill-opacity: 1;
              stroke-opacity: 1;
              transform: scale(1);
              transition-duration: .15s;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-property: transform, opacity;
              cursor:pointer;
            }
            .sc-menu-icon-bg:hover, .sc-menu-icon-bg:focus {
              fill-opacity: 1;
              fill: #000;
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
        <defs>
          <filter xmlns="http://www.w3.org/2000/svg" id={this.menuIconGradId} height="130%" width="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="1"></feGaussianBlur>
              <feOffset dx="-1" dy="1" result="offsetblur"></feOffset>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7"></feFuncA>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode></feMergeNode>
                <feMergeNode in="SourceGraphic"></feMergeNode>
              </feMerge>
          </filter>
        </defs>
        <circle role="menu" class="sc-menu-icon-bg do-focus-highlight" cx="0" cy ="0" r="34" fill="#fff" stroke-width='1' pointer-events='all' tabindex="0"
          aria-label="chart options" aria-haspopup="true" aria-expanded={this.state.menuExpanded}
          filter={`url(#${this.menuIconGradId})`}
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

  hideBeforeSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for(let elem of elemList) {
      if(this.ref.node.querySelector(elem)) {
        this.ref.node.querySelector(elem).classList.add('sc-hide');
      } 
    }
  }

  showAfterSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for(let elem of elemList) {
      if(this.ref.node.querySelector(elem)) {
        this.ref.node.querySelector(elem).classList.remove('sc-hide');
      } 
    }
  }

  onShowLoader(e) {
    this.setState({'showLoader': true});
  }

  onHideLoader(e) {
    this.setState({'showLoader': false});
  }

  loader() {
    if(!this.state.showLoader) {
      return false;
    }
    return (
      <g id='smartsChartsNXT-loader-container' >
        <rect class='sc-overlay' x={0} y={0} width={this.state.width} height={this.state.height} opacity='0.2' fill='#000' ></rect>
        <g id='loader-icon'  transform={`translate(${this.state.width/2},${(this.state.height/2) - 40}) scale(0.6,0.6)`}>
          <rect x="-30" y="-30" width="160" height="160" stroke='#000' fill="#f1f1f1" class="bk" rx="10" opacity="0.8"></rect>
          <g transform='translate(-20,-20)'>
            <path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#000'>
              <animateTransform attributeName='transform' type='rotate' from='90 50 50' to='0 50 50' dur='1s' repeatCount='indefinite'></animateTransform></path>
          </g>
          <g transform='translate(20,20) rotate(15 50 50)'>
            <path d='M79.9,52.6C80,51.8,80,50.9,80,50s0-1.8-0.1-2.6l-5.1-0.4c-0.3-2.4-0.9-4.6-1.8-6.7l4.2-2.9c-0.7-1.6-1.6-3.1-2.6-4.5 L70,35c-1.4-1.9-3.1-3.5-4.9-4.9l2.2-4.6c-1.4-1-2.9-1.9-4.5-2.6L59.8,27c-2.1-0.9-4.4-1.5-6.7-1.8l-0.4-5.1C51.8,20,50.9,20,50,20 s-1.8,0-2.6,0.1l-0.4,5.1c-2.4,0.3-4.6,0.9-6.7,1.8l-2.9-4.1c-1.6,0.7-3.1,1.6-4.5,2.6l2.1,4.6c-1.9,1.4-3.5,3.1-5,4.9l-4.5-2.1 c-1,1.4-1.9,2.9-2.6,4.5l4.1,2.9c-0.9,2.1-1.5,4.4-1.8,6.8l-5,0.4C20,48.2,20,49.1,20,50s0,1.8,0.1,2.6l5,0.4 c0.3,2.4,0.9,4.7,1.8,6.8l-4.1,2.9c0.7,1.6,1.6,3.1,2.6,4.5l4.5-2.1c1.4,1.9,3.1,3.5,5,4.9l-2.1,4.6c1.4,1,2.9,1.9,4.5,2.6l2.9-4.1 c2.1,0.9,4.4,1.5,6.7,1.8l0.4,5.1C48.2,80,49.1,80,50,80s1.8,0,2.6-0.1l0.4-5.1c2.3-0.3,4.6-0.9,6.7-1.8l2.9,4.2 c1.6-0.7,3.1-1.6,4.5-2.6L65,69.9c1.9-1.4,3.5-3,4.9-4.9l4.6,2.2c1-1.4,1.9-2.9,2.6-4.5L73,59.8c0.9-2.1,1.5-4.4,1.8-6.7L79.9,52.6 z M50,65c-8.3,0-15-6.7-15-15c0-8.3,6.7-15,15-15s15,6.7,15,15C65,58.3,58.3,65,50,65z' fill='#000'>
              <animateTransform attributeName='transform' type='rotate' from='0 50 50' to='90 50 50' dur='1s' repeatCount='indefinite'></animateTransform>
            </path>
          </g>
        </g>
      </g>
    );
  }
}

export default BaseChart;