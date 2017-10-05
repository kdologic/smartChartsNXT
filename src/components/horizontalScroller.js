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
let GeomCore = require("./../core/geom.core");
let Point = require("./../core/point");

class HorizontalScroller {

    constructor(objChart, chartSVG, targetElem, posX, posY, scrollBoxWidth, scrollBoxHeight) {
        this.ui = new UiCore();
        this.geom = new GeomCore();
        this.objChart = objChart;
        this.chartSVG = chartSVG;
        this.targetElem = targetElem;
        this.posX = posX;
        this.posY = posY;
        this.scrollBoxWidth = scrollBoxWidth;
        this.scrollBoxHeight = scrollBoxHeight;
        this.createScrollBox(); 
    }

    createScrollBox() {
        let posX = this.posX; 
        let posY = this.posY;
        let scrollBoxWidth = this.scrollBoxWidth; 
        let scrollBoxHeight = this.scrollBoxHeight; 
        
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

        strSVG += "<path stroke='#333' fill='none' d='" + outerContPath.join(" ") + "' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
        strSVG += "<rect id='outerFrame' x='" + posX + "' y='" + (posY) + "' width='" + scrollBoxWidth + "' height='" + scrollBoxHeight + "' style='fill:none;stroke-width:0.1;stroke:none;' \/>";
        strSVG += "<path id='sliderLeft' stroke='rgb(178, 177, 182)' fill='none' d=''  stroke-width='1' opacity='1'></path>";
        strSVG += "<path id='sliderRight' stroke='rgb(178, 177, 182)' fill='none' d='' stroke-width='1' opacity='1'></path>";

        strSVG += "<g id='sliderLeftHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderLSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='30' height='" + (scrollBoxHeight * 2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideLSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideLSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";

        strSVG += "<g id='sliderRightHandle' style='cursor: ew-resize;'>";
        strSVG += "  <rect id='sliderRSelFrame' x=''  y='" + (posY - scrollBoxHeight) + "' width='30' height='" + (scrollBoxHeight * 2) + "' style='cursor: default;fill:#000;stroke-width:0.1;stroke:none;fill-opacity: 0.0005' \/>";
        strSVG += "  <path id='slideRSel' stroke='rgb(178, 177, 182)' fill='#fafafa' d='' stroke-width='1' opacity='1'></path>";
        strSVG += "  <path id='slideRSelInner' stroke='rgb(178, 177, 182)' fill='none' d='' shape-rendering='optimizeSpeed' stroke-width='1' opacity='1'></path>";
        strSVG += "</g>";
        this.chartSVG.querySelector("#" + this.targetElem).insertAdjacentHTML("beforeend", strSVG);

        this.slideRSel = this.chartSVG.querySelector("#slideRSel");
        this.slideLSel = this.chartSVG.querySelector("#slideLSel");
        this.sliderRight = this.chartSVG.querySelector("#sliderRight");
        this.sliderLeft = this.chartSVG.querySelector("#sliderLeft");
        this.sliderLeftHandle = this.chartSVG.querySelector("#sliderLeftHandle");
        this.sliderRightHandle = this.chartSVG.querySelector("#sliderRightHandle");
        this.slideRSelInner = this.chartSVG.querySelector("#slideRSelInner");
        this.slideLSelInner = this.chartSVG.querySelector("#slideLSelInner");
        this.sliderRSelFrame = this.chartSVG.querySelector("#sliderRSelFrame");
        this.sliderLSelFrame = this.chartSVG.querySelector("#sliderLSelFrame");
        this.sliderLeftOffset = this.chartSVG.querySelector("#sliderLeftOffset");
        this.sliderRightOffset = this.chartSVG.querySelector("#sliderRightOffset");

        this.bindSliderEvents();
    }

    bindSliderEvents() {
        let self = this;
        let sliderLeftHandle = this.chartSVG.querySelector("#sliderLeftHandle");
        let sliderRightHandle = this.chartSVG.querySelector("#sliderRightHandle");
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
            self.chartSVG.addEventListener("mousemove", leftSliderMoveBind);
        });

        sliderLeftHandle.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
            self.chartSVG.removeEventListener("mousemove", leftSliderMoveBind);
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


        this.chartSVG.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            if (self.mouseDown === 1) {
                sliderLeftHandle.removeEventListener("mousemove", leftSliderMoveBind);
                self.chartSVG.removeEventListener("mousemove", leftSliderMoveBind);
                sliderLeftHandle.removeEventListener("mousemove", rightSliderMoveBind);
                self.chartSVG.removeEventListener("mousemove", rightSliderMoveBind);
            }
            self.mouseDown = 0;
        });

        sliderRightHandle.addEventListener("mousedown", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderRightHandle.addEventListener("mousemove", rightSliderMoveBind);
            self.chartSVG.addEventListener("mousemove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("mouseup", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderRightHandle.removeEventListener("mousemove", rightSliderMoveBind);
            self.chartSVG.removeEventListener("mousemove", rightSliderMoveBind);
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
            self.chartSVG.addEventListener("touchmove", leftSliderMoveBind);
        }, false);

        sliderLeftHandle.addEventListener("touchend", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderLeftHandle.removeEventListener("touchmove", leftSliderMoveBind);
            self.chartSVG.removeEventListener("touchmove", leftSliderMoveBind);
        }, false);

        sliderRightHandle.addEventListener("touchstart", function (e) {
            e.stopPropagation();
            self.mouseDown = 1;
            sliderRightHandle.addEventListener("touchmove", rightSliderMoveBind);
            self.chartSVG.addEventListener("touchmove", rightSliderMoveBind);
        });

        sliderRightHandle.addEventListener("touchend", function (e) {
            e.stopPropagation();
            self.mouseDown = 0;
            sliderRightHandle.removeEventListener("touchmove", rightSliderMoveBind);
            self.chartSVG.removeEventListener("touchmove", rightSliderMoveBind);
        });

    }

    leftSliderMove(e) {
        e.stopPropagation();
        e.preventDefault();
        let mousePointer = this.ui.cursorPoint(this.chartSVG, e.changedTouches ? e.changedTouches[0] : e);
        let sliderLsel = this.slideLSel.getBBox();
        let sliderRsel = this.slideRSel.getBBox();
        let sliderPosX = mousePointer.x < sliderRsel.x ? mousePointer.x : sliderRsel.x;
        let leftSliderMoveEvent = new Event("onLeftSliderMove", {
            srcElement: this.chartSVG,
            originEvent: e,
            sliderPosition: new Point(sliderPosX, mousePointer.y)
        });

        if (e.type === "touchmove") {
            if (mousePointer.x > sliderRsel.x) {
                let eventMouseEnter = new window.Event("mouseenter");
                this.resetSliderPos("left", sliderPosX);
                this.resetSliderPos("right", mousePointer.x);
                this.sliderRightHandle.dispatchEvent(eventMouseEnter);
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
        let mousePointer = this.ui.cursorPoint(this.chartSVG, e.changedTouches ? e.changedTouches[0] : e);
        let sliderLsel = this.slideLSel.getBBox();
        let sliderRsel = this.slideRSel.getBBox();
        let sliderPosX = mousePointer.x > sliderLsel.x + sliderLsel.width ? mousePointer.x : sliderLsel.x + sliderLsel.width;
        let rightSliderMoveEvent = new Event("onRightSliderMove", {
            srcElement: this.chartSVG,
            originEvent: e,
            sliderPosition: new Point(sliderPosX, mousePointer.y)
        });

        if (e.type === "touchmove") {
            if (sliderRsel.x < sliderLsel.x + sliderLsel.width) {
                let eventMouseEnter = new window.Event("mouseenter");
                this.resetSliderPos("right", sliderPosX);
                this.resetSliderPos("left", mousePointer.x);
                this.sliderLeftHandle.dispatchEvent(eventMouseEnter);
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
        let sldrSel = this[sliderSel];
        let sldrLine = this[sliderLine];
        let inrBarType = this[innerBarType];
        let lSelFrame = this[selFrame];
        if (sldrSel) {
            sldrSel.setAttribute("d", this.geom.describeEllipticalArc(scrollPosX, cy, 15, 15, 180, 360, swipeFlag).d);
        }
        if (sldrLine) {
            sldrLine.setAttribute("d", dr.join(" "));
        }
        if (inrBarType) {
            inrBarType.setAttribute("d", innerBar.join(" "));
        }
        if (lSelFrame) {
            let xPos = type === "right" ? scrollPosX : scrollPosX - Number(lSelFrame.getAttribute("width"));
            lSelFrame.setAttribute("x", xPos);
        }

        let leftHandle = this.sliderLeftHandle.getBBox();
        let rightHandle = this.sliderRightHandle.getBBox();

        this.sliderLeftOffset.setAttribute("width", (leftHandle.x + leftHandle.width - this.posX));
        this.sliderRightOffset.setAttribute("width", (this.posX + this.scrollBoxWidth - rightHandle.x));
        this.sliderRightOffset.setAttribute("x", rightHandle.x);


        /*Fire event on change of slider position */
        let horizontalScrollEvent = new Event("onHorizontalScroll", {
            srcElement: this.chartSVG,
            LeftHandlePosition: new Point(leftHandle.x + leftHandle.width, this.posY),
            RightHandlePosition: new Point(rightHandle.x + this.posY)
        });

        this.objChart.event.dispatchEvent(horizontalScrollEvent);
    }
}

module.exports = HorizontalScroller;