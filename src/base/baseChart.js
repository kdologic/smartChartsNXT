"use strict";

/*
 * BaseChart.js
 * @CreatedOn: 10-May-2017
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @Description:This class will be the parent class of all charts
 */

"use strict";

let UiCore = require("./../core/ui.core");
let GeomCore = require("./../core/geom.core");
let UtilCore = require("./../core/util.core");
let EventCore = require("./../core/event.core");
let Event = require("./../core/event");
let Point = require("./../core/point");
let transformer = require("./../core/transformer");

import {render, h} from "./../core/pView.core";

/* ------------- Require pulgIns --------------*/
let animator = require("./../plugIns/animator");

class BaseChart {
    constructor(opts) {
        try {
            this.util = new UtilCore();
            this.geom = new GeomCore();
            this.event = new EventCore();
            this.ui = new UiCore();
            this.transformer = transformer;
            this.plugins = {
                animator: animator
            };
            this.chartType = opts.type;
            this.CHART_OPTIONS = this.util.extends(opts, {});
            this.CHART_DATA = {};
            this.CHART_CONST = {
                FIX_WIDTH: 800,
                FIX_HEIGHT: 600,
                MIN_WIDTH: 250,
                MIN_HEIGHT: 400
            };
            this.runId = this.chartType + "_" + this.util.uuidv4();
            this.timeOut = null;
        } catch (ex) {
            ex.errorIn = `Error in ${opts.type} base constructor : ${ex.message}`;
            this.showErrorScreen(opts, ex, ex.errorIn);
            throw ex;
        }
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
        let onInitEvent = new Event("onInit", {
            srcElement: this
        });
        this.event.dispatchEvent(onInitEvent);

        // let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
        //     "version='1.1'" +
        //     "width='" + this.CHART_OPTIONS.width + "'" +
        //     "height='" + this.CHART_OPTIONS.height + "'" +
        //     "id='" + this.chartType + "'" +
        //     "style='background:" + (this.CHART_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
        //     "> <\/svg>";

        let vSvg = render(
          <svg xmlns='http:\/\/www.w3.org\/2000\/svg'
            version={'1.1'}
            width= {this.CHART_OPTIONS.width}
            height={this.CHART_OPTIONS.height}
            id={this.chartType}
            > </svg>
        );
        this.CHART_DATA.container.innerHTML = "";
        //this.CHART_DATA.container.insertAdjacentHTML("beforeend", vSvg);
        this.CHART_DATA.container.appendChild(vSvg);
        this.CHART_DATA.chartSVG = document.querySelector("#" + this.CHART_OPTIONS.targetElem + " #" + this.chartType);

        this.CHART_DATA.svgWidth = parseInt(this.CHART_DATA.chartSVG.getAttribute("width"));
        this.CHART_DATA.svgHeight = parseInt(this.CHART_DATA.chartSVG.getAttribute("height"));
        this.CHART_DATA.svgCenter = new Point((this.CHART_DATA.svgWidth / 2), (this.CHART_DATA.svgHeight / 2));

        if (this.CHART_OPTIONS.canvasBorder) {
            let strSVG = "<g>";
            strSVG += "   <rect x='0' y='0' width='" + (this.CHART_DATA.svgWidth - 1) + "' height='" + (this.CHART_DATA.svgHeight - 1) + "' shape-rendering='optimizeSpeed' style='fill:none;stroke-width:1;stroke:#717171;' \/>";
            strSVG += "   <\/g>";
            this.CHART_DATA.chartSVG.insertAdjacentHTML("beforeend", strSVG);
        }

        setTimeout(function () {
            self.ui.appendMenu2(self.CHART_OPTIONS.targetElem, self.CHART_DATA.svgCenter, null, null, self);
            self.ui.appendWaterMark(self.CHART_OPTIONS.targetElem, self.CHART_DATA.scaleX, self.CHART_DATA.scaleY);
        }, 100);

    } /* End of Init() */

    onWindowResize(callBackInit) {
        let self = this;
        let containerDiv = this.CHART_DATA.container;
        if (this.getRunId() != containerDiv.getAttribute("runId")) {
            window.removeEventListener('resize', this.onWindowResize);
            if (this.timeOut != null) {
                clearTimeout(this.timeOut);
            }
            return;
        }
        if (containerDiv.offsetWidth !== this.CHART_CONST.FIX_WIDTH || containerDiv.offsetHeight !== this.CHART_CONST.FIX_HEIGHT) {
            if (this.timeOut != null) {
                clearTimeout(this.timeOut);
            }
            callChart();

            function callChart() {
                if (containerDiv) {
                    if (containerDiv.offsetWidth === 0 && containerDiv.offsetHeight === 0) {
                        self.timeOut = setTimeout(() => {
                            callChart();
                        }, 100);
                    } else {
                        self.timeOut = setTimeout(() => {
                            if (typeof callBackInit === "function") {
                                callBackInit.call(self);
                            }
                        }, 500);
                    }
                }
            }
        }
    } /*End onWindowResize()*/

    render() {
        //fire event afterRender
        let aftrRenderEvent = new Event("afterRender", {
            srcElement: this
        });
        this.event.dispatchEvent(aftrRenderEvent);
    }

    getRunId(chartType) {
        return this.runId;
    }

    showErrorScreen(opts, ex, mgs) {
        return; 
        let container = document.querySelector("#" + opts.targetElem);
        let width = container.offsetWidth;
        let height = container.offsetHeight;

        let strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
            "version='1.1'" +
            "width='" + width + "'" +
            "height='" + height + "'" +
            "id='" + opts.type + "-error'" +
            "style='background:#eee;-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
            "> <\/svg>";

        container.innerHTML = "";
        container.insertAdjacentHTML("beforeend", strSVG);
        let shadowId = this.ui.dropShadow(opts.type + "-error");
        let svgContainer = container.querySelector("#" + opts.type + "-error");
        let upperBoxPath = [
            "M", 0, 0,
            "H", width,
            "V", 50
        ];
        let lowerBoxPath = [
            "M", 0, height,
            "H", width,
            "v", -40
        ];
        let zigzagPath = [];
        for (let i = width, counter = 0; i >= 0; i -= 10, counter++) {
            zigzagPath.push("l", -10, (counter % 2 === 0 ? -10 : 10));
        }
        zigzagPath.push("Z");
        upperBoxPath.push.apply(upperBoxPath, zigzagPath);
        lowerBoxPath.push.apply(lowerBoxPath, zigzagPath);
        strSVG = "<path id='upperBox' d='" + upperBoxPath.join(" ") + "' filter = '" + shadowId + "' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>";
        strSVG += "<path id='lowerBox' d='" + lowerBoxPath.join(" ") + "' filter = '" + shadowId + "' fill='rgba(244, 67, 54, 0.16)' stroke='#333' stroke-width='0' opacity='1' pointer-events='none'></path>";
        svgContainer.insertAdjacentHTML("beforeend", strSVG);

        strSVG = "<circle cx='" + (width / 2) + "' cy='" + (height / 2 - 80) + "' r='25' fill='#717171'/>";
        strSVG += "<text id='errorTextGroup' fill='#fff' x='" + (width / 2 - 5) + "' y='" + ((height / 2) - 70) + "' font-weight='bold' font-size='35' >i<\/text>";
        strSVG += "<g>";
        strSVG += "  <text id='errorTextGroup' fill='#717171' font-family='Lato' >";
        strSVG += "    <tspan class='err-text' id='errtxt1' x='" + 0 + "' y='" + height / 2 + "' font-size='26'>Oops! Something went wrong. <\/tspan>";
        strSVG += "    <tspan class='err-text' id='errtxt2' x='" + 0 + "' y='" + ((height / 2) + 30) + "' font-size='16'>See the javascript console for technical details.<\/tspan>";
        strSVG += "  <\/text>";
        strSVG += "<\/g>";

        svgContainer.insertAdjacentHTML("beforeend", strSVG);
        let arrErrText = svgContainer.querySelectorAll("#errorTextGroup .err-text");
        (function adjustFontSize() {
            let overFlow = false;
            for (let j = 0; j < arrErrText.length; j++) {
                let eTextLen = arrErrText[j].getComputedTextLength();
                arrErrText[j].setAttribute("x", (width - eTextLen) / 2);
                if (eTextLen > width) {
                    overFlow = true;
                    break;
                }
            }
            if (overFlow) {
                for (let j = 0; j < arrErrText.length; j++) {
                    arrErrText[j].setAttribute("font-size", arrErrText[j].getAttribute("font-size") - 1);
                }
                adjustFontSize();
            }
        })();
    }
}

module.exports = BaseChart;