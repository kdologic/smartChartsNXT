'use strict';

import Point from './../core/point';
import utilCore from './../core/util.core';
import eventEmitter from './../core/eventEmitter';
import { Component } from './../viewEngin/pview';
import defaultConfig from './../settings/config';
import { CHART_MODULES } from './../settings/componentMapper';
import Validator from './../validators/validator';
import CommonStyles from './../styles/commonStyles';
import Watermark from './../components/watermark';
import Menu from './../components/menu';
import LoaderView from './../components/loaderView';

/**
 * baseChart.js
 * @createdOn: 10-May-2017
 * @author: SmartChartsNXT
 * @description:This is base chart with default config and this will initiate loading of a specific chart type.
 */

class BaseChart extends Component {
  constructor(props) {
    try {
      super(props);
      this.chartType = this.props.opts.type;
      this.CHART_OPTIONS = utilCore.extends({}, this.props.opts, { width: 1, height: 1 });
      this.CHART_DATA = { scaleX: 0, scaleY: 0 };
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600
      };
      this.loadConfig(CHART_MODULES[this.chartType].config);
      this.chartValidationRules = CHART_MODULES[this.chartType].validationRules;
      this.validator = new Validator();
      this.validationErrors = this.validator.validate(this.chartValidationRules, this.CHART_OPTIONS);
      if(this.validationErrors.length) {
        throw this.validationErrors;
      }

      this.emitter = eventEmitter.getInstance(this.props.runId);
      this.state = {
        width: this.props.width || this.CHART_CONST.FIX_WIDTH,
        height: this.props.height || this.CHART_CONST.FIX_HEIGHT,
        menuIconPadding: -35,
        menuIconWidth: 10,
        menuExpanded: false,
        menuIconFocused: false,
        resizeComponent: false
      };
      this.titleId = utilCore.getRandomID();
      this.descId = utilCore.getRandomID();
      this.blurFilterId = utilCore.getRandomID();
      this.menuIconGradId = utilCore.getRandomID();
      this.initCanvasSize(this.state.width, this.state.height);
    } catch (ex) {
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
    this.onResizeComponent = this.onResizeComponent.bind(this);
    this.onRenderComponent = this.onRenderComponent.bind(this);
  }

  passContext() {
    return {
      runId: this.props.runId,
      chartType: this.chartType,
      rootSvgId: this.getChartId(),
      rootContainerId: this.CHART_OPTIONS.targetElem,
      svgWidth: this.CHART_DATA.svgWidth,
      svgHeight: this.CHART_DATA.svgHeight,
      svgCenter: this.CHART_DATA.svgCenter
    };
  }

  loadConfig(config) {
    this.CHART_DATA = { ...this.CHART_DATA, ...config };
  }

  componentDidMount() {
    this.emitter.on('menuClosed', this.hideMenuPopup);
    this.emitter.on('beforePrint', this.hideBeforeSave);
    this.emitter.on('afterPrint', this.showAfterSave);
    this.emitter.on('beforeSave', this.hideBeforeSave);
    this.emitter.on('afterSave', this.showAfterSave);
    this.emitter.on('resize', this.onResizeComponent);
    this.emitter.on('render', this.onRenderComponent);
  }

  componentWillUnmount() {
    this.emitter.removeListener('menuClosed', this.hideMenuPopup);
    this.emitter.removeListener('beforePrint', this.hideBeforeSave);
    this.emitter.removeListener('afterPrint', this.showAfterSave);
    this.emitter.removeListener('beforeSave', this.hideBeforeSave);
    this.emitter.removeListener('afterSave', this.showAfterSave);
    this.emitter.removeListener('resize', this.onResizeComponent);
  }

  componentDidUpdate() {
    this.state.resizeComponent = false;
  }

  render() {
    this.initCanvasSize(this.state.width, this.state.height);
    const Chart = CHART_MODULES[this.chartType].chart;
    return (
      <svg
        //xmlns='http://www.w3.org/2000/svg' // XMLSerializer issue with IE 11
        role='application'
        version={1.1}
        width={this.CHART_OPTIONS.width}
        height={this.CHART_OPTIONS.height}
        viewbox={`0, 0, ${this.CHART_OPTIONS.width}, ${this.CHART_OPTIONS.height}`}
        id={this.getChartId()}
        class='smartcharts-nxt'
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
          UserSelect: 'none',
          overflow: 'hidden'
        }} >

        <text class='sc-title' id={this.titleId} style='display:none;'>{((this.CHART_OPTIONS.title || {}).text || '') + ' ' + ((this.CHART_OPTIONS.subtitle || {}).text || '')}</text>
        <desc id={this.descId}>{(this.CHART_OPTIONS.description || this.CHART_DATA.chartType) + ' -created using SmartChartsNXT chart library.'}</desc>

        <CommonStyles></CommonStyles>

        <g class='sc-canvas-border-container'>
          <rect x='1' y='1' class='sc-canvas-border' vector-effect='non-scaling-stroke'
            width={this.CHART_OPTIONS.width - 2}
            height={this.CHART_OPTIONS.height - 2}
            shape-rendering='optimizeSpeed'
            fill-opacity={1}
            fill={this.CHART_OPTIONS.bgColor || '#fff'}
            strokeWidth={1}
            stroke={this.CHART_OPTIONS.canvasBorder ? defaultConfig.theme.fontColorDark : 'none'}
            style={{ pointerEvents: 'none' }}
          />
        </g>

        {this.CHART_OPTIONS.watermark !== false &&
          <Watermark svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} posX={10} posY={12} link='http://www.smartcharts.cf' title='Javascript chart created using SmartChartsNXT Library'>SmartChartsNXT</Watermark>
        }

        {this.CHART_OPTIONS.showMenu !== false &&
          this.getMenuIcon(this.CHART_DATA.svgWidth, 0)
        }

        <g id={`${this.getChartId()}_cont`}>
          <Chart chartOptions={utilCore.extends({}, this.CHART_OPTIONS)} chartData={utilCore.extends({}, this.CHART_DATA)} chartConst={utilCore.extends({}, this.CHART_CONST)} resizeComponent={this.state.resizeComponent}></Chart>
        </g>

        {this.CHART_OPTIONS.showMenu !== false && this.state.menuExpanded &&
          <Menu x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} targetNode={`#${this.getChartId()}_cont`}></Menu>
        }
        <LoaderView></LoaderView>
      </svg>
    );
  }

  getRunId() {
    return this.props.runId;
  }

  initCanvasSize(width, height, minWidth = this.CHART_DATA.minWidth, minHeight = this.CHART_DATA.minHeight) {
    this.CHART_DATA.svgWidth = this.CHART_OPTIONS.width = utilCore.clamp(minWidth, Math.max(minWidth, width), width);
    this.CHART_DATA.svgHeight = this.CHART_OPTIONS.height = utilCore.clamp(minHeight, Math.max(minHeight, height), height);
    this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));
  }

  getChartId() {
    return `${this.chartType}_${this.getRunId()}`;
  }

  getMenuIcon(posX, posY) {
    return (
      <g class='sc-menu-icon' transform={`translate(${posX},${posY})`}>
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
          <filter xmlns='http://www.w3.org/2000/svg' id={this.menuIconGradId} height='130%' width='130%'>
            <feGaussianBlur in='SourceAlpha' stdDeviation='1'></feGaussianBlur>
            <feOffset dx='-1' dy='1' result='offsetblur'></feOffset>
            <feComponentTransfer>
              <feFuncA type='linear' slope='0.7'></feFuncA>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode></feMergeNode>
              <feMergeNode in='SourceGraphic'></feMergeNode>
            </feMerge>
          </filter>
        </defs>
        <circle role='menu' class='sc-menu-icon-bg do-focus-highlight' cx='0' cy='0' r='34' fill='#fff' stroke-width='1' pointer-events='all' tabindex='0'
          aria-label='chart options' aria-haspopup='true' aria-expanded={this.state.menuExpanded}
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
        <g class={'dot-group' + (this.state.menuExpanded ? ' active' : '')} fill='#000' stroke='#000' stroke-width='2' transform='rotate(-45, -15, 15)'
          vector-effect='non-scaling-stroke' pointer-events='none' style={{ 'cursor': 'pointer' }} >
          <circle class='inner-dot' cx='-15' cy='5' r='1' />
          <circle class='inner-dot' cx='-15' cy='15' r='1' />
          <circle class='inner-dot' cx='-15' cy='25' r='1' />
        </g>
      </g>
    );
  }

  showMenuPopup(e) {
    if (e.type == 'click' || (e.type == 'keypress' && (e.which === 13 || e.which === 32))) {
      this.setState({ menuExpanded: true });
    }
  }

  hideMenuPopup() {
    this.setState({ menuExpanded: false });
    setTimeout(() => {
      if(typeof this.ref.node.querySelector('.sc-menu-icon-bg').focus === 'function') {
        this.ref.node.querySelector('.sc-menu-icon-bg').focus();
      }
    }, 0);
  }

  onMenuIconFocusIn() {
    this.state.menuIconFocused = true;
    this.ref.node.querySelector('.dot-group').classList.add('active');
  }

  onMenuIconFocusOut() {
    this.state.menuIconFocused = false;
    this.ref.node.querySelector('.dot-group').classList.remove('active');
  }

  onMenuIconMouseIn(e) {
    this.ref.node.querySelector('.dot-group').classList.add('active');
    if(utilCore.isIE) {
      e.target.setAttribute('transform', 'scale(1.5)');
    }
  }

  onMenuIconMouseOut(e) {
    if (!this.state.menuIconFocused) {
      this.ref.node.querySelector('.dot-group').classList.remove('active');
      if(utilCore.isIE) {
        e.target.setAttribute('transform', 'scale(1)');
      }
    }
  }

  getMenuIconWidth() {
    return this.CHART_DATA.svgWidth < 500 ? 3 : this.state.menuIconWidth - (2 * this.state.menuIconPadding);
  }

  hideBeforeSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for (let elem of elemList) {
      if (this.ref.node.querySelector(elem)) {
        this.ref.node.querySelector(elem).classList.add('sc-hide');
      }
    }
  }

  showAfterSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for (let elem of elemList) {
      if (this.ref.node.querySelector(elem)) {
        this.ref.node.querySelector(elem).classList.remove('sc-hide');
      }
    }
  }

  onResizeComponent(e) {
    this.setState({ resizeComponent: true, width: e.data.targetWidth, height: e.data.targetHeight });
  }

  onRenderComponent(newOpts) {
    this.validationErrors = this.validator.validate(this.chartValidationRules, newOpts);
    if(this.validationErrors.length) {
      throw this.validationErrors;
    }
    this.CHART_OPTIONS = utilCore.extends({}, newOpts, { width: 1, height: 1 });
    this.update();
  }
}

export default BaseChart;