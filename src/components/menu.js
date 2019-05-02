"use strict";

import Point from "./../core/point";
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import eventEmitter from "./../core/eventEmitter"; 
import SpeechBox from './../components/speechBox'; 
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
      menuIconWidth: 30, 
      padding: 5,
      showLoader: false,
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
        label: "Save As JPG",
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
        label: "Save As PNG",
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
        label: "Save As SVG",
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
        label: "Save As PDF",
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
        label: "Print",
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

    let splitAt = (str, i) => [str.slice(0,i), str.slice(i, i+1),str.slice(i+1)];
    this.hideMenuItems = this.hideMenuItems.bind(this);
    this.onMenuItemFocusIn = this.onMenuItemFocusIn.bind(this); 
    this.onMenuItemFocusOut = this.onMenuItemFocusOut.bind(this);
    this.onMenuItemKeyUp = this.onMenuItemKeyUp.bind(this);
    this.processHotKeys = this.processHotKeys.bind(this);
    this.menuOpt.menu.map((m)=>{
      m.splitLabel = splitAt(m.label, m.hotKey);
    });
  }

  componentDidMount() {
    this.ref.node.querySelector('.item-'+this.state.focusIndex).focus(); 
  }

  render() {
    this.menuPosition = new Point(this.props.x, this.props.y);
    return (
      <g class='smartChartsNXT-menu2' 
      events={{
        keydown: this.processHotKeys
      }}>
        <style> {this.getStyle()} </style> 
        <rect x={0} y={0} width={this.props.svgWidth} height={this.props.svgHeight} opacity='0.2' fill='#000' events={{click:this.hideMenuItems}}></rect>
        { this.state.showLoader && this.loader() }
        { this.getCloseIcon() }
        { this.generateMenuItems() }
      </g>
    ); 
  }

  generateMenuItems(){
    let xPos = -(this.menuItemWidth + this.menuAnchor + (2*this.state.padding));
    return (
      <g transform={`translate(${this.menuPosition.x},${this.menuPosition.y})`}>
        <SpeechBox x={xPos} y={this.menuPaddingTop} width={this.menuItemWidth} height={(this.menuOpt.menu.length*this.menuItemHeight)} cpoint={new Point(this.menuAnchor, 12) }
          bgColor='#fff' opacity='1' shadow={true} strokeColor='none'> 
        </SpeechBox> 
        {
          this.menuOpt.menu.map((menu, index) => {return this.getEachItem.call(this, menu, index, xPos);})
        }
      </g>
    );
  }

  getEachItem(menu, index, xPos) {
    let yPos = (index * this.menuItemHeight) + this.menuPaddingTop; 
    let txtPLeft = 12;
    return (
      <g class={'menu-item'+' '+'item-' + index} data-item-index={index} role="menuitem" aria-label={menu.label} tabindex="-1"
        events={
          Object.assign({}, menu.events, {
          keyup: this.onMenuItemKeyUp,
          focusin: this.onMenuItemFocusIn, 
          focusout: this.onMenuItemFocusOut,
          mouseenter: this.onMenuItemFocusIn 
        })}>
        <rect class="menu-item-rect" x={xPos} y={yPos} width={this.menuItemWidth} height={this.menuItemHeight} 
          opacity='1' stroke='#000' stroke-width='0' fill="#fff" style={{'cursor':'pointer'}}>
        </rect>
        <text class="item-text" text-rendering='geometricPrecision' font-size='12' font-family={defaultConfig.theme.fontFamily} pointer-events='none'>
          <tspan text-anchor='start' class="menu-item-text" x={xPos + txtPLeft} y={yPos + (this.menuItemHeight/2)} dy='5'>{menu.splitLabel[0]}<tspan text-decoration="underline" word-spacing="-2"> {menu.splitLabel[1]} </tspan>{menu.splitLabel[2]}</tspan>
        </text>
        {(menu.bottomLine || menu.topLine) && 
          <line x1={xPos} y1={yPos + (menu.bottomLine ? this.menuItemHeight : 0)} x2={xPos + this.menuItemWidth} y2={yPos + (menu.bottomLine ? this.menuItemHeight : 0)} stroke='#d4d4d4' stroke-width='1' vector-effect="non-scaling-stroke" />
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
      <g class="sc-menu-close-icon" transform={`translate(${this.props.svgWidth},${0})`} >
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
        <circle  class="sc-menu-close-icon-bg do-focus-highlight" cx="0" cy ="0" r="34" fill="#d73e4d" stroke="#fff" stroke-width='2' pointer-events='all' tabindex="0"
          role="button" aria-label="close menu"
          events={{
            click: this.hideMenuItems,
            keydown: this.hideMenuItems
          }}
        />
        <text text-rendering='geometricPrecision' stroke="#fff" fill="#fff" font-size="30" pointer-events="none">
          <tspan text-anchor='middle' x="-20" y="30">&times;</tspan>
        </text>
      </g>
    );
  }

  onMenuSelect(e, type) {
    if(e.type == 'keydown') {
      if(e.which == 9) {
        e.preventDefault();
        this.ref.node.querySelector('.sc-menu-close-icon-bg').focus(); 
        return;
      }else if([13, 32].indexOf(e.which) === -1) {
        return;
      }
    }
    
    let eventOpts = {emitter: this.emitter, width: this.props.svgWidth, height: this.props.svgHeight, srcElem: this.props.rootNode};
     
    if(type === 'pdf') {
      this.setState({showLoader:true});
      eventOpts.beforeSave = () => {
        this.hideMenuItems(e);
      };
    }else {
      this.hideMenuItems(e);
    }

    saveAs[type].call(saveAs, eventOpts); 
  }

  hideMenuItems(e) {
    if(e.type =='click' || (e.type == 'keydown' && (e.which === 13 || e.which === 32))) {
      e.stopPropagation();
      this.emitter.emit("menuClosed", e);
    }else if(e.type == 'keydown' && e.which === 9 && e.shiftKey) {
      e.preventDefault(); 
      this.ref.node.querySelector('.item-'+this.state.focusIndex).focus();
    }
  }

  onMenuItemKeyUp(e) {
    if(e.which === 38) {
      this.state.focusIndex = this.state.focusIndex - 1;
      if(this.state.focusIndex < 0) {
        this.state.focusIndex = this.menuOpt.menu.length - 1;
      } 
    }else if(e.which === 40) {
      this.state.focusIndex = (this.state.focusIndex + 1)%this.menuOpt.menu.length;
    }
    this.ref.node.querySelector('.item-'+this.state.focusIndex).focus();
  }
 
  onMenuItemFocusIn(e) {
    let menuItemIndex = +e.target.getAttribute('data-item-index');
    this.state.focusIndex = menuItemIndex;
    this.ref.node.querySelector('.item-'+this.state.focusIndex).focus();
  }

  onMenuItemFocusOut(e) {
    // nothing to do here now
  }

  showLoader(show) {
    this.setState({showLoader:show}); 
  }

  processHotKeys(e) {
    if(e.type === "keydown") {
      if(e.which == 27) {
        let evt = document.createEvent("MouseEvents");
        evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        this.ref.node.querySelector('.sc-menu-close-icon-bg').dispatchEvent(evt);     
      }else {
        for(let i=0;i<this.menuOpt.menu.length;i++) {
          let menu = this.menuOpt.menu[i];
          if(e.key.toString().toLowerCase() == menu.splitLabel[1].toString().toLowerCase()) {
            let evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            this.ref.node.querySelector('.item-'+i).dispatchEvent(evt);      
          }
        }
      }
    }
  }

  loader() {
    return (
      <g id='smartsChartsNXT-loader-container' >
        <g id='loader-icon'  transform={`translate(${this.props.svgWidth/2},${(this.props.svgHeight/2) - 40}) scale(0.6,0.6)`}>
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

export default Menu; 