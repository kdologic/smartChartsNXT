"use strict";

/**
 * tooltip.js
 * @version:2.0.0
 * @createdOn:17-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create tooltip area for the chart. 
 * 
 * Accepted config --
 * "tooltip": {
      "content": function() {
        return '<table>' +
        '<tr><td><b>'+this.label+'</b> has global usage </td></tr>' +
        '<tr><td> of <b>'+this.value+'% </b>Worldwide.</td></tr>' +
        '</table>';
      },
      "enabled": true, 
      "color": "white",
      "bgColor": "black",
      "fontSize": "14", 
      "fontFamily": "Lato", 
      "xPadding": 10,
      "yPadding": 10,
      "borderColor": "pink",
      "borderWidth": 1,
      "opacity": 0.9
    }
 */

import defaultConfig from "./../settings/config";
import Point from "./../core/point";
import { Component } from "./../viewEngin/pview";
import UiCore from "./../core/ui.core";
import UtilCore from "./../core/util.core";
import SpeechBox from './../components/speechBox'; 
import TransitionGroup from './../viewEngin/transitionGroup'; 
import Style from './../viewEngin/style'; 


/** This components will create tooltip area for the chart. 
 * @extends Component
 */
class Tooltip extends Component {
    constructor(props) {
      super(props);
      let padding = 10;
      this.config = {
        color: this.props.opts.color || defaultConfig.theme.fontColorDark,
        bgColor: this.props.opts.bgColor || defaultConfig.theme.bgColorLight,
        fontSize: this.props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
        fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
        xPadding: Number(this.props.opts.xPadding) || padding,
        yPadding: Number(this.props.opts.yPadding) || padding,
        strokeWidth: this.props.opts.borderWidth || "1",
        opacity:this.props.opts.opacity || "0.9"
      };
      this.state = {
        transformOld: `translate(${this.props.svgWidth/2},${this.props.svgHeight/2})`,
        transformNew: `translate(${this.props.svgWidth/2},${this.props.svgHeight/2})`,
        tooltipContent: '', 
        contentX: this.config.xPadding, 
        contentY: this.config.yPadding, 
        contentWidth: 0,
        contentHeight: 0,
        strokeColor: 'rgb(124, 181, 236)', 
        tooltipPath: '',
        opacity:'0'
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
        <g class='sc-tooltip-container' pointer-events='none'>
          <Style>
          {{
            ".tooltip-transform-enter": {
              transform: this.state.transformOld
            },
            ".tooltip-transform-enter.tooltip-transform-enter-active": {
              transform: this.state.transformNew,
              transition: "transform 0.3s ease-in-out"
            }
          }}
          </Style>
          <TransitionGroup transitionName='tooltip-transform' transitionEnterDelay='300' transitionExitDelay='0'>
            {this.state.opacity && 
              <g instanceId='tooltip-inst' transform={this.state.transformNew.replace(/px/gi,'')}>
                <path class='tooltip-border' filter='url(#tooltip-border-smartcharts-shadow)' 
                  fill={this.config.bgColor} stroke={this.state.strokeColor} d={this.state.tooltipPath} 
                  stroke-width={this.config.strokeWidth} opacity={this.config.opacity}>
                </path>
                <g class='text-tooltip-grp' font-family={this.config.fontFamily} >
                  <foreignObject class='tooltip-content' innerHTML={this.state.tooltipContent} x={this.state.contentX} y={this.state.contentY} width={this.state.contentWidth} height={this.state.contentHeight}>
                  </foreignObject>
                </g>
              </g>
            }
          </TransitionGroup>
          {UiCore.dropShadow('tooltip-border-smartcharts-shadow')}
        </g>
      );
    }

    createTooltipContent(line1, line2) {
      let strContents = "<table style='color:"+this.config.color+";font-size:"+this.config.fontSize+";font-family:"+this.config.fontFamily+";'>";
      strContents += "<tr><td>" + line1 + "</td></tr>";
      if (line2) {
        strContents += "<tr><td><b>" + line2 + "</b></td></tr>";
      }
      strContents += "</table>";
      return strContents; 
    }

    updateTip(originPoint, pointData, line1, line2) {
      let xPadding = this.config.xPadding; 
      let yPadding = this.config.yPadding; 
      let strContents = "";
      let cPoint;
      let delta = 10; 
      let newState = {};

      if(!pointData && !line1 && !line2) {
        return; 
      }

      let strokeColor = this.props.opts.borderColor || (pointData && pointData.color) || this.state.strokeColor;

      if(pointData && this.props.opts && this.props.opts.content) {
        if (typeof this.props.opts.content === 'function') {
          line1 = this.props.opts.content.call(pointData); 
          line2 = 'html'; 
        }else if(typeof this.props.opts.content === 'string'){
          let tooltipContent = this.props.opts.content.replace(/{{/g, "${").replace(/}}/g, "}");
          line1 = UtilCore.assemble(tooltipContent, "point")(pointData);
          line2 = 'html'; 
        }
      }

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

      cPoint.y -= (2*delta);
      let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y - lineHeight - delta - yPadding);
      let width = txtWidth + (2 * xPadding);
      let height = lineHeight + (2 * yPadding);
      let d = [
        "M", 0, 0, //TOP-LEFT CORNER
        "L", width, 0, //LINE TO TOP-RIGHT CORNER
        "L", width, height, //LINE TO BOTTOM-RIGHT CORNER
        "L", (width/2) + delta, height,
        "L", (width/2), height + delta,
        "L", (width/2) - delta, height,
        "L", 0, height, //LINE TO BOTTOM-LEFT CORNER
        "Z"
      ];
      if (topLeft.x + width > this.props.svgWidth) {
        cPoint.x -= (2*delta);
        cPoint.y += (2*delta);
        topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y - lineHeight - delta - yPadding);
        topLeft.x -= (width / 2);
        topLeft.y += (height / 2);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", width, 0, //LINE TO TOP-RIGHT CORNER
          "L", width, (height/2) - delta,
          "L", (width + delta), (height/2),
          "L", width, (height/2) + delta,
          "L", width, height, //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, height, //LINE TO BOTTOM-LEFT CORNER
          "Z"
        ];
      } else if (topLeft.x <= 0) {
        cPoint.x += delta;
        cPoint.y += (2 * delta);
        topLeft = new Point(cPoint.x + (txtWidth / 2) + xPadding + delta, cPoint.y - lineHeight - delta - yPadding);
        topLeft.x -= (width / 2);
        topLeft.y += (height / 2);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", width, 0, //LINE TO TOP-RIGHT CORNER
          "L", width, height, //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, height, // LINE TO BOTTOM-LEFT CORNER
          "L", 0, (height/2) + delta, // LINE TO BEFORE C-POINT BEND
          "L", (-delta), (height/2), // LINE TO C-POINT
          "L", 0, (height/2) - delta, //LINE TO AFTER C-POINT BEND
          "Z"
        ];
      } else if (topLeft.y < 0) {
        cPoint.y += (4*delta);
        topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y);
        d = [
          "M", 0, 0, //TOP-LEFT CORNER
          "L", (width/2) - delta, 0,
          "L", (width/2), (-delta),
          "L", (width/2) + delta, 0,
          "L", width, 0, //LINE TO TOP-RIGHT CORNER
          "L", width, height, //LINE TO BOTTOM-RIGHT CORNER
          "L", 0, height, //LINE TO BOTTOM-LEFT CORNER
          "Z"
        ];
      }

      let textPos = new Point(topLeft.x + 5, topLeft.y + 5);
      newState = {
        tooltipContent: strContents, 
        contentX: textPos.x, 
        contentY: textPos.y, 
        contentWidth: (containBox.width + xPadding),
        contentHeight: (containBox.height + yPadding),
        strokeColor: strokeColor,
        tooltipPath: d.join(' '),
        opacity:1
      };

      if (this.state.transformNew !== `translate(${topLeft.x}px,${topLeft.y}px)`) {
        this.setState({
          transformOld: this.state.transformNew,
          transformNew: `translate(${topLeft.x}px,${topLeft.y}px)`,
          tooltipPath: newState.tooltipPath,
          strokeColor: newState.strokeColor,
          contentWidth: newState.contentWidth,
          contentHeight: newState.contentHeight,
          tooltipContent: newState.tooltipContent,
          opacity: newState.opacity
        });
        this.ref.node.querySelector('.tooltip-content').innerHTML = this.state.tooltipContent;
      }
    }

    show() {
      this.setState({opacity: 1});
    }

    hide() {
      this.setState({opacity: 0, transformOld: '', transformNew: ''});
    }
}

export default Tooltip;