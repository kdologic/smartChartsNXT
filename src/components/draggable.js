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
      }
    };
    this.padding = 5; 
  }

  render() {
    return (
      <g class='dragger drag-handler-container' style={{cursor: 'move'}}
        events={{
          dblclick: this.onDoubleClick.bind(this)
        }} >
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

     // {this.props.children}  
  
  // doDraggable(targetElemObj) {
  //   this.targetElemObj = targetElemObj;
  //   this.targetElemId = targetElemObj.getAttribute("id") || Math.round(Math.random() * 1000);
  //   this.objDragHandle = this.targetElemObj.querySelector("#drag_handler_container_" + this.targetElemId);
  //   if (this.objDragHandle) {
  //     this.objDragHandle.parentNode.removeChild(this.objDragHandle);
  //   }
  //   let bbox = this.targetElemObj.getBBox();
  //   let strSVG = "";
  //   strSVG += "<g id='drag_handler_container_" + this.targetElemId + "' class='dragger' style='cursor: move;'>";
  //   strSVG += "<rect id='drag_handler_outerbox_" + this.targetElemId + "' class='dragger' x='" + (bbox.x - 5) + "' y='" + (bbox.y - 5) + "' width='" + (bbox.width + 10) + "' height='" + (bbox.height + 10) + "' stroke-dasharray='5, 5' fill='none' pointer-events='all' stroke='#009688' stroke-width='1' opacity='1'></rect>";
  //   strSVG += "</g>";
  //   this.targetElemObj.insertAdjacentHTML("beforeend", strSVG);
  //   this.objDragHandle = this.targetElemObj.querySelector("#drag_handler_container_" + this.targetElemId);
  //   this.bindDragEvents();
  //   this.hideHandler();
  // }

  onDoubleClick(e) {
    e.stopPropagation(); 
    e.preventDefault(); 
    let contBBox = this.ref.node.getBBox(); 

    let hBBox = {
      x: contBBox.x - this.padding, 
      y: contBBox.y - this.padding, 
      width: contBBox.width + (2 * this.padding),
      height: contBBox.height + (2 * this.padding)
    };
    this.setState({showHandler: !this.state.showHandler, hBBox:hBBox});
    console.log(e); 
  }

  

  bindDragEvents() {
    let mouseDownPos;
    let mousePosNow;
    let presentTrnsMatrix;
    this.handleMouseDown = false;
    var timer = 0;
    var delay = 200;
    var prevent = false;

    this.targetElemObj.setAttribute("pointer-events", 'all');
    this.targetElemObj.addEventListener("click", (e) => {
      timer = setTimeout(function () {
        if (!prevent) {
          //do nothing; 
        }
        prevent = false;
      }, delay);
    });

    this.targetElemObj.addEventListener("dblclick", (e) => {
      clearTimeout(timer);
      prevent = true;
      this.showHandler();
    });

    this.objDragHandle.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.hideHandler();
    });

    this.objDragHandle.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.handleMouseDown = true;
      mouseDownPos = {
        x: e.clientX,
        y: e.clientY
      };
      presentTrnsMatrix = transformer.getElementTransformation(this.targetElemObj);
    }, false);

    this.objDragHandle.addEventListener("mousemove", (e) => {
      e.stopPropagation();
      if (this.handleMouseDown) {
        mousePosNow = {
          x: e.clientX,
          y: e.clientY
        };
        let tranMatrix = transformer.getTransformMatrix(
          [
            `translate(${mousePosNow.x - mouseDownPos.x},
                        ${mousePosNow.y - mouseDownPos.y})`
          ], presentTrnsMatrix);
        this.targetElemObj.setAttribute("transform", tranMatrix);
      }
    }, false);

    this.objDragHandle.addEventListener("mouseup", (e) => {
      e.stopPropagation();
      this.handleMouseDown = false;
    }, false);

    this.objDragHandle.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      this.handleMouseDown = false;
    }, false);
  }

  showHandler() {
    this.objDragHandle.style.display = "block";
  }

  hideHandler() {
    this.objDragHandle.style.display = "none";
  }
}

export default Draggable;