/*
 * draggable.js
 * @Version:1.0.0
 * @CreatedOn:31-Aug-2017
 * @Author:SmartChartsNXT
 * @Description: This class will make components draggable.
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
        strSVG += "<rect id='drag_handler_outerbox_" + this.targetElemId + "' class='dragger' x='" + (bbox.x - (2 * this.handlerLength) - (this.handlerLength / 2)) + "' y='" + (bbox.y - (2 * this.handlerLength) - (this.handlerLength / 2)) + "' width='" + bbox.width + "' height='" + bbox.height + "' fill='none' pointer-events='all' stroke='black' stroke-width='1' opacity='0'></rect>";
        strSVG += "<path id='arrowUp' class='dragger' d='"+["M", bbox.x-(this.handlerLength/2), bbox.y - this.handlerLength,"l", -3, 3,"m", 3, -3,"l", 3, 3,"m", -3, -3,"l", 0, 8].join(" ")+"' fill='none'  stroke-width='2' stroke='#717171' />";
        strSVG += "<path id='arrowUp' class='dragger' d='"+["M", bbox.x-(this.handlerLength/2), bbox.y,"l", -3, -3,"m", 3, 3,"l", 3, -3,"m", -3, 3,"l", 0, -8].join(" ")+"' fill='none'  stroke-width='2' stroke='#717171' />";
        strSVG += "<path id='arrowUp' class='dragger' d='"+["M", bbox.x-this.handlerLength, bbox.y-(this.handlerLength/2),"l", 3, -3,"m", -3, 3, "l", 3, 3,"m", -3, -3,"l", 8, 0].join(" ")+"' fill='none'  stroke-width='2' stroke='#717171' />";
        strSVG += "<path id='arrowUp' class='dragger' d='"+["M", bbox.x, bbox.y-(this.handlerLength/2),"l", -3, -3,"m", 3, 3, "l", -3, 3,"m", 3, -3,"l", -8, 0].join(" ")+"' fill='none'  stroke-width='2' stroke='#717171' />";
        strSVG += "</g>";
        targetElemObj.insertAdjacentHTML("afterbegin", strSVG);
        this.objDragHandle = targetElemObj.querySelector("#drag_handler_container_" + this.targetElemId);
        this.bindDragEvents(); 
        this.hideHandler(); 
        
    }

    bindDragEvents(){
        let mouseDownPos;
        let mousePosNow;
        this.handleMouseDown = false;
        this.objDragHandle.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            this.handleMouseDown = true;
            mouseDownPos = mouseDownPos || {
                x: e.clientX,
                y: e.clientY
            };
        }, false);

        this.objDragHandle.addEventListener("mousemove", (e) => {
            e.stopPropagation();
            if (this.handleMouseDown) {
                mousePosNow = {
                    x: e.clientX,
                    y: e.clientY
                };
                let tranMatrix = transformer.getTransformMatrix([`translate(${mousePosNow.x - mouseDownPos.x},${mousePosNow.y - mouseDownPos.y})`]);
                this.targetElemObj.setAttribute("transform", tranMatrix);
            }
        }, false);

        this.objDragHandle.addEventListener("mouseup", (e) => {
            e.stopPropagation();
            this.handleMouseDown = false;
        }, false);

        let outerBox = this.objDragHandle.querySelector("#drag_handler_outerbox_" + this.targetElemId);
        outerBox.addEventListener("mouseup", (e) => {
            e.stopPropagation();
            this.handleMouseDown = false;
        }, false);

        this.targetElemObj.addEventListener("mouseenter", (e) => {
            e.stopPropagation();
            this.showHandler(); 
        }, false);

        this.targetElemObj.addEventListener("mouseleave", (e) => {
            e.stopPropagation();
            this.hideHandler(); 
        }, false);
    }

    showHandler() {
        this.objDragHandle.style.display = "block"; 
    }

    hideHandler(){
        this.objDragHandle.style.display = "none"; 
    }
}

module.exports = Draggable;