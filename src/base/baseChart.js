/*
 * BaseChart.js
 * @CreatedOn: 10-May-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:This class will be the parent class of all charts
 */

"use strict";

let UiCore = require("./../core/ui.core");
let GeomCore = require("./../core/geom.core");
let UtilCore = require("./../core/util.core");
let EventCore = require("./../core/event.core");
let Point = require("./../core/point");

class BaseChart {
    constructor(chartType, opts) {
        this.util = new UtilCore();
        this.geom = new GeomCore();
        this.event = new EventCore();
        this.ui = new UiCore();
        this.chartType = chartType; 
        this.CHART_OPTIONS = this.util.extends(opts, {});
        this.CHART_DATA = {};
        this.CHART_CONST = {
            FIX_WIDTH: 800,
            FIX_HEIGHT: 600,
            MIN_WIDTH: 250,
            MIN_HEIGHT: 400
        };
        this.runId = chartType + "_" + Math.round(Math.random() * 1000000001);
    }

    initBase() {
        let self = this;
        this.CHART_DATA.container = document.querySelector("#" + this.CHART_OPTIONS.targetElem);
        this.CHART_DATA.container.setAttribute("runId", this.runId);

        this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = this.CHART_DATA.container.offsetWidth || this.CHART_CONST.FIX_WIDTH;
        this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = this.CHART_DATA.container.offsetHeight || this.CHART_CONST.FIX_HEIGHT;

        if (this.CHART_OPTIONS.width < this.CHART_CONST.MIN_WIDTH) {
            this.CHART_OPTIONS.width = this.CHART_CONST.FIX_WIDTH = this.CHART_CONST.MIN_WIDTH;
        }
        if (this.CHART_OPTIONS.height < this.CHART_CONST.MIN_HEIGHT) {
            this.CHART_OPTIONS.height = this.CHART_CONST.FIX_HEIGHT = this.CHART_CONST.MIN_HEIGHT;
        }

        if (this.CHART_OPTIONS.events && typeof this.CHART_OPTIONS.events === "object") {
            for (let e in this.CHART_OPTIONS.events) {
                this.event.off(e, this.CHART_OPTIONS.events[e]);
                this.event.on(e, this.CHART_OPTIONS.events[e]);
            }
        }

        this.CHART_DATA.scaleX = this.CHART_CONST.FIX_WIDTH - this.CHART_OPTIONS.width;
        this.CHART_DATA.scaleY = this.CHART_CONST.FIX_HEIGHT - this.CHART_OPTIONS.height;

        //fire Event onInit
        let onInitEvent = new this.event.Event("onInit", {
            srcElement: this
        });
        this.event.dispatchEvent(onInitEvent);

        let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
            "viewBox='0 0 " + this.CHART_CONST.FIX_WIDTH + " " + this.CHART_CONST.FIX_HEIGHT + "'" +
            "version='1.1'" +
            "width='" + this.CHART_OPTIONS.width + "'" +
            "height='" + this.CHART_OPTIONS.height + "'" +
            "id='" + this.chartType + "'" +
            "style='background:" + (this.CHART_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
            "> <\/svg>";

        this.CHART_DATA.container.innerHTML = "";
        this.CHART_DATA.container.insertAdjacentHTML("beforeend", strSVG);
        this.CHART_DATA.objChart = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #" + this.chartType);

        let svgWidth = parseInt(this.CHART_DATA.objChart.getAttribute("width"));
        let svgHeight = parseInt(this.CHART_DATA.objChart.getAttribute("height"));
        this.CHART_DATA.svgCenter = new Point((svgWidth / 2), (svgHeight / 2));

        setTimeout(function () {
            self.ui.appendMenu2(self.CHART_OPTIONS.targetElem, self.CHART_DATA.svgCenter, null, null, self);
            self.ui.appendWaterMark(self.CHART_OPTIONS.targetElem, self.CHART_DATA.scaleX, self.CHART_DATA.scaleY);
        }, 100);
    } /* End of Init() */

    render() {
        //fire event afterRender
        let aftrRenderEvent = new this.event.Event("afterRender", {
            srcElement: this
        });
        this.event.dispatchEvent(aftrRenderEvent);
    }

    getRunId(chartType) {
        return this.runId;
    }

    handleError(ex, msg) {
        console.log(ex);
        console.error("SmartChartsNXT:" + msg);
    } /*End handleError()*/
}

module.exports = BaseChart;