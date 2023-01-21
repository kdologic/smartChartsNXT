'use strict';

import { TChartType } from '../models/global.models';
import Point from '../core/point';
import UtilCore from '../core/util.core';
import eventEmitter, { CustomEvents } from '../core/eventEmitter';
import { Component } from '../viewEngin/pview';
import defaultConfig from '../settings/config';
import { CHART_MODULES } from '../settings/chartComponentMapper';
import { Validator, CError } from '../validators/validator';
import CommonStyles from '../styles/commonStyles';
import Watermark from '../components/watermark';
import Menu from '../components/menu';
import LoaderView from '../components/loaderView';
import StoreManager from '../liveStore/storeManager';
import { Store } from '../liveStore/store';
import { PUBLIC_SITE } from '../settings/globalEnums';
import GlobalDefs from '../styles/globalDefs';
import a11yFactory, { A11yWriter } from '../core/a11y';
import PopupContainer from '../popupComponents/popupContainer';

/**
 * baseChart.tsx
 * @createdOn: 10-May-2017
 * @author: SmartChartsNXT
 * @description:This is base chart with default config and this will initiate loading of a specific chart type.
 */

class BaseChart extends Component {

  private chartType: TChartType;
  private store: Store;
  private a11yWriter: A11yWriter;
  private CHART_OPTIONS: any;
  private CHART_DATA: any;
  private CHART_CONST: any;
  private chartValidationRules: any;
  private validator: Validator;
  private validationErrors: CError[];
  private titleId: string;
  private descId: string;
  private blurFilterId: string;
  private menuIconGradId: string;
  private htmlContainerIE: string;
  private globalDefs: GlobalDefs;
  private emitter: CustomEvents;

  public state: any;
  private _setState: (state: any) => void;

  constructor(props: any) {
    super(props);
    try {
      this._setState = this.setState;
      this.chartType = this.props.opts.type;
      this.store = StoreManager.getStore(this.props.runId);
      this.a11yWriter = a11yFactory.getWriter(this.props.runId);
      this.CHART_OPTIONS = UtilCore.extends({
        a11y: {},
        menu: {
          mainMenu: {
            enable: true,
            itemSaveAsJPG: true,
            itemSaveAsPNG: true,
            itemSaveAsSVG: true,
            itemSaveAsPDF: true,
            itemPrint: true
          }
        },
        creditsWatermark: {
          enable: true
        }
      }, this.props.opts, { width: 1, height: 1 });
      this.CHART_DATA = { scaleX: 0, scaleY: 0 };
      this.CHART_CONST = {
        FIX_WIDTH: 800,
        FIX_HEIGHT: 600
      };
      this.loadConfig(CHART_MODULES[this.chartType].config);
      this.chartValidationRules = CHART_MODULES[this.chartType].validationRules;
      this.validator = new Validator();
      this.validationErrors = this.validator.validate(this.chartValidationRules, this.CHART_OPTIONS);
      if (this.validationErrors.length) {
        throw this.validationErrors;
      }
      this.globalDefs = new GlobalDefs(this.CHART_OPTIONS.defs);
      this.emitter = eventEmitter.getInstance(this.props.runId);
      this.state = {
        width: this.props.width || this.CHART_CONST.FIX_WIDTH,
        height: this.props.height || this.CHART_CONST.FIX_HEIGHT,
        menuIconPadding: -35,
        menuIconWidth: 10,
        menuExpanded: false,
        menuIconFocused: false,
        globalRenderAll: false
      };
      this.titleId = UtilCore.getRandomID();
      this.descId = UtilCore.getRandomID();
      this.blurFilterId = UtilCore.getRandomID();
      this.menuIconGradId = UtilCore.getRandomID();
      this.htmlContainerIE = 'sc-html-container-ie-' + UtilCore.getRandomID();
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

    this.a11yWriter.createSpace(this.titleId);
    this.a11yWriter.write(this.titleId, '<div aria-hidden="false">' + ((this.CHART_OPTIONS.title || {}).text || '') + '</div>');
    this.a11yWriter.write(this.titleId, '<div aria-hidden="false">' + ((this.CHART_OPTIONS.subtitle || {}).text || '') + '</div>', false);
    if (this.CHART_OPTIONS.a11y.description) {
      this.a11yWriter.createSpace(this.descId);
      this.a11yWriter.write(this.descId, '<div aria-hidden="false">' + this.CHART_OPTIONS.a11y.description + '</div>');
    }
    this.setState = (opt): any => {
      this.emitter.emitSync('beforeRender');
      let updatedState = this._setState(opt);
      this.emitter.emitSync('afterRender');
      return updatedState;
    };
  }

  passContext() {
    return {
      runId: this.props.runId,
      chartType: this.chartType,
      rootSvgId: this.getChartId(),
      rootContainerId: this.CHART_OPTIONS.targetElem,
      htmlContainerIE: this.htmlContainerIE,
      svgWidth: this.CHART_DATA.svgWidth,
      svgHeight: this.CHART_DATA.svgHeight,
      svgCenter: this.CHART_DATA.svgCenter
    };
  }

  loadConfig(config: any) {
    this.CHART_DATA = { ...this.CHART_DATA, ...config };
  }

  afterMount() {
    this.emitter.on('menuClosed', this.hideMenuPopup);
    this.emitter.on('beforePrint', this.hideBeforeSave);
    this.emitter.on('afterPrint', this.showAfterSave);
    this.emitter.on('beforeSave', this.hideBeforeSave);
    this.emitter.on('afterSave', this.showAfterSave);
    this.emitter.on('resize', this.onResizeComponent);
    this.emitter.on('render', this.onRenderComponent);
  }

  beforeUnmount() {
    this.emitter.removeListener('menuClosed', this.hideMenuPopup);
    this.emitter.removeListener('beforePrint', this.hideBeforeSave);
    this.emitter.removeListener('afterPrint', this.showAfterSave);
    this.emitter.removeListener('beforeSave', this.hideBeforeSave);
    this.emitter.removeListener('afterSave', this.showAfterSave);
    this.emitter.removeListener('resize', this.onResizeComponent);
  }

  afterUpdate() {
    this.state.globalRenderAll = false;
    this.store.setValue('globalRenderAll', false);
  }

  render() {
    this.initCanvasSize(this.state.width, this.state.height);
    const Chart = CHART_MODULES[this.chartType].chart;
    return (
      <x-div id={`${this.getChartId()}_cont`} class='smartcharts-nxt' style="position: relative;">
        <svg
          xmlns='http://www.w3.org/2000/svg' // XMLSerializer issue with IE 11
          role="region"
          version={1.1}
          width={this.CHART_OPTIONS.width}
          height={this.CHART_OPTIONS.height}
          viewbox={`0, 0, ${this.CHART_OPTIONS.width}, ${this.CHART_OPTIONS.height}`}
          id={this.getChartId()}
          class="sc-prime-view"
          aria-label="Interactive chart."
          aria-describedby={this.descId} >

          <desc aria-hidden='true'>{(this.CHART_DATA.name) + ' - created using SmartChartsNXT chart library.'}</desc>

          <CommonStyles></CommonStyles>

          {this.globalDefs.mapAll()}

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

          {this.CHART_OPTIONS.creditsWatermark.enable &&
            <Watermark svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} posX={10} posY={12} link={PUBLIC_SITE} title='Javascript chart created using SmartChartsNXT Library'>SmartChartsNXT</Watermark>
          }

          {this.CHART_OPTIONS.menu.mainMenu.enable && this.CHART_OPTIONS.showMenu !== false &&
            this.getMenuIcon(this.CHART_DATA.svgWidth, 0)
          }

          <Chart chartOptions={UtilCore.extends({}, this.CHART_OPTIONS)} chartData={UtilCore.extends({}, this.CHART_DATA)} chartConst={UtilCore.extends({}, this.CHART_CONST)} globalRenderAll={this.state.globalRenderAll}></Chart>

          <PopupContainer></PopupContainer>

          <LoaderView></LoaderView>
        </svg>
        {UtilCore.isIE &&
          <x-div id={this.htmlContainerIE} style={{
            position: 'absolute',
            width: this.CHART_DATA.svgWidth + 'px',
            height: this.CHART_DATA.svgHeight + 'px',
            top: 0,
            left: 0,
            pointerEvents: 'none'
          }}></x-div>
        }
        {this.CHART_OPTIONS.menu.mainMenu.enable && this.CHART_OPTIONS.showMenu !== false && this.state.menuExpanded &&
          <svg
            role="region"
            version={1.1}
            width={this.CHART_OPTIONS.width}
            height={this.CHART_OPTIONS.height}
            viewbox={`0, 0, ${this.CHART_OPTIONS.width}, ${this.CHART_OPTIONS.height}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0
            }}>
            <Menu opts={this.CHART_OPTIONS.menu.mainMenu} x={this.CHART_DATA.svgWidth - 50} y={3} svgWidth={this.CHART_DATA.svgWidth} svgHeight={this.CHART_DATA.svgHeight} rootNode={`#${this.getChartId()}`} rootContainer={`#${this.CHART_OPTIONS.targetElem}`} ></Menu>
          </svg>
        }
      </x-div>
    );
  }

  getRunId() {
    return this.props.runId;
  }

  initCanvasSize(width: number, height: number, minWidth: number = this.CHART_DATA.minWidth, minHeight: number = this.CHART_DATA.minHeight): void {
    this.CHART_DATA.svgWidth = this.CHART_OPTIONS.width = UtilCore.clamp(minWidth, Math.max(minWidth, width), width);
    this.CHART_DATA.svgHeight = this.CHART_OPTIONS.height = UtilCore.clamp(minHeight, Math.max(minHeight, height), height);
    this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));
  }

  getChartId() {
    return `${this.chartType}_${this.getRunId()}`;
  }

  getMenuIcon(posX: number, posY: number): any {
    return (
      <g class='sc-menu-icon' transform={`translate(${posX},${posY})`}>
        <title>Chart Options</title>
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

  showMenuPopup(e: Event) {
    if (e.type == 'click' || (e.type == 'keypress' && ((e as KeyboardEvent).key === '13' || (e as KeyboardEvent).key === '32'))) {
      this.emitter.emit('menuExpanded', e);
      this._setState({ menuExpanded: true });
    }
  }

  hideMenuPopup() {
    this.setState({ menuExpanded: false });
    setTimeout(() => {
      let menuIconBG = this.ref.node as Element;
      if (typeof (menuIconBG.querySelector('.sc-menu-icon-bg') as HTMLElement).focus === 'function') {
        (menuIconBG.querySelector('.sc-menu-icon-bg') as HTMLElement).focus();
      }
    }, 0);
  }

  onMenuIconFocusIn() {
    this.state.menuIconFocused = true;
    (this.ref.node as Element).querySelector('.dot-group').classList.add('active');
  }

  onMenuIconFocusOut() {
    this.state.menuIconFocused = false;
    (this.ref.node as Element).querySelector('.dot-group').classList.remove('active');
  }

  onMenuIconMouseIn(e: Event) {
    (this.ref.node as Element).querySelector('.dot-group').classList.add('active');
    if (UtilCore.isIE) {
      (e.target as HTMLElement).setAttribute('transform', 'scale(1.5)');
    }
  }

  onMenuIconMouseOut(e: Event) {
    if (!this.state.menuIconFocused) {
      (this.ref.node as Element).querySelector('.dot-group').classList.remove('active');
      if (UtilCore.isIE) {
        (e.target as HTMLElement).setAttribute('transform', 'scale(1)');
      }
    }
  }

  getMenuIconWidth() {
    return this.CHART_DATA.svgWidth < 500 ? 3 : this.state.menuIconWidth - (2 * this.state.menuIconPadding);
  }

  hideBeforeSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for (let elem of elemList) {
      if ((this.ref.node as Element).querySelector(elem)) {
        (this.ref.node as Element).querySelector(elem).classList.add('sc-hide');
      }
    }
  }

  showAfterSave() {
    let elemList = ['.sc-menu-icon', '.sc-redirect-icon'];
    for (let elem of elemList) {
      if ((this.ref.node as Element).querySelector(elem)) {
        (this.ref.node as Element).querySelector(elem).classList.remove('sc-hide');
      }
    }
  }

  onResizeComponent(e: any): void {
    this.setState({ globalRenderAll: true, width: e.data.targetWidth, height: e.data.targetHeight });
  }

  onRenderComponent(newOpts: any): void {
    this.validationErrors = this.validator.validate(this.chartValidationRules, newOpts);
    if (this.validationErrors.length) {
      throw this.validationErrors;
    }
    this.CHART_OPTIONS = UtilCore.extends(this.CHART_OPTIONS, newOpts, { width: 1, height: 1 });
    this.store.setValue('globalRenderAll', true);
    this.setState({ globalRenderAll: true });
  }
}

export default BaseChart;