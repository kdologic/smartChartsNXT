/*
 * tooltip.js
 * @Version:1.0.0
 * @CreatedOn:17-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will tooltip area for the chart. 
 */

"use strict";

let UiCore = require("./../core/ui.core");
let Point = require("./../core/point");

class Tooltip {
    constructor() {
        this.ui = new UiCore();
    }

    createTooltip(objChart, chartSVG) {
        this.objChart = objChart;
        this.chartSVG = chartSVG;
        this.tooltipContainer = this.chartSVG.querySelector("#toolTipContainer");
        if (this.tooltipContainer) {
            this.tooltipContainer.parentNode.removeChild(this.tooltipContainer);
        }

        let strSVG = "<g id='toolTipContainer' pointer-events='none'>";
        strSVG += "  <path id='toolTip'  filter='" + this.ui.dropShadow(this.chartSVG.parentNode.getAttribute("id")) + "' fill='white' stroke='rgb(124, 181, 236)' fill='none' d='' stroke-width='1' opacity='0.9'></path>";
        strSVG += "  <g id='txtToolTipGrp' fill='#717171' font-family='Lato' >";

        strSVG += "<foreignobject id='toolTipHTML'>";
        strSVG += "<body xmlns='http://www.w3.org/1999/xhtml'>";
        strSVG += "</body>";
        strSVG += "</foreignobject>";

        strSVG += " </g>";
        strSVG += "</g>";
        this.chartSVG.insertAdjacentHTML("beforeend", strSVG);
        this.tooltipContainer = this.chartSVG.querySelector("#toolTipContainer");
        this.toolTipHtml = this.tooltipContainer.querySelector("#toolTipHTML");
        this.toolTip = this.tooltipContainer.querySelector("#toolTip");
    }

    updateTip(originPoint, color, line1, line2) {
        if (!this.objChart || !this.chartSVG) {
            return;
        }
        this.createTooltip(this.objChart, this.chartSVG);
        let lineHeight = 20;
        let padding = 10;
        let strContents = "";
        let chartWidth = this.chartSVG.parentNode.offsetWidth;
        let chartHeight = this.chartSVG.parentNode.offsetHeight;
        let cPoint;

        /*Prevent call-by-sharing*/
        if (originPoint) {
            cPoint = new Point(originPoint.x, originPoint.y);
        }
        if (line2 === "html") {
            strContents += line1;
        } else {
            strContents += "<table>";
            strContents += "<tr><td>" + line1 + "</td></tr>";
            if (line2) {
                strContents += "<tr><td><b>" + line2 + "</b></td></tr>";
            }
            strContents += "</table>";
        }
        this.toolTipHtml.innerHTML = strContents;

        let temp = document.createElement("div");
        temp.innerHTML = strContents;
        temp.style.display = "inline-block";
        temp.style.visibility = 'hidden';
        document.getElementsByTagName("body")[0].appendChild(temp);
        let containBox = {
            width: temp.offsetWidth + 6,
            height: temp.offsetHeight
        };
        if (temp) {
            temp.parentNode.removeChild(temp);
        }
        let txtWidth = containBox.width;
        lineHeight = containBox.height;

        cPoint.y -= 20;
        let topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - lineHeight - 10 - padding);
        let width = txtWidth + (2 * padding);
        let height = lineHeight + (2 * padding);
        let d = [
            "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
            "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
            "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
            "L", cPoint.x + 10, cPoint.y,
            "L", cPoint.x, cPoint.y + 10,
            "L", cPoint.x - 10, cPoint.y,
            "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
            "Z"
        ];

        if (topLeft.x + width > chartWidth) {
            cPoint.x -= 20;
            cPoint.y += 20;
            topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y - (lineHeight) - 10 - (padding));
            topLeft.x -= (width / 2);
            topLeft.y += (height / 2);
            d = [
                "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
                "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
                "L", cPoint.x, cPoint.y - 10,
                "L", cPoint.x + 10, cPoint.y,
                "L", cPoint.x, cPoint.y + 10,
                "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
                "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
                "Z"
            ];
        } else if (topLeft.y < 0) {
            cPoint.y += 40;
            topLeft = new Point(cPoint.x - (txtWidth / 2) - padding, cPoint.y);
            d = [
                "M", topLeft.x, topLeft.y, //TOP-LEFT CORNER
                "L", cPoint.x - 10, cPoint.y,
                "L", cPoint.x, cPoint.y - 10,
                "L", cPoint.x + 10, cPoint.y,
                "L", (topLeft.x + width), topLeft.y, //LINE TO TOP-RIGHT CORNER
                "L", (topLeft.x + width), (topLeft.y + height), //LINE TO BOTTOM-RIGHT CORNER
                "L", (topLeft.x), (topLeft.y + height), //LINE TO BOTTOM-LEFT CORNER
                "Z"
            ];
        }

        let textPos = new Point(topLeft.x + 5, topLeft.y + 5);
        if (this.toolTipHtml) {
            this.toolTipHtml.setAttribute("x", textPos.x);
            this.toolTipHtml.setAttribute("y", textPos.y);
            this.toolTipHtml.setAttribute("width", containBox.width + padding);
            this.toolTipHtml.setAttribute("height", containBox.height + padding);
        }
        this.toolTip.setAttribute("d", d.join(" "));
        if (color) {
            this.toolTip.setAttribute("stroke", color);
        }
        this.show();
    }

    show() {
        if (this.tooltipContainer) {
            this.tooltipContainer.style.display = "block";
        }
    }

    hide() {
        if (this.tooltipContainer) {
            this.tooltipContainer.style.display = "none";
        }
    }
}

module.exports = Tooltip;