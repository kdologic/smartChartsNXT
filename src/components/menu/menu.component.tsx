'use strict';

import Point from '../../core/point';
import { Component } from '../../viewEngin/pview';
import defaultConfig from '../../settings/config';
import eventEmitter, { CustomEvents } from '../../core/eventEmitter';
import SpeechBox from '../../components/speechBox/speechBox.components';
import saveAs from '../../core/saveAs';
import { IMenuItem, IMenuOptions, IMenuProps } from './menu.model';
import { IMainMenu } from '../../global/global.models';
import { IVnode } from '../../viewEngin/component.model';
import { SAVE_AS } from '../../settings/globalEnums';

/**
 * menu.component.tsx
 * @createdOn:06-Jan-2018
 * @author:SmartChartsNXT
 * @description:This will generate a menu in chart.
 * @extends Component
 */


class Menu extends Component<IMenuProps> {
  private emitter: CustomEvents;
  private menuItemWidth: number;
  private menuItemHeight: number;
  private menuAnchor: number;
  private menuPaddingTop: number;
  private menuPosition: Point;
  private menuFontSize: number;
  private menuOpt: IMenuOptions;

  constructor(props: IMenuProps) {
    super(props);
    this.emitter = eventEmitter.getInstance((this as any).context.runId);
    this.state = {
      menuItem: [],
      menuIconWidth: 30,
      padding: 5,
      focusIndex: 0
    };
    this.menuItemWidth = 150;
    this.menuItemHeight = 50;
    this.menuAnchor = 3;
    this.menuPaddingTop = 12;
    this.menuPosition = new Point(this.props.x, this.props.y);
    this.menuFontSize = 10;
    this.menuOpt = {
      menu: [{
        id: 'itemSaveAsJPG',
        label: 'Save As JPG',
        hotKey: 8,
        bottomLine: true,
        type: SAVE_AS.JPG,
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.JPG);
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.JPG);
          }
        }
      }, {
        id: 'itemSaveAsPNG',
        label: 'Save As PNG',
        hotKey: 9,
        bottomLine: true,
        type: SAVE_AS.PNG,
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PNG);
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PNG);
          }
        }
      }, {
        id: 'itemSaveAsSVG',
        label: 'Save As SVG',
        hotKey: 9,
        bottomLine: true,
        type: SAVE_AS.SVG,
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.SVG);
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.SVG);
          }
        }
      }, {
        id: 'itemSaveAsPDF',
        label: 'Save As PDF',
        hotKey: 9,
        bottomLine: true,
        type: SAVE_AS.PDF,
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PDF);
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PDF);
          }
        }
      }, {
        id: 'itemPrint',
        label: 'Print',
        hotKey: 0,
        bottomLine: false,
        type: SAVE_AS.PRINT,
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PRINT);
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, SAVE_AS.PRINT);
          }
        }
      }]
    };

    const splitAt = (str: string, i: number) => [str.slice(0, i), str.slice(i, i + 1), str.slice(i + 1)];
    this.hideMenuItems = this.hideMenuItems.bind(this);
    this.onMenuItemFocusIn = this.onMenuItemFocusIn.bind(this);
    this.onMenuItemFocusOut = this.onMenuItemFocusOut.bind(this);
    this.onMenuItemKeyUp = this.onMenuItemKeyUp.bind(this);
    this.processHotKeys = this.processHotKeys.bind(this);
    this.menuOpt.menu.map((m) => {
      m.splitLabel = splitAt(m.label, m.hotKey);
    });
    this.configureMenuItems(this.props.opts);
  }

  afterMount(): void {
    if (!(this.ref.node instanceof Text) && typeof (this.ref.node.querySelector('.item-' + this.state.focusIndex) as any).focus === 'function') {
      (this.ref.node.querySelector('.item-' + this.state.focusIndex) as any).focus();
    }
  }

  beforeUpdate(nextProps: IMenuProps): void {
    this.configureMenuItems(nextProps.opts);
  }

  configureMenuItems(opts: IMainMenu): void {
    this.state.menuItems = [];
    this.menuOpt.menu.map((item: IMenuItem) => {
      if (opts[item.id]) {
        this.state.menuItems.push(item);
      }
    });
  }

  render(): IVnode {
    this.menuPosition = new Point(this.props.x, this.props.y);
    return (
      <g class='sc-menu-context'
        events={{
          keydown: this.processHotKeys
        }}>
        <style> {this.getStyle()} </style>
        <rect class='sc-overlay' x={0} y={0} width={this.props.svgWidth} height={this.props.svgHeight} opacity='0.2' fill='#000' events={{ click: this.hideMenuItems }}></rect>
        {this.getCloseIcon()}
        {this.generateMenuItems()}
      </g>
    );
  }

  generateMenuItems(): IVnode {
    let xPos = -(this.menuItemWidth + this.menuAnchor + (2 * this.state.padding));
    return (
      <g role='menu' transform={`translate(${this.menuPosition.x},${this.menuPosition.y})`}>
        <SpeechBox x={xPos} y={this.menuPaddingTop} width={this.menuItemWidth} height={(this.state.menuItems.length * this.menuItemHeight)} cpoint={new Point(this.menuAnchor, 12)}
          bgColor='#fff' fillOpacity='1' shadow={true} strokeColor='none'>
        </SpeechBox>
        {
          this.state.menuItems.map((menu: IMenuItem, index: number) => this.getEachItem.call(this, menu, index, xPos))
        }
      </g>
    );
  }

  getEachItem(menu: IMenuItem, index: number, xPos: number): IVnode {
    let yPos = (index * this.menuItemHeight) + this.menuPaddingTop;
    let txtPLeft = 12;
    return (
      <g class={'menu-item' + ' ' + 'item-' + index} data-item-index={index} role='menuitem' aria-label={menu.label} aria-haspopup="true" tabindex='-1'
        events={
          Object.assign({}, menu.events, {
            keyup: this.onMenuItemKeyUp,
            focusin: this.onMenuItemFocusIn,
            focusout: this.onMenuItemFocusOut,
            mouseenter: this.onMenuItemFocusIn
          })}>
        <rect class='menu-item-rect' x={xPos} y={yPos} width={this.menuItemWidth} height={this.menuItemHeight}
          opacity='1' stroke='#000' stroke-width='0' fill='#fff' style={{ 'cursor': 'pointer' }}>
        </rect>
        <text class='item-text' text-rendering='geometricPrecision' font-size='12' font-family={defaultConfig.theme.fontFamily} pointer-events='none'>
          <tspan text-anchor='start' class='menu-item-text' x={xPos + txtPLeft} y={yPos + (this.menuItemHeight / 2)} dy='5'>{menu.splitLabel[0]}<tspan text-decoration='underline' word-spacing='-2'> {menu.splitLabel[1]} </tspan>{menu.splitLabel[2]}</tspan>
        </text>
        {(menu.bottomLine || menu.topLine) &&
          <line x1={xPos} y1={yPos + (menu.bottomLine ? this.menuItemHeight : 0)} x2={xPos + this.menuItemWidth} y2={yPos + (menu.bottomLine ? this.menuItemHeight : 0)} stroke='#d4d4d4' stroke-width='1' vector-effect='non-scaling-stroke' />
        }
      </g>
    );
  }

  getStyle(): string {
    return (`
      .menu-item:hover .menu-item-rect, .menu-item:focus .menu-item-rect {
        fill: #555;
        -webkit-transition: fill 500ms ease-out;
        -ms-transition: fill 500ms ease-out;
        transition: fill 500ms ease-out;
      }
      .menu-item:hover .item-text, .menu-item:focus .item-text {
        fill: #fff;
      }
    `);
  }

  getCloseIcon(): IVnode {
    return (
      <g class='sc-menu-close-icon' transform={`translate(${this.props.svgWidth},${0})`} >
        <title>Close</title>
        <style>
          {`
            .sc-menu-close-icon-bg {
              fill-opacity: 1;
              stroke-opacity: 1;
              transform:scale(1.5);
              transition-duration: .15s;
              transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
              transition-property: fill;
              cursor:pointer;
            }
            .sc-menu-close-icon-bg:hover, .sc-menu-close-icon-bg:focus {
              fill: #8a2731;
            }
          `}
        </style>
        <circle class='sc-menu-close-icon-bg do-focus-highlight' cx='0' cy='0' r='34' fill='#d73e4d' stroke='#fff' stroke-width='2' pointer-events='all' tabindex='0' transform="scale(1.5)"
          role='button' aria-label='close menu'
          events={{
            click: this.hideMenuItems,
            keydown: this.hideMenuItems
          }}
        />
        <text text-rendering='geometricPrecision' stroke='#fff' fill='#fff' font-size='30' pointer-events='none'>
          <tspan text-anchor='middle' x='-20' y='30'>&times;</tspan>
        </text>
      </g>
    );
  }

  onMenuSelect(e: MouseEvent | KeyboardEvent, type: SAVE_AS): void {
    if (e instanceof KeyboardEvent && e.type == 'keydown') {
      if (e.code === 'Tab') {
        e.preventDefault();
        if (!(this.ref.node instanceof Text) && typeof (this.ref.node.querySelector('.sc-menu-close-icon-bg') as any)?.focus === 'function') {
          (this.ref.node.querySelector('.sc-menu-close-icon-bg') as any)?.focus();
        }
        return;
      } else if (['Enter', 'Space'].indexOf(e.code) === -1) {
        return;
      }
    }

    let eventOpts = { emitter: this.emitter, width: this.props.svgWidth, height: this.props.svgHeight, srcElem: this.props.rootNode };

    this.hideMenuItems(e);
    saveAs[type].call(saveAs, eventOpts);
  }

  hideMenuItems(e: MouseEvent | KeyboardEvent) {
    if (e.type === 'click' || (e instanceof KeyboardEvent && e.type === 'keydown' && (e.code === 'Enter' || e.code === 'Space'))) {
      e.stopPropagation();
      this.emitter.emitSync('menuClosed', e);
    } else if (e instanceof KeyboardEvent && e.type == 'keydown' && e.code === 'Tab' && e.shiftKey) {
      e.preventDefault();
      this.setItemFocus();
    }
  }

  onMenuItemKeyUp(e: KeyboardEvent) {
    if (e.code === 'ArrowUp') {
      this.state.focusIndex = this.state.focusIndex - 1;
      if (this.state.focusIndex < 0) {
        this.state.focusIndex = this.state.menuItems.length - 1;
      }
    } else if (e.code === 'ArrowDown') {
      this.state.focusIndex = (this.state.focusIndex + 1) % this.state.menuItems.length;
    }
    this.setItemFocus();
  }

  onMenuItemFocusIn(e: MouseEvent | KeyboardEvent) {
    let menuItemIndex = +(e.target as HTMLElement).getAttribute('data-item-index');
    this.state.focusIndex = menuItemIndex;
    this.setItemFocus();
  }

  setItemFocus(): void {
    if (!(this.ref.node instanceof Text) && typeof (this.ref.node.querySelector('.item-' + this.state.focusIndex) as any).focus === 'function') {
      (this.ref.node.querySelector('.item-' + this.state.focusIndex) as any).focus();
    }
  }

  onMenuItemFocusOut() {
    // nothing to do here now
  }

  processHotKeys(e: KeyboardEvent) {
    if (e.type === 'keydown') {
      if (e.code == 'Escape') {
        let event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        (this.ref.node as HTMLElement).querySelector('.sc-menu-close-icon-bg').dispatchEvent(event);
      } else {
        for (let i = 0; i < this.state.menuItems.length; i++) {
          let menu = this.state.menuItems[i];
          if (e.key.toString().toLowerCase() == menu.splitLabel[1].toString().toLowerCase()) {
            let event = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            (this.ref.node as HTMLElement).querySelector('.item-' + i).dispatchEvent(event);
          }
        }
      }
    }
  }
}

export default Menu;