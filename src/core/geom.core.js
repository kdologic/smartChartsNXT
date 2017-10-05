/*
 * sc.geom.core.js
 * @CreatedOn: 07-Apr-2016
 * @Author: SmartChartsNXT
 * @Version: 1.1.0
 * @description:SmartChartsNXT Core Library components. That contains geometric functionality.
 */



/*---------------Related mathematical shapes---------------------------*/

"use strict";

let Point = require("./point");

class GeomCore {
    constructor() {}

    describeRoundedRect(x, y, width, height, radius) {
        return [
            "M", (x + radius), y, "h", (width - (2 * radius)), "a", radius, radius, " 0 0 1 ", radius, radius, "v", (height - (2 * radius)), "a", radius, radius, " 0 0 1 ", -radius, radius, "h", ((2 * radius) - width), "a", radius, radius, " 0 0 1 ", -radius, -radius, "v", ((2 * radius) - height), "a", radius, radius, " 0 0 1 ", radius, -radius, "z"
        ];
    } /*End describeRoundedRect()*/

    describeBezireArc(point1, point2, point3) {
        let mid2 = this.getMidPoint(point2, point3);

        let c = [
            "C",
            point2.x,
            point2.y,
            point2.x,
            point2.y,
            mid2.x,
            mid2.y
        ];
        return c;
    } /*End describeBezireArc()*/

    createDot(center, color, radious, opacity, cls, targetElem, stroke, strokeWidth) {
        let svg;
        if (targetElem) {
            if (typeof targetElem === "object") {
                svg = targetElem;
            } else if (typeof targetElem === "string") {
                svg = document.getElementById(targetElem);
            }
        } else {
            svg = document.getElementsByTagName('svg')[0]; //Get svg element
        }
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'circle'); //Create a path in SVG's namespace
        newElement.setAttribute("cx", center.x); //Set center x 
        newElement.setAttribute("cy", center.y); //Set center y 
        newElement.setAttribute("r", radious || 3); //Set radious
        newElement.setAttribute("class", cls || "dot"); //Set class
        newElement.setAttribute("stroke", stroke || "none"); //Set border color
        newElement.setAttribute("fill", color); //Set fill colour
        newElement.setAttribute("opacity", opacity || 1);
        newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
        newElement.setAttribute("pointer-events", "none"); //set no pointer event for dot
        svg.appendChild(newElement);
    } /*End createDot()*/


    createRect(left, top, width, height, color, cls, opacity, stroke, strokeWidth) {
        let svg = document.getElementsByTagName('svg')[0]; //Get svg element
        let newElement = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
        newElement.setAttribute("x", left); //Set left position
        newElement.setAttribute("y", top); //Set top position
        newElement.setAttribute("width", width); //Set width
        newElement.setAttribute("height", height); //Set height
        newElement.setAttribute("stroke", stroke || "none"); //Set border color
        newElement.setAttribute("fill", color); //Set fill colour
        newElement.setAttribute("opacity", opacity || 1);
        newElement.setAttribute("stroke-width", strokeWidth || 1); //Set stroke width
        newElement.setAttribute("class", cls || "bbox"); //Set class
        svg.appendChild(newElement);
    } /*End createRect()*/



    getDistanceBetween(point1, point2) {
        let dist = Math.sqrt((point1.x - point2.x) * (point1.x - point2.x) + (point1.y - point2.y) * (point1.y - point2.y)) || 0;
        return dist;
    } /*End getDistanceBetween()*/

    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    } /*End polarToCartesian()*/

    getMidPoint(point1, point2) {
        return new Point((point1.x + point2.x) / 2, (point1.y + point2.y) / 2);
    } /*End getMidPoint()*/

    getEllipticalRadious(rx, ry, angleInDegrees) {
        let angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        let r = (rx * ry) / Math.sqrt(((rx * rx) * (Math.sin(angleInRadians) * Math.sin(angleInRadians))) + ((ry * ry) * (Math.cos(angleInRadians) * Math.cos(angleInRadians))));
        return r;
    } /*End getEllipticalRadious()*/

    describeEllipticalArc(cx, cy, rx, ry, startAngle, endAngle, sweepFlag) {
        let fullArc = false;
        if (startAngle % 360 === endAngle % 360) {
            endAngle--;
            fullArc = true;
        }

        let start = this.polarToCartesian(cx, cy, this.getEllipticalRadious(rx, ry, endAngle), endAngle);
        let end = this.polarToCartesian(cx, cy, this.getEllipticalRadious(rx, ry, startAngle), startAngle);
        let largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";

        let d = [
            "M", start.x, start.y,
            "A", rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y
        ];

        if (fullArc) {
            d.push("L", start.x, start.y);
        }
        d.push("L", cx, cy, "Z");
        let path = {
            d: d.join(" "),
            arc: [rx, ry, 0, largeArcFlag, sweepFlag, end.x, end.y].join(" "),
            start: start,
            end: end,
            center: new Point(cx, cy),
            rx: rx,
            ry: ry,
            startAngle: startAngle,
            endAngle: endAngle
        };
        return path;
    } /*End describeEllipticalArc()*/

    checkLineIntersection(line1StartX, line1StartY, line1EndX, line1EndY, line2StartX, line2StartY, line2EndX, line2EndY) {
        /* if the lines intersect, the result contains the x and y of the intersection (treating the lines as infinite) and booleans for whether line segment 1 or line segment 2 contain the point*/
        let denominator, a, b, numerator1, numerator2, result = {
            x: null,
            y: null,
            onLine1: false,
            onLine2: false
        };
        denominator = ((line2EndY - line2StartY) * (line1EndX - line1StartX)) - ((line2EndX - line2StartX) * (line1EndY - line1StartY));
        if (denominator === 0) {
            return result;
        }
        a = line1StartY - line2StartY;
        b = line1StartX - line2StartX;
        numerator1 = ((line2EndX - line2StartX) * a) - ((line2EndY - line2StartY) * b);
        numerator2 = ((line1EndX - line1StartX) * a) - ((line1EndY - line1StartY) * b);
        a = numerator1 / denominator;
        b = numerator2 / denominator;

        /* if we cast these lines infinitely in both directions, they intersect here:*/
        result.x = line1StartX + (a * (line1EndX - line1StartX));
        result.y = line1StartY + (a * (line1EndY - line1StartY));
        /*
        /* it is worth noting that this should be the same as:
        x = line2StartX + (b * (line2EndX - line2StartX));
        y = line2StartX + (b * (line2EndY - line2StartY));
        */
        /* if line1 is a segment and line2 is infinite, they intersect if:*/
        if (a > 0 && a < 1) {
            result.onLine1 = true;
        }
        /* if line2 is a segment and line1 is infinite, they intersect if:*/
        if (b > 0 && b < 1) {
            result.onLine2 = true;
        }
        /* if line1 and line2 are segments, they intersect if both of the above are true*/
        return result;
    } /*End checkLineIntersection()*/
}

module.exports = GeomCore;