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

    createVerticalLabel(objChart, chartSVG, posX, posY, maxVal, minVal, maxWidth, gridHeight, lableCount, labelPrefix) {
        let vTextLabel = chartSVG.querySelector("#vTextLabel");
        if (vTextLabel) {
            vTextLabel.parentNode.removeChild(vTextLabel);
        }

        let interval = (maxVal) / (lableCount - 1);
        let strText = "<g id='vTextLabel'>";
        for (let gridCount = lableCount - 1, i = 0; gridCount >= 0; gridCount--) {
            let value = (i++ * interval);
            value = this.formatTextValue(value);
            strText += "<text font-family='Lato' fill='black'><tspan x='" + (posX - maxWidth) + "' y='" + (posY + (gridCount * gridHeight) + 5) + "' font-size='12' >" + (labelPrefix ? labelPrefix : "") + value + "<\/tspan></text>";
            let d = ["M", posX, (posY + (gridCount * gridHeight)) + (i === 1 ? 1 : 0), "L", (posX - 5), (posY + (gridCount * gridHeight) + (i === 1 ? 1 : 0))];
            strText += "<path fill='none' d='" + d.join(" ") + "' stroke='#333' stroke-width='1' opacity='1'></path>";
        }
        strText += "</g>";
        chartSVG.insertAdjacentHTML("beforeend", strText);
        this.adjustFontSize(chartSVG, maxWidth);
    } /*End createVerticalLabel()*/

    adjustFontSize(chartSVG, maxWidth) {
        /*Adjust vertical text label size*/
        let arrVTextLabels = chartSVG.querySelectorAll("#vTextLabel text");
        for (let i = 0; i < arrVTextLabels.length; i++) {
            let txtWidth = arrVTextLabels[i].getComputedTextLength();
            if (txtWidth > maxWidth - 10) {
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