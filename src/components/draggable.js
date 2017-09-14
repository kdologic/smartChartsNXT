/*
 * draggable.js
 * @Version:1.0.0
 * @CreatedOn:31-Aug-2017
 * @Author:SmartChartsNXT
 * @Description: This class will make components draggable.
 * To drag a component just double click on it then the component will be showed as selected then we can drag it 
 * to fix that position jus double click again on the component. 
 */

"use strict";

let Geom = require("./../core/geom.core");
let transformer = require("./../core/transformer");

class Draggable {
    constructor() {
        this.geom = new Geom();
        this.handlerLength = 20;
    }

    doDraggable(targetElemObj) {
        this.targetElemObj = targetElemObj;
        this.targetElemId = targetElemObj.getAttribute("id") || Math.round(Math.random() * 1000);
        let bbox = this.targetElemObj.getBBox();

        let strSVG = "";
        strSVG += "<g id='drag_handler_container_" + this.targetElemId + "' class='dragger' style='cursor: move;'>";
        strSVG += "<rect id='drag_handler_outerbox_" + this.targetElemId + "' class='dragger' x='" + (bbox.x - 5) + "' y='" + (bbox.y - 5) + "' width='" + (bbox.width + 10) + "' height='" + (bbox.height+10) + "' stroke-dasharray='5, 5' fill='none' pointer-events='all' stroke='#009688' stroke-width='1' opacity='1'></rect>";
        strSVG += "</g>";
        this.targetElemObj.insertAdjacentHTML("beforeend", strSVG);
        this.objDragHandle = this.targetElemObj.querySelector("#drag_handler_container_" + this.targetElemId);
        this.bindDragEvents();
        this.hideHandler();
    }

    bindDragEvents() {
        let mouseDownPos;
        let mousePosNow;
        let presentTrnsMatrix;
        this.handleMouseDown = false;
        var timer = 0;
        var delay = 200;
        var prevent = false;

        this.targetElemObj.setAttribute("pointer-events",'all');
        this.targetElemObj.addEventListener("click", (e) => {
            timer = setTimeout(function () {
                if (!prevent) {
                    //do nothing; 
                }
                prevent = false;
            }, delay);
        });

        this.targetElemObj.addEventListener("dblclick", (e) => {
            clearTimeout(timer);
            prevent = true;
            this.showHandler();
        });

        this.objDragHandle.addEventListener("dblclick", (e) => {
            e.stopPropagation(); 
            this.hideHandler(); 
        });

        this.objDragHandle.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            this.handleMouseDown = true;
            mouseDownPos = {
                x: e.clientX,
                y: e.clientY
            };
            presentTrnsMatrix = transformer.getElementTransformation(this.targetElemObj);
        }, false);

        this.objDragHandle.addEventListener("mousemove", (e) => {
            e.stopPropagation();
            if (this.handleMouseDown) {
                mousePosNow = {
                    x: e.clientX,
                    y: e.clientY
                };
                let tranMatrix = transformer.getTransformMatrix(
                    [
                        `translate(${mousePosNow.x - mouseDownPos.x},
                        ${mousePosNow.y - mouseDownPos.y})`
                    ], presentTrnsMatrix);
                this.targetElemObj.setAttribute("transform", tranMatrix);
            }
        }, false);

        this.objDragHandle.addEventListener("mouseup", (e) => {
            e.stopPropagation();
            this.handleMouseDown = false;
        }, false);

        this.objDragHandle.addEventListener("mouseleave", (e) => {
            e.stopPropagation();
            this.handleMouseDown = false;
        }, false);
    }

    showHandler() {
        this.objDragHandle.style.display = "block";
    }

    hideHandler() {
        this.objDragHandle.style.display = "none";
    }
}

module.exports = Draggable;