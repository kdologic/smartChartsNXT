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

        this.interval = this.getInterval(this.maxVal, this.minVal, this.labelCount);
        let minLabelVal = this.interval * Math.floor((this.minVal > 0 ? 0 : this.minVal) / this.interval);

        let strText = "<g id='vTextLabel'>";
        for (let gridCount = this.labelCount - 1, i = 0; gridCount >= 0; gridCount--) {
            let value = minLabelVal + (i++ * this.interval);
            value = this.formatTextValue(value);
            strText += "<text font-family='Lato' fill='black'><tspan x='" + (this.posX - maxWidth) + "' y='" + (this.posY + (gridCount * this.gridHeight) + 5) + "' font-size='12' >" + (this.labelPrefix ? this.labelPrefix : "") + value + "<\/tspan></text>";
            let d = ["M", this.posX, this.posY + (gridCount * this.gridHeight), "L", (this.posX - 5), this.posY + (gridCount * this.gridHeight)];
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
        if (Math.abs(Number(value)) >= 100000) {
            return (Number(value) / 100000).toFixed(2) + " M";
        } else if (Math.abs(Number(value)) >= 1000) {
            return (Number(value) / 1000).toFixed(2) + " K";
        } else {
            return Number(value).toFixed(2);
        }
    }

    getInterval(maxVal, minVal, intervalCount) {
        minVal = minVal > 0 ? 0 : minVal;
        maxVal = maxVal < 0 ? 0 :maxVal;
        let tempInterval = (maxVal - minVal) / (intervalCount - 2);
        let digitBase10 = Math.pow(10,Math.round(tempInterval).toString().length-1);
        let nearestNum = Math.ceil(tempInterval/digitBase10)*digitBase10;
        return nearestNum; 
    }

}

module.exports = VerticalLabels;