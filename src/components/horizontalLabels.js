/**
 * horizontalLabels.js
 * @version:2.0.0
 * @createdOn:14-Jul-2017
 * @author:SmartChartsNXT
 * @description: This components will create a Horizontal Labels for the chart. 
 */

"use strict";

import defaultConfig from "./../settings/config";
import { Component } from "./../viewEngin/pview";
import Ticks from "./ticks";


class HorizontalLabels extends Component{

  constructor(props) {
    super(props);
    this.config = {
      color: this.props.opts.fillColor || defaultConfig.theme.fontColorDark,
      fontSize: this.props.opts.maxFontSize || defaultConfig.theme.fontSizeMedium,
      fontFamily: this.props.opts.fontFamily || defaultConfig.theme.fontFamily,
      opacity:this.props.opts.opacity || "1"
    };
    this.state = {
      fontSize: this.config.fontSize, 
      labelTransform:false,
      renderCounter:0
    };
    this.intervalThreshold = 30;
  }

  componentWillMount() {
    typeof this.props.onRef === 'function' && this.props.onRef(undefined); 
  }

  componentDidMount() {
    this.state.renderCounter++; 
    //if(this.state.renderCounter < 3 ){
      this.checkLabelsWidth();
    //}
    typeof this.props.onRef === 'function' && this.props.onRef(this); 
  }

  render() {
    this.setIntervalLength();
    return (
      <g class='horizontal-text-labels' transform={`translate(${this.props.posX},${this.props.posY})`}>
        {
          this.getLabels()
        }
        <Ticks posX={0} posY={0} span='6' tickInterval={this.state.intervalLen} tickCount={this.props.categorySet.length-1} type='horizontal'></Ticks>
      </g>
    );
  }

  getLabels() {
    let labels = []; 
    for (let i = 0; i < this.state.categories.length; i++) {
      labels.push(this.getEachLabel(this.state.categories[i], i));
    }
    return labels;
  }

  getEachLabel(val, index) {
    let x = index * this.state.intervalLen; 
    let y = 12; 
    let transform = this.state.labelTransform ? "rotate(-45," + x + "," + y + ")" : ""; 
    return (
      <text font-family={this.config.fontFamily} fill={this.config.color} x={x} y={y} 
        transform={transform} font-size={this.state.fontSize} opacity={this.config.opacity} stroke='none' text-rendering='geometricPrecision' >

        <tspan class={`hlabel-${index}`} labelIndex={index} text-anchor={this.state.labelTransform ? 'end' : 'middle'} dy="0.4em" events={{mouseenter: this.onMouseEnter.bind(this), mouseleave: this.onMouseLeave.bind(this)}}> 
          {(this.props.opts.prefix ? this.props.opts.prefix : "") + val} 
        </tspan>

      </text>
    );
  }

  setIntervalLength() {
    let interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (this.props.categorySet.length - 1);
    this.state.categories = this.props.categorySet;
    if (interval < this.intervalThreshold) {
      let newCategories = [];
      let skipLen = Math.ceil(this.intervalThreshold / interval);
      for (let i = 0; i < this.props.categorySet.length; i += skipLen) {
          newCategories.push(this.props.categorySet[i]);
      }
      
      interval = (this.props.maxWidth - (2 * this.props.paddingX)) / (newCategories.length - 1);
      if((newCategories.length-1) * interval > this.props.maxWidth) {
        newCategories.splice(-1,1);
      }
      this.state.categories = newCategories;
    }
    this.state.intervalLen = interval; 
  }

  checkLabelsWidth() {  
    for(let i=0; i < this.state.categories.length; i++) {
      let textLen = this.ref.node.querySelector('.hlabel-'+ i).getComputedTextLength(); 
      if(textLen > this.intervalThreshold) {
        if(this.state.fontSize > defaultConfig.theme.fontSizeSmall) {
          this.setState({fontSize: this.state.fontSize-1});  
        } else if(!this.state.labelTransform){
          this.setState({labelTransform: true});
        }
        return; 
      }
    }
  }

  onMouseEnter(e) {
    if(typeof this.props.updateTip === 'function') {
      let lblIndex = e.target.classList[0].replace('hlabel-',''); 
      this.props.updateTip(e, (this.props.opts.prefix ? this.props.opts.prefix : "") + this.state.categories[lblIndex]);
    }
  }

  onMouseLeave(e) {
    if(typeof this.props.hideTip === 'function') {
      this.props.hideTip(e);
    }
  }

    // createHorizontalLabel(objChart, targetElem, posX, posY, componentWidth, componentHeight, categories, scaleX) {
    //     let self = this;
    //     this.objChart = objChart;
    //     this.chartSVG = this.objChart.CHART_DATA.chartSVG;
    //     this.targetElem = targetElem; 
    //     this.hLabelContainer = this.chartSVG.querySelector("#" + targetElem);
    //     this.posX = posX;
    //     this.posY = posY;
    //     this.componentWidth = componentWidth;
    //     this.componentHeight = componentHeight;
    //     this.categories = categories;
    //     this.scaleX = scaleX;
       
    //     let interval = scaleX || (componentWidth / categories.length);
    //     /*if there is too much categories then discard some categories*/
    //     if (interval < 30) {
    //         let newCategories = [];
    //         let skipLen = Math.ceil(30 / interval);

    //         for (let i = 0; i < categories.length; i += skipLen) {
    //             newCategories.push(categories[i]);
    //         }
    //         categories = newCategories;
    //         interval *= skipLen;
    //     }
    //     let strText = "<g id='hTextLabel'>";
    //     for (let hText = 0; hText < categories.length; hText++) {
    //         let x = (posX + (hText * interval) + (interval / 2));
    //         let y = (posY + 20);
    //         if (x > (posX + componentWidth)) {
    //             break;
    //         }
    //         strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + x + "' y='" + y + "' >";
    //         strText += "  <tspan  font-size='12' >" + categories[hText] + "<\/tspan>";
    //         strText += "</text>";
    //     }

    //     for (let hText = 0; hText < categories.length; hText++) {
    //         let x = (posX + (hText * interval) + (interval));
    //         let y = (posY);
    //         if (x > (posX + componentWidth)) {
    //             break;
    //         }
    //         let d = ["M", x, y, "L", x, (y + 10)];
    //         strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
    //     }
    //     strText += "</g>";
    //     this.hLabelContainer.innerHTML = strText;
    //     this.adjustTextPositions();
    //     this.bindEvents(); 
    // }

    // /*Adjust horzontal text label size*/
    // adjustTextPositions() {
    //     let totalHTextWidth = 0;
    //     let arrHText = this.hLabelContainer.querySelectorAll("#hTextLabel text");
    //     for (let i = 0; i < arrHText.length; i++) {
    //         let txWidth = arrHText[i].getComputedTextLength();
    //         totalHTextWidth += (txWidth);
    //     }
    //     let interval = this.componentWidth / this.categories.length;
    //     if (parseFloat(totalHTextWidth + (arrHText.length * 10)) > parseFloat(this.componentWidth)) {
    //         for (let i = 0; i < arrHText.length; i++) {
    //             let cx = arrHText[i].getAttribute("x");
    //             let cy = arrHText[i].getAttribute("y");

    //             let txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
    //             arrHText[i].setAttribute("transform", "translate(-" + interval / 2 + "," + (10) + ")rotate(-45," + (cx) + "," + (cy) + ")");

    //             if (txWidth + 15 > this.componentHeight) {
    //                 let fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
    //                 if (fontSize > 9) {
    //                     arrHText.forEach((elem) => {
    //                         elem.querySelector("tspan").setAttribute("font-size", (fontSize - 1));
    //                     });
    //                 }
    //                 txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
    //             }
    //             while (txWidth + 15 > this.componentHeight) {
    //                 arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0, (arrHText[i].querySelector("tspan").textContent.length - 4)) + "...";
    //                 txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
    //             }
    //         }
    //     }
    // }

    // bindEvents() {
    //     /*bind hover event*/
    //     let self = this; 
    //     let hTextLabels = this.hLabelContainer.querySelectorAll("#hTextLabel text");

    //     for (let i = 0; i < hTextLabels.length; i++) {
    //         hTextLabels[i].addEventListener("mouseenter",  (e) =>{
    //             e.stopPropagation();
    //             //fire Event Hover
    //             let onHoverEvent = new Event("onHTextLabelHover", {
    //                 srcElement: self.chartSVG,
    //                 originEvent: e
    //             });
    //             this.objChart.event.dispatchEvent(onHoverEvent);
    //         }, false);

    //         hTextLabels[i].addEventListener("mouseleave", (e) => {
    //             e.stopPropagation();
    //             //fire Event mouseLeave
    //             let onMouseLeaveEvent = new Event("onHTextLabelMouseLeave", {
    //                 srcElement: self.chartSVG,
    //                 originEvent: e
    //             });
    //             this.objChart.event.dispatchEvent(onMouseLeaveEvent);
    //         }, false);
    //     }
    // }
}

export default HorizontalLabels;