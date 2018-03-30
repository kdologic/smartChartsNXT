/** 
 * menu.js
 * @createdOn:06-Jan-2018
 * @version:2.0.0
 * @author:SmartChartsNXT
 * @description:This will generate a menu in chart.
 */

"use strict";

import Point from "./../core/point";
import { Component } from "./../viewEngin/pview";
import defaultConfig from "./../settings/config";
import Geom from './../core/geom.core'; 
import SpeechBox from './../components/speechBox'; 
import saveAs from './../core/saveAs';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuIconWidth: 30, 
      padding: 5,
      showLoader:false,
      showTopMenu: false
    };
    this.menuItemWidth = 150;
    this.menuItemHeight = 50;
    this.menuAnchor = 3;
    this.menuPaddingTop = 12;
    this.menuPosition = new Point(this.props.x, this.props.y);
    this.menuFontSize = 10;
    let eventOpts; 
    this.props.menuOpt = {
      menu: [{
        label: "Print",
        bottomLine: true,
        events: {
          click: this.onMenuClick.bind(this, 'print')
        }
      }, {
        label: "Save As JPG",
        bottomLine: true,
        events: {
          click: this.onMenuClick.bind(this, 'jpeg')
        }
      }, {
        label: "Save As PDF",
        bottomLine: true,
        events: {
          click: this.onMenuClick.bind(this, 'pdf')
        }
      }, {
        label: "Save As PNG",
        bottomLine: true,
        events: {
          click: this.onMenuClick.bind(this, 'png')
        }
      }, {
        label: "Save As SVG",
        bottomLine: false,
        events: {
          click: this.onMenuClick.bind(this, 'svg')
        }
      }
      ]
    };
  }

  onMenuClick(type) {
    let eventOpts = {width:this.props.svgWidth, height:this.props.svgHeight, srcElem:this.props.rootNode};
    this.showMenu(false); 
    this.blurBG(false);
    if(type === 'pdf') {
      this.blurBG(true);
      this.setState({showLoader:true});
      eventOpts.beforeSave = () => {
        this.setState({showLoader:false});
        this.blurBG(false);
      };
    }
    saveAs[type].call(saveAs, eventOpts); 
  }


  render() {
    this.menuPosition = new Point(this.props.x, this.props.y);
    return (
      <g id='smartChartsNXT-menu2'>
        <style> {this.getStyle()} </style> 
        <defs>
          <filter id="menu-bg-blur" x="0" y="0">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>

        { this.state.showTopMenu &&  
          <rect x={0} y={0} width={this.props.svgWidth} height={this.props.svgHeight} opacity='0.0001' events={{click:this.showMenu.bind(this)}}></rect>
        }

        <g events={{click: this.showMenu.bind(this)}} transform={`translate(${this.menuPosition.x},${this.menuPosition.y})`}>
          <rect id='smartCharts-menu-icon' x={0} y={0} width={this.state.menuIconWidth} height={24} pointer-events='all' fill='#f1f1f1' stroke-width='1' stroke-opacity='0' opacity={this.state.showTopMenu ? 1 : 0} stroke={defaultConfig.theme.fontColorDark} style={{cursor:'pointer'}} />
          <g class='vBarIcon' stroke={defaultConfig.theme.fontColorDark} stroke-width='1' 
            vector-effect="non-scaling-stroke" style={{cursor:'pointer'}}>
            <line  x1={this.state.padding} y1='6' x2={this.state.padding + this.getMenuIconWidth()} y2='6' />
            <line  x1={this.state.padding} y1='12' x2={this.state.padding + this.getMenuIconWidth()} y2='12' />
            <line  x1={this.state.padding} y1='18' x2={this.state.padding + this.getMenuIconWidth()} y2='18' />
          </g>
        </g>

        { this.state.showLoader && this.loader() }
        { this.state.showTopMenu &&  this.generateMenuItems() }
      </g>
    ); 
  }

  generateMenuItems(){
    let xPos = -(this.menuItemWidth + this.menuAnchor + (2*this.state.padding));
    return (
      <g transform={`translate(${this.menuPosition.x},${this.menuPosition.y})`}>
        <SpeechBox x={xPos} y={this.menuPaddingTop} width={this.menuItemWidth} height={(this.props.menuOpt.menu.length*this.menuItemHeight)} cpoint={new Point(this.menuAnchor, 12) }
          bgColor='#f1f1f1' opacity='1' shadow={true} strokeColor='none'> 
        </SpeechBox> 
        {
          this.props.menuOpt.menu.map((menuOpt, index) => {return this.getEachItem.call(this, menuOpt, index, xPos);})
        }
      </g>
    );
    
  }

  getEachItem(menuOpt, index, xPos) {
    let yPos = (index * this.menuItemHeight) + this.menuPaddingTop; 
    let txtPLeft = 12;
    return (
      <g class={'menu-item-' + index}>
        <rect class={'menu-item-rect'} x={xPos} y={yPos} width={this.menuItemWidth} height={this.menuItemHeight} 
          opacity='1' stroke='#000' stroke-width='0' fill='#f1f1f1' style={{'cursor':'pointer'}}
          events={menuOpt.events}>
        </rect>
        <text text-rendering='geometricPrecision' font-size='12' font-family={defaultConfig.theme.fontFamily} pointer-events='none'>
          <tspan text-anchor='start' class={'menu-item-text'} x={xPos + txtPLeft} y={yPos + (this.menuItemHeight/2)} dy='5'>{menuOpt.label}</tspan>
        </text>
        {(menuOpt.bottomLine || menuOpt.topLine) && 
          <line x1={xPos} y1={yPos + (menuOpt.bottomLine ? this.menuItemHeight : 0)} x2={xPos + this.menuItemWidth} y2={yPos + (menuOpt.bottomLine ? this.menuItemHeight : 0)} stroke='#d4d4d4' stroke-width='1' vector-effect="non-scaling-stroke" />
        }
      </g>
    );
  }

  getMenuIconWidth() {
    return this.props.svgWidth < 500 ? 3 : this.state.menuIconWidth - (2 * this.state.padding); 
  }
  
  showMenu() {
    this.blurBG(!this.state.showTopMenu); 
    this.setState({showTopMenu:!this.state.showTopMenu}); 
  }

  showLoader(show){
    this.setState({showLoader:show}); 
  }

  blurBG(doBlur){
    let targetNode = document.querySelector(this.props.targetNode);
    if(doBlur) {
      targetNode.classList.add("menu-blur");
      targetNode.setAttribute('pointer-events','none');
    }else {
      targetNode.classList.remove("menu-blur");
      targetNode.setAttribute('pointer-events','');
    }
  }

  getStyle() {
    return (`
      .menu-blur {
        transition: filter 1s linear;
        filter:url(#menu-bg-blur);
      }
      .menu-item-rect:hover {
        fill: #b7b7b7;
        -webkit-transition: fill 500ms ease-out;
        -ms-transition: fill 500ms ease-out;
        transition: fill 500ms ease-out;
      }
    `);
  }

  loader() { //style={{display:'none'}}
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