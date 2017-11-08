"use strict";

/*
 * legendBox.js
 * @CreatedOn: 06-Nov-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:This is a component class will create legned area. 
 */

import Point from "./../core/point";
import Geom from './../core/geom.core';
import Ui from './../core/ui.core';
import UtilCore from './../core/util.core';
import { Component } from "./../viewEngin/pview";

class LegendBox extends Component {
  constructor(props) {
    super(props);

    this.state = {
      legendSet: this.props.legendSet.map(lSet => {
        lSet.length = lSet.labelLength = lSet.valueLength = 0;
        lSet.isToggeled = false; 
        return lSet;
      }),
      left: this.props.left,
      top: this.props.top,
      padding: 10,
      width: this.props.width || (this.props.svgWidth - this.props.left),
      trnsX: 0,
      lengthSet: {
        max: {
          length: 0,
          labelLength: 0,
          valueLength: 0
        }
      }
    };
    this.fontSize = 16;
    this.colorContWidth = 15;
    this.isToggleType = !!this.props.toggleType;
    this.textResized = false;
    this.lineHeight = 30;
    this.toggleColor = '#bbb';
  }

  componentDidMount() {
    if (!this.textResized) {
      this.textResized = true;
      this.setState({ lengthSet: this.calcElementSpacing() });
    }
  }

  render() {
    return (
      <g>
        <path class='legend-container-border' d={this.getContainerBorderPath()}  fill={(this.props.background || "none")} stroke-width='1' stroke='#717171' stroke-opacity={(this.props.border ? 1 : 0)} />
        {this.getLegendSet()}
      </g>
    );
  }

  getLegendSet() {
    return this.state.legendSet.map((data, index) =>{
      return (
        <g class={`legend-${index} series-legend`} transform={this.getTransformation(index)} style={{cursor:'pointer'}} 
          events={{
            click:this.onClick.bind(this),
            mouseenter:this.onHover.bind(this),
            mouseleave: this.onLeave.bind(this)
          }} >
          <rect class={`legend-${index} legend-color-${index}`} x={this.state.left + this.state.padding} y={this.state.top + this.state.padding} width={this.colorContWidth} height={this.colorContWidth} fill={data.isToggeled ? this.toggleColor : data.color}  shape-rendering='optimizeSpeed' stroke='none' stroke-width='1' opacity='1'></rect>
          <text class={`legend-${index} legend-txt-${index}`} font-size={this.fontSize} x={this.state.left + this.colorContWidth + (2 * this.state.padding)} y={this.state.top + this.state.padding + 14} fill='#717171' font-family='Lato' >
            <tspan class={`legend-${index} legend-txt-label-${index}`}>{data.label}</tspan>
            <tspan class={`legend-${index} legend-txt-value-${index}`} 
              dx={this.state.lengthSet.max.labelLength-this.state.legendSet[index].labelLength + this.state.padding}>
              {data.value}
            </tspan>
          </text>
        </g>
      );
    });
  }

  getTransformation(index) {
    let eachLength = this.getEachLegendLength();
    let maxElemInLine = this.getMaxLegendInLine(eachLength);
    let trnsX = eachLength * (index % maxElemInLine);
    let trnsY = Math.floor(index / maxElemInLine) * this.lineHeight;
    return `translate(${trnsX},${trnsY})`;
  }

  getEachLegendLength() {
    return (this.state.lengthSet.max.length + (2 * this.state.padding));
  }

  getMaxLegendInLine(eachLength) {
    return this.props.type === 'horizontal' ? Math.floor(this.props.maxWidth / eachLength) : 1;
  }

  calcElementSpacing() {
    let lengthSet = {
      length: [],
      labelLength: [],
      valueLength: []
    };
    this.state.legendSet.forEach((lSet, index) => {
      lengthSet.length.push(lSet.length = this.ref.node.querySelector(`.legend-${index}.series-legend`).getBBox().width);
      lengthSet.labelLength.push(lSet.labelLength = this.ref.node.querySelector(`.legend-txt-label-${index}`).getComputedTextLength());
      lengthSet.valueLength.push(lSet.valueLength = this.ref.node.querySelector(`.legend-txt-value-${index}`).getComputedTextLength());
    });
    lengthSet.max = {
      length: Math.max(...lengthSet.length),
      labelLength: Math.max(...lengthSet.labelLength),
      valueLength: Math.max(...lengthSet.valueLength)
    };
    return lengthSet;
  }

  getContainerBorderPath() {
    let eachLength = this.getEachLegendLength();
    let maxElemInLine = this.getMaxLegendInLine(eachLength);
    let maxWidth = this.props.type === 'horizontal' ? this.props.maxWidth - this.state.padding : eachLength + this.state.padding;
    let maxHeight = (Math.ceil(this.state.legendSet.length / maxElemInLine) * this.lineHeight) + this.state.padding;
    return Geom.describeRoundedRect(this.state.left, this.state.top, maxWidth, maxHeight, 10).join(" ");
  }

  onClick(e) {
    let index = e.target.classList[0].substring("legend-".length);
    if(this.isToggleType) {
      this.state.legendSet[index].isToggeled = !this.state.legendSet[index].isToggeled;
      this.update(); 
    }
    if(typeof this.props.onLegendClick === 'function'){
      this.props.onLegendClick(index);
    }
  }

  onHover(e) {
    let index = e.target.classList[0].substring("legend-".length);
    if(typeof this.props.onLegendHover === 'function'){
      this.props.onLegendHover(index);
    }
  }

  onLeave(e) {
    let index = e.target.classList[0].substring("legend-".length);
    if(typeof this.props.onLegendLeave === 'function'){
      this.props.onLegendLeave(index);
    }
  }

}

export default LegendBox; 