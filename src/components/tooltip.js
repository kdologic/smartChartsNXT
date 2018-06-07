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


/** 
 * This components will create tooltip area for the chart. 
 * @extends Component
 */

class Tooltip extends Component {
    constructor(props) {
      super(props);
      let padding = 0;
      this.config = {
        color: this.props.opts.color || defaultConfig.theme.fontColorDark,
        bgColor: this.props.opts.bgColor || defaultConfig.theme.bgColorLight,
        fontSize: this.props.opts.fontSize || defaultConfig.theme.fontSizeMedium,
        fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
        xPadding: Number(this.props.opts.xPadding) || padding,
        yPadding: Number(this.props.opts.yPadding) || padding,
        strokeWidth: this.props.opts.borderWidth || "2",
        opacity:this.props.opts.opacity || "0.9"
      };
      this.state = {
        cPoint: new Point(0,0),
        topLeft: new Point(0,0),
        transformOld: `translate(${this.props.svgWidth/2},${this.props.svgHeight/2})`,
        transformNew: `translate(${this.props.svgWidth/2},${this.props.svgHeight/2})`,
        tooltipContent: '', 
        contentX: this.config.xPadding, 
        contentY: this.config.yPadding, 
        contentWidth: 0,
        contentHeight: 0,
        strokeColor: 'rgb(124, 181, 236)', 
        opacity: 0
      };
    }

    componentWillMount() {
      typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
    }
    
    componentDidMount() {
      typeof this.props.onRef === 'function' && this.props.onRef(this);
      let node = this.ref.node.querySelector('.tooltip-content') ;  
      node && (node.innerHTML = this.state.tooltipContent);
    }

    render() {
      if(this.props.opts.enable === false) {
        return <tooltip-disabled></tooltip-disabled>;
      }
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
                <SpeechBox x={0} y={0} width={this.state.contentWidth} height={this.state.contentHeight} cpoint={this.state.cPoint }
                  bgColor={this.config.bgColor} opacity={this.config.opacity} shadow={true} strokeColor={this.state.strokeColor} strokeWidth={this.config.strokeWidth} > 
                </SpeechBox> 
                <g class='text-tooltip-grp' font-family={this.config.fontFamily} >
                  <foreignObject class='tooltip-content' innerHTML={this.state.tooltipContent} x={this.state.contentX} y={this.state.contentY} width={this.state.contentWidth} height={this.state.contentHeight}>
                  </foreignObject>
                </g>
              </g>
            }
          </TransitionGroup>
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

    updateTip(originPoint, pointData, line1, line2, preAlign = 'top') {
      let xPadding = this.config.xPadding; 
      let yPadding = this.config.yPadding; 
      let strContents = "";
      let delta = 10; // is anchor height
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
      let width = txtWidth + (2 * xPadding);
      let height = lineHeight + (2 * yPadding);
      let { topLeft, cPoint } = this.reAlign(preAlign, originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, 0);
      let textPos = new Point(topLeft.x, topLeft.y);
      
      newState = {
        tooltipContent: strContents, 
        contentX: textPos.x, 
        contentY: textPos.y, 
        contentWidth: (containBox.width + xPadding),
        contentHeight: (containBox.height + yPadding),
        strokeColor: strokeColor,
        opacity:1
      };

      if (this.state.transformNew !== `translate(${topLeft.x}px,${topLeft.y}px)`) {
        this.setState({
          topLeft,
          cPoint : new Point(cPoint.x - topLeft.x, cPoint.y - topLeft.y),
          transformOld: this.state.transformNew,
          transformNew: `translate(${topLeft.x}px,${topLeft.y}px)`,
          strokeColor: newState.strokeColor,
          contentWidth: newState.contentWidth,
          contentHeight: newState.contentHeight,
          tooltipContent: newState.tooltipContent,
          opacity: newState.opacity
        });
      }
    }

    reAlign(alignment, originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, loopCount) {
      let topLeft, cPoint, enumAlign = ['left', 'right','top', 'bottom']; 
      switch (alignment) {
        case 'left':
          ({ topLeft, cPoint } = this.alignLeft(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
          break;
        case 'right':
          ({ topLeft, cPoint } = this.alignRight(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
          break;
        case 'top':
          ({ topLeft, cPoint } = this.alignTop(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
          break;
        case 'bottom':
          ({ topLeft, cPoint } = this.alignBottom(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta));
          break;
      }
      if(loopCount < 4 && (topLeft.x < 0 || topLeft.x > this.props.svgWidth || topLeft.y < 0 || topLeft.y > this.props.svgHeight)) {
        return this.reAlign(enumAlign[(enumAlign.indexOf(alignment) + 1) % 4], originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta, loopCount+1);
      }
      return { topLeft, cPoint }; 
    }

    alignLeft(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
      let cPoint = new Point(originPoint.x, originPoint.y);
      let topLeft = new Point(cPoint.x - (txtWidth / 2) - delta - xPadding, cPoint.y - lineHeight - yPadding);
      topLeft.x -= (width / 2);
      topLeft.y += (height / 2);
      return {topLeft, cPoint}; 
    }

    alignRight(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
      let cPoint = new Point(originPoint.x, originPoint.y);
      let topLeft = new Point(cPoint.x + (txtWidth / 2) + xPadding + delta, cPoint.y - lineHeight - yPadding);
      topLeft.x -= (width / 2);
      topLeft.y += (height / 2);
      return {topLeft, cPoint}; 
    }

    alignTop(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
      let cPoint = new Point(originPoint.x, originPoint.y);
      let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y - lineHeight - delta - yPadding);
      return {topLeft, cPoint}; 
    }

    alignBottom(originPoint, xPadding, yPadding, width, height, txtWidth, lineHeight, delta) {
      let cPoint = new Point(originPoint.x, originPoint.y);
      let topLeft = new Point(cPoint.x - (txtWidth / 2) - xPadding, cPoint.y + delta);
      return {topLeft, cPoint}; 
    }

    show() {
      this.setState({opacity: 1});
    }

    hide() {
      this.setState({opacity: 0, transformOld: '', transformNew: ''});
    }
}

export default Tooltip;