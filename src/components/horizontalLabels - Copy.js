/*
 * horizontalLabels.js
 * @Version:1.0.0
 * @CreatedOn:14-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a Horizontal Labels for the chart. 
 */

"use strict";

let Event = require("./../core/event");

class HorizontalLabels {

    constructor() {}

    createHorizontalLabel(objChart, targetElem, posX, posY, componentWidth, componentHeight, categories, scaleX) {
        let self = this;
        this.objChart = objChart;
        this.chartSVG = this.objChart.CHART_DATA.chartSVG;
        this.targetElem = targetElem; 
        this.hLabelContainer = this.chartSVG.querySelector("#" + targetElem);
        this.posX = posX;
        this.posY = posY;
        this.componentWidth = componentWidth;
        this.componentHeight = componentHeight;
        this.categories = categories;
        this.scaleX = scaleX;
       
        let interval = scaleX || (componentWidth / categories.length);
        /*if there is too much categories then discard some categories*/
        if (interval < 30) {
            let newCategories = [];
            let skipLen = Math.ceil(30 / interval);

            for (let i = 0; i < categories.length; i += skipLen) {
                newCategories.push(categories[i]);
            }
            categories = newCategories;
            interval *= skipLen;
        }
        let strText = "<g id='hTextLabel'>";
        for (let hText = 0; hText < categories.length; hText++) {
            let x = (posX + (hText * interval) + (interval / 2));
            let y = (posY + 20);
            if (x > (posX + componentWidth)) {
                break;
            }
            strText += "<text font-family='Lato' text-anchor='middle' dominant-baseline='central' fill='black' title='" + categories[hText] + "' x='" + x + "' y='" + y + "' >";
            strText += "  <tspan  font-size='12' >" + categories[hText] + "<\/tspan>";
            strText += "</text>";
        }

        for (let hText = 0; hText < categories.length; hText++) {
            let x = (posX + (hText * interval) + (interval));
            let y = (posY);
            if (x > (posX + componentWidth)) {
                break;
            }
            let d = ["M", x, y, "L", x, (y + 10)];
            strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
        }
        strText += "</g>";
        this.hLabelContainer.innerHTML = strText;
        this.adjustTextPositions();
        this.bindEvents(); 
    }

    /*Adjust horzontal text label size*/
    adjustTextPositions() {
        let totalHTextWidth = 0;
        let arrHText = this.hLabelContainer.querySelectorAll("#hTextLabel text");
        for (let i = 0; i < arrHText.length; i++) {
            let txWidth = arrHText[i].getComputedTextLength();
            totalHTextWidth += (txWidth);
        }
        let interval = this.componentWidth / this.categories.length;
        if (parseFloat(totalHTextWidth + (arrHText.length * 10)) > parseFloat(this.componentWidth)) {
            for (let i = 0; i < arrHText.length; i++) {
                let cx = arrHText[i].getAttribute("x");
                let cy = arrHText[i].getAttribute("y");

                let txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
                arrHText[i].setAttribute("transform", "translate(-" + interval / 2 + "," + (10) + ")rotate(-45," + (cx) + "," + (cy) + ")");

                if (txWidth + 15 > this.componentHeight) {
                    let fontSize = arrHText[i].querySelector("tspan").getAttribute("font-size");
                    if (fontSize > 9) {
                        arrHText.forEach((elem) => {
                            elem.querySelector("tspan").setAttribute("font-size", (fontSize - 1));
                        });
                    }
                    txWidth = arrHText[i].querySelector("tspan").getComputedTextLength();
                }
                while (txWidth + 15 > this.componentHeight) {
                    arrHText[i].querySelector("tspan").textContent = arrHText[i].querySelector("tspan").textContent.substring(0, (arrHText[i].querySelector("tspan").textContent.length - 4)) + "...";
                    txWidth = (arrHText[i].querySelector("tspan").getComputedTextLength());
                }
            }
        }
    }

    bindEvents() {
        /*bind hover event*/
        let self = this; 
        let hTextLabels = this.hLabelContainer.querySelectorAll("#hTextLabel text");

        for (let i = 0; i < hTextLabels.length; i++) {
            hTextLabels[i].addEventListener("mouseenter",  (e) =>{
                e.stopPropagation();
                //fire Event Hover
                let onHoverEvent = new Event("onHTextLabelHover", {
                    srcElement: self.chartSVG,
                    originEvent: e
                });
                this.objChart.event.dispatchEvent(onHoverEvent);
            }, false);

            hTextLabels[i].addEventListener("mouseleave", (e) => {
                e.stopPropagation();
                //fire Event mouseLeave
                let onMouseLeaveEvent = new Event("onHTextLabelMouseLeave", {
                    srcElement: self.chartSVG,
                    originEvent: e
                });
                this.objChart.event.dispatchEvent(onMouseLeaveEvent);
            }, false);
        }
    }
}

module.exports = HorizontalLabels;