'use strict';

import Point from './../core/point';
import { Component } from './../viewEngin/pview';
import defaultConfig from './../settings/config';
import eventEmitter from './../core/eventEmitter';
import SpeechBox from './../components/speechBox/speechBox.components';
import saveAs from './../core/saveAs';

/**
 * menu.js
 * @createdOn:06-Jan-2018
 * @author:SmartChartsNXT
 * @description:This will generate a menu in chart.
 * @extends Component
 */


class Menu extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId);
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
        type: 'jpg',
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, 'jpg');
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, 'jpg');
          }
        }
      }, {
        id: 'itemSaveAsPNG',
        label: 'Save As PNG',
        hotKey: 9,
        bottomLine: true,
        type: 'png',
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, 'png');
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, 'png');
          }
        }
      }, {
        id: 'itemSaveAsSVG',
        label: 'Save As SVG',
        hotKey: 9,
        bottomLine: true,
        type: 'svg',
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, 'svg');
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, 'svg');
          }
        }
      }, {
        id: 'itemSaveAsPDF',
        label: 'Save As PDF',
        hotKey: 9,
        bottomLine: true,
        type: 'pdf',
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, 'pdf');
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, 'pdf');
          }
        }
      }, {
        id: 'itemPrint',
        label: 'Print',
        hotKey: 0,
        bottomLine: false,
        type: 'print',
        events: {
          click: (e) => {
            this.onMenuSelect.call(this, e, 'print');
          },
          keydown: (e) => {
            this.onMenuSelect.call(this, e, 'print');
          }
        }
      }]
    };

    let splitAt = (str, i) => [str.slice(0, i), str.slice(i, i + 1), str.slice(i + 1)];
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

  afterMount() {
    if(typeof this.ref.node.querySelector('.item-' + this.state.focusIndex).focus === 'function') {
      this.ref.node.querySelector('.item-' + this.state.focusIndex).focus();
    }
  }

  beforeUpdate(nextProps) {
    this.configureMenuItems(nextProps.opts);
  }

  configureMenuItems(opts) {
    this.state.menuItems = [];
    this.menuOpt.menu.map((item) => {
      if(opts[item.id]) {
        this.state.menuItems.push(item);
      }
    });
  }

  render() {
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

  generateMenuItems() {
    let xPos = -(this.menuItemWidth + this.menuAnchor + (2 * this.state.padding));
    return (
      <g role='menu' transform={`translate(${this.menuPosition.x},${this.menuPosition.y})`}>
        <SpeechBox x={xPos} y={this.menuPaddingTop} width={this.menuItemWidth} height={(this.state.menuItems.length * this.menuItemHeight)} cpoint={new Point(this.menuAnchor, 12)}
          bgColor='#fff' opacity='1' shadow={true} strokeColor='none'>
        </SpeechBox>
        {
          this.state.menuItems.map((menu, index) => this.getEachItem.call(this, menu, index, xPos))
        }
      </g>
    );
  }

  getEachItem(menu, index, xPos) {
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

  getStyle() {
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

  getCloseIcon() {
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

  onMenuSelect(e, type) {
    if (e.type == 'keydown') {
      if (e.which == 9) {
        e.preventDefault();
        if(typeof this.ref.node.querySelector('.sc-menu-close-icon-bg').focus === 'function') {
          this.ref.node.querySelector('.sc-menu-close-icon-bg').focus();
        }
        return;
      } else if ([13, 32].indexOf(e.which) === -1) {
        return;
      }
    }

    let eventOpts = { emitter: this.emitter, width: this.props.svgWidth, height: this.props.svgHeight, srcElem: this.props.rootNode };

    this.hideMenuItems(e);
    saveAs[type].call(saveAs, eventOpts);
  }

  hideMenuItems(e) {
    if (e.type == 'click' || (e.type == 'keydown' && (e.which === 13 || e.which === 32))) {
      e.stopPropagation();
      this.emitter.emitSync('menuClosed', e);
    } else if (e.type == 'keydown' && e.which === 9 && e.shiftKey) {
      e.preventDefault();
      if(typeof this.ref.node.querySelector('.item-' + this.state.focusIndex).focus === 'function') {
        this.ref.node.querySelector('.item-' + this.state.focusIndex).focus();
      }
    }
  }

  onMenuItemKeyUp(e) {
    if (e.which === 38) {
      this.state.focusIndex = this.state.focusIndex - 1;
      if (this.state.focusIndex < 0) {
        this.state.focusIndex = this.state.menuItems.length - 1;
      }
    } else if (e.which === 40) {
      this.state.focusIndex = (this.state.focusIndex + 1) % this.state.menuItems.length;
    }
    if(typeof this.ref.node.querySelector('.item-' + this.state.focusIndex).focus === 'function') {
      this.ref.node.querySelector('.item-' + this.state.focusIndex).focus();
    }
  }

  onMenuItemFocusIn(e) {
    let menuItemIndex = +e.target.getAttribute('data-item-index');
    this.state.focusIndex = menuItemIndex;
    if(typeof this.ref.node.querySelector('.item-' + this.state.focusIndex).focus === 'function') {
      this.ref.node.querySelector('.item-' + this.state.focusIndex).focus();
    }
  }

  onMenuItemFocusOut() {
    // nothing to do here now
  }

  processHotKeys(e) {
    if (e.type === 'keydown') {
      if (e.which == 27) {
        let evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.ref.node.querySelector('.sc-menu-close-icon-bg').dispatchEvent(evt);
      } else {
        for (let i = 0; i < this.state.menuItems.length; i++) {
          let menu = this.state.menuItems[i];
          if (e.key.toString().toLowerCase() == menu.splitLabel[1].toString().toLowerCase()) {
            let evt = document.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.ref.node.querySelector('.item-' + i).dispatchEvent(evt);
          }
        }
      }
    }
  }

}

export default Menu;