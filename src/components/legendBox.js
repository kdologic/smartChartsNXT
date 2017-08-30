/*
 * legendBox.js
 * @Version:1.0.0
 * @CreatedOn:28-Aug-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create legends to use in charts.
 */

"use strict";

class LegendBox {
    constructor() {}

    createLegends(objChart, targetElem, opts) {
        let self = this;
        this.objChart = objChart;
        this.chartSVG = this.objChart.CHART_DATA.chartSVG;
        this.legendContainer = this.chartSVG.querySelector("#" + targetElem);
        this.legendContainer.innerHTML = "";
        this.targetElem = targetElem;
        this.opts = opts;
        this.fontSize = 16;
        this.colorContWidth = 15;
        /*Creating series legend*/
        this.legendBBox = {
            left: opts.left,
            top: opts.top,
            padding: 10
        };

        let strSVG = "";
        strSVG += "  <path id='legend_container_border' d=''  fill='none' stroke-width='1' stroke='#717171' />";
        for (let index in this.opts.legendSet) {
            let color = this.opts.legendSet[index].color;
            strSVG += "<g id='series_legend_" + index + "' class='legend" + index + "'style='cursor:pointer;'>";
            strSVG += "<rect id='legend_color_" + index + "' class='legend" + index + "' x='" + (this.legendBBox.left + this.legendBBox.padding) + "' y='" + (this.legendBBox.top + this.legendBBox.padding + (index * 30)) + "' width='" + this.colorContWidth + "' height='" + this.colorContWidth + "' fill='" + color + "' shape-rendering='optimizeSpeed' stroke='none' stroke-width='1' opacity='1'></rect>";
            strSVG += "<text id='legend_txt_" + index + "' class='legend" + index + "' font-size='" + this.fontSize + "' x='" + (this.legendBBox.left + this.colorContWidth + 2 * this.legendBBox.padding) + "' y='" + (this.legendBBox.top + this.legendBBox.padding + (index * 30) + 14) + "' fill='#717171' font-family='Lato' >" + this.opts.legendSet[index].label + "</text>";
            strSVG += "<text id='legend_value_" + index + "' class='legend" + index + "' font-size='" + this.fontSize + "' x='" + (this.legendBBox.left + this.colorContWidth + 2 * this.legendBBox.padding) + "' y='" + (this.legendBBox.top + this.legendBBox.padding + (index * 30) + 15) + "' fill='#717171' font-family='Lato' >" + this.opts.legendSet[index].value + "</text>";
            strSVG += "</g>";
        }
        this.legendContainer.insertAdjacentHTML("beforeend", strSVG);
        let legendBox = this.legendContainer.getBoundingClientRect();
        this.resetPositions();
        this.bindEvents();
    } /*End createLegends()*/

    resetPositions() {
        this.maxLabelLen = 0;
        this.maxValLen = 0;
        for (let i in this.opts.legendSet) {
            let textLen = this.legendContainer.querySelector("#legend_txt_" + i).getComputedTextLength();
            this.maxLabelLen = textLen > this.maxLabelLen ? textLen : this.maxLabelLen;
            textLen = this.legendContainer.querySelector("#legend_value_" + i).getComputedTextLength();
            this.maxValLen = textLen > this.maxValLen ? textLen : this.maxValLen;
        }
        let legendValLeft = this.legendBBox.left + this.colorContWidth + 3 * this.legendBBox.padding + this.maxLabelLen;
        for (let i in this.opts.legendSet) {
            this.legendContainer.querySelector("#legend_value_" + i).setAttribute("x", legendValLeft);
        }
        this.legendContainerWidth = legendValLeft + this.maxValLen + this.legendBBox.padding - this.legendBBox.left;
        this.legendContainerHeight = (this.opts.legendSet.length * 30) + (this.legendBBox.padding);
        if (this.opts.left + this.legendContainerWidth > this.objChart.CHART_DATA.svgWidth) {
            this.fontSize -= 1;
            if (this.fontSize < 10) {
                for (let i = 0; i < this.opts.legendSet.length; i++) {
                    this.legendContainer.querySelector("#legend_value_" + i).setAttribute("x", (this.legendBBox.left + (2 * this.legendBBox.padding) + this.colorContWidth));
                    this.legendContainer.querySelector("#legend_value_" + i).setAttribute("y", (this.legendBBox.top + this.legendBBox.padding + ((i + 1) * 30)));
                }
                this.legendContainerWidth = (2 * this.legendBBox.padding) + this.colorContWidth + (this.maxValLen > this.maxLabelLen ? this.maxValLen : this.maxLabelLen);
                this.legendContainerHeight = (this.opts.legendSet.length * (this.colorContWidth + this.legendBBox.padding + 4)) + (3 * this.legendBBox.padding);
            } else {
                for (let i in this.opts.legendSet) {
                    this.legendContainer.querySelector("#legend_txt_" + i).setAttribute("font-size", this.fontSize);
                    this.legendContainer.querySelector("#legend_value_" + i).setAttribute("font-size", this.fontSize);
                }
            }
        }
        
        this.legendContainer.querySelector("#legend_container_border").setAttribute("d", this.objChart.geom.describeRoundedRect(this.legendBBox.left, this.legendBBox.top, this.legendContainerWidth, this.legendContainerHeight, 10).join(" "));
        if (this.opts.left + this.legendContainerWidth > this.objChart.CHART_DATA.svgWidth && this.fontSize > 8) {
            this.resetPositions();
        }
    }

    bindEvents() {
        let self = this; 
        for (let i in this.opts.legendSet) {
            this.legendContainer.querySelector("#series_legend_" + i).addEventListener("mouseover", (e) => {
                let elemClass = e.target.getAttribute("class");
                let legendIndex = elemClass.substring("legend".length);
                let legendHoverEvent = new this.objChart.event.Event("onLegendHover", {
                    srcElement: self,
                    originEvent: e,
                    legendIndex: legendIndex,
                    legendData: this.opts.legendSet[legendIndex]
                });
                this.objChart.event.dispatchEvent(legendHoverEvent);
            }, false);

            this.legendContainer.querySelector("#series_legend_" + i).addEventListener("mouseleave", (e) => {
                let elemClass = e.target.getAttribute("class");
                let legendIndex = elemClass.substring("legend".length);
                let legendMouseLeaveEvent = new this.objChart.event.Event("onLegendLeave", {
                    srcElement: self,
                    originEvent: e,
                    legendIndex: legendIndex,
                    legendData: this.opts.legendSet[legendIndex]
                });
                this.objChart.event.dispatchEvent(legendMouseLeaveEvent);
            }, false);

            this.legendContainer.querySelector("#series_legend_" + i).addEventListener("click", (e) => {
                let elemClass = e.target.getAttribute("class");
                let legendIndex = elemClass.substring("legend".length);
                //fire Event onLegendClick
                let onLegendClick = new this.objChart.event.Event("onLegendClick", {
                    srcElement: self,
                    originEvent: e,
                    legendIndex: legendIndex,
                    legendData: this.opts.legendSet[legendIndex]
                });
                this.objChart.event.dispatchEvent(onLegendClick);
            }, false);

        }
    }
}

module.exports = LegendBox;