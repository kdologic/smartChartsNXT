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
        this._PAGE_OPTIONS = $SC.util.extends(opts, this._PAGE_OPTIONS);

        this._PAGE_DATA.container = document.querySelector("#" + this._PAGE_OPTIONS.targetElem);
        this._PAGE_DATA.container.setAttribute("runId", this._PAGE_CONST.runId);

        this._PAGE_OPTIONS.width = this._PAGE_CONST.FIX_WIDTH = this._PAGE_DATA.container.offsetWidth || this._PAGE_CONST.FIX_WIDTH;
        this._PAGE_OPTIONS.height = this._PAGE_CONST.FIX_HEIGHT = this._PAGE_DATA.container.offsetHeight || this._PAGE_CONST.FIX_HEIGHT;

        if (this._PAGE_OPTIONS.width < this._PAGE_CONST.MIN_WIDTH)
            this._PAGE_OPTIONS.width = this._PAGE_CONST.FIX_WIDTH = this._PAGE_CONST.MIN_WIDTH;
        if (this._PAGE_OPTIONS.height < this._PAGE_CONST.MIN_HEIGHT)
            this._PAGE_OPTIONS.height = this._PAGE_CONST.FIX_HEIGHT = this._PAGE_CONST.MIN_HEIGHT;

        if (this._PAGE_OPTIONS.events && typeof this._PAGE_OPTIONS.events === "object") {
            for (var e in this._PAGE_OPTIONS.events) {
                this.off(e, this._PAGE_OPTIONS.events[e]);
                this.on(e, this._PAGE_OPTIONS.events[e]);
            }
        }

        this._PAGE_DATA.scaleX = this._PAGE_CONST.FIX_WIDTH - this._PAGE_OPTIONS.width;
        this._PAGE_DATA.scaleY = this._PAGE_CONST.FIX_HEIGHT - this._PAGE_OPTIONS.height;

        //fire Event onInit
        var onInitEvent = new this.Event("onInit", {
            srcElement: this
        });
        this.dispatchEvent(onInitEvent);

        var strSVG = "<svg xmlns:svg='http:\/\/www.w3.org\/2000\/svg' xmlns='http:\/\/www.w3.org\/2000\/svg' xmlns:xlink='http:\/\/www.w3.org\/1999\/xlink'" +
            "viewBox='0 0 " + this._PAGE_CONST.FIX_WIDTH + " " + this._PAGE_CONST.FIX_HEIGHT + "'" +
            "version='1.1'" +
            "width='" + this._PAGE_OPTIONS.width + "'" +
            "height='" + this._PAGE_OPTIONS.height + "'" +
            "id='" + chartType + "'" +
            "style='background:" + (this._PAGE_OPTIONS.bgColor || "none") + ";-moz-tap-highlight-color: rgba(0, 0, 0, 0);-webkit-tap-highlight-color:rgba(0, 0, 0, 0);-webkit-user-select:none;-khtml-user-select: none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none;'" +
            "> <\/svg>";

        this._PAGE_DATA.container.innerHTML = "";
        this._PAGE_DATA.container.insertAdjacentHTML("beforeend", strSVG);
        this._PAGE_DATA.objChart = document.querySelector("#" + this._PAGE_OPTIONS.targetElem + " #" + chartType);

        var svgWidth = parseInt(this._PAGE_DATA.objChart.getAttribute("width"));
        var svgHeight = parseInt(this._PAGE_DATA.objChart.getAttribute("height"));
        this._PAGE_DATA.svgCenter = new $SC.geom.Point((svgWidth / 2), (svgHeight / 2));

        setTimeout(function () {
            $SC.ui.appendMenu2(self._PAGE_OPTIONS.targetElem, self._PAGE_DATA.svgCenter, null, null, self);
            $SC.appendWaterMark(self._PAGE_OPTIONS.targetElem, self._PAGE_DATA.scaleX, self._PAGE_DATA.scaleY);
        }, 100);
    } /* End of Init() */

}