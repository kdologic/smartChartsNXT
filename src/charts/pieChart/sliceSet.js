"use strict";

/**
 * sliceSet.js
 * @createdOn: 01-Nov-2017
 * @author: SmartChartsNXT
 * @version: 1.0.0
 * @description:This is a parent class of slice class which create all the slices. 
 */

import defaultConfig from "./../../settings/config";
import Point from "./../../core/point";
import {Component} from "./../../viewEngin/pview";
import UiCore from './../../core/ui.core'; 
import Slice from "./slice"; 

class SliceSet extends Component {
  constructor(props) {
    super(props);
    let self = this; 
    this.state = {
      startAngle:0,
      endAngle:0,
      textFontSize: defaultConfig.theme.fontSizeMedium,
      showSliceMarker: true,
      hideMarkerText: false, 
      animPercent: null
    };
    this.slices = {};
    this.global = {
      mouseDownPos: {},
      set mouseDown(v) {
        this._mouseDown = v; 
      },
      get mouseDown() {
        return this._mouseDown; 
      },
      set mouseDrag(v) {
        this._mouseDrag = v; 
        let slicePlane = self.ref.node.getElementsByClassName('slice-rotation-plane')[0]; 
        slicePlane.style.display = (v ? 'block':'none');
      },
      get mouseDrag() {
        return this._mouseDrag; 
      }
    };
    this.renderCounter = 0; 
  }

  componentWillMount() {
    this.state.startAngle = 0; 
    this.state.endAngle = 0;
    this.state.showSliceMarker = true;  
  }

  componentDidMount() {
    this.renderCounter++; 
    let sliceSetBBox = this.ref.node.getBBox(); 
    if(sliceSetBBox.width > this.props.areaWidth) {
      switch(this.renderCounter) {
        case 1: this.setState({textFontSize: defaultConfig.theme.fontSizeSmall}); break; 
        case 2: this.setState({hideMarkerText: true}); break;
        case 3: this.setState({showSliceMarker: false}); break; 
      }
    } else if(this.props.animated) {
      if(this.state.animPercent === null) {
        this.state.animPercent = 0; 
      }
      if(this.state.animPercent <= 100){
        this.doAnimation(); 
      }
    } 
  }

  render() {
    return (
      <g class='slice-set'>
        {this.createSlices()}
         <rect class='slice-rotation-plane' x={this.props.cx-(this.props.areaWidth/2)} y={this.props.cy-(this.props.areaHeight/2)} 
          width={this.props.areaWidth} height={this.props.areaHeight} strokeColor='black' strokeWidth='1' fill='none' opacity='0.1' style={{display : 'none', 'pointer-events':'all'}}
          events={{
            touchstart: this.onMouseDown.bind(this),
            mouseup: this.onMouseUp.bind(this), mousemove: this.onMouseMove.bind(this),
            touchend: this.onMouseUp.bind(this), touchmove: this.onMouseMove.bind(this)
          }}>
        </rect> 
      </g>
    );
  }

  createSlices() {
    return this.props.dataSet.map((data, i) =>{
      let percent = Math.min(this.state.animPercent || data.percent, data.percent);
      this.state.startAngle = this.state.endAngle; 
      this.state.endAngle += (percent * 3.6);
      return (
        <Slice index={i} rootNodeId={this.props.rootNodeId}
          toggleEnabled={this.props.dataSet.length > 0 ? true : false} cx ={this.props.cx} cy={this.props.cy} 
          width={this.props.width} height={this.props.height} innerWidth={this.props.innerWidth} innerHeight={this.props.innerHeight}
          offsetWidth={this.props.offsetWidth} offsetHeight={this.props.offsetHeight}
          data={data} startAngle={this.state.startAngle} endAngle={this.state.endAngle} strokeColor={this.props.strokeColor} 
          strokeWidth={this.props.strokeWidth} rotateChart={this.rotateChart.bind(this)} slicedOut={data.slicedOut} fontSize={this.state.textFontSize}
          gradient={this.props.gradient}  updateTip={this.props.updateTip} hideTip={this.props.hideTip} 
          onRef={ref => this.slices["s"+i] = ref} parentCtx={this.global} showSliceMarker={this.state.showSliceMarker} hideMarkerText={this.state.hideMarkerText}
        />
      );
    });
  }

  onMouseDown(e) {
    this.global.mouseDown = true; 
  }

  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault(); 
    this.global.mouseDown = false; 
    this.global.mouseDrag = false; 
  }

  onMouseMove(e) {
    if (this.props.dataSet.length === 0) {
      return;
    }
    let pos = {clientX : e.clientX || e.touches[0].clientX, clientY : e.clientY || e.touches[0].clientY };
    if (this.global.mouseDown === true && (this.global.mouseDownPos.x !== pos.clientX && this.global.mouseDownPos.y !== pos.clientY)) {
      let dragStartPoint = UiCore.cursorPoint(this.props.rootNodeId, pos);
      let dragAngle = this.getAngle(new Point(this.props.cx, this.props.cy), dragStartPoint);

      if (dragAngle > this.dragStartAngle) {
        this.rotateChart(2);
      } else {
        this.rotateChart(-2);
      }
      this.dragStartAngle = dragAngle;
      this.props.hideTip();
    } 
  }

  rotateChart(rotationIndex) {
    Object.keys(this.slices).forEach((key) => {
      this.slices[key].rotateSlice(rotationIndex); 
    });
  } 

  doAnimation() {
    setTimeout(() => {
      this.setState({animPercent:this.state.animPercent + 4});
    }, 50);
  }

  getAngle(point1, point2) {
    let deltaX = point2.x - point1.x;
    let deltaY = point2.y - point1.y;
    let rad = Math.atan2(deltaY, deltaX);
    let deg = rad * 180.0 / Math.PI;
    deg = (deg < 0) ? deg + 450 : deg + 90;
    return deg % 360;
  }
  
}

export default SliceSet; 