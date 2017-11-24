/**
 * tooltip.js
 * @version:1.1.0
 * @createdOn:17-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will tooltip area for the chart. 
 */

"use strict";

import Point from "./../core/point";
import { Component } from "./../viewEngin/pview";
import UiCore from "./../core/ui.core";

class Tooltip extends Component {
    constructor(props) {
      super(props);
      this.padding = 10;
      this.state = {
        tooltipContent: '', 
        contentX: this.padding, 
        contentY: this.padding, 
        contentWidth: 0,
        contentHeight: 0,
        strokeColor: 'rgb(124, 181, 236)', 
        tooltipPath: '',
        display:'block'
      };
    }

    componentWillMount() {
      typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
    }
    componentDidMount() {
      typeof this.props.onRef === 'function' && this.props.onRef(this); 
    }

    render() {
      return (
        <g class='tooltip-container' pointer-events='none' 
          transform={`translate(${this.props.offsetWidth/2},${this.props.offsetHeight/2})`} 
          style={{display: this.state.display, 'transition': 'all 0.2s linear'}} >
          <path class='tooltip-border' filter='url(#tooltip-border-smartcharts-shadow)' 
            fill='white' stroke={this.state.strokeColor} d={this.state.tooltipPath} 
            stroke-width='1' opacity='0.9'>
          </path>
          <g class='text-tooltip-grp' fill='#717171' font-family='Lato' >
            <foreignObject class='tooltip-content' x={this.state.contentX} y={this.state.contentY} width={this.state.contentWidth} height={this.state.contentHeight}>
            </foreignObject>
          </g>
          {UiCore.dropShadow('tooltip-border-smartcharts-shadow')}
        </g>
      );
    }

    createTooltipContent(line1, line2) {
      let strContents = "<table>";
      strContents += "<tr><td>" + line1 + "</td></tr>";
      if (line2) {
        strContents += "<tr><td><b>" + line2 + "</b></td></tr>";
      }
      strContents += "</table>";
      return strContents; 
    }

    updateTip(originPoint, strokeColor, line1, line2) {
      let padding = 10;
      let strContents = "";
      let cPoint;
      let newState = {};

      /*Prevent call-by-sharing*/
      if (originPoint) {
        cPoint = new Point(originPoint.x, originPoint.y);
      }
     
      strContents = line2 === 'html' ? line1 : this.createTooltipContent(line1, line2);
      let temp = document.createElement("div");
      temp.innerHTML = strContents;
      temp.style.display = "inline-block";
      temp.style.visibility = 'hidden';
      document.getElementsByTagName("body")[0].appendChild(temp);
      let containBox = {
        width: temp.offsetWidth + 8,
        height: temp.offsetHeight + 5
      };
      temp && temp.parentNode.removeChild(temp);
     
      let txtWidth = containBox.width;
      let lineHeight = containBox.height;

      cPoint.y -= 20;
      let topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - lineHeight - 10 - padding);
      let width = txtWidth + (2 * padding);
      let height = lineHeight + (2 * padding);
      let d = [
        "M", 0, 0, //TOP-LEFT CORNER
        "L", (width), 0, //LINE TO TOP-RIGHT CORNER
        "L", (width), (height), //LINE TO BOTTOM-RIGHT CORNER
        "L", (width/2) + 10, height,
        "L", (width/2), height + 10,
        "L", (width/2) - 10, height,
        "L", (0), (height), //LINE TO BOTTOM-LEFT CORNER
        "Z"
      ];
      if (topLeft.x + width > this.props.offsetWidth) {
        cPoint.x -= 20;
        cPoint.y += 20;
        topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - (lineHeight) - 10 - (padding));
        topLeft.x -= (width / 2);
        topLeft.y += (height / 2);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", (width), 0, //LINE TO TOP-RIGHT CORNER
          "L", (width), (height/2) - 10,
          "L", (width + 10), (height/2),
          "L", (width), (height/2) + 10,
          "L", (width), (height), //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, (height), //LINE TO BOTTOM-LEFT CORNER
          "Z"
        ];
      } else if (topLeft.x <= 0) {
        cPoint.x += 10;
        cPoint.y += 20;
        topLeft = new Point(cPoint.x + (txtWidth / 2) + padding + 10, cPoint.y - (lineHeight) - 10 - (padding));
        topLeft.x -= (width / 2);
        topLeft.y += (height / 2);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", (width), 0, //LINE TO TOP-RIGHT CORNER
          "L", (width), (height), //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, (height), // LINE TO BOTTOM-LEFT CORNER
          "L", 0, (height/2) + 10, // LINE TO BEFORE C-POINT BEND
          "L", -10, (height/2), // LINE TO C-POINT
          "L", 0, (height/2) - 10, //LINE TO AFTER C-POINT BEND
          "Z"
        ];
      } else if (topLeft.y < 0) {
        cPoint.y += 40;
        topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", (width/2) - 10, 0,
          "L", (width/2), -10,
          "L", (width/2) + 10, 0,
          "L", (width), 0, //LINE TO TOP-RIGHT CORNER
          "L", (width), (height), //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, (height), //LINE TO BOTTOM-LEFT CORNER
          "Z"
        ];
      }

      let textPos = new Point(topLeft.x + 5, topLeft.y + 5);
      newState = {
        tooltipContent: strContents, 
        contentX: textPos.x, 
        contentY: textPos.y, 
        contentWidth: containBox.width + padding,
        contentHeight: containBox.height + padding,
        strokeColor: strokeColor || this.state.strokeColor,
        tooltipPath: d.join(' '),
        display:'block'
      };

      
      let tipContent = this.ref.node.querySelector('.tooltip-content');
      tipContent.innerHTML = newState.tooltipContent;
      tipContent.setAttribute('width', newState.contentWidth); 
      tipContent.setAttribute('height', newState.contentHeight); 

      let tipBorder = this.ref.node.querySelector('.tooltip-border');
      tipBorder.setAttribute('stroke', newState.strokeColor); 
      tipBorder.setAttribute('d', newState.tooltipPath); 
      this.ref.node.setAttribute('transform',`translate(${topLeft.x},${topLeft.y})`);
      this.show(); 
    }

    show() {
      this.ref.node.style.display = 'block';
    }

    hide() {
      this.ref.node.style.display = 'none';
    }
}

export default Tooltip;