/*
 * verticalLabels.js
 * @Version:1.0.0
 * @CreatedOn:14-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a Vertical Labels for the chart. 
 */

"use strict";

class VerticalLabels {

    constructor() {}

    createVerticalLabel(objChart, targetElem, posX, posY, maxVal, minVal, maxWidth, gridHeight, labelCount, labelPrefix) {
        this.objChart = objChart; 
        this.targetElem = targetElem; 
        this.chartSVG = this.objChart.CHART_DATA.chartSVG;
        this.vLabelContainer = this.chartSVG.querySelector("#" + targetElem);
        this.posX = posX; 
        this.posY = posY;
        this.maxVal = maxVal; 
        this.minVal = minVal; 
        this.maxWidth = maxWidth; 
        this.gridHeight = gridHeight; 
        this.labelCount = labelCount; 
        this.labelPrefix = labelPrefix; 
       
        let interval = (maxVal) / (labelCount - 1);
        let strText = "<g id='vTextLabel'>";
        for (let gridCount = labelCount - 1, i = 0; gridCount >= 0; gridCount--) {
            let value = (i++ * interval);
            value = this.formatTextValue(value);
            strText += "<text font-family='Lato' fill='black'><tspan x='" + (posX - maxWidth) + "' y='" + (posY + (gridCount * gridHeight) + 5) + "' font-size='12' >" + (labelPrefix ? labelPrefix : "") + value + "<\/tspan></text>";
            let d = ["M", posX, posY + (gridCount * gridHeight), "L", (posX - 5), posY + (gridCount * gridHeight)];
            strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
        }
        strText += "</g>";
        this.vLabelContainer.innerHTML = strText; 
        this.adjustFontSize();
    } /*End createVerticalLabel()*/

    adjustFontSize() {
        /*Adjust vertical text label size*/
        let arrVTextLabels = this.vLabelContainer.querySelectorAll("#vTextLabel text");
        for (let i = 0; i < arrVTextLabels.length; i++) {
            let txtWidth = arrVTextLabels[i].getComputedTextLength();
            if (txtWidth > this.maxWidth - 10) {
                let fontSize = arrVTextLabels[i].querySelector("tspan").getAttribute("font-size");
                arrVTextLabels.forEach(elem => {
                    elem.querySelector("tspan").setAttribute("font-size", (fontSize - 1));
                });
                i = 0;
            }
        }
    }

    formatTextValue(value) {
        if (Number(value) >= 100000) {
            return (Number(value) / 100000).toFixed(2) + " M";
        } else if (value >= 1000) {
            return (Number(value) / 1000).toFixed(2) + " K";
        } else {
            return Number(value).toFixed(2);
        }
    }
}

module.exports = VerticalLabels;