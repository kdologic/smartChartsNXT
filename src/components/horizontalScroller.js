/*
 * horizontalScroller.js
 * @Version:1.0.0
 * @CreatedOn:14-Jul-2017
 * @Author:SmartChartsNXT
 * @Description: This components will create a Horizontal Scroll area for the chart. 
 */

"use strict";

let Event = require("./../core/event");
let UiCore = require("./../core/ui.core");
let Point = require("./../core/point");

class HorizontalScroller {

    constructor() {
        this.uiCore = new UiCore();
    }

    createScrollBox(objChart, chartDOM, targetElem, posX, posY, scrollBoxWidth, scrollBoxHeight) {
        this.objChart = objChart;
        this.chartDOM = chartDOM;
        this.targetElem = targetElem;
        this.posX = posX;
        this.posY = posY;
        this.scrollBoxWidth = scrollBoxWidth;
        this.scrollBoxHeight = scrollBoxHeight;
        let strSVG = "";
        strSVG += "<g id='hChartScrollerCont'></g>";
        strSVG += "<rect id='sliderLeftOffset' x='" + posX + "' y='" + posY + "' width='0' height='" + scrollBoxHeight + "' fill= 'rgba(128,179,236,0.5)'  fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";
        strSVG += "<rect id='sliderRightOffset' x='" + (posX + scrollBoxWidth) + "' y='" + posY + "' width='0' height='" + scrollBoxHeight + "' fill = 'rgba(128,179,236,0.5)' fill-opacity=0.7 style='stroke-width:0.1;stroke:#717171;' \/>";

        let outerContPath = [
            "M", posX, (posY + 10),
            "L", posX, posY,
            "L", (posX + scrollBoxWidth), posY,
            "L", (posX + scrollBoxWidth), (posY + 10)
        ];

        strSVG += "<path stroke='#333' fill='none' d='" + outerContPath.join(" ") + "' stroke-width='1' opacity='1'></path>";
        strSVG += "<rect id='outerFrame' x='" + posX + "' y='" + (posY) + "' width='" + scrollBoxWidth + "' height='" + scrollBoxHeight + "' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
        strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";

        strSVG += "<g id='sliderLeftHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderLSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='10' height='" + (scrollBoxHeight * 2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";

        strSVG += "<g id='sliderRightHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderRSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='10' height='" + (scrollBoxHeight * 2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";
        chartDOM.querySelector("#" + targetElem).insertAdjacentHTML("beforeend", strSVG);

        this.bindSliderEvents();
    }

    bindSliderEvents() {
        let self = this;
        let sliderLeftHandle = this.chartDOM.querySelector("#sliderLeftHandle");
        let sliderRightHandle = this.chartDOM.querySelector("#sliderRightHandle");
        let eventMouseDown = new window.Event("mousedown");
        let eventMouseUp = new window.Event("mouseup");
        let eventTouchStart = new window.Event("touchstart");
        let eventTouchEnd = new window.Event("touchend");
        let eventTouchCancel = new window.Event("touchcancel");
        let leftSliderMoveBind = this.leftSliderMove.bind(this);
        let rightSliderMoveBind = this.rightSliderMove.bind(this);

        sliderLeftHandle.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderLeftHandle.addEventListener("mousemove", leftSliderMoveBind);
            self.chartDOM.addEventListener("mousemove", leftSliderMoveBind);
        });

        sliderLeftHandle.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
            self.chartDOM.removeEventListener("mousemove", leftSliderMoveBind);
        });

        sliderLeftHandle.addEventListener("mouseleave", function (e) {
            e.stopPropagation();
            sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
        });

        sliderLeftHandle.addEventListener("mouseenter", function (e) {
            e.stopPropagation();
            if (self.mouseDown === 1) {
                sliderRightHandle.dispatchEvent(eventMouseUp);
                sliderRightHandle.dispatchEvent(eventTouchEnd);
                sliderRightHandle.dispatchEvent(eventTouchCancel);
                sliderLeftHandle.dispatchEvent(eventMouseDown);
                sliderLeftHandle.dispatchEvent(eventTouchStart);
            }
        });


        this.chartDOM.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (self.mouseDown === 1) {
                sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
                self.chartDOM.removeEventListener("mousemove", leftSliderMoveBind);
                sliderLeftHandle.removeEventListener("mousemove", rightSliderMoveBind);
                self.chartDOM.removeEventListener("mousemove", rightSliderMoveBind);
            }
            self.mouseDown = 0;
        });

        sliderRightHandle.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderRightHandle.addEventListener("mousemove", rightSliderMoveBind);
            self.chartDOM.addEventListener("mousemove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderRightHandle.removeEventListener("mousemove", rightSliderMoveBind);
            self.chartDOM.removeEventListener("mousemove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("mouseleave", function (e) {
            e.stopPropagation();
            sliderRightHandle.removeEventListener("mousemove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("mouseenter", function (e) {
            e.stopPropagation();
            if (self.mouseDown === 1) {
                sliderLeftHandle.dispatchEvent(eventMouseUp);
                sliderLeftHandle.dispatchEvent(eventTouchEnd);
                sliderLeftHandle.dispatchEvent(eventTouchCancel);
                sliderRightHandle.dispatchEvent(eventMouseDown);
                sliderRightHandle.dispatchEvent(eventTouchStart);
            }
        });

        /*Events for touch devices*/

        sliderLeftHandle.addEventListener("touchstart", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderLeftHandle.addEventListener("touchmove", leftSliderMoveBind);
            self.chartDOM.addEventListener("touchmove", leftSliderMoveBind);
        }, false);

        sliderLeftHandle.addEventListener("touchend", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderLeftHandle.removeEventListener("touchmove", leftSliderMoveBind);
            self.chartDOM.removeEventListener("touchmove", leftSliderMoveBind);
        }, false);

        sliderRightHandle.addEventListener("touchstart", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderRightHandle.addEventListener("touchmove", rightSliderMoveBind);
            self.chartDOM.addEventListener("touchmove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("touchend", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderRightHandle.removeEventListener("touchmove", rightSliderMoveBind);
            self.chartDOM.removeEventListener("touchmove", rightSliderMoveBind);
        });

    }

    leftSliderMove(e) {
        e.stopPropagation();
        e.preventDefault();
        let mousePointer = this.uiCore.cursorPoint(this.chartDOM, e.changedTouches ? e.changedTouches[0] : e);
        let sliderLsel = this.chartDOM.querySelector("#slideLSel").getBBox();
        let sliderRsel = this.chartDOM.querySelector("#slideRSel").getBBox();
        let sliderPosX = mousePointer.x < sliderRsel.x ? mousePointer.x : sliderRsel.x;
        let leftSliderMoveEvent = new Event("onLeftSliderMove", {
            srcElement: this.chartDOM,
            originEvent: e,
            sliderPosition: new Point(sliderPosX, mousePointer.y)
        });

        if (e.type === "touchmove") {
            if (mousePointer.x > sliderRsel.x) {
                let eventMouseEnter = new Event("mouseenter");
                this.resetSliderPos("left", sliderPosX);
                this.resetSliderPos("right", mousePointer.x);
                this.chartDOM.querySelector("#sliderRightHandle").dispatchEvent(eventMouseEnter);
                this.objChart.event.dispatchEvent(leftSliderMoveEvent);
                return;
            }
        }

        if (mousePointer.x > this.posX && mousePointer.x < (this.posX + this.scrollBoxWidth)) {
            this.resetSliderPos("left", mousePointer.x);
            this.objChart.event.dispatchEvent(leftSliderMoveEvent);
        }
    }

    rightSliderMove(e) {
        e.stopPropagation();
        e.preventDefault();
        let mousePointer = this.uiCore.cursorPoint(this.chartDOM, e.changedTouches ? e.changedTouches[0] : e);
        let sliderLsel = this.chartDOM.querySelector("#slideLSel").getBBox();
        let sliderRsel = this.chartDOM.querySelector("#slideRSel").getBBox();
        let sliderPosX = mousePointer.x > sliderLsel.x + sliderLsel.width ? mousePointer.x : sliderLsel.x + sliderLsel.width;
        let rightSliderMoveEvent = new Event("onRightSliderMove", {
            srcElement: this.chartDOM,
            originEvent: e,
            sliderPosition: new Point(sliderPosX, mousePointer.y)
        });

        if (e.type === "touchmove") {
            if (sliderRsel.x < sliderLsel.x + sliderLsel.width) {
                let eventMouseEnter = new Event("mouseenter");
                this.resetSliderPos("right", sliderPosX);
                this.resetSliderPos("left", mousePointer.x);
                this.chartDOM.querySelector("#sliderLeftHandle").dispatchEvent(eventMouseEnter);
                this.objChart.event.dispatchEvent(rightSliderMoveEvent);
                return;
            }
        }
        if (mousePointer.x > this.posX && mousePointer.x < (this.posX + this.scrollBoxWidth)) {
            this.resetSliderPos("right", mousePointer.x);
            this.objChart.event.dispatchEvent(rightSliderMoveEvent);
        }
    }

    resetSliderPos(type, scrollPosX) {
        let sliderSel = (type === "right") ? "slideRSel" : "slideLSel";
        let sliderLine = (type === "right") ? "sliderRight" : "sliderLeft";
        let innerBarType = (type === "right") ? "slideRSelInner" : "slideLSelInner";
        let selFrame = (type === "right") ? "sliderRSelFrame" : "sliderLSelFrame";
        let swipeFlag = (type === "right") ? 1 : 0;
        scrollPosX = (scrollPosX <= 0 ? this.posX : scrollPosX);

        let dr = [
            "M", scrollPosX, this.posY,
            "L", scrollPosX, (this.posY + this.scrollBoxHeight)
        ];
        let innerBar = [
            "M", (type === "right" ? (scrollPosX + 3) : (scrollPosX - 3)), (this.posY + (this.scrollBoxHeight / 2) - 5),
            "L", (type === "right" ? (scrollPosX + 3) : (scrollPosX - 3)), (this.posY + (this.scrollBoxHeight / 2) + 5),
            "M", (type === "right" ? (scrollPosX + 5) : (scrollPosX - 5)), (this.posY + (this.scrollBoxHeight / 2) - 5),
            "L", (type === "right" ? (scrollPosX + 5) : (scrollPosX - 5)), (this.posY + (this.scrollBoxHeight / 2) + 5)
        ];

        let cy = this.posY + (this.scrollBoxHeight / 2);
        let sldrSel = this.chartDOM.querySelector("#" + sliderSel);
        let sldrLine = this.chartDOM.querySelector("#" + sliderLine);
        let inrBarType = this.chartDOM.querySelector("#" + innerBarType);
        let lSelFrame = this.chartDOM.querySelector("#" + selFrame);
        if (sldrSel) {
            sldrSel.setAttribute("d", this.objChart.geom.describeEllipticalArc(scrollPosX, cy, 15, 15, 180, 360, swipeFlag).d);
        }
        if (sldrLine) {
            sldrLine.setAttribute("d", dr.join(" "));
        }
        if (inrBarType) {
            inrBarType.setAttribute("d", innerBar.join(" "));
        }
        if (lSelFrame) {
            let xPos = type === "right" ? scrollPosX + lSelFrame.getAttribute("width") : scrollPosX - lSelFrame.getAttribute("width");
            lSelFrame.setAttribute("x", xPos);
        }

        let fullSeries = this.chartDOM.querySelector("#scrollerCont #outerFrame");
        if (fullSeries) {
            if (type === "left") {
                let sliderOffset = this.chartDOM.querySelector("#sliderLeftOffset");
                sliderOffset.setAttribute("width", ((scrollPosX - fullSeries.getBBox().x) < 0 ? 0 : (scrollPosX - fullSeries.getBBox().x)));
            } else {
                let sliderOffset = this.chartDOM.querySelector("#sliderRightOffset");
                sliderOffset.setAttribute("width", ((fullSeries.getBBox().width + fullSeries.getBBox().x) - scrollPosX));
                sliderOffset.setAttribute("x", scrollPosX);
            }
        }



        let horizontalScrollEvent = new Event("onHorizontalScroll", {
            srcElement: this.chartDOM,
            sliderType: type,
            sliderPosition: new Point(scrollPosX, this.posY)
        });
        this.objChart.event.dispatchEvent(horizontalScrollEvent);
        // /*Fire event on change of slider position */
        // if (type === "left") {
        //     let leftSliderMoveEvent = new Event("onLeftSliderMove", {
        //         srcElement: this,
        //         originEvent: e,
        //         sliderPosition: new Point(scrollPosX, this.posY)
        //     });
        //     this.objChart.event.dispatchEvent(leftSliderMoveEvent);
        // } else {
        //     let rightSliderMoveEvent = new Event("onRightSliderMove", {
        //         srcElement: this,
        //         originEvent: e,
        //         sliderPosition: new Point(scrollPosX, this.posY)
        //     });
        //     this.objChart.event.dispatchEvent(leftSliderMoveEvent);
        // }

        // /*If zoomOutBox is exist then show/hide that accordingly */
        // let zoomOutBoxCont = this.chartDOM.querySelector("#zoomOutBoxCont");
        // if (zoomOutBoxCont) {
        //     if (type === "left") {
        //         zoomOutBoxCont.style.display = this.CHART_DATA.windowLeftIndex > 0 ? "block" : "none";
        //     } else if (type === "right") {
        //         zoomOutBoxCont.style.display = (this.CHART_DATA.windowRightIndex < ((this.CHART_OPTIONS.dataSet.series[this.CHART_DATA.longestSeries].data.length * 2) - 1)) ? "block" : "none";
        //     }
        // }

    }
}

module.exports = HorizontalScroller;