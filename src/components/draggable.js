/*
 * draggable.js
 * @Version:1.0.0
 * @CreatedOn:31-Aug-2017
 * @Author:SmartChartsNXT
 * @Description: This class will make components draggable.
 * To drag a component just double click on it then the component will be showed as selected then we can drag it 
 * to fix that position jus double click again on the component. 
 */

"use strict";

import transformer from "./../core/transformer";
import { Component } from "./../viewEngin/pview";

class Draggable extends Component{
  constructor(props) {
    super(props);
    this.state = {
      showHandler: false,
      hBBox: {
        x: 0, 
        y: 0, 
        width: 0, 
        height: 0
      }, 
      tranMatrix: transformer.getTransformMatrix()
    };
    this.padding = 5; 
    this.handleMouseDown = false; 
    this.timer = 0; 
    this.prevent = false; 
    this.presentTrnsMatrix = null; 

    console.log("inside initialize");
  }

  render() {
    return (
      <g class='dragger drag-handler-container' transform={this.state.tranMatrix} style={{cursor: 'move'}}
        events={this.getHandlerEventMap()} >
      {
        this.state.showHandler ? 
        <rect class='dragger drag-handler-outerbox' 
          x={this.state.hBBox.x} y={this.state.hBBox.y} width={this.state.hBBox.width} height={this.state.hBBox.height} 
          stroke-dasharray='5, 5' fill='none' pointer-events='all' stroke='#009688' stroke-width='1' opacity='1'>
        </rect>
        : null
      }
      </g>
    );
  }

  onClick(e) {
    let delay = 200; 
    this.timer = setTimeout(function () {
      if (!this.prevent) {
        //do nothing; 
      }
      this.prevent = false;
    }, delay);
  }

  onDoubleClick(e) {
    e.stopPropagation(); 
    e.preventDefault(); 
    clearTimeout(this.timer);
    this.prevent = true;
    let contBBox = this.ref.node.getBBox(); 

    let hBBox = {
      x: contBBox.x - this.padding, 
      y: contBBox.y - this.padding, 
      width: contBBox.width + (2 * this.padding),
      height: contBBox.height + (2 * this.padding)
    };
    this.setState({showHandler: !this.state.showHandler, hBBox:hBBox});
  }

  onMouseDown(e) {
    e.stopPropagation();
    this.handleMouseDown = true;
    this.mouseDownPos = {
      x: e.clientX,
      y: e.clientY
    };
    this.presentTrnsMatrix = transformer.convertTransformMatrix(this.state.tranMatrix);
  }

  onMouseMove(e) {
    e.stopPropagation();
    if (this.handleMouseDown) {
      this.mousePosNow = {
        x: e.clientX,
        y: e.clientY
      };
      let tranMatrix = transformer.getTransformMatrix([
        `translate(${this.mousePosNow.x - this.mouseDownPos.x}, ${this.mousePosNow.y - this.mouseDownPos.y})`
      ], this.presentTrnsMatrix);
      this.setState({tranMatrix});
    }
  }

  onMouseUp(e) {
    this.handleMouseDown = false;
  }

  getHandlerEventMap() {
    let evtList = {dblclick: this.onDoubleClick.bind(this)}; 
    return this.state.showHandler ? Object.assign(evtList, {
      click: this.onClick.bind(this),
      mousedown: this.onMouseDown.bind(this), 
      mousemove: this.onMouseMove.bind(this), 
      mouseup: this.onMouseUp.bind(this),
      mouseleave: this.onMouseUp.bind(this)
    }) : evtList;
  }
}

export default Draggable;