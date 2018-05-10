/**
 * draggable.js
 * @version:2.0.0
 * @createdOn:31-Aug-2017
 * @author:SmartChartsNXT
 * @description: This class will make components draggable.
 * To drag a component just double click on it then the component will be showed as selected then we can drag it 
 * to fix that position jus double click again on the component. Touch device also supported, to drag long press to 
 * select that element then you can drag it. 
 */

"use strict";

import transformer from "./../core/transformer";
import { Component } from "./../viewEngin/pview";
import UiCore from './../core/ui.core';

class Draggable extends Component{
  constructor(props) {
    super(props);
    this.overlappingColor = '#ff1201';
    this.nonOverlappingColor = '#009688';
    this.overlappingFill = '#f443361a';
    this.nonOverlappingFill = 'none';
    this.state = {
      showHandler: false,
      hBBox: {
        x: 0, 
        y: 0, 
        width: 0, 
        height: 0
      }, 
      tranMatrix: transformer.getTransformMatrix(),
      handlerRectPE: 'all', 
      draggerPanePE: 'none',
      handlerStrokeColor: this.nonOverlappingColor,
      handlerFill: this.nonOverlappingFill,
      overlapping: false
    };
    this.padding = 5; 
    this.handleMouseDown = false; 
    this.mouseDrag = false; 
    this.timer = 0; 
    this.prevent = false; 
    this.presentTrnsMatrix = null; 
    this.touchDelay = 500;
    this.initialIntersectElems = null;
    this.initialSvgWidth = this.context.svgWidth; 
    this.initialSvgHeight = this.context.svgHeight;
  }

  componentDidMount() {
    this.rootSVG = document.getElementById(this.context.rootSvgId);
    if (this.initialIntersectElems && this.mouseDrag) {
      let intersectedElemsNow = this.getIntersectedElems();
      
      this.overlapping = this.isIntersected(this.initialIntersectElems, intersectedElemsNow);
      if (this.overlapping && this.state.handlerStrokeColor !== this.overlappingColor) {
        this.setState({ overlapping: true, handlerStrokeColor: this.overlappingColor, handlerFill: this.overlappingFill });
      } else if (!this.overlapping && this.state.handlerStrokeColor !== this.nonOverlappingColor) {
        this.setState({ overlapping: false, handlerStrokeColor: this.nonOverlappingColor, handlerFill: this.nonOverlappingFill });
      }
    }
  }

  render() {
    if(Math.abs(this.context.svgWidth - this.initialSvgWidth) > 0) {
      this.initialSvgWidth = this.context.svgWidth; 
      this.state.showHandler = false; 
    }
    return (
      <g class='dragger drag-handler-container' events={this.getHandlerEventMap()} transform={this.state.tranMatrix} style={{cursor: this.state.showHandler ?'move':'default'}}>
        <g clsss='dragger drag-innter-child-container'>
          {this.props.extChildren}
        </g>
        {this.state.showHandler &&
          <rect class='dragger drag-handler-outerbox' 
            x={this.state.hBBox.x} y={this.state.hBBox.y} width={this.state.hBBox.width} height={this.state.hBBox.height} 
            stroke-dasharray='5, 5' fill={this.state.handlerFill} pointer-events={this.state.handlerRectPE} stroke={this.state.handlerStrokeColor} stroke-width='1' opacity='1'
          />
        }
      </g>
    );
  }

  getIntersectedElems() {
    let dragHandler = this.ref.node.querySelector('.dragger.drag-handler-outerbox');
    if (dragHandler) {
      let dragHandlerBBox = dragHandler.getBoundingClientRect();
      let irect = this.rootSVG.createSVGRect();
      irect.x = dragHandlerBBox.x - 6;
      irect.y = dragHandlerBBox.y - 6;
      irect.width = dragHandlerBBox.width;
      irect.height = dragHandlerBBox.height;
      return this.rootSVG.getIntersectionList(irect, null);
    }
  }

  isIntersected(prevNodeList, currNodeList) {
    if (currNodeList.length > prevNodeList.length) {
      return true;
    } else {
      for (let n1 = 0; n1 < currNodeList.length; n1++) {
        let isEQ = false;
        for (let n2 = 0; n2 < prevNodeList.length; n2++) {
          if (currNodeList[n1].isEqualNode(prevNodeList[n2])) {
            isEQ = true;
            break;
          }
        }
        if (!isEQ) {
          return true;
        }
      }
      return false;
    }
  }

  onTouchStart(e) {
    if(this.state.showHandler) {
      this.onMouseDownHandler(e);
    }else {
      this.timer = setTimeout(this.onDoubleClick.bind(this, e), this.touchDelay);
    }
  }

  onTouchEnd(e) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onClickHandler(e) {
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
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.prevent = true;
    let contBBox = this.ref.node.getBBox();

    let hBBox = {
      x: contBBox.x - this.padding,
      y: contBBox.y - this.padding,
      width: contBBox.width + (2 * this.padding),
      height: contBBox.height + (2 * this.padding)
    };
    this.setState({ showHandler: !this.state.showHandler, hBBox: hBBox });
    if(UiCore.isTouchDevice()) {
      this.onMouseDownHandler(e);
    }
  }

  initiateDragPane() {
    this.rootSVG.insertAdjacentHTML("beforeend", `<rect class='dragger drag-pane' 
      x=${0} y=${0} width=${this.context.svgWidth} height=${this.context.svgHeight} 
      stroke-dasharray='5, 5' fill='none' pointer-events='${this.state.draggerPanePE}' stroke='#009688' stroke-width='1' opacity='1'/>`);
    this.dragPane = this.rootSVG.querySelector('.dragger.drag-pane');
    this.dragPane.addEventListener('mousemove', this.onMouseMoveDragPane.bind(this));
    this.dragPane.addEventListener('mouseup', this.onMouseUpDragPane.bind(this));
    this.dragPane.addEventListener('touchmove', this.onMouseMoveDragPane.bind(this));
    this.dragPane.addEventListener('touchend', this.onMouseUpDragPane.bind(this));
  }

  destroyDragPane() {
    if (this.dragPane) {
      this.rootSVG.removeChild(this.dragPane);
    }
  }

  onMouseDownHandler(e) {
    this.handleMouseDown = true;
    this.mouseDownPos = {
      x: e.clientX || e.touches[0].clientX,
      y: e.clientY || e.touches[0].clientY
    };
    this.presentTrnsMatrix = transformer.convertTransformMatrix(this.state.tranMatrix);
    if (this.state.showHandler) {
      this.setState({ handlerRectPE: 'none', draggerPanePE: 'all' });
      this.initiateDragPane();
      this.initialIntersectElems = this.getIntersectedElems();
    }
  }

  onMouseMoveDragPane(e) {
    e.stopPropagation();
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.handleMouseDown) {
      this.mouseDrag = true;
      this.mousePosNow = {
        x: e.clientX || e.touches[0].clientX,
        y: e.clientY || e.touches[0].clientY
      };
      let tranMatrix = transformer.getTransformMatrix([
        `translate(${this.mousePosNow.x - this.mouseDownPos.x}, ${this.mousePosNow.y - this.mouseDownPos.y})`
      ], this.presentTrnsMatrix);
      this.setState({ tranMatrix });
    }
  }

  onMouseUpDragPane(e) {
    this.handleMouseDown = false;
    this.mouseDrag = false;
    this.setState({ handlerRectPE: 'all', draggerPanePE: 'none' });
    this.destroyDragPane();
    let stateNow = { showHandler: false, handlerStrokeColor: this.nonOverlappingColor, handlerFill: this.nonOverlappingFill };
    if (this.overlapping) {
      let tranMatrix = transformer.getTransformMatrix([], this.presentTrnsMatrix);
      stateNow.tranMatrix = tranMatrix;
    }
    this.setState(stateNow);
  }

  getHandlerEventMap() {
    let evtList = {
      dblclick: this.onDoubleClick.bind(this),
      touchstart: this.onTouchStart.bind(this), 
      touchend: this.onTouchEnd.bind(this)
    }; 
    return this.state.showHandler ? Object.assign(evtList, {
      click: this.onClickHandler.bind(this),
      mousedown: this.onMouseDownHandler.bind(this) 
    }) : evtList;
  }
}

export default Draggable;