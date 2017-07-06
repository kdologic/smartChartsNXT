/*
 * base_chart.js
 * @CreatedOn: 10-May-2017
 * @Author: SmartChartsNXT
 * @Version: 1.0.0
 * @description:This class will be the parent class of all charts
 */

window.SmartChartsNXT.BaseChart = function () {

    this.init = function (chartType, opts) {
        var self = this;
        this._CHART_OPTIONS = $SC.util.extends(opts, this._CHART_OPTIONS);

        this._CHART_DATA.container = document.querySelector("#" + this._CHART_OPTIONS.targetElem);
        this._CHART_DATA.container.setAttribute("runId", this._CHART_CONST.runId);

        this._CHART_OPTIONS.width = this._CHART_CONST.FIX_WIDTH = this._CHART_DATA.container.offsetWidth || this._CHART_CONST.FIX_WIDTH;
        this._CHART_OPTIONS.height = this._CHART_CONST.FIX_HEIGHT = this._CHART_DATA.container.offsetHeight || this._CHART_CONST.FIX_HEIGHT;

        if (this._CHART_OPTIONS.width < this._CHART_CONST.MIN_WIDTH)
            this._CHART_OPTIONS.width = this._CHART_CONST.FIX_WIDTH = this._CHART_CONST.MIN_WIDTH;
        if (this._CHART_OPTIONS.height < this._CHART_CONST.MIN_HEIGHT)
            this._CHART_OPTIONS.height = this._CHART_CONST.FIX_HEIGHT = this._CHART_CONST.MIN_HEIGHT;

        if (this._CHART_OPTIONS.events && typeof this._CHART_OPTIONS.events === "object") {
            for (var e in this._CHART_OPTIONS.events) {
                this.off(e, this._CHART_OPTIONS.events[e]);
                this.on(e, this._CHART_OPTIONS.events[e]);
            }
        }

        this._CHART_DATA.scaleX = this._CHART_CONST.FIX_WIDTH - this._CHART_OPTIONS.width;
        this._CHART_DATA.scaleY = this._CHART_CONST.FIX_HEIGHT - this._CHART_OPTIONS.height;

        //fire Event onInit
        var onInitEvent = new this.Event("onInit", {
            srcElement: this
        });
        this.dispatchEvent(onInitEvent);

        var strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
            "viewBox='0 0 " + this._CHART_CONST.FIX_WIDTH + " " + this._CHART_CONST.FIX_HEIGHT + "'" +
            "version='1.1'" +
            "width='" + this._CHART_OPTIONS.width + "'" +
            "height='" + this._CHART_OPTIONS.height + "'" +
            "id='" + chartType + "'" +
            "style='background:" + (this._CHART_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
            "> <\/svg>";

        this._CHART_DATA.container.innerHTML = "";
        this._CHART_DATA.container.insertAdjacentHTML("beforeend", strSVG);
        this._CHART_DATA.objChart = document.querySelector("#" + this._CHART_OPTIONS.targetElem + " #" + chartType);

        var svgWidth = parseInt(this._CHART_DATA.objChart.getAttribute("width"));
        var svgHeight = parseInt(this._CHART_DATA.objChart.getAttribute("height"));
        this._CHART_DATA.svgCenter = new $SC.geom.Point((svgWidth / 2), (svgHeight / 2));

        setTimeout(function () {
            $SC.ui.appendMenu2(self._CHART_OPTIONS.targetElem, self._CHART_DATA.svgCenter, null, null, self);
            $SC.appendWaterMark(self._CHART_OPTIONS.targetElem, self._CHART_DATA.scaleX, self._CHART_DATA.scaleY);
        }, 100);
    } /* End of Init() */

    this.render = function(){
        //fire event afterRender
        var aftrRenderEvent = new this.Event("afterRender", {
        srcElement: this
        });
        this.dispatchEvent(aftrRenderEvent);
    }

}