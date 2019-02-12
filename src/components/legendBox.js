"use strict";

import defaultConfig from "./../settings/config";
import Geom from './../core/geom.core';
import eventEmitter from './../core/eventEmitter';
import { Component } from "./../viewEngin/pview";

/**
 * legendBox.js
 * @createdOn: 06-Nov-2017
 * @author: SmartChartsNXT
 * @description:This is a component class will create legned area. 
 * @extends Component
 * 
 * Legend box accept 3 positioning parameters -
 * {Number} left, {Number} right, {String} float - [top | bottom | left | right]
 * 
 * When Float type is top or bottom only only left param is acceptable and top param was ignored. 
 * When Float type is left or right only only top param is acceptable and left param was ignored. 
 * When Float was undefined then top and left both value was considered. 
 * 
 * Accepted config --
 * "legends":{
      "enable" : true,
      "top": 10,
      "left": 10, 
      "alignment": "horizontal",  // [horizontal | vertical]
      "display"="inline"          // [inline | block] block will take entire row but inline only take space as much required
      "float": "bottom",          // [top | bottom | left | right]
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
      "hideIcon": false, 
      "hideLabel": false, 
      "hideValue": false
    }
 * Supported events - 
 * legendClicked - Triggered when clicked on a legend box.
 * legendHovered - Triggered when mouse hover on a legend box.
 * legendLeaved - Triggered when move out of legend box.
 */

class LegendBox extends Component {
  constructor(props) {
    super(props);
    this.emitter = eventEmitter.getInstance(this.context.runId); 
    this.config = {
      top: this.props.opts.top || this.props.top,
      left: this.props.opts.left || this.props.left,
      type: this.props.opts.alignment || this.props.type || "horizontal",
      float: this.props.opts.float || this.props.float || "none",
      display: this.props.opts.display || this.props.display || "inline",
      color: this.props.opts.color || defaultConfig.theme.fontColorDark,
      bgColor: this.props.opts.bgColor || this.props.background || "none",
      hoverColor: this.props.opts.hoverColor || this.props.hoverColor || "#999",
      fontSize: this.props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
      strokeColor: this.props.opts.borderColor || this.props.strokeColor || "none",
      strokeWidth: this.props.opts.borderWidth || this.props.strokeWidth || "1",
      strokeOpacity: this.props.opts.borderOpacity || this.props.strokeOpacity || 0,
      opacity: this.props.opts.opacity || this.props.opacity || "0.9",
      toggleType: !!(this.props.opts.toggleType || this.props.toggleType || false)
    };

    this.state = {
      legendSet: this.props.legendSet.map(lSet => {
        lSet.eachWidth = lSet.labelLength = lSet.valueLength = 0;
        lSet.isToggeled = lSet.isToggeled === undefined ? false : lSet.isToggeled;
        return lSet;
      }),
      left: 0,
      top: 0,
      width: this.props.width || (this.props.canvasWidth - this.config.left),
      trnsX: 0,
      trnsY: 0,
      legendSetTrnsX: 0,
      lengthSet: {
        max: {
          width: 0,
          labelLength: 0,
          valueLength: 0
        }
      }
    };
    this.padding = 10; 
    this.containerWidth = 0; 
    this.containerHeight = 0; 
    this.colorContWidth = this.props.opts.hideIcon ? 0 : 15;
    this.textResized = false;
    this.hoverHeight = 15; 
    this.lineHeight = 30;
    this.toggleColor = '#bbb';
    this.onClick = this.onClick.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(this);
    if (!this.textResized) {
      this.textResized = true;
      this.state.lengthSet = this.calcElementSpacing(); 
      this.setContainerWidthHeight(); 
      this.calcTransformation();
      this.update();
    }
  }

  render() {
    return (
      <g transform={`translate(${this.state.trnsX},${this.state.trnsY})`}>
        <path class='legend-container-border' d={this.getContainerBorderPath()}  fill={this.config.bgColor} 
          opacity={this.config.opacity} stroke-width={this.config.strokeWidth} stroke={this.config.strokeColor} stroke-opacity={this.config.strokeOpacity} 
        />
        <g class='legend-set' transform={`translate(${this.state.legendSetTrnsX})`}>
          {this.getLegendSet()}
        </g>
      </g>
    );
  }

  getLegendSet() {
    return this.state.legendSet.map((data, index) =>{
      return (
        <g class={`legend-${index} series-legend`} tabindex='0' transform={this.getTransformation(index)} style={{cursor:'pointer'}} 
          events={{
            click:this.onClick,
            keyup:this.onClick,
            mouseenter:this.onHover,
            mouseleave: this.onLeave,
            focusin: this.onHover,
            focusout: this.onLeave
          }} >
          <rect class={`legend-${index} legend-border-${index}`} x={this.state.left + (this.padding/2)} y={this.state.top + (this.padding/2)} rx='7'
           width={this.state.lengthSet.max.width + this.padding} height={this.hoverHeight + this.padding} fill={this.config.hoverColor}  
           stroke='none' style={{'transition': 'fill-opacity 0.3s linear',"fillOpacity":"0"}}>
          </rect>
          {!this.props.opts.hideIcon &&
            <rect class={`legend-${index} legend-color-${index}`} x={this.state.left + this.padding} y={this.state.top + this.padding} 
              width={this.colorContWidth} height={this.colorContWidth} fill={data.isToggeled ? this.toggleColor : data.color} 
              shape-rendering='optimizeSpeed' stroke='none' opacity='1'>
            </rect>
          }
          <text class={`legend-${index} legend-txt-${index}`} font-size={this.config.fontSize} x={this.state.left + this.colorContWidth + (2 * this.padding)} y={this.state.top + this.padding + 14} fill={this.config.color} font-family={this.config.fontFamily} pointer-events='none' >
            <tspan class={`legend-${index} legend-txt-label-${index}`} text-decoration={data.isToggeled ? 'line-through' : 'none'}>{!this.props.opts.hideLabel && data.label}</tspan>
            <tspan class={`legend-${index} legend-txt-value-${index}`} text-decoration={data.isToggeled ? 'line-through' : 'none'}
              dx={this.state.lengthSet.max.labelLength-this.state.legendSet[index].labelLength + this.padding}>
              {!this.props.opts.hideValue && data.value}
            </tspan>
          </text>
        </g>
      );
    });
  }

  calcTransformation() {
    switch (this.config.float) {
      case 'top':
        this.state.trnsX = this.config.left || this.padding;
        this.state.trnsY = this.padding;
        break;
      case 'bottom':
        this.state.trnsX = this.config.left || this.padding;
        this.state.trnsY = this.props.canvasHeight - this.containerHeight - this.padding;
        break;
      case 'left':
        this.state.trnsX = this.padding;
        this.state.trnsY = this.config.top || this.padding;
        break;
      case 'right':
        this.state.trnsX = this.props.canvasWidth - this.containerWidth - this.padding;
        this.state.trnsY = this.config.top || this.padding;
        break;
      case 'none':
      default:
        this.state.trnsX = this.config.left || this.padding;
        this.state.trnsY = this.config.top || this.padding;
    }
    this.state.legendSetTrnsX = (this.containerWidth - this.state.lengthSet.innerWidth - (3 * this.padding)) / 2;
  }

  getTransformation(index) {
    let eachLength = this.getEachLegendLength();
    let maxElemInLine = this.getMaxLegendInLine(eachLength);
    let trnsX = eachLength * (index % maxElemInLine);
    let trnsY = Math.floor(index / maxElemInLine) * this.lineHeight;
    return `translate(${trnsX},${trnsY})`;
  }

  getEachLegendLength() {
    return (this.state.lengthSet.max.width + (2 * this.padding));
  }

  getMaxLegendInLine(eachLength) {
    if(this.config.type === 'horizontal'){
      if(this.config.display === 'block') {
        return Math.floor((this.props.canvasWidth - (2*this.padding)) / eachLength);
      }else {
        return this.state.legendSet.length;
      }
    }else {
      return 1; 
    }
  }

  calcElementSpacing() {
    let lengthSet = {
      eachWidth: [],
      labelLength: [],
      valueLength: []
    };
    this.state.legendSet.forEach((lSet, index) => {
      lengthSet.eachWidth.push(lSet.eachWidth = this.ref.node.querySelector(`.legend-${index}.series-legend`).getBBox().width);
      lengthSet.labelLength.push(lSet.labelLength = this.ref.node.querySelector(`.legend-txt-label-${index}`).getComputedTextLength());
      lengthSet.valueLength.push(lSet.valueLength = this.ref.node.querySelector(`.legend-txt-value-${index}`).getComputedTextLength());
    });
    lengthSet.max = {
      width: Math.max(...lengthSet.eachWidth),
      labelLength: Math.max(...lengthSet.labelLength),
      valueLength: Math.max(...lengthSet.valueLength)
    };
    lengthSet.innerWidth = (lengthSet.max.width + this.padding) * Math.min(this.state.legendSet.length, this.getMaxLegendInLine(lengthSet.max.width + (2 * this.padding)));
    return lengthSet;
  }

  setContainerWidthHeight() {
    let eachLength = this.getEachLegendLength();
    let maxElemInLine = this.getMaxLegendInLine(eachLength);
    this.containerWidth = this.config.display === 'block' ? this.props.canvasWidth - (2 * this.padding) : (maxElemInLine * eachLength) + (2 * this.padding);
    this.containerHeight = (Math.ceil(this.state.legendSet.length / maxElemInLine) * this.lineHeight) + this.padding;
  }

  getContainerBorderPath() {
    return Geom.describeRoundedRect(this.state.left, this.state.top, this.containerWidth, this.containerHeight, 10).join(" ");
  }

  getBBox() {
    return {
      width: this.containerWidth, 
      height: this.containerHeight, 
      x: this.state.trnsX,
      y: this.state.trnsY
    };
  }

  assignLegendData(index, e) {
    let legend = this.state.legendSet[index];
    e.label = legend.label; 
    e.value = legend.value; 
    e.color = legend.color; 
    e.index = index;
    e.isToggeled = legend.isToggeled;
    return e;
  }

  onClick(e) {
    if(e.type === "keyup" && (e.which || e.keyCode) !== 32) {
      return; 
    }
    let index = e.target.classList[0].substring("legend-".length);
    if (this.config.toggleType) {
      this.state.legendSet[index].isToggeled = !this.state.legendSet[index].isToggeled;
      this.update();
    }
    this.assignLegendData(index, e);
    this.emitter.emit('legendClicked', e);
  }

  onHover(e) {
    let index = e.target.classList[0].substring("legend-".length);
    this.ref.node.querySelector(`.legend-border-${index}`).style['fill-opacity'] = 0.9; 
    this.assignLegendData(index, e);
    this.emitter.emit('legendHovered', e);
  }

  onLeave(e) {
    let index = e.target.classList[0].substring("legend-".length);
    if(this.ref.node.querySelector(`.legend-border-${index}`)){
      this.ref.node.querySelector(`.legend-border-${index}`).style['fill-opacity'] = 0; 
    }
    this.assignLegendData(index, e);
    this.emitter.emit('legendLeaved', e);
  }
}

export default LegendBox; 